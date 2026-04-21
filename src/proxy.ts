import { vaultAll } from "./vault";

const ANTHROPIC_API = "https://api.anthropic.com";
const PORT = parseInt(process.env.CLAUDE_VAULT_PORT ?? "9277");

const PASSTHROUGH_HEADERS = [
  "anthropic-version",
  "anthropic-beta",
  "authorization",
  "content-type",
  "x-api-key",
  "x-claude-code-session-id",
];

const ALLOWED_PATHS = new Set([
  "/v1/messages",
  "/v1/messages/count_tokens",
]);

type VaultEntry = { name: string; value: string; placeholder: string };

let cachedSecrets: VaultEntry[] = [];
let cacheTime = 0;
const CACHE_TTL_MS = 5000;

async function loadSecrets(): Promise<VaultEntry[]> {
  const now = Date.now();
  if (now - cacheTime < CACHE_TTL_MS && cachedSecrets.length > 0) {
    return cachedSecrets;
  }
  const data = await vaultAll();
  cachedSecrets = Object.entries(data)
    .filter(([_, v]) => v.length > 0)
    .map(([name, value]) => ({
      name,
      value,
      placeholder: `<<VAULT:${name}>>`,
    }));
  cacheTime = now;
  return cachedSecrets;
}

function redactString(text: string, secrets: VaultEntry[]): string {
  let result = text;
  for (const secret of secrets) {
    if (result.includes(secret.value)) {
      result = result.replaceAll(secret.value, secret.placeholder);
    }
  }
  return result;
}

function buildForwardHeaders(incoming: Headers): Headers {
  const outgoing = new Headers();
  for (const key of PASSTHROUGH_HEADERS) {
    const val = incoming.get(key);
    if (val) outgoing.set(key, val);
  }
  return outgoing;
}

// Bun's fetch() auto-decompresses upstream responses, so the body we forward
// is already plain bytes. We must strip content-encoding / content-length /
// transfer-encoding from the upstream headers or the client will try to
// gunzip plain text and crash with ZlibError.
function cleanResponseHeaders(src: Headers): Headers {
  const out = new Headers(src);
  out.delete("content-encoding");
  out.delete("content-length");
  out.delete("transfer-encoding");
  return out;
}

async function handleMessages(req: Request): Promise<Response> {
  const secrets = await loadSecrets();
  const bodyText = await req.text();
  const redactedBody = redactString(bodyText, secrets);

  let isStreaming = false;
  try {
    const parsed = JSON.parse(redactedBody);
    isStreaming = parsed.stream === true;
  } catch {
    isStreaming = false;
  }

  const redactedCount = (bodyText.length - redactedBody.length);
  if (redactedCount > 0) {
    console.log(`[vault-proxy] redacted ${secrets.length} secret pattern(s) from request`);
  }

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(`${ANTHROPIC_API}/v1/messages`, {
      method: "POST",
      headers: buildForwardHeaders(req.headers),
      body: redactedBody,
      signal: AbortSignal.timeout(300_000),
    });
  } catch (err) {
    console.error(`[vault-proxy] upstream error:`, err);
    return new Response(JSON.stringify({ error: "Proxy failed to reach Anthropic API" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }

  if (!isStreaming || !upstreamRes.body) {
    const responseText = await upstreamRes.text();
    const redactedResponse = redactString(responseText, secrets);
    return new Response(redactedResponse, {
      status: upstreamRes.status,
      headers: cleanResponseHeaders(upstreamRes.headers),
    });
  }

  const reader = upstreamRes.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const maxSecretLen = Math.max(...secrets.map((s) => s.value.length), 0);

  let sseBuffer = "";

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();

      if (done) {
        if (sseBuffer.length > 0) {
          controller.enqueue(encoder.encode(redactString(sseBuffer, secrets)));
          sseBuffer = "";
        }
        controller.close();
        return;
      }

      // No secrets to redact — pass raw chunks through immediately so the
      // SSE stream is not stalled waiting for the buffer to fill.
      if (maxSecretLen === 0) {
        controller.enqueue(value);
        return;
      }

      sseBuffer += decoder.decode(value, { stream: true });

      if (sseBuffer.length > maxSecretLen) {
        // Redact the ENTIRE buffer, not just the leading safe portion.
        // The previous implementation ran redactString only on the
        // part it was about to emit, so any secret straddling the emit
        // boundary (start in `safe`, end in the kept tail) was never
        // matched and its prefix leaked to the client.
        //
        // We keep `maxSecretLen` bytes of tail as carryover so that any
        // secret of length ≤ maxSecretLen which is split across two
        // network chunks is fully reassembled here before we emit.
        const redacted = redactString(sseBuffer, secrets);
        const safeLen = redacted.length - maxSecretLen;
        const safe = redacted.slice(0, safeLen);
        sseBuffer = redacted.slice(safeLen);
        controller.enqueue(encoder.encode(safe));
      }
    },
  });

  return new Response(stream, {
    status: upstreamRes.status,
    headers: cleanResponseHeaders(upstreamRes.headers),
  });
}

async function handleCountTokens(req: Request): Promise<Response> {
  const secrets = await loadSecrets();
  const bodyText = await req.text();
  const redactedBody = redactString(bodyText, secrets);

  if (bodyText.length !== redactedBody.length) {
    console.log(`[vault-proxy] redacted secret(s) from count_tokens request`);
  }

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(`${ANTHROPIC_API}/v1/messages/count_tokens`, {
      method: "POST",
      headers: buildForwardHeaders(req.headers),
      body: redactedBody,
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    console.error(`[vault-proxy] count_tokens upstream error:`, err);
    return new Response(JSON.stringify({ error: "Proxy failed to reach Anthropic API" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }

  const responseText = await upstreamRes.text();
  const redactedResponse = redactString(responseText, secrets);
  return new Response(redactedResponse, {
    status: upstreamRes.status,
    headers: cleanResponseHeaders(upstreamRes.headers),
  });
}

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/v1/messages" && req.method === "POST") {
    console.log(`[vault-proxy] POST /v1/messages`);
    return handleMessages(req);
  }

  if (url.pathname === "/v1/messages/count_tokens" && req.method === "POST") {
    console.log(`[vault-proxy] POST /v1/messages/count_tokens`);
    return handleCountTokens(req);
  }

  return new Response("Not found", { status: 404 });
}

console.log(`[claude-vault] proxy listening on http://127.0.0.1:${PORT}`);
console.log(`[claude-vault] forwarding to ${ANTHROPIC_API}`);

const secrets = await loadSecrets();
console.log(`[claude-vault] loaded ${secrets.length} secret(s): ${secrets.map((s) => s.name).join(", ")}`);

Bun.serve({
  port: PORT,
  hostname: "127.0.0.1",
  fetch: handleRequest,
});
