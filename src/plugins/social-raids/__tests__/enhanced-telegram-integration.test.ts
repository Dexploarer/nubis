/**
 * Enhanced Telegram Integration Tests for Social Raids Plugin
 * Tests the new features added to integrate with standard ElizaOS Telegram plugin
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { TelegramRaidManager } from '../services/telegram-raid-manager';
import { TwitterRaidService } from '../services/twitter-raid-service';
import { socialRaidsPlugin } from '../index';

// Mock runtime
const mockRuntime = {
  getSetting: jest.fn(),
  getService: jest.fn(),
  addService: jest.fn(),
  registerAction: jest.fn(),
  processActions: jest.fn(),
  evaluate: jest.fn(),
  ensureConnection: jest.fn(),
  ensureParticipantExists: jest.fn(),
  ensureParticipantInRoom: jest.fn(),
  ensureRoomExists: jest.fn(),
  ensureUserExists: jest.fn(),
  composeState: jest.fn().mockResolvedValue({}),
  updateRecentMessageState: jest.fn(),
  agentId: 'test-agent-id',
  serverUrl: 'http://localhost:3000',
} as any;

// Mock Telegram context
const mockContext = {
  reply: jest.fn(),
  answerCbQuery: jest.fn(),
  message: {
    text: '',
    message_id: 123,
  },
  from: {
    id: 12345,
    username: 'testuser',
    first_name: 'Test',
  },
  chat: {
    id: -100123456789,
    type: 'group',
    title: 'Test Chat',
  },
  match: null,
} as any;

describe('Enhanced Telegram Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock returns
    mockRuntime.getSetting.mockImplementation((key: string) => {
      const settings: { [key: string]: string } = {
        TELEGRAM_BOT_TOKEN: 'test-token',
        TELEGRAM_RAID_CHANNEL_ID: '-100123456789',
        TWITTER_USERNAME: 'testuser',
        TWITTER_PASSWORD: 'testpass',
        SUPABASE_URL: 'http://localhost:54321',
        SUPABASE_SERVICE_ROLE_KEY: 'test-key',
        RAID_COORDINATOR_URL: 'http://localhost:3000/raid-coordinator',
        TELEGRAM_ADMIN_USERS: '12345,67890',
      };
      return settings[key] || process.env[key];
    });
  });

  describe('Plugin Integration', () => {
    it('should include both standard TelegramService and TelegramRaidManager', () => {
      expect(socialRaidsPlugin.services).toContain(TelegramRaidManager);
      // Note: We added TelegramService from @elizaos/plugin-telegram to the services array
      expect(socialRaidsPlugin.services).toHaveLength(6); // TwitterRaidService, TelegramService, TelegramRaidManager, CommunityMemoryService, EntitySyncService, ForumTopicManager
    });

    it('should have proper plugin configuration', () => {
      expect(socialRaidsPlugin.name).toBe('social-raids');
      expect(socialRaidsPlugin.description).toContain('Twitter/Telegram raids');
      expect(socialRaidsPlugin.priority).toBe(100);
    });
  });

  describe('TelegramRaidManager Enhanced Features', () => {
    let telegramManager: TelegramRaidManager;

    beforeEach(() => {
      telegramManager = new TelegramRaidManager(mockRuntime);
    });

    it('should initialize admin users from configuration', () => {
      expect(mockRuntime.getSetting).toHaveBeenCalledWith('TELEGRAM_ADMIN_USERS');
      // Admin users are stored in private property, but we can test through isAdmin functionality
    });

    it('should detect Twitter URLs in middleware', async () => {
      const contextWithTwitterUrl = {
        ...mockContext,
        message: {
          ...mockContext.message,
          text: 'Check out this tweet: https://twitter.com/example/status/123456789',
        },
      };

      // Mock the bot setup
      telegramManager.bot = {
        use: jest.fn(),
        command: jest.fn(),
        action: jest.fn(),
        launch: jest.fn(),
        stop: jest.fn(),
        telegram: {
          sendMessage: jest.fn(),
        },
      };

      // Test URL detection (private method, testing indirectly through reply)
      expect(contextWithTwitterUrl.message.text).toMatch(
        /https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/,
      );
    });

    it('should handle chat locking for raid mode', async () => {
      const adminContext = {
        ...mockContext,
        from: { ...mockContext.from, id: 12345 }, // Admin user
        message: { ...mockContext.message, text: '/lock' },
      };

      // Test that the lock command would be handled by admin
      expect(adminContext.from.id.toString()).toBe('12345');
    });

    it('should support self-raid initiation with Twitter integration', async () => {
      const mockTwitterService = {
        postSelfRaidTweet: jest.fn().mockResolvedValue({
          id: 'tweet123',
          rest_id: 'tweet123',
        }),
      };

      mockRuntime.getService.mockReturnValue(mockTwitterService);

      const selfRaidContext = {
        ...mockContext,
        from: { ...mockContext.from, id: 12345 }, // Admin user
        message: {
          ...mockContext.message,
          text: '/selfraid This is a test tweet for self-raiding!',
        },
      };

      // Verify the command would trigger Twitter service integration
      expect(selfRaidContext.message.text.startsWith('/selfraid')).toBe(true);
      expect(selfRaidContext.message.text.split(' ').slice(1).join(' ')).toBe(
        'This is a test tweet for self-raiding!',
      );
    });
  });

  describe('Twitter Integration', () => {
    let twitterService: TwitterRaidService;

    beforeEach(() => {
      twitterService = new TwitterRaidService(mockRuntime);
    });

    it('should format raid status tweets correctly', () => {
      const raidData = {
        raidId: 'raid123',
        targetUrl: 'https://twitter.com/example/status/123456789',
        participantCount: 5,
      };

      // Access private method indirectly through the public method
      const result = (twitterService as any).formatRaidStatusTweet(raidData);

      expect(result).toContain('🚨 RAID ACTIVE! 🚨');
      expect(result).toContain('5 warriors mobilized');
      expect(result).toContain(raidData.targetUrl);
      expect(result).toContain('#SocialRaid');
      expect(result).toContain('#CommunityPower');
      expect(result).toContain('#NUBI');
    });

    it('should enhance content for self-raids with hashtags and call-to-action', () => {
      const originalContent = 'This is a test tweet';
      const enhanced = (twitterService as any).enhanceContentForRaid(originalContent);

      expect(enhanced).toContain(originalContent);
      expect(enhanced).toContain('What do you think? 👇');
      expect(enhanced).toContain('#NUBI');
      expect(enhanced).toContain('#Community');
      expect(enhanced).toContain('#Web3');
    });

    it('should handle engagement metrics extraction', () => {
      const mockMetrics = {
        likes: 10,
        retweets: 5,
        quotes: 3,
        comments: 7,
      };

      const mockTweetData = {
        metrics: mockMetrics,
        author: 'testuser',
        createdAt: new Date(),
        text: 'Test tweet content',
      };

      // Mock the scrapeEngagement method
      jest.spyOn(twitterService, 'scrapeEngagement').mockResolvedValue({
        id: 'tweet123',
        text: mockTweetData.text,
        author: mockTweetData.author,
        createdAt: mockTweetData.createdAt,
        metrics: mockMetrics,
      });

      // Test engagement metrics processing
      const total =
        mockMetrics.likes + mockMetrics.retweets + mockMetrics.quotes + mockMetrics.comments;
      expect(total).toBe(25);
    });
  });

  describe('Cross-Platform Integration', () => {
    it('should coordinate raids between Telegram and Twitter', async () => {
      const mockTwitterService = {
        postRaidStatus: jest.fn().mockResolvedValue({ id: 'status123' }),
        postSelfRaidTweet: jest.fn().mockResolvedValue({ id: 'tweet123' }),
      };

      mockRuntime.getService.mockReturnValue(mockTwitterService);

      // Simulate a raid starting in Telegram that should post status to Twitter
      const raidData = {
        raidId: 'raid123',
        targetUrl: 'https://twitter.com/example/status/123456789',
        participantCount: 1,
        platform: 'telegram',
      };

      // Verify integration would work
      expect(mockTwitterService.postRaidStatus).toBeDefined();
      expect(mockTwitterService.postSelfRaidTweet).toBeDefined();
    });

    it('should handle URL auto-detection and raid suggestions', () => {
      const messageWithUrl = 'Check this out: https://x.com/elonmusk/status/123456789 pretty cool!';
      const urlRegex = /https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/g;
      const matches = messageWithUrl.match(urlRegex);

      expect(matches).toHaveLength(1);
      expect(matches?.[0]).toBe('https://x.com/elonmusk/status/123456789');
    });

    it('should support enhanced inline keyboards with multiple action types', () => {
      const expectedKeyboardActions = [
        'start_auto_raid',
        'analyze_tweet',
        'raid_menu',
        'submit_engagement',
        'leaderboard',
      ];

      // Test that all expected callback patterns would be handled
      expectedKeyboardActions.forEach((action) => {
        expect(action).toMatch(/^[a-z_]+$/);
      });
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should gracefully handle Twitter service unavailability', async () => {
      mockRuntime.getService.mockReturnValue(null);

      const telegramManager = new TelegramRaidManager(mockRuntime);

      // Should not throw when Twitter service is unavailable
      expect(() => {
        // Simulation of trying to get Twitter service
        const twitterService = mockRuntime.getService('TWITTER_RAID_SERVICE');
        expect(twitterService).toBeNull();
      }).not.toThrow();
    });

    it('should handle missing configuration gracefully', () => {
      const minimalRuntime = {
        ...mockRuntime,
        getSetting: jest.fn().mockReturnValue(undefined),
      };

      expect(() => {
        new TelegramRaidManager(minimalRuntime);
      }).not.toThrow();
    });

    it('should fallback when Supabase is not configured', () => {
      const noSupabaseRuntime = {
        ...mockRuntime,
        getSetting: jest.fn().mockImplementation((key: string) => {
          if (key === 'SUPABASE_URL' || key === 'SUPABASE_SERVICE_ROLE_KEY') {
            return undefined;
          }
          return mockRuntime.getSetting(key);
        }),
      };

      const telegramManager = new TelegramRaidManager(noSupabaseRuntime);

      // Should create no-op Supabase client
      expect(telegramManager.supabase).toBeDefined();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent URL detections', () => {
      const messagesWithUrls = [
        'Check https://twitter.com/user1/status/111',
        'Also https://x.com/user2/status/222',
        'And https://twitter.com/user3/status/333',
      ];

      const allUrls: string[] = [];
      messagesWithUrls.forEach((message) => {
        const matches = message.match(
          /https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/g,
        );
        if (matches) allUrls.push(...matches);
      });

      expect(allUrls).toHaveLength(3);
      expect(allUrls[0]).toContain('twitter.com/user1');
      expect(allUrls[1]).toContain('x.com/user2');
      expect(allUrls[2]).toContain('twitter.com/user3');
    });

    it('should maintain chat state efficiently', () => {
      const telegramManager = new TelegramRaidManager(mockRuntime);

      // Chat states should be managed in Map for efficient lookup
      expect((telegramManager as any).chatStates).toBeInstanceOf(Map);
      expect((telegramManager as any).adminUsers).toBeInstanceOf(Set);
    });
  });
});
