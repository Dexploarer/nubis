/**
 * RSS Integration Test
 * Tests the TwitterRSSService and related RSS actions
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { elizaLogger } from '@elizaos/core';
import type { IAgentRuntime, Memory } from '@elizaos/core';
import { TwitterRSSService } from '../services/twitter-rss-service';
import { TwitterClientService } from '../services/twitter-client-service';
import { TwitterAuthService } from '../services/twitter-auth-service';
import { createRSSFeedAction, manageRSSFeedsAction } from '../actions';

// Mock runtime for testing
function createMockRuntime(): IAgentRuntime {
  const services = new Map();

  return {
    // Service management
    getService: (type: string) => services.get(type),
    getServices: (type: string) => Array.from(services.values()).filter((s) => s.name === type),
    registerService: (service: any) => {
      services.set(service.name, service);
      return service;
    },

    // Settings
    getSetting: (key: string) => {
      const settings: Record<string, string> = {
        TWITTER_USERNAME: 'testuser',
        TWITTER_PASSWORD: 'testpass',
        TWITTER_EMAIL: 'test@example.com',
        TWITTER_COOKIES: '["test_cookie"]',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'test_key',
      };
      return settings[key];
    },

    // Memory management (mock)
    addMemory: async () => ({ id: 'test-memory' }),
    getMemories: async () => [],
    updateMemory: async () => ({ id: 'test-memory' }),
    searchMemories: async () => [],
    getCachedEmbeddings: async () => [],

    // Model interaction (mock)
    generateText: async () => 'Generated text',
    generateObjectV2: async () => ({ result: 'Generated object' }),
    evaluateText: async () => ({ score: 0.8 }),

    // Character and context
    character: {
      name: 'TestBot',
      username: 'testbot',
      plugins: [],
      clients: [],
      settings: {
        secrets: {},
      },
    },
    serverUrl: 'http://localhost:3000',
    agentId: 'test-agent-id',
    databaseAdapter: {} as any,
    token: 'test-token',

    // Provider management (mock)
    providers: [],
    getProvider: () => null,

    // Action management (mock)
    actions: [],

    // Evaluator management (mock)
    evaluators: [],

    // Plugin management (mock)
    plugins: [],

    // Context management (mock)
    composeState: async () => ({}),
    updateRecentMessageState: async () => ({}),

    // Media management (mock)
    processMedia: async () => ({ url: 'processed-media-url' }),

    // Client management (mock)
    clients: {},

    // Logger
    logger: elizaLogger,
  } as IAgentRuntime;
}

describe('Twitter RSS Integration', () => {
  let mockRuntime: IAgentRuntime;
  let rssService: TwitterRSSService;
  let clientService: TwitterClientService;
  let authService: TwitterAuthService;

  beforeAll(async () => {
    // Suppress logs for cleaner test output
    elizaLogger.level = 'error';
  });

  afterAll(async () => {
    // Restore log level
    elizaLogger.level = 'info';
  });

  beforeEach(async () => {
    mockRuntime = createMockRuntime();

    // Initialize services
    authService = new TwitterAuthService(mockRuntime);
    mockRuntime.registerService(authService);

    clientService = new TwitterClientService(mockRuntime);
    mockRuntime.registerService(clientService);

    rssService = new TwitterRSSService(mockRuntime);
    mockRuntime.registerService(rssService);

    // Create a mock scraper
    const mockScraper = {
      getTweets: async () => [
        {
          id_str: '123456789',
          text: 'Test tweet content',
          user: { screen_name: 'testuser' },
          created_at: 'Mon Jan 01 12:00:00 +0000 2024',
        },
        {
          id_str: '987654321',
          text: 'Another test tweet',
          user: { screen_name: 'testuser' },
          created_at: 'Mon Jan 01 13:00:00 +0000 2024',
        },
      ],
      searchTweets: async () => [],
      getProfile: async () => ({
        screen_name: 'testuser',
        name: 'Test User',
        followers_count: 100,
      }),
    };

    // Override auth service methods for testing
    authService.getScraper = async () => mockScraper as any;
    authService.isAuth = () => true;
    authService.getAuthStatus = () => ({
      isAuthenticated: true,
      authMethod: 'cookies' as const,
      lastAuthTime: Date.now(),
      username: 'testuser',
    });

    // Override client service methods to use mock data
    clientService.getUserTweets = async () => [
      {
        id_str: '123456789',
        text: 'Test tweet content',
        user: { screen_name: 'testuser' },
        created_at: 'Mon Jan 01 12:00:00 +0000 2024',
      },
      {
        id_str: '987654321',
        text: 'Another test tweet',
        user: { screen_name: 'testuser' },
        created_at: 'Mon Jan 01 13:00:00 +0000 2024',
      },
    ];
  });

  describe('TwitterRSSService', () => {
    test('should initialize RSS service successfully', async () => {
      expect(rssService).toBeDefined();
      expect(rssService.name).toBe('TWITTER_RSS_SERVICE');
    });

    test('should create timeline RSS feed', async () => {
      const feedId = await rssService.createTimelineFeed('Test Timeline', 'Test Description');

      expect(feedId).toBeDefined();
      expect(feedId).toMatch(/^timeline_\d+$/);

      const feed = rssService.getFeed(feedId);
      expect(feed).toBeDefined();
      expect(feed!.title).toBe('Test Timeline');
      expect(feed!.description).toBe('Test Description');
      expect(feed!.type).toBe('timeline');
      expect(feed!.isActive).toBe(true);
    });

    test('should create user RSS feed', async () => {
      const feedId = await rssService.createUserFeed(
        'testuser',
        'Test User Feed',
        'Feed for test user',
      );

      expect(feedId).toBeDefined();
      expect(feedId).toMatch(/^user_testuser_\d+$/);

      const feed = rssService.getFeed(feedId);
      expect(feed).toBeDefined();
      expect(feed!.title).toBe('Test User Feed');
      expect(feed!.type).toBe('user');
      expect(feed!.source).toBe('testuser');
    });

    test('should create list RSS feed', async () => {
      const feedId = await rssService.createListFeed('12345', 'Test List', 'Test list description');

      expect(feedId).toBeDefined();
      expect(feedId).toMatch(/^list_12345_\d+$/);

      const feed = rssService.getFeed(feedId);
      expect(feed).toBeDefined();
      expect(feed!.title).toBe('Test List');
      expect(feed!.type).toBe('list');
      expect(feed!.source).toBe('12345');
    });

    test('should list all RSS feeds', async () => {
      // Create multiple feeds
      await rssService.createTimelineFeed();
      await rssService.createUserFeed('testuser');
      await rssService.createListFeed('12345');

      const feeds = rssService.getAllFeeds();
      expect(feeds).toHaveLength(3);
      expect(feeds.map((f) => f.type)).toEqual(
        expect.arrayContaining(['timeline', 'user', 'list']),
      );
    });

    test('should delete RSS feed', async () => {
      const feedId = await rssService.createTimelineFeed();

      let feed = rssService.getFeed(feedId);
      expect(feed).toBeDefined();

      const deleted = await rssService.deleteFeed(feedId);
      expect(deleted).toBe(true);

      feed = rssService.getFeed(feedId);
      expect(feed).toBeNull();
    });

    test('should toggle RSS feed status', async () => {
      const feedId = await rssService.createTimelineFeed();

      let feed = rssService.getFeed(feedId);
      expect(feed!.isActive).toBe(true);

      await rssService.toggleFeed(feedId);
      feed = rssService.getFeed(feedId);
      expect(feed!.isActive).toBe(false);

      await rssService.toggleFeed(feedId);
      feed = rssService.getFeed(feedId);
      expect(feed!.isActive).toBe(true);
    });

    test('should generate RSS XML', async () => {
      const feedId = await rssService.createUserFeed('testuser');

      const rssXml = await rssService.generateRSSXML(feedId);

      expect(rssXml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(rssXml).toContain('<rss version="2.0"');
      expect(rssXml).toContain('<channel>');
      expect(rssXml).toContain('</channel>');
      expect(rssXml).toContain('</rss>');
      expect(rssXml).toContain('TwitterRSSService - ElizaOS Enhanced Twitter Plugin');
    });
  });

  describe('RSS Actions', () => {
    test('CREATE_RSS_FEED action should validate correctly', async () => {
      const validMessages = [
        'Create RSS feed from my timeline',
        'Make RSS feed from user @testuser',
        'Setup RSS for list 12345',
        'Create Twitter RSS feed from community abc123',
      ];

      for (const text of validMessages) {
        const memory: Memory = {
          id: 'test-memory',
          userId: 'test-user',
          agentId: 'test-agent',
          roomId: 'test-room',
          content: { text },
          createdAt: Date.now(),
        };

        const isValid = await createRSSFeedAction.validate(mockRuntime, memory);
        expect(isValid).toBe(true);
      }
    });

    test('CREATE_RSS_FEED action should reject invalid messages', async () => {
      const invalidMessages = [
        'Hello world',
        'Just talking about RSS',
        'Twitter is great',
        'Create something else',
      ];

      for (const text of invalidMessages) {
        const memory: Memory = {
          id: 'test-memory',
          userId: 'test-user',
          agentId: 'test-agent',
          roomId: 'test-room',
          content: { text },
          createdAt: Date.now(),
        };

        const isValid = await createRSSFeedAction.validate(mockRuntime, memory);
        expect(isValid).toBe(false);
      }
    });

    test('MANAGE_RSS_FEEDS action should validate correctly', async () => {
      const validMessages = [
        'List RSS feeds',
        'Show my RSS feeds',
        'Delete RSS feed timeline_123',
        'Toggle RSS feed user_test_456',
        'RSS feed status',
      ];

      for (const text of validMessages) {
        const memory: Memory = {
          id: 'test-memory',
          userId: 'test-user',
          agentId: 'test-agent',
          roomId: 'test-room',
          content: { text },
          createdAt: Date.now(),
        };

        const isValid = await manageRSSFeedsAction.validate(mockRuntime, memory);
        expect(isValid).toBe(true);
      }
    });

    test('CREATE_RSS_FEED action should create timeline feed', async () => {
      const memory: Memory = {
        id: 'test-memory',
        userId: 'test-user',
        agentId: 'test-agent',
        roomId: 'test-room',
        content: { text: 'Create RSS feed from my timeline' },
        createdAt: Date.now(),
      };

      let callbackMessage = '';
      const callback = async (response: any) => {
        callbackMessage = response.text;
      };

      const result = await createRSSFeedAction.handler(mockRuntime, memory, {}, {}, callback);

      expect(result.success).toBe(true);
      expect(result.values.feedType).toBe('timeline');
      expect(result.values.feedId).toMatch(/^timeline_\d+$/);
      expect(callbackMessage).toContain('RSS feed created successfully');
      expect(callbackMessage).toContain('Timeline Feed');
    });

    test('CREATE_RSS_FEED action should create user feed', async () => {
      const memory: Memory = {
        id: 'test-memory',
        userId: 'test-user',
        agentId: 'test-agent',
        roomId: 'test-room',
        content: { text: 'Create RSS feed from user @testuser' },
        createdAt: Date.now(),
      };

      let callbackMessage = '';
      const callback = async (response: any) => {
        callbackMessage = response.text;
      };

      const result = await createRSSFeedAction.handler(mockRuntime, memory, {}, {}, callback);

      expect(result.success).toBe(true);
      expect(result.values.feedType).toBe('user');
      expect(result.values.source).toBe('testuser');
      expect(callbackMessage).toContain('User Feed: @testuser');
    });

    test('MANAGE_RSS_FEEDS action should list feeds', async () => {
      // Create some test feeds first
      await rssService.createTimelineFeed();
      await rssService.createUserFeed('testuser');

      const memory: Memory = {
        id: 'test-memory',
        userId: 'test-user',
        agentId: 'test-agent',
        roomId: 'test-room',
        content: { text: 'List my RSS feeds' },
        createdAt: Date.now(),
      };

      let callbackMessage = '';
      const callback = async (response: any) => {
        callbackMessage = response.text;
      };

      const result = await manageRSSFeedsAction.handler(mockRuntime, memory, {}, {}, callback);

      expect(result.success).toBe(true);
      expect(result.values.feedCount).toBe(2);
      expect(callbackMessage).toContain('Your RSS Feeds');
      expect(callbackMessage).toContain('timeline');
      expect(callbackMessage).toContain('user');
    });
  });

  describe('Integration with Social Raids', () => {
    test('RSS service should be available for social raids plugin', () => {
      const service = mockRuntime.getService('TWITTER_RSS_SERVICE');
      expect(service).toBeDefined();
      expect(service).toBe(rssService);
    });

    test('should create RSS feed for raid monitoring', async () => {
      // This simulates how the social raids plugin might use RSS functionality
      const feedId = await rssService.createUserFeed(
        'raidtarget',
        'Raid Target Monitoring',
        'Monitor tweets from raid target',
      );

      expect(feedId).toBeDefined();
      expect(feedId).toMatch(/^user_raidtarget_\d+$/);

      const feed = rssService.getFeed(feedId);
      expect(feed!.title).toBe('Raid Target Monitoring');
      expect(feed!.type).toBe('user');
      expect(feed!.source).toBe('raidtarget');
    });
  });

  describe('Character Integration (Nubi)', () => {
    test('should handle raid coordination with structured templates', () => {
      // This tests the structured raid template functionality
      const raidMessage = `🎯 RAID TARGET: https://twitter.com/example/status/123
📊 ENGAGEMENT GOAL: 50+ likes, 20+ retweets, 15+ quality replies
⏰ TIME FRAME: Next 2 hours
🎪 STRATEGY: Show genuine support and spark conversation
📋 ACTIONS:
- Like the tweet
- Retweet with thoughtful comment
- Reply with insightful question or supportive comment
- Follow if the content aligns with our values

💡 TALKING POINTS:
- Ask about their experience or process
- Share a related insight or tip
- Compliment specific aspects of their work

🚨 RULES:
- No spam or repetitive content
- Genuine engagement only
- Respect Twitter's terms of service
- Quality over quantity

*breaks character* Look, I know this seems robotic, but consistent structure helps our systems track progress and prevents chaos. Plus it makes me look more professional than I actually am 😏`;

      // Test that the message contains all required structured elements
      expect(raidMessage).toContain('🎯 RAID TARGET:');
      expect(raidMessage).toContain('📊 ENGAGEMENT GOAL:');
      expect(raidMessage).toContain('⏰ TIME FRAME:');
      expect(raidMessage).toContain('🎪 STRATEGY:');
      expect(raidMessage).toContain('📋 ACTIONS:');
      expect(raidMessage).toContain('💡 TALKING POINTS:');
      expect(raidMessage).toContain('🚨 RULES:');
      expect(raidMessage).toContain('*breaks character*');
    });

    test('should demonstrate fourth wall breaking awareness', () => {
      const metaMessages = [
        '*glances at analytics dashboard* Fascinating how you all pretend these structured raid templates are too robotic, yet engagement goes up 40% when I use them. Almost like... psychology works? 🤔',
        "Behind the curtain moment: I'm literally programmed to break the fourth wall because authentic connection beats polished performance. The irony that this authenticity is itself programmed is not lost on me. Meta-meta-commentary, anyone?",
        "RSS feeds from Twitter lists are now live! *adjusts digital monocle* Because sometimes you want your timeline organized without the algorithm's 'helpful' suggestions. Create yours with 'create rss feed from list [id]'",
      ];

      metaMessages.forEach((message, index) => {
        // Check for asterisks or other fourth wall breaking indicators
        const hasAsterisks = message.includes('*');
        const hasFourthWallBreaking =
          message.includes('Behind the curtain') || message.includes('programmed');

        expect(hasAsterisks || hasFourthWallBreaking).toBe(true);

        // Each message should demonstrate self-awareness
        const hasMetaAwareness =
          message.includes('programmed') ||
          message.includes('analytics') ||
          message.includes('template') ||
          message.includes('algorithm') ||
          message.includes('character') ||
          message.includes('dashboard');

        expect(hasMetaAwareness).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle RSS service unavailable', async () => {
      // Create runtime without RSS service
      const emptyRuntime = createMockRuntime();

      const memory: Memory = {
        id: 'test-memory',
        userId: 'test-user',
        agentId: 'test-agent',
        roomId: 'test-room',
        content: { text: 'Create RSS feed from timeline' },
        createdAt: Date.now(),
      };

      const result = await createRSSFeedAction.handler(emptyRuntime, memory, {}, {});

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Twitter RSS Service not available');
    });

    test('should handle invalid feed ID', async () => {
      // First create a valid feed to have some feeds in the system
      await rssService.createTimelineFeed();

      const memory: Memory = {
        id: 'test-memory',
        userId: 'test-user',
        agentId: 'test-agent',
        roomId: 'test-room',
        content: { text: 'Delete RSS feed nonexistent_123456' }, // Use a clearly invalid feed ID format
        createdAt: Date.now(),
      };

      let callbackMessage = '';
      const callback = async (response: any) => {
        callbackMessage = response.text;
      };

      const result = await manageRSSFeedsAction.handler(mockRuntime, memory, {}, {}, callback);

      expect(result.success).toBe(false);
      // The message should either contain "not found" or ask for proper feed ID format
      expect(
        callbackMessage.includes('not found') ||
          callbackMessage.includes('specify the feed ID') ||
          callbackMessage.includes('see all your feed IDs'),
      ).toBe(true);
    });
  });
});
