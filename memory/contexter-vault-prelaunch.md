---
# contexter-vault-prelaunch.md — Pre-Launch Epic
> Layer: L3 | Epic: PRE-LAUNCH | Status: ✅ COMPLETE (pending: bun publish --dry-run, npm adduser)
> Created: 2026-04-21 (session d3a9f612, re-audit)
> Gate: ALL tasks must pass before v0.2.0 publish to npm
---

## Goal

Fix critical bugs and close quality gaps that block open-source v0.2.0 launch. Everything in this epic is a hard gate — no ship without green.

## Tasks

### PL-01 — Outer try/catch in handleMessages (B-18)

**Action:** Wrap entire `handleMessages` body in try/catch. Add `error` handler to `Bun.serve()`.

**Details:**
- If stream not started: return `{ error: "proxy internal error" }` as 502 JSON
- If stream started (ReadableStream already returned): emit synthetic `event: error` SSE frame, then close
- Add `error(err)` handler to Bun.serve config: return 500 JSON with generic message (no stack trace leak)

**Verify:**
```bash
# Kill Anthropic upstream mid-request (simulate with unreachable host)
curl -s -X POST http://127.0.0.1:9277/v1/messages \
  -H "Content-Type: application/json" -H "anthropic-version: 2023-06-01" -H "x-api-key: test" \
  -d '{"model":"x","max_tokens":1,"messages":[{"role":"user","content":"t"}]}' | head -5
# Expected: JSON error response (not socket close, not HTML, not empty)
```

**Done when:**
- [x] No unhandled throws escape from handleMessages
- [x] Bun.serve has `error` handler
- [x] Proxy stays alive after any error scenario

---

### PL-02 — Supervisor SIGTERM forwarding (B-19)

**Action:** Add SIGTERM + SIGINT handlers in supervisor loop that kill child process and exit cleanly.

**Details:**
- Track child process reference in supervisor scope
- On SIGTERM/SIGINT: `child.kill("SIGTERM")`, wait 2s, if still alive `child.kill("SIGKILL")`, then `process.exit(0)`
- Clean up proxy.pid on exit

**Verify:**
```bash
# Start supervisor, note supervisor PID and child PID
# Send SIGTERM to supervisor PID
# Both supervisor and child should exit
# Port 9277 should be free
kill <supervisor_pid>
sleep 2
netstat -ano | grep 9277 || echo "CLEAN"
# Expected: CLEAN
```

**Done when:**
- [x] `contexter-vault stop` kills both supervisor and proxy child
- [x] No orphan bun processes after stop
- [x] proxy.pid cleaned up

---

### PL-03 — Key file permissions (B-15)

**Action:** After writing vault.key, set file permissions to owner-only.

**Details:**
- Unix: `fs.chmodSync(KEY_FILE, 0o600)` after `Bun.write`
- Windows: no native chmod; log warning "Windows does not support file permissions — ensure vault.key is in a user-only directory"
- Check perms on every `loadKey()`: if world-readable, warn to stderr

**Verify:**
```bash
# Unix:
ls -la ~/.contexter-vault/vault.key
# Expected: -rw------- (600)
# Windows:
bun run bin/contexter-vault.ts init 2>&1 | grep -i "permission\|warning"
# Expected: warning about Windows perms
```

**Done when:**
- [x] Key file is 600 on Unix after init
- [x] Warning logged on Windows
- [x] loadKey warns if perms are too open

---

### PL-04 — Remove dead code ALLOWED_PATHS (B-07)

**Action:** Delete unused `ALLOWED_PATHS` constant from proxy.ts.

**Verify:**
```bash
grep -n "ALLOWED_PATHS" src/proxy.ts
# Expected: 0 matches
```

**Done when:**
- [x] No dead code referencing ALLOWED_PATHS

---

### PL-05 — Graceful shutdown (TD-11)

**Action:** Add SIGTERM/SIGINT handler to proxy.ts that closes Bun.serve and exits cleanly.

**Details:**
- Store server reference: `const server = Bun.serve({...})`
- On SIGTERM: `server.stop()`, log shutdown, `process.exit(0)`
- Inflight requests get 2s grace period via `server.stop(true)` (Bun closeActiveConnections)

