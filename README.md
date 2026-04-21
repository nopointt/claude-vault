# contexter-vault

[![CI](https://github.com/nopointt/contexter-vault/actions/workflows/ci.yml/badge.svg)](https://github.com/nopointt/contexter-vault/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/contexter-vault)](https://www.npmjs.com/package/contexter-vault)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Local proxy that redacts secrets from Claude Code API traffic before they reach Anthropic's servers.

## Problem

Everything you type in Claude Code — including API keys, tokens, and credentials — is sent to Anthropic's API as part of the conversation context. There is no built-in redaction. Transcripts shared via `/feedback` are retained for up to 5 years.

## How it works

```
Claude Code ──► contexter-vault proxy (localhost:9277) ──► Anthropic API
                      │
                      ├─ REQUEST:  scans messages[], replaces secret values
                      │            with <<VAULT:name>> placeholders
                      │
                      └─ RESPONSE: scans SSE stream, redacts any leaked
                                   secret values back to placeholders
```

Secrets are stored locally in an AES-256-GCM encrypted vault (`~/.contexter-vault/vault.enc`). They never leave your machine.

## Install

```bash
bun install -g contexter-vault
```

Requires [Bun](https://bun.sh) runtime (v1.0+).

## Quick start

```bash
# Initialize (creates vault, sets ANTHROPIC_BASE_URL in Claude Code settings)
contexter-vault init

# Add a secret
echo "sk_live_abc123" > ~/.contexter-vault/buffer.txt
contexter-vault add stripe-key

# Start the proxy
contexter-vault start

# Use Claude Code normally — secrets are redacted automatically
claude
```

## Architecture

### Four layers of protection

**1. Proxy (primary)** — intercepts all API traffic via `ANTHROPIC_BASE_URL=http://127.0.0.1:9277`. Scans request payloads and SSE response streams. Replaces real values with `<<VAULT:name>>` placeholders using a sliding window algorithm that handles secrets split across SSE chunks.

**2. UserPromptSubmit hook** — handles `/secret store <name>` commands. Reads the value from `~/.contexter-vault/buffer.txt` (you paste it there), encrypts and stores it, wipes the buffer. The secret value never appears in your typed message.

**3. PreToolUse hook** — when Claude writes a Bash command containing `<<VAULT:name>>`, the hook substitutes the real value at execution time. The real value runs locally but never enters the conversation context.

**4. .claudeignore** — `contexter-vault init` adds `.contexter-vault/`, `*.key`, and `*.enc` to `~/.claudeignore`, preventing Claude's Read tool from accessing vault files directly.

### Encryption

- Algorithm: AES-256-GCM (Node.js native crypto)
- Key: 256-bit random, stored at `~/.contexter-vault/vault.key`
- Each write generates a fresh IV (12 bytes)
- Authentication tag prevents tampering

## Commands

| Command | Description |
|---|---|
| `contexter-vault init` | Create vault, generate key, configure Claude Code |
| `contexter-vault start` | Start proxy server |
| `contexter-vault stop` | Stop proxy server |
| `contexter-vault add <name>` | Add secret from buffer.txt or stdin |
| `contexter-vault remove <name>` | Remove a secret |
| `contexter-vault list` | List stored secrets (masked) |
| `contexter-vault status` | Show vault and proxy status |

## In-session usage

```
# In Claude Code, after proxy is running:
> /secret store my-api-key
# (paste value into ~/.contexter-vault/buffer.txt first)

# Claude can use the placeholder in commands:
> Run: curl -H "Authorization: Bearer <<VAULT:my-api-key>>" https://api.example.com
# The PreToolUse hook substitutes the real value at execution time
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| `CONTEXT_VAULT_PORT` | `9277` | Proxy listen port |
| `ANTHROPIC_BASE_URL` | Set by `init` | Points Claude Code at the proxy |
| `ANTHROPIC_UPSTREAM` | `https://api.anthropic.com` | Upstream API URL (for testing or proxy chains) |

## Security model

### What is protected

- Secret values in your messages are redacted before reaching Anthropic's API
- Secret values in Claude's responses (SSE stream) are redacted
- Vault file is AES-256-GCM encrypted on disk
- Buffer file is wiped immediately after reading

### What is NOT protected

- Secrets typed directly in messages exist briefly in Claude Code's local JSONL log before the proxy processes them on the next API call
- If Claude runs a command that echoes a secret to stdout, the output appears in the tool result (the proxy redacts it on the next API call, but one round-trip may contain it)
- The vault key file (`~/.contexter-vault/vault.key`) is stored in plaintext — protect it with filesystem permissions
- Local Claude Code conversation logs (`~/.claude/projects/`) are not encrypted by this tool

### Compliance

This tool uses two officially documented Claude Code extension points:
- `ANTHROPIC_BASE_URL` — [documented for LLM gateways](https://docs.anthropic.com/en/docs/build-with-claude/claude-code/overview#llm-gateways)
- Hooks (UserPromptSubmit, PreToolUse) — [documented extension system](https://docs.anthropic.com/en/docs/build-with-claude/claude-code/hooks)

All required headers (`anthropic-version`, `anthropic-beta`, `x-api-key`, `X-Claude-Code-Session-Id`) are forwarded unchanged. Usage remains fully attributable to your account.

## Troubleshooting

**Proxy won't start / port already in use**
```bash
contexter-vault stop
contexter-vault start
```
If the PID file is stale, remove it manually: `rm ~/.contexter-vault/proxy.pid`

**"JSON Parse error: Unterminated string" or "socket closed unexpectedly"**
v0.2.0 handles upstream stream interruptions gracefully — the proxy flushes buffered content and emits a clean SSE error event instead of crashing. If you see this on older versions, upgrade.

**Secrets not being redacted**
The proxy caches secrets for 5 seconds. After `contexter-vault add`, wait a moment or send `SIGHUP` to force a cache refresh:
```bash
kill -HUP $(cat ~/.contexter-vault/proxy.pid)
```

**Changes to proxy code not taking effect**
Bun caches modules at process start. After editing contexter-vault source files, you must restart the proxy:
```bash
contexter-vault stop && contexter-vault start
```

**ANTHROPIC_BASE_URL not set**
Run `contexter-vault init` to configure Claude Code settings, or set it manually:
```bash
# In ~/.claude/settings.json, under "env":
"ANTHROPIC_BASE_URL": "http://127.0.0.1:9277"
```

## Migrating from claude-vault

If you used the previous `claude-vault` package:

```bash
# 1. Stop the old proxy
claude-vault stop

# 2. Move your vault data
mv ~/.claude-vault ~/.contexter-vault

# 3. Install the new package
bun install -g contexter-vault

# 4. Update settings.json hook paths if needed
# 5. Start the new proxy
contexter-vault start
```

Your encrypted vault data and keys are fully compatible — no re-encryption needed.

## Prohibited uses

This tool is designed exclusively for protecting credentials and sensitive data. Do not use it to:
- Hide harmful, illegal, or policy-violating content from Anthropic's safety classifiers
- Bypass Anthropic's content moderation or acceptable use policy
- Circumvent rate limiting or authentication
- Share API access across multiple accounts

## License

MIT
