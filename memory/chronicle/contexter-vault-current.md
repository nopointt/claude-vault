# contexter-vault-current.md — Working Chronicle
> Append-only · rotates to `contexter-vault-chronicle.md` at ~80KB

# session-scratch.md
> Closed · Axis · 2026-04-21

<!-- ENTRY:2026-04-21:CLOSE:1:contexter-vault:contexter-vault-v1 [AXIS] -->
## 2026-04-21 — сессия 1 CLOSE [Axis]

**Context:** First official session for contexter-vault project (renamed from claude-vault, elevated to development/). Continuation of V-01 started in previous session 97328fa5, completed in f142c2c4. All V-01 P1-P7 phases + memory infrastructure + 4 orch skills updated.

**Decisions (12 D-V01-XX locked in L3):**
- D-V01-01: Single-direction rename, no backward compat
- D-V01-02: CONTEXT_VAULT_PORT replaces CLAUDE_VAULT_PORT
- D-V01-03: Placeholder format <<VAULT:name>> unchanged
- D-V01-04: Log prefix [contexter-vault] unified
- D-V01-05: SSE try/catch + synthetic error event + graceful close
- D-V01-06: npm publish as contexter-vault unscoped
- D-V01-07: Launch channels deferred to V-05
- D-V01-08: Directory at development/contexter-vault/
- D-V01-09: V-01 internal healing; V-02 supervisor-worker
- D-V01-10: 18 bugs preserved, no silent fixes
- D-V01-11: Old tools/claude-vault/ preserved per G1
- D-V01-12: Memory follows Contexter pattern

**Files changed:**
- `nospace/tools/claude-vault/*` — code rename in-place
- `nospace/development/contexter-vault/` — full directory copy
- `memory/STATE.md` — 66 lines (new)
- `memory/contexter-vault-about.md` — L1, 166 lines (new)
- `memory/contexter-vault-roadmap.md` — L2, 158 lines (new, V-01..V-07)
- `memory/contexter-vault-v1.md` — L3 V-01 epic, 288 lines (new)
- `memory/contexter-vault-backlog.md` — L2.5, 233 lines (new, 18 bugs + 18 TD)
- `memory/chronicle/index.md` + `contexter-vault-current.md` — scaffolding
- `~/.claude/settings.json` — hook paths + ANTHROPIC_BASE_URL
- `~/.claudeignore` — .contexter-vault/ added
- `~/.claude/commands/{start,close,checkpoint,continue}axis.md` — contexter-vault support added
- `~/.tlos/axis-active` — switched to contexter-vault

