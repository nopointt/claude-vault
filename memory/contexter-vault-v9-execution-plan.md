---
# contexter-vault-v9-execution-plan.md — Day 0 → Day 90 Actionable Plan
> Layer: L3-execution | Epic: V-09 | Status: 🎯 ACTIVE
> Created: 2026-04-21 (session 4)
> Synthesizes: `contexter-vault-gtm-platforms-research.md` (SEED) + `contexter-vault-launch-tactics-deep-research.md` (DEEP)
> Goal: 5,000 GitHub stars in 90 days · Day 0 = 2026-04-22 13:00 UTC (Tuesday)
---

## Status Legend

- ⚪ pending — not started
- 🟡 in progress
- ✅ done
- 🔴 blocker — must resolve before Day 0
- 🟢 parallel — runs alongside, does not block

---

## SECTION A — Pre-Launch Blockers (RESOLVE TODAY 2026-04-21)

These are HARD BLOCKERS. If any unresolved at T-24h, **Day 0 must shift**.

| # | Blocker | Owner | Action | Success signal | Status |
|---|---|---|---|---|---|
| A1 | **HN karma ≥ 250** on submitting account | nopoint | Check account karma. If <250 — today: 3-4 useful comments on existing HN threads (not about contexter-vault). Or use higher-karma account. | Karma shown on profile page ≥ 250 | 🔴 |
| A2 | **`npm install -g contexter-vault` works on clean machine** | Axis + nopoint | Run on a VM / clean WSL instance. Verify binary spawns, vault init works. | `contexter-vault --version` returns 0.2.0 | 🔴 |
| A3 | **README final polish for HN conversion** | Axis | Already committed (session 4). Verify hero bold tagline, comparison table, FAQ present. | `grep -c "## FAQ" README.md` = 1 | ✅ |
| A4 | **GitHub repo description + topics tagged** | nopoint | Set repo description to "Local AES-256-GCM proxy that redacts secrets from Claude Code API traffic". Add topics: `claude-code`, `claude-code-proxy`, `ai-security`, `secrets-management`, `bun`, `mcp-security`, `llm-proxy` | Visible on github.com/nopointt/contexter-vault | 🔴 |
| A5 | **GitHub Discussions enabled** (Langfuse pattern — retention) | nopoint | Repo Settings → General → Features → Enable Discussions | Discussions tab appears on repo | 🔴 |
| A6 | **GitHub repo rename `claude-vault` → `contexter-vault`** via GitHub UI | nopoint | Settings → Rename. GitHub auto-creates 301. | `github.com/nopointt/contexter-vault` resolves | 🔴 |
| A7 | **npm tokens revoked** (2 leaked in prior sessions: `npm_XjcX…`, `npm_Gwkz…`) | nopoint | npmjs.com → account settings → revoke both | Tokens gone from account | 🔴 security |
| A8 | **HN account not shadowbanned** | nopoint | Check: `news.ycombinator.com/submitted?id=YOURUSERNAME` vs same URL in incognito. Should show same posts. | Both views identical | 🔴 |

**Go/No-go gate:** A1, A2, A4, A5, A6, A8 all green → proceed to Day 0. Any red → fix or shift launch +1 day.

---

## SECTION B — Asset Production (TODAY 2026-04-21 + EARLY 2026-04-22)

All text drafts produced by Axis. nopoint reviews and posts.

### B1. HN Show HN post

**Target:** text ready by T-12h (2026-04-22 01:00 UTC).

| Element | Content | Owner | Status |
|---|---|---|---|
| Title (45-65 chars pattern from DEEP Layer 1) | `Show HN: contexter-vault – redacts API keys from Claude Code before they reach Anthropic` | Axis | ⚪ |
| Post text box (60-120 words, ends with open question) | Template in DEEP Layer 1, Section "Post text box" — includes GitGuardian 3.2% stat, CVE-2026-21852, install one-liner | Axis | ⚪ |
| First-reply comment (2-15 min post-submit) | 60-word TL;DR + source link | Axis | ⚪ |
| 5 objection-handling templates | From DEEP Layer 1 Objection section: ANTHROPIC_BASE_URL/CVE · Anthropic ban · vs mitmproxy · stdout leak · trust | Axis | ⚪ |

### B2. Reddit posts (8 subs, different title+body per sub)

**Target:** all drafts ready by T-12h. Posts spaced per timeline (Section C).

