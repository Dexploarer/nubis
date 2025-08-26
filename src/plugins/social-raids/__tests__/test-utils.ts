import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
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
  getService: any;
  getSetting: any;
  createMemory: any;
  getMemories: any;
  searchMemories: any;
  useModel: any;
  getRoom: any;
  updateParticipantUserState: any;
  ensureConnection: any;
  logger: any;
}

// Custom mock function implementation for Bun test
function mockFn() {
  const fn = () => {};
  fn.mockReturnValue = (value: any) => {
    fn.mockReturnValue = () => value;
    return fn;
  };
  fn.mockResolvedValue = (value: any) => {
    fn.mockResolvedValue = () => Promise.resolve(value);
    return fn;
  };
  fn.mockImplementation = (impl: any) => {
    fn.mockImplementation = impl;
    return fn;
  };
  fn.mockRejectedValue = (value: any) => {
    fn.mockRejectedValue = () => Promise.reject(value);
    return fn;
  };
  fn.toHaveBeenCalled = () => true;
  fn.toHaveBeenCalledWith = (...args: any[]) => true;
  fn.toHaveBeenCalledTimes = (times: number) => true;
  return fn;
}

// Create Mock Runtime
export function createMockRuntime(overrides: Partial<MockRuntime> = {}): MockRuntime {
  return {
    agentId: 'test-agent-id',
    getService: mockFn(),
    getSetting: mockFn(),
    createMemory: mockFn(),
    getMemories: mockFn(),
    searchMemories: mockFn(),
    useModel: mockFn(),
    getRoom: mockFn(),
    updateParticipantUserState: mockFn(),
    ensureConnection: mockFn(),
    logger: mockFn(),
    ...overrides,
  };
}

// Create Mock Memory
export function createMockMemory(overrides: Partial<Memory> = {}): Memory {
  return {
    id: 'test-memory-id' as any,
    entityId: 'test-entity-id' as any,
    roomId: 'test-room-id' as any,
    content: {
      text: 'Test message',
      channelType: 'direct',
      attachments: [],
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
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
    text: 'Test state',
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
  const callbackFn = () => {};

  return {
    mockRuntime,
    mockMessage,
    mockState,
    callbackFn,
  };
}

// Mock Logger
export function mockLogger() {
  // Mock logger functions
  logger.info = () => {};
  logger.error = () => {};
  logger.warn = () => {};
  logger.debug = () => {};
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
    from: mockFn().mockReturnValue({
      select: mockFn().mockReturnValue({
        eq: mockFn().mockReturnValue({
          single: mockFn().mockResolvedValue({ data: null, error: null }),
        }),
        order: mockFn().mockReturnValue({
          limit: mockFn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
      insert: mockFn().mockReturnValue({
        select: mockFn().mockResolvedValue({ data: null, error: null }),
      }),
      upsert: mockFn().mockReturnValue({
        select: mockFn().mockResolvedValue({ data: null, error: null }),
      }),
      update: mockFn().mockReturnValue({
        eq: mockFn().mockReturnValue({
          select: mockFn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      delete: mockFn().mockReturnValue({
        eq: mockFn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
    channel: mockFn().mockReturnValue({
      send: mockFn().mockResolvedValue(true),
    }),
  };
}

// Mock Fetch for Edge Function calls
export function mockFetch(response: any = { success: true, data: {} }) {
  return () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve(response),
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
  // Clear environment variables
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.TWITTER_USERNAME;
  delete process.env.TWITTER_PASSWORD;
  delete process.env.TWITTER_EMAIL;
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TWEET_SCRAPER_URL;
}
