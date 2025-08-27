---
description: Development Workflow
auto_execution_mode: 3
---

# Development Workflow (Concise)

This is a condensed workflow for day-to-day development. For the comprehensive guide, see `../rules/elizaos_development_workflow.md`.

## Slash usage

- Invoke via: `/development`

## Parameters

- quick (optional): boolean; when true, skip nonessential steps (default: false)

## Setup

- **Clone & Install**
  - bun install (or npm ci)
- **Env**
  - Copy `.env.template` → `.env`
  - Fill required keys (DB, JWT, API keys)
- **Build & Dev**
  - bun run dev (or npm run dev)

## Branching

- **Feature**: `feat/<scope>-<short-desc>`
- **Fix**: `fix/<scope>-<short-desc>`
- **Chore/Docs**: `chore|docs/<scope>-<short-desc>`

## Implement

- **Actions**: `src/actions/*`
- **Services**: `src/services/*` (extend `Service`)
- **Plugins**: `src/plugins/*` (validate config w/ zod)
- **Characters**: `src/characters/*`

## Quality Gates

- **Lint**: `bun run lint`
- **Typecheck**: `bun run typecheck`
- **Test**: `bun test` (aim ≥80% coverage)
- **Format**: `bun run format`

## Test Strategy

- **Unit**: small, fast, isolated
- **Integration**: plugin/service interactions
- **E2E**: representative flows
- **Matrix**: edge cases & configs

## Commit & PR

- **Commit**: conventional commits (e.g., `feat: add user action`)
- **PR Checklist**
  - [ ] Lint/Typecheck pass
  - [ ] Tests added/updated
  - [ ] Coverage ≥80%
  - [ ] Docs updated (README/changelog)

## Release (summary)

- **Build**: `bun run build`
- **Bundle**: `bun run bundle`
- **Audit**: `npm audit`
- **Tag**: semver tag + changelog

## Deploy (summary)

- **Docker** (see full doc):
  - Base image: node:18-alpine
  - Copy built `dist/` and `config/`
  - Healthcheck `/health`
- **Env** `production`:
  - Strong secrets (JWT, DB, REDIS)
  - Flags: ENABLE_RAIDS, ENABLE_MODERATION, etc.

## Turbo steps (safe to auto-run)

// turbo

1. Type-check and lint

```bash
bun run check
```

// turbo 2. Build

```bash
bun run build
```

// turbo 3. Run unit tests

```bash
bun test
```

## Troubleshooting

- **Type errors**: run `bun run typecheck` to pinpoint failing file; ensure TS config matches project
- **Server not starting**: check `.env` keys and port conflicts; verify build artifacts under `dist/`
- **Tests flaky**: isolate with `bun test <pattern>` and increase timeouts for networked tests

## Monitoring

- **Logging**: structured logs, persist in prod
- **Health**: `/health` endpoint
- **Perf**: record and inspect metrics

## Security Quicklist

- **Inputs**: validate & sanitize
- **Secrets**: env only, minimum length 32+
- **Transport**: HTTPS in prod
- **Rate limit**: sensitive actions
- **DB**: parameterized queries only

---

See full guide for examples, code, and templates: `../rules/elizaos_development_workflow.md`.

## References

- `../knowledge/architecture_patterns.md`
- `../knowledge/coding_standards.md`
- `../knowledge/documentation-guidelines.md`
- `../knowledge/template_system.md`
- `../knowledge/memory_system.md`
- `../knowledge/performance_guidelines.md`
- `../knowledge/security_protocols.md`
- `../knowledge/quick_references.md`
- `../rules/elizaos_development_workflow.md`
- `../rules/elizaos_coding_standards.md`
- `../rules/elizaos-architecture-patterns.md`
- `../rules/testing_standards.md`
- `../rules/elizaos_security_protocols.md`
- `../rules/elizaos_template-quick-reference.md`
- `../rules/elizaos_template_system.md`
- `../rules/elizaos_interface_system.md`
- `../rules/elizaos_memory_operational_rules.md`
- `../rules/elizaos_memory_quick_reference.md`
