# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-04-21

### Added
- Renamed from `claude-vault` to `contexter-vault`
- Supervisor mode with auto-restart on crash (exponential backoff, max 50 restarts)
- SSE stream error handling (graceful close + synthetic error event)
- `idleTimeout: 255` for long-running Anthropic requests
- Process-level error handlers (`uncaughtException` / `unhandledRejection`)
- Graceful shutdown on SIGTERM/SIGINT (proxy + supervisor)
- Supervisor forwards SIGTERM to child proxy process
- Key file permission enforcement (Unix: chmod 600, Windows: warning)
- `Bun.serve` error handler for defense-in-depth
- Outer try/catch in request handlers for clean 502 responses
- `count_tokens` endpoint proxy support

### Changed
- Env var: `CLAUDE_VAULT_PORT` -> `CONTEXT_VAULT_PORT`
- Vault dir: `~/.claude-vault/` -> `~/.contexter-vault/`
- Log prefix unified to `[contexter-vault]`

### Removed
- Dead code: unused `ALLOWED_PATHS` constant

### Fixed
- Socket closed unexpectedly during large context requests (idleTimeout default was 10s)
- Proxy crash on upstream SSE stream abort (unhandled exception in pull())
- Supervisor `stop` command now kills child process (was leaving orphans)

## [0.1.0] - 2026-04-15

### Added
- Initial release as `claude-vault`
- HTTP proxy on 127.0.0.1:9277
- AES-256-GCM encrypted vault storage
- Secret redaction in request bodies and SSE responses
- SSE sliding window algorithm for streaming redaction
- CLI commands: init, start, stop, add, remove, list, status
- Claude Code integration: hooks (UserPromptSubmit, PreToolUse) + .claudeignore
- Placeholder format: `<<VAULT:name>>`
