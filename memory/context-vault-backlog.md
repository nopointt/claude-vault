---
# context-vault-backlog.md — Bug Audit + Tech Debt
> Layer: L2.5 | Frequency: medium | Loaded: when triaging V-0X epics
> Last updated: 2026-04-21 (PRE-LAUNCH complete, 10 resolved)
---

## Bug Inventory (24 findings, 10 resolved)

Legend: severity = **CRIT** (data loss / crash) · **HIGH** (functional bug) · **MED** (edge case / UX) · **LOW** (cosmetic / dead code).

### RESOLVED (10)

- **B-03** ~~seed.ts stores placeholder as value~~ → RESOLVED. Now stores `"SUPERSECRET12345"`. Tests work correctly with real value.
- **B-04** ~~SSE pull() missing error handler~~ → RESOLVED V-01. try/catch + flush + synthetic error event + graceful close (proxy.ts lines 163-191).
- **B-01** ~~test-local.ts tautology~~ → RESOLVED. Backlog description was wrong. Actual code `!redacted1.includes("SUPERSECRET12345") && redacted1.includes("<<VAULT:test-key>>")` is correct assertion, works with current seed.
- **B-02** ~~test-redaction.ts tautology~~ → RESOLVED. Same class as B-01; seed fix made test assertions valid.
- **B-18** ~~handleMessages outer try/catch missing~~ → RESOLVED PRE-LAUNCH. Outer try/catch in handleMessages + handleCountTokens + Bun.serve error handler.
- **B-19** ~~Supervisor doesn't forward SIGTERM to child~~ → RESOLVED PRE-LAUNCH. cleanup() handler kills child on SIGTERM/SIGINT, clears PID file.
- **B-15** ~~Key file world-readable by default~~ → RESOLVED PRE-LAUNCH. chmod 600 on Unix, warning on Windows, loadKey checks perms.
- **B-07** ~~ALLOWED_PATHS unused~~ → RESOLVED PRE-LAUNCH. Dead code removed.

### HIGH severity

**B-10 — No request body size limit** (HIGH, proxy.ts line 82) → **V-03**
- `await req.text()` reads entire POST body into memory without cap
- Malicious or buggy client can exhaust proxy memory
- Fix: read body as stream with size counter, reject at 100 MB

**B-14 — Buffer wipe is not secure** (HIGH, vault.ts line 86) → **V-03**
- `Bun.write(BUFFER_FILE, "")` truncates but FS may retain blocks with plaintext
- Fix: overwrite with random bytes before truncating

**B-22 — Concurrent vault read-modify-write race** (HIGH, vault.ts) → **V-03** ← NEW
- vaultSet: load() → modify → save() is not atomic
- Two simultaneous hooks/sessions → last write wins, first write lost
- Fix: file locking or atomic rename pattern

### MED severity

**B-11 — loadSecrets cache TTL without invalidation** (MED, proxy.ts) → **V-04**
- 5-second cache TTL; no way to force refresh from CLI
- Fix: SIGHUP handler → `cacheTime = 0`; CLI add/remove sends SIGHUP

**B-17 — No PID liveness check in status** (MED, bin/context-vault.ts) → **V-04**
- `status` prints "running" if PID file exists, regardless of liveness
- Fix: `process.kill(pid, 0)` check or curl /health

**B-09 — No upstream keep-alive management** (MED, proxy.ts) → **V-02**
- Bun fetch keep-alive defaults unspecified for long-lived proxies
- Fix: explicit Connection header tuning

**B-20 — VAULT_DIR duplicated** (MED, crypto.ts:5 + vault.ts:5) → **V-02** ← NEW
- Both files define `VAULT_DIR = join(homedir(), ".context-vault")` independently
- Maintenance risk: change one, forget the other
- Fix: single export from vault.ts, crypto.ts imports it

**B-23 — wipeBuffer silently swallows ALL errors** (MED, vault.ts lines 87-89) → **V-03** ← NEW
- `catch { // ignore }` hides permission errors that indicate security issues
- Fix: log error at minimum, distinguish "file not found" (OK) from "permission denied" (alert)

**B-24 — secret-store.ts leaks secret length** (MED, secret-store.ts line 36) → **V-03** ← NEW
- Response includes `${value.length} chars` — exact length metadata
- Length aids cryptanalysis; unnecessary for UX
- Fix: remove or bucket ("short"/"medium"/"long")

