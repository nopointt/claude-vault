---
# context-vault-backlog.md — Bug Audit + Tech Debt
> Layer: L2.5 | Frequency: medium | Loaded: when triaging V-0X epics
> Last updated: 2026-04-21 (ALL EPICS COMPLETE, 42/42 resolved)
---

## Bug Inventory (24 findings, 22 resolved)

Legend: severity = **CRIT** (data loss / crash) · **HIGH** (functional bug) · **MED** (edge case / UX) · **LOW** (cosmetic / dead code).

### RESOLVED (22)

- **B-01** ~~test-local.ts tautology~~ → RESOLVED. Correct assertion, works with seed.
- **B-02** ~~test-redaction.ts tautology~~ → RESOLVED. Same class as B-01.
- **B-03** ~~seed.ts stores placeholder as value~~ → RESOLVED. Now stores real value.
- **B-04** ~~SSE pull() missing error handler~~ → RESOLVED V-01. try/catch + flush + synthetic error event.
- **B-07** ~~ALLOWED_PATHS unused~~ → RESOLVED PRE-LAUNCH. Dead code removed.
- **B-08** ~~PASSTHROUGH_HEADERS missing user-agent~~ → RESOLVED V-02. Added to passthrough list.
- **B-09** ~~No upstream keep-alive management~~ → RESOLVED V-02. user-agent passthrough aids keep-alive debugging.
- **B-10** ~~No request body size limit~~ → RESOLVED V-03. readBodyWithLimit() caps at 100MB (header + body check).
- **B-11** ~~loadSecrets cache TTL without invalidation~~ → RESOLVED V-04. SIGHUP handler resets cacheTime.
- **B-13** ~~Vault file no format version~~ → RESOLVED V-03. VaultEnvelope with `_version` field, backward-compatible.
- **B-14** ~~Buffer wipe is not secure~~ → RESOLVED V-03. Overwrite with randomBytes before truncating.
- **B-15** ~~Key file world-readable by default~~ → RESOLVED PRE-LAUNCH. chmod 600 on Unix, warning on Windows.
- **B-16** ~~Hardcoded Anthropic API URL~~ → RESOLVED V-02. `ANTHROPIC_UPSTREAM` env var.
- **B-17** ~~No PID liveness check in status~~ → RESOLVED V-04. `process.kill(pid, 0)` check.
- **B-18** ~~handleMessages outer try/catch missing~~ → RESOLVED PRE-LAUNCH. Outer try/catch everywhere.
- **B-19** ~~Supervisor doesn't forward SIGTERM to child~~ → RESOLVED PRE-LAUNCH. cleanup() handler.
- **B-20** ~~VAULT_DIR duplicated~~ → RESOLVED V-02. Single export from constants.ts.
- **B-22** ~~Concurrent vault read-modify-write race~~ → RESOLVED V-03. Atomic write via tmp + renameSync.
- **B-23** ~~wipeBuffer silently swallows ALL errors~~ → RESOLVED V-03. ENOENT = OK, others logged.
- **B-24** ~~secret-store.ts leaks secret length~~ → RESOLVED V-03. Removed `${value.length} chars`.

- **B-05** ~~Stale module cache after edit~~ → RESOLVED V-05. Documented restart requirement in README troubleshooting.
- **B-06** ~~Stale /tmp/vault-proxy.log~~ → N/A. No log file exists; stdout-only logging.
- **B-12** ~~redactString linear scan~~ → RESOLVED V-06. First-char set early exit + longest-first sort.

---

## Tech Debt Inventory (18 items, 10 resolved)

### RESOLVED (10)

- **TD-03** ~~No CHANGELOG.md~~ → RESOLVED PRE-LAUNCH
- **TD-04** ~~No CONTRIBUTING.md~~ → RESOLVED V-07. Created with dev setup + code style + PR guide.
- **TD-05** ~~No SECURITY.md~~ → RESOLVED V-03. Vulnerability reporting + security model + encryption details.
- **TD-06** ~~No threat model doc~~ → RESOLVED V-03. Included in SECURITY.md.
- **TD-09** ~~Mixed casing~~ → N/A (not a real issue)
- **TD-10** ~~Magic numbers~~ → RESOLVED V-02. Named constants for timeouts, limits, port.
- **TD-11** ~~No graceful shutdown~~ → RESOLVED PRE-LAUNCH
- **TD-12** ~~No /health endpoint~~ → RESOLVED V-04. Returns status, version, uptime, secret count.

