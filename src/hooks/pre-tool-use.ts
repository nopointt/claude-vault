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
const placeholders = command.matchAll(/<<VAULT:([^>]+)>>/g);

let updatedCommand = command;
let substituted = false;

for (const match of placeholders) {
  const name = match[1];
  const value = await vaultGet(name);
  if (value) {
    updatedCommand = updatedCommand.replaceAll(`<<VAULT:${name}>>`, value);
    substituted = true;
  }
}

if (substituted) {
  const output = {
    decision: "approve",
    updatedInput: { command: updatedCommand },
  };
  console.log(JSON.stringify(output));
} else {
  process.exit(0);
}
