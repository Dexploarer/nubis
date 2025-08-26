---
description: Supabase database workflow tailored to NUBI project (env, health, advisors, migrations)
auto_execution_mode: 3
---

# Supabase Database (NUBI)

Environment-aware DB workflow using your Supabase project `nfnmoqepgjyutcbbaqjg`.

## Slash usage
- Invoke: `/supabase_database`
- Example: `/supabase_database projectId=nfnmoqepgjyutcbbaqjg applyMigrations=false`

## Inputs
- projectId (optional): defaults to `nfnmoqepgjyutcbbaqjg`
- applyMigrations (optional): true|false (default: false)
- schema (optional): default `public`

## 1) Env and connection
- Ensure `.env` contains:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-side only; never ship to clients)
  - Optional: `SUPABASE_TRANSACTION_POOLER_URL`, `SUPABASE_SESSION_POOLER_URL`
- Verify env is loaded by your runtime (Bun/Node) and edge functions (Deno) separately.

## 2) Project introspection (Cascade MCP)
- Cascade fetches project details:
  - Project: `nubi` (ID: `nfnmoqepgjyutcbbaqjg`)
  - Advisors: security/performance suggestions are available
  - Notable tables in `public` (subset): `agents`, `memories`, `sessions`, `session_messages`, `scraped_tweets`, `scraped_users`, `leaderboards`, `raid_analytics`, `raids`, `raid_teams`, `participants`, etc.
- If you want to re-run introspection, ask: "Run Supabase advisors again".

## 3) Health checks
- Presence of critical tables (examples):
  - `agents` (RLS enabled), `sessions`, `session_messages`, `memories`
  - `scraped_tweets`, `scraped_users`, `raid_analytics`, `leaderboards`
- RLS policies exist for public tables. Ensure correct roles and no overly permissive policies.
- Connection: validate read on a low-risk table using server-side service key.

## 4) Advisor-driven improvements (SQL templates)
- Unindexed foreign keys (add indexes):
```sql
-- leaderboards.user_id
CREATE INDEX IF NOT EXISTS idx_leaderboards_user_id ON public.leaderboards(user_id);
-- nubi_sessions.agent_id, nubi_sessions.room_id
CREATE INDEX IF NOT EXISTS idx_nubi_sessions_agent_id ON public.nubi_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_nubi_sessions_room_id ON public.nubi_sessions(room_id);
-- raid_teams.leader_id
CREATE INDEX IF NOT EXISTS idx_raid_teams_leader_id ON public.raid_teams(leader_id);
-- raids.created_by
CREATE INDEX IF NOT EXISTS idx_raids_created_by ON public.raids(created_by);
-- user_achievements.achievement_id, user_achievements.raid_id
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_raid_id ON public.user_achievements(raid_id);
-- community_interactions.related_raid_id
CREATE INDEX IF NOT EXISTS idx_community_interactions_related_raid_id ON public.community_interactions(related_raid_id);
```

- Duplicate indexes (drop extras; keep a single canonical index):
```sql
-- session_messages: choose canonical names to keep, drop duplicates if present
DROP INDEX IF EXISTS public.idx_session_messages_session; -- if duplicate of session_id
-- keep: idx_session_messages_session_id
DROP INDEX IF EXISTS public.idx_session_messages_sequence; -- if duplicate of session_seq
-- keep: idx_session_messages_session_seq

-- telegram_raids: drop one of the duplicate active-status indexes
DROP INDEX IF EXISTS public.idx_telegram_raids_active;
-- keep: idx_telegram_raids_status_active

-- cross_platform_identities: drop one duplicate
DROP INDEX IF EXISTS public.cross_platform_identities_platform_uidx;
-- keep: uq_cross_platform_identities_platform_user
```

- RLS initplan optimization (example replacement):
```sql
-- Replace auth.* in policies with SELECT form to avoid per-row re-evaluation
-- Example pattern:
-- USING (auth.role() = 'authenticated')
-- becomes
-- USING ((SELECT auth.role()) = 'authenticated')
```

- Multiple permissive policies: consolidate policies by role+action when possible.

## 5) Apply migrations (optional)
- Prefer applying via Supabase migrations repo. Alternatively, Cascade can run one-off migration SQL.
- To apply now, set `applyMigrations=true` when you trigger this workflow and provide approval.

## 6) Turbo checks (safe to auto-run)
// turbo
1. Print current critical env vars presence (not their values)
```bash
set -o allexport; source ./.env 2>/dev/null || true; set +o allexport;
for v in SUPABASE_URL SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY; do
  if [ -n "${!v}" ]; then echo "${v}=SET"; else echo "${v}=MISSING"; fi; done
```

## Troubleshooting
- 403/401 from RPC/REST: verify RLS policies and token type (anon vs service role).
- Timeouts: consider using pooler URLs for high concurrency or long-lived sessions.
- Migration errors: run statements individually to find offending object/index.

## References
- Supabase advisors: performance issues reported for your project (see `/supabase_advisors`).
- RLS best practices: https://supabase.com/docs/guides/database/postgres/row-level-security
- Indexing FKs: https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys
