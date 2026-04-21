---
# contexter-vault-v8.md — V-08 Desktop Coverage
> Layer: L3 | Epic: V-08 | Status: ⬜ PLANNED
> Created: 2026-04-21 (session 4)
> Target: vault redacts secrets in Claude Desktop traffic (not only CLI)
---

## Goal

Extend contexter-vault from CLI-only (`ANTHROPIC_BASE_URL` mechanism) to Claude Desktop app via HTTPS MITM through Windows/macOS system proxy + self-signed root CA. Double addressable market before V-09 hard launch.

## Problem

Claude Desktop app ignores `ANTHROPIC_BASE_URL` env var. No custom-endpoint config. Connects directly to `api.anthropic.com` via HTTPS. Users switching from CLI to Desktop lose vault protection.

## Constraints

**What works in Desktop after V-08:**
- Request body redaction (secrets → `<<VAULT:name>>` before reaching Anthropic)
- Response SSE de-redaction (placeholders → real values in streaming responses)

**What does NOT work in Desktop (hook-dependent, CLI-only):**
- `/secret store <name>` inline command (UserPromptSubmit hook — CLI-only)
- `<<VAULT:name>>` auto-substitution when tool executes Bash/Write/Edit (PreToolUse hook — CLI-only)

**Workaround for management:** Optional MCP server exposes `vault_add`, `vault_list`, `vault_remove` as tools callable from Desktop chat. Auto-substitution remains CLI-exclusive.

## Policy Verification (done)

**AIA verdict (2026-04-21, agentId aa8a5ba0de2441cf4):**
- **Ban risk: LOW.** AUP requires "authorization of system owner" — user IS system owner of their machine. Zero documented enforcement cases against MITM tools (proxyclawd, llm-interceptor, contexter-vault itself).
- **Cert pinning: NOT PINNED.** Anthropic docs explicitly support HTTPS inspection via Zscaler/CrowdStrike with self-signed CA. If pinning existed, enterprise TLS-inspection flow wouldn't work.
- **Enterprise precedent:** Anthropic's own network config docs document MITM-with-trusted-CA pattern for enterprise. V-08 replicates this for individual users.

## Active Decisions (locked)

