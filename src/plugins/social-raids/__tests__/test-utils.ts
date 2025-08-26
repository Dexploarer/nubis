import { describe, expect, it, mock, beforeEach, afterEach, spyOn } from 'bun:test';
import {
  type IAgentRuntime,
  type Memory,
  type State,
  type HandlerCallback,
  type Action,
  type Provider,
  type Evaluator,
  ModelType,
  logger,
} from '@elizaos/core';

// Mock Runtime Interface
export interface MockRuntime {
  agentId: string;
  getService: ReturnType<typeof mock>;
  getSetting: ReturnType<typeof mock>;
  createMemory: ReturnType<typeof mock>;
  getMemories: ReturnType<typeof mock>;
  searchMemories: ReturnType<typeof mock>;
  useModel: ReturnType<typeof mock>;
  getRoom: ReturnType<typeof mock>;
  updateParticipantUserState: ReturnType<typeof mock>;
  ensureConnection: ReturnType<typeof mock>;
  logger: ReturnType<typeof mock>;
}

// Create Mock Runtime
export function createMockRuntime(overrides: Partial<MockRuntime> = {}): MockRuntime {
  return {
    agentId: 'test-agent-id',
    getService: mock().mockReturnValue(null),
    getSetting: mock().mockReturnValue('test-setting'),
    createMemory: mock().mockResolvedValue({ id: 'test-memory-id' }),
    getMemories: mock().mockResolvedValue([]),
    searchMemories: mock().mockResolvedValue([]),
    useModel: mock().mockResolvedValue({ action: 'TEST', parameters: {} }),
    getRoom: mock().mockResolvedValue({ id: 'test-room', type: 'text' }),
    updateParticipantUserState: mock().mockResolvedValue(true),
    ensureConnection: mock().mockResolvedValue(true),
    logger: mock().mockReturnValue({ info: mock(), error: mock(), warn: mock(), debug: mock() }),
    ...overrides,
  };
}

// Create Mock Memory
export function createMockMemory(overrides: Partial<Memory> = {}): Memory {
  return {
    id: 'test-memory-id',
    content: {
      text: 'Test message',
      channelType: 'direct',
      attachments: [],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// Create Mock State
export function createMockState(overrides: Partial<State> = {}): State {
  return {
    values: {
      currentTask: 'test-task',
      userPreferences: {},
    },
    data: {
      sessionData: {},
      userData: {},
    },
    ...overrides,
  };
}

// Setup Action Test Helper
export function setupActionTest(
  options: {
    runtimeOverrides?: Partial<MockRuntime>;
    messageOverrides?: Partial<Memory>;
    stateOverrides?: Partial<State>;
  } = {}
) {
  const mockRuntime = createMockRuntime(options.runtimeOverrides);
  const mockMessage = createMockMemory(options.messageOverrides);
  const mockState = createMockState(options.stateOverrides);
  const callbackFn = mock().mockResolvedValue([]);

  return {
    mockRuntime,
    mockMessage,
    mockState,
    callbackFn,
  };
}

// Mock Logger
export function mockLogger() {
  spyOn(logger, 'info').mockImplementation(() => {});
  spyOn(logger, 'error').mockImplementation(() => {});
  spyOn(logger, 'warn').mockImplementation(() => {});
  spyOn(logger, 'debug').mockImplementation(() => {});
}

// Test Constants
export const TEST_CONSTANTS = {
  TWITTER_USERNAME: 'testuser',
  TELEGRAM_CHAT_ID: '123456789',
  RAID_ID: 'test-raid-123',
  TWEET_ID: '1234567890123456789',
  USER_ID: 'test-user-id',
};

// Mock Supabase Client
export function createMockSupabaseClient() {
  return {
    from: mock().mockReturnValue({
      select: mock().mockReturnValue({
        eq: mock().mockReturnValue({
          single: mock().mockResolvedValue({ data: null, error: null }),
        }),
        order: mock().mockReturnValue({
          limit: mock().mockResolvedValue({ data: [], error: null }),
        }),
      }),
      insert: mock().mockReturnValue({
        select: mock().mockResolvedValue({ data: null, error: null }),
      }),
      upsert: mock().mockReturnValue({
        select: mock().mockResolvedValue({ data: null, error: null }),
      }),
      update: mock().mockReturnValue({
        eq: mock().mockReturnValue({
          select: mock().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      delete: mock().mockReturnValue({
        eq: mock().mockResolvedValue({ data: null, error: null }),
      }),
    }),
    channel: mock().mockReturnValue({
      send: mock().mockResolvedValue(true),
    }),
  };
}

// Mock Fetch for Edge Function calls
export function mockFetch(response: any = { success: true, data: {} }) {
  return mock().mockResolvedValue({
    ok: true,
    json: mock().mockResolvedValue(response),
  });
}

// Test Data Generators
export const TestData = {
  createTweetData: (overrides = {}) => ({
    id: '1234567890123456789',
    text: 'Test tweet content',
    author: 'testuser',
    createdAt: new Date(),
    metrics: {
      likes: 10,
      retweets: 5,
      quotes: 2,
      comments: 8,
    },
    ...overrides,
  }),

  createRaidData: (overrides = {}) => ({
    id: 'test-raid-123',
    sessionId: 'session-123',
    targetUrl: 'https://twitter.com/testuser/status/1234567890123456789',
    targetPlatform: 'twitter',
    platform: 'telegram',
    createdBy: 'test-user-id',
    status: 'active',
    totalParticipants: 0,
    totalEngagements: 0,
    totalPoints: 0,
    startedAt: new Date(),
    ...overrides,
  }),

  createUserStats: (overrides = {}) => ({
    userId: 'test-user-id',
    username: 'testuser',
    totalPoints: 100,
    totalRaids: 5,
    totalEngagements: 25,
    rank: 'bronze',
    achievements: ['first_raid', 'engagement_master'],
    lastActive: new Date(),
    ...overrides,
  }),

  createEngagementData: (overrides = {}) => ({
    id: 'engagement-123',
    raidId: 'test-raid-123',
    userId: 'test-user-id',
    actionType: 'like',
    pointsAwarded: 1,
    timestamp: new Date(),
    verified: false,
    ...overrides,
  }),
};

// Assertion Helpers
export const Assertions = {
  expectCallbackCalled: (callbackFn: any, expectedText?: string) => {
    expect(callbackFn).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expectedText ? expect.stringContaining(expectedText) : expect.any(String),
        content: expect.any(Object),
      })
    );
  },

  expectServiceCalled: (mockRuntime: MockRuntime, serviceName: string) => {
    expect(mockRuntime.getService).toHaveBeenCalledWith(serviceName);
  },

  expectMemoryCreated: (mockRuntime: MockRuntime, expectedContent?: any) => {
    expect(mockRuntime.createMemory).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expectedContent || expect.any(Object),
      }),
      expect.any(String)
    );
  },
};

// Test Environment Setup
export function setupTestEnvironment() {
  // Mock environment variables
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
  process.env.TWITTER_USERNAME = 'testuser';
  process.env.TWITTER_PASSWORD = 'testpass';
  process.env.TWITTER_EMAIL = 'test@example.com';
  process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token';
  process.env.TWEET_SCRAPER_URL = 'https://test.supabase.co/functions/v1/tweet-scraper';
}

// Test Cleanup
export function cleanupTestEnvironment() {
  // Restore all mocks
  mock.restore();
  
  // Clear environment variables
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.TWITTER_USERNAME;
  delete process.env.TWITTER_PASSWORD;
  delete process.env.TWITTER_EMAIL;
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TWEET_SCRAPER_URL;
}
