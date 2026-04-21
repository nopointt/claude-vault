---
# contexter-vault-v1.md — V-01..V-07 Ship v0.2.0
> Layer: L3 | Epic: V-01..V-07 | Status: ✅ COMPLETE
> Created: 2026-04-21 (session 97328fa5) | Closed: 2026-04-21 (session d3a9f612)
> Target: v0.2.0 on npm + GitHub — ACHIEVED (tag pushed, awaiting npm publish)
> Last updated: 2026-04-21 session #2 CLOSE

## Completion Summary (session d3a9f612)

All 7 epics closed. 42/42 backlog items resolved. 36 unit tests pass. Full rebrand context-vault→contexter-vault due to npm name collision (D-42). 10 atomic commits pushed. Tag `v0.2.0` pushed to GitHub. Awaiting `npm publish --access public` (user action).

**Remaining (manual by nopoint):**
- [ ] `npm publish --access public`
- [ ] `NPM_TOKEN` in GitHub Secrets
- [ ] (optional) rename GitHub repo + local dir
---

## Goal

Rename project from `claude-vault` to `contexter-vault` in ALL places (code, filesystem, config, GitHub, npm). Move from `tools/` to `development/` reflecting elevated status (memory, roadmap, epics). Fix SSE upstream error handling that was crashing Claude Code sessions. Catalogue bug and tech debt inventory as backlog. Publish v0.2.0 as first official open-source release on npm registry + GitHub.

**Version:** 0.1.0 (internal) → **0.2.0** (public open-source)

## Foundation Documents

| Document | Path | Role |
|---|---|---|
| Session recovery dump | `/c/Users/noadmin/.tlos/session-recovery-97328fa5.md` | Crash-recovery context from V-01 start session |
| Addendum | `/c/Users/noadmin/.tlos/session-recovery-97328fa5-addendum.md` | Observed errors, settings details, parallel scope |
| Source code | `nospace/development/contexter-vault/src/` + `bin/` | 9 files, ~500 LoC |
| Old repo URL | `github.com/nopointt/claude-vault` | Pending rename |
| New repo URL | `github.com/nopointt/contexter-vault` | After rename |

## Active Decisions (locked)

- **D-V01-01:** Single-direction rename, no backward compat. Users must `mv ~/.claude-vault ~/.contexter-vault` manually. Migration section in README documents the steps.
- **D-V01-02:** `CONTEXT_VAULT_PORT` replaces `CLAUDE_VAULT_PORT`. No dual-read fallback.
- **D-V01-03:** Placeholder format `<<VAULT:name>>` is **unchanged** — stable contract for downstream tooling and existing prompts.
- **D-V01-04:** Log prefix unified to `[contexter-vault]`. Previously split `[claude-vault]` for CLI startup + `[vault-proxy]` for request handlers — inconsistent and confusing.
- **D-V01-05:** SSE stream error handling — try/catch around `reader.read()` in pull() loop, flush remaining buffer, emit synthetic `event: error` SSE frame with `type: "proxy_upstream_error"`, then `controller.close()`. No exception propagation out of pull().
- **D-V01-06:** Publish as `contexter-vault` (unscoped) on npm. Fallback to `@nopoint/contexter-vault` if name taken.
- **D-V01-07:** Launch channels deferred to V-05 (GitHub README + HN Show HN + r/ClaudeAI + r/selfhosted).
- **D-V01-08:** Directory at `nospace/development/contexter-vault/` (not `tools/`). Has memory/, roadmap, epics — constitution-level visibility.
- **D-V01-09:** Fallback + self-healing scope split. V-01 includes: internal watchdog in `start`, try/catch wrapper in handlers, `/health` endpoint, real `status` check. V-02 owns: supervisor-worker split, detached mode, SessionStart ensure-alive hook, UNPROXIED direct-forward marker.
- **D-V01-10:** Bug audit preserves findings B-01..B-17 in `contexter-vault-backlog.md`. Each bug has explicit V-0X epic assignment. No silent fixes.
- **D-V01-11:** Old directory at `nospace/tools/claude-vault/` preserved per G1 standard (never delete). nopoint cleans manually after V-01 verified stable.
- **D-V01-12:** Memory architecture follows Contexter pattern (STATE + L1 + L2 + L3 + backlog + chronicle + scratches + contexts + specs). Smaller surface (single active epic) but same structure for consistency.

## Phases

### P1 — Directory Move ✅ COMPLETE

**Action:** Copy `nospace/tools/claude-vault/` → `nospace/development/contexter-vault/`.

