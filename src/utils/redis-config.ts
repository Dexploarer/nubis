/**
 * Redis Configuration and Integration Utilities
 * ===========================================
 * 
 * This module provides Redis connection management and integration
 * with the ElizaOS memory system optimizations.
 * 
 * FOLLOWS ELIZAOS PATTERNS:
 * 1. Implements abstract cache interface (getCache, setCache, deleteCache)
 * 2. Provides Redis Pub/Sub for message bus replacement in multi-process deployments
 * 3. Follows established Redis configuration patterns
 */

import { createClient, RedisClientType } from 'redis';
import { logger } from '@elizaos/core';

/**
 * Redis configuration interface
 * Follows ElizaOS Redis configuration patterns
 */
export interface RedisConfig {
  url: string;
  password?: string;
  db?: number;
  keyPrefix?: string;
  maxMemory?: string;
  evictionPolicy?: string;
  connectionPool?: {
    min: number;
    max: number;
    acquireTimeoutMillis: number;
    createTimeoutMillis: number;
    destroyTimeoutMillis: number;
    idleTimeoutMillis: number;
    reapIntervalMillis: number;
    createRetryIntervalMillis: number;
  };
  // ElizaOS-specific Redis configuration
  ttl?: {
    short: number;   // 5 minutes for frequently accessed data
    medium: number;  // 1 hour for moderately accessed data
    long: number;    // 24 hours for rarely accessed data
  };
}

/**
 * Redis client wrapper with enhanced functionality
 * Implements ElizaOS abstract cache interface and Pub/Sub capabilities
 */
export class RedisManager {
  private client: RedisClientType | null = null;
  private config: RedisConfig;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private subscribers: Map<string, Set<(message: any) => void>> = new Map();

  constructor(config: RedisConfig) {
    this.config = config;
  }

  // ============================================================================
  // ELIZAOS ABSTRACT CACHE INTERFACE IMPLEMENTATION
  // ============================================================================

