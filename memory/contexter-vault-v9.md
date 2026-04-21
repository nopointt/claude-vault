---
# contexter-vault-v9.md — V-09 GTM Launch Execution
> Layer: L3 | Epic: V-09 | Status: 🎯 NEXT (planning phase)
> Created: 2026-04-21 (session 4)
> Target: 5,000 GitHub stars on `nopointt/contexter-vault` within 90 days of hard launch
---

## Goal

Drive contexter-vault from zero to 5,000 GitHub stars within 90 days. Establish contexter-vault as the default "hide secrets from Claude" tool in the AI-security niche. Secondary: 500+ weekly npm downloads by day 60.

## Narrative / Positioning

**Headline:** *"Your API keys and passwords are in every Claude conversation. contexter-vault redacts them before they leave your machine."*

**Angle of attack:** Privacy for AI power-users. Not enterprise compliance. Not data governance. Developer-first, zero-config, open-source, works with both Claude Code CLI and Claude Desktop.

**Unique differentiators:**
- Zero runtime dependencies (Bun-native)
- Works transparently — no workflow change
- AES-256-GCM local vault
- Works with CLI **and Desktop** (via V-08)
- Open source MIT, no cloud, no account, no telemetry

**Primary competitor framing:** Formal.ai (commercial, gateway-style, heavy), mitmproxy (DIY, not turnkey), llm-interceptor (monitoring-focused, not redaction). We are the **zero-config, redaction-first, Claude-specialized** tool.

## Active Decisions (locked)

- **D-V09-01:** 90-day timeline. 5K stars = aggressive but achievable for well-positioned dev tools with HN front-page hit.
- **D-V09-02:** V-08 Desktop support is soft-prerequisite for hard launch. Desktop users double addressable market. Ship V-08 before HN Show HN.
- **D-V09-03:** HN is primary channel. Tuesday 9am ET is the optimal slot. One shot — use it well.
- **D-V09-04:** English-only for all launch materials. Russian-language channels deferred.
- **D-V09-05:** Landing page at `contexter.cc/vault` (subpath under existing Contexter brand) OR `contexter-vault.dev` (standalone). Decision deferred to P2.
- **D-V09-06:** No paid ads in first 90 days. Organic + influencer outreach only. Proves product-market fit before spend.

## Channels + Targets

| Channel | Tactic | Timing | Target stars |
|---|---|---|---|
| Hacker News — Show HN #1 | Launch post | Day 0 (Tuesday 9am ET) | 500-1500 |
| r/ClaudeAI | Tech post + demo GIF | Day 0 +2h | 100-300 |
| r/selfhosted | Privacy/sovereignty angle | Day 1 | 100-250 |
| r/programming | SSE redaction algorithm deep-dive | Day 2 | 50-150 |
| Twitter/X thread | Screenshots + infosec/a16z tags | Day 0 +4h | 200-500 |
| Product Hunt | Launch day #1 | Day 7 | 100-300 |
| awesome-lists PRs | awesome-claude-code, awesome-mcp, awesome-selfhosted, awesome-privacy | Days 3-10 | 100-200 (long tail) |
| Blog posts ×3 | "Why I built it" / "SSE algorithm" / "Desktop MITM" | Days 3, 14, 30 | 100-300 (SEO) |
| Dev influencer outreach | 10-15 Claude Code / AI security influencers | Weeks 1-4 | 200-500 |
| GitHub discussion mentions | In related projects' issues about "hiding secrets from Claude" | Weeks 1-12 | 50-150 |
| HN Show HN #2 | V-08 Desktop support as new angle | Day 30-45 | 500-1000 |
| Weekly changelog | Regular release cadence | Weekly | sustainer |

## Phases

### P1 — Narrative Lock (days -14 to -7)

**Action:** Finalize positioning, headline, pitch. A/B test with trusted devs. Lock comparison table.

**Tasks:**
- Draft 3 headline variants, pick best via peer review
- 1-paragraph pitch (50 words)
- 1-sentence elevator pitch (15 words)
- Comparison table vs Formal.ai, mitmproxy, llm-interceptor, raw `ANTHROPIC_BASE_URL` manual setup
- FAQ (10 questions): "Is this supported by Anthropic?", "Will I get banned?" (AIA verdict: no), "Performance overhead?", "How does it work with Claude Desktop?", etc.

### P2 — Asset Production (days -14 to -3)

**Action:** Create all launch collateral.

