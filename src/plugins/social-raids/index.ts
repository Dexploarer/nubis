/**
 * Social Raids Plugin for ElizaOS
 * Comprehensive Twitter/Telegram raids coordination with engagement tracking,
 * community memory, and leaderboards system
 */

// Core elizaOS imports first
import type { IAgentRuntime, Plugin } from '@elizaos/core';
import { logger } from '@elizaos/core';

// Standard ElizaOS Telegram plugin integration
import { TelegramService } from '@elizaos/plugin-telegram';

// Local imports last
// Actions
import { startRaidAction } from './actions/start-raid';
import { joinRaidAction } from './actions/join-raid';
import { submitEngagementAction } from './actions/submit-engagement';
import { viewLeaderboardAction } from './actions/view-leaderboard';
import { scrapeTweetsAction } from './actions/scrape-tweets';
import { queryKnowledgeAction } from './actions/query-knowledge';
import { soulBindingAction } from './actions/soul-binding';
import { soulBindingConfirmationAction } from './actions/soul-binding-confirmation';
import { soulBindingCompletionAction } from './actions/soul-binding-completion';

// Providers
import { RaidStatusProvider } from './providers/raid-status-provider';
import { UserStatsProvider } from './providers/user-stats-provider';
import { CommunityMemoryProvider } from './providers/community-memory-provider';

// Evaluators
import { EngagementQualityEvaluator } from './evaluators/engagement-quality-evaluator';
import { SpamScoreEvaluator } from './evaluators/spam-score-evaluator';
import { ContentRelevanceEvaluator } from './evaluators/content-relevance-evaluator';
import { ParticipationConsistencyEvaluator } from './evaluators/participation-consistency-evaluator';
import { EngagementFraudEvaluator } from './evaluators/engagement-fraud-evaluator';

// Services
import { TwitterRaidService } from './services/twitter-raid-service';
import { TelegramRaidManager } from './services/telegram-raid-manager';
import { CommunityMemoryService } from './services/community-memory-service';
import { IdentityManagementService } from './services/identity-management-service';
import { WalletVerificationService } from './services/wallet-verification-service';
import { EntitySyncService } from './services/entity-sync-service';
import { ForumTopicManager } from './services/forum-topic-manager';
import { KnowledgeOptimizationService } from './services/knowledge-optimization-service';

// Configuration interface - simplified to match project patterns
interface SocialRaidsConfig {
  TELEGRAM_RAID_BOT_TOKEN?: string;
  TELEGRAM_RAID_CHANNEL_ID?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHANNEL_ID?: string;
  TELEGRAM_TEST_CHANNEL?: string;
  TELEGRAM_RAID_PASSIVE?: boolean;
  TELEGRAM_PASSIVE_MODE?: boolean;
  TWITTER_USERNAME?: string;
  TWITTER_PASSWORD?: string;
  TWITTER_EMAIL?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  RAID_COORDINATOR_URL?: string;
  TWEET_SCRAPER_URL?: string;
  // Web3 Wallet Verification
  PROJECT_URL?: string;
  WEB3_STATEMENT?: string;
  WEB3_CAPTCHA_ENABLED?: boolean;
  WEB3_RATE_LIMIT?: number;
}

