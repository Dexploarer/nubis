/**
 * Redis-Enhanced Memory System Optimizations
 * ==========================================
 * 
 * This module extends the memory system optimizations with Redis support
 * for distributed caching and enhanced performance in multi-instance deployments.
 */

import type { IAgentRuntime, Memory, UUID } from '@elizaos/core';
import { logger } from '@elizaos/core';
import { RedisManager, getGlobalRedisManager } from '../utils/redis-config';

/**
 * Redis-enhanced memory cache with fallback to local LRU cache
 */
export class RedisMemoryCache {
  private redisManager: RedisManager | null = null;
  private localCache = new Map<string, { value: Memory[]; timestamp: number; ttl: number }>();
  private maxLocalSize = 1000;
  private defaultTTL = 300; // 5 minutes

  constructor() {
    this.redisManager = getGlobalRedisManager();
  }

  /**
   * Generate cache key for memory queries
   */
  private generateCacheKey(params: Record<string, any>): string {
    const sortedKeys = Object.keys(params).sort();
    const keyParts = sortedKeys.map(key => {
      const value = params[key];
      if (value === undefined) return `${key}:undefined`;
      if (value === null) return `${key}:null`;
      return `${key}:${JSON.stringify(value)}`;
    });
    return `memories:${keyParts.join('|')}`;
  }

  /**
   * Get memories with Redis-enhanced caching
   */
  async getCachedMemories(
    runtime: IAgentRuntime,
    params: {
      tableName: string;
      roomId: string;
      count?: number;
      unique?: boolean;
      entityId?: string;
      agentId?: string;
      worldId?: string;
    }
  ): Promise<Memory[]> {
    const cacheKey = this.generateCacheKey(params);
    
    // Try Redis first if available
    if (this.redisManager?.isRedisConnected()) {
      try {
        const cached = await this.redisManager.get(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          logger.info(`Redis cache HIT for key: ${cacheKey}`);
          return parsed;
        }
      } catch (error) {
        logger.warn(`Redis cache error, falling back to local cache: ${error.message}`);
      }
    }

    // Try local cache
    const localCached = this.localCache.get(cacheKey);
    if (localCached && Date.now() - localCached.timestamp < localCached.ttl * 1000) {
      logger.info(`Local cache HIT for key: ${cacheKey}`);
      return localCached.value;
    }

    // Cache miss - query runtime
    logger.info(`Cache MISS for key: ${cacheKey}`);
    const memories = await runtime.getMemories(params);
    
    // Cache in both Redis and local cache
    await this.cacheMemories(cacheKey, memories);
    
    return memories;
  }

  /**
   * Get search results with Redis-enhanced caching
   */
  async getCachedSearchResults(
    runtime: IAgentRuntime,
    params: {
      tableName: string;
      embedding?: number[];
      roomId: string;
      count?: number;
      query?: string;
      similarityThreshold?: number;
    }
  ): Promise<Memory[]> {
    const cacheKey = this.generateCacheKey(params);
    
    // Try Redis first if available
    if (this.redisManager?.isRedisConnected()) {
      try {
        const cached = await this.redisManager.get(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          logger.info(`Redis search cache HIT for key: ${cacheKey}`);
          return parsed;
        }
      } catch (error) {
        logger.warn(`Redis search cache error, falling back to local cache: ${error.message}`);
      }
    }

    // Try local cache
    const localCached = this.localCache.get(cacheKey);
    if (localCached && Date.now() - localCached.timestamp < localCached.ttl * 1000) {
      logger.info(`Local search cache HIT for key: ${cacheKey}`);
      return localCached.value;
    }

    // Cache miss - query runtime
    logger.info(`Search cache MISS for key: ${cacheKey}`);
    const memories = await runtime.searchMemories(params);
    
    // Cache in both Redis and local cache
    await this.cacheMemories(cacheKey, memories);
    
    return memories;
  }

  /**
   * Cache memories in both Redis and local cache
   */
  private async cacheMemories(key: string, memories: Memory[]): Promise<void> {
    const ttl = this.defaultTTL;
    const timestamp = Date.now();
    
    // Cache in Redis if available
    if (this.redisManager?.isRedisConnected()) {
      try {
        await this.redisManager.setEx(key, ttl, JSON.stringify(memories));
        logger.debug(`Cached in Redis: ${key}`);
      } catch (error) {
        logger.warn(`Failed to cache in Redis: ${error.message}`);
      }
    }

    // Cache in local cache
    this.localCache.set(key, { value: memories, timestamp, ttl });
    
    // Maintain local cache size
    if (this.localCache.size > this.maxLocalSize) {
      const oldestKey = this.localCache.keys().next().value;
      this.localCache.delete(oldestKey);
    }
  }