| Sub | Title + body owner | Status |
|---|---|---|
| r/ClaudeAI | Template in DEEP Layer 2 r/ClaudeAI | ⚪ |
| r/LocalLLaMA | DEEP Layer 2 r/LocalLLaMA — local-first, 0 deps framing | ⚪ |
| r/netsec | DEEP Layer 2 r/netsec — CVE-2026-21852 technical | ⚪ |
| r/privacy | DEEP Layer 2 r/privacy — user-benefit framing | ⚪ |
| r/selfhosted | DEEP Layer 2 r/selfhosted — Docker, fully local | ⚪ |
| r/sideproject | DEEP Layer 2 r/sideproject — "I built X" honest | ⚪ |
| r/opensource | DEEP Layer 2 r/opensource — `[OSS]` prefix, MIT | ⚪ |
| r/programming | **POSTPONED** — requires blog post first (Day 3-5) | 🟢 |

**Critical rules (from DEEP):**
- Never same URL across 3+ subs same day
- 4+ hour spacing between posts
- Each sub gets different first sentence + different URL path (GitHub / README.md / blog later)

### B3. awesome-lists submissions (5 lists)

**Target:** all drafts ready T-12h, submit T+1h on Day 0.

| List | Submission type | Template | Status |
|---|---|---|---|
| hesreallyhim/awesome-claude-code | **GitHub Issue (NOT PR)** | DEEP Layer 3 § 1 — 8-field template, category "Usage Monitors" | ⚪ |
| Puliczek/awesome-mcp-security | PR to "Tools and Code" | DEEP Layer 3 § 2 — standard format | ⚪ |
| ottosulin/awesome-ai-security | PR to "Developer Security Tools" | DEEP Layer 3 § 3 — CVE anchor | ⚪ |
| Lissy93/awesome-privacy | PR with **affiliation disclosure** | DEEP Layer 3 § 4 — YAML format | ⚪ |
| malteos/awesome-anonymization-for-llms | PR to "Proxy / API Interception" | DEEP Layer 3 § 5 | ⚪ |

### B4. Outreach emails

| Target | Email template source | Send when | Status |
|---|---|---|---|
| `david@console.dev` (console.dev newsletter) | Simple pitch: what + why + link. 4-5 sentences. | T+1h Day 0 | ⚪ |
| `anna.nabiullina@gitguardian.com` (GitGuardian guest post) | DEEP Layer 5 full template with 3.2% stat anchor | Week 2 post-launch (after HN traction) | ⚪ |
| `editor@thehackernews.com` | CVE-2026-21852 mitigation angle + HN link as social proof | Week 2-3, only if HN ≥ 100 pts | ⚪ |

### B5. Product directory listings

| Directory | Format | Submit day | Status |
|---|---|---|---|
| DevHunt (devhunt.org) | GitHub auth, free tier 6-week wait | Day 1 | ⚪ |
| Futurepedia | Submission form | Day 1 | ⚪ |
| TAAFT (theresanaiforthat.com) | Submission form | Day 1 | ⚪ |
| Toolify.ai | Submission form | Day 1 | ⚪ |
| Uneed.be | Free submission | Week 1 | ⚪ |
| AlternativeTo | Free listing | Week 1 | ⚪ |
| BetaList | 2+ month wait queue | Week 1 | ⚪ |

### B6. Blog post #1 — "Why I built contexter-vault"

**Target:** contexter.cc/vault subpath OR standalone blog file in repo.

- Length: 800-1200 words
- Angle: personal origin story + GitGuardian stat + CVE-2026-21852 + Vitalik self-sovereign framing ("for those who can't go fully local")
- Cross-post to dev.to after publishing on contexter.cc
- Target publish: Day 3 (enables r/programming post + Week 2 Habr EN)

| Task | Owner | Status |
|---|---|---|
| Draft blog post | Axis | ⚪ |
| Set up contexter.cc/vault subpath | nopoint + Axis | ⚪ |
| Register dev.to account for cross-post | nopoint | ⚪ |

---

## SECTION C — Day 0 Execution Timeline (2026-04-22)

Minute-by-minute. **All times UTC.**

