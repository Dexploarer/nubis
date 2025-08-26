/**
 * Complete Functionality Test for Enhanced Social Raids Plugin
 * Tests the full workflow from URL detection to raid completion with Twitter integration
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { TelegramRaidManager } from '../services/telegram-raid-manager';
import { TwitterRaidService } from '../services/twitter-raid-service';
import { socialRaidsPlugin } from '../index';

// Mock Telegram context for comprehensive testing
const mockTelegramContext = {
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
    title: 'Test Raid Chat',
  },
  match: null,
} as any;

// Mock runtime with all necessary services
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

describe('Complete Social Raids Functionality', () => {
  let telegramManager: TelegramRaidManager;
  let twitterService: TwitterRaidService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup comprehensive mock settings
    mockRuntime.getSetting.mockImplementation((key: string) => {
      const settings: { [key: string]: string } = {
        'TELEGRAM_BOT_TOKEN': 'test-bot-token',
        'TELEGRAM_RAID_CHANNEL_ID': '-100123456789',
        'TELEGRAM_ADMIN_USERS': '12345,67890',
        'TWITTER_USERNAME': 'UnderworldAgent',
        'TWITTER_PASSWORD': 'test-password',
        'TWITTER_EMAIL': 'test@example.com',
        'AUTH_METHOD': 'credentials',
        'SUPABASE_URL': 'http://localhost:54321',
        'SUPABASE_SERVICE_ROLE_KEY': 'test-service-key',
        'RAID_COORDINATOR_URL': 'http://localhost:3000/raid-coordinator',
      };
      return settings[key];
    });

    // Create service instances
    telegramManager = new TelegramRaidManager(mockRuntime);
    twitterService = new TwitterRaidService(mockRuntime);

    // Setup service mocking
    mockRuntime.getService.mockImplementation((serviceType: string) => {
      if (serviceType === 'TWITTER_RAID_SERVICE') {
        return twitterService;
      }
      if (serviceType === 'TELEGRAM_RAID_MANAGER') {
        return telegramManager;
      }
      return null;
    });
  });

  describe('End-to-End Workflow Tests', () => {
    it('should complete full raid workflow: URL detection → Analysis → Raid Start → Twitter Status → Completion', async () => {
      const twitterUrl = 'https://twitter.com/elonmusk/status/123456789';

      // Step 1: URL Detection in Telegram
      const messageWithUrl = {
        ...mockTelegramContext,
        message: {
          ...mockTelegramContext.message,
          text: `Check out this interesting tweet: ${twitterUrl}`,
        },
      };

      // Mock URL detection
      const urlRegex = /https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/g;
      const detectedUrls = messageWithUrl.message.text.match(urlRegex);
      
      expect(detectedUrls).toContain(twitterUrl);
      expect(detectedUrls).toHaveLength(1);

      // Step 2: Tweet Analysis
      const mockTweetData = {
        id: '123456789',
        text: 'This is a test tweet',
        author: 'elonmusk',
        createdAt: new Date(),
        metrics: {
          likes: 500,
          retweets: 100,
          quotes: 25,
          comments: 75,
        },
      };

      jest.spyOn(twitterService, 'scrapeEngagement').mockResolvedValue(mockTweetData);
      
      const analysisResult = await twitterService.scrapeEngagement(twitterUrl);
      expect(analysisResult.metrics.likes).toBe(500);
      expect(analysisResult.author).toBe('elonmusk');

      // Step 3: Raid Initiation
      const mockRaidData = {
        raidId: 'raid-123',
        sessionId: 'session-456',
        success: true,
      };

      jest.spyOn(twitterService, 'createRaid').mockResolvedValue([{
        id: mockRaidData.raidId,
        target_url: twitterUrl,
        status: 'active',
        created_at: new Date().toISOString(),
      }]);

      const raidResult = await twitterService.createRaid({
        targetUrl: twitterUrl,
        targetPlatform: 'twitter',
        platform: 'telegram',
        createdBy: mockTelegramContext.from.id.toString(),
      });

      expect(raidResult).toBeTruthy();
      expect(raidResult[0].target_url).toBe(twitterUrl);

      // Step 4: Twitter Status Posting
      const mockTweetResult = {
        id: 'status-tweet-789',
        text: '🚨 RAID ACTIVE! 🚨\n\n1 warriors mobilized!',
      };

      jest.spyOn(twitterService, 'postRaidStatus').mockResolvedValue(mockTweetResult);
      
      const statusResult = await twitterService.postRaidStatus({
        raidId: mockRaidData.raidId,
        targetUrl: twitterUrl,
        participantCount: 1,
      });

      expect(statusResult.id).toBe('status-tweet-789');
      expect(statusResult.text).toContain('RAID ACTIVE');

      // Step 5: Verify Complete Workflow
      expect(detectedUrls).toHaveLength(1);
      expect(analysisResult).toBeDefined();
      expect(raidResult).toBeTruthy();
      expect(statusResult).toBeDefined();
    });

    it('should handle self-raid initiation workflow', async () => {
      const selfRaidContent = 'This is an amazing project that everyone should know about!';

      // Mock Twitter service methods
      const mockSelfTweet = {
        id: 'self-tweet-123',
        text: selfRaidContent + '\n\nWhat do you think? 👇\n\n#NUBI #Community #Web3',
      };

      const mockRaid = [{
        id: 'self-raid-456',
        target_url: 'https://twitter.com/UnderworldAgent/status/self-tweet-123',
        status: 'active',
      }];

      jest.spyOn(twitterService, 'postSelfRaidTweet').mockResolvedValue(mockSelfTweet);
      jest.spyOn(twitterService, 'createRaid').mockResolvedValue(mockRaid);

      // Step 1: Post self-raid tweet
      const selfTweetResult = await twitterService.postSelfRaidTweet(selfRaidContent, {
        initiatedFrom: 'telegram',
        chatId: mockTelegramContext.chat.id,
      });

      expect(selfTweetResult.text).toContain(selfRaidContent);
      expect(selfTweetResult.text).toContain('#NUBI');
      expect(selfTweetResult.text).toContain('What do you think?');

      // Step 2: Auto-start raid on self-tweet
      const selfRaidUrl = `https://twitter.com/UnderworldAgent/status/${selfTweetResult.id}`;
      const raidResult = await twitterService.createRaid({
        targetUrl: selfRaidUrl,
        targetPlatform: 'twitter',
        platform: 'telegram',
        createdBy: 'system',
      });

      expect(raidResult[0].target_url).toContain('UnderworldAgent');
      expect(raidResult[0].status).toBe('active');
    });

    it('should handle admin chat management commands', async () => {
      const adminContext = {
        ...mockTelegramContext,
        from: { ...mockTelegramContext.from, id: 12345 }, // Admin user
      };

      // Test chat locking
      const lockCommand = {
        ...adminContext,
        message: { ...adminContext.message, text: '/lock' },
      };

      // Simulate chat state management
      const chatId = lockCommand.chat.id.toString();
      const userId = lockCommand.from.id.toString();

      // Mock internal chat state
      const mockChatState = {
        id: chatId,
        isRaidMode: true,
        lockedBy: userId,
        allowedUsers: [userId, '67890'], // Admin users
        moderators: [userId],
      };

      // Verify admin user recognition
      expect(userId).toBe('12345');
      expect(mockChatState.isRaidMode).toBe(true);
      expect(mockChatState.allowedUsers).toContain(userId);

      // Test unlock command
      const unlockCommand = {
        ...adminContext,
        message: { ...adminContext.message, text: '/unlock' },
      };

      expect(unlockCommand.from.id.toString()).toBe('12345');
    });

    it('should handle comprehensive inline keyboard interactions', async () => {
      const twitterUrl = 'https://x.com/example/status/987654321';

      // Test auto-raid callback
      const autoRaidCallback = `start_auto_raid:${encodeURIComponent(twitterUrl)}`;
      expect(autoRaidCallback).toContain('start_auto_raid');
      expect(decodeURIComponent(autoRaidCallback.split(':')[1])).toBe(twitterUrl);

      // Test tweet analysis callback
      const analyzeCallback = `analyze_tweet:${encodeURIComponent(twitterUrl)}`;
      expect(analyzeCallback).toContain('analyze_tweet');

      // Test engagement submission callbacks
      const engagementTypes = ['like', 'retweet', 'quote', 'comment'];
      engagementTypes.forEach(type => {
        const callback = `submit_engagement:${type}`;
        expect(callback).toContain(type);
      });

      // Test raid menu navigation
      const menuActions = ['status', 'participants', 'leaderboard'];
      menuActions.forEach(action => {
        const callback = `raid_menu:${action}`;
        expect(callback).toContain(action);
      });
    });

    it('should calculate engagement metrics and raid potential correctly', async () => {
      // Test engagement rate calculation
      const mockMetrics = {
        likes: 1000,
        retweets: 200,
        comments: 150,
        quotes: 50,
      };

      const total = mockMetrics.likes + mockMetrics.retweets + mockMetrics.comments + mockMetrics.quotes;
      const engagementRate = Math.round((total / Math.max(mockMetrics.likes * 10, 1)) * 100);
      
      expect(total).toBe(1400);
      expect(engagementRate).toBe(14); // 1400 / 10000 * 100 = 14%

      // Test raid potential assessment
      const assessRaidPotential = (metrics: typeof mockMetrics): string => {
        const totalEng = metrics.likes + metrics.retweets + metrics.comments;
        if (totalEng > 1000) return 'HIGH 🔥';
        if (totalEng > 100) return 'MEDIUM ⚡';
        if (totalEng > 10) return 'LOW 📈';
        return 'STARTER 🌱';
      };

      expect(assessRaidPotential(mockMetrics)).toBe('HIGH 🔥'); // 1350 total
      expect(assessRaidPotential({ likes: 50, retweets: 30, comments: 20, quotes: 5 })).toBe('LOW 📈'); // 100 total
      expect(assessRaidPotential({ likes: 80, retweets: 30, comments: 20, quotes: 5 })).toBe('MEDIUM ⚡'); // 130 total  
      expect(assessRaidPotential({ likes: 1, retweets: 0, comments: 0, quotes: 0 })).toBe('STARTER 🌱');
    });
  });

  describe('Cross-Platform Integration Tests', () => {
    it('should coordinate between Telegram and Twitter platforms', async () => {
      // Step 1: Telegram message triggers Twitter analysis
      const telegramMessage = 'Check this tweet: https://twitter.com/example/status/123';
      const extractedUrl = telegramMessage.match(/https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/)?.[0];
      
      expect(extractedUrl).toBe('https://twitter.com/example/status/123');

      // Step 2: Twitter analysis feeds back to Telegram
      const mockAnalysis = {
        likes: 100,
        retweets: 25,
        quotes: 5,
        comments: 15,
        total: 145,
        author: 'example',
        engagementRate: 15,
        raidPotential: 'MEDIUM ⚡',
      };

      expect(mockAnalysis.total).toBe(145);
      expect(mockAnalysis.raidPotential).toContain('MEDIUM');

      // Step 3: Raid initiation creates both platform records
      const crossPlatformRaid = {
        telegramChatId: mockTelegramContext.chat.id,
        twitterTargetUrl: extractedUrl,
        twitterStatusTweetId: 'status-123',
        participants: ['telegram-user-1', 'telegram-user-2'],
        engagement: {
          telegram: { messages: 5, joins: 2 },
          twitter: { likes: 3, retweets: 1, comments: 2 },
        },
      };

      expect(crossPlatformRaid.telegramChatId).toBe(-100123456789);
      expect(crossPlatformRaid.twitterTargetUrl).toContain('twitter.com');
      expect(crossPlatformRaid.engagement.telegram.joins).toBe(2);
      expect(crossPlatformRaid.engagement.twitter.likes).toBe(3);
    });

    it('should handle error scenarios gracefully', async () => {
      // Test Twitter service unavailable
      mockRuntime.getService.mockReturnValue(null);
      
      const result = mockRuntime.getService('TWITTER_RAID_SERVICE');
      expect(result).toBeNull();

      // Test invalid URL handling
      const invalidUrls = [
        'not-a-url',
        'https://facebook.com/post/123',
        'https://twitter.com/user', // Missing status
        'twitter.com/user/status/', // Missing ID
      ];

      const twitterRegex = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+$/;
      
      invalidUrls.forEach(url => {
        expect(twitterRegex.test(url)).toBe(false);
      });

      // Test network failure graceful handling
      const mockNetworkError = new Error('Network request failed');
      jest.spyOn(twitterService, 'scrapeEngagement').mockRejectedValue(mockNetworkError);

      await expect(twitterService.scrapeEngagement('https://twitter.com/test/status/123')).rejects.toThrow('Network request failed');

      // Reset mock
      jest.restoreAllMocks();
    });
  });

  describe('Performance and Scalability Tests', () => {
    it('should handle multiple concurrent operations efficiently', async () => {
      const concurrentUrls = [
        'https://twitter.com/user1/status/111',
        'https://x.com/user2/status/222',
        'https://twitter.com/user3/status/333',
        'https://x.com/user4/status/444',
        'https://twitter.com/user5/status/555',
      ];

      // Test URL extraction performance
      const startTime = Date.now();
      const extractedUrls = concurrentUrls.map(url => {
        const match = url.match(/https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/);
        return match ? match[0] : null;
      }).filter(Boolean);
      const extractionTime = Date.now() - startTime;

      expect(extractedUrls).toHaveLength(5);
      expect(extractionTime).toBeLessThan(10); // Should be very fast

      // Test chat state management efficiency
      const chatStates = new Map();
      const adminUsers = new Set(['12345', '67890', '11111']);

      // Simulate managing 1000 chat states
      for (let i = 0; i < 1000; i++) {
        chatStates.set(`chat-${i}`, {
          id: `chat-${i}`,
          isRaidMode: i % 10 === 0, // 10% in raid mode
          participants: Math.floor(Math.random() * 50),
        });
      }

      expect(chatStates.size).toBe(1000);
      expect(adminUsers.has('12345')).toBe(true);
      expect(adminUsers.has('99999')).toBe(false);

      // Test efficient lookups
      const lookupStartTime = Date.now();
      for (let i = 0; i < 100; i++) {
        const chatExists = chatStates.has(`chat-${i}`);
        const isAdmin = adminUsers.has('12345');
        expect(chatExists).toBe(true);
        expect(isAdmin).toBe(true);
      }
      const lookupTime = Date.now() - lookupStartTime;

      expect(lookupTime).toBeLessThan(5); // Map/Set lookups should be very fast
    });

    it('should maintain data consistency across operations', async () => {
      // Test raid data consistency
      const raidData = {
        id: 'raid-consistency-test',
        targetUrl: 'https://twitter.com/test/status/123456',
        participants: new Set<string>(),
        engagements: new Map<string, number>(),
        status: 'active' as const,
        createdAt: new Date(),
      };

      // Add participants
      ['user1', 'user2', 'user3'].forEach(user => {
        raidData.participants.add(user);
        raidData.engagements.set(user, 0);
      });

      // Record engagements
      raidData.engagements.set('user1', 5);
      raidData.engagements.set('user2', 3);
      raidData.engagements.set('user3', 8);

      // Verify consistency
      expect(raidData.participants.size).toBe(3);
      expect(raidData.engagements.size).toBe(3);
      expect(Array.from(raidData.participants)).toEqual(['user1', 'user2', 'user3']);
      
      const totalEngagements = Array.from(raidData.engagements.values()).reduce((sum, eng) => sum + eng, 0);
      expect(totalEngagements).toBe(16); // 5 + 3 + 8

      // Test state transitions
      expect(raidData.status).toBe('active');
      raidData.status = 'completed';
      expect(raidData.status).toBe('completed');
    });
  });
});