  /**
   * Clear cache for specific patterns
   */
  async clearCache(pattern?: string): Promise<void> {
    if (pattern) {
      // Clear Redis pattern
      if (this.redisManager?.isRedisConnected()) {
        try {
          const deleted = await this.redisManager.delByPattern(pattern);
          logger.info(`Cleared ${deleted} Redis cache entries for pattern: ${pattern}`);
        } catch (error) {
          logger.warn(`Failed to clear Redis cache pattern: ${error.message}`);
        }
      }

      // Clear local cache pattern
      const keysToDelete: string[] = [];
      for (const key of this.localCache.keys()) {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this.localCache.delete(key));
      logger.info(`Cleared ${keysToDelete.length} local cache entries for pattern: ${pattern}`);
    } else {
      // Clear entire cache
      if (this.redisManager?.isRedisConnected()) {
        try {
          await this.redisManager.flushDb();
          logger.info('Redis cache cleared completely');
        } catch (error) {
          logger.warn(`Failed to clear Redis cache: ${error.message}`);
        }
      }
      
      this.localCache.clear();
      logger.info('Local cache cleared completely');
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    local: { size: number; maxSize: number };
    redis: { connected: boolean; info?: Record<string, string> };
  }> {
    const stats = {
      local: {
        size: this.localCache.size,
        maxSize: this.maxLocalSize,
      },
      redis: {
        connected: this.redisManager?.isRedisConnected() || false,
        info: undefined as Record<string, string> | undefined,
      },
    };

    // Get Redis info if connected
    if (this.redisManager?.isRedisConnected()) {
      try {
        stats.redis.info = await this.redisManager.getInfo();
      } catch (error) {
        logger.warn(`Failed to get Redis info: ${error.message}`);
      }
    }

    return stats;
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<boolean> {
    if (this.redisManager) {
      return await this.redisManager.healthCheck();
    }
    return false;
  }
}

/**
 * Redis-enhanced batch memory operations
 */
export class RedisBatchOperations {
  private redisManager: RedisManager | null = null;

  constructor() {
    this.redisManager = getGlobalRedisManager();
  }

  /**
   * Create multiple memories with Redis-enhanced caching
   */
  async createMemoriesBatch(
    runtime: IAgentRuntime,
    memories: Memory[],
    tableName: string,
    unique: boolean = true
  ): Promise<UUID[]> {
    if (memories.length === 0) {
      return [];
    }

    if (memories.length === 1) {
      // Single memory - use standard method
      const id = await runtime.createMemory(memories[0], tableName, unique);
      return [id];
    }

    try {
      // Use database adapter for batch operations if available
      const database = runtime.getDatabase();
      
      // Check if batch method exists
      if (typeof database.createMemoriesBatch === 'function') {
        logger.info(`Creating ${memories.length} memories in batch for table: ${tableName}`);
        const ids = await database.createMemoriesBatch(memories, tableName, unique);
        
        // Invalidate related cache entries
        await this.invalidateRelatedCache(tableName, memories[0].roomId);
        
        return ids;
      } else {
        // Fallback to parallel individual operations
        logger.info(`Batch method not available, using parallel creation for ${memories.length} memories`);
        const promises = memories.map(memory => 
          runtime.createMemory(memory, tableName, unique)
        );
        const ids = await Promise.all(promises);
        
        // Invalidate related cache entries
        await this.invalidateRelatedCache(tableName, memories[0].roomId);
        
        return ids;
      }
    } catch (error) {
      logger.error(`Batch memory creation failed: ${error.message}`);
      
      // Fallback to sequential creation on error
      logger.info('Falling back to sequential memory creation');
      const ids: UUID[] = [];
      for (const memory of memories) {
        try {
          const id = await runtime.createMemory(memory, tableName, unique);
          ids.push(id);
        } catch (memoryError) {
          logger.error(`Failed to create memory: ${memoryError.message}`);
          // Continue with other memories
        }
      }
      
      // Invalidate related cache entries
      if (ids.length > 0) {
        await this.invalidateRelatedCache(tableName, memories[0].roomId);
      }
      
      return ids;
    }
  }

  /**
   * Update multiple memories with Redis-enhanced caching
   */
  async updateMemoriesBatch(
    runtime: IAgentRuntime,
    updates: Array<{ id: UUID; updates: Partial<Memory> }>
  ): Promise<{ success: boolean; updatedCount: number; errors: string[] }> {
    if (updates.length === 0) {
      return { success: true, updatedCount: 0, errors: [] };
    }

    const results = await Promise.allSettled(
      updates.map(({ id, updates: memoryUpdates }) =>
        runtime.updateMemory({ id, ...memoryUpdates })
      )
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const errors = results
      .filter(r => r.status === 'rejected')
      .map(r => (r as PromiseRejectedResult).reason?.message || 'Unknown error');

    // Invalidate cache for updated memories
    if (successCount > 0) {
      await this.invalidateRelatedCache('memories', '');
    }

    return {
      success: successCount === updates.length,
      updatedCount: successCount,
      errors
    };
  }

  /**
   * Delete multiple memories with Redis-enhanced caching
   */
  async deleteMemoriesBatch(
    runtime: IAgentRuntime,
    memoryIds: UUID[]
  ): Promise<{ success: boolean; deletedCount: number; errors: string[] }> {
    if (memoryIds.length === 0) {
      return { success: true, deletedCount: 0, errors: [] };
    }

    const results = await Promise.allSettled(
      memoryIds.map(id => runtime.deleteMemory(id))
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const errors = results
      .filter(r => r.status === 'rejected')
      .map(r => (r as PromiseRejectedResult).reason?.message || 'Unknown error');

    // Invalidate cache for deleted memories
    if (successCount > 0) {
      await this.invalidateRelatedCache('memories', '');
    }

    return {
      success: successCount === memoryIds.length,
      deletedCount: successCount,
      errors
    };
  }

  /**
   * Invalidate related cache entries
   */
  private async invalidateRelatedCache(tableName: string, roomId: string): Promise<void> {
    if (this.redisManager?.isRedisConnected()) {
      try {
        // Clear cache entries related to the table and room
        const patterns = [
          `*tableName:${tableName}*`,
          `*roomId:${roomId}*`,
          `*memories*`
        ];
        
        for (const pattern of patterns) {
          await this.redisManager.delByPattern(pattern);
        }
        
        logger.debug(`Invalidated cache for table: ${tableName}, room: ${roomId}`);
      } catch (error) {
        logger.warn(`Failed to invalidate Redis cache: ${error.message}`);
      }
    }
  }
}

/**
 * Redis-enhanced contextual memory retrieval
 */
export class RedisContextualMemories {
  private redisManager: RedisManager | null = null;
  private cache: RedisMemoryCache;

  constructor() {
    this.redisManager = getGlobalRedisManager();
    this.cache = new RedisMemoryCache();
  }

  /**
   * Get comprehensive context with Redis-enhanced caching
   */
  async getContextualMemories(
    runtime: IAgentRuntime,
    roomId: string,
    userMessage: string,
    options: {
      messageCount?: number;
      factCount?: number;
      entityCount?: number;
      similarityThreshold?: number;
      includeEmbeddings?: boolean;
    } = {}
  ): Promise<{
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
  }> {
    const startTime = Date.now();
    const {
      messageCount = 5,
      factCount = 6,
      entityCount = 3,
      similarityThreshold = 0.7,
      includeEmbeddings = false
    } = options;

    try {
      // Generate embedding for user message if we need to search facts
      let queryEmbedding: number[] | undefined;
      if (factCount > 0) {
        try {
          queryEmbedding = await this.generateTextEmbedding(runtime, userMessage);
        } catch (error) {
          logger.warn(`Failed to generate query embedding: ${error.message}`);
        }
      }

      // Parallel retrieval with Redis-enhanced caching
      const [messages, facts, entities] = await Promise.all([
        // Get recent messages
        this.cache.getCachedMemories(runtime, {
          tableName: 'messages',
          roomId,
          count: messageCount
        }),
        
        // Search relevant facts
        queryEmbedding ? 
          this.cache.getCachedSearchResults(runtime, {
            tableName: 'facts',
            embedding: queryEmbedding,
            roomId,
            count: factCount,
            similarityThreshold
          }) : 
          Promise.resolve([]),
        
        // Get relevant entities
        this.cache.getCachedMemories(runtime, {
          tableName: 'entities',
          roomId,
          count: entityCount
        })
      ]);

      // Ensure we have arrays even if queries fail
      const safeMessages = Array.isArray(messages) ? messages : [];
      const safeFacts = Array.isArray(facts) ? facts : [];
      const safeEntities = Array.isArray(entities) ? entities : [];

      // Generate embeddings if requested and not present
      let processedMemories = { messages: safeMessages, facts: safeFacts, entities: safeEntities };
      if (includeEmbeddings) {
        processedMemories = {
          messages: await this.generateEmbeddingsForMemories(runtime, safeMessages),
          facts: await this.generateEmbeddingsForMemories(runtime, safeFacts),
          entities: await this.generateEmbeddingsForMemories(runtime, safeEntities)
        };
      }

      // Format context string
      const context = this.formatContextualMemories(processedMemories, userMessage);
      
      const queryTime = Date.now() - startTime;
      const redisUsed = this.redisManager?.isRedisConnected() || false;

      return {
        ...processedMemories,
        context,
        metadata: {
          totalMemories: safeMessages.length + safeFacts.length + safeEntities.length,
          cacheHit: true, // We're using cached methods
          queryTime,
          redisUsed
        }
      };

    } catch (error) {
      logger.error(`Contextual memory retrieval failed: ${error.message}`);
      throw new Error(`Failed to retrieve contextual memories: ${error.message}`);
    }
  }

  /**
   * Generate text embedding using the runtime's embedding model
   */
  private async generateTextEmbedding(
    runtime: IAgentRuntime,
    text: string
  ): Promise<number[]> {
    try {
      const embedding = await runtime.useModel('text-embedding', { text });
      
      if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new Error('Invalid embedding format returned');
      }
      
      return embedding;
    } catch (error) {
      logger.error(`Embedding generation failed: ${error.message}`);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Generate embeddings for memories that need them
   */
  private async generateEmbeddingsForMemories(
    runtime: IAgentRuntime,
    memories: Memory[]
  ): Promise<Memory[]> {
    const memoriesNeedingEmbeddings = memories.filter(m => !m.embedding || m.embedding.length === 0);
    
    if (memoriesNeedingEmbeddings.length === 0) {
      return memories;
    }
    
    logger.info(`Generating embeddings for ${memoriesNeedingEmbeddings.length} memories`);
    
    // Generate embeddings in parallel
    const embeddingPromises = memoriesNeedingEmbeddings.map(async (memory) => {
      try {
        const embedding = await this.generateTextEmbedding(runtime, memory.content.text);
        return { ...memory, embedding };
      } catch (error) {
        logger.warn(`Failed to generate embedding for memory ${memory.id}: ${error.message}`);
        return memory; // Return original memory without embedding
      }
    });
    
    const updatedMemories = await Promise.all(embeddingPromises);
    
    // Update memories in database with new embeddings
    const updatePromises = updatedMemories
      .filter(m => m.embedding && m.embedding.length > 0)
      .map(m => runtime.updateMemory({ id: m.id!, embedding: m.embedding }));
    
    if (updatePromises.length > 0) {
      await Promise.allSettled(updatePromises);
      logger.info(`Updated ${updatePromises.length} memories with embeddings`);
    }
    
    // Return all memories (both updated and unchanged)
    return memories.map(memory => {
      const updated = updatedMemories.find(um => um.id === memory.id);
      return updated || memory;
    });
  }

  /**
   * Format contextual memories into a readable context string
   */
  private formatContextualMemories(
    memories: { messages: Memory[]; facts: Memory[]; entities: Memory[] },
    userMessage: string
  ): string {
    const { messages, facts, entities } = memories;
    
    const contextParts: string[] = [];
    
    // Add recent conversation context
    if (messages.length > 0) {
      const recentMessages = messages
        .slice(-3) // Last 3 messages for context
        .map(m => `${m.metadata?.source || 'user'}: ${m.content.text}`)
        .join('\n');
      contextParts.push(`Recent conversation:\n${recentMessages}`);
    }
    
    // Add relevant facts
    if (facts.length > 0) {
      const factTexts = facts
        .map(f => f.content.text)
        .join('\n');
      contextParts.push(`Relevant knowledge:\n${factTexts}`);
    }
    
    // Add entity context
    if (entities.length > 0) {
      const entityInfo = entities
        .map(e => `${e.metadata?.type || 'entity'}: ${e.content.text}`)
        .join('\n');
      contextParts.push(`Entity context:\n${entityInfo}`);
    }
    
    // Add user message
    contextParts.push(`Current message: ${userMessage}`);
    
    return contextParts.join('\n\n');
  }
}

// Export the main classes
export { RedisMemoryCache, RedisBatchOperations, RedisContextualMemories };

// Export convenience functions
export const redisMemoryCache = new RedisMemoryCache();
export const redisBatchOperations = new RedisBatchOperations();
export const redisContextualMemories = new RedisContextualMemories();
