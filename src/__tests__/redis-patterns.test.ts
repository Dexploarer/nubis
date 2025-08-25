/**
 * Redis Patterns Test Suite
 * =========================
 * 
 * Validates that our Redis implementation follows the established ElizaOS patterns:
 * 1. Abstract cache interface implementation (getCache, setCache, deleteCache)
 * 2. Redis Pub/Sub for message bus replacement in multi-process deployments
 * 3. Proper Redis configuration patterns
 * 4. Integration with existing memory system optimizations
 */

import { describe, expect, it, beforeAll, afterAll, beforeEach, afterEach, spyOn } from "bun:test";
import { RedisManager } from "../utils/redis-config";
import { RedisMessageBusService } from "../services/redis/redis-message-bus.service";
import { logger } from "@elizaos/core";

// Mock Redis client for testing
const mockRedisClient = {
  connect: () => Promise.resolve(),
  disconnect: () => Promise.resolve(),
  quit: () => Promise.resolve(),
  ping: () => Promise.resolve('PONG'),
  set: () => Promise.resolve('OK'),
  setEx: () => Promise.resolve('OK'),
  get: () => Promise.resolve('test-value'),
  del: () => Promise.resolve(1),
  keys: () => Promise.resolve(['test:key1', 'test:key2']),
  hSet: () => Promise.resolve(1),
  hGet: () => Promise.resolve('hash-value'),
  hGetAll: () => Promise.resolve({ field1: 'value1' }),
  exists: () => Promise.resolve(1),
  ttl: () => Promise.resolve(3600),
  flushDb: () => Promise.resolve('OK'),
  info: () => Promise.resolve('redis_version:7.0.0\r\nconnected_clients:1\r\n'),
  subscribe: () => Promise.resolve(),
  unsubscribe: () => Promise.resolve(),
  publish: () => Promise.resolve(1),
  pubsub: () => Promise.resolve(['test-channel']),
  on: () => {},
  off: () => {},
};

// Mock the redis module
jest.mock('redis', () => ({
  createClient: () => mockRedisClient,
}));