**Tasks:**
- Demo GIF (<15s, asciinema recording of: typing API key in Claude chat → redacted in Anthropic request view)
- Landing page — README-as-landing OR dedicated subpage on contexter.cc. Light theme per D3.
- 3 blog posts drafted:
  - "Why I built contexter-vault" (origin story, personal angle)
  - "How SSE redaction works" (technical deep-dive — sliding window algorithm)
  - "Extending contexter-vault to Claude Desktop" (V-08 — post-launch angle #2)
- HN post — title variants + body + first comment (technical Q&A primer)
- Twitter thread — 10-12 tweets with screenshots
- Press kit folder — logo SVG+PNG, 4 screenshots, 1-paragraph pitch, founder quote
- README — polish for star conversion (first screen sells, demo GIF in top)

### P3 — V-08 Desktop Coverage SHIPPED (parallel, days -21 to -3)

**Dependency:** V-09 hard launch waits for V-08 ship. Desktop support is the #1 launch differentiator.

Owned by V-08 L3 (`contexter-vault-v8.md`). V-09 cannot hard-launch without it.

### P4 — Soft Launch / Warmup Week (days -7 to -1)

**Action:** Build quiet traction before HN to seed organic validation.

**Tasks:**
- awesome-lists PRs submitted (long lead time for merge)
- Personal network shares on Twitter, LinkedIn
- Post to own site / newsletter if exists
- Seed 20-50 early stars from warm audience
- Final asset QA: demo GIF plays, landing loads fast, README renders correctly on GitHub

**Done when:** 50+ organic stars before Day 0, all assets final, no broken links.

### P5 — Hard Launch — Day 0 (single day)

**Action:** Coordinated post storm across channels.

**Schedule (Tuesday):**
- 09:00 ET — HN Show HN post submitted
- 11:00 ET — r/ClaudeAI post (wait for HN to settle front page)
- 13:00 ET — Twitter thread published
- 15:00 ET — First HN engagement wave: respond to every top-5 comment within 30min
- 17:00 ET — r/selfhosted post (different audience, no channel conflict)

**Done when:** HN front page achieved OR top-20 sustained 4+ hours.

### P6 — Amplification (days 1-7)

**Action:** Ride Day 0 momentum. Convert viewers to stars with follow-ups.

**Tasks:**
- r/programming post (SSE algorithm angle — different from r/ClaudeAI pitch)
- Product Hunt launch (Day 7)
- First blog post published (cross-post dev.to + Medium)
- Influencer outreach — 5/day DMs with demo + ask for retweet
- Engage with every new GitHub issue/PR within 2 hours
- Tweet: day-over-day star growth chart

### P7 — Sustain (days 7-30)

**Action:** Keep velocity. Avoid launch-week drop-off.

**Tasks:**
- Weekly changelog post (Fridays)
- Ship 1-2 small features per week
- Second blog post: "SSE redaction algorithm deep-dive"
- Answer every HN comment on post archive
- GitHub issue response <24h always
- Target: 2,000 stars by day 30

### P8 — Relaunch #2 (days 30-45)

**Action:** Second HN angle leveraging V-08 Desktop support as "new news".

**Tasks:**
- HN Show HN #2 with headline: "Show HN: contexter-vault now works with Claude Desktop (HTTPS MITM explainer)"
- Third blog post: "Extending vault to Desktop app — how it works"
- New Twitter thread focusing on Desktop use case
- Target: +1,500 stars from second HN hit

### P9 — Long Tail (days 45-90)

**Action:** Compounding growth through SEO + community + feature velocity.

**Tasks:**
- SEO-optimized landing page with keyword targeting ("Claude secrets", "Anthropic API privacy", "LLM redaction")
- Guest posts on related blogs
- Listed in 5+ "AI tools of the week" newsletters
- Community engagement: answer questions in r/ClaudeAI / r/LocalLLaMA
- Feature requests → shipped → tweeted
- Target: 5,000 stars by day 90

## Acceptance Criteria

| ID | Criterion | Verify |
|---|---|---|
| AC-1 | 5,000+ GitHub stars within 90 days | `gh api repos/nopointt/contexter-vault --jq .stargazers_count` ≥ 5000 |
| AC-2 | ≥1 HN front-page submission (top 30 for 4+ hours) | HN archive check |
| AC-3 | 3 blog posts published on own site + dev.to | URL list in delivery report |
| AC-4 | Listed in 5+ awesome-lists | GitHub links in delivery report |
| AC-5 | npm weekly downloads ≥ 500/week by day 60 | npm registry stats |
| AC-6 | Product Hunt top 10 of the day | PH submission |
| AC-7 | 10+ external write-ups (not paid) mentioning contexter-vault | Link list |

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| HN flop (front page miss) | HIGH | Pre-seed with 5-10 warm upvotes in first 30min; relaunch angle #2 with V-08 |
| V-08 delay pushes launch date | MED | Hard-decouple: if V-08 not ready by day -7, launch CLI-only, V-08 as angle #2 |
| Anthropic ToS concern surfaces publicly | MED | AIA verdict: LOW risk (AUP requires authorization; user IS system owner). Have response ready. |
| Competitor launches similar tool | LOW | First-mover + zero-dep + open-source moat |
| Negative HN sentiment ("just use env var") | MED | FAQ + comparison table address this upfront |
| Burnout from 90-day sustained execution | MED | Scheduled content + pre-drafted assets reduce daily load |

## Dependencies

- ✅ V-01..V-07 shipped (product ready)
- 🔶 V-08 Desktop Coverage (soft-prerequisite, recommended for launch)
- ⬜ Landing page domain decision (D-V09-05)
- ⬜ Twitter account / presence for threading
- ⬜ dev.to + Medium accounts for cross-posting

## Write Authority

| File | Owner |
|---|---|
| `memory/contexter-vault-v9.md` (this L3) | Axis |
| Launch assets (GIF, blog drafts, press kit) | Axis + Lead/Copywriting agent |
| Landing page code | Axis + Lead/Frontend agent |
| HN post + Reddit copy | Axis + Lead/Copywriting agent |

## Decision Log (append-only)

- **2026-04-21:** V-09 created. 6 D-V09 decisions locked. 9 phases P1-P9. Target 5K stars / 90 days.
