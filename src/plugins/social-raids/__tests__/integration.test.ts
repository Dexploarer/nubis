import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import {
  type IAgentRuntime,
  type Memory,
  type State,
} from '@elizaos/core';

// Import plugin components
import { socialRaidsPlugin } from '../index';
import { TwitterRaidService } from '../services/TwitterRaidService';
import { TelegramRaidManager } from '../services/TelegramRaidManager';
import { CommunityMemoryService } from '../services/CommunityMemoryService';
import { startRaidAction } from '../actions/startRaid';
import { joinRaidAction } from '../actions/joinRaid';
import { submitEngagementAction } from '../actions/submitEngagement';
import { viewLeaderboardAction } from '../actions/viewLeaderboard';
import { scrapeTweetsAction } from '../actions/scrapeTweets';
import { RaidStatusProvider } from '../providers/RaidStatusProvider';
import { UserStatsProvider } from '../providers/UserStatsProvider';
import { CommunityMemoryProvider } from '../providers/CommunityMemoryProvider';
import { EngagementQualityEvaluator } from '../evaluators/EngagementQualityEvaluator';

// Import test utilities
import {
  createMockRuntime,
  createMockSupabaseClient,
  mockFetch,
  TestData,
  setupTestEnvironment,
  cleanupTestEnvironment,
  TEST_CONSTANTS,
} from './test-utils';

