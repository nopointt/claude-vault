const PROXY = "http://localhost:9277";

const testBody = {
  model: "claude-sonnet-4-6",
  max_tokens: 100,
  stream: false,
  messages: [
    {
      role: "user",
      content: "My API key is SUPERSECRET12345 and I need help with it",
    },
  ],
};

console.log("=== Test: Request Redaction ===");
console.log("Original message:", testBody.messages[0].content);
console.log("");

try {
  const res = await fetch(`${PROXY}/v1/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": "test-not-real-key",
    },
    body: JSON.stringify(testBody),
  });

  const status = res.status;
  const body = await res.text();

  console.log("Response status:", status);

  if (status === 401) {
    console.log("Got 401 (expected — fake API key)");
    console.log("Response body preview:", body.slice(0, 200));
    console.log("");
    console.log("=== KEY CHECK ===");
    console.log(
      "If proxy redacts correctly, the request that reached Anthropic",
    );
    console.log(
      'should contain "<<VAULT:test-key>>" instead of "SUPERSECRET12345"',
    );
    console.log("Check proxy console output for confirmation.");
  } else {
    console.log("Unexpected status. Body:", body.slice(0, 500));
  }
} catch (e) {
  console.error("Connection failed — is the proxy running?", e);
}