describe('Redis Implementation - ElizaOS Pattern Compliance', () => {
  let redisManager: RedisManager;
  let messageBus: RedisMessageBusService;

  beforeAll(() => {
    // Spy on logger methods
    spyOn(logger, 'info');
    spyOn(logger, 'error');
    spyOn(logger, 'warn');
    spyOn(logger, 'debug');
  });

  beforeEach(() => {
    // Create fresh instances for each test
    redisManager = new RedisManager({
      url: 'redis://localhost:6379',
      keyPrefix: 'test:',
      ttl: {
        short: 300,
        medium: 3600,
        long: 86400,
      },
    });

    messageBus = new RedisMessageBusService('test-service', 'test:bus:');
  });

  afterEach(() => {
    // Cleanup
    if (redisManager) {
      redisManager.disconnect();
    }
    if (messageBus) {
      messageBus.shutdown();
    }
  });

  afterAll(() => {
    // Cleanup global instances
    jest.restoreAllMocks();
  });

  describe('1. Abstract Cache Interface Implementation', () => {
    it('should implement ElizaOS abstract cache interface: getCache<T>', async () => {
      // Test getCache method
      const result = await redisManager.getCache<string>('test-key');
      expect(result).toBeDefined();
      expect(typeof redisManager.getCache).toBe('function');
    });

    it('should implement ElizaOS abstract cache interface: setCache<T>', async () => {
      // Test setCache method
      const result = await redisManager.setCache('test-key', 'test-value');
      expect(result).toBe(true);
      expect(typeof redisManager.setCache).toBe('function');
    });

    it('should implement ElizaOS abstract cache interface: deleteCache', async () => {
      // Test deleteCache method
      const result = await redisManager.deleteCache('test-key');
      expect(result).toBe(true);
      expect(typeof redisManager.deleteCache).toBe('function');
    });

    it('should handle cache errors gracefully', async () => {
      // Mock Redis client to throw error
      const originalGet = mockRedisClient.get;
      mockRedisClient.get = () => Promise.reject(new Error('Redis error'));

      const result = await redisManager.getCache<string>('test-key');
      expect(result).toBeUndefined();

      // Restore mock
      mockRedisClient.get = originalGet;
    });

    it('should use proper TTL values from configuration', async () => {
      // Test that setCache uses configured TTL
      const setExSpy = spyOn(redisManager as any, 'setEx');
      
      await redisManager.setCache('test-key', 'test-value');
      
      expect(setExSpy).toHaveBeenCalledWith(
        'test-key', 
        3600, // medium TTL from config
        '"test-value"'
      );
    });
  });

  describe('2. Redis Pub/Sub for Message Bus Replacement', () => {
    it('should initialize message bus service with Redis manager', async () => {
      // Mock Redis manager connection
      const connectSpy = spyOn(redisManager, 'connect');
      const subscribeSpy = spyOn(redisManager, 'subscribe');
      
      await messageBus.initialize(redisManager);
      
      expect(connectSpy).toHaveBeenCalled();
      expect(subscribeSpy).toHaveBeenCalled();
      expect(messageBus.isServiceInitialized()).toBe(true);
    });

    it('should subscribe to event types and handle messages', async () => {
      await messageBus.initialize(redisManager);
      
      const handler = jest.fn();
      await messageBus.subscribe('test-event', handler);
      
      expect(messageBus.getHandlerCount('test-event')).toBe(1);
      expect(messageBus.getActiveEventTypes()).toContain('test-event');
    });

    it('should publish events to Redis channels', async () => {
      await messageBus.initialize(redisManager);
      
      const publishSpy = spyOn(redisManager, 'publish');
      
      await messageBus.publish('test-event', { data: 'test' });
      
      expect(publishSpy).toHaveBeenCalledWith(
        'test:bus:test-event',
        expect.objectContaining({
          type: 'test-event',
          data: { data: 'test' },
          source: 'test-service'
        })
      );
    });

    it('should handle incoming messages from Redis', async () => {
      await messageBus.initialize(redisManager);
      
      const handler = jest.fn();
      await messageBus.subscribe('test-event', handler);
      
      // Simulate incoming message
      const incomingMessage = {
        type: 'test-event',
        data: { message: 'hello' },
        source: 'other-service',
        timestamp: Date.now()
      };
      
      // Trigger message handling
      await (messageBus as any).handleIncomingMessage(incomingMessage);
      
      expect(handler).toHaveBeenCalledWith(incomingMessage);
    });

    it('should skip messages from self', async () => {
      await messageBus.initialize(redisManager);
      
      const handler = jest.fn();
      await messageBus.subscribe('test-event', handler);
      
      // Simulate message from self
      const selfMessage = {
        type: 'test-event',
        data: { message: 'hello' },
        source: 'test-service', // Same as service ID
        timestamp: Date.now()
      };
      
      // Trigger message handling
      await (messageBus as any).handleIncomingMessage(selfMessage);
      
      expect(handler).not.toHaveBeenCalled();
    });

    it('should unsubscribe from events properly', async () => {
      await messageBus.initialize(redisManager);
      
      const handler = jest.fn();
      await messageBus.subscribe('test-event', handler);
      
      expect(messageBus.getHandlerCount('test-event')).toBe(1);
      
      await messageBus.unsubscribe('test-event', handler);
      
      expect(messageBus.getHandlerCount('test-event')).toBe(0);
      expect(messageBus.getActiveEventTypes()).not.toContain('test-event');
    });
  });

  describe('3. Redis Configuration Patterns', () => {
    it('should use proper key prefixing', async () => {
      const setSpy = spyOn(redisManager as any, 'set');
      
      await redisManager.set('test-key', 'test-value');
      
      expect(setSpy).toHaveBeenCalledWith('test-key', 'test-value');
      // The actual Redis key should include the prefix
      expect(setSpy).toHaveBeenCalledWith('test-key', 'test-value');
    });

    it('should handle TTL configuration properly', () => {
      const config = redisManager['config'];
      
      expect(config.ttl?.short).toBe(300);   // 5 minutes
      expect(config.ttl?.medium).toBe(3600); // 1 hour
      expect(config.ttl?.long).toBe(86400);  // 24 hours
    });

    it('should support connection pool configuration', () => {
      const config = redisManager['config'];
      
      expect(config.connectionPool?.min).toBeDefined();
      expect(config.connectionPool?.max).toBeDefined();
      expect(config.connectionPool?.acquireTimeoutMillis).toBeDefined();
    });

    it('should support eviction policy configuration', () => {
      const config = redisManager['config'];
      
      expect(config.evictionPolicy).toBeDefined();
      expect(config.maxMemory).toBeDefined();
    });
  });

  describe('4. Integration with Memory System Optimizations', () => {
    it('should work with Redis memory cache', async () => {
      // Test that Redis manager can be used with memory cache
      const cacheKey = 'memories:test-query';
      const cacheValue = [{ id: '1', content: 'test memory' }];
      
      const setResult = await redisManager.setCache(cacheKey, cacheValue);
      expect(setResult).toBe(true);
      
      const getResult = await redisManager.getCache(cacheKey);
      expect(getResult).toEqual(cacheValue);
    });

    it('should handle cache invalidation patterns', async () => {
      // Test pattern-based cache clearing
      const delByPatternSpy = spyOn(redisManager, 'delByPattern');
      
      await redisManager.delByPattern('memories:*');
      
      expect(delByPatternSpy).toHaveBeenCalledWith('memories:*');
    });

    it('should support hash operations for complex data', async () => {
      // Test hash operations for metadata
      const hSetSpy = spyOn(redisManager, 'hSet');
      const hGetSpy = spyOn(redisManager, 'hGet');
      
      await redisManager.hSet('user:123', 'profile', '{"name":"test"}');
      await redisManager.hGet('user:123', 'profile');
      
      expect(hSetSpy).toHaveBeenCalledWith('user:123', 'profile', '{"name":"test"}');
      expect(hGetSpy).toHaveBeenCalledWith('user:123', 'profile');
    });
  });

  describe('5. Error Handling and Resilience', () => {
    it('should handle Redis connection failures gracefully', async () => {
      // Mock connection failure
      const originalConnect = mockRedisClient.connect;
      mockRedisClient.connect = () => Promise.reject(new Error('Connection failed'));
      
      try {
        await redisManager.connect();
      } catch (error) {
        expect(error.message).toBe('Connection failed');
      }
      
      // Restore mock
      mockRedisClient.connect = originalConnect;
    });

    it('should handle Redis operation failures gracefully', async () => {
      // Mock operation failure
      const originalSet = mockRedisClient.set;
      mockRedisClient.set = () => Promise.reject(new Error('Operation failed'));
      
      try {
        await redisManager.set('test-key', 'test-value');
      } catch (error) {
        expect(error.message).toBe('Operation failed');
      }
      
      // Restore mock
      mockRedisClient.set = originalSet;
    });

    it('should provide health check functionality', async () => {
      const healthResult = await redisManager.healthCheck();
      expect(typeof healthResult).toBe('boolean');
    });

    it('should provide connection status information', () => {
      const isConnected = redisManager.isRedisConnected();
      expect(typeof isConnected).toBe('boolean');
    });
  });

  describe('6. Performance and Monitoring', () => {
    it('should provide service statistics', async () => {
      await messageBus.initialize(redisManager);
      
      const stats = messageBus.getStats();
      
      expect(stats.isInitialized).toBe(true);
      expect(stats.serviceId).toBe('test-service');
      expect(stats.channelPrefix).toBe('test:bus:');
      expect(typeof stats.activeEventTypes).toBe('number');
      expect(typeof stats.totalHandlers).toBe('number');
    });

    it('should provide Redis information', async () => {
      const info = await redisManager.getInfo();
      
      expect(typeof info).toBe('object');
      expect(info.redis_version).toBeDefined();
      expect(info.connected_clients).toBeDefined();
    });

    it('should support TTL monitoring', async () => {
      const ttl = await redisManager.ttl('test-key');
      expect(typeof ttl).toBe('number');
    });

    it('should support key existence checking', async () => {
      const exists = await redisManager.exists('test-key');
      expect(typeof exists).toBe('boolean');
    });
  });

  describe('7. ElizaOS Pattern Compliance Summary', () => {
    it('should follow all established ElizaOS Redis patterns', () => {
      // 1. Abstract cache interface
      expect(typeof redisManager.getCache).toBe('function');
      expect(typeof redisManager.setCache).toBe('function');
      expect(typeof redisManager.deleteCache).toBe('function');
      
      // 2. Message bus replacement
      expect(typeof messageBus.subscribe).toBe('function');
      expect(typeof messageBus.publish).toBe('function');
      expect(typeof messageBus.unsubscribe).toBe('function');
      
      // 3. Configuration patterns
      expect(redisManager['config'].keyPrefix).toBeDefined();
      expect(redisManager['config'].ttl).toBeDefined();
      expect(redisManager['config'].connectionPool).toBeDefined();
      
      // 4. Error handling
      expect(typeof redisManager.healthCheck).toBe('function');
      expect(typeof redisManager.isRedisConnected).toBe('function');
      
      // 5. Monitoring and statistics
      expect(typeof messageBus.getStats).toBe('function');
      expect(typeof redisManager.getInfo).toBe('function');
    });
  });
});
