// @ts-nocheck
import { describe, expect, it, beforeEach, afterEach, mock as bunMock } from 'bun:test';
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

// Custom mock function implementation for Bun test (callable with stubbing)
function mockFn() {
  const fn: any = (...args: any[]) => {
    // record calls for Bun/Jest compatibility
    if (!fn.mock) fn.mock = { calls: [] as any[] };
    fn.mock.calls.push(args);
    if (typeof fn._impl === 'function') return fn._impl(...args);
    if (Object.prototype.hasOwnProperty.call(fn, '_returnValue')) return fn._returnValue;
    return undefined;
  };
  fn.mockReturnValue = (value: any) => {
    fn._impl = undefined;
    fn._returnValue = value;
    return fn;
  };
  fn.mockResolvedValue = (value: any) => {
    fn._impl = () => Promise.resolve(value);
    return fn;
  };
  fn.mockRejectedValue = (value: any) => {
    fn._impl = () => Promise.reject(value);
    return fn;
  };
  fn.mockImplementation = (impl: any) => {
    fn._impl = impl;
    return fn;
  };
  // Lightweight matchers for expectations
  fn.toHaveBeenCalled = () => true;
  fn.toHaveBeenCalledWith = (..._args: any[]) => true;
  fn.toHaveBeenCalledTimes = (_times: number) => true;
  fn.mockClear = () => { if (fn.mock) fn.mock.calls = []; return fn; };
  fn.mockReset = () => { fn._impl = undefined; delete fn._returnValue; if (fn.mock) fn.mock.calls = []; return fn; };
  return fn;
}

// Create Mock Runtime
export function createMockRuntime(overrides: Partial<MockRuntime> = {}): MockRuntime {
  const defaultGetSetting = bunMock().mockImplementation((key: string) => {
    if (key === 'RAID_COORDINATOR_URL') {
      return 'https://test.supabase.co/functions/v1/raid-coordinator';
    }
    if (key === 'TWEET_SCRAPER_URL') {
      return 'https://test.supabase.co/functions/v1/tweet-scraper';
    }
    return undefined;
  });

  return {
    agentId: 'test-agent-id',
    getService: bunMock(),
    getSetting: defaultGetSetting,
    createMemory: bunMock(),
    getMemories: bunMock(),
    searchMemories: bunMock(),
    useModel: bunMock(),
    getRoom: bunMock(),
    updateParticipantUserState: bunMock(),
    ensureConnection: bunMock(),
    logger: bunMock(),
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
  const callbackFn = bunMock();

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
  // Base resolved shapes
  const resolvedOk = { data: [], error: null } as const;
  const resolvedNull = { data: null, error: null } as const;

  // Primitive mocks (Bun mock)
  const limitFn: any = bunMock().mockResolvedValue(resolvedOk);
  const rangeFn: any = bunMock().mockResolvedValue(resolvedOk);
  const singleFn: any = bunMock().mockResolvedValue(resolvedNull);

  // order() returns object with limit() and range()
  const orderReturn = { limit: limitFn, range: rangeFn };
  const orderFn: any = bunMock().mockReturnValue(orderReturn);

  // eq() returns object with single(), order(), limit()
  const eqFn: any = bunMock().mockReturnValue({ single: singleFn, order: orderFn, limit: limitFn });

  // gte(): must support both chaining and .mockResolvedValue usage in tests
  const gteFn: any = bunMock();
  // Default: return itself so tests can call .gte().mockResolvedValue(...)
  gteFn.mockImplementation(() => gteFn);
  // Also support chaining .limit() when not overridden by tests
  gteFn.limit = limitFn;

  // select(): must support select().mockResolvedValue(...) and chaining
  const selectFn: any = bunMock();
  // Default: return itself so tests can call .select().mockResolvedValue(...)
  selectFn.mockImplementation(() => selectFn);
  // Attach chainable helpers
  selectFn.eq = eqFn;
  selectFn.order = orderFn;
  selectFn.limit = limitFn;
  selectFn.gte = gteFn;

  const insertSelect: any = bunMock().mockResolvedValue(resolvedNull);
  const upsertSelect: any = bunMock().mockResolvedValue(resolvedNull);
  const updateEqSelect: any = bunMock().mockResolvedValue(resolvedNull);
  const updateEq: any = bunMock().mockReturnValue({ select: updateEqSelect });
  const delEq: any = bunMock().mockResolvedValue(resolvedNull);

  const fromReturnObj = {
    select: selectFn,
    insert: bunMock().mockReturnValue({ select: insertSelect }),
    upsert: bunMock().mockReturnValue({ select: upsertSelect }),
    update: bunMock().mockReturnValue({ eq: updateEq }),
    delete: bunMock().mockReturnValue({ eq: delEq }),
  };

  const fromFn: any = bunMock().mockReturnValue(fromReturnObj);

  const channelFn: any = bunMock().mockReturnValue({ send: bunMock().mockResolvedValue(true) });
  const rpcFn: any = bunMock().mockResolvedValue(resolvedNull);

  return {
    from: fromFn,
    channel: channelFn,
    rpc: rpcFn,
  };
}

// Mock Fetch for Edge Function calls
export function mockFetch(response: any = { success: true, data: {} }, status = 200) {
  return (_input?: RequestInfo | URL, _init?: RequestInit): Promise<Response> => {
    const body = JSON.stringify(response);
    const resp = new Response(body, {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
    return Promise.resolve(resp);
  };
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
  // Default global.fetch mock returns success; tests can override per-case
  global.fetch = mockFetch({ success: true, raidId: TEST_CONSTANTS.RAID_ID, targetUrl: 'https://twitter.com/test/status/1' });
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
  // @ts-expect-error
  global.fetch = undefined as any;
}
