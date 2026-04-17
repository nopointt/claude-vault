import { vaultAll } from "./vault";

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

async function runTests() {
  const data = await vaultAll();
  const secrets: VaultEntry[] = Object.entries(data).map(([name, value]) => ({
    name,
    value,
    placeholder: `<<VAULT:${name}>>`,
  }));

  console.log("Loaded secrets:", secrets.map((s) => s.name));
  console.log("");

  // Test 1: Direct redaction in message content
  const msg1 = "My API key is SUPERSECRET12345 please help";
  const redacted1 = redactString(msg1, secrets);
  console.log("Test 1: Message content redaction");
  console.log("  Input: ", msg1);
  console.log("  Output:", redacted1);
  console.log("  Pass:  ", !redacted1.includes("SUPERSECRET12345") && redacted1.includes("<<VAULT:test-key>>"));
  console.log("");

  // Test 2: JSON body redaction (simulates messages[] array)
  const body = JSON.stringify({
    model: "claude-sonnet-4-6",
    messages: [{ role: "user", content: "key=SUPERSECRET12345" }],
  });
  const redactedBody = redactString(body, secrets);
  const parsed = JSON.parse(redactedBody);
  console.log("Test 2: Full JSON body redaction");
  console.log("  Input msg: ", "key=SUPERSECRET12345");
  console.log("  Output msg:", parsed.messages[0].content);
  console.log("  Pass:      ", parsed.messages[0].content === "key=<<VAULT:test-key>>");
  console.log("");

  // Test 3: Multiple occurrences
  const msg3 = "First: SUPERSECRET12345, second: SUPERSECRET12345";
  const redacted3 = redactString(msg3, secrets);
  console.log("Test 3: Multiple occurrences");
  console.log("  Output:", redacted3);
  console.log("  Pass:  ", !redacted3.includes("SUPERSECRET12345"));
  console.log("");

  // Test 4: SSE chunk simulation (secret split across chunks)
  const chunk1 = 'data: {"type":"content_block_delta","delta":{"text":"key is SUPERS'
  const chunk2 = 'ECRET12345 done"}}\n\n';
  const combined = redactString(chunk1 + chunk2, secrets);
  console.log("Test 4: Combined SSE chunks (simulated sliding window)");
  console.log("  Chunk1:", chunk1.slice(-20));
  console.log("  Chunk2:", chunk2.slice(0, 20));
  console.log("  Combined redacted:", combined.includes("<<VAULT:test-key>>"));
  console.log("  No leak:", !combined.includes("SUPERSECRET12345"));
  console.log("");

  // Test 5: No false positives
  const msg5 = "This is a normal message with no secrets";
  const redacted5 = redactString(msg5, secrets);
  console.log("Test 5: No false positives");
  console.log("  Pass:", msg5 === redacted5);
}

await runTests();
