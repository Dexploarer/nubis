# Off-hours Apply Plan (Dry-run first, then enable flags post sign-off)

This plan executes guarded migrations during a low-traffic window. Start with a dry-run that is non-destructive (copy-only archival, preview-only RLS rewrites). After explicit sign-off, toggle flags and perform the apply.

- Target project: nubi (project_id: nfnmoqepgjyutcbbaqjg)
- Connection: `$SUPABASE_DB_URL` (Postgres URL)

## 0) Prereqs
- Ensure `$SUPABASE_DB_URL` is set and `psql` is installed.
- Confirm latest backups/PITR are healthy (Supabase dashboard > Database > Backups).
- Announce maintenance window and freeze schema changes.

## 1) Pre-apply checks (before the window)
- Capture advisors (before) and save to `docs/db/advisors/DATE-before-*.md`.
- Capture index usage baseline snapshot:
  ```bash
  bash scripts/db/capture-index-snapshot.sh
  ```

## 2) Dry-run window (non-destructive)
- All of the following files default to safe preview/copy modes:
  - `docs/db/migrations/2025-08-26-rls-rewrite-auth-select.sql` (apply_changes := false)
  - `docs/db/migrations/2025-08-26-archive-sessions-fk-safe.sql` (do_drop := false)
  - `docs/db/migrations/2025-08-26-archival-and-drops.sql` (do_drop := false)

- Run dry-run helper:
  ```bash
  bash scripts/db/dry-run-plan.sh
  ```
  Outputs are saved under `docs/db/logs/<UTC_ISO>/...`.

- Review NOTICE output and planned ALTER statements for RLS. Confirm child-first archival notices for `public.nubi_session_messages` → `public.nubi_sessions`.

## 3) Enable flags post sign-off
- After review and explicit approval, update the following in-place and commit the changes:
  - In `2025-08-26-rls-rewrite-auth-select.sql`: `apply_changes := true`.
  - In `2025-08-26-archive-sessions-fk-safe.sql`: `do_drop := true`.
  - In `2025-08-26-archival-and-drops.sql`: `do_drop := true`.

## 4) Apply window (destructive where flagged)
- Manual trigger required. Ensure flags are enabled (see step 3), then run with explicit confirmation:
  ```bash
  OFFHOURS_CONFIRM=YES bash scripts/db/apply-plan.sh
  ```
  The script will refuse to run without `OFFHOURS_CONFIRM=YES`, will sanity-check that flags are enabled before proceeding, and will log output to `docs/db/logs/<UTC_ISO>/...`.

## 5) Post-apply validation
- Re-run advisors (after) and save under `docs/db/advisors/DATE-after-*.md`.
- Verify no remaining FKs referencing dropped parents; confirm intended tables exist in `archive.*` with expected rowcounts.
- Run index usage snapshot again:
  ```bash
  bash scripts/db/capture-index-snapshot.sh
  ```
- Smoke test application flows that touch sessions and raids.

## 6) Index monitoring window before pruning
- Use `docs/db/index-usage/README.md` guidance and the capture script daily (or at least 2–3 times/week) for 1–2 weeks.
- Prune only indexes with consistently `idx_scan = 0` across the full window, with product sign-off and a rollback note (recreate index if needed).

## Notes
- No dev branch is used due to cost constraints; all steps are dry-run-first on production, then gated by manual sign-off.
