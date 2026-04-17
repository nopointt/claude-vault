#!/usr/bin/env bun
import { initVault, vaultSet, vaultGet, vaultList, vaultDelete, readBuffer, wipeBuffer, VAULT_DIR } from "../src/vault";
import { join } from "path";

const [command, ...args] = process.argv.slice(2);

const COMMANDS: Record<string, () => Promise<void>> = {
  async init() {
    await initVault();

    const settingsPath = join(process.env.HOME || process.env.USERPROFILE || "", ".claude", "settings.json");
    const settingsFile = Bun.file(settingsPath);
    let settings: Record<string, unknown> = {};
    if (await settingsFile.exists()) {
      settings = await settingsFile.json() as Record<string, unknown>;
    }

    const hooks = (settings.hooks ?? {}) as Record<string, unknown[]>;
    const envVars = (settings.env ?? {}) as Record<string, string>;

    envVars["ANTHROPIC_BASE_URL"] = "http://127.0.0.1:9277";

    const hooksDir = join(import.meta.dir, "..", "src", "hooks");
    const bunPath = process.execPath;

    const secretStoreHook = {
      hooks: [{ type: "command", command: `${bunPath} run ${join(hooksDir, "secret-store.ts")}` }],
    };
    const preToolUseHook = {
      matcher: "Bash",
      hooks: [{ type: "command", command: `${bunPath} run ${join(hooksDir, "pre-tool-use.ts")}` }],
    };

    const userPrompt = (hooks.UserPromptSubmit ?? []) as unknown[];
    const hasSecretHook = JSON.stringify(userPrompt).includes("secret-store.ts");
    if (!hasSecretHook) {
      userPrompt.push(secretStoreHook);
      hooks.UserPromptSubmit = userPrompt;
    }

    const preTool = (hooks.PreToolUse ?? []) as unknown[];
    const hasPreToolHook = JSON.stringify(preTool).includes("pre-tool-use.ts");
    if (!hasPreToolHook) {
      preTool.push(preToolUseHook);
      hooks.PreToolUse = preTool;
    }

    settings.hooks = hooks;
    settings.env = envVars;

    await Bun.write(settingsPath, JSON.stringify(settings, null, 2));
    console.log(`Set ANTHROPIC_BASE_URL=http://localhost:9277 in ${settingsPath}`);
    console.log("Run: claude-vault start");
  },

  async start() {
    const proxyPath = join(import.meta.dir, "..", "src", "proxy.ts");
    const proc = Bun.spawn(["bun", "run", proxyPath], {
      stdout: "inherit",
      stderr: "inherit",
      stdin: "ignore",
    });
    const pidFile = join(VAULT_DIR, "proxy.pid");
    await Bun.write(pidFile, String(proc.pid));
    console.log(`Proxy started (PID: ${proc.pid})`);
    await proc.exited;
  },

  async stop() {
    const pidFile = join(VAULT_DIR, "proxy.pid");
    const file = Bun.file(pidFile);
    if (!(await file.exists())) {
      console.log("No running proxy found");
      return;
    }
    const pid = parseInt(await file.text());
    try {
      process.kill(pid, "SIGTERM");
      console.log(`Stopped proxy (PID: ${pid})`);
    } catch {
      console.log(`Process ${pid} not running`);
    }
    await Bun.write(pidFile, "");
  },

  async add() {
    const name = args[0];
    if (!name) {
      console.error("Usage: claude-vault add <name>");
      console.error("  Reads value from stdin or ~/.claude-vault/buffer.txt");
      process.exit(1);
    }

    const bufferValue = await readBuffer();
    if (bufferValue) {
      await vaultSet(name, bufferValue);
      await wipeBuffer();
      console.log(`Added "${name}" from buffer.txt (buffer wiped)`);
      return;
    }

    console.log("Paste secret value (press Enter then Ctrl+D):");
    const chunks: string[] = [];
    const reader = Bun.stdin.stream().getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(decoder.decode(value));
    }
    const value = chunks.join("").trim();
    if (!value) {
      console.error("No value provided");
      process.exit(1);
    }
    await vaultSet(name, value);
    console.log(`Added "${name}" (${value.length} chars)`);
  },

  async list() {
    const keys = await vaultList();
    if (keys.length === 0) {
      console.log("Vault is empty");
      return;
    }
    console.log(`${keys.length} secret(s):`);
    for (const key of keys) {
      const val = await vaultGet(key);
      const preview = val ? `${val.slice(0, 4)}${"*".repeat(Math.max(0, val.length - 4))}` : "???";
      console.log(`  ${key}: ${preview}`);
    }
  },

  async remove() {
    const name = args[0];
    if (!name) {
      console.error("Usage: claude-vault remove <name>");
      process.exit(1);
    }
    const deleted = await vaultDelete(name);
    console.log(deleted ? `Removed "${name}"` : `"${name}" not found`);
  },

  async status() {
    const pidFile = Bun.file(join(VAULT_DIR, "proxy.pid"));
    const hasPid = await pidFile.exists() && (await pidFile.text()).trim().length > 0;
    const keys = await vaultList();
    console.log(`Vault: ${VAULT_DIR}`);
    console.log(`Secrets: ${keys.length}`);
    console.log(`Proxy: ${hasPid ? "running (check PID)" : "stopped"}`);
  },
};

if (!command || !(command in COMMANDS)) {
  console.log("claude-vault — protect secrets from Claude Code transcripts\n");
  console.log("Commands:");
  console.log("  init     Initialize vault + register in Claude Code settings");
  console.log("  start    Start the proxy server");
  console.log("  stop     Stop the proxy server");
  console.log("  add NAME Add a secret (from buffer.txt or stdin)");
  console.log("  remove NAME  Remove a secret");
  console.log("  list     List stored secrets");
  console.log("  status   Show vault status");
  process.exit(command ? 1 : 0);
}

await COMMANDS[command]();