describe('Social Raids Plugin Integration', () => {
  let mockRuntime: any;
  let mockSupabase: any;

  beforeEach(() => {
    setupTestEnvironment();
    mockRuntime = createMockRuntime();
    mockSupabase = createMockSupabaseClient();
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('Plugin Structure', () => {
    it('should have correct plugin structure', () => {
      expect(socialRaidsPlugin.name).toBe('SOCIAL_RAIDS_PLUGIN');
      expect(socialRaidsPlugin.description).toBe('Manages Twitter/Telegram raids, engagement tracking, and community memory.');
      
      expect(socialRaidsPlugin.services).toBeDefined();
      expect(socialRaidsPlugin.actions).toBeDefined();
      expect(socialRaidsPlugin.providers).toBeDefined();
      expect(socialRaidsPlugin.evaluators).toBeDefined();
      expect(socialRaidsPlugin.config).toBeDefined();
    });

    it('should have all required services', () => {
      const serviceNames = socialRaidsPlugin.services.map(service => service.name);
      expect(serviceNames).toContain('TWITTER_RAID_SERVICE');
      expect(serviceNames).toContain('TELEGRAM_RAID_MANAGER');
      expect(serviceNames).toContain('COMMUNITY_MEMORY_SERVICE');
    });

    it('should have all required actions', () => {
      const actionNames = socialRaidsPlugin.actions.map(action => action.name);
      expect(actionNames).toContain('START_RAID');
      expect(actionNames).toContain('JOIN_RAID');
      expect(actionNames).toContain('SUBMIT_ENGAGEMENT');
      expect(actionNames).toContain('VIEW_LEADERBOARD');
      expect(actionNames).toContain('SCRAPE_TWEETS');
    });

    it('should have all required providers', () => {
      const providerNames = socialRaidsPlugin.providers.map(provider => provider.name);
      expect(providerNames).toContain('RAID_STATUS');
      expect(providerNames).toContain('USER_STATS');
      expect(providerNames).toContain('COMMUNITY_MEMORY');
    });

    it('should have all required evaluators', () => {
      const evaluatorNames = socialRaidsPlugin.evaluators.map(evaluator => evaluator.name);
      expect(evaluatorNames).toContain('ENGAGEMENT_QUALITY');
    });

    it('should have required configuration', () => {
      const configKeys = Object.keys(socialRaidsPlugin.config);
      expect(configKeys).toContain('TELEGRAM_BOT_TOKEN');
      expect(configKeys).toContain('TELEGRAM_CHANNEL_ID');
      expect(configKeys).toContain('TWITTER_USERNAME');
      expect(configKeys).toContain('TWITTER_PASSWORD');
      expect(configKeys).toContain('TWEET_SCRAPER_URL');
    });
  });

  describe('Service Integration', () => {
    it('should initialize all services correctly', async () => {
      const twitterService = new TwitterRaidService(mockRuntime as IAgentRuntime);
      const telegramService = new TelegramRaidManager(mockRuntime as IAgentRuntime);
      const memoryService = new CommunityMemoryService(mockRuntime as IAgentRuntime);

      expect(twitterService).toBeDefined();
      expect(telegramService).toBeDefined();
      expect(memoryService).toBeDefined();
    });

    it('should handle service dependencies correctly', async () => {
      mockRuntime.getService = mock().mockImplementation((serviceName: string) => {
        switch (serviceName) {
          case 'TWITTER_RAID_SERVICE':
            return new TwitterRaidService(mockRuntime as IAgentRuntime);
          case 'TELEGRAM_RAID_MANAGER':
            return new TelegramRaidManager(mockRuntime as IAgentRuntime);
          case 'COMMUNITY_MEMORY_SERVICE':
            return new CommunityMemoryService(mockRuntime as IAgentRuntime);
          default:
            return null;
        }
      });

      const twitterService = mockRuntime.getService('TWITTER_RAID_SERVICE');
      const telegramService = mockRuntime.getService('TELEGRAM_RAID_MANAGER');
      const memoryService = mockRuntime.getService('COMMUNITY_MEMORY_SERVICE');

      expect(twitterService).toBeDefined();
      expect(telegramService).toBeDefined();
      expect(memoryService).toBeDefined();
    });
  });

  describe('Action Integration', () => {
    it('should handle complete raid workflow', async () => {
      // Mock successful responses for all services
      const mockTwitterService = {
        authenticate: mock().mockResolvedValue(true),
        postTweet: mock().mockResolvedValue(TestData.createTweetData()),
        scrapeEngagement: mock().mockResolvedValue(TestData.createTweetData()),
      };

      const mockTelegramService = {
        sendRaidNotification: mock().mockResolvedValue(true),
        lockChat: mock().mockResolvedValue(true),
        unlockChat: mock().mockResolvedValue(true),
      };

      const mockMemoryService = {
        recordInteraction: mock().mockResolvedValue(true),
        getUserPersonality: mock().mockResolvedValue({ personality: 'active' }),
      };

      mockRuntime.getService = mock().mockImplementation((serviceName: string) => {
        switch (serviceName) {
          case 'TWITTER_RAID_SERVICE':
            return mockTwitterService;
          case 'TELEGRAM_RAID_MANAGER':
            return mockTelegramService;
          case 'COMMUNITY_MEMORY_SERVICE':
            return mockMemoryService;
          default:
            return null;
        }
      });

      // Test start raid action
      const startRaidMessage = {
        id: 'test-memory',
        content: {
          text: 'Start raid on https://twitter.com/testuser/status/1234567890123456789',
          channelType: 'direct',
        },
      };

      const callbackFn = mock().mockResolvedValue([]);

      const startResult = await startRaidAction.handler(
        mockRuntime as IAgentRuntime,
        startRaidMessage as Memory,
        {} as State,
        {},
        callbackFn
      );

      expect(startResult).toBe(true);
      expect(mockTwitterService.postTweet).toHaveBeenCalled();
      expect(mockTelegramService.sendRaidNotification).toHaveBeenCalled();
      expect(mockTelegramService.lockChat).toHaveBeenCalled();
    });

    it('should handle engagement submission workflow', async () => {
      const mockMemoryService = {
        recordInteraction: mock().mockResolvedValue(true),
        updateUserStats: mock().mockResolvedValue(true),
      };

      mockRuntime.getService = mock().mockReturnValue(mockMemoryService);

      const engagementMessage = {
        id: 'test-memory',
        content: {
          text: 'Submit engagement like for raid session-123',
          engagementData: {
            actionType: 'like',
            raidId: 'session-123',
            userId: 'test-user',
            evidence: 'screenshot_provided',
          },
        },
      };

      const callbackFn = mock().mockResolvedValue([]);

      const result = await submitEngagementAction.handler(
        mockRuntime as IAgentRuntime,
        engagementMessage as Memory,
        {} as State,
        {},
        callbackFn
      );

      expect(result).toBe(true);
      expect(mockMemoryService.recordInteraction).toHaveBeenCalled();
      expect(mockMemoryService.updateUserStats).toHaveBeenCalled();
    });

    it('should handle tweet scraping workflow', async () => {
      const mockResponse = {
        success: true,
        data: {
          username: 'testuser',
          tweetsScraped: 50,
          tweets: [
            { id: '1', text: 'Tweet 1', username: 'testuser' },
            { id: '2', text: 'Tweet 2', username: 'testuser' },
          ],
        },
      };

      global.fetch = mockFetch(mockResponse);

      const mockTwitterService = {
        exportTweets: mock().mockResolvedValue([
          TestData.createTweetData({ id: '1', text: 'Tweet 1' }),
          TestData.createTweetData({ id: '2', text: 'Tweet 2' }),
        ]),
      };

      mockRuntime.getService = mock().mockReturnValue(mockTwitterService);

      const scrapeMessage = {
        id: 'test-memory',
        content: {
          text: 'Scrape 50 tweets from testuser',
          channelType: 'direct',
        },
      };

      const callbackFn = mock().mockResolvedValue([]);

      const result = await scrapeTweetsAction.handler(
        mockRuntime as IAgentRuntime,
        scrapeMessage as Memory,
        {} as State,
        {},
        callbackFn
      );

      expect(result).toBe(true);
      expect(mockTwitterService.exportTweets).toHaveBeenCalledWith('testuser', 50, 0);
    });
  });

  describe('Provider Integration', () => {
    it('should execute RaidStatusProvider successfully', async () => {
      const provider = RaidStatusProvider;
      const mockMessage = {
        id: 'test-message-id' as any,
        content: { text: 'Get raid status' },
        entityId: 'test-user-id' as any,
        roomId: 'test-room-id' as any,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const mockState = {
        values: {},
        data: {},
        text: '',
      };

      const result = await provider.get(mockRuntime, mockMessage, mockState);
      expect(result).toBeDefined();
    });

    it('should execute UserStatsProvider successfully', async () => {
      const provider = UserStatsProvider;
      const mockMessage = {
        id: 'test-message-id' as any,
        content: { text: 'Get user stats' },
        entityId: 'test-user-id' as any,
        roomId: 'test-room-id' as any,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const mockState = {
        values: {},
        data: {},
        text: '',
      };

      const result = await provider.get(mockRuntime, mockMessage, mockState);
      expect(result).toBeDefined();
    });

    it('should execute CommunityMemoryProvider successfully', async () => {
      const provider = CommunityMemoryProvider;
      const mockMessage = {
        id: 'test-message-id' as any,
        content: { text: 'Get community memory' },
        entityId: 'test-user-id' as any,
        roomId: 'test-room-id' as any,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const mockState = {
        values: {},
        data: {},
        text: '',
      };

      const result = await provider.get(mockRuntime, mockMessage, mockState);
      expect(result).toBeDefined();
    });
  });

  describe('Evaluator Integration', () => {
    it('should execute EngagementQualityEvaluator successfully', async () => {
      const evaluator = EngagementQualityEvaluator;
      const mockMessage = {
        id: 'test-message-id' as any,
        content: { text: 'Test engagement' },
        entityId: 'test-user-id' as any,
        roomId: 'test-room-id' as any,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const mockState = {
        values: {},
        data: {},
        text: '',
      };

      await evaluator.handler(mockRuntime, mockMessage);
      // Evaluator doesn't return anything, just ensure it doesn't throw
      expect(true).toBe(true);
    });
  });

  describe('Database Integration', () => {
    it('should handle database operations correctly', async () => {
      const mockInsertResult = { data: { id: 'new-raid-id' }, error: null };
      mockSupabase.from.mockReturnValue({
        insert: mock().mockReturnValue({
          select: mock().mockResolvedValue(mockInsertResult),
        }),
      });

      const twitterService = new TwitterRaidService(mockRuntime as IAgentRuntime);
      twitterService.supabase = mockSupabase;

      const result = await twitterService.createRaid({
        targetUrl: 'https://twitter.com/testuser/status/1234567890123456789',
        targetPlatform: 'twitter',
        platform: 'telegram',
        createdBy: 'test-user',
      });

      expect(result).toBeDefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('raids');
    });

    it('should handle database errors gracefully', async () => {
      const mockErrorResult = { data: null, error: { message: 'Database error' } };
      mockSupabase.from.mockReturnValue({
        insert: mock().mockReturnValue({
          select: mock().mockResolvedValue(mockErrorResult),
        }),
      });

      const twitterService = new TwitterRaidService(mockRuntime as IAgentRuntime);
      twitterService.supabase = mockSupabase;

      await expect(twitterService.createRaid({
        targetUrl: 'https://twitter.com/testuser/status/1234567890123456789',
        targetPlatform: 'twitter',
        platform: 'telegram',
        createdBy: 'test-user',
      })).rejects.toThrow('Database error');
    });
  });

  describe('Edge Function Integration', () => {
    it('should call tweet scraper Edge Function correctly', async () => {
      const mockResponse = {
        success: true,
        data: {
          tweet: {
            id: '1234567890123456789',
            text: 'Test tweet',
            username: 'testuser',
            likeCount: 100,
            retweetCount: 50,
          },
        },
      };

      global.fetch = mockFetch(mockResponse);

      const twitterService = new TwitterRaidService(mockRuntime as IAgentRuntime);
      const result = await twitterService.scrapeEngagement('https://twitter.com/testuser/status/1234567890123456789');

      expect(result).toBeDefined();
      expect(result.id).toBe('1234567890123456789');
      expect(result.metrics.likes).toBe(100);
    });

    it('should handle Edge Function errors gracefully', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'Edge Function error',
      };

      global.fetch = mockFetch(mockErrorResponse);

      const twitterService = new TwitterRaidService(mockRuntime as IAgentRuntime);

      await expect(twitterService.scrapeEngagement('https://twitter.com/testuser/status/1234567890123456789'))
        .rejects.toThrow('Tweet scraping failed: Edge Function error');
    });
  });

  describe('Configuration Integration', () => {
    it('should load configuration correctly', () => {
      mockRuntime.getSetting = mock().mockImplementation((key: string) => {
        const settings = {
          TELEGRAM_BOT_TOKEN: 'test-bot-token',
          TELEGRAM_CHANNEL_ID: '@testchannel',
          TWITTER_USERNAME: 'testuser',
          TWITTER_PASSWORD: 'testpass',
          TWEET_SCRAPER_URL: 'https://test.supabase.co/functions/v1/tweet-scraper',
        };
        return settings[key];
      });

      const telegramService = new TelegramRaidManager(mockRuntime as IAgentRuntime);
      const twitterService = new TwitterRaidService(mockRuntime as IAgentRuntime);

      expect(mockRuntime.getSetting).toHaveBeenCalledWith('TELEGRAM_BOT_TOKEN');
      expect(mockRuntime.getSetting).toHaveBeenCalledWith('TWITTER_USERNAME');
    });

    it('should handle missing configuration gracefully', () => {
      mockRuntime.getSetting = mock().mockReturnValue(null);

      const telegramService = new TelegramRaidManager(mockRuntime as IAgentRuntime);
      const twitterService = new TwitterRaidService(mockRuntime as IAgentRuntime);

      // Services should handle missing configuration gracefully
      expect(telegramService).toBeDefined();
      expect(twitterService).toBeDefined();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle service initialization errors', async () => {
      mockRuntime.getService = mock().mockReturnValue(null);

      const startRaidMessage = {
        id: 'test-memory',
        content: {
          text: 'Start raid on https://twitter.com/testuser/status/1234567890123456789',
          channelType: 'direct',
        },
      };

      const callbackFn = mock().mockResolvedValue([]);

      const result = await startRaidAction.handler(
        mockRuntime as IAgentRuntime,
        startRaidMessage as Memory,
        {} as State,
        {},
        callbackFn
      );

      expect(result).toBe(false);
      expect(callbackFn).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Service not available'),
        })
      );
    });

    it('should handle network errors gracefully', async () => {
      global.fetch = mock().mockRejectedValue(new Error('Network error'));

      const twitterService = new TwitterRaidService(mockRuntime as IAgentRuntime);

      await expect(twitterService.scrapeEngagement('https://twitter.com/testuser/status/1234567890123456789'))
        .rejects.toThrow('Network error');
    });

    it('should handle validation errors', async () => {
      const invalidMessage = {
        id: 'test-memory',
        content: {
          text: 'Invalid command',
          channelType: 'direct',
        },
      };

      const callbackFn = mock().mockResolvedValue([]);

      const result = await startRaidAction.handler(
        mockRuntime as IAgentRuntime,
        invalidMessage as Memory,
        {} as State,
        {},
        callbackFn
      );

      expect(result).toBe(false);
      expect(callbackFn).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Invalid raid command'),
        })
      );
    });
  });

  describe('Performance Integration', () => {
    it('should handle concurrent operations', async () => {
      const mockTwitterService = {
        authenticate: mock().mockResolvedValue(true),
        postTweet: mock().mockResolvedValue(TestData.createTweetData()),
      };

      mockRuntime.getService = mock().mockReturnValue(mockTwitterService);

      const startRaidMessage = {
        id: 'test-memory',
        content: {
          text: 'Start raid on https://twitter.com/testuser/status/1234567890123456789',
          channelType: 'direct',
        },
      };

      const callbackFn = mock().mockResolvedValue([]);

      // Start multiple concurrent raids
      const promises = Array.from({ length: 5 }, () =>
        startRaidAction.handler(
          mockRuntime as IAgentRuntime,
          startRaidMessage as Memory,
          {} as State,
          {},
          callbackFn
        )
      );

      const results = await Promise.all(promises);

      expect(results.every(result => result === true)).toBe(true);
      expect(mockTwitterService.postTweet).toHaveBeenCalledTimes(5);
    });

    it('should handle large datasets efficiently', async () => {
      const largeTweetSet = Array.from({ length: 1000 }, (_, i) =>
        TestData.createTweetData({ id: `tweet-${i}` })
      );

      const mockTwitterService = {
        exportTweets: mock().mockResolvedValue(largeTweetSet),
      };

      mockRuntime.getService = mock().mockReturnValue(mockTwitterService);

      const scrapeMessage = {
        id: 'test-memory',
        content: {
          text: 'Scrape 1000 tweets from testuser',
          channelType: 'direct',
        },
      };

      const callbackFn = mock().mockResolvedValue([]);

      const startTime = Date.now();
      const result = await scrapeTweetsAction.handler(
        mockRuntime as IAgentRuntime,
        scrapeMessage as Memory,
        {} as State,
        {},
        callbackFn
      );
      const endTime = Date.now();

      expect(result).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('Memory Integration', () => {
    it('should create memories for all major events', async () => {
      mockRuntime.createMemory = mock().mockResolvedValue({ id: 'new-memory-id' });

      const startRaidMessage = {
        id: 'test-memory',
        content: {
          text: 'Start raid on https://twitter.com/testuser/status/1234567890123456789',
          channelType: 'direct',
        },
      };

      const mockTwitterService = {
        authenticate: mock().mockResolvedValue(true),
        postTweet: mock().mockResolvedValue(TestData.createTweetData()),
      };

      mockRuntime.getService = mock().mockReturnValue(mockTwitterService);

      const callbackFn = mock().mockResolvedValue([]);

      await startRaidAction.handler(
        mockRuntime as IAgentRuntime,
        startRaidMessage as Memory,
        {} as State,
        {},
        callbackFn
      );

      expect(mockRuntime.createMemory).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            text: expect.stringContaining('Raid started'),
          }),
        }),
        'raid_events'
      );
    });

    it('should search memories for context', async () => {
      const mockMemories = [
        {
          id: 'memory-1',
          content: {
            text: 'Previous raid on same target',
            raidData: { targetUrl: 'https://twitter.com/testuser/status/1234567890123456789' },
          },
        },
      ];

      mockRuntime.searchMemories = mock().mockResolvedValue(mockMemories);

      const startRaidMessage = {
        id: 'test-memory',
        content: {
          text: 'Start raid on https://twitter.com/testuser/status/1234567890123456789',
          channelType: 'direct',
        },
      };

      const mockTwitterService = {
        authenticate: mock().mockResolvedValue(true),
        postTweet: mock().mockResolvedValue(TestData.createTweetData()),
      };

      mockRuntime.getService = mock().mockReturnValue(mockTwitterService);

      const callbackFn = mock().mockResolvedValue([]);

      await startRaidAction.handler(
        mockRuntime as IAgentRuntime,
        startRaidMessage as Memory,
        {} as State,
        {},
        callbackFn
      );

      expect(mockRuntime.searchMemories).toHaveBeenCalledWith(
        expect.stringContaining('raid'),
        expect.any(Number)
      );
    });
  });
});
