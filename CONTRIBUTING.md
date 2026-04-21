# Contributing to contexter-vault

## Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- A Claude Code installation for testing

## Setup

```bash
git clone https://github.com/nopointt/contexter-vault.git
cd contexter-vault
bun install
```

## Development

```bash
# Run proxy directly (no supervisor)
bun run src/proxy.ts

# Run tests
bun run src/test-local.ts
bun run src/test-redaction.ts

# Run CLI
bun run bin/contexter-vault.ts status
```

## Testing with a custom upstream

Set `ANTHROPIC_UPSTREAM` to point to a mock server:

```bash
ANTHROPIC_UPSTREAM=http://localhost:8080 bun run src/proxy.ts
```

## Code Style

- TypeScript strict mode
- No runtime dependencies
- Immutable data patterns (create new objects, don't mutate)
- Functions under 50 lines, files under 400 lines
- Error handling at every level

## Pull Requests

1. Fork the repo and create a branch from `main`
2. Add/update tests if applicable
3. Ensure `bun run src/test-local.ts` passes
4. Describe changes clearly in the PR description

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities. Do not open public issues for security bugs.
