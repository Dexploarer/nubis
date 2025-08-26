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
  name: "social-raids",
  description: "Comprehensive Twitter/Telegram raids coordination plugin with engagement tracking, community memory, and leaderboards",
  
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
    TwitterRaidService,
    TelegramRaidManager,
    CommunityMemoryService
  ]
};

export default socialRaidsPlugin;
