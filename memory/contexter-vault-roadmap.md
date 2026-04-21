---
# contexter-vault-roadmap.md — Roadmap
> Layer: L2 | Frequency: medium | Loaded: at session start
> Last updated: 2026-04-21
---

## Current Focus: V-09 GTM Launch Execution — 5K Stars Campaign

**Scope:** Drive contexter-vault to 5,000 GitHub stars within 90 days. Narrative: privacy for Claude users who type secrets into conversations. Channels: HN + Reddit + Twitter + Product Hunt + blog + influencers + awesome-lists. V-08 Desktop coverage runs in parallel to double addressable market before hard launch.

**Status:** Planning phase. V-01..V-07 complete (product is shipped, polished, tested, documented). Ready for launch as soon as V-09 assets produced + V-08 Desktop support lands.

---

## Historical: V-01 Rename + Ship v0.2.0

**Scope:** Rename project from `claude-vault` to `contexter-vault`. Move to `development/` (not `tools/`). Fix SSE error handling. Set up memory infrastructure. Catalogue bugs + tech debt. Publish v0.2.0 as first official open-source release on npm + GitHub.

**Status:** ✅ COMPLETE — `contexter-vault@0.2.0` live on npm (2026-04-21).

---

## Epics

| Epic | Description | Status | L3 File |
|---|---|---|---|
| V-01 | Rename claude-vault → contexter-vault + ship v0.2.0 open-source | ✅ COMPLETE | `contexter-vault-v1.md` |
| V-02 | Resilience: supervisor-worker split, detached mode, UNPROXIED fallback, auto-respawn | ✅ COMPLETE | (in v1) |
| V-03 | Security hardening: threat model, secure buffer wipe, key ACL, body size limit, vault versioning | ✅ COMPLETE | (in v1) |
| V-04 | Observability: `/health` endpoint, log rotation, `--verbose` flag, real status check | ✅ COMPLETE | (in v1) |
| V-05 | GTM **technical readiness**: ARCHITECTURE.md, badges, README flow diagram (NOT a launch) | ✅ COMPLETE | (in v1) |
| V-06 | Advanced features: `.claude-plugin` package, secret expiry, multi-profile vaults, `.env` import, encrypted backup | ✅ COMPLETE | (in v1) |
| V-07 | Test suite + CI/CD: bun test, GitHub Actions matrix, coverage report | ✅ COMPLETE | (in v1) |
| **V-08** | **Desktop Coverage: HTTPS MITM via system proxy + self-signed CA — extends vault to Claude Desktop app** | **⬜ PLANNED** | `contexter-vault-v8.md` (TBD) |
| **V-09** | **GTM Launch Execution — 5K Stars campaign (HN Show HN, Reddit waves, Twitter, Product Hunt, blog posts, demo GIF, landing page)** | **🎯 NEXT** | `contexter-vault-v9.md` (TBD) |

---

## V-01 Summary (in progress)

| Phase | What | Status |
|---|---|---|
| P1 | Directory move `tools/claude-vault/` → `development/contexter-vault/` | ✅ COPIED (old preserved per G1) |
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
- Secret rotation helpers (`contexter-vault rotate <name>`)

Dependencies: V-01 shipped.

---

## V-04 Observability

**Goal:** User-facing diagnostics without leaking secrets.

Key items:
- `GET /health` endpoint (non-sensitive: PID, uptime, secret count, proxy version)
- `GET /metrics` endpoint (Prometheus format; requests/min, redaction rate, upstream errors)
- Log rotation: size-based, keep N files
- `--verbose` flag for debug logging (no secret values, only pattern counts)
- `contexter-vault status` actually verifies proxy alive via `curl /health` (B-17 fix)
- Optional OpenTelemetry export for enterprise

Partial implementation in V-01: basic `/health` + real `status` check.

---

## V-05 GTM Launch

**Goal:** Open-source traction and adoption.

Key items:
- HN Show HN post: "Show HN: contexter-vault — local proxy that redacts secrets from Claude Code API traffic"
- r/ClaudeAI launch post
- r/selfhosted privacy angle
- r/programming technical angle (SSE sliding window redaction algorithm)
- Blog post on nopoint site or contexter.cc/contexter-vault subpage
- Demo GIF (asciinema or screen recording)
- GitHub README badges (npm version, license, bun runtime, CI status)
- Twitter/X thread with examples
- Submit to `awesome-claude-code` and `awesome-mcp` GitHub lists

Dependencies: V-01 published, CI green (V-07).

---

## V-06 Advanced Features

**Goal:** Beyond MVP usefulness for power users.

Key items:
- Claude Code plugin package (`.claude-plugin` pattern — installable via `/plugin install contexter-vault`)
- Secret expiry dates (auto-remove after 30/90/custom days)
- Secret categories/tags (organize by project, auto-load subset)
- Multi-profile vaults (work / personal / per-project)
- `.env` file import (`contexter-vault import .env`)
- Export vault to encrypted backup (`contexter-vault export`)
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

See `contexter-vault-backlog.md` for:
- 17 catalogued bugs (B-01..B-17) with severity + V-0X epic assignment
- ~15 tech debt items
- Documentation gaps (CONTRIBUTING, CHANGELOG, SECURITY, ARCHITECTURE docs)
- Distribution gaps (no CI, no release automation, no brew formula)
- Operational items (log rotation, graceful shutdown, metrics)

---

## V-08 Desktop Coverage (PLANNED)

