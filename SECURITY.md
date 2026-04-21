# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.2.x   | Yes       |
| < 0.2   | No        |

## Reporting a Vulnerability

If you discover a security vulnerability in context-vault, please report it responsibly:

1. **Do NOT open a public GitHub issue** for security vulnerabilities.
2. Email: danchoachona@gmail.com with subject "context-vault security".
3. Include: description, reproduction steps, impact assessment.
4. Expected response time: 48 hours.

## Security Model

### What context-vault protects

- Secret values in messages sent to Anthropic's API (redacted to `<<VAULT:name>>` placeholders)
- Secret values in streaming SSE responses from Anthropic
- Vault file encrypted with AES-256-GCM on disk

### What context-vault does NOT protect

- Secrets in Claude Code's local JSONL conversation logs (`~/.claude/projects/`)
- Secrets echoed to stdout by tool execution (appears in tool_result for one turn)
- Vault key file (plaintext on disk, protected by filesystem permissions only)
- Secrets in non-Anthropic API traffic (web requests, other tools)
- Side-channel attacks on the proxy process

### Encryption

- Algorithm: AES-256-GCM
- Key: 256-bit random, stored at `~/.context-vault/vault.key`
- IV: 12 bytes, fresh per encryption operation
- Auth tag: 16 bytes (tamper detection)
- Key file permissions: 600 on Unix (enforced by init), warning on Windows

### Known Limitations

- No OS-level secure enclave for key storage (filesystem permissions only)
- Buffer wipe overwrites with random bytes but cannot guarantee SSD/FS block erasure
- No file locking for concurrent access (atomic rename used for write safety)
- Proxy runs on localhost only (127.0.0.1) — not exposed to network
