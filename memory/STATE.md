# STATE — contexter-vault

## Position
- **Phase:** V-01..V-07 ✅ COMPLETE, v0.2.0 PUBLISHED on npm
- **Status:** **contexter-vault@0.2.0 LIVE** on https://www.npmjs.com/package/contexter-vault. Installable via `bun install -g contexter-vault`. Axis skill routing + git remote URL migrated to `contexter-vault`. Remaining items are manual OS-level operations (dir rename, GitHub repo rename, proxy migration).
- **Last session:** 2026-04-21 (Axis, session d3a9f612 CLOSE #3 — npm publish live, Axis routing migrated, rename deferred items documented)
- **Sessions total:** 3
- **Next:** (1) nopoint revoke 2 compromised npm tokens. (2) nopoint rename local dir `development/context-vault/` → `contexter-vault/` (after closing Claude session). (3) nopoint rename GitHub repo via UI. (4) nopoint migrate running proxy to global npm install + rename `~/.claude-vault/` → `~/.contexter-vault/`. (5) nopoint generate fresh granular token → GitHub Secrets `NPM_TOKEN` → release.yml automation.

## Key Completions
- **Session 3 (2026-04-21):** `contexter-vault@0.2.0` PUBLISHED on npm (granular token with Bypass 2FA). Axis skill routing (4 files) + `axis-active` + git remote URL migrated to `contexter-vault`. Rename of on-disk directory deferred (Windows cwd hold).
- **Session 2 (2026-04-21):** All 42 backlog items resolved (V-02 Resilience, V-03 Security, V-04 Observability, V-05 GTM, V-06 Advanced, V-07 Tests+CI). 36 unit tests (Bun test). GitHub Actions CI + release workflows. Full rebrand context-vault→contexter-vault. `v0.2.0` tag pushed.
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
- **D-52:** Axis skill routing files (startaxis/closeaxis/checkpointaxis/continueaxis) + axis-active migrated to project name `contexter-vault`. Paths in skill tables point to `development/contexter-vault/` — will break Axis until nopoint renames on-disk dir.
- **D-51:** GitHub repo rename deferred (requires UI). Git remote URL pre-updated to `nopointt/contexter-vault.git` — push fails until GitHub rename completed.
- **D-50:** Directory `development/context-vault/` on-disk rename blocked by Windows cwd hold. Manual step for nopoint after session close.
- **D-49:** Two npm tokens leaked via chat (npm_XjcX..., npm_Gwkz...) — pending revoke by nopoint.
- **D-48:** npm publish requires granular token with **Bypass 2FA** flag when account has no 2FA. Classic token + `--otp` is insufficient.
- **D-47:** `contexter-vault@0.2.0` published to npmjs.com on 2026-04-21 13:22 UTC.
- **D-42:** npm package name `context-vault` taken (v3.19.0, unrelated author) → full rebrand to `contexter-vault`. CLI + vault dir + log prefix all renamed.
- **D-43:** Directory `nospace/development/context-vault/` and GitHub repo `nopointt/claude-vault` intentionally NOT renamed. Reason: Axis skill routing has path hardcoded; git history simpler without move. npm name is the canonical brand; directory/repo are internal paths.
- **D-44:** `bun test` is canonical test command. Old e2e tests kept as `test:e2e*` scripts for live proxy smoke testing.
- **D-45:** Vault envelope format `{ _version: 1, secrets: {...} }` is forward-compat marker. Bare-object format (pre-v0.2.0) still readable.
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
- ✅ **npm name `context-vault` taken** (resolved D-42: renamed to `contexter-vault`)
- ✅ **v0.2.0 unreleased** (resolved: 10 commits + tag pushed; awaiting `npm publish` only)
- ✅ **B-18 SSE outer try/catch missing** (resolved PRE-LAUNCH)
- **Proxy running from stale location**: Current proxy process (PID 7232 from session 97328fa5 killed during move; a second proxy at PID b14zdtnrf was spawned by worktree session per nopoint screenshot #2) runs from `nospace/tools/claude-vault/src/proxy.ts`, NOT from new `development/contexter-vault/`. After V-01 commits: kill running proxy, restart from new location.
- **Directory rename blocked by own cwd**: `development/context-vault/` cannot be renamed while this Claude session holds it as cwd. Manual step for nopoint: close session → Rename-Item → start new session in renamed dir.
- **GitHub repo rename requires UI action**: cannot be done from CLI. Pre-updated git remote URL will fail push until done.
- **Compromised npm tokens awaiting revoke**: `npm_XjcXAFWK...` + `npm_GwkztM1f...` — both transited Anthropic API via chat, nopoint to revoke both.
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
- Version: 0.2.0 (PUBLISHED 2026-04-21 13:22 UTC)
- npm: https://www.npmjs.com/package/contexter-vault — maintainer `nopoint`, 18 files, 60.9 KB unpacked
- GitHub: github.com/nopointt/claude-vault (UI rename pending); git remote pre-updated to contexter-vault.git
- Tests: 36 pass (Bun test runner)
- CI: GitHub Actions ci.yml + release.yml configured
- Backlog: 42/42 resolved (ALL closed)
- Sessions: 3
- License: MIT
- Dependencies: 0 runtime deps + `@types/bun` devDep (minimal surface area)
- Runtime: Bun ≥1.0.0
- Source files: 9 (`src/crypto.ts`, `src/vault.ts`, `src/proxy.ts`, `src/seed.ts`, `src/test-local.ts`, `src/test-redaction.ts`, `src/hooks/secret-store.ts`, `src/hooks/pre-tool-use.ts`, `bin/contexter-vault.ts`)
- Code lines: ~500 (not counted precisely; proxy.ts ~256, vault.ts ~100, bin ~189, hooks ~150)
- Test coverage: smoke tests only, tautology bugs in test-redaction.ts + test-local.ts (B-01/B-02)
- Encryption: AES-256-GCM (Node.js native crypto via node:crypto)
- Port: 9277 (configurable via `CONTEXT_VAULT_PORT`)
- Bugs catalogued: 24 (B-01..B-24, 22 resolved + B-05 resolved V-05 + B-12 resolved V-06; 0 remaining)
- Tech debt items: 18 (16 resolved, 2 deferred: TD-16 bun-only by design, TD-18 partial)
- Commits: 10 this session, all pushed (last: `4ee0205` full rebrand)
