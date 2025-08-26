/**
 * Social Raids Plugin for ElizaOS
 * Comprehensive Twitter/Telegram raids coordination with engagement tracking,
 * community memory, and leaderboards system
 */

import { Plugin } from "@elizaos/core";

// Services
import { TwitterRaidService } from "./services/TwitterRaidService";
import { TelegramRaidManager } from "./services/TelegramRaidManager";
import { CommunityMemoryService } from "./services/CommunityMemoryService";

// Actions
import { startRaidAction } from "./actions/startRaid";
import { joinRaidAction } from "./actions/joinRaid";
import { submitEngagementAction } from "./actions/submitEngagement";
import { viewLeaderboardAction } from "./actions/viewLeaderboard";
import { scrapeTweetsAction } from "./actions/scrapeTweets";

// Providers
import { RaidStatusProvider } from "./providers/RaidStatusProvider";
import { UserStatsProvider } from "./providers/UserStatsProvider";
import { CommunityMemoryProvider } from "./providers/CommunityMemoryProvider";

// Evaluators
import { EngagementQualityEvaluator } from "./evaluators/EngagementQualityEvaluator";

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
    EngagementQualityEvaluator
  ],
  
  services: [
    {
      name: "TWITTER_RAID_SERVICE",
      service: TwitterRaidService
    },
    {
      name: "TELEGRAM_RAID_MANAGER", 
      service: TelegramRaidManager
    },
    {
      name: "COMMUNITY_MEMORY_SERVICE",
      service: CommunityMemoryService
    }
  ],

  config: {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    TELEGRAM_CHANNEL_ID: process.env.TELEGRAM_CHANNEL_ID || '',
    TWITTER_USERNAME: process.env.TWITTER_USERNAME || '',
    TWITTER_PASSWORD: process.env.TWITTER_PASSWORD || '',
    TWEET_SCRAPER_URL: process.env.TWEET_SCRAPER_URL || ''
  }
};

export default socialRaidsPlugin;
