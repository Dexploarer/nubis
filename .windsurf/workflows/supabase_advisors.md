---
description: Supabase Advisors workflow (inspect, remediate) tailored to NUBI
auto_execution_mode: 3
---

# Supabase Advisors (NUBI)

Use Supabase Advisors via Cascade MCP to surface security and performance findings and apply fixes.

## Slash usage
- Invoke: `/supabase_advisors`
- Examples:
  - `/supabase_advisors type=performance`
  - `/supabase_advisors type=security`

## Inputs
- type (optional): performance | security (default: both)
- projectId (optional): defaults to `nfnmoqepgjyutcbbaqjg`

## 1) What this does
- Cascade queries advisors for your project
- Summarizes key findings
- Proposes SQL or policy changes

## 2) Common findings and fixes (from your project)
- Unindexed foreign keys → add indexes
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

- Duplicate indexes → drop extras, keep canonical
```sql
DROP INDEX IF EXISTS public.idx_session_messages_session; -- if duplicate of session_id
DROP INDEX IF EXISTS public.idx_session_messages_sequence; -- if duplicate of session_seq
DROP INDEX IF EXISTS public.idx_telegram_raids_active; -- if duplicate of status_active
DROP INDEX IF EXISTS public.cross_platform_identities_platform_uidx; -- keep uq_* version
```

- RLS initplan perf → use SELECT form in policies
```sql
-- Replace auth.* calls with SELECT wrappers
-- USING (auth.role() = 'authenticated')
-- becomes
-- USING ((SELECT auth.role()) = 'authenticated')
```

- Multiple permissive policies → consolidate by role+action per table

## 3) Apply changes
- Prefer a migration file checked into your repo. Keep reversible.
- For immediate fixes, apply using SQL console or request Cascade to run a controlled migration.

## 4) Re-check advisors
- After changes, run this workflow again to confirm lints are resolved.

## 5) Turbo checks (safe to auto-run)
// turbo
1. Print project URL and presence of anon key (not the value)
```bash
set -o allexport; source ./.env 2>/dev/null || true; set +o allexport;
echo "SUPABASE_URL=${SUPABASE_URL:+SET}"; echo "SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY:+SET}"
```

## Notes
- Never expose service role key in client contexts.
- Validate changes in staging before production.

## References
- `../knowledge/supabase_rules.md`
- `../rules/performance-guidelines.md`
