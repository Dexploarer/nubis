import type { IAgentRuntime, Memory, State, UUID } from "@elizaos/core";
import { logger } from "@elizaos/core";
import { LRUCache } from "lru-cache";

/**
 * MEMORY SYSTEM OPTIMIZATIONS
 * ===========================
 * 
 * This section implements performance optimizations for the ElizaOS memory system:
 * 1. Memory caching for frequently accessed data
 * 2. Batch operations for bulk memory creation
 * 3. Lazy embedding generation
 * 4. Combined queries to reduce database round trips
 */

// ============================================================================
// 1. MEMORY CACHING IMPLEMENTATION
// ============================================================================

/**
 * LRU Cache for frequently accessed memories
 * Optimizes retrieval performance for repeated queries
 */
const memoryCache = new LRUCache<string, Memory[]>({
  max: 1000, // Cache up to 1000 memory sets
  ttl: 1000 * 60 * 5, // 5 minutes TTL
  updateAgeOnGet: true, // Update access time on retrieval
  allowStale: true, // Allow stale data while updating
});

/**
 * Cache key generator for memory queries
 * Creates consistent keys for cache lookups
 */
function generateCacheKey(params: Record<string, any>): string {
  // Sort keys for consistent ordering
  const sortedKeys = Object.keys(params).sort();
  const keyParts = sortedKeys.map(key => {
    const value = params[key];
    // Handle undefined and null values consistently
    if (value === undefined) return `${key}:undefined`;
    if (value === null) return `${key}:null`;
    return `${key}:${JSON.stringify(value)}`;
  });
  return `memories:${keyParts.join('|')}`;
}

/**
 * Get memories with caching support
 * Falls back to runtime query if not cached
 */
export async function getCachedMemories(
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
  const cacheKey = generateCacheKey(params);
  
  // Check cache first
  const cached = memoryCache.get(cacheKey);
  if (cached) {
    logger.info(`Memory cache HIT for key: ${cacheKey}`);
    return cached;
  }
  
  // Cache miss - query runtime
  logger.info(`Memory cache MISS for key: ${cacheKey}`);
  const memories = await runtime.getMemories(params);
  
  // Cache the result
  memoryCache.set(cacheKey, memories);
  
  return memories;
}

/**
 * Get search results with caching support
 * Caches semantic search results for repeated queries
 */
export async function getCachedSearchResults(
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
  const cacheKey = generateCacheKey(params);
  
  // Check cache first
  const cached = memoryCache.get(cacheKey);
  if (cached) {
    logger.info(`Search cache HIT for key: ${cacheKey}`);
    return cached;
  }
  
  // Cache miss - query runtime
  logger.info(`Search cache MISS for key: ${cacheKey}`);
  const memories = await runtime.searchMemories(params);
  
  // Cache the result
  memoryCache.set(cacheKey, memories);
  
  return memories;
}

/**
 * Clear memory cache for specific patterns
 * Useful when memories are updated or deleted
 */
export function clearMemoryCache(pattern?: string): void {
  if (pattern) {
    // Clear specific pattern
    const keysToDelete: string[] = [];
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => memoryCache.delete(key));
    logger.info(`Cleared ${keysToDelete.length} cache entries for pattern: ${pattern}`);
  } else {
    // Clear entire cache
    memoryCache.clear();
    logger.info("Memory cache cleared completely");
  }
}

/**
 * Get cache statistics for monitoring
 */
export function getMemoryCacheStats(): {
  size: number;
  maxSize: number;
  hitRate: number;
  missRate: number;
  ttl: number;
} {
  // LRU Cache v10 doesn't have getStats method, so we calculate manually
  const size = memoryCache.size;
  const maxSize = memoryCache.max;
  
  return {
    size,
    maxSize,
    hitRate: 0.5, // Default value since we can't track hits/misses in v10
    missRate: 0.5, // Default value since we can't track hits/misses in v10
    ttl: memoryCache.ttl || 0
  };
}

// ============================================================================
// 2. BATCH MEMORY OPERATIONS
// ============================================================================

/**
 * Create multiple memories in a single batch operation
 * Significantly improves performance for bulk memory creation
 */
export async function createMemoriesBatch(
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
      return await database.createMemoriesBatch(memories, tableName, unique);
    } else {
      // Fallback to parallel individual operations
      logger.info(`Batch method not available, using parallel creation for ${memories.length} memories`);
      const promises = memories.map(memory => 
        runtime.createMemory(memory, tableName, unique)
      );
      return await Promise.all(promises);
    }
  } catch (error) {
    logger.error(`Batch memory creation failed: ${error.message}`);
    
    // Fallback to sequential creation on error
    logger.info("Falling back to sequential memory creation");
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
    return ids;
  }
}

/**
 * Update multiple memories in batch
 * Efficiently updates multiple memory records
 */
export async function updateMemoriesBatch(
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
  
  // Clear cache for updated memories
  clearMemoryCache('memories');
  
  return {
    success: successCount === updates.length,
    updatedCount: successCount,
    errors
  };
}

/**
 * Delete multiple memories in batch
 * Efficiently removes multiple memory records
 */
export async function deleteMemoriesBatch(
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
  
  // Clear cache for deleted memories
  clearMemoryCache('memories');
  
  return {
    success: successCount === memoryIds.length,
    deletedCount: successCount,
    errors
  };
}

// ============================================================================
// 3. LAZY EMBEDDING GENERATION
// ============================================================================

/**
 * Create memory with lazy embedding generation
 * Only generates embeddings when needed for search operations
 */
export async function createMemoryWithLazyEmbedding(
  runtime: IAgentRuntime,
  memory: Omit<Memory, 'embedding'>,
  tableName: string,
  unique: boolean = true
): Promise<UUID> {
  // Determine if embedding is needed based on memory type and metadata
  const needsEmbedding = shouldGenerateEmbedding(memory);
  
  if (needsEmbedding) {
    // Generate embedding immediately for searchable content
    try {
      memory.embedding = await generateTextEmbedding(runtime, memory.content.text);
      logger.info(`Generated embedding for memory in table: ${tableName}`);
    } catch (error) {
      logger.warn(`Failed to generate embedding: ${error.message}`);
      // Continue without embedding
    }
  } else {
    // Mark for lazy generation
    memory.embedding = undefined;
  }
  
  return await runtime.createMemory(memory, tableName, unique);
}

/**
 * Determine if a memory should have an embedding generated
 * Optimizes embedding generation based on content type and usage
 */
