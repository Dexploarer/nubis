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
    ttl?: {
        short: number;
        medium: number;
        long: number;
    };
}
/**
 * Redis client wrapper with enhanced functionality
 * Implements ElizaOS abstract cache interface and Pub/Sub capabilities
 */
export declare class RedisManager {
    private client;
    private config;
    private isConnected;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private subscribers;
    constructor(config: RedisConfig);
    /**
     * Implements ElizaOS abstract cache interface: getCache<T>
     * @param key The key to look up in the cache
     * @returns Promise resolving to the cached value
     */
    getCache<T>(key: string): Promise<T | undefined>;
    /**
     * Implements ElizaOS abstract cache interface: setCache<T>
     * @param key The key to store in the cache
     * @param value The value to cache
     * @returns Promise resolving to true if the cache was set successfully
     */
    setCache<T>(key: string, value: T): Promise<boolean>;
    /**
     * Implements ElizaOS abstract cache interface: deleteCache
     * @param key The key to delete from the cache
     * @returns Promise resolving to true if the value was successfully deleted
     */
    deleteCache(key: string): Promise<boolean>;
    /**
     * Subscribe to a Redis channel for message bus replacement
     * @param channel The channel to subscribe to
     * @param callback The callback function to handle messages
     */
    subscribe(channel: string, callback: (message: any) => void): Promise<void>;
    /**
     * Unsubscribe from a Redis channel
     * @param channel The channel to unsubscribe from
     * @param callback The specific callback to remove (optional)
     */
    unsubscribe(channel: string, callback?: (message: any) => void): Promise<void>;
    /**
     * Publish message to a Redis channel
     * @param channel The channel to publish to
     * @param message The message to publish
     */
    publish(channel: string, message: any): Promise<number>;
    /**
     * Get list of active channels
     * Note: Redis v5 doesn't support pubsub('channels') directly
     * This method returns an empty array as a placeholder
     */
    getActiveChannels(): Promise<string[]>;
    /**
     * Initialize Redis connection
     */
    connect(): Promise<void>;
    /**
     * Disconnect from Redis
     */
    disconnect(): Promise<void>;
    /**
     * Check if Redis is connected
     */
    isRedisConnected(): boolean;
    /**
     * Set a key value
     */
    set(key: string, value: string): Promise<void>;
    /**
     * Set a key value with expiration
     */
    setEx(key: string, seconds: number, value: string): Promise<void>;
    /**
     * Get a key value
     */
    get(key: string): Promise<string | null>;
    /**
     * Delete a key
     */
    del(key: string): Promise<void>;
    /**
     * Delete keys by pattern
     */
    delByPattern(pattern: string): Promise<number>;
    /**
     * Set hash field
     */
    hSet(key: string, field: string, value: string): Promise<void>;
    /**
     * Get hash field
     */
    hGet(key: string, field: string): Promise<string | null>;
    /**
     * Get all hash fields
     */
    hGetAll(key: string): Promise<Record<string, string>>;
    /**
     * Check if key exists
     */
    exists(key: string): Promise<boolean>;
    /**
     * Get TTL for a key
     */
    ttl(key: string): Promise<number>;
    /**
     * Flush database
     */
    flushDb(): Promise<void>;
    /**
     * Get Redis info
     */
    getInfo(): Promise<Record<string, string>>;
    /**
     * Health check
     */
    healthCheck(): Promise<boolean>;
}
/**
 * Create Redis manager instance from environment variables
 */
export declare function createRedisManagerFromEnv(): RedisManager | null;
/**
 * Get or create global Redis manager
 */
export declare function getGlobalRedisManager(): RedisManager | null;
/**
 * Initialize global Redis manager
 */
export declare function initializeGlobalRedis(): Promise<void>;
/**
 * Cleanup global Redis manager
 */
export declare function cleanupGlobalRedis(): Promise<void>;
export default RedisManager;
