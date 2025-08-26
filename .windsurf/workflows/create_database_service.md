---
description: Scaffold a database service with proper env validation and tests
auto_execution_mode: 3
---

# Create Database Service

Scaffold a Service that connects to a database and exposes CRUD methods.

## Slash usage
- Invoke: `/create_database_service`
- Example: `/create_database_service service_name=DatabaseService orm=drizzle`

## Parameters
- service_name (required): PascalCase name (e.g., `DatabaseService`)
- orm (optional): `drizzle | prisma | knex | sql` (default: `sql`)
- table (optional): default table/entity name (default: `items`)

## Steps
1) Scaffold service
- Create `src/services/${service_name}.ts` extending your base `Service`
- Implement `init()` to create DB connection from `DATABASE_URL`
- Implement `destroy()` to close connections

2) Env and config
- Ensure `.env` has `DATABASE_URL` and `.env.template` documents it
- Read via `src/config/environment.ts`

3) CRUD methods
- `create`, `getById`, `list`, `update`, `remove`
- Use parameterized queries or ORM abstractions; no raw string interpolation

4) Tests
- Unit tests for CRUD and lifecycle
- Use a test DB/transaction per test; clean up between tests

5) Registration
- Add to any service registry and plugin definitions if applicable

## Turbo steps (safe to auto-run)
// turbo
1. Typecheck + build
```bash
bun run check && bun run build
```

## Quality gates
- Service compiles; init/destroy without unhandled errors
- CRUD methods covered by tests; parameterized queries only
- `DATABASE_URL` present and used; no secrets logged

## References
- `.windsurf/workflows/database_setup.md`
- `.windsurf/rules/elizaos_coding_standards.md`
- `.windsurf/rules/security_protocols.md`