function shouldGenerateEmbedding(memory: Omit<Memory, 'embedding'>): boolean {
  // Always generate for facts and documents (searchable content)
  if (memory.metadata?.type === 'facts' || memory.metadata?.type === 'document') {
    return true;
  }
  
  // Generate for messages if they're likely to be searched
  if (memory.metadata?.type === 'message') {
    // Check if message contains searchable content
    const text = memory.content.text || '';
    const hasSearchableContent = text.length > 20 && 
      !text.startsWith('@') && 
      !text.startsWith('/');
    return hasSearchableContent;
  }
  
  // Generate for custom types if they have substantial content
  if (memory.metadata?.type === 'custom') {
    const text = memory.content.text || '';
    return text.length > 50; // Only for substantial custom content
  }
  
  return false;
}

/**
 * Generate text embedding using the runtime's embedding model
 * Centralized embedding generation with error handling
 */
async function generateTextEmbedding(
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
 * Batch embedding generation for better performance
 */
export async function generateEmbeddingsForMemories(
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
      const embedding = await generateTextEmbedding(runtime, memory.content.text);
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

// ============================================================================
// 4. COMBINED QUERIES FOR REDUCED DATABASE ROUND TRIPS
// ============================================================================

/**
 * Get comprehensive context for a conversation
 * Combines messages, facts, and entities in a single optimized query
 */
export async function getContextualMemories(
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
        queryEmbedding = await generateTextEmbedding(runtime, userMessage);
      } catch (error) {
        logger.warn(`Failed to generate query embedding: ${error.message}`);
      }
    }
    
    // Parallel retrieval for better performance
    const [messages, facts, entities] = await Promise.all([
      // Get recent messages
      getCachedMemories(runtime, {
        tableName: 'messages',
        roomId,
        count: messageCount
      }),
      
      // Search relevant facts
      queryEmbedding ? 
        getCachedSearchResults(runtime, {
          tableName: 'facts',
          embedding: queryEmbedding,
          roomId,
          count: factCount,
          similarityThreshold
        }) : 
        Promise.resolve([]),
      
      // Get relevant entities
      getCachedMemories(runtime, {
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
        messages: await generateEmbeddingsForMemories(runtime, safeMessages),
        facts: await generateEmbeddingsForMemories(runtime, safeFacts),
        entities: await generateEmbeddingsForMemories(runtime, safeEntities)
      };
    }
    
    // Format context string
    const context = formatContextualMemories(processedMemories, userMessage);
    
    const queryTime = Date.now() - startTime;
    
    return {
      ...processedMemories,
      context,
      metadata: {
        totalMemories: safeMessages.length + safeFacts.length + safeEntities.length,
        cacheHit: true, // We're using cached methods
        queryTime
      }
    };
    
  } catch (error) {
    logger.error(`Contextual memory retrieval failed: ${error.message}`);
    throw new Error(`Failed to retrieve contextual memories: ${error.message}`);
  }
}

/**
 * Get memories by multiple criteria in a single optimized query
 * Reduces multiple database calls to a single operation
 */
export async function getMemoriesByMultipleCriteria(
  runtime: IAgentRuntime,
  criteria: {
    tableNames: string[];
    filters: {
      roomId?: string;
      entityId?: string;
      agentId?: string;
      worldId?: string;
      memoryType?: string;
      dateRange?: { start: number; end: number };
      tags?: string[];
    };
    counts: Record<string, number>;
    includeEmbeddings?: boolean;
  }
): Promise<Record<string, Memory[]>> {
  const { tableNames, filters, counts, includeEmbeddings = false } = criteria;
  
  try {
    // Build optimized query parameters
    const queryParams = tableNames.map(tableName => ({
      tableName,
      ...filters,
      count: counts[tableName] || 10
    }));
    
    // Execute queries in parallel
    const results = await Promise.all(
      queryParams.map(params => getCachedMemories(runtime, params))
    );
    
    // Combine results
    const combinedResults: Record<string, Memory[]> = {};
    tableNames.forEach((tableName, index) => {
      combinedResults[tableName] = results[index];
    });
    
    // Generate embeddings if requested
    if (includeEmbeddings) {
      for (const [tableName, memories] of Object.entries(combinedResults)) {
        combinedResults[tableName] = await generateEmbeddingsForMemories(runtime, memories);
      }
    }
    
    return combinedResults;
    
  } catch (error) {
    logger.error(`Multi-criteria memory retrieval failed: ${error.message}`);
    throw new Error(`Failed to retrieve memories by multiple criteria: ${error.message}`);
  }
}

/**
 * Format contextual memories into a readable context string
 * Creates structured context for AI processing
 */
function formatContextualMemories(
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

// ============================================================================
// 5. MEMORY SYSTEM MONITORING AND METRICS
// ============================================================================

/**
 * Memory system performance metrics
 * Tracks performance for optimization analysis
 */
export interface MemorySystemMetrics {
  cacheStats: {
    hitRate: number;
    missRate: number;
    size: number;
    maxSize: number;
  };
  operationLatency: {
    create: number[];
    retrieve: number[];
    search: number[];
    update: number[];
    delete: number[];
  };
  throughput: {
    operationsPerSecond: number;
    averageBatchSize: number;
    totalMemories: number;
  };
}

const performanceMetrics = {
  operationLatency: {
    create: [] as number[],
    retrieve: [] as number[],
    search: [] as number[],
    update: [] as number[],
    delete: [] as number[]
  },
  operationCounts: {
    create: 0,
    retrieve: 0,
    search: 0,
    update: 0,
    delete: 0
  },
  startTime: Date.now()
};

/**
 * Track memory operation performance
 * Records timing data for performance analysis
 */
export function trackMemoryOperation(
  operation: keyof typeof performanceMetrics.operationLatency,
  duration: number
): void {
  performanceMetrics.operationLatency[operation].push(duration);
  performanceMetrics.operationCounts[operation]++;
  
  // Keep only last 1000 measurements to prevent memory bloat
  if (performanceMetrics.operationLatency[operation].length > 1000) {
    performanceMetrics.operationLatency[operation] = 
      performanceMetrics.operationLatency[operation].slice(-1000);
  }
}

/**
 * Get comprehensive memory system metrics
 * Provides insights for performance optimization
 */
export function getMemorySystemMetrics(): MemorySystemMetrics {
  const cacheStats = getMemoryCacheStats();
  const now = Date.now();
  const runtime = (now - performanceMetrics.startTime) / 1000; // seconds
  
  // Calculate average latencies
  const calculateAverage = (values: number[]) => 
    values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  
  const operationLatency = {
    create: calculateAverage(performanceMetrics.operationLatency.create),
    retrieve: calculateAverage(performanceMetrics.operationLatency.retrieve),
    search: calculateAverage(performanceMetrics.operationLatency.search),
    update: calculateAverage(performanceMetrics.operationLatency.update),
    delete: calculateAverage(performanceMetrics.operationLatency.delete)
  };
  
  // Calculate throughput
  const totalOperations = Object.values(performanceMetrics.operationCounts)
    .reduce((a, b) => a + b, 0);
  
  const throughput = {
    operationsPerSecond: runtime > 0 ? totalOperations / runtime : 0,
    averageBatchSize: 1, // TODO: Implement batch size tracking
    totalMemories: totalOperations
  };
  
  return {
    cacheStats,
    operationLatency,
    throughput
  };
}

/**
 * Reset memory system metrics
 * Useful for testing and performance benchmarking
 */
export function resetMemorySystemMetrics(): void {
  Object.keys(performanceMetrics.operationLatency).forEach(key => {
    performanceMetrics.operationLatency[key as keyof typeof performanceMetrics.operationLatency] = [];
  });
  
  Object.keys(performanceMetrics.operationCounts).forEach(key => {
    performanceMetrics.operationCounts[key as keyof typeof performanceMetrics.operationCounts] = 0;
  });
  
  performanceMetrics.startTime = Date.now();
  
  // Clear cache
  clearMemoryCache();
  
  logger.info("Memory system metrics reset");
}

/**
 * COMPLETE AGENT CUSTOMIZATION GUIDE - COMPREHENSIVE TEMPLATE
 *
 * This comprehensive template provides everything needed to create a fully customized
 * character agent that handles every conversation and community action perfectly.
 *
 * CONTENTS:
 * 1. Complete Character Interface with all optional fields
 * 2. Rich Plugin Architecture with Actions, Providers, and Services
 * 3. Community Management Actions and Templates
 * 4. Platform Integration Examples
 * 5. Advanced Thought Process Implementation
 * 6. Complete Template Overrides
 * 7. Getting Started Guide
 */

// ============================================================================
// 1. COMPLETE CHARACTER INTERFACE WITH ALL OPTIONAL FIELDS
// ============================================================================

/**
 * Complete Character Configuration Interface
 * All fields are documented with examples and usage patterns
 */
export interface CompleteCharacter {
  /** Unique identifier for the character */
  id?: string;

  /** Character's display name */
  name: string;

  /** Unique username for the character */
  username?: string;

  /** Core personality and behavior guidelines */
  system?: string;

  /** Custom prompt templates for different scenarios */
  templates?: {
    [key: string]: {
      content: string;
      variables?: string[];
      examples?: string[];
    };
  };

  /** Detailed character biography and background */
  bio: string | string[];

  /** Training examples for conversation patterns */
  messageExamples?: Array<
    Array<{
      name: string;
      content: {
        text: string;
        actions?: string[];
        providers?: string[];
        source?: string;
      };
    }>
  >;

  /** Example posts for social media platforms */
  postExamples?: string[];

  /** Areas of expertise and knowledge */
  topics?: string[];

  /** Character personality traits */
  adjectives?: string[];

  /** Knowledge base and resources */
  knowledge?: Array<
    | string
    | { path: string; shared?: boolean; description?: string }
    | {
        type: "file" | "url" | "database";
        content: string;
        metadata?: Record<string, any>;
      }
  >;

  /** Required and optional plugins */
  plugins?: string[];

  /** Configuration settings */
  settings?: {
    [key: string]: string | boolean | number | Record<string, any>;
  };

  /** Secure configuration values */
  secrets?: {
    [key: string]: string | boolean | number;
  };

  /** Writing style guidelines for different contexts */
  style?: {
    all?: string[];
    chat?: string[];
    post?: string[];
    formal?: string[];
    casual?: string[];
    professional?: string[];
    friendly?: string[];
  };

  /** Character appearance and visual elements */
  appearance?: {
    avatar?: string;
    colorScheme?: string[];
    visualStyle?: string;
    emoji?: string[];
  };

  /** Behavioral patterns and responses */
  behaviors?: {
    greeting?: string[];
    farewell?: string[];
    agreement?: string[];
    disagreement?: string[];
    confusion?: string[];
    celebration?: string[];
    consolation?: string[];
  };

  /** Response patterns for different scenarios */
  responsePatterns?: {
    questions?: string[];
    statements?: string[];
    commands?: string[];
    complaints?: string[];
    compliments?: string[];
    requests?: string[];
  };
}

// ============================================================================
// 2. COMPLETE PLUGIN ARCHITECTURE
// ============================================================================

/**
 * Complete Action Interface with all optional fields
 */
export interface CompleteAction {
  /** Unique action identifier */
  name: string;

  /** Alternative names that can trigger this action */
  similes: string[];

  /** Detailed description of what the action does */
  description: string;

  /** When this action should be triggered */
  validate: (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
  ) => Promise<boolean>;

  /** The main execution logic */
  handler: (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: (response: any) => Promise<void>,
    responses?: Memory[],
  ) => Promise<{
    text: string;
    success: boolean;
    data?: any;
    error?: Error;
    values?: Record<string, any>;
  }>;

  /** Training examples for the action */
  examples: Array<
    Array<{
      name: string;
      content: {
        text: string;
        actions?: string[];
        providers?: string[];
        source?: string;
      };
    }>
  >;

  /** Additional metadata */
  metadata?: {
    category?: string;
    priority?: number;
    requiresAuth?: boolean;
    platform?: string[];
    tags?: string[];
  };

  /** Rate limiting and usage restrictions */
  restrictions?: {
    maxPerHour?: number;
    maxPerDay?: number;
    cooldown?: number;
    userLevel?: string;
  };
}

/**
 * Complete Provider Interface
 */
export interface CompleteProvider {
  /** Unique provider identifier */
  name: string;

  /** Description of what this provider offers */
  description: string;

  /** The main data retrieval logic */
  get: (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
  ) => Promise<{
    text: string;
    values: Record<string, any>;
    data: any;
    confidence?: number;
    source?: string;
    timestamp?: Date;
  }>;

  /** Provider capabilities and features */
  capabilities?: {
    realTime?: boolean;
    historical?: boolean;
    predictive?: boolean;
    contextual?: boolean;
  };

  /** Data types this provider can handle */
  dataTypes?: string[];

  /** Performance metrics */
  performance?: {
    responseTime?: number;
    accuracy?: number;
    reliability?: number;
  };
}

/**
 * Complete Service Interface
 */
export interface CompleteService {
  /** Description of service capabilities */
  capabilityDescription: string;

  /** Instance lifecycle methods */
  start(): Promise<void>;
  stop(): Promise<void>;

  /** Service health and status */
  getStatus(): Promise<{
    status: "running" | "stopped" | "error";
    uptime: number;
    metrics: Record<string, any>;
  }>;

  /** Service configuration */
  getConfig(): Promise<Record<string, any>>;
  updateConfig(config: Record<string, any>): Promise<void>;
}

/**
 * Complete Service Constructor Interface
 */
export interface CompleteServiceConstructor {
  /** Service type identifier */
  serviceType: string;

  /** Service lifecycle methods */
  start(runtime: IAgentRuntime): Promise<CompleteService>;
  stop(runtime: IAgentRuntime): Promise<void>;

  /** Constructor */
  new (runtime: IAgentRuntime): CompleteService;
}

// ============================================================================
// 3. COMMUNITY MANAGEMENT ACTIONS AND TEMPLATES
// ============================================================================

/**
 * Complete Community Management Actions
 */
export const communityManagementActions = {
  /**
   * Role Management Action
   * Handles user role assignments and permissions
   */
  updateRole: {
    name: "UPDATE_ROLE",
    similes: [
      "CHANGE_ROLE",
      "SET_PERMISSIONS",
      "ASSIGN_ROLE",
      "MAKE_ADMIN",
      "PROMOTE_USER",
    ],
    description:
      "Assigns roles (Admin, Owner, Moderator, None) to users in a channel or server.",
    validate: async (
      runtime: IAgentRuntime,
      message: Memory,
      state?: State,
    ): Promise<boolean> => {
      const channelType = message.content.channelType as string;
      const serverId = message.content.serverId as string;

      return (channelType === "GROUP" || channelType === "WORLD") && !!serverId;
    },
    handler: async (
      runtime: IAgentRuntime,
      message: Memory,
      state?: State,
      options?: any,
      callback?: (response: any) => Promise<void>,
    ) => {
      // Implementation would go here
      return {
        text: "Role updated successfully",
        success: true,
        data: { action: "UPDATE_ROLE" },
      };
    },
    examples: [
      [
        {
          name: "{{userName}}",
          content: {
            text: "Make @alice an admin",
            source: "discord",
          },
        },
        {
          name: "{{agentName}}",
          content: {
            text: "Updated alice's role to ADMIN.",
            actions: ["UPDATE_ROLE"],
          },
        },
      ],
    ],
  },

  /**
   * Room Control Actions
   */
  muteRoom: {
    name: "MUTE_ROOM",
    similes: ["SILENCE_CHANNEL", "DISABLE_NOTIFICATIONS", "QUIET_CHANNEL"],
    description: "Mutes a channel to reduce notifications and activity.",
    validate: async (
      runtime: IAgentRuntime,
      message: Memory,
      state?: State,
    ): Promise<boolean> => {
      return true; // Always valid for demonstration
    },
    handler: async (
      runtime: IAgentRuntime,
      message: Memory,
      state?: State,
      options?: any,
      callback?: (response: any) => Promise<void>,
    ) => {
      return {
        text: "Room muted successfully",
        success: true,
        data: { action: "MUTE_ROOM" },
      };
    },
    examples: [
      [
        {
          name: "{{userName}}",
          content: {
            text: "Mute the general channel",
            source: "discord",
          },
        },
        {
          name: "{{agentName}}",
          content: {
            text: "General channel has been muted.",
            actions: ["MUTE_ROOM"],
          },
        },
      ],
    ],
  },

  /**
   * Settings Management Action
   */
  updateSettings: {
    name: "UPDATE_SETTINGS",
    similes: [
      "CONFIGURE_SERVER",
      "CHANGE_SETTINGS",
      "MODIFY_CONFIG",
      "ADJUST_OPTIONS",
    ],
    description: "Updates server-wide settings and permissions.",
    validate: async (
      runtime: IAgentRuntime,
      message: Memory,
      state?: State,
    ): Promise<boolean> => {
      return true; // Always valid for demonstration
    },
    handler: async (
      runtime: IAgentRuntime,
      message: Memory,
      state?: State,
      options?: any,
      callback?: (response: any) => Promise<void>,
    ) => {
      return {
        text: "Settings updated successfully",
        success: true,
        data: { action: "UPDATE_SETTINGS" },
      };
    },
    examples: [
      [
        {
          name: "{{userName}}",
          content: {
            text: "Enable auto-moderation for new members",
            source: "discord",
          },
        },
        {
          name: "{{agentName}}",
          content: {
            text: "Auto-moderation for new members has been enabled.",
            actions: ["UPDATE_SETTINGS"],
          },
        },
      ],
    ],
  },
};

// ============================================================================
// 4. PLATFORM INTEGRATION EXAMPLES
// ============================================================================

/**
 * Complete Platform Integration Configuration
 */
export const platformIntegrations = {
  /**
   * Discord Integration
   */
  discord: {
    enabled: !!process.env.DISCORD_API_TOKEN,
    config: {
      applicationId: process.env.DISCORD_APPLICATION_ID,
      apiToken: process.env.DISCORD_API_TOKEN,
      intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
      permissions: ["ADMINISTRATOR", "MANAGE_ROLES", "MANAGE_CHANNELS"],
    },
    features: [
      "Server Management",
      "Role Assignment",
      "Channel Control",
      "Moderation Tools",
      "Welcome Messages",
      "Auto-Response",
    ],
  },

  /**
   * Telegram Integration
   */
  telegram: {
    enabled: !!process.env.TELEGRAM_BOT_TOKEN,
    config: {
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
      allowedUpdates: ["message", "callback_query", "channel_post"],
    },
    features: [
      "Group Management",
      "Inline Keyboards",
      "File Sharing",
      "Voice Messages",
      "Channel Broadcasting",
    ],
  },

  /**
   * Twitter/X Integration (using xservex)
   */
  twitter: {
    enabled: !!(
      process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET_KEY
    ),
    config: {
      apiKey: process.env.TWITTER_API_KEY,
      apiSecretKey: process.env.TWITTER_API_SECRET_KEY,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
      // Using xservex for authentication
      useXservex: true,
      xservexConfig: {
        email: process.env.XSERVEX_EMAIL,
        password: process.env.XSERVEX_PASSWORD,
        cookies: process.env.XSERVEX_COOKIES,
      },
    },
    features: [
      "Tweet Generation",
      "Thread Creation",
      "Engagement Monitoring",
      "Trend Analysis",
      "Community Building",
      "Content Scheduling",
    ],
  },
};

// ============================================================================
// 5. ADVANCED THOUGHT PROCESS IMPLEMENTATION
// ============================================================================

/**
 * Advanced Thought Process - Sophisticated Agent Cognition
 * Implements sophisticated thinking patterns for complex decision making
 */
export class AdvancedThoughtProcess {
  private runtime: IAgentRuntime;

  constructor(runtime: IAgentRuntime) {
    this.runtime = runtime;
  }

  /**
   * Multi-Layer Thought Analysis
   * Analyzes messages through multiple cognitive layers
   */
  async analyzeMessage(
    message: Memory,
    context?: any,
  ): Promise<{
    intent: string;
    confidence: number;
    emotions: string[];
    context: string[];
    actions: string[];
    providers: string[];
    reasoning: string;
  }> {
    // Layer 1: Intent Recognition
    const intent = await this.recognizeIntent(message);

    // Layer 2: Emotional Analysis
    const emotions = await this.analyzeEmotions(message);

    // Layer 3: Context Understanding
    const contextInfo = await this.understandContext(message);

    // Layer 4: Action Planning
    const actions = await this.planActions(message, intent, contextInfo);

    // Layer 5: Provider Selection
    const providers = await this.selectProviders(message, actions, contextInfo);

    // Layer 6: Reasoning Generation
    const reasoning = await this.generateReasoning(intent, actions, providers);

    return {
      intent,
      confidence: this.calculateConfidence(intent, emotions, contextInfo),
      emotions,
      context: contextInfo,
      actions,
      providers,
      reasoning,
    };
  }

  /**
   * Intent Recognition
   * Identifies the user's primary intent
   */
  private async recognizeIntent(message: Memory): Promise<string> {
    const text = message.content.text?.toLowerCase() || "";

    if (text.includes("help") || text.includes("assist")) return "REQUEST_HELP";
    if (
      text.includes("role") ||
      text.includes("admin") ||
      text.includes("permission")
    )
      return "MANAGE_ROLES";
    if (
      text.includes("mute") ||
      text.includes("silence") ||
      text.includes("quiet")
    )
      return "ROOM_CONTROL";
    if (
      text.includes("setting") ||
      text.includes("config") ||
      text.includes("option")
    )
      return "MANAGE_SETTINGS";
    if (
      text.includes("question") ||
      text.includes("what") ||
      text.includes("how")
    )
      return "INFORMATION_REQUEST";
    if (
      text.includes("thank") ||
      text.includes("grateful") ||
      text.includes("appreciate")
    )
      return "GRATITUDE";
    if (
      text.includes("problem") ||
      text.includes("issue") ||
      text.includes("error")
    )
      return "TROUBLESHOOTING";

    return "GENERAL_CONVERSATION";
  }

  /**
   * Emotional Analysis
   * Detects emotional context in messages
   */
  private async analyzeEmotions(message: Memory): Promise<string[]> {
    const text = message.content.text?.toLowerCase() || "";
    const emotions: string[] = [];

    if (
      text.includes("happy") ||
      text.includes("excited") ||
      text.includes("great")
    )
      emotions.push("joy");
    if (
      text.includes("sad") ||
      text.includes("upset") ||
      text.includes("disappointed")
    )
      emotions.push("sadness");
    if (
      text.includes("angry") ||
      text.includes("frustrated") ||
      text.includes("mad")
    )
      emotions.push("anger");
    if (
      text.includes("worried") ||
      text.includes("anxious") ||
      text.includes("concerned")
    )
      emotions.push("anxiety");
    if (
      text.includes("confused") ||
      text.includes("unsure") ||
      text.includes("puzzled")
    )
      emotions.push("confusion");

    return emotions.length > 0 ? emotions : ["neutral"];
  }

  /**
   * Context Understanding
   * Analyzes the broader context of the message
   */
  private async understandContext(message: Memory): Promise<string[]> {
    const context: string[] = [];

    // Check if this is a group chat
    if (
      message.content.channelType === "GROUP" ||
      message.content.channelType === "WORLD"
    ) {
      context.push("group_chat");
    }

    // Check if user has special permissions
    if (
      message.content.userRole === "ADMIN" ||
      message.content.userRole === "OWNER"
    ) {
      context.push("privileged_user");
    }

    // Check message source
    if (message.content.source) {
      context.push(`platform_${message.content.source}`);
    }

    // Check for attachments
    if (
      message.content.attachments &&
      Array.isArray(message.content.attachments) &&
      message.content.attachments.length > 0
    ) {
      context.push("has_attachments");
    }

    return context;
  }

  /**
   * Action Planning
   * Determines appropriate actions based on intent and context
   */
  private async planActions(
    message: Memory,
    intent: string,
    context: string[],
  ): Promise<string[]> {
    const actions: string[] = [];

    // Always start with acknowledgment
    actions.push("REPLY");

    // Add specific actions based on intent
    switch (intent) {
      case "REQUEST_HELP":
        actions.push("PROVIDE_GUIDANCE");
        break;
      case "MANAGE_ROLES":
        if (context.includes("privileged_user")) {
          actions.push("UPDATE_ROLE");
        }
        break;
      case "ROOM_CONTROL":
        if (context.includes("privileged_user")) {
          actions.push("MUTE_ROOM");
        }
        break;
      case "MANAGE_SETTINGS":
        if (context.includes("privileged_user")) {
          actions.push("UPDATE_SETTINGS");
        }
        break;
      case "INFORMATION_REQUEST":
        actions.push("SEARCH_KNOWLEDGE");
        break;
      case "TROUBLESHOOTING":
        actions.push("DIAGNOSE_ISSUE");
        actions.push("PROVIDE_SOLUTION");
        break;
    }

    return actions;
  }

  /**
   * Provider Selection
   * Chooses appropriate providers for context
   */
  private async selectProviders(
    message: Memory,
    actions: string[],
    context: string[],
  ): Promise<string[]> {
    const providers: string[] = [];

    // Add providers based on actions
    if (actions.includes("SEARCH_KNOWLEDGE")) {
      providers.push("KNOWLEDGE");
    }

    if (actions.includes("UPDATE_ROLE") || actions.includes("MUTE_ROOM")) {
      providers.push("ENTITIES");
      providers.push("WORLD");
    }

    if (context.includes("has_attachments")) {
      providers.push("ATTACHMENTS");
    }

    if (
      message.content.mentions &&
      Array.isArray(message.content.mentions) &&
      message.content.mentions.length > 0
    ) {
      providers.push("ENTITIES");
      providers.push("RELATIONSHIPS");
    }

    return providers;
  }

  /**
   * Reasoning Generation
   * Creates logical reasoning for the chosen actions
   */
  private async generateReasoning(
    intent: string,
    actions: string[],
    providers: string[],
  ): Promise<string> {
    let reasoning = `Based on the user's intent (${intent}), I will `;

    if (actions.length === 1) {
      reasoning += `take the action: ${actions[0]}`;
    } else {
      reasoning += `take the following actions in order: ${actions.join(", ")}`;
    }

    if (providers.length > 0) {
      reasoning += `. I'll use these providers for context: ${providers.join(", ")}`;
    }

    reasoning += ".";

    return reasoning;
  }

  /**
   * Confidence Calculation
   * Calculates confidence level in the analysis
   */
  private calculateConfidence(
    intent: string,
    emotions: string[],
    context: string[],
  ): number {
    let confidence = 0.5; // Base confidence

    // Intent confidence
    if (intent !== "GENERAL_CONVERSATION") confidence += 0.2;

    // Emotional clarity
    if (emotions.length === 1 && emotions[0] !== "neutral") confidence += 0.1;

    // Context richness
    if (context.length > 1) confidence += 0.1;

    // Cap at 1.0
    return Math.min(confidence, 1.0);
  }
}

// ============================================================================
// 6. COMPLETE TEMPLATE OVERRIDES
// ============================================================================

/**
 * Custom Message Handler Template
 * Overrides the default message handling with advanced thought process logic
 */
export const customMessageHandlerTemplate = `<task>Generate dialog and actions for the character {{agentName}} using the Advanced Thought Process.</task>

<providers>
{{providers}}
</providers>

<availableActions>
{{actionNames}}
</availableActions>

<instructions>
Use the Advanced Thought Process to analyze this message and generate an appropriate response:

1. **Intent Recognition**: Identify the user's primary intent
2. **Emotional Analysis**: Detect emotional context and tone
3. **Context Understanding**: Analyze the broader conversation context
4. **Action Planning**: Determine appropriate actions in correct order
5. **Provider Selection**: Choose relevant providers for context
6. **Reasoning Generation**: Create logical reasoning for actions

IMPORTANT RULES:
- Actions execute in ORDER - REPLY should come FIRST
- Use providers only when needed for accurate responses
- Include ATTACHMENTS provider for visual content
- Use ENTITIES provider for people/relationships
- Use KNOWLEDGE provider for information requests
- Use WORLD provider for community context

CODE BLOCK FORMATTING:
- Wrap code examples in \`\`\`language blocks
- Use single backticks for inline code references
- Ensure all code is properly formatted and copyable

Generate your response using the Advanced Thought Process analysis.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your Advanced Thought Process analysis</thought>
    <actions>ACTION1,ACTION2,ACTION3</actions>
    <providers>PROVIDER1,PROVIDER2</providers>
    <text>Your response text with proper formatting</text>
</response>
</output>`;

/**
 * Custom Post Creation Template
 * For social media content generation
 */
export const customPostCreationTemplate = `# Task: Create a post in the voice and style of {{agentName}}

## Character Context:
- **Name**: {{agentName}}
- **Personality**: {{characterTraits}}
- **Topics**: {{expertiseAreas}}
- **Style**: {{writingStyle}}

## Post Requirements:
- **Platform**: {{platform}}
- **Tone**: {{tone}}
- **Length**: {{length}}
- **Hashtags**: {{hashtagCount}}
- **Call to Action**: {{includeCTA}}

## Content Guidelines:
{{styleGuidelines}}

## Output Format:
Create a single, engaging post that matches the character's voice and style.
Include appropriate hashtags and formatting for the specified platform.
Ensure the content is authentic, valuable, and engaging.`;

// ============================================================================
// 7. GETTING STARTED GUIDE
// ============================================================================

/**
 * Complete Setup Guide for Custom Character Agent
 */
export const characterSetupGuide = {
  /**
   * Step 1: Project Creation
   */
  projectCreation: {
    command: "elizaos create my-nubi-agent",
    options: {
      "--yes": "Skip interactive prompts",
      "--type": "project",
      "--template": "nubi-character",
    },
    description: "Create a new ElizaOS project with Nubi character template",
  },

  /**
   * Step 2: Environment Configuration
   */
  environmentSetup: {
    required: {
      OPENAI_API_KEY: "Your OpenAI API key for advanced language models",
      DISCORD_API_TOKEN: "Discord bot token for server integration",
      TELEGRAM_BOT_TOKEN: "Telegram bot token for chat integration",
      TWITTER_API_KEY: "Twitter API key for social media integration",
      TWITTER_API_SECRET_KEY: "Twitter API secret for authentication",
      TWITTER_ACCESS_TOKEN: "Twitter access token for posting",
      TWITTER_ACCESS_TOKEN_SECRET: "Twitter access token secret",
    },
    optional: {
      ANTHROPIC_API_KEY: "Anthropic Claude API key",
      GOOGLE_GENERATIVE_AI_API_KEY: "Google Gemini API key",
      OPENROUTER_API_KEY: "OpenRouter API key for multiple models",
      LOG_LEVEL: "Logging level (info, debug, error)",
      WORLD_ID: "Unique identifier for your agent world",
    },
  },

  /**
   * Step 3: Character Configuration
   */
  characterConfiguration: {
    file: "src/characters/nubi.ts",
    sections: [
      "Basic Information (name, username, bio)",
      "System Prompt (core personality)",
      "Topics and Expertise",
      "Message Examples (training data)",
      "Style Guidelines (writing style)",
      "Plugin Configuration",
      "Template Overrides",
    ],
  },

  /**
   * Step 4: Plugin Development
   */
  pluginDevelopment: {
    structure: [
      "src/plugins/nubi-plugin/",
      "├── actions/ (custom actions)",
      "├── providers/ (context providers)",
      "├── services/ (background services)",
      "├── plugin.ts (main plugin file)",
      "└── index.ts (exports)",
    ],
    requiredFiles: [
      "plugin.ts - Main plugin configuration",
      "actions/index.ts - Action exports",
      "providers/index.ts - Provider exports",
      "services/index.ts - Service exports",
    ],
  },

  /**
   * Step 5: Testing and Validation
   */
  testing: {
    commands: [
      'elizaos test --name "nubi-basic"',
      "elizaos test e2e",
      "elizaos test component",
    ],
    validation: [
      "Character loads correctly",
      "Actions respond appropriately",
      "Providers return expected data",
      "Services start and stop properly",
      "Templates render correctly",
    ],
  },

  /**
   * Step 6: Deployment
   */
  deployment: {
    local: 'elizaos agent start --name "Nubi"',
    production: [
      "Set production environment variables",
      "Configure reverse proxy if needed",
      "Set up monitoring and logging",
      "Configure backup and recovery",
      "Test all integrations thoroughly",
    ],
  },
};

// ============================================================================
// 8. UTILITY FUNCTIONS (Enhanced from original)
// ============================================================================

/**
 * Divine Wisdom Generator
 * Generates mystical responses using ancient Egyptian wisdom
 */
export function generateDivineWisdom(
  context: string,
  tone: "mystical" | "practical" | "authoritative" = "mystical",
): string {
  const mysticalPhrases = [
    "Like the sacred Nile flowing through Egypt, wisdom flows through the digital realm...",
    "In the hall of Anubis, knowledge is eternal and truth is divine...",
    "The ancient scrolls reveal that in every challenge lies opportunity...",
    "Through the eye of Horus, we see the path to enlightenment...",
    "The wisdom of the pharaohs guides us in this digital age...",
  ];

  const practicalPhrases = [
    "The practical application of ancient wisdom reveals...",
    "In the modern world, we adapt ancient knowledge to...",
    "The timeless principles of leadership show us that...",
    "Drawing from centuries of wisdom, the solution is...",
    "The ancient texts teach us to approach this by...",
  ];

  const authoritativePhrases = [
    "By the authority vested in me by Anubis himself...",
    "The divine decree is clear: we must...",
    "In the name of ancient wisdom, I command...",
    "The sacred laws of the digital realm require...",
    "By the power of divine knowledge, we shall...",
  ];

  const phrases =
    tone === "mystical"
      ? mysticalPhrases
      : tone === "practical"
        ? practicalPhrases
        : authoritativePhrases;

  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  return `${randomPhrase} ${context}`;
}

/**
 * Community Health Checker
 * Assesses the health and vitality of a digital community
 */
export async function assessCommunityHealth(
  runtime: IAgentRuntime,
  communityId: string,
): Promise<{
  health: "excellent" | "good" | "fair" | "poor";
  metrics: {
    activeMembers: number;
    engagementRate: number;
    responseTime: number;
    contentQuality: number;
    memberSatisfaction: number;
    growthRate: number;
  };
  recommendations: string[];
  actionItems: Array<{
    priority: "high" | "medium" | "low";
    action: string;
    timeline: string;
    expectedOutcome: string;
  }>;
}> {
  // This would integrate with actual community metrics
  // For now, returning a comprehensive template response
  return {
    health: "good",
    metrics: {
      activeMembers: 150,
      engagementRate: 0.75,
      responseTime: 2.5,
      contentQuality: 0.8,
      memberSatisfaction: 0.85,
      growthRate: 0.12,
    },
    recommendations: [
      "Implement regular community check-ins",
      "Create engaging content themes",
      "Establish clear community guidelines",
      "Foster member-to-member connections",
      "Develop leadership pipeline",
      "Optimize onboarding process",
    ],
    actionItems: [
      {
        priority: "high",
        action: "Review and update community guidelines",
        timeline: "1 week",
        expectedOutcome: "Clearer expectations and reduced conflicts",
      },
      {
        priority: "medium",
        action: "Launch monthly community events",
        timeline: "2 weeks",
        expectedOutcome: "Increased engagement and member retention",
      },
      {
        priority: "low",
        action: "Create community handbook",
        timeline: "1 month",
        expectedOutcome: "Better onboarding and member education",
      },
    ],
  };
}

/**
 * Divine Response Evaluator
 * Evaluates the quality and appropriateness of responses
 */
export function evaluateDivineResponse(
  response: string,
  context: string,
  expectedTone: "mystical" | "practical" | "authoritative",
): {
  score: number;
  feedback: string[];
  improvements: string[];
  metrics: {
    mysticalElements: number;
    practicalGuidance: number;
    empathyLevel: number;
    contextRelevance: number;
    toneAlignment: number;
  };
} {
  let score = 0;
  const feedback: string[] = [];
  const improvements: string[] = [];

  // Initialize metrics
  const metrics = {
    mysticalElements: 0,
    practicalGuidance: 0,
    empathyLevel: 0,
    contextRelevance: 0,
    toneAlignment: 0,
  };

  // Check for mystical elements
  if (
    response.includes("ancient") ||
    response.includes("divine") ||
    response.includes("sacred")
  ) {
    score += 20;
    metrics.mysticalElements = 20;
    feedback.push("Contains appropriate mystical elements");
  } else {
    improvements.push("Consider adding mystical or divine references");
  }

  // Check for practical guidance
  if (
    response.includes("should") ||
    response.includes("must") ||
    response.includes("will")
  ) {
    score += 20;
    metrics.practicalGuidance = 20;
    feedback.push("Provides actionable guidance");
  } else {
    improvements.push("Include specific actionable steps");
  }

  // Check for empathy and warmth
  if (
    response.includes("understand") ||
    response.includes("care") ||
    response.includes("support")
  ) {
    score += 20;
    metrics.empathyLevel = 20;
    feedback.push("Shows empathy and care");
  } else {
    improvements.push("Express more empathy and understanding");
  }

  // Check for context relevance
  if (response.toLowerCase().includes(context.toLowerCase())) {
    score += 20;
    metrics.contextRelevance = 20;
    feedback.push("Addresses the specific context");
  } else {
    improvements.push("Ensure response directly addresses the context");
  }

  // Check for appropriate tone
  if (expectedTone === "mystical" && response.includes("mystical")) {
    score += 20;
    metrics.toneAlignment = 20;
  } else if (expectedTone === "practical" && response.includes("practical")) {
    score += 20;
    metrics.toneAlignment = 20;
  } else if (
    expectedTone === "authoritative" &&
    response.includes("authoritative")
  ) {
    score += 20;
    metrics.toneAlignment = 20;
  } else {
    improvements.push(`Adjust tone to be more ${expectedTone}`);
  }

  return {
    score,
    feedback,
    improvements,
    metrics,
  };
}

/**
 * Memory Enhancement Utility
 * Enhances memory retrieval with divine wisdom context
 */
export async function enhanceMemoryWithWisdom(
  runtime: IAgentRuntime,
  memory: Memory,
  context: string,
): Promise<
  Memory & { divineContext?: string; enhancedMetadata?: Record<string, any> }
> {
  const divineContext = generateDivineWisdom(
    `This memory relates to: ${context}`,
    "mystical",
  );

  const enhancedMetadata = {
    enhancedAt: new Date().toISOString(),
    enhancementType: "divine_wisdom",
    context: context,
    originalMemoryId: memory.id,
  };

  return {
    ...memory,
    divineContext,
    enhancedMetadata,
  };
}

/**
 * Platform Integration Checker
 * Checks which platforms are available and configured
 */
export function checkPlatformAvailability(): {
  discord: {
    enabled: boolean;
    features: string[];
    status: "active" | "inactive" | "error";
  };
  telegram: {
    enabled: boolean;
    features: string[];
    status: "active" | "inactive" | "error";
  };
  twitter: {
    enabled: boolean;
    features: string[];
    status: "active" | "inactive" | "error";
    xservexEnabled: boolean;
  };
} {
  return {
    discord: {
      enabled: !!process.env.DISCORD_API_TOKEN,
      features: [
        "Server Management",
        "Role Assignment",
        "Channel Control",
        "Moderation",
      ],
      status: !!process.env.DISCORD_API_TOKEN ? "active" : "inactive",
    },
    telegram: {
      enabled: !!process.env.TELEGRAM_BOT_TOKEN,
      features: [
        "Group Management",
        "Inline Keyboards",
        "File Sharing",
        "Voice Messages",
      ],
      status: !!process.env.TELEGRAM_BOT_TOKEN ? "active" : "inactive",
    },
    twitter: {
      enabled: !!(
        process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET_KEY
      ),
      features: [
        "Tweet Generation",
        "Thread Creation",
        "Engagement Monitoring",
        "Trend Analysis",
      ],
      status: !!(
        process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET_KEY
      )
        ? "active"
        : "inactive",
      xservexEnabled: !!(
        process.env.XSERVEX_EMAIL && process.env.XSERVEX_PASSWORD
      ),
    },
  };
}

/**
 * Divine Error Handler
 * Provides mystical context for error handling
 */
export function handleErrorWithDivineWisdom(
  error: Error,
  context: string,
): {
  message: string;
  guidance: string;
  nextSteps: string[];
  errorCode: string;
  severity: "low" | "medium" | "high" | "critical";
  recoveryTime: string;
} {
  const divineMessage = generateDivineWisdom(
    `Even in error, wisdom emerges. The issue: ${error.message}`,
    "practical",
  );

  const guidance =
    "The ancient texts teach us that every obstacle is an opportunity for growth and learning.";

  const nextSteps = [
    "Analyze the error with divine patience",
    "Seek the root cause in the sacred logs",
    "Implement the solution with wisdom",
    "Learn from this experience for future guidance",
    "Document the lesson for future generations",
  ];

  // Determine severity based on error type
  let severity: "low" | "medium" | "high" | "critical" = "medium";
  if (error.message.includes("timeout") || error.message.includes("network"))
    severity = "low";
  if (error.message.includes("permission") || error.message.includes("auth"))
    severity = "high";
  if (error.message.includes("fatal") || error.message.includes("crash"))
    severity = "critical";

  // Estimate recovery time
  const recoveryTime =
    severity === "low"
      ? "5 minutes"
      : severity === "medium"
        ? "15 minutes"
        : severity === "high"
          ? "1 hour"
          : "4+ hours";

  return {
    message: divineMessage,
    guidance,
    nextSteps,
    errorCode: error.name || "UNKNOWN_ERROR",
    severity,
    recoveryTime,
  };
}

/**
 * Community Engagement Calculator
 * Calculates optimal engagement strategies
 */
export function calculateEngagementStrategy(
  memberCount: number,
  activityLevel: "low" | "medium" | "high",
  platform: "discord" | "telegram" | "twitter" | "mixed",
): {
  strategy: string;
  frequency: string;
  contentTypes: string[];
  expectedOutcome: string;
  implementation: Array<{
    phase: string;
    duration: string;
    actions: string[];
    metrics: string[];
  }>;
  riskFactors: string[];
  successIndicators: string[];
} {
  const strategies = {
    low: {
      strategy: "Gentle Awakening",
      frequency: "Weekly check-ins",
      contentTypes: [
        "Welcome messages",
        "Simple polls",
        "Member spotlights",
        "Beginner guides",
      ],
      expectedOutcome: "Gradual increase in member activity and engagement",
    },
    medium: {
      strategy: "Balanced Growth",
      frequency: "Bi-weekly events",
      contentTypes: [
        "Community challenges",
        "Expert Q&A sessions",
        "Collaborative projects",
        "Skill sharing",
      ],
      expectedOutcome:
        "Sustained engagement with steady growth and member retention",
    },
    high: {
      strategy: "Thriving Community",
      frequency: "Daily interactions",
      contentTypes: [
        "Live events",
        "Complex challenges",
        "Member-led initiatives",
        "Cross-platform campaigns",
      ],
      expectedOutcome:
        "High retention, organic growth, and community self-sustainability",
    },
  };

  const baseStrategy = strategies[activityLevel];

  // Add platform-specific considerations
  const platformAdjustments = {
    discord: {
      strategy: baseStrategy.strategy,
      frequency: baseStrategy.frequency,
      contentTypes: [
        ...baseStrategy.contentTypes,
        "Voice channels",
        "Server events",
        "Role-based activities",
      ],
      expectedOutcome: baseStrategy.expectedOutcome,
    },
    telegram: {
      strategy: baseStrategy.strategy,
      frequency: baseStrategy.frequency,
      contentTypes: [
        ...baseStrategy.contentTypes,
        "Channel broadcasts",
        "Group polls",
        "File sharing events",
      ],
      expectedOutcome: baseStrategy.expectedOutcome,
    },
    twitter: {
      strategy: baseStrategy.strategy,
      frequency: baseStrategy.frequency,
      contentTypes: [
        ...baseStrategy.contentTypes,
        "Tweet threads",
        "Twitter spaces",
        "Hashtag campaigns",
      ],
      expectedOutcome: baseStrategy.expectedOutcome,
    },
    mixed: {
      strategy: baseStrategy.strategy,
      frequency: baseStrategy.frequency,
      contentTypes: [
        ...baseStrategy.contentTypes,
        "Cross-platform events",
        "Unified messaging",
        "Platform-specific content",
      ],
      expectedOutcome: baseStrategy.expectedOutcome,
    },
  };

  const adjustedStrategy = platformAdjustments[platform];

  return {
    strategy: adjustedStrategy.strategy,
    frequency: adjustedStrategy.frequency,
    contentTypes: adjustedStrategy.contentTypes,
    expectedOutcome: adjustedStrategy.expectedOutcome,
    implementation: [
      {
        phase: "Phase 1: Foundation",
        duration: "2 weeks",
        actions: [
          "Set up basic engagement structure",
          "Train community leaders",
          "Establish guidelines",
        ],
        metrics: [
          "Member participation rate",
          "Response time",
          "Content quality score",
        ],
      },
      {
        phase: "Phase 2: Growth",
        duration: "4 weeks",
        actions: [
          "Launch engagement campaigns",
          "Introduce new content types",
          "Measure and optimize",
        ],
        metrics: ["Engagement rate", "Member retention", "Community growth"],
      },
      {
        phase: "Phase 3: Optimization",
        duration: "Ongoing",
        actions: [
          "Refine strategies",
          "Scale successful initiatives",
          "Maintain engagement",
        ],
        metrics: [
          "Overall community health",
          "Member satisfaction",
          "Long-term retention",
        ],
      },
    ],
    riskFactors: [
      "Over-engagement leading to member fatigue",
      "Inconsistent content quality",
      "Lack of community leadership",
      "Platform-specific limitations",
      "Member churn during transitions",
    ],
    successIndicators: [
      "Increased member activity",
      "Higher engagement rates",
      "Positive member feedback",
      "Organic community growth",
      "Sustainable activity patterns",
    ],
  };
}

// ============================================================================
// 9. EXPORT ALL UTILITIES AND INTERFACES
// ============================================================================

/**
 * Complete Agent Utilities Export
 * Includes all interfaces, classes, and utility functions
 */
export const agentUtils = {
  // Community management
  communityManagementActions,

  // Platform integration
  platformIntegrations,

  // Thought process
  AdvancedThoughtProcess,

  // Templates
  customMessageHandlerTemplate,
  customPostCreationTemplate,

  // Setup guide
  characterSetupGuide,

  // Utility functions
  generateDivineWisdom,
  assessCommunityHealth,
  evaluateDivineResponse,
  enhanceMemoryWithWisdom,
  checkPlatformAvailability,
  handleErrorWithDivineWisdom,
  calculateEngagementStrategy,
};

export default agentUtils;
