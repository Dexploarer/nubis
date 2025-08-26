-- Index usage snapshot for monitoring before pruning
-- Usage (psql): psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f scripts/db/index-usage.sql -P pager=off
\timing on

SELECT now() as snapshot_time,
       s.schemaname,
       s.relname  AS table,
       s.indexrelname AS index,
       s.idx_scan,
       s.idx_tup_read,
       s.idx_tup_fetch,
       c.reltuples AS table_est_rows,
       pg_size_pretty(pg_relation_size(s.indexrelid)) AS index_size
FROM pg_stat_user_indexes s
JOIN pg_class c ON c.oid = s.relid
WHERE s.schemaname IN ('public','archive')
ORDER BY s.idx_scan ASC, s.schemaname, s.relname, s.indexrelname;
