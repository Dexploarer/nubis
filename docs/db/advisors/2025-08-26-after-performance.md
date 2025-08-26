# Supabase Advisors – After Apply (Performance)

Date: 2025-08-26
Project: nubi (project_id: nfnmoqepgjyutcbbaqjg)

## Summary
- Applied migrations:
  - `2025-08-26-scraping-stats.sql`
  - `2025-08-26-legacy-cleanup-fixed.sql`
  - `2025-08-26-rls-fixes.sql`
  - `2025-08-26-archival-and-drops-retry.sql` (dry-run archive; per-table exceptions)
- Advisors re-run after apply. Key observations below.

## Highlights
- __Duplicate index cleanups__: No remaining errors for prior duplicates (e.g., `cross_platform_identities`, `session_messages`, `telegram_raids`). Kept unique constraints, removed redundant plain indexes.
- __FK coverage indexes__: Added indexes across multiple FKs (`community_interactions.related_raid_id`, `nubi_sessions.agent_id|room_id`, `raids.created_by`, `user_achievements.achievement_id|raid_id`, etc.).
- __RLS initplan warnings remain__ on several tables (e.g., `public.worlds`, `channels`, `channel_participants`, `embeddings`, `logs`, `central_messages`, `server_agents`, `tasks`, `cache`, `message_servers`, `user_records`, …). These indicate policies invoking `auth.*()` or `current_setting()` directly. See remediation below.
- __Archive tables created__ for eligible candidates (e.g., `archive.leaderboards__YYYYMMDD_HHMMSS`, `archive.raid_analytics__...`, `archive.telegram_raids__...`). Some “unused index” infos now reference these archive tables (expected).
- __New table `public.scraping_stats`__: Advisors report initial “unused index” info for its indexes (expected immediately after creation).

## Notable Lints (selection)
- __auth_rls_initplan (WARN)__
  - Pattern: “Service role full access” policies evaluating `auth.*()` per row.
  - Example: `public.worlds`, `public.channels`, `public.channel_participants`, `public.embeddings`, `public.logs`, `public.central_messages`, `public.server_agents`, `public.tasks`, `public.cache`, `public.message_servers`, `public.user_records`, …
  - Remediation: Replace `auth.function()` with `(select auth.function())` inside policy expressions.
  - Docs: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

- __unused_index (INFO)__
  - Examples: `public.scraped_tweets` several secondary indexes; archive tables’ secondary indexes; new `scraping_stats` indexes.
  - Note: “Unused” can be transient. Monitor with workload. Consider removal only when confirmed over time and not covering important queries.

## Remediation Plan
- __RLS initplan fixes__: Prepare a follow-up migration to update policy definitions by wrapping function calls in SELECT, e.g. `USING ((select auth.uid()) is not null)` instead of `USING (auth.uid() is not null)`. Target the tables listed above and any other flagged by advisors.
- __Archive indexes__: Optionally drop non-critical secondary indexes on archive tables to reduce bloat, once archival retention is confirmed.
- __Scraping stats__: Keep indexes; re-evaluate after usage ramps up.

## Verification Notes
- `nubi_sessions` archival skipped due to referencing FKs (by design in dry-run). Investigate dependencies before any drop enablement.

## Appendix
- Advisor categories included: `auth_rls_initplan` (WARN), `unused_index` (INFO)
- For a raw dump, re-run advisors using the `/supabase_advisors` workflow or MCP.
