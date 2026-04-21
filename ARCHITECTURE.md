# Architecture

## Overview

contexter-vault is a local HTTP proxy that sits between Claude Code and the Anthropic API. It intercepts all API traffic on `127.0.0.1:9277`, redacts secret values from requests and responses, and forwards to `api.anthropic.com`.

```
Claude Code  ──HTTP──>  contexter-vault proxy  ──HTTPS──>  Anthropic API
              :9277      (redact secrets)
```

## Components

### Proxy (`src/proxy.ts`)

HTTP server via `Bun.serve()`. Handles two routes:

- `POST /v1/messages` — main chat endpoint. Reads body, redacts secrets, forwards upstream. For streaming (SSE), uses a sliding window buffer to catch secrets split across chunks.
- `POST /v1/messages/count_tokens` — token counting endpoint. Same redact-forward-redact pattern, non-streaming.
- `GET /health` — returns proxy status, version, uptime, loaded secret count.

Secrets are cached in memory with a 5-second TTL. `SIGHUP` invalidates the cache immediately.

### Vault (`src/vault.ts`)

Encrypted key-value store at `~/.contexter-vault/vault.enc`. Uses AES-256-GCM with a 32-byte key stored in `vault.key`.

Format: JSON envelope `{ _version: 1, secrets: { name: value } }` encrypted as a single blob. Backward-compatible with v0 bare-object format.

Writes are atomic: encrypt → write `.tmp` → `renameSync` to final path.

### Crypto (`src/crypto.ts`)

AES-256-GCM with random 12-byte IV per encryption. Packed format: `[IV (12B)] [AuthTag (16B)] [Ciphertext]`.

Key file permissions: `chmod 600` on Unix, warning on Windows.

### CLI (`bin/contexter-vault.ts`)

Commands: `init`, `start`, `stop`, `add`, `remove`, `list`, `status`.

`start` runs a supervisor process that spawns the proxy as a child. On crash, the supervisor restarts with exponential backoff (up to 50 restarts). `SIGTERM`/`SIGINT` are forwarded to the child.

### Hooks (`src/hooks/`)

- `secret-store.ts` — `UserPromptSubmit` hook. Captures `vault:NAME=VALUE` from user input, stores in vault, strips from the prompt.
- `pre-tool-use.ts` — `PreToolUse` hook. Substitutes `<<VAULT:NAME>>` placeholders with actual values in tool call arguments (Write, Edit, Bash, etc.).

## Data Flow

1. User types a prompt in Claude Code
2. `secret-store.ts` hook intercepts `vault:` commands, stores secrets
3. Claude Code sends API request to `127.0.0.1:9277`
4. Proxy loads secrets, replaces actual values with `<<VAULT:NAME>>` placeholders
5. Redacted request forwarded to Anthropic
6. Response received; any leaked secrets in response also redacted
7. Clean response returned to Claude Code
8. `pre-tool-use.ts` substitutes placeholders back to real values in tool calls

## SSE Streaming

For streaming responses, the proxy uses a sliding window:

1. Accumulate chunks in `sseBuffer`
2. When buffer exceeds `maxSecretLen`, redact the entire buffer
3. Emit all but the last `maxSecretLen` bytes (safe prefix)
4. Keep the tail as carryover for the next chunk
5. On stream end, flush and redact the remaining buffer

This ensures secrets split across network chunk boundaries are still caught.
