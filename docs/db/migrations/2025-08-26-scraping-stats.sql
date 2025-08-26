-- 2025-08-26 Create scraping_stats to support analytics-engine persistence
-- Safe to run multiple times; uses IF NOT EXISTS and role-scoped RLS

BEGIN;

-- Table
CREATE TABLE IF NOT EXISTS public.scraping_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'analytics-engine',
  total_scraped integer NOT NULL DEFAULT 0,
  processed integer NOT NULL DEFAULT 0,
  errors integer NOT NULL DEFAULT 0,
  notes jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scraping_stats_recorded_at
  ON public.scraping_stats (recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_scraping_stats_source_time
  ON public.scraping_stats (source, recorded_at DESC);

-- RLS
ALTER TABLE public.scraping_stats ENABLE ROW LEVEL SECURITY;

-- Service role: full manage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='public' AND c.relname='scraping_stats' AND p.polname='Service role manage scraping_stats'
  ) THEN
    CREATE POLICY "Service role manage scraping_stats"
      ON public.scraping_stats
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- Authenticated: read-only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='public' AND c.relname='scraping_stats' AND p.polname='Authenticated can read scraping_stats'
  ) THEN
    CREATE POLICY "Authenticated can read scraping_stats"
      ON public.scraping_stats
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END
$$;

COMMIT;
