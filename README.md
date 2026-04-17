# claude-vault

Local proxy that redacts secrets from Claude Code API traffic before it reaches Anthropic's servers.

## Problem

Everything you type in Claude Code — including API keys, tokens, and credentials — is sent to Anthropic's API as part of the conversation context. There is no built-in redaction. Transcripts shared via `/feedback` are retained for up to 5 years.

## How it works

```
Claude Code ──► claude-vault proxy (localhost:9277) ──► Anthropic API
                      │
                      ├─ REQUEST:  scans messages[], replaces secret values
                      │            with <<VAULT:name>> placeholders
                      │
                      └─ RESPONSE: scans SSE stream, redacts any leaked
                                   secret values back to placeholders
```

Secrets are stored locally in an AES-256-GCM encrypted vault (`~/.claude-vault/vault.enc`). They never leave your machine.

## Quick start

```bash
# Install
bun install -g claude-vault

# Initialize (creates vault, sets ANTHROPIC_BASE_URL in Claude Code settings)
claude-vault init

# Add a secret
echo "sk_live_abc123" > ~/.claude-vault/buffer.txt
claude-vault add stripe-key

# Start the proxy
claude-vault start

# Use Claude Code normally — secrets are redacted automatically
claude
```

## Architecture

### Three layers of protection

**1. Proxy (primary)** — intercepts all API traffic via `ANTHROPIC_BASE_URL=http://localhost:9277`. Scans request payloads and SSE response streams. Replaces real values with `<<VAULT:name>>` placeholders using a sliding window algorithm that handles secrets split across SSE chunks.

**2. UserPromptSubmit hook** — handles `/secret store <name>` commands. Reads the value from `~/.claude-vault/buffer.txt` (you paste it there), encrypts and stores it, wipes the buffer. The secret value never appears in your typed message.

**3. PreToolUse hook** — when Claude writes a Bash command containing `<<VAULT:name>>`, the hook substitutes the real value at execution time. The real value runs locally but never enters the conversation context.

### Encryption

- Algorithm: AES-256-GCM (Node.js native crypto)
- Key: 256-bit random, stored at `~/.claude-vault/vault.key`
- Each write generates a fresh IV (12 bytes)
- Authentication tag prevents tampering

## Commands

| Command | Description |
|---|---|
| `claude-vault init` | Create vault, generate key, configure Claude Code |
| `claude-vault start` | Start proxy server |
| `claude-vault stop` | Stop proxy server |
| `claude-vault add <name>` | Add secret from buffer.txt or stdin |
| `claude-vault remove <name>` | Remove a secret |
| `claude-vault list` | List stored secrets (masked) |
| `claude-vault status` | Show vault and proxy status |

## In-session usage

```
# In Claude Code, after proxy is running:
> /secret store my-api-key
# (paste value into ~/.claude-vault/buffer.txt first)

# Claude can use the placeholder in commands:
> Run: curl -H "Authorization: Bearer <<VAULT:my-api-key>>" https://api.example.com
# The PreToolUse hook substitutes the real value at execution time
```

## Security model

### What is protected

- Secret values in your messages are redacted before reaching Anthropic's API
- Secret values in Claude's responses (SSE stream) are redacted
- Vault file is AES-256-GCM encrypted on disk
- Buffer file is wiped immediately after reading

### What is NOT protected

- Secrets typed directly in messages (before proxy processes them) exist briefly in Claude Code's local JSONL log
- If Claude runs a command that echoes a secret to stdout, the output appears in the tool result (the proxy redacts it on the next API call, but one round-trip may contain it)
- The vault key file (`~/.claude-vault/vault.key`) is stored in plaintext — protect it with filesystem permissions
- Local Claude Code conversation logs (`~/.claude/projects/`) are not encrypted by this tool

### Compliance

This tool uses two officially documented Claude Code extension points:
- `ANTHROPIC_BASE_URL` — [documented for LLM gateways](https://code.claude.com/docs/en/llm-gateway)
- Hooks (UserPromptSubmit, PreToolUse) — [documented extension system](https://code.claude.com/docs/en/hooks)

All required headers (`anthropic-version`, `anthropic-beta`, `x-api-key`, `X-Claude-Code-Session-Id`) are forwarded unchanged. Usage remains fully attributable to your account.

## Prohibited uses

This tool is designed exclusively for protecting credentials and sensitive data. Do not use it to:
- Hide harmful, illegal, or policy-violating content from Anthropic's safety classifiers
- Bypass Anthropic's content moderation or acceptable use policy
- Circumvent rate limiting or authentication
- Share API access across multiple accounts

## Requirements

- [Bun](https://bun.sh) runtime
- Claude Code CLI

## License

MIT
