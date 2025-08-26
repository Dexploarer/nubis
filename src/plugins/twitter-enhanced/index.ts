/**
 * Enhanced Twitter Plugin for ElizaOS
 * Provides credential-based authentication, real-time notification monitoring,
 * and seamless integration with social raids system
 */

import type { IAgentRuntime, Plugin } from '@elizaos/core';
import { elizaLogger } from '@elizaos/core';

// Services
import { TwitterAuthService } from './services/twitter-auth-service';
import { TwitterClientService } from './services/twitter-client-service';
import { NotificationMonitor } from './services/notification-monitor';
import { EngagementTracker } from './services/engagement-tracker';
import { TwitterRSSService } from './services/twitter-rss-service';

// Actions
import { postTweetAction } from './actions/post-tweet';
import { monitorMentionsAction } from './actions/monitor-mentions';
import { trackEngagementAction } from './actions/track-engagement';
import { createRSSFeedAction, manageRSSFeedsAction } from './actions';

// Providers
import { twitterTimelineProvider } from './providers/twitter-timeline-provider';
import { engagementDataProvider } from './providers/engagement-data-provider';

// Configuration interface
interface TwitterEnhancedConfig {
  TWITTER_USERNAME?: string;
  TWITTER_PASSWORD?: string;
  TWITTER_EMAIL?: string;
  TWITTER_COOKIES?: string;
  TWITTER_NOTIFICATION_POLL_INTERVAL?: string;
  TWITTER_ENGAGEMENT_TRACKING?: string;
  TWITTER_RAID_MONITORING?: string;
  RSS_SERVER_PORT?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

export const twitterEnhancedPlugin: Plugin = {
  name: 'twitter-enhanced',
  description: 'Enhanced Twitter integration with credential authentication and real-time monitoring.',
  priority: 90, // Higher priority than social-raids (100) to ensure it loads first

  // Configuration
  config: {
    TWITTER_USERNAME: process.env.TWITTER_USERNAME,
    TWITTER_PASSWORD: process.env.TWITTER_PASSWORD,
    TWITTER_EMAIL: process.env.TWITTER_EMAIL,
    TWITTER_COOKIES: process.env.TWITTER_COOKIES,
    TWITTER_NOTIFICATION_POLL_INTERVAL: process.env.TWITTER_NOTIFICATION_POLL_INTERVAL || '60000',
    TWITTER_ENGAGEMENT_TRACKING: process.env.TWITTER_ENGAGEMENT_TRACKING || 'true',
    TWITTER_RAID_MONITORING: process.env.TWITTER_RAID_MONITORING || 'true',
    RSS_SERVER_PORT: process.env.RSS_SERVER_PORT || '8080',
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Lifecycle method
  async init(config: Record<string, string>, runtime: IAgentRuntime) {
    try {
      elizaLogger.info('Initializing enhanced Twitter plugin');

      // Process configuration
      const processedConfig: TwitterEnhancedConfig = {
        TWITTER_USERNAME: config.TWITTER_USERNAME,
        TWITTER_PASSWORD: config.TWITTER_PASSWORD,
        TWITTER_EMAIL: config.TWITTER_EMAIL,
        TWITTER_COOKIES: config.TWITTER_COOKIES,
        TWITTER_NOTIFICATION_POLL_INTERVAL: config.TWITTER_NOTIFICATION_POLL_INTERVAL,
        TWITTER_ENGAGEMENT_TRACKING: config.TWITTER_ENGAGEMENT_TRACKING,
        TWITTER_RAID_MONITORING: config.TWITTER_RAID_MONITORING,
        RSS_SERVER_PORT: config.RSS_SERVER_PORT,
        SUPABASE_URL: config.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: config.SUPABASE_SERVICE_ROLE_KEY,
      };

      // Set environment variables for services
      for (const [key, value] of Object.entries(processedConfig)) {
        if (value !== undefined) {
          process.env[key] = String(value);
        }
      }

      elizaLogger.info('Enhanced Twitter plugin initialized successfully');
    } catch (error) {
      elizaLogger.error('Failed to initialize enhanced Twitter plugin', error);
      throw error;
    }
  },

  // Component definitions
  services: [
    TwitterAuthService,
    TwitterClientService, 
    NotificationMonitor,
    EngagementTracker,
    TwitterRSSService
  ],
  
  actions: [
    postTweetAction,
    monitorMentionsAction,
    trackEngagementAction,
    createRSSFeedAction,
    manageRSSFeedsAction,
  ],
  
  providers: [
    twitterTimelineProvider,
    engagementDataProvider
  ],

  // Event handlers (empty for now)
  events: {},

  // Model handlers (empty for now) 
  models: {},

  // API routes (empty for now)
  routes: [],
};

export default twitterEnhancedPlugin;

// Export types for use by other plugins
export * from './services/twitter-auth-service';
export * from './services/twitter-client-service';
export * from './services/notification-monitor';
export * from './services/engagement-tracker';
export * from './services/twitter-rss-service';