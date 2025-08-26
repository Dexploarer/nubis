---
description: Database setup for Postgres and @elizaos/plugin-sql
auto_execution_mode: 3
---

# Database Setup (Postgres)

Configure Postgres connection and the SQL plugin.

## Slash usage
- Invoke: `/database_setup`
- Example: `/database_setup url=postgres://user:pass@localhost:5432/db sslmode=prefer`

## Parameters
- url (required): Postgres connection string (see formats below)
- sslmode (optional): `disable|allow|prefer|require|verify-ca|verify-full`

## Steps
1) Connection string (official libpq format)
- Format: `postgres://user:password@host:port/dbname?sslmode=require`
- Or: `host=... port=... dbname=... user=... password=... sslmode=...`
- Official docs: https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING

2) Env
- Add to `.env` (and `.env.template`):
```
DATABASE_URL="<your-connection-string>"
```

3) Plugin
- Ensure `@elizaos/plugin-sql` is included in `src/plugins/index.ts`
- Use feature gating if needed, e.g., `features.hasDatabase`

// turbo
4) Health checks
```bash
bun run check && bun run build
```

5) Migrations (optional)
- Choose a tool (Prisma, Drizzle, Knex, SQL files) and integrate with `bun` scripts

## Quality gates
- DATABASE_URL present in `.env` and `.env.template`
- `@elizaos/plugin-sql` registered and build passes
- Health checks succeed without errors

## Troubleshooting
- Auth failures → verify user/password and `pg_hba.conf`
- SSL errors → align `sslmode` with server configuration
- IPv6/hostnames → try `hostaddr` for direct IP or ensure DNS resolves

## References
- Postgres connection strings: https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING
- `../knowledge/coding_standards.md`
- `../knowledge/security_protocols.md`
