# STATE — contexter-vault

## Position
- **Phase:** V-01 Rename + Ship v0.2.0 🔶 IN PROGRESS (P1-P3 done, P4-P10 pending)
- **Status:** **Rename complete** — claude-vault → contexter-vault across all code (package.json, bin/, src/*, hooks, .npmignore, README, .claudeignore). Directory copied to `nospace/development/contexter-vault/`. Proxy SSE fix in proxy.ts (try/catch + graceful close + synthetic error event). ANTHROPIC_BASE_URL re-added to ~/.claude/settings.json. Settings.json hook paths updated to new `/development/contexter-vault/` location. **Not committed yet** — 9 modified files + 1 renamed binary + 1 new README in workdir.
- **Last session:** 2026-04-21 (Axis, session f142c2c4 CLOSE #1 — V-01 P1-P7 done, memory infrastructure complete, 4 orch skills updated, 18 bugs + 18 TD catalogued, B-18 root cause identified)
- **Sessions total:** 1 (first official session for contexter-vault as separate project; predecessor work in claude-vault era under session 97328fa5 + f142c2c4 but those pre-dated project memory)
- **Next:** (1) P4 memory infrastructure — this file + L1/L2/L3/backlog/chronicle + global pointer. (2) P5/P6 bug + tech debt audit formalized as backlog. (3) P7 V-02..V-06 epics. (4) P8 bun publish --dry-run + LICENSE verify. (5) P10 atomic commits per phase. (6) Self-healing watchdog loop in `start` command (proxy respawn on internal crash). (7) /health endpoint in proxy. (8) Real `status` check via curl /health. (9) Manual by nopoint: `mv ~/.claude-vault ~/.contexter-vault`, GitHub repo rename `nopointt/claude-vault → nopointt/contexter-vault`.

## Key Completions
- Package rename: claude-vault → contexter-vault v0.2.0 (package.json, bin/, all src/*, all hooks)
- Proxy SSE crash fix: try/catch around `reader.read()` in pull() loop, graceful close + flush buffer + synthetic SSE error event (proxy.ts lines 124-188)
- Log prefix unification: `[claude-vault]` + `[vault-proxy]` → `[contexter-vault]` everywhere
- Env var rename: `CLAUDE_VAULT_PORT` → `CONTEXT_VAULT_PORT`
- Vault dir rename: `~/.claude-vault/` → `~/.contexter-vault/` in all string refs
- README full rewrite for v0.2.0 with install/troubleshooting/migration sections
- Directory copy: `nospace/tools/claude-vault/` → `nospace/development/contexter-vault/` (copy, not move — Windows busy on mv; old dir preserved per G1)
- `~/.claude/settings.json` updated: 2 hook command paths (lines 151, 263) + re-added `ANTHROPIC_BASE_URL=http://127.0.0.1:9277`
- `~/.claudeignore` updated: `.contexter-vault/` added, `.claude-vault/` kept for transition

## Active Decisions
- **D-V01-01:** Rename is single direction, no backward compat. Old `~/.claude-vault/` path: manual migration by user via `mv`. README has migration section.
- **D-V01-02:** `CONTEXT_VAULT_PORT` replaces `CLAUDE_VAULT_PORT` — no dual-read fallback. Users override port via this env.
- **D-V01-03:** Placeholder format stays `<<VAULT:name>>` — unchanged. Stable contract for downstream tooling/prompts.
- **D-V01-04:** Log prefix `[contexter-vault]` unified (previously `[claude-vault]` for startup + `[vault-proxy]` for handlers — split was inconsistent).
- **D-V01-05:** SSE stream error handling via try/catch in pull() + synthetic `event: error` SSE frame + graceful controller.close(). Client sees clean protocol-level failure instead of "socket closed unexpectedly".
- **D-V01-06:** Published as `contexter-vault` unscoped on npm registry. If name taken → fall back to `@nopoint/contexter-vault` scoped. Check availability before W5.
- **D-V01-07:** Open-source launch channels: GitHub README + HN Show HN + r/ClaudeAI + r/selfhosted. Deferred to V-05 GTM epic.
- **D-V01-08:** Directory location: `nospace/development/contexter-vault/` (not `tools/`). Project has memory/, docs/, constitution-level visibility — `tools/` implied one-off utility.
- **D-V01-09:** Fallback + self-healing strategy split between V-01 (internal watchdog in `start` + try/catch wrapper + `/health` endpoint) and **V-02** Resilience epic (supervisor-worker split at :9277/:9278, detached/daemon mode, SessionStart hook ensures live, UNPROXIED fallback if worker dead).
- **D-V01-10:** Bug audit preserves all findings (B-01..B-17) in `contexter-vault-backlog.md` — not silently fixed in V-01. Each gets explicit V-02+ epic assignment.

## Blockers
- **Proxy running from stale location**: Current proxy process (PID 7232 from session 97328fa5 killed during move; a second proxy at PID b14zdtnrf was spawned by worktree session per nopoint screenshot #2) runs from `nospace/tools/claude-vault/src/proxy.ts`, NOT from new `development/contexter-vault/`. After V-01 commits: kill running proxy, restart from new location.
- **Old directory still at `tools/claude-vault/`**: kept per G1 (never delete). nopoint cleans manually after verification. Do NOT `rm -rf`.
- **GitHub repo not yet renamed**: nopoint must rename `nopointt/claude-vault → nopointt/contexter-vault` via GitHub Settings UI. GitHub auto-creates 301 redirect from old URL.
- **npm publish not done**: V-01 W5 gates on successful `bun publish --dry-run`. Also requires `npm adduser` first-time (publisher account may not exist).
- **LICENSE + tsconfig.json unreviewed**: deferred to V-01 W5 publish prep (per recovery §L).
- **Test suite is smoke + tautology bugs**: B-01 (test-redaction.ts tautology), B-02 (test-local.ts tautology), B-03 (seed.ts stores placeholder as value). Deferred to V-02.
- **ANTHROPIC_BASE_URL source mystery** (per recovery addendum §B): var kept reappearing in env even after removal from settings.json. Unresolved — not in Windows env/registry/.vscode/PowerShell profile. May come from Claude Code internal. Assumed: settings.json is authoritative; re-added there per D-V01 re-enable.
- **Low C: drive disk** (~2.2 GB free per recovery §I): disk-check.sh blocks heavy ops. Not blocking V-01 but operational risk.
- **Socket errors in current session** (~235K tokens): proxy falls on very large request bodies + context. Retry works most of the time. Full fix requires V-02 supervisor-worker split.

## Deferred
- V-02 Resilience: supervisor-worker architecture, detached proxy, UNPROXIED fallback, auto-respawn on external kill
- V-03 Security hardening: formal threat model, secure buffer wipe (B-14), key ACL (B-15), body size limit (B-10), vault format versioning (B-13)
- V-04 Observability: /health endpoint (partial in V-01), log rotation, --verbose flag, live proxy status check
- V-05 GTM Launch: HN Show HN, r/ClaudeAI, r/selfhosted, demo GIF, landing page
- V-06 Advanced features: .claude-plugin package, secret expiry, multi-profile vaults, .env import, encrypted backup export
- CI/CD: GitHub Actions, cross-platform test matrix, coverage report

## Metrics
- Version: 0.2.0 (in progress, unreleased)
- npm: not yet published (first-time)
- GitHub: github.com/nopointt/claude-vault (pending rename to contexter-vault)
- License: MIT
- Dependencies: 0 runtime deps + `@types/bun` devDep (minimal surface area)
- Runtime: Bun ≥1.0.0
- Source files: 9 (`src/crypto.ts`, `src/vault.ts`, `src/proxy.ts`, `src/seed.ts`, `src/test-local.ts`, `src/test-redaction.ts`, `src/hooks/secret-store.ts`, `src/hooks/pre-tool-use.ts`, `bin/contexter-vault.ts`)
- Code lines: ~500 (not counted precisely; proxy.ts ~256, vault.ts ~100, bin ~189, hooks ~150)
- Test coverage: smoke tests only, tautology bugs in test-redaction.ts + test-local.ts (B-01/B-02)
- Encryption: AES-256-GCM (Node.js native crypto via node:crypto)
- Port: 9277 (configurable via `CONTEXT_VAULT_PORT`)
- Bugs catalogued: 17 (B-01 to B-17 in backlog)
- Tech debt items: ~15 (documentation, CI, observability, security)
- Commits ahead of origin/main: pending (V-01 not yet committed)