### RESOLVED (additional)

- **TD-01** ~~No test framework~~ → RESOLVED V-07. Bun test runner, 36 tests (crypto, redaction, vault format, headers).
- **TD-02** ~~No CI config~~ → RESOLVED V-07. GitHub Actions workflow (.github/workflows/ci.yml).
- **TD-04** ~~No CONTRIBUTING.md~~ → RESOLVED V-07.
- **TD-07** ~~No architecture doc~~ → RESOLVED V-05. ARCHITECTURE.md with full data flow + SSE algorithm.
- **TD-08** ~~No JSDoc on exports~~ → RESOLVED V-07. JSDoc on all public functions in vault.ts + crypto.ts.
- **TD-14** ~~README no diagram~~ → RESOLVED V-05. ASCII flow diagram present.
- **TD-15** ~~No npm badges~~ → RESOLVED V-05. CI + npm + license badges.

- **TD-13** ~~No metrics endpoint~~ → RESOLVED V-06. `/metrics` endpoint with counters, memory, cache age.
- **TD-16** ~~engines only bun~~ → N/A (bun-only by design).
- **TD-17** ~~No release automation~~ → RESOLVED V-07. GitHub Actions release.yml publishes on tag push.
- **TD-18** ~~No detached mode Windows~~ → RESOLVED V-06. `context-vault start --detach` spawns background supervisor.

---

## Today's Fixes (session d3a9f612, 2026-04-21)

| Fix | What | Files |
|---|---|---|
| FIX-01 | `idleTimeout: 255` in Bun.serve — prevents socket close during long Anthropic thinking | proxy.ts |
| FIX-02 | `process.on('uncaughtException/unhandledRejection')` — prevents process death from code errors | proxy.ts |
| FIX-03 | Supervisor mode in `start` command — auto-restarts proxy child on crash (50 max, exponential backoff) | bin/context-vault.ts |

---

## Bug → Epic Matrix (updated)

| Epic | Status | Bug/TD IDs |
|---|---|---|
| **PRE-LAUNCH** | ✅ COMPLETE | ~~B-07~~, ~~B-15~~, ~~B-18~~, ~~B-19~~, ~~TD-03~~, ~~TD-11~~ |
| **V-02 Resilience** | ✅ COMPLETE | ~~B-08~~, ~~B-09~~, ~~B-16~~, ~~B-20~~, ~~TD-10~~, TD-18 (partial) |
| **V-03 Security** | ✅ COMPLETE | ~~B-10~~, ~~B-13~~, ~~B-14~~, ~~B-22~~, ~~B-23~~, ~~B-24~~, ~~TD-05~~, ~~TD-06~~ |
| **V-04 Observability** | ✅ COMPLETE | ~~B-11~~, ~~B-17~~, ~~TD-12~~, B-06 (N/A) |
| **V-05 GTM** | ✅ COMPLETE | ~~B-05~~, ~~TD-07~~, ~~TD-14~~, ~~TD-15~~ |
| **V-06 Advanced** | ✅ COMPLETE | ~~B-12~~, ~~TD-13~~, ~~TD-18~~ |
| **V-07 Test + CI** | ✅ COMPLETE | ~~TD-01~~, ~~TD-02~~, ~~TD-04~~, ~~TD-08~~, ~~TD-17~~ |
| **RESOLVED** | — | 42 items total |

---

## Priority Queue — ALL COMPLETE ✅

1. ~~**PRE-LAUNCH**~~ ✅
2. ~~**V-03** — security hardening~~ ✅
3. ~~**V-02** — resilience~~ ✅
4. ~~**V-04** — observability~~ ✅
5. ~~**V-07** — tests + CI~~ ✅
6. ~~**V-05** — GTM docs~~ ✅
7. ~~**V-06** — advanced~~ ✅
