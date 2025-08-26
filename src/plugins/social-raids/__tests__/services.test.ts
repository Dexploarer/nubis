import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import { type IAgentRuntime } from '@elizaos/core';

// Import services
import { TwitterRaidService } from '../services/twitter-raid-service';
import { TelegramRaidManager } from '../services/telegram-raid-manager';
import { CommunityMemoryService } from '../services/community-memory-service';

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

describe('Social Raids Services', () => {
  let mockRuntime: any;

  beforeEach(() => {
    setupTestEnvironment();
    mockRuntime = createMockRuntime();
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('TwitterRaidService', () => {
    let service: TwitterRaidService;

    beforeEach(() => {
      service = new TwitterRaidService(mockRuntime as IAgentRuntime);
    });

    describe('Initialization', () => {
      it('should initialize with correct name', () => {
        expect(service.name).toBe('TWITTER_RAID_SERVICE');
      });

      it('should have required methods', () => {
        expect(service.authenticate).toBeDefined();
        expect(service.postTweet).toBeDefined();
        expect(service.scrapeEngagement).toBeDefined();
        expect(service.exportTweets).toBeDefined();
        expect(service.engageWithTweet).toBeDefined();
      });
    });

    describe('Authentication', () => {
      it('should authenticate successfully with valid credentials', async () => {
        // Mock successful authentication
        const mockScraper = {
          login: mock().mockResolvedValue(true),
          isLoggedIn: mock().mockResolvedValue(true),
        };

        // Mock the Scraper import
        const originalImport = global.import;
        global.import = mock().mockResolvedValue({ Scraper: mock().mockReturnValue(mockScraper) });

        const result = await service.authenticate();

        expect(result).toBe(true);
        expect(service.isAuthenticated).toBe(true);
      });

      it('should handle authentication failure', async () => {
        const mockScraper = {
          login: mock().mockRejectedValue(new Error('Auth failed')),
          isLoggedIn: mock().mockResolvedValue(false),
        };

        global.import = mock().mockResolvedValue({ Scraper: mock().mockReturnValue(mockScraper) });

        await expect(service.authenticate()).rejects.toThrow('Auth failed');
        expect(service.isAuthenticated).toBe(false);
      });
    });

    describe('Tweet Operations', () => {
      it('should post tweet successfully', async () => {
        const mockScraper = {
          postTweet: mock().mockResolvedValue({ id: '1234567890123456789' }),
        };

        service.scraper = mockScraper as any;
        service.isAuthenticated = true;

        const result = await service.postTweet('Test tweet content');

        expect(result).toBeDefined();
        expect(result.id).toBe('1234567890123456789');
      });

      it('should handle tweet posting failure', async () => {
        const mockScraper = {
          postTweet: mock().mockRejectedValue(new Error('Post failed')),
        };

        service.scraper = mockScraper as any;
        service.isAuthenticated = true;

        await expect(service.postTweet('Test tweet')).rejects.toThrow('Post failed');
      });

      it('should require authentication for tweet operations', async () => {
        service.isAuthenticated = false;

        await expect(service.postTweet('Test tweet')).rejects.toThrow('Twitter not authenticated');
      });
    });

    describe('Engagement Scraping', () => {
      it('should scrape engagement using Edge Function', async () => {
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

        const result = await service.scrapeEngagement('https://twitter.com/testuser/status/1234567890123456789');

        expect(result).toBeDefined();
        expect(result.id).toBe('1234567890123456789');
        expect(result.metrics.likes).toBe(100);
      });

      it('should handle Edge Function errors', async () => {
        global.fetch = mockFetch({ success: false, error: 'Edge Function error' });

        await expect(service.scrapeEngagement('https://twitter.com/testuser/status/1234567890123456789'))
          .rejects.toThrow('Tweet scraping failed');
      });
    });

    describe('Tweet Export', () => {
      it('should export tweets using Edge Function', async () => {
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

        const result = await service.exportTweets('testuser', 50, 0);

        expect(result).toBeDefined();
        expect(result.length).toBe(2);
        expect(result[0].text).toBe('Tweet 1');
      });

      it('should handle export errors', async () => {
        global.fetch = mockFetch({ success: false, error: 'Export failed' });

        await expect(service.exportTweets('testuser')).rejects.toThrow('Tweet scraping failed');
      });
    });
  });

  describe('TelegramRaidManager', () => {
    let service: TelegramRaidManager;

    beforeEach(() => {
      service = new TelegramRaidManager(mockRuntime as IAgentRuntime);
    });

    describe('Initialization', () => {
      it('should initialize with correct name', () => {
        expect(service.name).toBe('TELEGRAM_RAID_MANAGER');
      });

      it('should have required methods', () => {
        expect(service.start).toBeDefined();
        expect(service.stop).toBeDefined();
        expect(service.sendRaidNotification).toBeDefined();
        expect(service.handleCommand).toBeDefined();
      });
    });

    describe('Bot Lifecycle', () => {
      it('should start bot successfully', async () => {
        const mockBot = {
          launch: mock().mockResolvedValue(true),
          command: mock().mockReturnThis(),
          action: mock().mockReturnThis(),
          on: mock().mockReturnThis(),
        };

        service.bot = mockBot as any;

        await service.start();

        expect(mockBot.launch).toHaveBeenCalled();
      });

      it('should stop bot successfully', async () => {
        const mockBot = {
          stop: mock().mockResolvedValue(true),
        };

        service.bot = mockBot as any;

        await service.stop();

        expect(mockBot.stop).toHaveBeenCalled();
      });
    });

    describe('Command Handling', () => {
      it('should handle start command', async () => {
        const mockCtx = {
          message: { text: '/start' },
          reply: mock().mockResolvedValue(true),
        };

        await service.handleCommand(mockCtx as any);

        expect(mockCtx.reply).toHaveBeenCalledWith(
          expect.stringContaining('Welcome to the Social Raids Bot')
        );
      });

      it('should handle raid command', async () => {
        const mockCtx = {
          message: { text: '/raid https://twitter.com/testuser/status/1234567890123456789' },
          reply: mock().mockResolvedValue(true),
        };

        // Mock the raid creation
        service.createRaid = mock().mockResolvedValue(TestData.createRaidData());

        await service.handleCommand(mockCtx as any);

        expect(mockCtx.reply).toHaveBeenCalledWith(
          expect.stringContaining('Raid started')
        );
      });

      it('should handle join command', async () => {
        const mockCtx = {
          message: { text: '/join session-123' },
          reply: mock().mockResolvedValue(true),
        };

        service.joinRaid = mock().mockResolvedValue({
          raid: TestData.createRaidData(),
          participant: { id: 'participant-123', username: 'testuser' },
        });

        await service.handleCommand(mockCtx as any);

        expect(mockCtx.reply).toHaveBeenCalledWith(
          expect.stringContaining('Joined raid')
        );
      });
    });

    describe('Raid Notifications', () => {
      it('should send raid notification', async () => {
        const mockBot = {
          telegram: {
            sendMessage: mock().mockResolvedValue(true),
          },
        };

        service.bot = mockBot as any;

        const raidData = TestData.createRaidData();
        await service.sendRaidNotification(raidData, 'test-channel');

        expect(mockBot.telegram.sendMessage).toHaveBeenCalledWith(
          'test-channel',
          expect.stringContaining('NEW RAID STARTED')
        );
      });
    });
  });

  describe('CommunityMemoryService', () => {
    let service: CommunityMemoryService;

    beforeEach(() => {
      service = new CommunityMemoryService(mockRuntime as IAgentRuntime);
    });

    describe('Initialization', () => {
      it('should initialize with correct name', () => {
        expect(service.name).toBe('COMMUNITY_MEMORY_SERVICE');
      });

      it('should have required methods', () => {
        expect(service.recordInteraction).toBeDefined();
        expect(service.getUserPersonality).toBeDefined();
        expect(service.updateLeaderboard).toBeDefined();
        expect(service.getCommunityInsights).toBeDefined();
      });
    });

    describe('Interaction Recording', () => {
      it('should record interaction successfully', async () => {
        const mockSupabase = createMockSupabaseClient();
        service.supabase = mockSupabase as any;

        const interaction = {
          userId: 'test-user-id',
          raidId: 'test-raid-123',
          actionType: 'like',
          points: 1,
          sentiment: 'positive',
        };

        await service.recordInteraction(interaction);

        expect(mockSupabase.from).toHaveBeenCalledWith('community_interactions');
      });

      it('should update user personality', async () => {
        const mockSupabase = createMockSupabaseClient();
        service.supabase = mockSupabase as any;

        const personality = {
          userId: 'test-user-id',
          traits: ['active', 'helpful'],
          engagementStyle: 'supportive',
          lastUpdated: new Date(),
        };

        await service.updateUserPersonality(personality);

        expect(mockSupabase.from).toHaveBeenCalledWith('user_personalities');
      });
    });

    describe('Leaderboard Management', () => {
      it('should update leaderboard', async () => {
        const mockSupabase = createMockSupabaseClient();
        service.supabase = mockSupabase as any;

        const userStats = TestData.createUserStats();
        await service.updateLeaderboard(userStats);

        expect(mockSupabase.from).toHaveBeenCalledWith('leaderboards');
      });

      it('should get leaderboard', async () => {
        const mockSupabase = createMockSupabaseClient();
        mockSupabase.from().select().order().limit.mockResolvedValue({
          data: [TestData.createUserStats()],
          error: null,
        });

        service.supabase = mockSupabase as any;

        const result = await service.getLeaderboard(10);

        expect(result).toBeDefined();
        expect(result.length).toBe(1);
      });
    });

    describe('Memory Fragments', () => {
      it('should create memory fragment', async () => {
        const mockSupabase = createMockSupabaseClient();
        service.supabase = mockSupabase as any;

        const fragment = {
          userId: 'test-user-id',
          content: 'User helped organize a successful raid',
          category: 'leadership',
          weight: 0.8,
          timestamp: new Date(),
        };

        await service.createMemoryFragment(fragment);

        expect(mockSupabase.from).toHaveBeenCalledWith('memory_fragments');
      });

      it('should retrieve memory fragments', async () => {
        const mockSupabase = createMockSupabaseClient();
        mockSupabase.from().select().eq().order().limit.mockResolvedValue({
          data: [
            {
              id: 'fragment-1',
              userId: 'test-user-id',
              content: 'Memory fragment 1',
              category: 'engagement',
              weight: 0.7,
            },
          ],
          error: null,
        });

        service.supabase = mockSupabase as any;

        const result = await service.getMemoryFragments('test-user-id', 5);

        expect(result).toBeDefined();
        expect(result.length).toBe(1);
      });
    });

    describe('Community Insights', () => {
      it('should generate community insights', async () => {
        const mockSupabase = createMockSupabaseClient();
        mockSupabase.from().select().gte().mockResolvedValue({
          data: [
            TestData.createEngagementData(),
            TestData.createEngagementData({ actionType: 'retweet' }),
          ],
          error: null,
        });

        service.supabase = mockSupabase as any;

        const insights = await service.getCommunityInsights();

        expect(insights).toBeDefined();
        expect(insights.totalEngagements).toBe(2);
      });
    });
  });

  describe('Service Integration', () => {
    it('should handle service dependencies correctly', async () => {
      const twitterService = new TwitterRaidService(mockRuntime as IAgentRuntime);
      const telegramService = new TelegramRaidManager(mockRuntime as IAgentRuntime);
      const memoryService = new CommunityMemoryService(mockRuntime as IAgentRuntime);

      expect(twitterService.name).toBe('TWITTER_RAID_SERVICE');
      expect(telegramService.name).toBe('TELEGRAM_RAID_MANAGER');
      expect(memoryService.name).toBe('COMMUNITY_MEMORY_SERVICE');
    });

    it('should handle service initialization errors', async () => {
      const invalidRuntime = createMockRuntime({
        getSetting: mock().mockReturnValue(null),
      });

      const service = new TwitterRaidService(invalidRuntime as IAgentRuntime);

      // Should handle missing settings gracefully
      expect(service).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const service = new CommunityMemoryService(mockRuntime as IAgentRuntime);
      const mockSupabase = createMockSupabaseClient();
      mockSupabase.from().select().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      service.supabase = mockSupabase as any;

      await expect(service.getLeaderboard(10)).rejects.toThrow('Database connection failed');
    });

    it('should handle network errors', async () => {
      const service = new TwitterRaidService(mockRuntime as IAgentRuntime);
      global.fetch = mock().mockRejectedValue(new Error('Network error'));

      await expect(service.scrapeEngagement('https://twitter.com/testuser/status/1234567890123456789'))
        .rejects.toThrow('Tweet scraping failed');
    });

    it('should handle invalid data gracefully', async () => {
      const service = new CommunityMemoryService(mockRuntime as IAgentRuntime);
      const mockSupabase = createMockSupabaseClient();
      mockSupabase.from().select().mockResolvedValue({
        data: null,
        error: null,
      });

      service.supabase = mockSupabase as any;

      const result = await service.getLeaderboard(10);
      expect(result).toEqual([]);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large datasets efficiently', async () => {
      const service = new CommunityMemoryService(mockRuntime as IAgentRuntime);
      const mockSupabase = createMockSupabaseClient();
      
      // Mock large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => 
        TestData.createEngagementData({ id: `engagement-${i}` })
      );

      mockSupabase.from().select().limit.mockResolvedValue({
        data: largeDataset,
        error: null,
      });

      service.supabase = mockSupabase as any;

      const result = await service.getCommunityInsights();
      expect(result).toBeDefined();
    });

    it('should implement proper pagination', async () => {
      const service = new CommunityMemoryService(mockRuntime as IAgentRuntime);
      const mockSupabase = createMockSupabaseClient();

      service.supabase = mockSupabase as any;

      await service.getLeaderboard(50, 100); // offset 100, limit 50

      expect(mockSupabase.from().select().order().range).toHaveBeenCalledWith(100, 149);
    });
  });
});
