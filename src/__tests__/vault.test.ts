import { describe, test, expect } from "bun:test";
import { randomBytes } from "crypto";
import { encrypt, decrypt } from "../crypto";

describe("vault format versioning", () => {
  const key = randomBytes(32);

  test("envelope round-trip with version field", () => {
    const envelope = { _version: 1, secrets: { "api-key": "sk-123", "db-pass": "hunter2" } };
    const packed = encrypt(JSON.stringify(envelope), key);
    const result = JSON.parse(decrypt(packed, key));
    expect(result._version).toBe(1);
    expect(result.secrets["api-key"]).toBe("sk-123");
    expect(result.secrets["db-pass"]).toBe("hunter2");
  });

  test("backward compat: old format (no envelope) round-trips", () => {
    const oldFormat = { "api-key": "sk-123" };
    const packed = encrypt(JSON.stringify(oldFormat), key);
    const result = JSON.parse(decrypt(packed, key));
    expect(result["api-key"]).toBe("sk-123");
    expect("_version" in result).toBe(false);
  });

  test("load logic: detects envelope vs bare format", () => {
    function parseVaultJson(json: string): Record<string, string> {
      const parsed = JSON.parse(json);
      if (parsed && typeof parsed === "object" && "_version" in parsed) {
        return parsed.secrets;
      }
      return parsed;
    }

    const envelope = JSON.stringify({ _version: 1, secrets: { a: "1" } });
    expect(parseVaultJson(envelope)).toEqual({ a: "1" });

    const bare = JSON.stringify({ a: "1" });
    expect(parseVaultJson(bare)).toEqual({ a: "1" });
  });

  test("envelope with empty secrets", () => {
    const data = { _version: 1, secrets: {} };
    const packed = encrypt(JSON.stringify(data), key);
    const result = JSON.parse(decrypt(packed, key));
    expect(Object.keys(result.secrets)).toHaveLength(0);
  });
});

describe("readBodyWithLimit logic", () => {
  const MAX_BODY_BYTES = 100 * 1024 * 1024;

  function checkBodySize(contentLength: string | null, bodyLength: number): string | null {
    if (contentLength) {
      const cl = parseInt(contentLength);
      if (cl > MAX_BODY_BYTES) return `content-length ${cl} exceeds limit`;
    }
    if (bodyLength > MAX_BODY_BYTES) return `body ${bodyLength} exceeds limit`;
    return null;
  }

  test("accepts normal body", () => {
    expect(checkBodySize("1024", 1024)).toBeNull();
  });

  test("rejects oversized content-length header", () => {
    expect(checkBodySize(String(200 * 1024 * 1024), 0)).toContain("exceeds limit");
  });

  test("rejects oversized actual body", () => {
    expect(checkBodySize("0", 200 * 1024 * 1024)).toContain("exceeds limit");
  });

  test("accepts exactly at limit", () => {
    expect(checkBodySize(String(MAX_BODY_BYTES), MAX_BODY_BYTES)).toBeNull();
  });

  test("handles missing content-length", () => {
    expect(checkBodySize(null, 512)).toBeNull();
  });
});

describe("header passthrough", () => {
  const PASSTHROUGH_HEADERS = [
    "anthropic-version",
    "anthropic-beta",
    "authorization",
    "content-type",
    "x-api-key",
    "x-claude-code-session-id",
    "user-agent",
  ];

  function buildForwardHeaders(incoming: Headers): Headers {
    const outgoing = new Headers();
    for (const key of PASSTHROUGH_HEADERS) {
      const val = incoming.get(key);
      if (val) outgoing.set(key, val);
    }
    return outgoing;
  }

  test("forwards allowed headers", () => {
    const incoming = new Headers({
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "x-api-key": "sk-test",
      "user-agent": "claude-code/1.0",
    });
    const out = buildForwardHeaders(incoming);
    expect(out.get("anthropic-version")).toBe("2023-06-01");
    expect(out.get("x-api-key")).toBe("sk-test");
    expect(out.get("user-agent")).toBe("claude-code/1.0");
  });

  test("strips non-allowed headers", () => {
    const incoming = new Headers({
      "anthropic-version": "2023-06-01",
      "x-custom-header": "should-be-stripped",
      cookie: "session=abc",
    });
    const out = buildForwardHeaders(incoming);
    expect(out.get("x-custom-header")).toBeNull();
    expect(out.get("cookie")).toBeNull();
  });

  test("handles missing headers gracefully", () => {
    const out = buildForwardHeaders(new Headers());
    expect([...out.entries()]).toHaveLength(0);
  });
});

describe("response header cleaning", () => {
  function cleanResponseHeaders(src: Headers): Headers {
    const out = new Headers(src);
    out.delete("content-encoding");
    out.delete("content-length");
    out.delete("transfer-encoding");
    return out;
  }

  test("strips encoding and length headers", () => {
    const src = new Headers({
      "content-encoding": "gzip",
      "content-length": "1234",
      "transfer-encoding": "chunked",
      "content-type": "application/json",
    });
    const out = cleanResponseHeaders(src);
    expect(out.get("content-encoding")).toBeNull();
    expect(out.get("content-length")).toBeNull();
    expect(out.get("transfer-encoding")).toBeNull();
    expect(out.get("content-type")).toBe("application/json");
  });
});