### LOW severity

**B-05 — Stale module cache after edit** (LOW docs, not source) → **V-04**
- Fix: document "restart proxy after edits" in TROUBLESHOOTING

**B-06 — Stale /tmp/vault-proxy.log** (LOW UX) → **V-04**
- Append-only, no rotation. Fix: size-based rotation.

**B-08 — PASSTHROUGH_HEADERS missing user-agent** (LOW, proxy.ts) → **V-04**
- Non-breaking addition for better debugging.

**B-12 — redactString linear scan** (LOW perf, proxy.ts) → **V-06**
- O(N × text_length) per call. Fine at N<50.

**B-13 — Vault file no format version** (LOW, vault.ts) → **V-03**
- No `_version` field for future migrations.

**B-16 — Hardcoded Anthropic API URL** (LOW, proxy.ts line 3) → **V-02**
- Breaks testability and proxy chains.
- Fix: `process.env.ANTHROPIC_UPSTREAM ?? "https://api.anthropic.com"`

---

## Tech Debt Inventory (18 items)

### TD-01 No test framework (HIGH) → V-07
### TD-02 No CI config (HIGH) → V-07
### TD-03 ~~No CHANGELOG.md~~ (MED) → RESOLVED PRE-LAUNCH
### TD-04 No CONTRIBUTING.md (MED) → V-07
### TD-05 No SECURITY.md (HIGH for security tool) → V-03
### TD-06 No threat model doc (HIGH) → V-03
### TD-07 No architecture doc (MED) → V-04
### TD-08 No JSDoc on exports (LOW) → V-07
### TD-09 Mixed casing (LOW) → N/A (not a real issue)
### TD-10 Magic numbers (LOW) → V-02
### TD-11 ~~No graceful shutdown~~ (MED) → RESOLVED PRE-LAUNCH
### TD-12 No /health endpoint (MED) → V-04
### TD-13 No metrics endpoint (LOW) → V-04
### TD-14 README no diagram (LOW) → V-05
### TD-15 No npm badges (LOW) → V-05
### TD-16 engines only bun (LOW) → V-07
### TD-17 No release automation (MED) → V-07
### TD-18 No detached mode Windows (HIGH UX) → V-02 (PARTIALLY ADDRESSED by supervisor)

---

## Today's Fixes (session d3a9f612, 2026-04-21)

| Fix | What | Files |
|---|---|---|
| FIX-01 | `idleTimeout: 255` in Bun.serve — prevents socket close during long Anthropic thinking | proxy.ts |
| FIX-02 | `process.on('uncaughtException/unhandledRejection')` — prevents process death from code errors | proxy.ts |
| FIX-03 | Supervisor mode in `start` command — auto-restarts proxy child on crash (50 max, exponential backoff) | bin/context-vault.ts |

---

## Bug → Epic Matrix (updated)

| Epic | Bug/TD IDs |
|---|---|
| **PRE-LAUNCH** | ~~B-07~~, ~~B-15~~, ~~B-18~~, ~~B-19~~, ~~TD-03~~, ~~TD-11~~ (ALL RESOLVED) |
| **V-02 Resilience** | B-09, B-16, B-20, TD-10, TD-18 |
| **V-03 Security** | B-10, B-13, B-14, B-22, B-23, B-24, TD-05, TD-06 |
| **V-04 Observability** | B-05, B-06, B-08, B-11, B-17, TD-07, TD-12, TD-13 |
| **V-05 GTM** | TD-14, TD-15 |
| **V-06 Advanced** | B-12 |
| **V-07 Test + CI** | TD-01, TD-02, TD-04, TD-08, TD-16, TD-17 |
| **RESOLVED** | B-01, B-02, B-03, B-04, B-07, B-15, B-18, B-19, TD-03, TD-11 |

---

## Priority Queue

1. ~~**PRE-LAUNCH** — ALL RESOLVED~~ ✅
2. **V-03** — B-14, B-22, B-10, TD-05, TD-06 (security hardening)
3. **V-02** — B-09, B-16, B-20, TD-10, TD-18 (resilience)
4. **V-04** — observability
5. **V-07** — tests + CI
6. **V-05/V-06** — GTM + advanced