export const socialRaidsPlugin: Plugin = {
  name: 'social-raids',
  description: 'Manages Twitter/Telegram raids, engagement tracking, and community memory.',
  priority: 100,

  // Configuration
  config: {
    TELEGRAM_RAID_BOT_TOKEN: process.env.TELEGRAM_RAID_BOT_TOKEN,
    TELEGRAM_RAID_CHANNEL_ID: process.env.TELEGRAM_RAID_CHANNEL_ID,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHANNEL_ID: process.env.TELEGRAM_CHANNEL_ID,
    TELEGRAM_TEST_CHANNEL: process.env.TELEGRAM_TEST_CHANNEL,
    TELEGRAM_RAID_PASSIVE: process.env.TELEGRAM_RAID_PASSIVE,
    TELEGRAM_PASSIVE_MODE: process.env.TELEGRAM_PASSIVE_MODE,
    TWITTER_USERNAME: process.env.TWITTER_USERNAME,
    TWITTER_PASSWORD: process.env.TWITTER_PASSWORD,
    TWITTER_EMAIL: process.env.TWITTER_EMAIL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RAID_COORDINATOR_URL: process.env.RAID_COORDINATOR_URL,
    TWEET_SCRAPER_URL: process.env.TWEET_SCRAPER_URL,
    // Web3 Wallet Verification
    PROJECT_URL: process.env.PROJECT_URL,
    WEB3_STATEMENT: process.env.WEB3_STATEMENT,
    WEB3_CAPTCHA_ENABLED: process.env.WEB3_CAPTCHA_ENABLED,
    WEB3_RATE_LIMIT: process.env.WEB3_RATE_LIMIT,
  },

  // Lifecycle method
  async init(config: Record<string, string>, runtime: IAgentRuntime) {
    try {
      logger.info('Initializing social raids plugin');

      // Process configuration
      const processedConfig: SocialRaidsConfig = {
        TELEGRAM_RAID_BOT_TOKEN: config.TELEGRAM_RAID_BOT_TOKEN,
        TELEGRAM_RAID_CHANNEL_ID: config.TELEGRAM_RAID_CHANNEL_ID,
        TELEGRAM_BOT_TOKEN: config.TELEGRAM_BOT_TOKEN,
        TELEGRAM_CHANNEL_ID: config.TELEGRAM_CHANNEL_ID,
        TELEGRAM_TEST_CHANNEL: config.TELEGRAM_TEST_CHANNEL,
        TELEGRAM_RAID_PASSIVE: config.TELEGRAM_RAID_PASSIVE === 'true',
        TELEGRAM_PASSIVE_MODE: config.TELEGRAM_PASSIVE_MODE === 'true',
        TWITTER_USERNAME: config.TWITTER_USERNAME,
        TWITTER_PASSWORD: config.TWITTER_PASSWORD,
        TWITTER_EMAIL: config.TWITTER_EMAIL,
        SUPABASE_URL: config.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: config.SUPABASE_SERVICE_ROLE_KEY,
        RAID_COORDINATOR_URL: config.RAID_COORDINATOR_URL,
        TWEET_SCRAPER_URL: config.TWEET_SCRAPER_URL,
        // Web3 Wallet Verification
        PROJECT_URL: config.PROJECT_URL,
        WEB3_STATEMENT: config.WEB3_STATEMENT,
        WEB3_CAPTCHA_ENABLED: config.WEB3_CAPTCHA_ENABLED === 'true',
        WEB3_RATE_LIMIT: parseInt(config.WEB3_RATE_LIMIT || '30'),
      };

      // Set environment variables
      for (const [key, value] of Object.entries(processedConfig)) {
        if (value !== undefined) {
          process.env[key] = String(value);
        }
      }

      logger.info('Social raids plugin initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize social raids plugin', error);
      throw error;
    }
  },

  // Component definitions
  services: [TwitterRaidService, TelegramService, TelegramRaidManager, CommunityMemoryService, IdentityManagementService, WalletVerificationService, EntitySyncService, ForumTopicManager, KnowledgeOptimizationService],
  actions: [
    startRaidAction,
    joinRaidAction,
    submitEngagementAction,
    viewLeaderboardAction,
    scrapeTweetsAction,
    queryKnowledgeAction,
    soulBindingAction,
    soulBindingConfirmationAction,
    soulBindingCompletionAction,
  ],
  providers: [new RaidStatusProvider(), new UserStatsProvider(), new CommunityMemoryProvider()],
  evaluators: [
    new EngagementQualityEvaluator(),
    SpamScoreEvaluator,
    ContentRelevanceEvaluator,
    ParticipationConsistencyEvaluator,
    EngagementFraudEvaluator,
  ],

  // Event handlers (empty for now)
  events: {},

  // Model handlers (empty for now)
  models: {},

  // API routes (empty for now)
  routes: [],
};

export default socialRaidsPlugin;

// Bootstrap export pattern for plugin loading
export * from './actions/index.ts';
export * from './evaluators/index.ts';
export * from './providers/index.ts';
