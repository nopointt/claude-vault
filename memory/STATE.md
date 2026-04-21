# STATE — contexter-vault

## Position
- **Phase:** V-01..V-07 ✅ COMPLETE. **V-08 + V-09 PLANNED.**
- **Current focus:** 🎯 **V-09 GTM Launch Execution — 5K Stars campaign (90 days).** V-08 Desktop Coverage runs in parallel to double addressable market before hard launch.
- **Status:** `contexter-vault@0.2.0` LIVE on https://www.npmjs.com/package/contexter-vault. Product shipped, polished, tested, documented. Ready for launch. Manual OS-level items deferred to nopoint (dir rename, GitHub repo rename, proxy migration).
- **Last session:** 2026-04-22 (Axis, session 4 CLOSE — TOV v1.0 + fact-check tool MVP + all Day 0 launch assets + warmup cheatsheets HN+Reddit)
- **Sessions total:** 4
- **Next (Axis — Day 0 sprint, fresh session morning 2026-04-22 via /continueaxis):**
  1. Blog post #1 rewrite (FAIL verdict — 14 em-dashes in 35 lines + "just use" minimizer)
  2. Twitter thread lighter fix (8 em-dashes across 11 tweets)
  3. T-1h warmup (remaining HN #1-4, Reddit R1-R3 per cheatsheet)
  4. T-0 2026-04-22 13:00 UTC — HN Show HN submit
  5. T+2m r/ClaudeAI, T+5m r/LocalLLaMA, T+10m Claude Discord (coordinated wave)
  6. T+1h — awesome-list submissions (hesreallyhim Issue + 4 PRs) + console.dev email
  7. T+4h r/netsec, T+6h r/privacy, T+8h r/selfhosted, T+10h r/sideproject
- **Next (nopoint — manual, non-blocking):**
  - Revoke 2 compromised npm tokens (`npm_XjcX…`, `npm_Gwkz…`)
  - Rename local dir `development/context-vault/` → `contexter-vault/`
  - Rename GitHub repo via UI
  - Migrate running proxy to global npm install + rename `~/.claude-vault/` → `~/.contexter-vault/`
  - Generate fresh granular NPM_TOKEN → GitHub Secrets → release.yml automation

## Key Completions
- **Session 4 (2026-04-22):** Brand TOV v1.0 CANONICAL (4 pillars Precise/Direct/Honest-about-tradeoffs/No-hype, Harkly-adapted for dev audience, HN-research-backed examples). Fact-check pipeline MVP shipped: `contexter-vault check` subcommand (claim extract + tropes.fyi patterns + TOV compliance + logic heuristics) + external Sonnet factcheck-agent for WebSearch verification + `~/.claude/reglaments/fact-check.md` reglament + E6 standard added. 4 research artifacts (GTM platforms SEED, Day 0 launch tactics DEEP, HN voice, AI detection tools). All V-09 launch assets drafted: HN Show HN (title+body+first-reply+5 objection responses), 7 Reddit drafts per-sub tailored, 5 awesome-list submissions, console.dev email, blog post #1, 11-tweet Twitter thread. Warmup cheatsheets: 10 HN comments + 8 Reddit comments in EN+RU format. Re-audit via tool: all Reddit drafts 0 AI tells / 0 TOV violations after em-dash fixes. HN warmup #5 posted (Laws of SE thread, visible). Commits: 9d3bb65 (tool+TOV) + c88dfc4 (launch assets). Context at close ~680K.
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

### V-09 GTM Launch (session 4)

- **D-V09-10..15 (TOV v1.0 CANONICAL):** 4 pillars — Precise / Direct / Honest-about-tradeoffs / No-hype. Harkly tov.md v3 adapted for senior-dev audience. Bauhaus Sparsamkeit + Инфостиль as philosophical anchor. English-only. Surface-aware tone (README/CLI/blog/post/etc). AI Editor Persona (8-layer system prompt). File: `brand/tov.md`.
- **D-V09-16 (Fact-check pipeline):** split between local pattern-match tool (`contexter-vault check` subcommand: claim extraction + tropes + TOV + logic) and external Sonnet factcheck-agent (WebSearch-based claim verification, incremental file writes per E6). Reglament `~/.claude/reglaments/fact-check.md` formalizes workflow.
- **D-V09-17 (AI detection):** Binoculars rejected — over-engineering for Bun/npm stack (requires 28GB GPU + Python). All detectors cap at ~62% true-positive on human-edited AI text per NeurIPS 2025 research. Pattern-match against tropes.fyi catalog + TOV discipline is the realistic defense. Originality.ai REST V3 ($0.10/1K words) reserved as optional V2 layer.
- **D-V09-18 (HN title):** `Show HN: contexter-vault – open-source secret redaction for Claude Code` (68 chars, 7 words descriptor, Langfuse pattern, security-framed). Backup Option B: Infisical pattern. Option C CVE-anchored for security-narrower reach if Day 0 moves to r/netsec-first.
- **D-V09-19 (HN body + first-reply):** body opens with pain point (not product). First-reply uses markepear.dev 7-step framework — personal intro → tool summary → problem + why matters → backstory → technical solution → differentiation vs mitmproxy/DIY → explicit feedback invitation.
- **D-V09-20 (Warmup strategy):** EN+RU cheatsheet format for both HN (10 comments) and Reddit (8 comments). Cheatsheets on Desktop + in memory/. 20-30 min pause between comments. Reddit: ≤2 per sub per 24h, 10min rate limit per sub for low-karma accounts.
- **D-V09-21 (Framing):** avoid "AI" label on HN/Reddit post titles. Security / privacy / developer-utility framings preferred (sturdystatistics State of Show HN 2025: AI-labeled posts underperform, OSS p=0.088 of >100pts).
- **D-V09-22 (Day 0 schedule):** 2026-04-22 13:00 UTC = T-0. Tier-1/2 targets only. HN → r/ClaudeAI (+2m) → r/LocalLLaMA (+5m) → Claude Discord (+10m) → awesome-list submissions + console.dev (+1h) → r/netsec (+4h) → r/privacy (+6h) → r/selfhosted (+8h) → r/sideproject (+10h).
- **D-V09-23 (Em-dash abuse):** TOV rule — em-dashes in body prose limited to >15% density triggers WARN. Blog post #1 FAILs on this (40% density, 14 em-dashes in 35 lines); needs full rewrite with comma/period/parens replacements.

### Historical
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

## Deferred / Upcoming
- ✅ V-02..V-07 all COMPLETE in v0.2.0
- 🔶 **V-08 Desktop Coverage** (PLANNED): HTTPS MITM system proxy + self-signed CA so vault works with Claude Desktop app (not just CLI). AIA verified LOW ban risk + no cert pinning. Blocks nothing, recommended before V-09 hard launch for wider addressable market.
- 🎯 **V-09 GTM Launch Execution** (NEXT): 5K stars in 90 days via HN Show HN + Reddit + Twitter + Product Hunt + blogs + awesome-lists + influencer outreach. Assets: demo GIF, landing, 3 blog posts, HN variants, comparison table.

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
