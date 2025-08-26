# Index Usage Monitoring

Purpose: observe index usage for 1–2 weeks before pruning any “unused index” candidates.

## How to capture a snapshot

1) Run the provided SQL (psql)
```
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f scripts/db/index-usage.sql -P pager=off -A -F "," -q > docs/db/index-usage/$(date -u +%Y-%m-%dT%H%M%SZ)-index-usage.csv
```
- Outputs CSV with columns:
  - snapshot_time, schemaname, table, index, idx_scan, idx_tup_read, idx_tup_fetch, table_est_rows, index_size

2) Commit the snapshot CSV to the repo for audit trail.

## Interpretation
- Focus on indexes with consistently `idx_scan = 0` across the full window.
- Consider table size and growth patterns; extremely small tables may naturally have low scans.
- Archive schema indexes are typically low-usage by design but should be retained until archival strategy is fully settled.

## Decision criteria for pruning
- Zero scans over 1–2 weeks of representative traffic.
- Confirm no upcoming features rely on the index.
- Ensure there is a fallback plan (recreate index quickly if needed).

## Related references
- Advisors “unused index” lint is informational; correlate with live stats before any DDL changes.
- See `docs/db/offhours-apply-plan.md` for safe apply flow.