**Goal:** Extend contexter-vault to Claude Desktop app. Currently vault works only with Claude Code CLI (via `ANTHROPIC_BASE_URL`). Desktop app ignores env var and has no custom-endpoint config — requires system-level HTTPS MITM.

**Approach:**
- Self-signed root CA generated by `contexter-vault` on install
- Windows Certificate Store integration (`certutil -addstore Root`) — documented + scripted
- System HTTPS proxy setting → 127.0.0.1:9277
- Vault proxy extended with TLS termination + on-the-fly fake cert generation for api.anthropic.com
- Alternative: mitmproxy + Python addon (faster to ship, external dep)

**Policy verification (done):** AIA confirmed LOW ban risk. Anthropic AUP requires "authorization of system owner" — user IS system owner of their machine. No cert pinning in Desktop (enterprise HTTPS inspection officially supported per code.claude.ai/docs/en/network-config). Zero documented enforcement cases.

**Key constraints:**
- Hooks (`/secret store`, `PreToolUse` substitution) remain CLI-only — Desktop has no hooks API. Only **request/response redaction** works.
- MCP server as supplementary UX channel for vault management from Desktop chat (`@vault list`, `@vault add`)

**Phases (draft):**
- P1: Smoke test — mitmproxy + existing root CA + Windows system proxy → verify Desktop traffic intercept works, no pinning
- P2: Decision — native TLS in contexter-vault (Bun `node:tls`) vs mitmproxy addon
- P3: CA generation + install helper `contexter-vault install-ca`
- P4: TLS terminator in proxy.ts (if native path) OR Python addon (if mitmproxy path)
- P5: Windows system proxy auto-configure helper
- P6: MCP server for Desktop vault UX
- P7: Docs + smoke test + `contexter-vault desktop-mode` CLI subcommand

**Acceptance:**
- AC-1: Fresh Windows install → `contexter-vault desktop-mode enable` → Claude Desktop request shows redacted body at Anthropic side
- AC-2: No user-visible TLS warning in Desktop
- AC-3: `desktop-mode disable` cleanly reverts system proxy + removes CA

Dependencies: v0.2.0 shipped (V-01).

---

## V-09 GTM Launch Execution — 5K Stars Campaign (NEXT)

**Goal:** 5,000 GitHub stars on `nopointt/contexter-vault` within 90 days of launch.

**Narrative hook:** *"Your API keys, DB passwords, and seed phrases are in every Claude conversation. contexter-vault redacts them before they leave your machine — open source, zero dependencies, works with CLI and Desktop."*

**Channels + targets (90-day plan, iteratively refined):**

| Channel | Tactic | Target metric |
|---|---|---|
| **Hacker News** | Show HN launch post + Tuesday 9am ET timing | front page → 500-1500 stars |
| **r/ClaudeAI** | Tech-focused post with demo GIF | 100-300 stars |
| **r/selfhosted** | Privacy/sovereignty angle | 100-250 stars |
| **r/programming** | SSE sliding-window redaction algorithm deep-dive | 50-150 stars |
| **Twitter/X** | Thread with screenshots + a16z / security infosec accounts tag | 200-500 stars |
| **Product Hunt** | Launch day #1 | 100-300 stars |
| **awesome-lists PRs** | awesome-claude-code, awesome-mcp, awesome-selfhosted, awesome-privacy | 100-200 stars (long tail) |
| **Blog posts** | nopoint.cc / contexter.cc/vault subpage + cross-post to dev.to, Medium | 100-300 stars (SEO) |
| **Dev influencers** | Reach out to 10-15 Claude Code / AI security influencers | 200-500 stars |
| **GitHub issues in related projects** | Mention contexter-vault in discussions of "how to hide secrets from Claude" | 50-150 stars |
| **Weekly changelog** | Regular release cadence keeps interest | sustainer |
| **HN 2nd/3rd submission** | Relaunch with v0.3 / V-08 Desktop support as new angle | 500-1000 stars |

**Assets required (pre-launch):**
- Demo GIF (asciinema or screen recording, <15s): "redacting API key live"
- Landing page or README-as-landing with embedded demo
- 3 blog posts drafted: "Why I built contexter-vault" / "How the SSE redaction works" / "Claude Desktop + vault: extending coverage"
- Press kit: logo, screenshots, 1-paragraph pitch, founder quote
- Twitter thread pre-written
- HN post title variations A/B
- Comparison table vs alternatives (Formal.ai, llm-interceptor, proxyclawd)

**Phases:**
- P1: Narrative & positioning lock (headline, pitch, unique angle)
- P2: Asset production (GIF, blog drafts, landing)
- P3: V-08 Desktop coverage shipped (doubles addressable market → Desktop users can also use it)
- P4: Soft launch — awesome-lists PRs + own-channel posts (warmup week)
- P5: Hard launch — HN Show HN + coordinated Reddit posts (Day 0)
- P6: Amplification — Twitter thread, influencer outreach, dev.to repost (Days 1-7)
- P7: Sustain — weekly changelog, issue engagement, feature velocity (Days 7-90)
- P8: Relaunch — V-08 Desktop as HN angle #2 (Day 30-45)

**Acceptance:**
- AC-1: 5,000+ GitHub stars within 90 days
- AC-2: ≥1 HN front-page submission
- AC-3: 3+ blog posts published
- AC-4: Listed in 5+ awesome-lists
- AC-5: npm weekly downloads ≥500/week by day 60

Dependencies: V-01 shipped ✅, V-08 recommended before hard launch (Desktop support is a major unique angle).
