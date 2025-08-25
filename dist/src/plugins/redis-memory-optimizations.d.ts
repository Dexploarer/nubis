/**
 * Redis-Enhanced Memory System Optimizations
 * ==========================================
 *
 * This module extends the memory system optimizations with Redis support
 * for distributed caching and enhanced performance in multi-instance deployments.
 */
import type { IAgentRuntime, Memory, UUID } from '@elizaos/core';
/**
 * Redis-enhanced memory cache with fallback to local LRU cache
 */
export declare class RedisMemoryCache {
    private redisManager;
    private localCache;
    private maxLocalSize;
    private defaultTTL;
    constructor();
    /**
     * Generate cache key for memory queries
     */
    private generateCacheKey;
    /**
     * Get memories with Redis-enhanced caching
     */
    getCachedMemories(runtime: IAgentRuntime, params: {
        tableName: string;
        roomId: string;
        count?: number;
        unique?: boolean;
        entityId?: string;
        agentId?: string;
        worldId?: string;
    }): Promise<Memory[]>;
    /**
     * Get search results with Redis-enhanced caching
     */
    getCachedSearchResults(runtime: IAgentRuntime, params: {
        tableName: string;
        embedding?: number[];
        roomId: string;
        count?: number;
        query?: string;
        similarityThreshold?: number;
    }): Promise<Memory[]>;
    /**
     * Cache memories in both Redis and local cache
     */
    private cacheMemories;
    /**
     * Clear cache for specific patterns
     */
    clearCache(pattern?: string): Promise<void>;
    /**
     * Get cache statistics
     */
    getCacheStats(): Promise<{
        local: {
            size: number;
            maxSize: number;
        };
        redis: {
            connected: boolean;
            info?: Record<string, string>;
        };
    }>;
    /**
     * Health check for Redis connection
     */
    healthCheck(): Promise<boolean>;
}
/**
 * Redis-enhanced batch memory operations
 */
export declare class RedisBatchOperations {
    private redisManager;
    constructor();
    /**
     * Create multiple memories with Redis-enhanced caching
     */
    createMemoriesBatch(runtime: IAgentRuntime, memories: Memory[], tableName: string, unique?: boolean): Promise<UUID[]>;
    /**
     * Update multiple memories with Redis-enhanced caching
     */
    updateMemoriesBatch(runtime: IAgentRuntime, updates: Array<{
        id: UUID;
        updates: Partial<Memory>;
    }>): Promise<{
        success: boolean;
        updatedCount: number;
        errors: string[];
    }>;
    /**
     * Delete multiple memories with Redis-enhanced caching
     */
    deleteMemoriesBatch(runtime: IAgentRuntime, memoryIds: UUID[]): Promise<{
        success: boolean;
        deletedCount: number;
        errors: string[];
    }>;
    /**
     * Invalidate related cache entries
     */
    private invalidateRelatedCache;
}
/**
 * Redis-enhanced contextual memory retrieval
 */
export declare class RedisContextualMemories {
    private redisManager;
    private cache;
    constructor();
    /**
     * Get comprehensive context with Redis-enhanced caching
     */
    getContextualMemories(runtime: IAgentRuntime, roomId: string, userMessage: string, options?: {
        messageCount?: number;
        factCount?: number;
        entityCount?: number;
        similarityThreshold?: number;
        includeEmbeddings?: boolean;
    }): Promise<{
        messages: Memory[];
        facts: Memory[];
        entities: Memory[];
        context: string;
        metadata: {
            totalMemories: number;
            cacheHit: boolean;
            queryTime: number;
            redisUsed: boolean;
        };
    }>;
    /**
     * Generate text embedding using the runtime's embedding model
     */
    private generateTextEmbedding;
    /**
     * Generate embeddings for memories that need them
     */
    private generateEmbeddingsForMemories;
    /**
     * Format contextual memories into a readable context string
     */
    private formatContextualMemories;
}
export { RedisMemoryCache, RedisBatchOperations, RedisContextualMemories };
export declare const redisMemoryCache: RedisMemoryCache;
export declare const redisBatchOperations: RedisBatchOperations;
export declare const redisContextualMemories: RedisContextualMemories;
