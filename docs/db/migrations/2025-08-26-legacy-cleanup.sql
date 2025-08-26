-- Draft migration: legacy cleanup and performance fixes
-- NOTE: Review carefully before applying in dev. Do NOT apply directly to prod.

-- 1) Add covering indexes for foreign keys flagged by advisors
-- Use IF NOT EXISTS to avoid failures if already present

CREATE INDEX IF NOT EXISTS idx_community_interactions_related_raid_id
  ON public.community_interactions (related_raid_id);

CREATE INDEX IF NOT EXISTS idx_leaderboards_user_id
  ON public.leaderboards (user_id);

CREATE INDEX IF NOT EXISTS idx_nubi_sessions_agent_id
  ON public.nubi_sessions (agent_id);

CREATE INDEX IF NOT EXISTS idx_nubi_sessions_room_id
  ON public.nubi_sessions (room_id);

CREATE INDEX IF NOT EXISTS idx_raid_teams_leader_id
  ON public.raid_teams (leader_id);

CREATE INDEX IF NOT EXISTS idx_raids_created_by
  ON public.raids (created_by);

CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id
  ON public.user_achievements (achievement_id);

CREATE INDEX IF NOT EXISTS idx_user_achievements_raid_id
  ON public.user_achievements (raid_id);

-- 2) Drop duplicate indexes (keep a single canonical index)
-- cross_platform_identities: cross_platform_identities_platform_uidx vs uq_cross_platform_identities_platform_user
DO $$
BEGIN
  IF to_regclass('public.cross_platform_identities_platform_uidx') IS NOT NULL
     AND to_regclass('public.uq_cross_platform_identities_platform_user') IS NOT NULL THEN
    -- Keep the first, drop the second
    EXECUTE 'DROP INDEX IF EXISTS public.uq_cross_platform_identities_platform_user';
  END IF;
END $$;

-- session_messages: idx_session_messages_session vs idx_session_messages_session_id
DO $$
BEGIN
  IF to_regclass('public.idx_session_messages_session') IS NOT NULL
     AND to_regclass('public.idx_session_messages_session_id') IS NOT NULL THEN
    EXECUTE 'DROP INDEX IF EXISTS public.idx_session_messages_session_id';
  END IF;
END $$;

-- session_messages: idx_session_messages_sequence vs idx_session_messages_session_seq
DO $$
BEGIN
  IF to_regclass('public.idx_session_messages_sequence') IS NOT NULL
     AND to_regclass('public.idx_session_messages_session_seq') IS NOT NULL THEN
    EXECUTE 'DROP INDEX IF EXISTS public.idx_session_messages_session_seq';
  END IF;
END $$;

-- telegram_raids: idx_telegram_raids_active vs idx_telegram_raids_status_active
DO $$
BEGIN
  IF to_regclass('public.idx_telegram_raids_active') IS NOT NULL
     AND to_regclass('public.idx_telegram_raids_status_active') IS NOT NULL THEN
    EXECUTE 'DROP INDEX IF EXISTS public.idx_telegram_raids_status_active';
  END IF;
END $$;

-- 3) RLS initplan optimization (manual policy edits required)
-- Advisors flag policies evaluating auth.* per row. Replace calls like auth.jwt() with (select auth.jwt()) inside USING/WITH CHECK.
-- This requires inspecting current policy definitions; apply via ALTER POLICY.
-- Example pattern (placeholder; edit to match your policies):
-- ALTER POLICY "Service role bypass" ON public.agents
--   USING ((select auth.uid()) = (select auth.uid()));

-- 4) Multiple permissive SELECT policies on scraped_tweets/scraped_users
-- Consider consolidating duplicate-permission policies per role to reduce overhead.
-- Action plan (manual):
-- - 
--   SHOW POLICIES ON public.scraped_tweets; -- inspect
-- - Create a single SELECT policy per role combining conditions with OR
-- - Drop redundant policies

-- 5) Safety checks (read-only commands to run manually before applying)
-- \d public.leaderboards
-- \d public.session_messages
-- \d public.cross_platform_identities
-- \d public.telegram_raids
-- \d public.nubi_sessions
-- \d public.raids
-- \d public.user_achievements
-- \d public.community_interactions