| Time | Action | Owner | Success criteria |
|---|---|---|---|
| **12:00** (T-1h) | Comment on 1 active HN thread (unrelated to vault) — builds fresh activity signal | nopoint | Comment posted |
| **12:00** (T-1h) | Upvote 3-4 recent Show HN posts (authentic engagement) | nopoint | Votes recorded |
| **12:15** (T-45m) | Shadowban pre-check via incognito | nopoint | Profile visible |
| **12:30** (T-30m) | nopoint final-review all draft posts | nopoint | Signed off |
| **13:00** (T-0) | **HN Show HN submitted** from home IP (not VPN) | nopoint | Post appears on /show |
| **13:02** (T+2m) | **r/ClaudeAI post** submitted (747K members, exact ICP) | nopoint | Post visible |
| **13:05** (T+5m) | **r/LocalLLaMA post** submitted (880K members) | nopoint | Post visible |
| **13:10** (T+10m) | **Claude Discord** post in appropriate channel (87K members) | nopoint | Message posted |
| **13:15** (T+15m) | First HN reply (60-word TL;DR, as reply to first commenter OR self-reply) | nopoint | Comment posted |
| **13:15-14:00** | **Reply to EVERY comment within 10 min** on all 4 platforms | nopoint | No unanswered comments |
| **13:30** (T+30m) | **Shadowban recheck** via incognito of HN submitted | nopoint | Post visible same as logged-in |
| **14:00** (T+1h) | Decision point: check HN velocity. Target: 8-10 upvotes + 2-3 comments | nopoint+Axis | Metrics met |
| **14:00** (T+1h) | Submit GitHub **Issue** to hesreallyhim/awesome-claude-code | nopoint | Issue #N created |
| **14:00** (T+1h) | Submit **PR** to Puliczek/awesome-mcp-security | nopoint | PR #N open |
| **14:00** (T+1h) | Send **email to david@console.dev** | nopoint | Email sent |
| **15:00** (T+2h) | If HN ≥ 20 pts: post demo/architecture diagram as reply. If < 10 pts: stop forcing HN, focus on Reddit. | nopoint | Decision made |
| **17:00** (T+4h) | **r/netsec post** (different URL, CVE-anchored title) | nopoint | Post visible |
| **19:00** (T+6h) | **r/privacy post** (user-benefit framing) | nopoint | Post visible |
| **21:00** (T+8h) | **r/selfhosted post** (Docker, fully-local framing) | nopoint | Post visible |
| **23:00** (T+10h) | **r/sideproject post** (honest "I built X" framing) | nopoint | Post visible |
| **01:00 (+1)** | Remaining awesome-list PRs: ottosulin, Lissy93, malteos | nopoint | 3 PRs open |
| **13:00 (+1, = T+24h)** | **Day 0 metrics review.** Stars delta, HN score, Reddit upvotes, npm downloads | Axis | Report written |

---

## SECTION D — Day 1-3 Amplification (2026-04-23 to 2026-04-25)

**Day 1 goals:** Sustain engagement, respond fast, submit remaining directories.

| Day | Action | Owner | Status |
|---|---|---|---|
| D+1 (23.04) | r/opensource post, r/artificial post | nopoint | ⚪ |
| D+1 (23.04) | Submit to: DevHunt, Futurepedia, TAAFT, Toolify | nopoint | ⚪ |
| D+1 (23.04) | Post in anthropics/claude-code **GitHub Discussions** (respectful, non-promo, technical) | nopoint | ⚪ |
| D+1 (23.04) | All HN/Reddit comments answered within 30min | nopoint | ⚪ |
| D+2 (24.04) | Publish blog post #1 "Why I built contexter-vault" on contexter.cc/vault | Axis + nopoint | ⚪ |
| D+2 (24.04) | Cross-post blog to dev.to, Medium, Hashnode | nopoint | ⚪ |
| D+3 (25.04) | r/programming post (link to blog post, not GitHub) — Tuesday 14-17 UTC optimal | nopoint | ⚪ |
| D+3 (25.04) | r/coolgithubprojects post | nopoint | ⚪ |
| D+3 (25.04) | Twitter/X account creation + first thread (10-12 tweets from DEEP insights) | nopoint + Axis | ⚪ |
| D+3 (25.04) | Submit TLDR newsletter tip (tldr.tech submission) | nopoint | ⚪ |

---

## SECTION E — Week 1-4 Sustain

### Week 1 (Apr 26 — May 2)

- ⚪ Product Hunt launch prep + submit (if chose PH path)
- ⚪ Uneed, AlternativeTo, SaaSHub listings
- ⚪ OWASP GenAI Slack post in #project-top10-for-llm
- ⚪ Bun Discord post (Anthropic-adjacent since Dec 2025 acquisition)
- ⚪ Engage with every GitHub issue/PR < 2h response time
- ⚪ Respond to Week 1 HN/Reddit replies (engagement sustains ranking)
- ⚪ **V-08 P0 smoke test** (mitmproxy + Windows system proxy) — see Section G
- ⚪ First weekly changelog post (Friday — release cadence signals momentum)

