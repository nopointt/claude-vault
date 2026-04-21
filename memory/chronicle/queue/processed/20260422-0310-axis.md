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