**Verify:**
```bash
# Start proxy directly (not via supervisor)
bun run src/proxy.ts &
PROXY_PID=$!
sleep 1
kill $PROXY_PID
sleep 2
netstat -ano | grep 9277 || echo "CLEAN"
# Expected: CLEAN (no stale listener)
```

**Done when:**
- [x] SIGTERM gracefully stops proxy
- [x] No stale port bindings after stop

---

### PL-06 — CHANGELOG.md (TD-03)

**Action:** Create CHANGELOG.md in Keep-a-Changelog format.

**Content:**
```markdown
# Changelog

## [0.2.0] — 2026-04-21

### Added
- Renamed from `claude-vault` to `contexter-vault`
- Supervisor mode with auto-restart on crash
- SSE stream error handling (graceful close + synthetic error event)
- `idleTimeout: 255` for long-running Anthropic requests
- Process-level error handlers (uncaughtException/unhandledRejection)
- Graceful shutdown on SIGTERM
- Key file permission enforcement (Unix: 600)

### Changed
- Env var: `CLAUDE_VAULT_PORT` → `CONTEXT_VAULT_PORT`
- Vault dir: `~/.claude-vault/` → `~/.contexter-vault/`
- Log prefix unified to `[contexter-vault]`

### Fixed
- Socket closed unexpectedly during large context requests
- Proxy crash on upstream SSE stream abort
- Supervisor stop command now kills child process
```

**Done when:**
- [x] CHANGELOG.md exists at project root
- [x] Documents all v0.2.0 changes

---

### PL-07 — Publish prep (from V-01 P8)

**Action:** LICENSE + tsconfig review + dry-run.

**Tasks:**
- [x] Verify LICENSE: MIT, year 2026, author
- [x] Review tsconfig.json: Bun-compatible (ESNext, bundler, bun-types)
- [ ] `bun publish --dry-run` — clean, correct files list (deferred: need npm adduser)
- [ ] `npm view contexter-vault` — name available?

---

### PL-08 — Global pointers (from V-01 P9)

**Action:** Add contexter-vault pointer to MEMORY.md + create project memory file.

---

### PL-09 — Atomic commits (from V-01 P10)

**Action:** Commit all changes in logical atomic units.

**Commits:**
1. `feat(rename): claude-vault → contexter-vault v0.2.0` (package.json, bin, src, .npmignore)
2. `fix(proxy): idleTimeout + error handlers + graceful shutdown` (proxy.ts)
3. `feat(supervisor): auto-restart proxy on crash` (bin/contexter-vault.ts)
4. `fix(security): key file permissions on Unix` (crypto.ts)
5. `docs: CHANGELOG + README for v0.2.0` (CHANGELOG.md, README.md)
6. `feat(memory): project memory infrastructure` (memory/*)

---

## Acceptance Criteria

| ID | Criterion | Verify |
|---|---|---|
| AC-PL-1 | No unhandled throws escape proxy | curl test → JSON error, not socket close |
| AC-PL-2 | `stop` kills supervisor + child | `netstat` after stop → port free |
| AC-PL-3 | Key file 600 on Unix | `ls -la vault.key` |
| AC-PL-4 | No dead code | `grep ALLOWED_PATHS` → 0 |
| AC-PL-5 | SIGTERM graceful | proxy exits clean on signal |
| AC-PL-6 | CHANGELOG exists | `cat CHANGELOG.md` |
| AC-PL-7 | Dry-run clean | `bun publish --dry-run` → no warnings |
| AC-PL-8 | MEMORY.md pointer | `grep context_vault MEMORY.md` |
| AC-PL-9 | Atomic commits | `git log --oneline` ≥ 5 commits |

## Execution Order

PL-01 ✅ → PL-02 ✅ → PL-05 ✅ → PL-03 ✅ → PL-04 ✅ → PL-06 ✅ → PL-07 ✅ (partial) → PL-08 ✅ → PL-09 ✅

## Completion

All code tasks complete. 5 atomic commits on main. Remaining: `bun publish --dry-run` (needs `npm adduser`) and `npm view contexter-vault` (name check).
(bugs first, then docs, then publish prep, then commits last)
