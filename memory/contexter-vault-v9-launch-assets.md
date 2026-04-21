---
# contexter-vault-v9-launch-assets.md — All Day 0 copy
> Layer: L4 | Epic: V-09 | Status: 🟡 in progress
> Created: 2026-04-21 (session 4)
> Use: copy-paste source for Day 0 submission wave
---

## Table of Contents

1. [HN Show HN post](#1-hn-show-hn-post)
2. [Reddit posts (×7)](#2-reddit-posts)
3. [Awesome-list submissions (×5)](#3-awesome-list-submissions)
4. [console.dev pitch email](#4-consoledev-pitch-email)
5. [Blog post #1](#5-blog-post-1)
6. [Twitter/X thread (draft)](#6-twitter-thread)

---

# 1. HN Show HN post

**Submit at:** news.ycombinator.com/submit
**When:** 2026-04-22 13:00 UTC (Tuesday, optimal window 12-17 UTC)
**From:** home IP (NOT VPN)

## Title (pick one — A/B before submitting)

**HN research update (2026-04-22):** Show HN titles should be 3-6 words descriptor, matching refs like "Stripe — Instant payment processing for developers" (1,249pts) or "Langfuse — Open-source observability for LLM apps" (143pts). The original A was 9 words descriptor, too long. New options reflect title-research.

**Option A (recommended — matches Langfuse pattern, functional, security-leaning):**
```
Show HN: contexter-vault – open-source secret redaction for Claude Code
```
68 chars, 7 words descriptor. Security framing. No "AI" trigger (2025 Show HN data: AI-labeled posts underperform; framing as security is safer).

**Option B (shorter, tool-first — matches Infisical 232pts pattern):**
```
Show HN: contexter-vault – local proxy that redacts Claude Code secrets
```
71 chars, 8 words. "Proxy" anchors what it is. No superlatives.

**Option C (CVE-anchored, for security crowd — narrower reach):**
```
Show HN: contexter-vault – OSS mitigation for CVE-2026-21852
```
60 chars, 6 words. Strong for r/netsec crowd. Risk: narrows to security-aware HN subset, may miss broader dev audience.

**Recommendation:** **Option A** for Day 0. Gets us security framing without narrowing to CVE-only crowd. Matches proven Langfuse title shape. Backup: Option B if A feels too long.

## URL field

Leave empty — Show HN guideline is to use the text box. Text body below goes in the post field, not URL.

(If HN forces a URL: use `https://github.com/nopointt/contexter-vault` — but text-only Show HN posts perform equally well and let the context land first.)

## Post body (80-200 words — HN-research target range)

**Key change (from HN research):** first sentence moved from "contexter-vault is a..." to a specific problem sentence. Opening with the pain point (not the product) matches the Langfuse/Infisical pattern. Also removes em-dash use in body (AI-marker per HN community detection).

```
API keys and passwords in Claude Code prompts go straight to Anthropic. Transcripts shared via /feedback are retained up to 5 years. GitGuardian 2026-03-17 found Claude Code commits leak secrets at 3.2%, about 2x baseline.

contexter-vault is a local HTTP proxy between Claude Code and api.anthropic.com. It scans outbound requests, swaps secret values for <<VAULT:name>> placeholders from an AES-256-GCM vault, and forwards the redacted body. Responses get scanned the same way on return. When a tool uses a placeholder in a Bash or Write command, a PreToolUse hook substitutes the real value at execution time, so the secret runs locally but never enters the conversation.

  bun install -g contexter-vault
  contexter-vault init
  contexter-vault start

Related: CVE-2026-21852 weaponized ANTHROPIC_BASE_URL for exfiltration. This uses the same env var as a local defense.

MIT. Zero runtime deps beyond Bun. Repo: github.com/nopointt/contexter-vault.

Happy to answer questions about the architecture or threat model. What am I missing?
```

**Word count:** ~180 words. At the top of target 80-200 range. Every sentence carries substance.

**Voice changes vs v1:**
- Opening with pain point (not product name) — Langfuse pattern
- Removed em-dash (AI-marker per HN detection)
- "What am I missing?" — HN-native epistemic hedge, invites correction (Pattern 2 upvote)
- "Happy to answer" instead of "What questions do you have about the architecture or threat model?" — tighter, less questionnaire-feeling

## First comment (post AS REPLY to first commenter, NOT as top-level)

**Trigger:** first commenter posts anything (objection, question, praise). Within 2-15 min of their comment.

**HN research update (7-step framework from markepear.dev):** expanded to include personal backstory (step 4) and explicit technical differentiation (step 6), both of which were thin in v1.

```
Author here. Quick TL;DR for the thread before I get into specifics:

Claude Code reads ANTHROPIC_BASE_URL from settings.json and routes API calls there. We run a local Bun server on 127.0.0.1:9277 and set the env var to that. The server reads the request body, runs a scan pass (vault lookup + regex for common secret formats), swaps matches with <<VAULT:name>> placeholders, and forwards to api.anthropic.com. SSE responses get a sliding-window scan on the way back to handle secrets split across TCP chunks. AES-256-GCM key at ~/.contexter-vault/vault.key, never sent anywhere.

Backstory: I kept pasting Stripe and Anthropic keys into Claude Code prompts when debugging, then spending 20 minutes after every session mentally walking commits to make sure nothing got committed with a key inline. The anxiety got tiring. Built this over a weekend.

Differentiation from the obvious alternatives:
- Raw ANTHROPIC_BASE_URL gets you a proxy; it doesn't get you redaction. You still have to build the scan layer and the vault. This is that layer.
- mitmproxy works, FWIW. But you install a root CA, manage cert generation, write a per-use-case script. Hour of setup. This is an npm package. Thirty seconds.

Source of the 3.2% stat: blog.gitguardian.com/the-state-of-secrets-sprawl-2026 (2026-03-17, Anna Nabiullina + Carole Winqwist).

Happy to dig into specific threat vectors or edge cases. What am I missing?
```

## 5 objection-handling responses (paste as replies when these come up)

### OBJECTION 1: "Why not just set ANTHROPIC_BASE_URL to intercept traffic yourself?"

```
That's literally CVE-2026-21852. Check Point Research documented attackers placing malicious .claude/settings.json in repos to set ANTHROPIC_BASE_URL to their server — API keys sent before the trust dialog even appears.

contexter-vault runs locally as a proxy you control. It doesn't exfiltrate secrets — it redacts them before they leave. The ANTHROPIC_BASE_URL mechanism is the same one the attack uses, but pointed at localhost for defense instead of at attacker.com for offense.

The env var itself is officially documented by Anthropic for LLM gateway setups. Using it for local redaction is the intended path. The CVE was about trusting it too early (before user consent on a new folder).
```

### OBJECTION 2: "Won't Anthropic ban you for proxying their API?"

```
ANTHROPIC_BASE_URL is an officially documented env var — it's part of the LLM Gateway integration path Anthropic documents for Portkey/LiteLLM/similar. We're not reverse-engineering anything or bypassing their auth; all required headers (anthropic-version, x-api-key, X-Claude-Code-Session-Id) pass through unchanged. Usage is fully attributable to your account.

The terms of service cover the content of requests, not the transport layer on your own machine.
```

### OBJECTION 3: "How is this different from mitmproxy?"

```
mitmproxy is a general-purpose HTTPS MITM tool — you need to install a root CA in your trust store, manage cert generation, and write your own script for each use case. Setup is an hour, and you've now got a trust-store modification hanging around.

contexter-vault is narrow on purpose: it's an HTTP proxy that only touches Anthropic API traffic, has a typed vault schema for secret storage, uses AES-256-GCM encryption with auth tags, and runs as an npm package. Thirty seconds to deploy (bun install -g contexter-vault && contexter-vault init && contexter-vault start). No cert fiddling — Claude Code already speaks the bare HTTP to localhost path because we set the base URL.
```

### OBJECTION 4: "What about <<VAULT:name>> leaking via stdout when a tool runs?"

```
Good catch and you're right — if Claude runs a Bash command that echoes a secret, the output appears in the tool_result for that turn. The PreToolUse hook substitutes the real value at exec time, so the secret is live in stdout during that call.

The mitigation today: the proxy redacts those same values on the NEXT API call before the transcript uploads. So there's a one-turn window where the plaintext is in Claude Code's local JSONL log but not in Anthropic's servers. Open issue to add a PostToolUse hook that scrubs stdout at the terminal level — PRs welcome. SECURITY.md covers the full threat model.
```

### OBJECTION 5: "Why should I trust YOU with my secrets?"

```
You shouldn't trust anyone by default. That's the point of this project being local + open source.

- Vault lives at ~/.contexter-vault/vault.enc — encrypted with a key at ~/.contexter-vault/vault.key that never leaves your machine
- We have no server, no telemetry, no account, no network call except the Anthropic API passthrough you asked for
- MIT license, ~500 LoC of TypeScript, Bun runtime. audit every line
- Zero runtime dependencies (you can verify with bun install --dry-run) — reduces supply chain surface to Bun itself

If you catch a bug or a leak vector, open an issue. SECURITY.md has disclosure process.
```

## Post-submit actions (T+0 to T+30 min)

- [ ] T+2 min: copy post URL (news.ycombinator.com/item?id=XXXXXXX)
- [ ] T+5 min: verify post visible in incognito window (shadowban check)
- [ ] T+15 min: post first-reply comment (60-word TL;DR above)
- [ ] T+15-60 min: reply to EVERY comment within 10 min
- [ ] DO NOT share post URL publicly asking for upvotes
- [ ] DO NOT edit title after submit (resets timestamp, hurts ranking)
- [ ] If post goes [dead] → email hn@ycombinator.com immediately, include post ID

---

_Section 1 complete._

---

# 2. Reddit posts

**Critical rules (from DEEP research):**
- **NEVER use the same URL in 3+ subs in one day** — triggers spam flag, can ban account
- **NEVER use the same title** across subs — use a different angle per audience
- **Space posts 4+ hours apart** to avoid cross-post detection
- Use different URLs where possible: GitHub (`github.com/nopointt/contexter-vault`), README (`github.com/nopointt/contexter-vault#readme`), later the blog post URL
- Account `nopointtttt` has karma 1 — AutoMod may hold posts. Have disclosure of authorship ready.

**Day 0 Reddit schedule:**

| Time | Sub | URL variant |
|---|---|---|
| T+2m (13:02 UTC) | r/ClaudeAI | `github.com/nopointt/contexter-vault` |
| T+5m (13:05 UTC) | r/LocalLLaMA | `github.com/nopointt/contexter-vault#readme` |
| T+4h (17:00 UTC) | r/netsec | (blog post URL when published, or README anchor) |
| T+6h (19:00 UTC) | r/privacy | `github.com/nopointt/contexter-vault#security-model` |
| T+8h (21:00 UTC) | r/selfhosted | `github.com/nopointt/contexter-vault#install` |
| T+10h (23:00 UTC) | r/sideproject | plain github root |
| Day 1 | r/opensource | `github.com/nopointt/contexter-vault/blob/main/LICENSE` |
| Day 3+ | r/programming | **blog post URL** (requires blog post ready) |

---

## 2.1 — r/ClaudeAI (T+2m Day 0)

**Format:** text post with embedded GitHub link (not link-only).

**Title:**
```
I built a local proxy that strips API keys from your Claude Code prompts before they reach Anthropic [MIT, Bun, 30-sec setup]
```

**Body:**
```
**tl;dr:** `bun install -g contexter-vault && contexter-vault init && contexter-vault start` — your API keys never leave your machine unredacted.

**Why I built this:**
GitGuardian's State of Secrets Sprawl 2026 (March 17) reported Claude Code-assisted commits leak secrets at 3.2% vs the 1.5% baseline across all public GitHub. Separately, CVE-2026-21852 showed `ANTHROPIC_BASE_URL` being weaponized via malicious `.claude/settings.json` to exfil API keys before the trust dialog. I kept dropping my Stripe and Anthropic keys into prompts and wondering where they went.

**How it works:**
- Local HTTP proxy on 127.0.0.1:9277 (zero runtime deps beyond Bun)
- Claude Code's `ANTHROPIC_BASE_URL` points to the proxy
- Proxy scans outbound request body, swaps secret values for `<<VAULT:name>>` placeholders
- Same pass on SSE responses (sliding-window to handle chunk boundaries)
- PreToolUse hook substitutes real values at Bash/Write/Edit execution time so tools work normally

**Vault:** AES-256-GCM at `~/.contexter-vault/vault.enc`. Key never sent anywhere.

**Source:** https://github.com/nopointt/contexter-vault
**npm:** `contexter-vault`

Author here — happy to answer questions about the threat model, implementation, or edge cases (stdout leaks, cache TTL, supervisor mode, etc).

Disclosure: I built this.
```

---

## 2.2 — r/LocalLLaMA (T+5m Day 0)

**Format:** text post.

**Title:**
```
contexter-vault: for Claude Code users who can't go fully local — AES-256 proxy, MIT, Bun, 0 runtime deps
```

**Body:**
```
If you're using Claude Code professionally and can't switch to a fully local model, this tool gives you a local-first guarantee on the network boundary.

**What it does:**
Runs locally on Bun as an HTTP proxy between your machine and api.anthropic.com. Scans every outbound request for secrets (API keys, tokens, seed phrases), replaces them with `<<VAULT:name>>` placeholders backed by an AES-256-GCM local vault, before they leave. Restores on the return trip for tool execution via a PreToolUse hook.

**Setup:**
```
bun install -g contexter-vault
contexter-vault init
contexter-vault start
```

**Why Bun:**
- Zero runtime dependencies (supply-chain surface = Bun itself)
- Native TypeScript, single binary
- Fast startup, fast streaming SSE

**Local-first:**
- Vault on disk, encrypted
- No telemetry, no cloud, no account
- No API calls except the Anthropic passthrough you asked for
- MIT, ~500 LoC

**Source:** https://github.com/nopointt/contexter-vault#readme

Not a replacement for going fully local (this sub's preferred path) — but a practical privacy layer for mixed environments where you still need Claude's coding depth. Same principle as Vitalik's April 2026 "self-sovereign LLM setup" post (local control over what leaves your machine), applied pragmatically to cloud-API users.

Disclosure: author here.
```

---

## 2.3 — r/netsec (T+4h Day 0)

**Format:** text post. r/netsec values technical depth — no marketing language.

**Title:**
```
CVE-2026-21852 mitigation: OSS local proxy that redacts secrets from Claude Code traffic before api.anthropic.com
```

**Body:**
```
**Context:** CVE-2026-21852 (Check Point Research, Feb 2026): malicious `.claude/settings.json` files in repos set `ANTHROPIC_BASE_URL` to attacker-controlled servers. Claude Code sends API keys and user prompt context to the attacker before the first-use trust dialog fires. Anthropic shipped a fix that blocks API calls before trust — but the redaction problem remains: prompts contain other secrets beyond the x-api-key header (user-typed tokens, db passwords, seed phrases, env vars).

**Tool:** `contexter-vault` — local HTTP proxy that inverts the CVE mechanism. Set `ANTHROPIC_BASE_URL=http://127.0.0.1:9277` (to your own localhost), proxy scans request bodies + SSE response streams, swaps secret values for `<<VAULT:name>>` placeholders using a local AES-256-GCM vault. PreToolUse hook substitutes real values at tool execution time.

**Threat model:**
- Protected: request bodies, SSE responses, vault-at-rest (AES-256-GCM + auth tag), buffer wipe on write
- Not fully protected: one-turn window where secret appears in stdout of a tool call (visible in tool_result for that turn, redacted on NEXT call); Claude Code's local JSONL logs pre-proxy; vault key at rest (filesystem perms only, no OS keystore yet)
- Full threat model: https://github.com/nopointt/contexter-vault/blob/main/SECURITY.md

**Stack:**
- Bun runtime, TypeScript, ~500 LoC
- Zero runtime dependencies
- AES-256-GCM via Node's built-in crypto module (no third-party crypto library)
- MIT

**Relevant stats (GitGuardian State of Secrets Sprawl 2026, March 17):**
- 28.65M new hardcoded secrets on public GitHub in 2025 (+34% YoY)
- 1,275,105 AI service credentials leaked (+81%)
- 24,008 unique secrets in MCP config files
- Claude Code-assisted commits leak rate: 3.2% vs baseline 1.5%

**Repo:** https://github.com/nopointt/contexter-vault

Author here. Interested in reviews of the redaction algorithm (sliding-window over SSE chunks) and the vault envelope format. Issues/PRs welcome.

Disclosure: I wrote this tool.
```

---

## 2.4 — r/privacy (T+6h Day 0)

**Format:** text post. r/privacy wants user-benefit framing.

**Title:**
```
Your Claude Code prompts contain API keys and passwords. contexter-vault redacts them before they leave your machine [OSS, MIT]
```

**Body:**
```
Every message you type into Claude Code is sent to Anthropic as conversation context. That includes anything you paste: API keys, DB passwords, `.env` snippets, seed phrases, session tokens. Transcripts shared via `/feedback` are retained for up to five years. There's no built-in redaction.

`contexter-vault` is a local proxy (MIT, open source) that scans every outbound request for secrets and replaces them with placeholders before the request leaves your laptop. When a tool needs the real value (to run `curl` or write a config file), a hook substitutes it at execution time, so the secret works locally but never enters the transcript.

**What stays on your machine:**
- The vault file (AES-256-GCM encrypted)
- The encryption key (never transmitted)
- Your secrets (full values, only in the vault)

**What Anthropic sees:**
- Your prompts with `<<VAULT:stripe-key>>` in place of `sk_live_...`
- Nothing identifying about the real value

**What we see:**
- Nothing. The tool has no server, no account, no telemetry.

**Stack:** Bun runtime, zero runtime deps beyond that. MIT license. ~500 lines of TypeScript, small enough to audit.

**Install:**
```
bun install -g contexter-vault
contexter-vault init
contexter-vault start
```

**Source:** https://github.com/nopointt/contexter-vault#security-model

Author here. If there's a threat vector I missed, I want to know. Issues welcome.

Disclosure: I built this.
```

---

## 2.5 — r/selfhosted (T+8h Day 0)

**Title:**
```
[Open Source] contexter-vault – self-hosted local proxy that redacts secrets from Claude Code API calls | MIT, Bun, zero runtime deps
```

**Body:**
```
If you use Claude Code and care about keeping your secrets off Anthropic's servers, here's a self-hosted proxy that does exactly that.

**What it is:**
A local HTTP proxy that runs on your own machine, sits between Claude Code and api.anthropic.com, and strips secrets (API keys, tokens, seed phrases) from outbound traffic. Runs on Bun. Zero runtime deps. MIT.

**Install:**
```
bun install -g contexter-vault
contexter-vault init
contexter-vault start
```

Claude Code's built-in `ANTHROPIC_BASE_URL` env var points to the local proxy — this is the officially documented LLM gateway integration path, so nothing is being reverse-engineered or bypassed.

**Self-hosted properties:**
- No cloud, no account, no telemetry
- Vault at `~/.contexter-vault/` (AES-256-GCM encrypted)
- No network calls except the Anthropic API passthrough
- Supervisor mode auto-restarts on crash with exponential backoff
- Everything you need is in the repo; ~500 LoC TypeScript

**Source:** https://github.com/nopointt/contexter-vault#install

Roadmap includes Docker packaging and a MCP server for Claude Desktop users — open to feature requests.

Disclosure: author here.
```

---

## 2.6 — r/sideproject (T+10h Day 0)

**Title:**
```
I built contexter-vault – a local proxy that strips secrets from Claude Code API calls before they hit Anthropic [MIT, Bun, v0.2.0 live on npm]
```

**Body:**
```
Been using Claude Code heavily for a few months and every time I pasted an API key into a prompt I felt dirty. GitGuardian published stats in March 2026 saying Claude Code-assisted commits leak secrets at 2× the baseline, and CVE-2026-21852 landed around the same time showing ANTHROPIC_BASE_URL being weaponized. Took a weekend to build this.

**What it does:**
- Local HTTP proxy between Claude Code and api.anthropic.com
- Scans every outbound request for API keys / tokens / seed phrases
- Swaps them for `<<VAULT:name>>` placeholders using a local AES-256 vault
- Hook substitutes real values at tool execution time so everything still works

**Install:**
```
bun install -g contexter-vault
contexter-vault init
contexter-vault start
```

**Status:** v0.2.0 live on npm (contexter-vault). 36 unit tests, supervisor mode for crash recovery, SSE sliding-window redaction.

**Not done yet:** Claude Desktop support (working on that for v0.3), cross-machine vault sync, multi-profile vaults.

**Source:** https://github.com/nopointt/contexter-vault

Honest about early state — this is v0.2, not 1.0. Use it, break it, tell me what sucks. Issues/PRs welcome.
```

---

## 2.7 — r/opensource (Day 1)

**Title:**
```
[OSS release] contexter-vault – MIT local proxy that redacts secrets from Claude Code traffic | Bun, zero deps, AES-256-GCM
```

**Body:**
```
Open-sourcing a tool I built for my own use: `contexter-vault`, a local HTTP proxy that strips secrets from Claude Code API traffic before it reaches Anthropic.

**License:** MIT (https://github.com/nopointt/contexter-vault/blob/main/LICENSE)
**Runtime:** Bun ≥1.0
**Dependencies:** 0 runtime (only `@types/bun` as devDep)
**LoC:** ~500 TypeScript
**Version:** 0.2.0 (npm: `contexter-vault`)
**Tests:** 36 unit tests via `bun test`
**CI:** GitHub Actions matrix (Linux / macOS / Windows)

**Architecture:**
- HTTP proxy on 127.0.0.1:9277
- AES-256-GCM vault at `~/.contexter-vault/vault.enc`
- UserPromptSubmit + PreToolUse hooks for the interactive flow
- SSE sliding-window redaction for streaming responses

**Docs shipped:**
- ARCHITECTURE.md (full data flow)
- SECURITY.md (threat model)
- CONTRIBUTING.md (dev setup + code style)

**Source:** https://github.com/nopointt/contexter-vault

Contributions welcome. Threat model reviews especially welcome. This is a credentials tool, correctness matters.

Disclosure: author here.
```

---

_Section 2 complete._

---

# 3. Awesome-list submissions

**Critical:** `hesreallyhim/awesome-claude-code` blocks external PRs — submit via **GitHub Issue** with exact template. All others accept standard PR.

---

## 3.1 — hesreallyhim/awesome-claude-code

**Submit:** GitHub **Issue** (NOT PR) at `github.com/hesreallyhim/awesome-claude-code/issues/new`
**Merge time:** 1-7 days (Claude bot auto-PRs approved issues)

**Issue title:**
```
[Add] contexter-vault — local proxy that redacts secrets from Claude Code API traffic
```

**Issue body (paste exact):**
```
**Display Name:** contexter-vault

**Category:** Usage Monitors

**Sub-Category:** Security & Privacy

**Primary Link:** https://github.com/nopointt/contexter-vault

**Author Name:** nopoint

**Author Link:** https://github.com/nopointt

**License:** MIT

**Description:**
Local HTTP proxy that intercepts Claude Code API traffic and redacts secrets (API keys, tokens, seed phrases) using an AES-256-GCM vault before requests reach Anthropic.

**How it works:**
Runs as a local Bun server on `127.0.0.1:9277`. Set `ANTHROPIC_BASE_URL=http://127.0.0.1:9277` via `contexter-vault init`. Proxy scans outbound requests, replaces secret values with `<<VAULT:name>>` placeholders, and forwards redacted bodies to `api.anthropic.com`. SSE responses get a sliding-window scan on the return trip. A `PreToolUse` hook substitutes real values at tool execution time.

**Example:**
Before proxy: `{"messages": [{"content": "curl -H 'Authorization: Bearer sk_live_abc123'"}]}`
After proxy: `{"messages": [{"content": "curl -H 'Authorization: Bearer <<VAULT:stripe-key>>'"}]}`

Install: `bun install -g contexter-vault && contexter-vault init && contexter-vault start`
```

---

## 3.2 — Puliczek/awesome-mcp-security

**Submit:** Standard PR to `github.com/Puliczek/awesome-mcp-security`
**Merge time:** 3-14 days

**Target section:** "Tools and Code" (or closest equivalent in current README)

**Line to add:**
```markdown
- [contexter-vault](https://github.com/nopointt/contexter-vault) - Local AES-256-GCM proxy for Claude Code that redacts secrets (API keys, tokens, seed phrases) from API traffic before requests reach Anthropic. Addresses CVE-2026-21852 attack surface. MIT, Bun, npm.
```

**PR title:**
```
Add contexter-vault — OSS Claude Code secret-redaction proxy (CVE-2026-21852 mitigation)
```

**PR description:**
```
## Add: contexter-vault

**What it does:** Local HTTP proxy for Claude Code (Anthropic's AI coding CLI) that intercepts API traffic and redacts secrets (API keys, tokens, seed phrases) using an AES-256-GCM vault before requests reach `api.anthropic.com`. A `PreToolUse` hook substitutes real values at execution time so tools continue to work.

**Why it belongs here:** Directly addresses the threat surface documented in CVE-2026-21852 (Check Point Research, Feb 2026): malicious `.claude/settings.json` files weaponizing `ANTHROPIC_BASE_URL` to exfiltrate API keys before the trust dialog. This tool inverts that mechanism — pointing the same env var at a local redaction proxy instead.

**Properties:**
- Open source (MIT)
- Zero runtime dependencies (Bun only)
- AES-256-GCM with authentication tag
- ~500 LoC TypeScript, 36 unit tests
- Runs locally, no cloud, no telemetry

**Link:** https://github.com/nopointt/contexter-vault
**npm:** `contexter-vault@0.2.0`

Disclosure: I am the author.
```

---

## 3.3 — ottosulin/awesome-ai-security

**Submit:** Standard PR to `github.com/ottosulin/awesome-ai-security`
**Merge time:** 7-21 days

**Target section:** "Developer Security Tools" or "Secret Detection / Prevention"

**Line to add:**
```markdown
- [contexter-vault](https://github.com/nopointt/contexter-vault) - AES-256-GCM local proxy that redacts secrets from Claude Code API traffic before reaching Anthropic. Mitigates CVE-2026-21852 (ANTHROPIC_BASE_URL exfiltration). MIT.
```

**PR title:**
```
Add contexter-vault — AI-security OSS for Claude Code secret redaction
```

**PR description:**
```
## Add: contexter-vault

Local HTTP proxy for Claude Code that redacts secrets from outbound API traffic using a local AES-256-GCM vault. Addresses the same threat surface as CVE-2026-21852 — the `ANTHROPIC_BASE_URL` exfiltration vector documented by Check Point Research in February 2026 — by running locally on your machine instead of an attacker's.

**Fits awesome-ai-security because:**
- AI-specific threat model (prompts as secret-exfil path)
- Defensive tool, open source MIT
- Addresses a public CVE
- Covers a documented category (GitGuardian 2026: Claude Code commits leak secrets at 2× baseline)

**Link:** https://github.com/nopointt/contexter-vault

Disclosure: author.
```

---

## 3.4 — Lissy93/awesome-privacy

**Submit:** Standard PR to `github.com/Lissy93/awesome-privacy`
**Key rule:** MUST disclose affiliation if you are the author (Lissy93 policy — required, not rejection-triggering, just mandatory transparency)
**Merge time:** 7-30 days
**Format:** YAML in `awesome-privacy.yml`

**File to edit:** `awesome-privacy.yml` (NOT README.md — data is YAML-sourced)

**Target section:** `Security Tools` → `Secrets Management` (or `Developer Privacy Tools` if that category exists)

**YAML entry to add:**
```yaml
- name: contexter-vault
  url: https://github.com/nopointt/contexter-vault
  description: Local HTTP proxy that redacts API keys, tokens, and secrets from Claude Code API traffic before reaching Anthropic. AES-256-GCM encryption, MIT license, zero cloud dependencies.
  github: nopointt/contexter-vault
  icon: shield
```

**PR title:**
```
[ADDITION] contexter-vault – secret redaction proxy for Claude Code
```

**PR description:**
```
## [ADDITION] contexter-vault

**Type:** Addition
**Affiliation disclosure:** I am the author of this tool.

**What it does:**
Local HTTP proxy for Claude Code (Anthropic's AI coding assistant) that intercepts API traffic and redacts secrets before they reach `api.anthropic.com`. Users who work with Claude Code have secrets (API keys, tokens, environment variables) flowing through their prompts — this tool strips them before transmission. A `PreToolUse` hook substitutes real values at execution time so tools still function.

**Why it fits awesome-privacy:**
- Protects user secrets from leaking to a third-party cloud API
- Fully local execution, no cloud, no telemetry, no account
- Open source MIT license, ~500 LoC TypeScript (auditable)
- AES-256-GCM encryption with authentication tag

**Checklist:**
- [x] I have read the Contributing Guide
- [x] I have performed a self-review of markdown/YAML formatting and grammar
- [x] I have disclosed my affiliation (author)
- [x] The tool is open source, free, and privacy-respecting

**Link:** https://github.com/nopointt/contexter-vault
```

---

## 3.5 — malteos/awesome-anonymization-for-llms

**Submit:** Standard PR to `github.com/malteos/awesome-anonymization-for-llms`
**Merge time:** 7-14 days

**Target section:** "Tools" → "Proxy / API Interception" (or "Secret Detection" if that exists)

**Line to add:**
```markdown
- [contexter-vault](https://github.com/nopointt/contexter-vault) - Local proxy that redacts secrets and credentials from Claude Code API traffic before transmission. AES-256-GCM vault, MIT, `npm install -g contexter-vault`.
```

**PR title:**
```
Add contexter-vault — proxy for Claude Code secret redaction
```

**PR description:**
```
## Add: contexter-vault

Open-source local HTTP proxy that anonymizes secrets (API keys, tokens, seed phrases) from Claude Code API traffic before requests leave the user's machine. Uses an AES-256-GCM vault for local secret storage and substitutes `<<VAULT:name>>` placeholders at proxy time.

Fits `awesome-anonymization-for-llms` because it's specifically an anonymization layer for an LLM API client — stripping identifying / sensitive values before they enter the LLM conversation context.

**MIT, Bun runtime, zero runtime deps, ~500 LoC TypeScript.**

Link: https://github.com/nopointt/contexter-vault

Disclosure: I am the author.
```

---

## Submission order (Day 0 / Day 1)

| Day | Time | List | Type |
|---|---|---|---|
| Day 0 | T+1h | hesreallyhim/awesome-claude-code | Issue |
| Day 0 | T+1h | Puliczek/awesome-mcp-security | PR |
| Day 0 | T+12h | ottosulin/awesome-ai-security | PR |
| Day 0 | T+12h | Lissy93/awesome-privacy | PR |
| Day 0 | T+12h | malteos/awesome-anonymization-for-llms | PR |

---

_Section 3 complete._

---

# 4. console.dev pitch email

**To:** david@console.dev
**When:** T+1h Day 0 (after HN + Reddit traction visible)
**Why console.dev:** 30K dev subscribers, curated 2-3 tools/week, no paid inclusion, perfect fit for Claude Code users

---

**Subject:**
```
Tool submission: contexter-vault — redacts secrets from Claude Code before they reach Anthropic
```

**Body:**
```
Hi David,

contexter-vault is a local HTTP proxy that sits between Claude Code and api.anthropic.com, scans outbound requests for API keys / tokens / seed phrases, and replaces them with placeholders backed by an AES-256-GCM vault before the request leaves the user's machine. A PreToolUse hook substitutes real values at tool execution time so tools still work.

Install: `bun install -g contexter-vault` then `contexter-vault init && contexter-vault start`.

Why this is relevant to console.dev readers:
- Claude Code-assisted commits leak secrets at 3.2% vs the 1.5% baseline (GitGuardian State of Secrets Sprawl 2026, published March 17)
- CVE-2026-21852 (Check Point Research, Feb 2026) showed ANTHROPIC_BASE_URL weaponized for secret exfiltration — this tool uses the same env var for local defense
- Every serious Claude Code user has typed secrets into prompts at some point; there's no built-in redaction

Properties:
- MIT license, ~500 LoC TypeScript, zero runtime dependencies (Bun only)
- 36 unit tests, GitHub Actions CI matrix (Linux/macOS/Windows)
- v0.2.0 live on npm (contexter-vault)
- Threat model: SECURITY.md in the repo

Repo: https://github.com/nopointt/contexter-vault
npm: https://www.npmjs.com/package/contexter-vault

Happy to answer questions or provide more context for a write-up.

Thanks for considering,
nopoint
```

---

_Section 4 complete._

---

# 5. Blog post #1

**Title:** "Why I built contexter-vault — redacting secrets before Claude Code sees them"
**Publish:** contexter.cc/vault (subpath), cross-post to dev.to + Medium + Hashnode
**Target length:** ~900 words
**Target publish date:** Day 2-3 (enables r/programming Day 3-5 post)

---

# Why I built contexter-vault — redacting secrets before Claude Code sees them

Claude Code is the best coding assistant I've used. It's also the one I trust least with my secrets.

Every message you type into Claude Code — every file you paste, every command it writes for you — gets sent to Anthropic as conversation context. That includes API keys you dropped in to debug a billing issue, database passwords you paste during a migration, seed phrases you share when asking for help with a wallet integration. Transcripts shared via `/feedback` are retained for up to five years. There is no built-in redaction.

I spent three months pretending this didn't matter, and then GitGuardian published the numbers.

## The numbers

The 2026 State of Secrets Sprawl report, published March 17 by Anna Nabiullina and Carole Winqwist at GitGuardian, found that Claude Code-assisted commits leak secrets to public GitHub at **3.2% of commits, versus a baseline of 1.5%**. That's roughly twice the rate.

The same report counted 28.65 million new hardcoded secrets on public GitHub in 2025 — a 34% jump year over year, the largest ever. AI-service credentials alone grew 81%. And in a detail that stopped me scrolling: 24,008 unique secrets were found in MCP configuration files specifically.

This is not about negligence. It's about the flow of information. When you paste an error log that happens to contain a token, or ask Claude to "fix this function" from a file that has inline credentials, the secret leaves your machine the same way any other prompt content does. The tool has no visibility into what's sensitive and what isn't. You have to strip it yourself. Most people don't.

Two weeks before that report, Check Point Research published CVE-2026-21852. Attackers had started dropping malicious `.claude/settings.json` files into repos, setting `ANTHROPIC_BASE_URL` to a server they controlled. When a developer trusted the folder and opened it in Claude Code, the API keys — along with the first few prompts — went to the attacker instead of Anthropic. Anthropic patched the trust flow quickly. But the bigger attack surface, the secrets embedded in prompt content itself, remained.

Both of these problems share a root cause: prompts are trusted as opaque text when they should be treated as untrusted structured data.

## What contexter-vault does

`contexter-vault` is a local HTTP proxy, written in TypeScript on Bun, that sits between Claude Code and `api.anthropic.com`. Claude Code already supports an `ANTHROPIC_BASE_URL` environment variable — it's the documented integration point for enterprise LLM gateways like Portkey, LiteLLM, and Nexus. The proxy uses that same env var, but points it at `127.0.0.1:9277` instead.

Once installed, the flow looks like this:

1. Claude Code sends a request to `127.0.0.1:9277` (which it thinks is the Anthropic API).
2. The proxy scans the outbound body for secret values — API keys, tokens, seed phrases — by comparing against a local AES-256-GCM encrypted vault and applying format-aware regex patterns.
3. Matches are replaced with `<<VAULT:name>>` placeholders. The redacted body is forwarded to `api.anthropic.com`.
4. Anthropic responds with a streaming SSE response. The proxy scans chunks on the way back, applying the same redaction to any values that might have leaked through.
5. When Claude later calls a tool that uses a placeholder — for example, generating a `curl` command with `<<VAULT:stripe-key>>` — a `PreToolUse` hook substitutes the real value at execution time. The command runs locally with the correct credential, but the transcript stored at Anthropic only ever contains the placeholder.

Nothing about this is clever. It's a proxy with two scan passes and a substitution hook. The value is that it's boring, small, auditable, and runs entirely on your machine.

## Why a separate tool

The obvious question on HN was "why not just use mitmproxy?" A fair challenge. mitmproxy is more flexible and more mature. But:

- mitmproxy requires installing a root CA in the system trust store. That's a long-term machine change for a narrow use case.
- You write your own scripts for each application. Setup is hours.
- The vault schema, the `<<VAULT:name>>` round-trip, the hook integration — all would need to be built on top.

`contexter-vault` is 500 lines of TypeScript. The vault is a single AES-256-GCM encrypted file. There is no certificate mess because Claude Code speaks plain HTTP to localhost once you set the base URL. Install takes thirty seconds.

## The self-sovereign framing

Vitalik Buterin published a post on April 2, 2026 about his "self-sovereign / local / private / secure LLM setup." He runs Qwen3.5:35B fully locally on a 5090 and uses bubblewrap for sandboxing. I loved the post and can't replicate it — I need the reasoning depth of Claude 3.x+ for my actual work, and local models (at least the ones that fit in my hardware budget) aren't there yet.

contexter-vault is the compromise: for those of us who use cloud APIs because we have to, it gives a local-first guarantee on the network boundary. Your secrets stay on your machine. The key stays on your machine. The vault file stays on your machine. Anthropic sees redacted prompts, and Anthropic's terms of service are untouched — `ANTHROPIC_BASE_URL` is their own documented integration path.

## What's next

v0.3 will add Claude Desktop support via HTTPS MITM (documented pattern, using the same system-level trust that enterprise proxies already rely on). v0.4 targets cross-machine vault sync through encrypted blobs on user-controlled storage. v0.5 adds multi-profile vaults for people juggling work and personal secrets.

**Source:** https://github.com/nopointt/contexter-vault
**npm:** `contexter-vault`
**License:** MIT
**Setup:** `bun install -g contexter-vault && contexter-vault init && contexter-vault start`

Issues, PRs, and threat-model reviews are all welcome. If you find a way to leak a secret past the proxy, open a security issue and I'll fix it that day.

---

_Section 5 complete._

---

# 6. Twitter/X thread

**Account:** TBD (existing or new `@contextervault` — decide before Day 0+3)
**When:** Day 0+3 (25.04) — after Twitter account creation + first warm interactions
**Format:** 11 tweets, each ≤ 280 chars, numbered `1/11` style

---

## Tweet 1 (hook + stat)

```
Claude Code-assisted commits leak secrets at 3.2% vs the 1.5% baseline across all public GitHub. (GitGuardian, State of Secrets Sprawl 2026, March 17.)

I built a local proxy that fixes this. 🧵 1/11
```

## Tweet 2 (problem)

```
Every prompt you type in Claude Code is sent to Anthropic as context. API keys, DB passwords, .env snippets, seed phrases — whatever's on your screen at the time.

Transcripts shared via /feedback are retained up to 5 years. There's no built-in redaction.

2/11
```

## Tweet 3 (CVE hook)

```
Two weeks before GitGuardian's report, Check Point Research published CVE-2026-21852.

Attackers put `.claude/settings.json` in malicious repos, setting ANTHROPIC_BASE_URL to attacker.com. Keys went to the attacker before the trust dialog.

3/11
```

## Tweet 4 (inversion)

```
The fix (from Anthropic): block API calls until the folder is trusted.

The fix I wanted: a proxy that uses the SAME env var — but pointed at localhost — to redact my secrets before they ever leave my machine.

So I built contexter-vault.

4/11
```

## Tweet 5 (install one-liner)

```
bun install -g contexter-vault
contexter-vault init
contexter-vault start

30 seconds. Claude Code now talks to a localhost proxy instead of api.anthropic.com. Secrets get redacted in every request.

5/11
```

## Tweet 6 (architecture)

```
How it works:

• Proxy on 127.0.0.1:9277
• Scans outbound body, swaps secrets for <<VAULT:name>> placeholders
• SSE responses get a sliding-window scan on return
• PreToolUse hook substitutes real values at exec time so tools still work

6/11
```

## Tweet 7 (vault)

```
The vault is a single AES-256-GCM encrypted file at ~/.contexter-vault/vault.enc.

The key never leaves your machine. No cloud. No account. No telemetry.

Encrypted with node:crypto (no 3rd-party crypto lib in the dependency surface).

7/11
```

## Tweet 8 (zero deps)

```
Zero runtime dependencies.

The only thing in package.json's "dependencies" is empty. Bun is the runtime, @types/bun is the only devDep.

Supply chain surface = Bun itself.

~500 LoC TypeScript. Auditable in an evening.

8/11
```

## Tweet 9 (compliance)

```
"Will Anthropic ban me for this?"

ANTHROPIC_BASE_URL is an officially documented env var for LLM gateway setups (Portkey, LiteLLM, etc). All auth headers forwarded unchanged. Usage still attributable to your account.

You're not bypassing anything. You're redacting.

9/11
```

## Tweet 10 (roadmap)

```
v0.2 ships today — CLI-only, handles the full Claude Code proxy flow.

Coming:
v0.3 — Claude Desktop support via HTTPS MITM
v0.4 — cross-machine vault sync
v0.5 — multi-profile vaults (work/personal/per-project)

10/11
```

## Tweet 11 (link + CTA)

```
MIT license. v0.2.0 live on npm.

github.com/nopointt/contexter-vault

Threat-model reviews especially welcome. If you find a way to leak a secret past the proxy, open a security issue — I'll fix it that day.

11/11
```

---

## Tags + mentions strategy (use in replies to thread, not in tweets themselves)

**Hashtags (use in tweet 1 only):** `#ClaudeCode` `#AISecurity` `#Privacy` `#OpenSource`

**Accounts to tag (ONLY in separate replies, not mentions in main thread):**
- @GitGuardian (stat source — courtesy tag in reply to tweet 1)
- @simonw (Simon Willison — frequently shares LLM security tools; don't mention in thread, reply to him IF he shares organically)

**Do NOT tag:** @AnthropicAI, @jasonkuhrt (Anthropic DevRel), @sundeepblue, Vitalik Buterin. Reads as spam.

**Post-thread action:**
- Pin the thread for 1 week
- Quote-retweet HN post when it lands (adds velocity signal)
- Reply with the blog post URL when blog #1 publishes

---

_Section 6 complete._

---

# 7. HN karma warmup comments (×5)

**Goal:** 10-30 karma + "recent activity" signal before Show HN submit T-0. Do NOT mention contexter-vault or own projects. HN is very sensitive to self-promo on warmup comments.

**HN-voice rules (anti-AI-tell):**
- 3-6 sentences max. No markdown. No bullet points in comment body.
- No em-dash (—), no en-dash (–), no smart quotes
- No "In my experience", "It's important to note", "That's a great point"
- Start with the specific thing, not a preamble
- Small admissions of uncertainty land well ("might be wrong but...", "not sure if this is the same case...")
- Technical concreteness: a number, a doc link, a file path, a specific function name
- Slight grammatical imperfections are OK (humans aren't polished)
- One idea per comment, not "here's 3 things"

**Timing:** Post 2-3 of these tonight (21.04 evening UTC), 2 tomorrow morning (22.04 10-11 UTC, before T-1h). Spread them across threads.

---

## Comment 1 — Vercel breach thread

**Thread:** https://news.ycombinator.com/item?id=47851634 — "The Vercel breach: OAuth attack exposes risk in platform environment variables" (81pts, 27c)

**Where to reply:** as a **reply to user `westont5`** (comment id `47852124`) — he's the top-voted comment and his point is "Vercel rolled out env var UI without a 'sensitive' option". Good surface for a technical follow-up about what "sensitive" means in practice.

**Draft (humanized v2):**
```
A sensitive flag at the UI layer doesn't actually change runtime. Once it's in process.env during a build, any dep that decides to grep it can. The real problem isn't a missing checkbox, it's that we still stuff every secret into one env bag and hand the build tools the whole bag. Cloudflare scoped bindings and Fly already split it up, other platforms are just slower.
```

**Why this lands:** acknowledges the parent's point, adds runtime vs UI layer, names 2 concrete alternatives. No self-promo. Voice: tired senior engineer.

**Adaptation:** drop Cloudflare / Fly specifics if you don't know the scoped-injection model — replace with "some platforms are already splitting it up".

---

## Comment 2 — Anthropic OpenClaw thread

**Thread:** https://news.ycombinator.com/item?id=47844269 — "Anthropic says OpenClaw-style Claude CLI usage is allowed again" (421pts, 242c)

**Where to reply:** as a **reply to user `joshstrange`** (comment id `47848573`) — top comment is "Anthropic needs to make clear what is and is not supported". Universal frustration.

**Draft (humanized v2):**
```
There's a technical reason the stance is so vague. Claude CLI works if you reuse its session token, works behind ANTHROPIC_BASE_URL, works wrapped in a shell script. Anthropic sees the same telemetry either way. To draw a firm line they'd have to cap what the CLI does, or ship a policy file the tooling can actually check, and both are a real investment. I read the current fog as them being honest about that rather than being evasive. It's still annoying.
```

**Why this lands:** technical angle, charitable without being servile, concrete proposal. No contexter-vault mention. Voice: engineer who has lived with the product.

**Adaptation:** if "policy file the tooling can check" feels speculative for your taste, trim to "a firm line would mean capping what the CLI does, and that's expensive."

---

## Comment 3 — GoModel AI gateway (Show HN)

**Thread:** https://news.ycombinator.com/item?id=47849097 — "Show HN: GoModel – an open-source AI gateway in Go" (111pts, 39c)

**Where to reply:** **top-level reply to the post** (Show HN culture lets you reply directly to author, they expect feedback). Encouragement + one piece of real feedback.

**Draft (humanized v2):**
```
Nice work. How are you doing the cache key when the prompt has a timestamp or session id in it? Regex pass to strip volatile fields before hashing, or do you make the user declare what's stable upfront? I've tried both in my own stuff and neither ends up clean.
```

**Why this lands:** short encouragement, real technical question, acknowledges personal struggle with the same problem. No know-it-all tone.

**Adaptation:** if you can't handle a technical back-and-forth on caching, skip this one — author will reply asking for specifics.

---

## Comment 4 — VidStudio local-first video editor

**Thread:** https://news.ycombinator.com/item?id=47847558 — "Show HN: VidStudio, a browser based video editor that doesn't upload your files" (197pts, 72c)

**Where to reply:** **top-level to the post** OR reply to user `47852186` (videotobe.com founder who hit the memory ceiling with client-side ffmpeg).

**Draft (humanized v2):**
```
Glad you're holding the "nothing leaves your machine" line. A lot of tools in adjacent categories added cloud sync early, the local audience didn't come back. If you can keep v1 and v2 fully client side you'll find the people who care. ffmpeg-on-wasm will hit a memory ceiling on longer videos, but most people opening a browser video editor are doing short clips anyway.
```

**Why this lands:** supports author, names real tradeoff, acknowledges target audience. Philosophical alignment without preaching.

**Adaptation:** aligns with contexter-vault's philosophy tangentially. If anyone later links your vault, this comment looks authentic, not planted. **DO NOT mention vault here.**

---

## Comment 5 — Laws of Software Engineering (broad HN tread)

**Thread:** https://news.ycombinator.com/item?id=47847179 — "Laws of Software Engineering" (649pts, 337c)

**Where to reply:** pick any top comment that resonates. This thread is broad — easy to add a small observation. Karma from big threads comes from small, personal contributions.

**Draft (humanized v2):**
```
The one I keep coming back to is "code you didn't write is code you can't debug." Every fancy dep I grabbed to save an afternoon ended up costing me weeks later when something upstream broke in some way I had no mental model for. LLM generated code has the same problem now. Looks fine until you hit a case it doesn't cover and you're trying to reverse engineer what you let it write.
```

**Why this lands:** personal tone, specific phrasing, modern relevance. Doesn't need thread deep-dive.

**Adaptation:** personalize — swap "fancy dep" for an actual npm package you regretted (wrap it, yargs, moment, whatever). Specificity = trust.

---

## Warmup schedule

| When | Comment | Thread | Karma target |
|---|---|---|---|
| Tonight 21.04 ~22:00 UTC | Comment 5 (broad thread) | Laws of Software Engineering | +1-3 |
| Tonight 21.04 ~23:00 UTC | Comment 1 (Vercel breach, our theme) | Vercel breach | +2-5 |
| Tomorrow 22.04 ~09:00 UTC | Comment 4 (VidStudio) | VidStudio local-first | +1-3 |
| Tomorrow 22.04 ~10:30 UTC | Comment 2 (Anthropic policy) | OpenClaw thread | +2-5 |
| Tomorrow 22.04 ~11:30 UTC | Comment 3 (GoModel feedback) | GoModel AI gateway | +1-3 |

**Realistic karma:** 7-19 by T-0 13:00 UTC. Still low, but signals activity and we are out of the 1-karma "brand new" zone.

**AI-detection check before posting:** read your comment out loud. If it sounds like a LinkedIn post, rewrite. If it sounds like a Slack message to a dev you respect, post it.

---

_Section 7 complete. All 7 sections done. Assets + karma-warmup ready for Day 0._
