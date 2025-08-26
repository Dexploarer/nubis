-- 2025-08-26 Archival and conditional drops for staged/legacy tables (POST SIGN-OFF)
-- Candidates: public.leaderboards, public.nubi_sessions, public.raid_analytics, public.telegram_raids
-- Explicitly EXCLUDES: public.raids (referenced by FKs and code paths)
-- Safety: This script defaults to DRY RUN (no DROP). To actually drop, set do_drop := true in the DO block.

BEGIN;

-- Ensure archive schema
CREATE SCHEMA IF NOT EXISTS archive;

-- Helper function: archive a table, verify dependencies, and optionally drop
-- Usage: PERFORM archive_and_maybe_drop('public', 'leaderboards', false);
CREATE OR REPLACE FUNCTION archive_and_maybe_drop(schemaname text, tablename text, do_drop boolean DEFAULT false)
RETURNS void AS $$
DECLARE
  fqname text := format('%I.%I', schemaname, tablename);
  reg regclass;
  refcount int;
  src_rows bigint := 0;
  archived_rows bigint := 0;
  archive_table text := format('archive.%I__%s', tablename, to_char(now(), 'YYYYMMDD_HH24MISS'));
BEGIN
  SELECT to_regclass(fqname) INTO reg;
  IF reg IS NULL THEN
    RAISE NOTICE 'Table % not present, skipping', fqname;
    RETURN;
  END IF;

  -- Check referencing foreign keys
  SELECT count(*) INTO refcount
  FROM pg_constraint c
  WHERE c.confrelid = reg
    AND c.contype = 'f';

  IF refcount > 0 THEN
    RAISE EXCEPTION 'Table % has % referencing FKs; aborting archival/drop. Remove dependencies first.', fqname, refcount;
  END IF;

  -- Create archive table with full definition
  EXECUTE format('CREATE TABLE %s (LIKE %s INCLUDING ALL)', archive_table, fqname);

  -- Copy data to archive table
  EXECUTE format('INSERT INTO %s SELECT * FROM %s', archive_table, fqname);

  -- Row counts
  EXECUTE format('SELECT count(*) FROM %s', fqname) INTO src_rows;
  EXECUTE format('SELECT count(*) FROM %s', archive_table) INTO archived_rows;

  IF src_rows <> archived_rows THEN
    RAISE EXCEPTION 'Archive rowcount mismatch for %: % (src) vs % (archive). Aborting drop.', fqname, src_rows, archived_rows;
  END IF;

  RAISE NOTICE 'Archived % rows from % into %', src_rows, fqname, archive_table;

  -- Conditional drop
  IF do_drop THEN
    EXECUTE format('DROP TABLE %s', fqname);
    RAISE NOTICE 'Dropped table % after archival', fqname;
  ELSE
    RAISE NOTICE 'Dry run: skipping DROP for % (set do_drop := true to enable)', fqname;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- DRY RUN: set to true only after sign-off
DO $$
DECLARE
  do_drop boolean := false; -- CHANGE TO true ONLY AFTER SIGN-OFF
BEGIN
  PERFORM archive_and_maybe_drop('public', 'leaderboards', do_drop);
  PERFORM archive_and_maybe_drop('public', 'nubi_sessions', do_drop);
  PERFORM archive_and_maybe_drop('public', 'raid_analytics', do_drop);
  PERFORM archive_and_maybe_drop('public', 'telegram_raids', do_drop);
END;
$$;

COMMIT;
