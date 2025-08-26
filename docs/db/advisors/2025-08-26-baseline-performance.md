# Baseline Advisors (Performance)
Project: nfnmoqepgjyutcbbaqjg (nubi)
Date: 2025-08-26

## Summary
- Duplicate indexes detected on multiple tables
- Unindexed foreign keys present
- Several unused indexes reported (observe before removal)
- RLS initplan warnings on per-row auth/current_setting() usage

## Duplicate Indexes (drop all but one)
- public.cross_platform_identities: {cross_platform_identities_platform_uidx, uq_cross_platform_identities_platform_user}
- public.session_messages: {idx_session_messages_session, idx_session_messages_session_id}
- public.session_messages: {idx_session_messages_sequence, idx_session_messages_session_seq}
- public.telegram_raids: {idx_telegram_raids_active, idx_telegram_raids_status_active}

Remediation: https://supabase.com/docs/guides/database/database-linter?lint=0009_duplicate_index

## Unindexed Foreign Keys (add covering indexes)
- community_interactions.related_raid_id
- leaderboards.user_id
- nubi_sessions.agent_id, nubi_sessions.room_id
- raid_teams.leader_id
- raids.created_by
- user_achievements.achievement_id, user_achievements.raid_id

Remediation: https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys

## Unused Indexes (observe, then consider removal)
- nubi_sessions: idx_nubi_sessions_user_status
- cache: idx_cache_key
- engagement_snapshots: idx_engagement_snapshots_raid_time, idx_engagement_snapshots_tweet
- community_interactions: idx_community_interactions_user_time, idx_community_interactions_weight
- leaderboards: idx_leaderboards_timeframe_rank
- scraped_tweets: idx_scraped_tweets_username, idx_scraped_tweets_processed, idx_scraped_tweets_created_at, idx_scraped_tweets_scraped_at, idx_scraped_tweets_tweet_id

Remediation: https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index

## RLS InitPlan Warnings
- agents: "Service role bypass"
- participants: "Service role bypass"
- components: "Service role bypass"
- rooms: "Service role full access"

Action: Replace per-row auth/current_setting() calls with role-scoped policies or `(select auth.<function>())` pattern.
Docs: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

## Notes
- See migrations:
  - docs/db/migrations/2025-08-26-legacy-cleanup.sql
  - docs/db/migrations/2025-08-26-rls-fixes.sql
  - docs/db/migrations/2025-08-26-scraping-stats.sql
  - docs/db/migrations/2025-08-26-archival-and-drops.sql
