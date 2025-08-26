/// <reference path="../../../../types/bun-test.d.ts" />
import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import { type IAgentRuntime, type Memory, type State, type HandlerCallback } from '@elizaos/core';

// Import actions
import { startRaidAction } from '../actions/start-raid';
import { joinRaidAction } from '../actions/join-raid';
import { submitEngagementAction } from '../actions/submit-engagement';
import { viewLeaderboardAction } from '../actions/view-leaderboard';
import { scrapeTweetsAction } from '../actions/scrape-tweets';

// Import test utilities
import {
  setupActionTest,
  createMockRuntime,
  createMockMemory,
  createMockState,
  mockLogger,
  mockFetch,
  TestData,
  Assertions,
  setupTestEnvironment,
  cleanupTestEnvironment,
  TEST_CONSTANTS,
} from './test-utils';

describe('Social Raids Actions', () => {
  beforeEach(() => {
    mockLogger();
    setupTestEnvironment();
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('Start Raid Action', () => {
    it('should validate when raid command is present', async () => {
      const setup = setupActionTest();
      setup.mockMessage.content = {
        text: 'Start a raid on https://twitter.com/testuser/status/1234567890123456789',
        channelType: 'direct',
      };

      const isValid = await startRaidAction.validate(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
      );

      expect(isValid).toBe(true);
    });

    it('should not validate for unrelated messages', async () => {
      const setup = setupActionTest();
      setup.mockMessage.content = {
        text: 'Hello, how are you?',
        channelType: 'direct',
      };

      const isValid = await startRaidAction.validate(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
      );

      expect(isValid).toBe(false);
    });

    it('should handle raid creation successfully', async () => {
      const setup = setupActionTest({
        runtimeOverrides: {
          getService: mock().mockReturnValue({
            createRaid: mock().mockResolvedValue(TestData.createRaidData()),
          }),
        },
      });

      setup.mockMessage.content = {
        text: 'Start a raid on https://twitter.com/testuser/status/1234567890123456789',
        channelType: 'direct',
      };

      const result = await startRaidAction.handler(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
        {},
        setup.callbackFn as unknown as HandlerCallback,
      );

      expect(result.success).toBe(true);
      // startRaidAction success message headline is "RAID INITIATED!"
      Assertions.expectCallbackCalled(setup.callbackFn, 'RAID INITIATED');
    });

    it('should handle missing URL gracefully', async () => {
      const setup = setupActionTest();
      setup.mockMessage.content = {
        text: 'Start a raid',
        channelType: 'direct',
      };

      const result = await startRaidAction.handler(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
        {},
        setup.callbackFn as unknown as HandlerCallback,
      );

      expect(result.success).toBe(false);
      // Should prompt for a Twitter/X URL
      Assertions.expectCallbackCalled(setup.callbackFn, 'Twitter/X URL');
    });

    it('should handle service errors gracefully', async () => {
      const setup = setupActionTest();

      setup.mockMessage.content = {
        text: 'Start a raid on https://twitter.com/testuser/status/1234567890123456789',
        channelType: 'direct',
      };

      // Simulate Edge Function failure
      (globalThis as any).fetch = mockFetch({ success: false, error: 'Edge Function error' });

      const result = await startRaidAction.handler(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
        {},
        setup.callbackFn as unknown as HandlerCallback,
      );

      expect(result.success).toBe(false);
      Assertions.expectCallbackCalled(setup.callbackFn, 'Failed to start raid');
    });
  });

  describe('Join Raid Action', () => {
    it('should validate when join command is present', async () => {
      const setup = setupActionTest();
      setup.mockMessage.content = {
        text: 'Join raid session-123',
        channelType: 'direct',
      };

      const isValid = await joinRaidAction.validate(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
      );

      expect(isValid).toBe(true);
    });

    it('should handle successful raid joining', async () => {
      const setup = setupActionTest({
        runtimeOverrides: {
          getService: mock().mockReturnValue({
            joinRaid: mock().mockResolvedValue({
              raid: TestData.createRaidData(),
              participant: { id: 'participant-123', username: 'testuser' },
            }),
          }),
        },
      });

      setup.mockMessage.content = {
        text: 'Join raid session-123',
        channelType: 'direct',
      };

      const result = await joinRaidAction.handler(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
        {},
        setup.callbackFn as unknown as HandlerCallback,
      );

      expect(result.success).toBe(true);
      Assertions.expectCallbackCalled(setup.callbackFn, 'JOINED RAID');
    });

    it('should handle invalid session ID', async () => {
      const setup = setupActionTest();
      setup.mockMessage.content = {
        text: 'Join raid invalid-session',
        channelType: 'direct',
      };

      const result = await joinRaidAction.handler(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
        {},
        setup.callbackFn as unknown as HandlerCallback,
      );

      expect(result.success).toBe(false);
      Assertions.expectCallbackCalled(setup.callbackFn, 'Session ID required');
    });
  });

  describe('Submit Engagement Action', () => {
    it('should validate when engagement submission is present', async () => {
      const setup = setupActionTest();
      setup.mockMessage.content = {
        text: 'Submit engagement like for raid session-123',
        channelType: 'direct',
      };

      const isValid = await submitEngagementAction.validate(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
      );

      expect(isValid).toBe(true);
    });

    it('should handle successful engagement submission', async () => {
      const setup = setupActionTest({
        runtimeOverrides: {
          // Provide COMMUNITY_MEMORY_SERVICE with recordInteraction only
          getService: mock().mockImplementation((name: string) => {
            if (name === 'COMMUNITY_MEMORY_SERVICE') {
              return { recordInteraction: mock().mockResolvedValue(true) };
            }
            return null;
          }),
        },
      });

      setup.mockMessage.content = {
        text: 'Submit engagement like for raid session-123',
        channelType: 'direct',
      };

      const result = await submitEngagementAction.handler(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
        {},
        setup.callbackFn as unknown as HandlerCallback,
      );

      expect(result.success).toBe(true);
      Assertions.expectCallbackCalled(setup.callbackFn, 'ENGAGEMENT CONFIRMED');
    });

    it('should handle invalid engagement type', async () => {
      const setup = setupActionTest();
      setup.mockMessage.content = {
        text: 'Submit engagement invalid for raid session-123',
        channelType: 'direct',
      };

      const result = await submitEngagementAction.handler(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
        {},
        setup.callbackFn as unknown as HandlerCallback,
      );

      // Current handler defaults unknown types to 'like' and succeeds
      expect(result.success).toBe(true);
      Assertions.expectCallbackCalled(setup.callbackFn, 'ENGAGEMENT CONFIRMED');
    });
  });

  describe('View Leaderboard Action', () => {
    it('should validate when leaderboard command is present', async () => {
      const setup = setupActionTest();
      setup.mockMessage.content = {
        text: 'Show leaderboard',
        channelType: 'direct',
      };

      const isValid = await viewLeaderboardAction.validate(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
      );

      expect(isValid).toBe(true);
    });

    it('should display leaderboard successfully', async () => {
      const mockLeaderboard = [
        TestData.createUserStats({ username: 'user1', totalPoints: 100 }),
        TestData.createUserStats({ username: 'user2', totalPoints: 80 }),
        TestData.createUserStats({ username: 'user3', totalPoints: 60 }),
      ];

      const setup = setupActionTest({
        runtimeOverrides: {
          getService: mock().mockReturnValue({
            getLeaderboard: mock().mockResolvedValue(mockLeaderboard),
          }),
        },
      });

      setup.mockMessage.content = {
        text: 'Show leaderboard',
        channelType: 'direct',
      };

      const result = await viewLeaderboardAction.handler(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
        {},
        setup.callbackFn as unknown as HandlerCallback,
      );

      expect(result.success).toBe(true);
      Assertions.expectCallbackCalled(setup.callbackFn, 'LEADERBOARD');
    });

    it('should handle empty leaderboard', async () => {
      const setup = setupActionTest({
        runtimeOverrides: {
          getService: mock().mockReturnValue({
            getLeaderboard: mock().mockResolvedValue([]),
          }),
        },
      });

      setup.mockMessage.content = {
        text: 'Show leaderboard',
        channelType: 'direct',
      };

      const result = await viewLeaderboardAction.handler(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
        {},
        setup.callbackFn as unknown as HandlerCallback,
      );

      expect(result.success).toBe(true);
      Assertions.expectCallbackCalled(setup.callbackFn, 'No leaderboard data');
    });
  });

  describe('Scrape Tweets Action', () => {
    it('should validate when scrape command is present', async () => {
      const setup = setupActionTest();
      setup.mockMessage.content = {
        text: 'Scrape tweets from elonmusk',
        channelType: 'direct',
      };

      const isValid = await scrapeTweetsAction.validate(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
      );

      expect(isValid).toBe(true);
    });

    it('should handle successful tweet scraping', async () => {
      const setup = setupActionTest({
        runtimeOverrides: {
          getService: mock().mockReturnValue({
            exportTweets: mock().mockResolvedValue([
              TestData.createTweetData({ id: '1', text: 'Tweet 1' }),
              TestData.createTweetData({ id: '2', text: 'Tweet 2' }),
            ]),
          }),
        },
      });

      setup.mockMessage.content = {
        text: 'Scrape 50 tweets from elonmusk',
        channelType: 'direct',
      };

      const result = await scrapeTweetsAction.handler(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
        {},
        setup.callbackFn as unknown as HandlerCallback,
      );

      expect(result.success).toBe(true);
      Assertions.expectCallbackCalled(setup.callbackFn, 'SCRAPING TWEETS');
    });

    it('should handle missing username', async () => {
      const setup = setupActionTest();
      setup.mockMessage.content = {
        text: 'Scrape tweets',
        channelType: 'direct',
      };

      const result = await scrapeTweetsAction.handler(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
        {},
        setup.callbackFn as unknown as HandlerCallback,
      );

      expect(result.success).toBe(false);
      Assertions.expectCallbackCalled(setup.callbackFn, 'username to scrape');
    });

    it('should handle export errors from service', async () => {
      const setup = setupActionTest({
        runtimeOverrides: {
          getService: mock().mockReturnValue({
            exportTweets: mock().mockRejectedValue(new Error('Export failed')),
          }),
        },
      });
      setup.mockMessage.content = {
        text: 'Scrape tweets from elonmusk',
        channelType: 'direct',
      };

      const result = await scrapeTweetsAction.handler(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
        {},
        setup.callbackFn as unknown as HandlerCallback,
      );

      expect(result.success).toBe(false);
      Assertions.expectCallbackCalled(setup.callbackFn, 'TWEET SCRAPING FAILED');
    });

    it('should extract count and skip parameters correctly', async () => {
      const setup = setupActionTest({
        runtimeOverrides: {
          getService: mock().mockReturnValue({
            exportTweets: mock().mockResolvedValue([]),
          }),
        },
      });

      setup.mockMessage.content = {
        text: 'Scrape 200 tweets from elonmusk skip 1000',
        channelType: 'direct',
      };

      const result = await scrapeTweetsAction.handler(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
        {},
        setup.callbackFn as unknown as HandlerCallback,
      );

      expect(result.success).toBe(true);
      Assertions.expectCallbackCalled(setup.callbackFn, 'Count: 200');
      Assertions.expectCallbackCalled(setup.callbackFn, 'Skip: 1000');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message content', async () => {
      const setup = setupActionTest();
      setup.mockMessage.content = { text: '' };

      const isValid = await startRaidAction.validate(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
      );

      expect(isValid).toBe(false);
    });

    it('should handle null message content', async () => {
      const setup = setupActionTest();
      setup.mockMessage.content = null as any;

      const isValid = await startRaidAction.validate(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
      );

      expect(isValid).toBe(false);
    });

    it('should handle very long input', async () => {
      const setup = setupActionTest();
      setup.mockMessage.content = { text: 'a'.repeat(10000) };

      const isValid = await startRaidAction.validate(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
      );

      expect(isValid).toBe(false);
    });
  });

  describe('Service Integration', () => {
    it('should call correct services for each action', async () => {
      const setup = setupActionTest();

      // Test startRaid calls TWITTER_RAID_SERVICE
      setup.mockMessage.content = {
        text: 'Start a raid on https://twitter.com/testuser/status/1234567890123456789',
        channelType: 'direct',
      };

      await startRaidAction.handler(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
        {},
        setup.callbackFn as unknown as HandlerCallback,
      );

      // startRaidAction uses COMMUNITY_MEMORY_SERVICE to record interactions
      Assertions.expectServiceCalled(setup.mockRuntime, 'COMMUNITY_MEMORY_SERVICE');
    });

    it('should handle missing configuration gracefully', async () => {
      const setup = setupActionTest({
        runtimeOverrides: {
          // Simulate missing RAID_COORDINATOR_URL so handler throws
          getSetting: mock().mockImplementation((key: string) => {
            if (key === 'RAID_COORDINATOR_URL') return undefined;
            return undefined;
          }),
        },
      });

      setup.mockMessage.content = {
        text: 'Start a raid on https://twitter.com/testuser/status/1234567890123456789',
        channelType: 'direct',
      };

      const result = await startRaidAction.handler(
        setup.mockRuntime as unknown as IAgentRuntime,
        setup.mockMessage as Memory,
        setup.mockState as State,
        {},
        setup.callbackFn as unknown as HandlerCallback,
      );

      expect(result.success).toBe(false);
      Assertions.expectCallbackCalled(setup.callbackFn, 'Failed to start raid');
    });
  });
});
