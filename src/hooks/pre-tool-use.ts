import { vaultGet } from "../vault";

const input = await Bun.stdin.text();
let parsed: { tool_name?: string; tool_input?: { command?: string } };
try {
  parsed = JSON.parse(input);
} catch {
  process.exit(0);
}

if (parsed.tool_name !== "Bash") {
  process.exit(0);
}

const command = parsed.tool_input?.command ?? "";
const placeholders = [...command.matchAll(/<<VAULT:([^>]+)>>/g)];

if (placeholders.length === 0) {
  process.exit(0);
}

let updatedCommand = command;
const missing: string[] = [];

for (const match of placeholders) {
  const name = match[1];
  const value = await vaultGet(name);
  if (value) {
    updatedCommand = updatedCommand.replaceAll(`<<VAULT:${name}>>`, value);
  } else if (!missing.includes(name)) {
    missing.push(name);
  }
}

if (missing.length > 0) {
  // Block rather than let the literal <<VAULT:name>> placeholder hit the
  // shell — that would at best run a broken command, at worst leak the
  // placeholder syntax to external systems.
  const output = {
    decision: "block",
    reason: `claude-vault: unknown secret(s) ${missing.map((n) => `"${n}"`).join(", ")}. Add with: claude-vault add <name>. Run \`claude-vault list\` to see stored secrets.`,
  };
  console.log(JSON.stringify(output));
  process.exit(0);
}

const output = {
  decision: "approve",
  updatedInput: { command: updatedCommand },
};
console.log(JSON.stringify(output));
