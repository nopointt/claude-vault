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
    console.log(`Set ANTHROPIC_BASE_URL=http://127.0.0.1:9277 in ${settingsPath}`);
    console.log("Registered hooks: secret-store (UserPromptSubmit), pre-tool-use (PreToolUse)");

    const claudeIgnorePath = join(process.env.HOME || process.env.USERPROFILE || "", ".claudeignore");
    const ignoreEntries = [".contexter-vault/", "*.key", "*.enc"];
    const claudeIgnoreFile = Bun.file(claudeIgnorePath);
    let existing = "";
    if (await claudeIgnoreFile.exists()) {
      existing = await claudeIgnoreFile.text();
    }
    const missing = ignoreEntries.filter((e) => !existing.includes(e));
    if (missing.length > 0) {
      const separator = existing.length > 0 && !existing.endsWith("\n") ? "\n" : "";
      const block = `${separator}\n# contexter-vault: prevent Claude from reading secrets\n${missing.join("\n")}\n`;
      await Bun.write(claudeIgnorePath, existing + block);
      console.log(`Added ${missing.length} entries to ${claudeIgnorePath}`);
    } else {
      console.log(".claudeignore already configured");
    }

    console.log("Run: contexter-vault start");
  },

  async start() {
    if (args.includes("--detach")) {
      const logFile = join(VAULT_DIR, "proxy.log");
      const out = Bun.file(logFile).writer();
      const child = Bun.spawn([process.execPath, "run", import.meta.path, "start"], {
        stdio: ["ignore", out, out],
        env: { ...process.env },
      });
      child.unref();
      console.log(`[contexter-vault] detached supervisor (PID: ${child.pid}), log: ${logFile}`);
      process.exit(0);
    }

    const pidFile = join(VAULT_DIR, "proxy.pid");
    await Bun.write(pidFile, String(process.pid));
    console.log(`[contexter-vault] supervisor starting (PID: ${process.pid})`);

    const proxyPath = join(import.meta.dir, "..", "src", "proxy.ts");
    const MAX_RESTARTS = 50;
    const BACKOFF_BASE_MS = 1000;
    const BACKOFF_MAX_MS = 10000;
    const BACKOFF_RESET_AFTER_MS = 60000;
    let restartCount = 0;
    let lastStartTime = Date.now();
    let shuttingDown = false;
    let activeChild: ReturnType<typeof Bun.spawn> | null = null;

    const cleanup = async () => {
      shuttingDown = true;
      console.log("[contexter-vault] supervisor shutting down");
      if (activeChild) {
        activeChild.kill("SIGTERM");
        const timeout = setTimeout(() => {
          if (activeChild) activeChild.kill("SIGKILL");
        }, 2000);
        await activeChild.exited;
        clearTimeout(timeout);
      }
      await Bun.write(pidFile, "");
      process.exit(0);
    };

    process.on("SIGTERM", cleanup);
    process.on("SIGINT", cleanup);

    while (!shuttingDown) {
      activeChild = Bun.spawn([process.execPath, "run", proxyPath], {
        stdio: ["inherit", "inherit", "inherit"],
        env: { ...process.env },
      });

      lastStartTime = Date.now();
      const exitCode = await activeChild.exited;
      activeChild = null;

      if (shuttingDown) break;

      if (Date.now() - lastStartTime > BACKOFF_RESET_AFTER_MS) {
        restartCount = 0;
      }

      restartCount++;
      if (restartCount > MAX_RESTARTS) {
        console.error(`[contexter-vault] proxy exceeded ${MAX_RESTARTS} rapid restarts, stopping supervisor`);
        break;
      }

      const backoff = Math.min(BACKOFF_BASE_MS * restartCount, BACKOFF_MAX_MS);
      console.log(`[contexter-vault] proxy exited (code ${exitCode}), restarting in ${backoff}ms (${restartCount}/${MAX_RESTARTS})`);
      await Bun.sleep(backoff);
    }

    await Bun.write(pidFile, "");
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
      console.error("Usage: contexter-vault add <name>");
      console.error("  Reads value from stdin or ~/.contexter-vault/buffer.txt");
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
      console.error("Usage: contexter-vault remove <name>");
      process.exit(1);
    }
    const deleted = await vaultDelete(name);
    console.log(deleted ? `Removed "${name}"` : `"${name}" not found`);
  },

  async status() {
    const pidFile = Bun.file(join(VAULT_DIR, "proxy.pid"));
    let proxyStatus = "stopped";
    if (await pidFile.exists()) {
      const pidStr = (await pidFile.text()).trim();
      if (pidStr.length > 0) {
        const pid = parseInt(pidStr);
        try {
          process.kill(pid, 0);
          proxyStatus = `running (PID: ${pid})`;
        } catch {
          proxyStatus = `stale PID file (PID ${pid} not running)`;
        }
      }
    }
    const keys = await vaultList();
    console.log(`Vault: ${VAULT_DIR}`);
    console.log(`Secrets: ${keys.length}`);
    console.log(`Proxy: ${proxyStatus}`);
  },

  async check() {
    const { runCheck, formatReport } = await import("../src/factcheck/check");
    let text: string;
    let surface: "readme" | "cli" | "error" | "blog" | "post" | "release" | "reply" = "post";
    let format: "json" | "markdown" = "markdown";
    let filePath: string | undefined;

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === "--stdin") {
        // read stdin below
      } else if (a === "--format") {
        const next = args[i + 1];
        if (next === "json" || next === "markdown") {
          format = next;
          i++;
        }
      } else if (a === "--surface") {
        const next = args[i + 1];
        if (next === "readme" || next === "cli" || next === "error" || next === "blog" || next === "post" || next === "release" || next === "reply") {
          surface = next;
          i++;
        }
      } else if (!a.startsWith("--")) {
        filePath = a;
      }
    }

    if (args.includes("--stdin") || !filePath) {
      const chunks: Buffer[] = [];
      for await (const chunk of Bun.stdin.stream()) chunks.push(Buffer.from(chunk));
      text = Buffer.concat(chunks).toString("utf-8");
    } else {
      text = await Bun.file(filePath).text();
    }

    if (!text || text.trim().length === 0) {
      console.error("check: no input text (provide a file path or pipe via --stdin)");
      process.exit(2);
    }

    const report = runCheck(text, { surface });
    console.log(formatReport(report, format));
    process.exit(report.overall === "fail" ? 2 : report.overall === "warn" ? 1 : 0);
  },
};

if (!command || !(command in COMMANDS)) {
  console.log("contexter-vault — protect secrets from Claude Code transcripts\n");
  console.log("Commands:");
  console.log("  init     Initialize vault + register in Claude Code settings");
  console.log("  start [--detach]  Start the proxy server (--detach runs in background)");
  console.log("  stop     Stop the proxy server");
  console.log("  add NAME Add a secret (from buffer.txt or stdin)");
  console.log("  remove NAME  Remove a secret");
  console.log("  list     List stored secrets");
  console.log("  status   Show vault status");
  console.log("  check [file] [--stdin] [--format json|markdown] [--surface readme|cli|error|blog|post|release|reply]");
  console.log("           Fact / AI-tell / TOV pre-publish check on content before publishing");
  process.exit(command ? 1 : 0);
}

await COMMANDS[command]();
