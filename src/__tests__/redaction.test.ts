import { describe, test, expect } from "bun:test";

type VaultEntry = { name: string; value: string; placeholder: string };

function redactString(text: string, secrets: VaultEntry[]): string {
  let result = text;
  for (const secret of secrets) {
    if (result.includes(secret.value)) {
      result = result.replaceAll(secret.value, secret.placeholder);
    }
  }
  return result;
}

function makeSecret(name: string, value: string): VaultEntry {
  return { name, value, placeholder: `<<VAULT:${name}>>` };
}

describe("redactString", () => {
  const secrets = [
    makeSecret("api-key", "sk-ant-abc123def456"),
    makeSecret("db-pass", "p@ssw0rd!"),
  ];

  test("replaces secret in plain text", () => {
    const result = redactString("my key is sk-ant-abc123def456", secrets);
    expect(result).toBe("my key is <<VAULT:api-key>>");
  });

  test("replaces multiple occurrences", () => {
    const result = redactString("a=sk-ant-abc123def456 b=sk-ant-abc123def456", secrets);
    expect(result).not.toContain("sk-ant-abc123def456");
    expect(result).toBe("a=<<VAULT:api-key>> b=<<VAULT:api-key>>");
  });

  test("replaces multiple different secrets", () => {
    const result = redactString("key=sk-ant-abc123def456 pass=p@ssw0rd!", secrets);
    expect(result).toBe("key=<<VAULT:api-key>> pass=<<VAULT:db-pass>>");
  });

  test("does not modify text without secrets", () => {
    const input = "This is a normal message with no secrets";
    expect(redactString(input, secrets)).toBe(input);
  });

  test("handles empty text", () => {
    expect(redactString("", secrets)).toBe("");
  });

  test("handles empty secrets array", () => {
    const input = "some text";
    expect(redactString(input, [])).toBe(input);
  });

  test("works inside JSON", () => {
    const body = JSON.stringify({
      model: "claude-sonnet-4-6",
      messages: [{ role: "user", content: "key=sk-ant-abc123def456" }],
    });
    const result = redactString(body, secrets);
    const parsed = JSON.parse(result);
    expect(parsed.messages[0].content).toBe("key=<<VAULT:api-key>>");
  });

  test("handles secret with special regex chars", () => {
    const special = [makeSecret("regex", "price=$100.00")];
    const result = redactString("it costs price=$100.00 today", special);
    expect(result).toBe("it costs <<VAULT:regex>> today");
  });

  test("handles secret at start of text", () => {
    const result = redactString("sk-ant-abc123def456 is my key", secrets);
    expect(result).toBe("<<VAULT:api-key>> is my key");
  });

  test("handles secret at end of text", () => {
    const result = redactString("my key is sk-ant-abc123def456", secrets);
    expect(result).toBe("my key is <<VAULT:api-key>>");
  });

  test("does not false-positive on partial matches", () => {
    const result = redactString("sk-ant-abc123", secrets);
    expect(result).toBe("sk-ant-abc123");
  });
});

describe("SSE sliding window redaction", () => {
  const secrets = [makeSecret("key", "SUPERSECRET12345")];
  const maxSecretLen = Math.max(...secrets.map((s) => s.value.length));

  function simulateStreaming(chunks: string[]): string {
    let sseBuffer = "";
    let output = "";

    for (const chunk of chunks) {
      sseBuffer += chunk;

      if (sseBuffer.length > maxSecretLen) {
        const redacted = redactString(sseBuffer, secrets);
        const safeLen = redacted.length - maxSecretLen;
        const safe = redacted.slice(0, safeLen);
        sseBuffer = redacted.slice(safeLen);
        output += safe;
      }
    }

    if (sseBuffer.length > 0) {
      output += redactString(sseBuffer, secrets);
    }

    return output;
  }

  test("redacts secret split across two chunks", () => {
    const result = simulateStreaming(["key is SUPERS", "ECRET12345 done"]);
    expect(result).not.toContain("SUPERSECRET12345");
    expect(result).toContain("<<VAULT:key>>");
  });

  test("redacts secret in a single chunk", () => {
    const result = simulateStreaming(["the key is SUPERSECRET12345 here"]);
    expect(result).not.toContain("SUPERSECRET12345");
    expect(result).toContain("<<VAULT:key>>");
  });

  test("passes through clean chunks unchanged", () => {
    const result = simulateStreaming(["hello ", "world ", "no secrets here"]);
    expect(result).toContain("hello");
    expect(result).toContain("world");
    expect(result).toContain("no secrets here");
  });

  test("handles secret split across three chunks", () => {
    const result = simulateStreaming(["SUPER", "SECRET", "12345"]);
    expect(result).not.toContain("SUPERSECRET12345");
    expect(result).toContain("<<VAULT:key>>");
  });
});
