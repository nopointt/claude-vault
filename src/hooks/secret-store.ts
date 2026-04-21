import { vaultSet, readBuffer, wipeBuffer, vaultList } from "../vault";

const input = await Bun.stdin.text();
let parsed: { prompt?: string };
try {
  parsed = JSON.parse(input);
} catch {
  process.exit(0);
}

const prompt = parsed.prompt ?? "";

const secretMatch = prompt.match(/^\/secret\s+(?:store\s+)?(\S+)/i);
if (!secretMatch) {
  process.exit(0);
}

const name = secretMatch[1];
const value = await readBuffer();

if (!value) {
  const output = {
    decision: "block",
    reason: `No value found in buffer.txt. Paste your secret into ~/.contexter-vault/buffer.txt first, then re-run /secret ${name}`,
  };
  console.log(JSON.stringify(output));
  process.exit(0);
}

await vaultSet(name, value);
await wipeBuffer();

const keys = await vaultList();
const output = {
  decision: "block",
  reason: `Secret "${name}" stored in vault (encrypted). Buffer wiped. Vault now has ${keys.length} key(s): ${keys.join(", ")}. Use <<VAULT:${name}>> as placeholder.`,
};
console.log(JSON.stringify(output));