  /**
   * Implements ElizaOS abstract cache interface: getCache<T>
   * @param key The key to look up in the cache
   * @returns Promise resolving to the cached value
   */
  async getCache<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.get(key);
      if (value) {
        return JSON.parse(value) as T;
      }
      return undefined;
    } catch (error) {
      logger.warn(`Failed to get cache for key ${key}: ${error.message}`);
      return undefined;
    }
  }

  /**
   * Implements ElizaOS abstract cache interface: setCache<T>
   * @param key The key to store in the cache
   * @param value The value to cache
   * @returns Promise resolving to true if the cache was set successfully
   */
  async setCache<T>(key: string, value: T): Promise<boolean> {
    try {
      await this.setEx(key, this.config.ttl?.medium || 3600, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.warn(`Failed to set cache for key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * Implements ElizaOS abstract cache interface: deleteCache
   * @param key The key to delete from the cache
   * @returns Promise resolving to true if the value was successfully deleted
   */
  async deleteCache(key: string): Promise<boolean> {
    try {
      await this.del(key);
      return true;
    } catch (error) {
      logger.warn(`Failed to delete cache for key ${key}: ${error.message}`);
      return false;
    }
  }

  // ============================================================================
  // REDIS PUB/SUB FOR MESSAGE BUS REPLACEMENT
  // ============================================================================

  /**
   * Subscribe to a Redis channel for message bus replacement
   * @param channel The channel to subscribe to
   * @param callback The callback function to handle messages
   */
  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      // Add callback to subscribers map
      if (!this.subscribers.has(channel)) {
        this.subscribers.set(channel, new Set());
      }
      this.subscribers.get(channel)!.add(callback);

      // Subscribe to Redis channel
      await this.client.subscribe(channel, (message) => {
        try {
          const parsedMessage = JSON.parse(message);
          // Notify all subscribers for this channel
          const channelSubscribers = this.subscribers.get(channel);
          if (channelSubscribers) {
            channelSubscribers.forEach(cb => cb(parsedMessage));
          }
        } catch (error) {
          logger.error(`Failed to parse message from channel ${channel}: ${error.message}`);
        }
      });

      logger.info(`Subscribed to Redis channel: ${channel}`);
    } catch (error) {
      logger.error(`Failed to subscribe to channel ${channel}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Unsubscribe from a Redis channel
   * @param channel The channel to unsubscribe from
   * @param callback The specific callback to remove (optional)
   */
  async unsubscribe(channel: string, callback?: (message: any) => void): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      if (callback) {
        // Remove specific callback
        const channelSubscribers = this.subscribers.get(channel);
        if (channelSubscribers) {
          channelSubscribers.delete(callback);
          if (channelSubscribers.size === 0) {
            this.subscribers.delete(channel);
            await this.client.unsubscribe(channel);
          }
        }
      } else {
        // Remove all callbacks for this channel
        this.subscribers.delete(channel);
        await this.client.unsubscribe(channel);
      }

      logger.info(`Unsubscribed from Redis channel: ${channel}`);
    } catch (error) {
      logger.error(`Failed to unsubscribe from channel ${channel}: ${error.message}`);
    }
  }

  /**
   * Publish message to a Redis channel
   * @param channel The channel to publish to
   * @param message The message to publish
   */
  async publish(channel: string, message: any): Promise<number> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const serializedMessage = JSON.stringify(message);
      const result = await this.client.publish(channel, serializedMessage);
      logger.debug(`Published message to channel ${channel}, ${result} subscribers`);
      return result;
    } catch (error) {
      logger.error(`Failed to publish message to channel ${channel}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get list of active channels
   * Note: Redis v5 doesn't support pubsub('channels') directly
   * This method returns an empty array as a placeholder
   */
  async getActiveChannels(): Promise<string[]> {
    if (!this.client || !this.isConnected) {
      return [];
    }

    try {
      // Redis v5 doesn't support pubsub('channels') method
      // In a real implementation, you would need to track channels manually
      // or use a different approach to get active channels
      logger.warn('getActiveChannels not implemented for Redis v5 - returning empty array');
      return [];
    } catch (error) {
      logger.error(`Failed to get active channels: ${error.message}`);
      return [];
    }
  }

  // ============================================================================
  // EXISTING REDIS OPERATIONS
  // ============================================================================

  /**
   * Initialize Redis connection
   */
  async connect(): Promise<void> {
    try {
      if (this.client) {
        await this.disconnect();
      }

      this.client = createClient({
        url: this.config.url,
        password: this.config.password,
        database: this.config.db || 0,
        socket: {
          connectTimeout: 10000,
        },
        // Redis v5 uses different retry configuration
        // The old retry_strategy is deprecated
        // Connection retries are handled automatically by the client
      });

      // Set up event handlers
      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
      });

      this.client.on('error', (err) => {
        logger.error(`Redis client error: ${err.message}`);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        logger.info('Redis client disconnected');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis client reconnecting...');
        this.reconnectAttempts++;
      });

      await this.client.connect();
    } catch (error) {
      logger.error(`Failed to connect to Redis: ${error.message}`);
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        // Unsubscribe from all channels
        for (const channel of this.subscribers.keys()) {
          await this.unsubscribe(channel);
        }

        await this.client.quit();
        this.client = null;
        this.isConnected = false;
        logger.info('Redis client disconnected');
      } catch (error) {
        logger.error(`Failed to disconnect from Redis: ${error.message}`);
      }
    }
  }

  /**
   * Check if Redis is connected
   */
  isRedisConnected(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Set a key value
   */
  async set(key: string, value: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const fullKey = this.config.keyPrefix ? `${this.config.keyPrefix}${key}` : key;
      await this.client.set(fullKey, value);
    } catch (error) {
      logger.error(`Failed to set Redis key ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Set a key value with expiration
   */
  async setEx(key: string, seconds: number, value: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const fullKey = this.config.keyPrefix ? `${this.config.keyPrefix}${key}` : key;
      await this.client.setEx(fullKey, seconds, value);
    } catch (error) {
      logger.error(`Failed to set Redis key ${key} with expiration: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a key value
   */
  async get(key: string): Promise<string | null> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const fullKey = this.config.keyPrefix ? `${this.config.keyPrefix}${key}` : key;
      return await this.client.get(fullKey);
    } catch (error) {
      logger.error(`Failed to get Redis key ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a key
   */
  async del(key: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const fullKey = this.config.keyPrefix ? `${this.config.keyPrefix}${key}` : key;
      await this.client.del(fullKey);
    } catch (error) {
      logger.error(`Failed to delete Redis key ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete keys by pattern
   */
  async delByPattern(pattern: string): Promise<number> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const fullPattern = this.config.keyPrefix ? `${this.config.keyPrefix}${pattern}` : pattern;
      const keys = await this.client.keys(fullPattern);
      
      if (keys.length > 0) {
        const deleted = await this.client.del(keys);
        logger.info(`Deleted ${deleted} Redis keys matching pattern: ${pattern}`);
        return deleted;
      }
      
      return 0;
    } catch (error) {
      logger.error(`Failed to delete Redis keys by pattern ${pattern}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Set hash field
   */
  async hSet(key: string, field: string, value: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const fullKey = this.config.keyPrefix ? `${this.config.keyPrefix}${key}` : key;
      await this.client.hSet(fullKey, field, value);
    } catch (error) {
      logger.error(`Failed to set Redis hash field ${key}.${field}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get hash field
   */
  async hGet(key: string, field: string): Promise<string | null> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const fullKey = this.config.keyPrefix ? `${this.config.keyPrefix}${key}` : key;
      return await this.client.hGet(fullKey, field);
    } catch (error) {
      logger.error(`Failed to get Redis hash field ${key}.${field}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all hash fields
   */
  async hGetAll(key: string): Promise<Record<string, string>> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const fullKey = this.config.keyPrefix ? `${this.config.keyPrefix}${key}` : key;
      return await this.client.hGetAll(fullKey);
    } catch (error) {
      logger.error(`Failed to get Redis hash fields ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const fullKey = this.config.keyPrefix ? `${this.config.keyPrefix}${key}` : key;
      const result = await this.client.exists(fullKey);
      return result === 1;
    } catch (error) {
      logger.error(`Failed to check Redis key existence ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * Get TTL for a key
   */
  async ttl(key: string): Promise<number> {
    if (!this.client || !this.isConnected) {
      return -2; // Key doesn't exist
    }

    try {
      const fullKey = this.config.keyPrefix ? `${this.config.keyPrefix}${key}` : key;
      return await this.client.ttl(fullKey);
    } catch (error) {
      logger.error(`Failed to get TTL for Redis key ${key}: ${error.message}`);
      return -2;
    }
  }

  /**
   * Flush database
   */
  async flushDb(): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      await this.client.flushDb();
      logger.info('Redis database flushed');
    } catch (error) {
      logger.error(`Failed to flush Redis database: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get Redis info
   */
  async getInfo(): Promise<Record<string, string>> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const info = await this.client.info();
      const result: Record<string, string> = {};
      
      info.split('\r\n').forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          if (key && value) {
            result[key] = value;
          }
        }
      });
      
      return result;
    } catch (error) {
      logger.error(`Failed to get Redis info: ${error.message}`);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.client || !this.isConnected) {
        return false;
      }

      await this.client.ping();
      return true;
    } catch (error) {
      logger.error(`Redis health check failed: ${error.message}`);
      return false;
    }
  }
}

/**
 * Create Redis manager instance from environment variables
 */
export function createRedisManagerFromEnv(): RedisManager | null {
  const redisUrl = process.env.REDIS_URL?.trim();
  
  if (!redisUrl) {
    logger.info('Redis URL not configured, Redis caching disabled');
    return null;
  }

  const config: RedisConfig = {
    url: redisUrl,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'elizaos:',
    maxMemory: process.env.REDIS_MAX_MEMORY || '256mb',
    evictionPolicy: process.env.REDIS_EVICTION_POLICY || 'allkeys-lru',
    connectionPool: {
      min: parseInt(process.env.REDIS_POOL_MIN || '2'),
      max: parseInt(process.env.REDIS_POOL_MAX || '10'),
      acquireTimeoutMillis: parseInt(process.env.REDIS_ACQUIRE_TIMEOUT || '30000'),
      createTimeoutMillis: parseInt(process.env.REDIS_CREATE_TIMEOUT || '30000'),
      destroyTimeoutMillis: parseInt(process.env.REDIS_DESTROY_TIMEOUT || '5000'),
      idleTimeoutMillis: parseInt(process.env.REDIS_IDLE_TIMEOUT || '30000'),
      reapIntervalMillis: parseInt(process.env.REDIS_REAP_INTERVAL || '1000'),
      createRetryIntervalMillis: parseInt(process.env.REDIS_CREATE_RETRY_INTERVAL || '200'),
    },
    ttl: {
      short: parseInt(process.env.REDIS_TTL_SHORT || '300', 10), // 5 minutes
      medium: parseInt(process.env.REDIS_TTL_MEDIUM || '3600', 10), // 1 hour
      long: parseInt(process.env.REDIS_TTL_LONG || '86400', 10), // 24 hours
    },
  };

  return new RedisManager(config);
}

/**
 * Global Redis manager instance
 */
let globalRedisManager: RedisManager | null = null;

/**
 * Get or create global Redis manager
 */
export function getGlobalRedisManager(): RedisManager | null {
  if (!globalRedisManager) {
    globalRedisManager = createRedisManagerFromEnv();
  }
  return globalRedisManager;
}

/**
 * Initialize global Redis manager
 */
export async function initializeGlobalRedis(): Promise<void> {
  const manager = getGlobalRedisManager();
  if (manager) {
    try {
      await manager.connect();
      logger.info('Global Redis manager initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize global Redis manager: ${error.message}`);
      globalRedisManager = null;
    }
  }
}

/**
 * Cleanup global Redis manager
 */
export async function cleanupGlobalRedis(): Promise<void> {
  if (globalRedisManager) {
    try {
      await globalRedisManager.disconnect();
      globalRedisManager = null;
      logger.info('Global Redis manager cleaned up');
    } catch (error) {
      logger.error(`Failed to cleanup global Redis manager: ${error.message}`);
    }
  }
}

export default RedisManager;