- **D-V08-01:** Smoke test first, architecture second. Day 1: mitmproxy + self-signed CA + Windows system proxy → verify Desktop honors system proxy + no pinning. Only then commit to native-vs-mitmproxy path.
- **D-V08-02:** CA key + cert stored at `~/.contexter-vault/ca/` (with vault's existing key hygiene).
- **D-V08-03:** Windows + macOS first. Linux deferred.
- **D-V08-04:** `contexter-vault desktop-mode {enable|disable|status}` as user-facing CLI surface. Hides CA install + system proxy config + mitmproxy spawn behind one command.
- **D-V08-05:** mitmproxy path for v0.3.0 ship (faster, proven). Native Bun TLS path deferred to v0.4.0+ (cleaner, one-binary).
- **D-V08-06:** MCP server for vault management is optional side-quest, not P0.

## Phases

### P0 — Smoke Test (1 day)

**Goal:** Verify the approach works at all before writing production code.

**Tasks:**
- Install mitmproxy on Windows (`brew install mitmproxy` on macOS alt)
- Generate mitmproxy CA
- Install CA in Windows Trusted Root Certification Authorities
- Configure Windows Manual Proxy → HTTPS 127.0.0.1:8080
- Run `mitmproxy` with basic flow logging
- Launch Claude Desktop, send a message
- **Expected:** mitmproxy logs show HTTPS request to `api.anthropic.com/v1/messages` with decrypted body

**Done when:**
- [ ] Desktop traffic visible in mitmproxy
- [ ] No cert error in Desktop
- [ ] Body content readable (not binary)

**If fails (any of the above):** STOP, escalate. Desktop may have undocumented pinning or refuse system proxy. Investigate per A4 bug diagnosis protocol.

### P1 — Architecture Decision (after P0 succeeds)

**Goal:** Lock mitmproxy-addon path vs native-Bun-TLS path.

**Default decision:** mitmproxy-addon for v0.3.0 ship.

**Rationale:**
- mitmproxy is mature, battle-tested MITM
- Python addon ≈ 150 lines, imports vault format, calls `redactString()`
- Users install one extra dep (mitmproxy) — acceptable
- Native Bun TLS is a 2-week rewrite of proxy.ts — not worth for v0.3.0
- Revisit in v0.4.0 — ship Bun-native terminator, drop mitmproxy dep

### P2 — CA Generation + Install Helper (1 day)

**Action:** `contexter-vault install-ca` subcommand — generates CA, installs in OS trust store.

**Tasks:**
- Bun script: generate 4096-bit RSA CA key + 10-year self-signed cert
- Write to `~/.contexter-vault/ca/ca.key` (chmod 600) + `~/.contexter-vault/ca/ca.crt`
- Windows: `certutil -addstore -user Root ~/.contexter-vault/ca/ca.crt` (user scope, no admin)
- macOS: `security add-trusted-cert -d -r trustRoot -k ~/Library/Keychains/login.keychain ca.crt`
- `uninstall-ca` subcommand does the reverse

**Done when:**
- [ ] `install-ca` succeeds without admin on Windows user scope
- [ ] CA visible in `certmgr.msc` under user's Trusted Root
- [ ] `openssl verify -CAfile ca.crt <any-leaf-cert>` workflow confirmed

### P3 — System Proxy Auto-Configure (1 day)

**Action:** `contexter-vault desktop-mode enable` — sets system HTTPS proxy on Windows/macOS.

**Tasks:**
- Windows: `netsh winhttp set proxy 127.0.0.1:9277` OR registry key `HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ProxyServer`
- macOS: `networksetup -setwebproxy "Wi-Fi" 127.0.0.1 9277` + `-setsecurewebproxy`
- `desktop-mode disable` reverts all settings
- `desktop-mode status` shows current state

**Done when:**
- [ ] `enable` sets proxy, Desktop sees it
- [ ] `disable` reverts cleanly (no leftover settings)
- [ ] Idempotent — enable twice = same state

### P4 — mitmproxy Vault Addon (1-2 days)

**Action:** Python addon for mitmproxy that applies vault redaction to Claude API traffic.

**Tasks:**
- Python script `addons/vault-redact.py`
- Reads `~/.contexter-vault/vault.enc` + `vault.key` (replicate crypto.ts logic in Python — ~50 lines)
- `request` handler: if host=`api.anthropic.com` and path starts with `/v1/messages` → decrypt body, redact, re-encode
- `response` handler: redact streaming SSE chunks (sliding window algo from proxy.ts — port to Python)
- `contexter-vault desktop-mode enable` spawns `mitmdump -s vault-redact.py -p 9277` as detached process
- `disable` kills mitmdump process

**Done when:**
- [ ] Addon redacts test secret in request body
- [ ] Addon redacts SSE streaming response
- [ ] No 5xx from Anthropic (redaction doesn't break JSON)
- [ ] Proxy survives 100+ requests without crash

### P5 — MCP Server (optional, 1 day)

**Action:** Minimal MCP server exposing `vault_add`, `vault_list`, `vault_remove` as Desktop-callable tools.

Deferred to v0.4.0 unless demand signal emerges during V-09 launch.

### P6 — Docs + Smoke Test (0.5 day)

**Action:** README update, troubleshooting, one-pager.

**Tasks:**
- README section: "Using with Claude Desktop"
- Troubleshooting: "Desktop doesn't honor proxy" (check Windows proxy settings, restart Desktop)
- Troubleshooting: "TLS error" (verify CA installed in correct store)
- Uninstall one-liner documentation

**Done when:**
- [ ] Fresh Windows VM test: install → enable → Desktop redacts → disable → clean state
- [ ] User-visible docs complete

## Acceptance Criteria

| ID | Criterion | Verify |
|---|---|---|
| AC-1 | mitmproxy addon redacts API key in Desktop request body | Real Desktop session + Anthropic console shows `<<VAULT:name>>` not real key |
| AC-2 | No user-visible TLS error in Desktop | Manual: send message, no warnings |
| AC-3 | `desktop-mode disable` reverts system proxy + unloads addon | `netsh winhttp show proxy` → direct access |
| AC-4 | CA install user-scope only (no admin on Windows) | `install-ca` runs without elevation |
| AC-5 | Published as v0.3.0 on npm | `npm view contexter-vault version` → 0.3.0 |
| AC-6 | Zero regressions in CLI flow | V-07 tests all pass |

## Dependencies

- ✅ V-01 shipped (v0.2.0 baseline)
- ⬜ mitmproxy installed on dev machine for P0
- ⬜ Self-signed CA generation logic ported to Bun

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Desktop has undocumented cert pinning | HIGH | P0 smoke test catches this Day 1; if fails, escalate + drop V-08 |
| Desktop ignores system proxy | MED | P0 smoke test — same caveat |
| Windows Defender flags CA install as suspicious | MED | Use user scope (no admin) → Defender rarely flags; document in README |
| mitmproxy dep pushback from users ("why not one binary?") | LOW | Plan v0.4.0 with native Bun TLS terminator |
| Anthropic public complaint about MITM tools | LOW | AIA verified LOW policy risk; have response ready |

## Write Authority

| File | Owner |
|---|---|
| `memory/contexter-vault-v8.md` (this L3) | Axis |
| `addons/vault-redact.py` | Axis + Lead/Backend (mies) |
| CLI subcommands (install-ca, desktop-mode) | Axis + Lead/Backend |

## Decision Log (append-only)

- **2026-04-21:** V-08 created. 6 D-V08 decisions locked. 7 phases P0-P6. AIA policy verdict: LOW ban risk, no cert pinning. Default path: mitmproxy addon for v0.3.0, native Bun TLS deferred to v0.4.0.
