---
# context-vault-roadmap.md — Roadmap
> Layer: L2 | Frequency: medium | Loaded: at session start
> Last updated: 2026-04-21
---

## Current Focus: V-01 Rename + Ship v0.2.0

**Scope:** Rename project from `claude-vault` to `context-vault`. Move to `development/` (not `tools/`). Fix SSE error handling. Set up memory infrastructure. Catalogue bugs + tech debt. Publish v0.2.0 as first official open-source release on npm + GitHub.

**Status:** P1 (move) + P2 (rename) + P3 (external refs) DONE in working copy. Not yet committed. Memory (P4) in progress. Audits (P5/P6/P7), publish prep (P8), commits (P10), global pointers (P9) pending.

---

## Epics

| Epic | Description | Status | L3 File |
|---|---|---|---|
| **V-01** | **Rename claude-vault → context-vault + ship v0.2.0 open-source** | **🔶 IN PROGRESS** | `context-vault-v1.md` |
| V-02 | Resilience: supervisor-worker split, detached mode, UNPROXIED fallback, auto-respawn | ⬜ PLANNED | — |
| V-03 | Security hardening: threat model, secure buffer wipe, key ACL, body size limit, vault versioning | ⬜ PLANNED | — |
| V-04 | Observability: `/health` endpoint, log rotation, `--verbose` flag, real status check | ⬜ PLANNED (partial in V-01) | — |
| V-05 | GTM Launch: HN Show HN, r/ClaudeAI, r/selfhosted, landing page, demo GIF | ⬜ PLANNED | — |
| V-06 | Advanced features: `.claude-plugin` package, secret expiry, multi-profile vaults, `.env` import, encrypted backup | ⬜ PLANNED | — |
| V-07 | Test suite + CI/CD: bun test migration, fix tautology bugs, GitHub Actions matrix, coverage report | ⬜ PLANNED | — |

---

## V-01 Summary (in progress)

| Phase | What | Status |
|---|---|---|
| P1 | Directory move `tools/claude-vault/` → `development/context-vault/` | ✅ COPIED (old preserved per G1) |
| P2 | Code rename: package.json, bin/, src/*, hooks, .npmignore, README | ✅ DONE |
| P3 | External refs: settings.json hook paths + ANTHROPIC_BASE_URL, .claudeignore | ✅ DONE |
| P4 | Memory infrastructure: STATE + L1 + L2 + L3 + backlog + chronicle | 🔶 IN PROGRESS |
| P5 | Bug audit — 17 findings (B-01..B-17) | ⬜ PENDING formalization |
| P6 | Tech debt audit — ~15 items | ⬜ PENDING formalization |
| P7 | V-02..V-06 epics in this roadmap | ✅ listed above (details in backlog) |
| P8 | Publish prep: `bun publish --dry-run`, LICENSE, tsconfig.json review | ⬜ PENDING |
| P9 | Global pointers: `~/.claude/.../memory/MEMORY.md` + `project_context_vault.md` | ⬜ PENDING |
| P10 | Atomic commits per phase with GSD-Task trailers | ⬜ PENDING |

---

## V-02 Resilience (next, after V-01 publish)

**Goal:** Survive external kills, provide UNPROXIED fallback when proxy worker dies.

Key items:
- Supervisor-worker architecture: lightweight supervisor binds 9277 always, forwards to worker on 9278. If worker dead → direct forward to Anthropic + UNPROXIED marker in SSE.
- Detached/daemon mode: proxy survives terminal close on Windows (PowerShell `Start-Process -WindowStyle Hidden` or named pipe daemon).
- Self-healing watchdog: supervisor auto-respawns worker on crash with exponential backoff.
- SessionStart hook: ensures proxy alive before each Claude Code session; spawns detached if missing.
- Crash telemetry: last N crashes logged with stack traces.

Dependencies: V-01 shipped (baseline stable).

---

## V-03 Security Hardening

**Goal:** Production-grade security posture for a credentials tool.

Key items:
- `SECURITY.md` with formal threat model (who attacks, what attacks, what defenses)
- `gitleaks` pre-commit config
- Secure buffer wipe (overwrite with random bytes before empty — B-14)
- Key file ACL/chmod 600 on Unix, ACL on Windows (B-15)
- Request body size limit (B-10, prevent memory exhaustion)
- Vault file format versioning (B-13, `_version: 1` field for future migrations)
- Encrypt-at-rest for `.pid` + buffer? evaluate necessity
- Secret rotation helpers (`context-vault rotate <name>`)

Dependencies: V-01 shipped.

---

## V-04 Observability

**Goal:** User-facing diagnostics without leaking secrets.

Key items:
- `GET /health` endpoint (non-sensitive: PID, uptime, secret count, proxy version)
- `GET /metrics` endpoint (Prometheus format; requests/min, redaction rate, upstream errors)
- Log rotation: size-based, keep N files
- `--verbose` flag for debug logging (no secret values, only pattern counts)
- `context-vault status` actually verifies proxy alive via `curl /health` (B-17 fix)
- Optional OpenTelemetry export for enterprise

Partial implementation in V-01: basic `/health` + real `status` check.

---

## V-05 GTM Launch

**Goal:** Open-source traction and adoption.

Key items:
- HN Show HN post: "Show HN: context-vault — local proxy that redacts secrets from Claude Code API traffic"
- r/ClaudeAI launch post
- r/selfhosted privacy angle
- r/programming technical angle (SSE sliding window redaction algorithm)
- Blog post on nopoint site or contexter.cc/context-vault subpage
- Demo GIF (asciinema or screen recording)
- GitHub README badges (npm version, license, bun runtime, CI status)
- Twitter/X thread with examples
- Submit to `awesome-claude-code` and `awesome-mcp` GitHub lists

Dependencies: V-01 published, CI green (V-07).

---

## V-06 Advanced Features

**Goal:** Beyond MVP usefulness for power users.

Key items:
- Claude Code plugin package (`.claude-plugin` pattern — installable via `/plugin install context-vault`)
- Secret expiry dates (auto-remove after 30/90/custom days)
- Secret categories/tags (organize by project, auto-load subset)
- Multi-profile vaults (work / personal / per-project)
- `.env` file import (`context-vault import .env`)
- Export vault to encrypted backup (`context-vault export`)
- Cross-machine sync via encrypted blob on user-controlled storage (R2, S3, iCloud)
- Biometric unlock (macOS TouchID, Windows Hello) for vault key

Dependencies: V-01 + V-02 stable.

---

## V-07 Test Suite + CI/CD

**Goal:** Real tests, passing CI, cross-platform compatibility verified.

Key items:
- Migrate `src/test-local.ts` + `src/test-redaction.ts` to `bun test` framework
- Fix B-01 (test-redaction.ts tautology)
- Fix B-02 (test-local.ts tautology)
- Fix B-03 (seed.ts stores placeholder as value — test data should be realistic dummy)
- Real integration tests with mock Anthropic SSE stream
- GitHub Actions matrix: Ubuntu 22 + macOS 13 + Windows Server 2022, Bun latest + 1.0
- Coverage report via `bun test --coverage`
- `CONTRIBUTING.md` with test requirements
- Dependabot for devDeps

Dependencies: can run parallel with V-02/V-03.

---

## Post-V-01 Backlog

See `context-vault-backlog.md` for:
- 17 catalogued bugs (B-01..B-17) with severity + V-0X epic assignment
- ~15 tech debt items
- Documentation gaps (CONTRIBUTING, CHANGELOG, SECURITY, ARCHITECTURE docs)
- Distribution gaps (no CI, no release automation, no brew formula)
- Operational items (log rotation, graceful shutdown, metrics)