**Completed:**
- V-01 P1 Directory copy (old preserved per G1)
- V-01 P2 Code rename: v0.2.0 + bin rename + src/* + SSE try/catch (B-04 resolved) + README rewrite
- V-01 P3 External refs (settings.json hooks + ANTHROPIC_BASE_URL, .claudeignore)
- V-01 P4 Memory infrastructure complete
- V-01 P5/P6 Bug + tech debt audit (18 bugs B-01..B-18, 18 TD items)
- V-01 P7 V-02..V-07 epics listed in roadmap
- 4 orch skills updated: contexter-vault project routing

**Opened:**
- V-01 P8: bun publish --dry-run + LICENSE + tsconfig review (pending)
- V-01 P9: Global pointers in MEMORY.md (pending)
- V-01 P10: Atomic commits (pending, 4-5 commits planned)
- V-02 Resilience (NEW): supervisor-worker, detached mode, UNPROXIED fallback. B-18 fix deferred here.
- V-03 Security Hardening (NEW): SECURITY.md, threat model, secure buffer wipe
- V-04 Observability (NEW): /health, /metrics, log rotation
- V-05 GTM Launch (NEW): HN Show HN, r/ClaudeAI, r/selfhosted
- V-06 Advanced Features (NEW): .claude-plugin, multi-profile vaults
- V-07 Test + CI (NEW): bun test, GitHub Actions matrix

**Notes:**
- **B-18 root cause identified:** SSE try/catch covers only reader.read(). Other failure modes (req.text, upstreamRes.text, JSON.parse) escape → socket close. Fix in V-02 requires outer try/catch + careful SSE semantics.
- **Proxy PID 13892** started 14:49:23 from old tools/claude-vault/. Has B-04 fix but lacks B-18 fix.
- **Vault empty** (0 secrets) this session.
- **Pending manual by nopoint:** (1) mv ~/.claude-vault ~/.contexter-vault after proxy stopped, (2) GitHub repo rename nopointt/claude-vault → nopointt/contexter-vault, (3) kill PID 13892 + restart proxy from new development/contexter-vault/ location, (4) bun publish when P8-P10 done.
- **Parallel scope (contexter) NOT updated.** Contexter Pre-CTX-11 commits (a5eb98a, b1768f8, c3f4033) on origin/main but STATE.md still at session 244. Next contexter session should digest recovery addendum §C.
- **axis-active** now routes to contexter-vault. Return to contexter via manual edit on next /startaxis.
<!-- ENTRY:2026-04-21:CLOSE:2:context-vault:contexter-vault-v1 [AXIS] -->
## 2026-04-21 — сессия 2 CLOSE [Axis]

**Decisions:**
- D-42: npm package name `context-vault` taken (v3.19.0) → full rebrand to `contexter-vault`
- D-43: CLI binary renamed `context-vault` → `contexter-vault`; vault dir `~/.context-vault/` → `~/.contexter-vault/`
- D-44: Directory `nospace/development/context-vault/` and GitHub repo `nopointt/claude-vault` KEPT as-is
- D-45: All 42/42 backlog items resolved across V-02 through V-07
- D-46: Epic contexter-vault-v1 COMPLETE — ready for npm publish

**Files changed:**
- `src/proxy.ts` — configurable upstream, SIGHUP, body limit, /metrics, redactString perf
- `src/vault.ts` — envelope versioning, atomic write, secure wipe, JSDoc
- `src/crypto.ts` — VAULT_DIR from constants, JSDoc
- `src/constants.ts` — NEW (breaks circular dep)
- `src/__tests__/*.ts` — NEW, 36 unit tests
- `bin/contexter-vault.ts` (renamed) — PID liveness, --detach flag
- `.github/workflows/{ci,release}.yml` — NEW, CI + npm release
- `SECURITY.md`, `CONTRIBUTING.md`, `ARCHITECTURE.md` — NEW
- `CHANGELOG.md`, `README.md` — badges, troubleshooting
- `package.json` — name `contexter-vault`
- Memory files renamed context-vault-* → contexter-vault-*

**Completed:**
- PRE-LAUNCH, V-02, V-03, V-04, V-05, V-06, V-07 — all epics CLOSED
- Full rebrand context-vault → contexter-vault
- Pushed v0.2.0 tag to GitHub
- 36 unit tests pass

**Opened:**
- npm publish (awaiting user action)
- NPM_TOKEN in GitHub Secrets
- Optional: rename GitHub repo + local dir

**Notes:**
- Directory + GitHub repo preserved intentionally (Axis routing depends on path)
- 10 atomic commits this session; last `4ee0205` is full rebrand
<!-- ENTRY:2026-04-21:CLOSE:3:contexter-vault:contexter-vault-v1 [AXIS] -->
## 2026-04-21 — сессия 3 CLOSE [Axis]

**Decisions:**
- D-47: Published `contexter-vault@0.2.0` to npm — live at npmjs.com/package/contexter-vault
- D-48: npm now requires granular token with Bypass 2FA (classic token with OTP insufficient for accounts without 2FA)
- D-49: 2 compromised tokens pending revoke by nopoint
- D-50: Directory rename `context-vault/` → `contexter-vault/` deferred (cwd busy)
- D-51: GitHub repo rename deferred (UI action); remote URL pre-updated
- D-52: Axis skill routing + axis-active updated

**Files changed:**
- `~/.claude/commands/{startaxis,closeaxis,checkpointaxis,continueaxis}.md` — project routing rename
- `~/.tlos/axis-active` — session 3
- `.git/config` — remote origin URL → contexter-vault.git

**Completed:**
- npm publish v0.2.0 (granular token with Bypass 2FA)
- Axis skills + axis-active migrated
- Git remote URL updated

**Opened:**
- nopoint: revoke 2 compromised tokens
- nopoint: rename local dir + GitHub repo
- nopoint: migrate running proxy to global npm install
- nopoint: NPM_TOKEN in GitHub Secrets for release.yml

**Notes:**
- npm token stored in `~/.npmrc` (consider cleaning)
- Directory rename blocked by Windows cwd hold; pragmatic — user does it manually after session close
# session-scratch.md
> Session 4 · Axis · 2026-04-22

<!-- ENTRY:2026-04-22:CLOSE:4:contexter-vault:V-09 [AXIS] -->
## 2026-04-22 — сессия 4 CLOSE [Axis]

**Decisions:**
- D-V09-10..15 (TOV): TOV v1.0 CANONICAL for dev audience — 4 pillars (Precise / Direct / Honest-about-tradeoffs / No-hype). Adapted from Harkly TOV v3 structure. Bauhaus Sparsamkeit + Инфостиль as philosophical anchor. English-only.
- D-V09-16 (Fact-check): pipeline split — local pattern-match tool (`contexter-vault check`) + external Sonnet factcheck-agent for WebSearch verification. Local = claim extraction + tropes.fyi patterns + TOV compliance + logic heuristics. Agent = per-claim verification, writes incremental file per E6.
- D-V09-17 (AI detection): Binoculars dropped as over-engineering for Bun/npm stack. Research showed all detectors cap at ~62% on human-edited AI text. Pattern-match + TOV discipline is the realistic defense. Originality.ai REST ($0.10/1K words) reserved as V2 option.
- D-V09-18 (HN title): "Show HN: contexter-vault – open-source secret redaction for Claude Code" (Langfuse pattern, 7 words, security-framed). Backup: "local proxy that redacts Claude Code secrets" (Infisical pattern).
- D-V09-19 (HN body): open with pain point not product. First-reply uses 7-step framework (personal intro → tool summary → problem → backstory → technical solution → differentiation → feedback invitation).
- D-V09-20 (Warmup strategy): EN+RU cheatsheet format, 10 HN + 8 Reddit comments prepared. 20-30 min pause minimum. Reddit rate: 10 min/comment per sub for low-karma accounts.
- D-V09-21 (Framing): avoid "AI" label on HN/Reddit posts. Security / privacy / developer utility framings preferred (sturdystatistics State of Show HN 2025: AI-labeled posts underperform).
- D-V09-22 (Day 0): 2026-04-22 13:00 UTC. Schedule: T-0 HN, T+2m r/ClaudeAI, T+5m r/LocalLLaMA, T+10m Claude Discord. T+4h r/netsec, T+6h r/privacy, T+8h r/selfhosted, T+10h r/sideproject.

**Files changed:**
- `brand/tov.md` (new, v1.0, ~600 lines, 4 pillars + HN-research-backed examples)
- `src/factcheck/types.ts` (new — CheckReport types)
- `src/factcheck/claim-extractor.ts` (new — regex-based fact extraction)
- `src/factcheck/tropes.ts` (new — 40+ AI-tell patterns)
- `src/factcheck/tov.ts` (new — 35+ banned words, surface-aware exclamation)
- `src/factcheck/logic.ts` (new — contradiction + free-vs-price + future date checks)
- `src/factcheck/check.ts` (new — orchestrator + JSON/markdown formatter)
- `bin/contexter-vault.ts` (modified — added `check` subcommand with --stdin/--format/--surface flags)
- `memory/contexter-vault-v8.md` (new — Desktop coverage epic spec)
- `memory/contexter-vault-v9.md` (new — GTM launch epic spec)
- `memory/contexter-vault-v9-execution-plan.md` (new — Day 0-90 actionable timeline)
- `memory/contexter-vault-v9-launch-assets.md` (new — HN post, 7 Reddit drafts, 5 awesome-lists, console.dev email, blog post #1, Twitter thread)
- `memory/contexter-vault-v9-warmup-cheatsheet.md` (new — 10 HN comments EN+RU)
- `memory/contexter-vault-v9-reddit-warmup-cheatsheet.md` (new — 8 Reddit comments EN+RU)
- `memory/STATE.md` (modified — V-09 current focus, V-08 planned, V-01..V-07 complete)
- `memory/contexter-vault-about.md` (modified — Active L3 table updated to V-08/V-09)
- `memory/contexter-vault-roadmap.md` (modified — 9 epics, V-01..V-07 complete, V-08/V-09 planned)
- `docs/research/contexter-vault-gtm-platforms-research.md` (new — SEED, 70 platforms)
- `docs/research/contexter-vault-launch-tactics-deep-research.md` (new — DEEP, Day 0 tactics, 903 lines)
- `docs/research/contexter-vault-hn-voice-research.md` (new — HN voice 541 lines, 31 queries)
- `docs/research/ai-detection-tools-research.md` (new — AI detector comparison)
- `~/.claude/reglaments/fact-check.md` (new — global reglament, ~300 lines)
- `~/.claude/rules/standards.md` (modified — added E6 "Read research artifacts fully" REQUIRED)
- `~/.claude/agents/factcheck-agent.md` (new — Sonnet subagent definition)

**Completed:**
- SEED + DEEP GTM research (70 platforms, 4 case studies, HN tactics playbook)
- AI detection tools research (Binoculars dropped, pattern-match chosen)
- HN voice research (vocabulary, anti-patterns, shibboleths)
- TOV v1.0 CANONICAL
- Fact-check pipeline MVP (tool + reglament + agent)
- V-09 launch assets (HN, Reddit x7, awesome-lists x5, console.dev, blog, Twitter)
- Warmup cheatsheets (HN 10 + Reddit 8, EN+RU)
- Re-audit via tool: all Reddit drafts 0 AI tells / 0 TOV after em-dash fixes
- Commits: 9d3bb65 (tool + TOV), c88dfc4 (launch assets), 21be105 (V-08/V-09 planning), 3203127 (README rewrite)
- E6 standard added to rules
- HN warmup #5 posted (Laws of Software Engineering thread, visible in incognito)

**Opened:**
- Blog post #1 rewrite (FAIL — 14 em-dashes in 35 prose lines + "just use" minimizer)
- Twitter thread lighter fix (8 em-dashes across 11 tweets)
- nopoint: GitHub UI — enable Discussions + add 7 topics tags (`claude-code`, `claude-code-proxy`, `ai-security`, `secrets-management`, `bun`, `mcp-security`, `llm-proxy`)
- V-08 P0 smoke test (mitmproxy + Windows system proxy) deferred to Day 0+3
- Day 0 execution: 2026-04-22 13:00 UTC HN Show HN + Reddit wave + Claude Discord
- Remaining warmup comments (HN #1-4, #6-10; Reddit R1-R8)

**Notes:**
- Context at close: ~680K (above 500K E4 threshold, under 967K autocompact buffer)
- Day 0 ~15 hours away from close time (local ~03:00 2026-04-22, UTC ~22:00 2026-04-21). User asleep, resumes morning with `/continueaxis`.
- Reddit account: `nopointtttt`, karma 1, 7 months age. HN account: `nopointtttt`, karma 1, 88 days. Both under AutoMod-hold risk; warmup ongoing.
- `README.draft.md` remains untracked in repo — artifact from pre-commit review, not deleted per G1. Nopoint may clean up.
- Global rules files (`fact-check.md`, `standards.md` E6, `factcheck-agent.md`) live in `~/.claude/`, not tracked in contexter-vault git — they are workspace-level, persistent across sessions.