**Metric target:** 500+ stars cumulative

### Week 2 (May 3 — May 9)

- ⚪ GitGuardian pitch email (anna.nabiullina@gitguardian.com)
- ⚪ Security Boulevard pitch
- ⚪ Habr (EN) article — technical deep-dive on SSE redaction algorithm
- ⚪ Lobste.rs — pursue invite via IRC/known member
- ⚪ Infosec.exchange Mastodon post (#infosec #appsec #LLMSecurity)
- ⚪ Blog post #2 draft: "How SSE sliding-window redaction works" (r/programming + r/netsec fodder)
- ⚪ JavaScript Weekly email submission (Bun angle)
- ⚪ **V-08 P1-P4 execution** (if P0 smoke test passed)

**Metric target:** 1,500 stars cumulative

### Week 3 (May 10 — May 16)

- ⚪ The Hacker News pitch (if HN ≥ 100 pts on Day 0 post)
- ⚪ Blog post #2 published + cross-posted
- ⚪ Juejin 掘金 post (Chinese audience, bilingual or with translator)
- ⚪ V2EX GitHub node post
- ⚪ SegmentFault article
- ⚪ Changelog Weekly pitch email
- ⚪ **V-08 P5-P6 + v0.3.0 ship** (Desktop support)

**Metric target:** 2,500 stars cumulative

### Week 4 (May 17 — May 23) — HN Relaunch Window

- ⚪ **HN Show HN #2** — angle: "Show HN: contexter-vault now works with Claude Desktop"
- ⚪ Blog post #3: "Extending vault to Claude Desktop — how HTTPS MITM works"
- ⚪ New Twitter thread focusing on Desktop use case
- ⚪ Reddit wave #2: r/LocalLLaMA, r/selfhosted (Desktop angle)
- ⚪ Review metrics: on-track for 5K by Day 90?

**Metric target:** 3,500 stars cumulative (trajectory check)

---

## SECTION F — Long-tail (Week 5 — Day 90)

Compounding growth via SEO + community + feature velocity.

- ⚪ SEO landing: contexter.cc/vault with keyword targeting ("Claude secrets", "Anthropic API privacy", "LLM redaction")
- ⚪ Guest posts on 2-3 related blogs (beyond GitGuardian)
- ⚪ Listed in 5+ "AI tools of the week" newsletters
- ⚪ Community engagement: weekly answers in r/ClaudeAI / r/LocalLLaMA
- ⚪ Feature velocity: 1-2 small features/week, each tweeted
- ⚪ Monthly changelog roundup
- ⚪ Day 30 HN resubmit (different angle: v0.4 feature if shipped)
- ⚪ Day 60 HN resubmit (use-case study or case report)

**Day 90 target:** 5,000 stars

---

## SECTION G — V-08 Desktop Coverage (Parallel Track)

**Does NOT block Day 0.** Runs alongside V-09 launch, enables HN #2 relaunch angle at Week 4.

| Phase | Action | Target date | Status |
|---|---|---|---|
| P0 | mitmproxy smoke test — verify Desktop traffic intercept + no cert pinning | Day 0+3 (2026-04-25) | 🟢 |
| P1 | Architecture lock: mitmproxy-addon vs native Bun TLS | Day 0+4 | 🟢 |
| P2 | `contexter-vault install-ca` CLI subcommand | Week 2 | 🟢 |
| P3 | `contexter-vault desktop-mode enable/disable/status` | Week 2 | 🟢 |
| P4 | Python addon for mitmproxy (vault-redact.py) | Week 2-3 | 🟢 |
| P5 | MCP server for Desktop vault UX (optional, deferred) | Week 3+ | 🟢 |
| P6 | Docs + Windows VM smoke test | Week 3 | 🟢 |
| Ship | v0.3.0 on npm | Week 3 end | 🟢 |
| HN #2 | Show HN relaunch with Desktop angle | Week 4 | 🟢 |

---

## SECTION H — Metrics Checkpoints

Track these in [contexter-vault-v9.md](contexter-vault-v9.md) Decision Log after each checkpoint.

| Checkpoint | Stars | HN | Reddit (cumulative) | npm weekly | Decision |
|---|---|---|---|---|---|
| T+1h (Day 0) | — | ≥ 10 pts | — | — | HN traction signal |
| T+24h (Day 1) | ≥ 50 | ≥ 50 pts | ≥ 100 | ≥ 100 | Day 0 success signal |
| Day 3 | ≥ 200 | — | ≥ 400 | ≥ 200 | Sustain check |
| Week 1 | ≥ 500 | — | ≥ 800 | ≥ 300 | Launch week close |
| Week 2 | ≥ 1,500 | — | — | ≥ 400 | First quarter-goal check |
| Week 4 | ≥ 3,500 | HN #2 ≥ 50 pts | — | ≥ 500 | On-track for 5K? |
| Day 60 | ≥ 4,200 | — | — | ≥ 500 | Final push needed? |
| **Day 90** | **≥ 5,000** | — | — | **≥ 500** | **Goal hit / miss** |

---

## SECTION I — Escalation Triggers

If any of these fire, Axis halts non-critical work, reports to nopoint, waits direction.

| Trigger | What it means | Playbook |
|---|---|---|
| **HN post `[dead]` / shadowban detected** | Post not visible in incognito | Email `hn@ycombinator.com` immediately. Do NOT repost. |
| **HN < 10 pts at T+2h** | Day 0 HN flop | Stop HN push. Focus Reddit. Plan resubmit in 48+ h with new title. Not end of launch. |
| **Reddit post removed by AutoMod** | Karma/affiliation issue | DO NOT repost same day. Contact mod only if clearly in error. Wait 7+ days. |
| **Same-link spam flag on Reddit account** | 3+ subs same URL triggered | Stop posting from that account 24h. Review which URLs caused it. Vary URLs going forward. |
| **npm install fails on fresh environment** | Package broken | HALT launch. Fix package first. Can delay Day 0 by 1-2 days. |
| **Real Anthropic communication (support/policy)** | Anthropic noticed | STOP all related ops. Read communication carefully. Escalate to nopoint with full context. |
| **Major tech news conflicts with Day 0** (Anthropic/OpenAI announcement) | Drowned signal | Shift HN post +1 day. Reddit can still proceed. |
| **awesome-list PR rejected** | Format issue | Read reject reason. Fix + resubmit once. If second reject — drop that list. |

---

## SECTION J — Open Questions (for nopoint)

| # | Question | Why it matters | Urgency |
|---|---|---|---|
| Q1 | HN account username + current karma? | A1 blocker | **Today** |
| Q2 | Who posts to Reddit (which account, karma)? | B2 execution | **Today** |
| Q3 | Have Twitter/X account? Or creating new `@contextervault`? | Day 0+3 execution | Day 0+2 |
| Q4 | contexter.cc/vault subpath — do we have access to deploy there? | Blog #1 dependency | Day 0+1 |
| Q5 | Claude Discord — what's your username? Does it have 50+ karma/activity there? | Day 0 T+10 posting | **Today** |
| Q6 | Do we count AUTHOR stars toward the 5K goal? (i.e., does this include hand-starred by team) | Metrics integrity | Low |

---

## SECTION K — Today's Immediate Actions (by EOD 2026-04-21)

In priority order. Axis drives, nopoint executes blocker resolution.

1. 🔴 nopoint: check HN karma (A1) + report back
2. 🔴 nopoint: test `npm install -g contexter-vault` on clean env (A2)
3. 🔴 nopoint: GitHub UI — rename repo + description + topics + Discussions (A4, A5, A6)
4. 🔴 nopoint: revoke 2 leaked npm tokens (A7)
5. 🟡 Axis: draft HN title + body + first-comment + 5 objection responses (B1)
6. 🟡 Axis: draft 7 Reddit posts (different per sub) (B2)
7. 🟡 Axis: draft 5 awesome-list submissions with exact templates (B3)
8. 🟡 Axis: draft console.dev pitch email (B4)
9. 🟢 Axis: draft blog post #1 (B6) — if time, else tomorrow EOD
10. 🟡 nopoint: decide Twitter account plan (Q3)

**Cut-off:** Everything B-grade done by 2026-04-22 11:00 UTC (2 hours before launch).

---

## Decision Log (append-only)

- **2026-04-21:** Plan created. 10 sections. 8 blockers identified. Day 0 = 2026-04-22 13:00 UTC. V-08 runs parallel. HN #2 relaunch Week 4 with Desktop angle.