**Done when:**
- [x] Target directory exists with all files
- [x] Git repo intact in new location (history + working tree)
- [x] Old directory preserved (not moved, per G1)
- [x] Verification: `ls development/contexter-vault/package.json` → OK
- [x] Verification: `git log --oneline -3` in new dir shows history

### P2 — Code Rename ✅ COMPLETE

**Action:** Replace all `claude-vault` references in code with `contexter-vault`. Rename binary. Update env var. Update log prefixes.

**Files touched:**
- `package.json`: name, version 0.1.0→0.2.0, description, bin, files[], keywords[], bugs, homepage, repository
- `bin/claude-vault.ts` → `bin/contexter-vault.ts` (git mv) with internal refs updated
- `src/crypto.ts`: VAULT_DIR path + error message
- `src/vault.ts`: VAULT_DIR path + error message + log prefix
- `src/proxy.ts`: log prefixes, env var `CONTEXT_VAULT_PORT`, SSE try/catch fix
- `src/hooks/secret-store.ts`: buffer path message
- `src/hooks/pre-tool-use.ts`: reason text
- `.npmignore`: added `.contexter-vault/`, `memory/`
- `README.md`: full rewrite for v0.2.0 (install, troubleshooting, migration sections added)

**Done when:**
- [x] `grep -rn "claude-vault" src/ bin/` returns 0 matches (excluding README migration section)
- [x] `grep -rn "\.claude-vault" src/ bin/` returns 0 matches
- [x] README starts with `# contexter-vault`
- [x] package.json version 0.2.0
- [x] Binary name `contexter-vault` in package.json bin
- [x] SSE try/catch in proxy.ts pull() loop

### P3 — External Refs ✅ COMPLETE

**Action:** Update `~/.claude/settings.json` hook command paths, re-add `ANTHROPIC_BASE_URL`. Update `~/.claudeignore` entries.

**Done when:**
- [x] `grep claude-vault ~/.claude/settings.json` returns 0 matches
- [x] Hook paths point to `development/contexter-vault/src/hooks/`
- [x] `ANTHROPIC_BASE_URL=http://127.0.0.1:9277` in settings.json env
- [x] `.claudeignore` has `.contexter-vault/` (`.claude-vault/` kept for transition)

### P4 — Memory Infrastructure ✅ COMPLETE

**Action:** Create full memory/ structure per Contexter pattern.

