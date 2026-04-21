# contexter-vault

[![npm](https://img.shields.io/npm/v/contexter-vault)](https://www.npmjs.com/package/contexter-vault)
[![downloads](https://img.shields.io/npm/dw/contexter-vault)](https://www.npmjs.com/package/contexter-vault)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/nopointt/contexter-vault/actions/workflows/ci.yml/badge.svg)](https://github.com/nopointt/contexter-vault/actions/workflows/ci.yml)
[![Bun](https://img.shields.io/badge/runtime-Bun-f9f1e1)](https://bun.sh)

> **Your API keys are in every Claude conversation. contexter-vault redacts them before they leave your machine.**

Local proxy for Claude Code that swaps real secret values for `<<VAULT:name>>` placeholders before traffic reaches Anthropic — and substitutes them back locally only at tool execution time. AES-256-GCM vault. Zero runtime dependencies. Open source.

## Why this exists

Everything you type in Claude Code — DB passwords, API keys, tokens, seed phrases — is sent to Anthropic as conversation context. Transcripts shared via `/feedback` are retained for up to five years. There is no built-in redaction.

contexter-vault sits between Claude Code and the Anthropic API, on your machine only. It swaps real secret values for placeholders in every outgoing message and streaming response, then restores them locally at the moment a tool actually needs them. Secrets never touch Anthropic's infrastructure.

## Install

```bash
bun install -g contexter-vault
contexter-vault init
contexter-vault start
```

That's it. Claude Code now talks to a localhost proxy instead of `api.anthropic.com`. Run `claude` normally.

Requires [Bun](https://bun.sh) runtime (v1.0+). Tested on macOS, Linux, Windows.

## Features

- **Zero runtime dependencies** — single Bun binary
- **AES-256-GCM** encrypted local vault (`~/.contexter-vault/vault.enc`)
- **Transparent** — no workflow change, no Claude Code fork, no Anthropic account relationship
- **SSE sliding-window redaction** — handles secrets split across TCP chunks in streaming responses
- **Supervisor mode** — auto-restarts proxy on crash with exponential backoff
- **Compliant** — uses officially documented `ANTHROPIC_BASE_URL` + hooks extension points
- **MIT license** — no cloud, no account, no telemetry

## How it works

```
┌────────────┐        ┌──────────────────────┐         ┌──────────────────┐
│ Claude Code│ plain  │ contexter-vault      │  HTTPS  │ api.anthropic.com│
│   CLI      ├───────►│ localhost:9277       ├────────►│                  │
└────────────┘  HTTP  │                      │         └──────────────────┘
                      │ REQUEST:  scans body │
                      │   "sk_live_abc" →    │
                      │   "<<VAULT:stripe>>" │
                      │                      │
                      │ RESPONSE: scans SSE  │
                      │   stream, re-redacts │
                      │   any leaked values  │
                      └──────────────────────┘
```

### Four defense layers

| # | Layer | Purpose |
|---|---|---|
| 1 | **Proxy** (primary) | Intercepts request bodies and SSE responses, swaps secret values ↔ placeholders |
| 2 | **UserPromptSubmit hook** | `/secret store <name>` command — reads value from buffer file, encrypts, wipes buffer |
| 3 | **PreToolUse hook** | Substitutes `<<VAULT:name>>` with real value at Bash/Write/Edit execution time |
| 4 | **.claudeignore** | Blocks Claude's Read tool from vault files (`.contexter-vault/`, `*.key`, `*.enc`) |

Full technical details in [ARCHITECTURE.md](ARCHITECTURE.md) · security model in [SECURITY.md](SECURITY.md).

## Quick start

```bash
# 1. Initialize (creates vault, generates key, configures Claude Code settings)
contexter-vault init

# 2. Add your first secret
echo "sk_live_abc123xyz" > ~/.contexter-vault/buffer.txt
contexter-vault add stripe-key
# buffer.txt is wiped immediately after encryption

# 3. Start the proxy
contexter-vault start

# 4. Use Claude Code normally — redaction is automatic
claude
```

Inside Claude Code, use the placeholder form:

```
> Please run: curl -H "Authorization: Bearer <<VAULT:stripe-key>>" https://api.stripe.com/v1/charges
```

The value `sk_live_abc123xyz` is substituted at execution time by the PreToolUse hook. The real value runs locally but never enters the conversation.

## Compared to alternatives

| | contexter-vault | `ANTHROPIC_BASE_URL` + DIY | Formal.ai | mitmproxy + script | llm-interceptor |
|---|---|---|---|---|---|
| Open source | ✅ | ✅ | ❌ (commercial) | ✅ | ✅ |
| Zero runtime deps | ✅ | — | — | ❌ | ❌ |
| Turnkey install | ✅ | ❌ (DIY) | ✅ | ❌ | ❌ |
| Local-only, no cloud | ✅ | ✅ | ❌ | ✅ | ✅ |
| Auto-redaction | ✅ | ❌ | ✅ | manual script | ❌ (monitor only) |
| Hook integration for tool execution | ✅ | — | ❌ | — | — |
| AES-256-GCM local vault | ✅ | — | — | — | — |

## FAQ

**Will Anthropic ban me for using this?**
No. The Anthropic AUP prohibits intercepting traffic *without authorization of the system owner* — you are the system owner of your own machine. Anthropic's own documentation endorses HTTPS inspection proxies (Zscaler, CrowdStrike) with self-signed CAs for enterprise. contexter-vault uses the same approved pattern.

**Performance overhead?**
Typically <5 ms per request. Redaction is O(N × buffer) with first-char early exit. SSE streaming adds ~12 bytes sliding-window buffer carryover per chunk.

**Why not just `ANTHROPIC_BASE_URL` manually?**
That env var only points Claude at a proxy. You still need the redaction logic, the encrypted vault, the hooks, the SSE handler. contexter-vault *is* that logic.

**Works with Claude Desktop?**
Not in this version. v0.2 supports Claude Code CLI only.

**What if the proxy crashes?**
v0.2 includes supervisor mode with auto-restart and graceful SSE error events. Your Claude session sees a clean protocol-level error instead of a socket crash.

**How do I migrate from `claude-vault`?**
```bash
claude-vault stop
mv ~/.claude-vault ~/.contexter-vault
bun install -g contexter-vault
contexter-vault start
```
Vault format is fully compatible — no re-encryption.

## Commands

| Command | Description |
|---|---|
| `contexter-vault init` | Create vault, generate key, configure Claude Code |
| `contexter-vault start` | Start proxy (supervisor mode) |
| `contexter-vault stop` | Stop proxy |
| `contexter-vault add <name>` | Encrypt secret from `buffer.txt` or stdin |
| `contexter-vault remove <name>` | Delete a secret |
| `contexter-vault list` | List secret names (masked preview) |
| `contexter-vault status` | Proxy PID + vault stats |

## Configuration

| Variable | Default | Description |
|---|---|---|
| `CONTEXT_VAULT_PORT` | `9277` | Proxy listen port |
| `ANTHROPIC_BASE_URL` | set by `init` | Points Claude Code at the proxy |
| `ANTHROPIC_UPSTREAM` | `https://api.anthropic.com` | Upstream API URL (testing / proxy chains) |

## Security model

### Protected
- Secret values in outgoing messages (request body)
- Secret values in streaming SSE responses
- Vault file on disk (AES-256-GCM with authentication tag)
- Buffer file wiped with random bytes before truncate

### Not fully protected
- Secrets typed directly in chat exist briefly in Claude Code's local JSONL log before the proxy processes them on the next API call
- If Claude runs a tool that echoes a secret to stdout, the output appears in the tool_result of that turn (redacted on the next API call, but one round-trip may contain it)
- Vault key file is stored in plaintext at `~/.contexter-vault/vault.key`, protected by filesystem permissions (`chmod 600` on Unix)

Full threat model in [SECURITY.md](SECURITY.md).

### Compliance

Uses two officially documented Claude Code extension points:
- [`ANTHROPIC_BASE_URL`](https://docs.anthropic.com/en/docs/build-with-claude/claude-code/overview#llm-gateways) for gateway interception
- [Hooks](https://docs.anthropic.com/en/docs/build-with-claude/claude-code/hooks) for `UserPromptSubmit` and `PreToolUse`

All required headers (`anthropic-version`, `anthropic-beta`, `x-api-key`, `X-Claude-Code-Session-Id`) are forwarded unchanged. Usage is fully attributable to your account.

## Troubleshooting

**Port already in use:** `contexter-vault stop && contexter-vault start`. If PID file is stale: `rm ~/.contexter-vault/proxy.pid`.

**Secrets not redacted:** proxy caches secrets for 5s. Either wait, or send SIGHUP: `kill -HUP $(cat ~/.contexter-vault/proxy.pid)`.

**Code changes not taking effect:** Bun caches modules at process start. Restart proxy after edits.

**`ANTHROPIC_BASE_URL` not set:** run `contexter-vault init`, or set manually in `~/.claude/settings.json` under `"env"`.

## Responsible use

This tool exists to protect credentials from being inadvertently sent to an LLM provider. It is not designed to:
- Hide harmful, illegal, or policy-violating content from Anthropic's safety classifiers
- Bypass Anthropic's acceptable use policy or content moderation
- Circumvent rate limiting or authentication
- Share API access across multiple accounts

Use it for what it says on the tin.

## Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for dev setup, code style, and test requirements. Security issues: please follow [SECURITY.md](SECURITY.md) responsible-disclosure process.

## License

MIT
