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
- __Clone & Install__
  - bun install (or npm ci)
- __Env__
  - Copy `.env.template` → `.env`
  - Fill required keys (DB, JWT, API keys)
- __Build & Dev__
  - bun run dev (or npm run dev)

## Branching
- __Feature__: `feat/<scope>-<short-desc>`
- __Fix__: `fix/<scope>-<short-desc>`
- __Chore/Docs__: `chore|docs/<scope>-<short-desc>`

## Implement
- __Actions__: `src/actions/*`
- __Services__: `src/services/*` (extend `Service`)
- __Plugins__: `src/plugins/*` (validate config w/ zod)
- __Characters__: `src/characters/*`

## Quality Gates
- __Lint__: `bun run lint`
- __Typecheck__: `bun run typecheck`
- __Test__: `bun test` (aim ≥80% coverage)
- __Format__: `bun run format`

## Test Strategy
- __Unit__: small, fast, isolated
- __Integration__: plugin/service interactions
- __E2E__: representative flows
- __Matrix__: edge cases & configs

## Commit & PR
- __Commit__: conventional commits (e.g., `feat: add user action`)
- __PR Checklist__
  - [ ] Lint/Typecheck pass
  - [ ] Tests added/updated
  - [ ] Coverage ≥80%
  - [ ] Docs updated (README/changelog)

## Release (summary)
- __Build__: `bun run build`
- __Bundle__: `bun run bundle`
- __Audit__: `npm audit`
- __Tag__: semver tag + changelog

## Deploy (summary)
- __Docker__ (see full doc):
  - Base image: node:18-alpine
  - Copy built `dist/` and `config/`
  - Healthcheck `/health`
- __Env__ `production`:
  - Strong secrets (JWT, DB, REDIS)
  - Flags: ENABLE_RAIDS, ENABLE_MODERATION, etc.

## Turbo steps (safe to auto-run)
// turbo
1. Type-check and lint
```bash
bun run check
```
// turbo
2. Build
```bash
bun run build
```
// turbo
3. Run unit tests
```bash
bun test
```

## Troubleshooting
- __Type errors__: run `bun run typecheck` to pinpoint failing file; ensure TS config matches project
- __Server not starting__: check `.env` keys and port conflicts; verify build artifacts under `dist/`
- __Tests flaky__: isolate with `bun test <pattern>` and increase timeouts for networked tests

## Monitoring
- __Logging__: structured logs, persist in prod
- __Health__: `/health` endpoint
- __Perf__: record and inspect metrics

## Security Quicklist
- __Inputs__: validate & sanitize
- __Secrets__: env only, minimum length 32+
- __Transport__: HTTPS in prod
- __Rate limit__: sensitive actions
- __DB__: parameterized queries only

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