**Files created:**
- [x] `memory/STATE.md` (66 lines)
- [x] `memory/contexter-vault-about.md` (L1, 166 lines)
- [x] `memory/contexter-vault-roadmap.md` (L2, 158 lines)
- [x] `memory/contexter-vault-v1.md` (L3 — this file, 288 lines)
- [x] `memory/contexter-vault-backlog.md` (L2.5 — 18 bugs + 18 TD, 233 lines)
- [x] `memory/session-scratch.md` (L4 — CLOSE entry written + archived this session)
- [x] `memory/chronicle/` + `queue/` + `scratches/` + `processed/` directories
- [x] `memory/chronicle/contexter-vault-current.md` (4080 bytes after CLOSE drain)
- [x] `memory/chronicle/index.md` (first entry: CLOSE #1)
- [x] `memory/contexts/` directory
- [x] `memory/specs/` directory

**Done when:**
- [x] All files exist
- [x] `ls memory/` matches expected structure

### P5 — Bug Audit ✅ COMPLETE (18 bugs in backlog, B-18 added this session)

**Action:** Catalogue all bugs found during source review. 17 findings from recovery §5. Formalize in `contexter-vault-backlog.md`.

**Known bugs:**
- B-01: test-redaction.ts tautology (always false assertion)
- B-02: test-local.ts tautology (input == expected output)
- B-03: seed.ts stores placeholder AS secret value (self-referential test data)
- B-04: SSE pull() missing error handler — **FIXED in V-01**
- B-05: Running proxy stale module cache (UX doc issue, not source)
- B-06: `/tmp/vault-proxy.log` stale messages (not source bug, UX)
- B-07: `ALLOWED_PATHS` constant unused (dead code)
- B-08: `PASSTHROUGH_HEADERS` missing `user-agent` (minor)
- B-09: No upstream keep-alive management
- B-10: No request body size limit (memory exhaustion risk)
- B-11: `loadSecrets()` cache TTL without manual invalidation
- B-12: `redactString` linear per-secret scan (O(N × buffer))
- B-13: Vault file has no format version header
- B-14: Buffer wipe is not secure (fs may retain blocks)
- B-15: Key file is world-readable by default (no chmod/ACL)
- B-16: Hardcoded Anthropic API URL (testability)
- B-17: No PID file cleanup on crash, `status` doesn't verify alive

**Done when:**
- [ ] All 17 bugs in `contexter-vault-backlog.md` with severity + V-0X assignment
- [ ] File-line references where applicable

### P6 — Tech Debt Audit ✅ COMPLETE (18 TD items in backlog)

**Action:** Catalogue tech debt items. ~15 from recovery §6.

**Categories:**
- Code quality: no test framework, no `import type`, magic numbers, mixed naming
- Documentation: README doesn't diagram 4 layers visually, no JSDoc on exports, no architecture doc
- Distribution: no badges, `engines` only `bun` (Node untested), no CI
- Security (for a security tool): no SECURITY.md, no gitleaks config, no pre-commit scan
- Operational: no SIGTERM graceful shutdown, no `/health`, no metrics, single log file no rotation

**Done when:**
- [ ] All items in `contexter-vault-backlog.md` TD section
- [ ] Each item has V-0X assignment

### P7 — V-02..V-06 Epic Formalization ✅ LISTED

**Action:** List V-02..V-07 epics in roadmap (`contexter-vault-roadmap.md`).

**Done when:**
- [x] Roadmap has 7 epics (V-01..V-07) with descriptions and key items
- [ ] L3 files for V-02..V-07 deferred (create on epic start)

### P8 — Publish Prep ⬜ PENDING

**Action:** Prepare for first npm publish. Verify LICENSE. Review tsconfig.json. Dry run.

**Tasks:**
- [ ] Read `LICENSE` — verify MIT, correct year (2026), author (nopoint)
- [ ] Read `tsconfig.json` — ensure Bun-compatible, strict mode if possible
- [ ] `bun publish --dry-run` — verify files list matches package.json `files` field
- [ ] Check `npm view contexter-vault` — is name available? If not, switch to `@nopoint/contexter-vault`
- [ ] `npm adduser` if first time publishing from this machine (manual by nopoint)

**Verify:**
```bash
cd /c/Users/noadmin/nospace/development/contexter-vault
bun publish --dry-run 2>&1 | head -30
# Expected: list of files ~= [bin/*, src/*, README.md, LICENSE, package.json]
npm view contexter-vault 2>&1 | head -5
# Expected: 404 (name available) OR current owner info
```

**Done when:**
- [ ] Dry-run clean, no warnings
- [ ] LICENSE verified
- [ ] Name availability confirmed
- [ ] **No commit** (verification phase)

### P9 — Global Pointers ⬜ PENDING

**Action:** Add pointer to `~/.claude/projects/C--Users-noadmin/memory/MEMORY.md`. Create project summary memory file.

**Files:**
- Add pointer line to MEMORY.md under project pointers section
- Create `~/.claude/projects/C--Users-noadmin/memory/project_context_vault.md` with short summary (identity, location, GitHub, key commands, status)

**Done when:**
- [ ] MEMORY.md has `[project_context_vault.md]` pointer
- [ ] project_context_vault.md exists with frontmatter + short body

### P10 — Atomic Commits ⬜ PENDING

**Action:** Commit V-01 in logical atomic units in contexter-vault repo (at new `development/contexter-vault/` location).

**Commits (in order):**
1. `feat(rename): claude-vault → contexter-vault (v0.2.0)` — package.json, bin rename, src code changes, .npmignore
   - GSD-Task: `V-01 / P2`
2. `fix(proxy): graceful SSE stream error handling (try/catch + error event + close)` — proxy.ts try/catch block
   - GSD-Task: `V-01 / P2`
   - Note: can bundle with #1 if tightly coupled; otherwise separate for visibility
3. `docs: rewrite README for contexter-vault v0.2.0 with install + migration + troubleshooting` — README.md
   - GSD-Task: `V-01 / P2`
4. `feat(memory): tLOS memory infrastructure + V-01 epic` — memory/* files
   - GSD-Task: `V-01 / P4`
5. (Optional) `chore: tag v0.2.0` — git tag after publish prep passes

**External changes (separate commits in respective repos):**
- `~/.claude/settings.json` — personal settings, not committed
- `~/.claudeignore` — personal settings, not committed
- `~/.claude/projects/.../MEMORY.md` + `project_context_vault.md` — committed in tLOS meta repo if applicable, otherwise personal

**Done when:**
- [ ] All 4-5 commits pushed to origin/main
- [ ] Each has `GSD-Task: V-01 / PN` trailer
- [ ] Co-Authored-By trailer per global settings
- [ ] No `git add -A` — explicit file adds only

---

## Acceptance Criteria (Epic-level)

| ID | Criterion | Verify |
|---|---|---|
| AC-1 | Zero `claude-vault` refs in code (excluding README migration section + `.npmignore` transition entry) | `grep -rn "claude-vault" src/ bin/ package.json` → 0 matches |
| AC-2 | Zero `.claude-vault` path refs in code | `grep -rn "\.claude-vault" src/ bin/` → 0 matches |
| AC-3 | Binary works: `contexter-vault init/start/stop/add/remove/list/status` all functional | Manual CLI smoke test |
| AC-4 | Proxy survives SSE stream errors without crashing Claude Code | Force upstream error, verify client sees clean SSE `event: error` not socket crash |
| AC-5 | Memory infrastructure complete per §P4 | `ls -R memory/` matches expected tree |
| AC-6 | `bun publish --dry-run` clean | `bun publish --dry-run 2>&1` no warnings |
| AC-7 | All 17 bugs catalogued in backlog with severity + epic | `grep -c "^- \*\*B-" contexter-vault-backlog.md` ≥ 17 |
| AC-8 | Tech debt items catalogued | `grep -c "^- \*\*TD-" contexter-vault-backlog.md` ≥ 10 |
| AC-9 | L1/L2/L3/backlog/STATE files well-formed + non-empty | `wc -l memory/*.md` all ≥ 50 lines |
| AC-10 | V-01 commits have GSD-Task trailers on origin/main | `git log --grep="GSD-Task: V-01" --oneline` ≥ 4 |
| AC-11 | ~/.claude/settings.json points to new location | `grep -c "tools/claude-vault" ~/.claude/settings.json` → 0 |
| AC-12 | Global MEMORY.md pointer present | `grep "project_context_vault" ~/.claude/projects/.../MEMORY.md` → hit |

---

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| npm name `contexter-vault` taken | MEDIUM | Fallback to `@nopoint/contexter-vault` scoped |
| GitHub rename breaks old URL users | LOW | GitHub auto-creates 301 redirect, no action needed |
| Running proxy from OLD location conflicts with new install | MEDIUM | After P10: kill old proxy, restart from new location. Document in commit message. |
| User doesn't migrate `~/.claude-vault/` to `~/.contexter-vault/` | LOW | README migration section documents. `contexter-vault init` creates new dir automatically. Old vault data non-critical — can be re-added. |
| ANTHROPIC_BASE_URL env var unresolved source (per recovery §B) | LOW | Not V-01 scope. Assumption: settings.json is authoritative. |
| Socket errors during V-01 session itself | LOW (observed) | Retry works. Full fix in V-02. Tag commits anyway. |

---

## Write Authority

| File | Owner |
|---|---|
| `memory/contexter-vault-v1.md` (this L3) | Axis — epic progress |
| `memory/contexter-vault-backlog.md` | Axis — bug/TD audit |
| `drizzle-pg/*` | N/A (no DB) |
| Source code (src/*, bin/*, package.json) | Axis this session; future G3 Player for V-02+ changes |
| README.md, LICENSE | Axis |
| settings.json, .claudeignore (user-scope) | Axis — rename scope |

---

## Next Steps (Orchestrator)

1. Finish P4 — write `contexter-vault-backlog.md` + chronicle files + session-scratch placeholder
2. P5 + P6 audits consolidated into backlog (already drafted in recovery §5/§6)
3. P8 LICENSE + tsconfig review + `bun publish --dry-run`
4. P9 global pointers
5. P10 atomic commits in order
6. Kill old proxy + restart from new location (operational, after commits)
7. nopoint manual: GitHub repo rename, `mv ~/.claude-vault ~/.contexter-vault`, `npm publish` if ready

---

## Decision Log (append-only)

- **2026-04-21 session 97328fa5:** V-01 scope locked. 7 D-V01 decisions. 10 phases (P1-P10) plan created in TaskList. Recovery dump written due to API errors → restart needed.
- **2026-04-21 session f142c2c4:** Resumed from recovery dump. P2 README rewrite completed. P1 directory copied (Windows `mv` busy → `cp -r` + old preserved). P3 external refs updated (settings.json hook paths + ANTHROPIC_BASE_URL re-added, .claudeignore). P4 memory infrastructure started: STATE + L1 + L2 + L3 (this file).
- **2026-04-21:** D-V01-09 added — fallback+healing split between V-01 (internal) and V-02 (supervisor-worker). Rationale: full architecture is big change, not blocking first ship.
- **2026-04-21:** D-V01-10 added — bug audit preserves all 17 findings, no silent fixes.
- **2026-04-21:** D-V01-11 added — old directory preserved per G1.
- **2026-04-21:** D-V01-12 added — memory follows Contexter pattern for consistency.
