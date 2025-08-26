-- 2025-08-26 RLS rewrite: wrap auth.*() calls with (select auth.*()) to avoid per-row initplans
-- Safety: apply_changes defaults to FALSE. When FALSE, the script only reports planned ALTER POLICY statements.
-- Includes: safe timeouts and search_path

BEGIN;

-- Session safety
SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '45s';
SET LOCAL search_path = pg_temp, public; -- safe path first

-- Helper: transform occurrences of auth.fn() -> (select auth.fn()) while preserving ones already wrapped
CREATE OR REPLACE FUNCTION rls_expr_transform(expr text)
RETURNS text AS $$
DECLARE
  protected text;
  tmp text;
  restored text;
BEGIN
  IF expr IS NULL THEN
    RETURN NULL;
  END IF;
  -- Protect already-correct patterns: capture function name to restore precisely
  protected := regexp_replace(
    expr,
    '\(\s*select\s+auth\.([a-zA-Z_][a-zA-Z0-9_]*)\(\)\s*\)',
    '<<PROTECTED_AUTH_CALL:\\1>>',
    'gi'
  );
  -- Replace bare auth.fn() with (select auth.fn()) while avoiding false positives on identifiers ending with 'auth'
  tmp := regexp_replace(
    protected,
    '(^|[^a-zA-Z0-9_])auth\.([a-zA-Z_][a-zA-Z0-9_]*)\(\)',
    '\\1(select auth.\\2())',
    'g'
  );
  -- Restore protected occurrences with their original function names
  restored := regexp_replace(
    tmp,
    '<<PROTECTED_AUTH_CALL:([a-zA-Z_][a-zA-Z0-9_]*)>>',
    '(select auth.\\1())',
    'g'
  );
  RETURN restored;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION rls_expr_transform(text) SET search_path = pg_temp;

-- Iterate policies that reference auth.*()
DO $$
DECLARE
  apply_changes boolean := false; -- CHANGE TO true ONLY AFTER REVIEW
  r RECORD;
  new_qual text;
  new_check text;
  using_clause text;
  check_clause text;
  alter_sql text;
BEGIN
  FOR r IN
    SELECT p.schemaname, p.tablename, p.policyname, p.qual, p.with_check
    FROM pg_policies p
    WHERE (p.qual IS NOT NULL AND p.qual ~ 'auth\\.[a-zA-Z_]+\\(\\)')
       OR (p.with_check IS NOT NULL AND p.with_check ~ 'auth\\.[a-zA-Z_]+\\(\\)')
    ORDER BY p.schemaname, p.tablename, p.policyname
  LOOP
    new_qual := rls_expr_transform(r.qual);
    new_check := rls_expr_transform(r.with_check);

    -- Only proceed if transformation caused any change
    IF COALESCE(new_qual, '') <> COALESCE(r.qual, '') OR COALESCE(new_check, '') <> COALESCE(r.with_check, '') THEN
      using_clause := CASE WHEN new_qual IS NOT NULL THEN format('USING (%s)', new_qual) ELSE '' END;
      check_clause := CASE WHEN new_check IS NOT NULL THEN format('WITH CHECK (%s)', new_check) ELSE '' END;
      alter_sql := format('ALTER POLICY %I ON %I.%I %s %s', r.policyname, r.schemaname, r.tablename,
                          using_clause,
                          CASE WHEN using_clause <> '' AND check_clause <> '' THEN check_clause ELSE check_clause END);

      RAISE NOTICE 'Planned: %', alter_sql;

      IF apply_changes THEN
        -- Build dynamic SQL carefully to avoid extra spaces
        EXECUTE (
          'ALTER POLICY ' || quote_ident(r.policyname) || ' ON '
          || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename)
          || CASE WHEN new_qual IS NOT NULL THEN ' USING (' || new_qual || ')' ELSE '' END
          || CASE WHEN new_check IS NOT NULL THEN ' WITH CHECK (' || new_check || ')' ELSE '' END
        );
        RAISE NOTICE 'Applied: %I on %I.%I', r.policyname, r.schemaname, r.tablename;
      END IF;
    END IF;
  END LOOP;
END;
$$;

COMMIT;
