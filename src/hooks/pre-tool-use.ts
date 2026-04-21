import { vaultGet } from "../vault";

// Tools where vault placeholders should be substituted before execution.
// Tools that only INSPECT content (Read, Grep, Glob) are intentionally
// excluded so that searches for the literal placeholder text are not
// mangled. The field list is explicit per-tool so we never scan unknown
// nested fields for placeholders that should pass through unchanged.
const FIELD_MAP: Record<string, readonly string[]> = {
  Bash: ["command"],
  Write: ["content"],
  Edit: ["old_string", "new_string"],
  WebFetch: ["url", "prompt"],
  NotebookEdit: ["new_source"],
};

const PLACEHOLDER_RE = /<<VAULT:([^>]+)>>/g;

const input = await Bun.stdin.text();
let parsed: { tool_name?: string; tool_input?: Record<string, unknown> };
try {
  parsed = JSON.parse(input);
} catch {
  process.exit(0);
}

const toolName = parsed.tool_name ?? "";
const fields = FIELD_MAP[toolName];
if (!fields) {
  process.exit(0);
}

const toolInput = parsed.tool_input ?? {};
const missing: string[] = [];
const updatedInput: Record<string, unknown> = { ...toolInput };
let substituted = false;

for (const field of fields) {
  const raw = toolInput[field];
  if (typeof raw !== "string") continue;

  const matches = [...raw.matchAll(PLACEHOLDER_RE)];
  if (matches.length === 0) continue;

  let resolved = raw;
  for (const m of matches) {
    const name = m[1];
    const value = await vaultGet(name);
    if (value) {
      resolved = resolved.replaceAll(`<<VAULT:${name}>>`, value);
    } else if (!missing.includes(name)) {
      missing.push(name);
    }
  }

  if (resolved !== raw) {
    updatedInput[field] = resolved;
    substituted = true;
  }
}

if (missing.length > 0) {
  // Block rather than let the literal placeholder reach the tool — that
  // would at best run a broken action, at worst leak the placeholder
  // syntax to external systems (files on disk, HTTP requests, etc).
  const output = {
    decision: "block",
    reason: `context-vault: unknown secret(s) ${missing.map((n) => `"${n}"`).join(", ")}. Add with: context-vault add <name>. Run \`context-vault list\` to see stored secrets.`,
  };
  console.log(JSON.stringify(output));
  process.exit(0);
}

if (!substituted) {
  process.exit(0);
}

const output = {
  decision: "approve",
  updatedInput,
};
console.log(JSON.stringify(output));
