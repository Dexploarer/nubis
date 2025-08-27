# Supabase Table Inventory (code references)

This inventory is generated from static analysis of repository code under `src/` and related directories to identify active Supabase table usage. It does NOT include runtime usage by Edge Functions or external services. Verify against your Supabase project before applying any migrations.

## Active tables referenced in code

- community_interactions
  - Inserts: `CommunityMemoryService.recordInteraction()`, `TelegramRaidManager.logUserInteraction()`
  - Selects: `CommunityMemoryService.getPersonalityProfile()`, `getUserMemories()`, `loadRecentMemories()`, `updatePersonalityProfiles()`
  - Deletes: `CommunityMemoryService.consolidateMemories()` (after archiving)
- archived_interactions
  - Inserts: `CommunityMemoryService.consolidateMemories()` (archive copy)
- users
  - Selects: `CommunityMemoryService.getTopContributors()`, `TelegramRaidManager.showUserStats()`, `UserStatsProvider`
- system_config
  - Upserts: `TwitterRaidService.authenticateTwitter()` (stores auth state)
- agent_tweets
  - Inserts: `TwitterRaidService.postTweet()`
- engagement_snapshots
  - Inserts: `TwitterRaidService.scrapeEngagement()`
- data_exports
  - Inserts: `TwitterRaidService.exportTweets()`
- agent_engagements
  - Inserts (success/failure): `TwitterRaidService.engageWithTweet()`
- RPC: update_user_community_standing
  - Called by: `CommunityMemoryService.updateUserCommunityStanding()`

## Tables referenced outside Supabase client (direct Postgres)

- raid_snapshots (Postgres via `pg`)
  - Created/Inserted: `src/plugins/xmcpx/src/raid/storage.ts`
  - Note: This bypasses Supabase client and uses direct DATABASE_URL/PG_CONNECTION_STRING.

## Not found in code (potential legacy; verify before removal)

Static scan did not find direct references under `src/`, but live DB shows these exist (approx row counts from `pg_stat_all_tables` in `public`):

- scraped_tweets — exists, ~0 rows
- scraped_users — exists, ~0 rows
- leaderboards — exists, ~0 rows
- nubi_sessions — exists, ~0 rows
- telegram_raids — exists, ~0 rows
- raid_analytics — exists, ~0 rows
- raids — exists, ~1 row
- telegram_raid_participants — NOT PRESENT

Edge Function dependencies (confirmed live):

- `analytics-engine` writes to `scraped_tweets` when `storeInDatabase: true`
- `webhook-processor` uses `rate_limits` and `processed_events` for rate limiting and deduplication
- Missing table used by `analytics-engine`: `scraping_stats` (not present) — should be created before enabling persistent scraping stats

Guidance:

- Keep `scraped_tweets`/`scraped_users` (Edge Functions use them); consolidate duplicate permissive RLS and keep upsert indexes
- Treat `leaderboards`/`nubi_sessions`/`telegram_raids`/`raid_analytics`/`raids` as staged features — low/no data; validate business need before removal
- Remove `telegram_raid_participants` from cleanup list (not present)

## Suggested next steps

- Verify actual tables via Supabase: list tables, views, functions, indexes, and RLS.
- Cross-check Edge Function code or logs to confirm dependencies (especially `scraped_tweets`).
- For confirmed legacy tables, prepare reversible migrations (CREATE IF NOT EXISTS archive, then DROP with safety checks).
- Add missing indexes per advisor and remove duplicates on hot tables (see `docs/db/migrations/2025-08-26-legacy-cleanup.sql`).
- Add a CREATE TABLE for `scraping_stats` with minimal RLS to unblock `analytics-engine` when enabled.

## CI/guardrails

- Add a smoke test that exercises minimal DB paths used above to catch accidental drops.
- Consider a read-only canary job against production or staging before schema changes.
