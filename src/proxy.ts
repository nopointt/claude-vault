import { vaultAll } from "./vault";

process.on("uncaughtException", (err) => {
  console.error(`[context-vault] uncaught exception (kept alive):`, err);
});
process.on("unhandledRejection", (err) => {
  console.error(`[context-vault] unhandled rejection (kept alive):`, err);
});

const ANTHROPIC_API = "https://api.anthropic.com";
const PORT = parseInt(process.env.CONTEXT_VAULT_PORT ?? "9277");

const PASSTHROUGH_HEADERS = [
  "anthropic-version",
  "anthropic-beta",
  "authorization",
  "content-type",
  "x-api-key",
  "x-claude-code-session-id",
];

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
  let secrets: VaultEntry[];
  let bodyText: string;
  try {
    secrets = await loadSecrets();
    bodyText = await req.text();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[context-vault] request setup failed: ${msg}`);
    return new Response(JSON.stringify({ error: "Proxy failed to read request", detail: msg }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
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
    console.log(`[context-vault] redacted ${secrets.length} secret pattern(s) from request`);
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
    console.error(`[context-vault] upstream error:`, err);
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
      try {
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
      } catch (err) {
        // Upstream stream aborted mid-response (network blip, anthropic
        // closed keep-alive, timeout). Previously the exception propagated
        // out of pull() and Bun.serve closed the socket abruptly — the
        // client saw "socket closed unexpectedly" or "JSON Parse error:
        // Unterminated string" depending on where the last chunk cut off.
        //
        // Instead: flush any buffered SSE content, emit a synthetic SSE
        // error event so the client sees a clean protocol-level failure,
        // then close the controller without throwing.
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[context-vault] upstream stream error — graceful close: ${msg}`);
        try {
          if (sseBuffer.length > 0) {
            controller.enqueue(encoder.encode(redactString(sseBuffer, secrets)));
            sseBuffer = "";
          }
          const errorEvent = `event: error\ndata: ${JSON.stringify({ type: "error", error: { type: "proxy_upstream_error", message: msg } })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
        } catch {
          // ignore — controller may already be in a terminal state
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: upstreamRes.status,
    headers: cleanResponseHeaders(upstreamRes.headers),
  });
}

async function handleCountTokens(req: Request): Promise<Response> {
  let secrets: VaultEntry[];
  let bodyText: string;
  try {
    secrets = await loadSecrets();
    bodyText = await req.text();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[context-vault] count_tokens setup failed: ${msg}`);
    return new Response(JSON.stringify({ error: "Proxy failed to read request", detail: msg }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
  const redactedBody = redactString(bodyText, secrets);

  if (bodyText.length !== redactedBody.length) {
    console.log(`[context-vault] redacted secret(s) from count_tokens request`);
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
    console.error(`[context-vault] count_tokens upstream error:`, err);
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
    console.log(`[context-vault] POST /v1/messages`);
    return handleMessages(req);
  }

  if (url.pathname === "/v1/messages/count_tokens" && req.method === "POST") {
    console.log(`[context-vault] POST /v1/messages/count_tokens`);
    return handleCountTokens(req);
  }

  return new Response("Not found", { status: 404 });
}

console.log(`[context-vault] proxy listening on http://127.0.0.1:${PORT}`);
console.log(`[context-vault] forwarding to ${ANTHROPIC_API}`);

const secrets = await loadSecrets();
console.log(`[context-vault] loaded ${secrets.length} secret(s): ${secrets.map((s) => s.name).join(", ")}`);

const server = Bun.serve({
  port: PORT,
  hostname: "127.0.0.1",
  idleTimeout: 255,
  fetch: handleRequest,
  error(err) {
    console.error(`[context-vault] server error:`, err);
    return new Response(JSON.stringify({ error: "Proxy internal error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  },
});

process.on("SIGTERM", () => {
  console.log("[context-vault] SIGTERM received, shutting down");
  server.stop();
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("[context-vault] SIGINT received, shutting down");
  server.stop();
  process.exit(0);
});
