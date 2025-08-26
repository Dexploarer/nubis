/**
 * Social Raids Plugin for ElizaOS
 * Comprehensive Twitter/Telegram raids coordination with engagement tracking,
 * community memory, and leaderboards system
 */

import { Plugin } from "@elizaos/core";

// Services
import { TwitterRaidService } from "./services/twitter-raid-service";
import { TelegramRaidManager } from "./services/telegram-raid-manager";
import { CommunityMemoryService } from "./services/community-memory-service";

// Actions
import { startRaidAction } from "./actions/start-raid";
import { joinRaidAction } from "./actions/join-raid";
import { submitEngagementAction } from "./actions/submit-engagement";
import { viewLeaderboardAction } from "./actions/view-leaderboard";
import { scrapeTweetsAction } from "./actions/scrape-tweets";

// Providers
import { RaidStatusProvider } from "./providers/raid-status-provider";
import { UserStatsProvider } from "./providers/user-stats-provider";
import { CommunityMemoryProvider } from "./providers/community-memory-provider";

// Evaluators
import { EngagementQualityEvaluator } from "./evaluators/engagement-quality-evaluator";
import { SpamScoreEvaluator } from "./evaluators/spam-score-evaluator";
import { ContentRelevanceEvaluator } from "./evaluators/content-relevance-evaluator";
import { ParticipationConsistencyEvaluator } from "./evaluators/participation-consistency-evaluator";
import { EngagementFraudEvaluator } from "./evaluators/engagement-fraud-evaluator";

export const socialRaidsPlugin: Plugin = {
  name: "SOCIAL_RAIDS_PLUGIN",
  description: "Manages Twitter/Telegram raids, engagement tracking, and community memory.",
  
  actions: [
    startRaidAction,
    joinRaidAction,
    submitEngagementAction,
    viewLeaderboardAction,
    scrapeTweetsAction
  ],
  
  providers: [
    RaidStatusProvider,
    UserStatsProvider,
    CommunityMemoryProvider
  ],
  
  evaluators: [
    EngagementQualityEvaluator,
    SpamScoreEvaluator,
    ContentRelevanceEvaluator,
    ParticipationConsistencyEvaluator,
    EngagementFraudEvaluator
  ],
  
  services: [
    TwitterRaidService,
    TelegramRaidManager,
    CommunityMemoryService
  ],

  config: {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    TELEGRAM_CHANNEL_ID: process.env.TELEGRAM_CHANNEL_ID || '',
    TELEGRAM_TEST_CHANNEL: process.env.TELEGRAM_TEST_CHANNEL || '',
    TWITTER_USERNAME: process.env.TWITTER_USERNAME || '',
    TWITTER_PASSWORD: process.env.TWITTER_PASSWORD || '',
    TWITTER_EMAIL: process.env.TWITTER_EMAIL || '',
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    RAID_COORDINATOR_URL: process.env.RAID_COORDINATOR_URL || '',
    TWEET_SCRAPER_URL: process.env.TWEET_SCRAPER_URL || ''
  }
};

export default socialRaidsPlugin;
