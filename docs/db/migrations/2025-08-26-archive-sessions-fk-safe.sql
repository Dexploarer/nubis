-- 2025-08-26 Child-first archival for nubi sessions with guarded drop
-- Order: archive child table first, then parent
-- Child:   public.nubi_session_messages
-- Parent:  public.nubi_sessions
-- Safety: do_drop defaults to FALSE; enable only after explicit sign-off

BEGIN;

-- Session safety
SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '30s';
SET LOCAL search_path = pg_temp, public; -- safe path first

-- Ensure archive schema exists
CREATE SCHEMA IF NOT EXISTS archive;

-- Helper: copy-only archival that ignores FK dependencies and never drops
-- Creates archive table as LIKE INCLUDING ALL, copies data, and verifies rowcount
CREATE OR REPLACE FUNCTION archive_copy_only(schemaname text, tablename text)
RETURNS void AS $$
DECLARE
  fqname text := format('%I.%I', schemaname, tablename);
  reg regclass;
  src_rows bigint := 0;
  archived_rows bigint := 0;
  archive_table text := format('archive.%I__%s', tablename, to_char(now(), 'YYYYMMDD_HH24MISS'));
BEGIN
  SELECT to_regclass(fqname) INTO reg;
  IF reg IS NULL THEN
    RAISE NOTICE 'Table % not present, skipping', fqname;
    RETURN;
  END IF;

  EXECUTE format('CREATE TABLE %s (LIKE %s INCLUDING ALL)', archive_table, fqname);
  EXECUTE format('INSERT INTO %s SELECT * FROM %s', archive_table, fqname);

  EXECUTE format('SELECT count(*) FROM %s', fqname) INTO src_rows;
  EXECUTE format('SELECT count(*) FROM %s', archive_table) INTO archived_rows;

  IF src_rows <> archived_rows THEN
    RAISE EXCEPTION 'Archive rowcount mismatch for %: % (src) vs % (archive). Aborting.', fqname, src_rows, archived_rows;
  END IF;

  RAISE NOTICE 'Copy-only archived % rows from % into %', src_rows, fqname, archive_table;
END;
$$ LANGUAGE plpgsql;

-- Lock down function search_path for safety
ALTER FUNCTION archive_copy_only(text, text) SET search_path = pg_temp;

-- Execute child-first archival
DO $$
DECLARE
  do_drop boolean := false; -- CHANGE TO true ONLY AFTER SIGN-OFF
BEGIN
  -- 1) Child first: nubi_session_messages
  IF do_drop THEN
    PERFORM archive_and_maybe_drop('public', 'nubi_session_messages', true);
  ELSE
    PERFORM archive_copy_only('public', 'nubi_session_messages');
  END IF;

  -- 2) Then parent: nubi_sessions
  IF do_drop THEN
    -- With child dropped above, parent should have no remaining referencing FKs
    PERFORM archive_and_maybe_drop('public', 'nubi_sessions', true);
  ELSE
    -- Dry run: copy-only archive even if FKs exist
    BEGIN
      PERFORM archive_copy_only('public', 'nubi_sessions');
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping copy-only archive for public.nubi_sessions due to: %', SQLERRM;
    END;
  END IF;
END;
$$;

COMMIT;
