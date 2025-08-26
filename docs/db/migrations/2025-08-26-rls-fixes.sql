-- 2025-08-26 RLS fixes: remove per-row auth() calls, consolidate duplicates
-- Target tables: public.scraped_tweets, public.scraped_users
-- Rationale:
-- - Replace direct auth.role() checks with role-scoped policies (TO role ... USING true) for initplan safety
-- - Keep a single permissive ALL-commands policy for service_role with USING true, CHECK true
-- - Drop redundant service policy on scraped_tweets that duplicated service_role access

BEGIN;

-- ================================
-- Table: public.scraped_tweets
-- ================================

-- Ensure a single service_role policy that can manage all rows/commands
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'scraped_tweets'
      AND p.polname = 'Service role can manage all scraped tweets'
  ) THEN
    CREATE POLICY "Service role can manage all scraped tweets"
      ON public.scraped_tweets
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  ELSE
    ALTER POLICY "Service role can manage all scraped tweets"
      ON public.scraped_tweets
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- Drop redundant service policy that uses auth.role() filter if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'scraped_tweets'
      AND p.polname = 'Service role can access scraped_tweets'
  ) THEN
    DROP POLICY "Service role can access scraped_tweets" ON public.scraped_tweets;
  END IF;
END
$$;

-- Authenticated users should have a single SELECT policy scoped by role, not by auth.role() expression
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'scraped_tweets'
      AND p.polname = 'Authenticated users can read scraped_tweets'
  ) THEN
    ALTER POLICY "Authenticated users can read scraped_tweets"
      ON public.scraped_tweets
      TO authenticated
      USING (true);
  ELSE
    CREATE POLICY "Authenticated users can read scraped_tweets"
      ON public.scraped_tweets
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END
$$;

-- ================================
-- Table: public.scraped_users
-- ================================

-- Service role: policy should be role-scoped, true/true for all commands
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'scraped_users'
      AND p.polname = 'Service role can access scraped_users'
  ) THEN
    ALTER POLICY "Service role can access scraped_users"
      ON public.scraped_users
      TO service_role
      USING (true)
      WITH CHECK (true);
  ELSE
    CREATE POLICY "Service role can manage all scraped users"
      ON public.scraped_users
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- Authenticated users: SELECT-only policy, role-scoped
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'scraped_users'
      AND p.polname = 'Authenticated users can read scraped_users'
  ) THEN
    ALTER POLICY "Authenticated users can read scraped_users"
      ON public.scraped_users
      TO authenticated
      USING (true);
  ELSE
    CREATE POLICY "Authenticated users can read scraped_users"
      ON public.scraped_users
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END
$$;

-- ================================
-- Tables: public.agents, public.components, public.participants, public.rooms
-- Purpose: Replace per-row auth/current_setting checks with role-scoped policies
-- ================================

-- agents: "Service role bypass" -> role-scoped
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'agents' AND p.polname = 'Service role bypass'
  ) THEN
    ALTER POLICY "Service role bypass"
      ON public.agents
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- components: "Service role bypass" -> role-scoped
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'components' AND p.polname = 'Service role bypass'
  ) THEN
    ALTER POLICY "Service role bypass"
      ON public.components
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- participants: "Service role bypass" -> role-scoped
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'participants' AND p.polname = 'Service role bypass'
  ) THEN
    ALTER POLICY "Service role bypass"
      ON public.participants
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- rooms: "Service role full access" -> role-scoped
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'rooms' AND p.polname = 'Service role full access'
  ) THEN
    ALTER POLICY "Service role full access"
      ON public.rooms
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

COMMIT;
