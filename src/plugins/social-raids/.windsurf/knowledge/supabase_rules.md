---
description: Supabase Database Rules & Best Practices for NUBI (schemas, policies, migrations, performance)
---

# Supabase Database Rules (NUBI)

Applies to the `public` schema and related app schemas. Follow these for safety, performance, and maintainability.

## Core Principles
- Least privilege with RLS; prefer policies over DB-wide grants.
- Idempotent, reversible migrations checked into VCS.
- Index foreign keys and frequent filter columns.
- Separate read vs write paths; use RPC for complex writes.
- Service role key lives only server-side (Edge Functions/servers/CI), never in clients.

## Environment
- Required: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only).
- Optional poolers: `SUPABASE_TRANSACTION_POOLER_URL`, `SUPABASE_SESSION_POOLER_URL` for high-concurrency.

## Schema & Naming
- snake_case for tables/columns; singular or domain-consistent (e.g., `session_messages`).
- Primary keys: `id uuid default gen_random_uuid()` where possible.
- Foreign keys: `REFERENCES <table>(id) ON DELETE <CASCADE|SET NULL>` chosen by lifecycle.
- Timestamps: `created_at timestamptz default now()`, `updated_at timestamptz` with trigger for updates.

## RLS Policies
- Enable RLS on user-facing tables.
- Avoid expensive per-row initplans; wrap `auth.*` in SELECT:
```sql
-- Bad
USING (auth.role() = 'authenticated')
-- Better
USING ((SELECT auth.role()) = 'authenticated')
```
- Consolidate multiple permissive policies by role+action.
- Test policies with representative JWTs (anon, authenticated, service).

## Performance
- Add indexes for FKs and high-selectivity filters:
```sql
CREATE INDEX IF NOT EXISTS idx_leaderboards_user_id ON public.leaderboards(user_id);
CREATE INDEX IF NOT EXISTS idx_nubi_sessions_agent_id ON public.nubi_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_nubi_sessions_room_id ON public.nubi_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_raid_teams_leader_id ON public.raid_teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_raids_created_by ON public.raids(created_by);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_raid_id ON public.user_achievements(raid_id);
CREATE INDEX IF NOT EXISTS idx_community_interactions_related_raid_id ON public.community_interactions(related_raid_id);
```
- Remove duplicates; keep canonical names (e.g., `idx_session_messages_session_id`).
- Use partial indexes for sparse predicates; consider materialized views for heavy aggregations.

## Migrations
- Use Supabase CLI migrations; each change reversible (DROP/CREATE symmetry).
- One feature per migration; include comments and links to tickets.
- Staging-first: apply on a dev branch (MCP branch feature), then merge to prod.
- Data backfills: chunked, with `ANALYZE` after large writes.

## Access Patterns
- Clients use anon key; sensitive writes via RPC with RLS-protected tables.
- Edge/servers use service role; guard by role in RPC and tables.
- Prefer `SECURITY DEFINER` for RPC only when needed; minimize function body and validate inputs.

## Observability & Ops
- Use Advisors regularly (security & performance).
- Monitor Postgres logs for slow queries; add indexes as needed.
- Backups: validate restore path; document RPO/RTO.

## Remediation Cookbook
- Unindexed FK → add index (see Performance).
- Duplicate index → `DROP INDEX IF EXISTS <name>` keeping canonical.
- Expensive RLS initplan → convert to SELECT form.
- Orphaned rows → add FKs with ON DELETE rules; backfill then enforce.
- Long transactions → break into batches; use poolers.
