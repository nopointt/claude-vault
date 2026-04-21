# context-vault-current.md — Working Chronicle
> Append-only · rotates to `context-vault-chronicle.md` at ~80KB

# session-scratch.md
> Closed · Axis · 2026-04-21

<!-- ENTRY:2026-04-21:CLOSE:1:context-vault:context-vault-v1 [AXIS] -->
## 2026-04-21 — сессия 1 CLOSE [Axis]

**Context:** First official session for context-vault project (renamed from claude-vault, elevated to development/). Continuation of V-01 started in previous session 97328fa5, completed in f142c2c4. All V-01 P1-P7 phases + memory infrastructure + 4 orch skills updated.

**Decisions (12 D-V01-XX locked in L3):**
- D-V01-01: Single-direction rename, no backward compat
- D-V01-02: CONTEXT_VAULT_PORT replaces CLAUDE_VAULT_PORT
- D-V01-03: Placeholder format <<VAULT:name>> unchanged
- D-V01-04: Log prefix [context-vault] unified
- D-V01-05: SSE try/catch + synthetic error event + graceful close
- D-V01-06: npm publish as context-vault unscoped
- D-V01-07: Launch channels deferred to V-05
- D-V01-08: Directory at development/context-vault/
- D-V01-09: V-01 internal healing; V-02 supervisor-worker
- D-V01-10: 18 bugs preserved, no silent fixes
- D-V01-11: Old tools/claude-vault/ preserved per G1
- D-V01-12: Memory follows Contexter pattern

**Files changed:**
- `nospace/tools/claude-vault/*` — code rename in-place
- `nospace/development/context-vault/` — full directory copy
- `memory/STATE.md` — 66 lines (new)
- `memory/context-vault-about.md` — L1, 166 lines (new)
- `memory/context-vault-roadmap.md` — L2, 158 lines (new, V-01..V-07)
- `memory/context-vault-v1.md` — L3 V-01 epic, 288 lines (new)
- `memory/context-vault-backlog.md` — L2.5, 233 lines (new, 18 bugs + 18 TD)
- `memory/chronicle/index.md` + `context-vault-current.md` — scaffolding
- `~/.claude/settings.json` — hook paths + ANTHROPIC_BASE_URL
- `~/.claudeignore` — .context-vault/ added
- `~/.claude/commands/{start,close,checkpoint,continue}axis.md` — context-vault support added
- `~/.tlos/axis-active` — switched to context-vault

**Completed:**
- V-01 P1 Directory copy (old preserved per G1)
- V-01 P2 Code rename: v0.2.0 + bin rename + src/* + SSE try/catch (B-04 resolved) + README rewrite
- V-01 P3 External refs (settings.json hooks + ANTHROPIC_BASE_URL, .claudeignore)
- V-01 P4 Memory infrastructure complete
- V-01 P5/P6 Bug + tech debt audit (18 bugs B-01..B-18, 18 TD items)
- V-01 P7 V-02..V-07 epics listed in roadmap
- 4 orch skills updated: context-vault project routing

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
- **Pending manual by nopoint:** (1) mv ~/.claude-vault ~/.context-vault after proxy stopped, (2) GitHub repo rename nopointt/claude-vault → nopointt/context-vault, (3) kill PID 13892 + restart proxy from new development/context-vault/ location, (4) bun publish when P8-P10 done.
- **Parallel scope (contexter) NOT updated.** Contexter Pre-CTX-11 commits (a5eb98a, b1768f8, c3f4033) on origin/main but STATE.md still at session 244. Next contexter session should digest recovery addendum §C.
- **axis-active** now routes to context-vault. Return to contexter via manual edit on next /startaxis.
