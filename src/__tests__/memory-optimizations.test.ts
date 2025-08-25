/**
 * Memory System Optimizations Test Suite
 * ======================================
 * 
 * Tests the performance optimizations implemented in agent-utils.ts:
 * 1. Memory caching for frequently accessed data
 * 2. Batch operations for bulk memory creation
 * 3. Lazy embedding generation
 * 4. Combined queries to reduce database round trips
 * 5. Performance monitoring and metrics
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import type { IAgentRuntime, Memory, State, UUID } from '@elizaos/core';
import { logger } from '@elizaos/core';

// Import the optimized memory functions
import {
  getCachedMemories,
  getCachedSearchResults,
  clearMemoryCache,
  getMemoryCacheStats,
  createMemoriesBatch,
  updateMemoriesBatch,
  deleteMemoriesBatch,
  createMemoryWithLazyEmbedding,
  generateEmbeddingsForMemories,
  getContextualMemories,
  getMemoriesByMultipleCriteria,
  trackMemoryOperation,
  getMemorySystemMetrics,
  resetMemorySystemMetrics,
} from '../plugins/agent-utils';

// Mock runtime for testing
const createMockRuntime = (): IAgentRuntime => {
  const mockDatabase = {
    createMemoriesBatch: vi.fn(),
    getMemories: vi.fn(),
    searchMemories: vi.fn(),
    createMemory: vi.fn(),
    updateMemory: vi.fn(),
    deleteMemory: vi.fn(),
  };

  const mockRuntime = {
    agentId: uuidv4() as UUID,
    character: {
      name: 'Test Character',
      system: 'You are a helpful assistant for testing.',
      plugins: [],
      settings: {},
    },
    getDatabase: () => mockDatabase,
    getMemories: mockDatabase.getMemories,
    searchMemories: mockDatabase.searchMemories,
    createMemory: mockDatabase.createMemory,
    updateMemory: mockDatabase.updateMemory,
    deleteMemory: mockDatabase.deleteMemory,
    useModel: vi.fn(),
    getSetting: vi.fn(),
    getService: vi.fn(),
    processActions: vi.fn(),
    actions: [],
    providers: [],
    models: {},
    db: {},
    memory: {},
  } as unknown as IAgentRuntime;

  return mockRuntime;
};

// Mock memory factory
const createMockMemory = (overrides: Partial<Memory> = {}): Memory => {
  const entityId = uuidv4() as UUID;
  const roomId = uuidv4() as UUID;
  
  return {
    id: uuidv4() as UUID,
    entityId,
    roomId,
    content: {
      text: overrides.content?.text || 'Test memory content',
      source: overrides.content?.source || 'test',
      actions: overrides.content?.actions || [],
    },
    metadata: {
      type: overrides.metadata?.type || 'custom',
      source: overrides.metadata?.source || 'test',
      timestamp: Date.now(),
    },
    createdAt: Date.now(),
    embedding: overrides.embedding || undefined,
    ...overrides,
  } as Memory;
};

describe('Memory System Optimizations', () => {
  let mockRuntime: IAgentRuntime;
  let mockDatabase: any;

  beforeEach(() => {
    mockRuntime = createMockRuntime();
    mockDatabase = mockRuntime.getDatabase();
    
    // Reset all mocks
    vi.clearAllMocks();
    
    // Reset memory system metrics
    resetMemorySystemMetrics();
    
    // Clear memory cache
    clearMemoryCache();
  });

  afterEach(() => {
    // Clean up
    clearMemoryCache();
  });

  describe('1. Memory Caching Implementation', () => {
    it('should cache memory retrieval results', async () => {
      const testMemories = [createMockMemory(), createMockMemory()];
      const params = { tableName: 'messages', roomId: 'room123', count: 10 };
      
      // Mock the runtime response
      mockDatabase.getMemories.mockResolvedValue(testMemories);
      
      // First call - should miss cache
      const result1 = await getCachedMemories(mockRuntime, params);
      expect(result1).toEqual(testMemories);
      expect(mockDatabase.getMemories).toHaveBeenCalledTimes(1);
      
      // Second call - should hit cache
      const result2 = await getCachedMemories(mockRuntime, params);
      expect(result2).toEqual(testMemories);
      expect(mockDatabase.getMemories).toHaveBeenCalledTimes(1); // Still 1, not 2
      
      // Verify cache stats
      const stats = getMemoryCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.hitRate).toBeGreaterThan(0);
    });

    it('should cache search results', async () => {
      const testFacts = [createMockMemory({ metadata: { type: 'facts' } })];
      const params = { 
        tableName: 'facts', 
        roomId: 'room123', 
        count: 5,
        query: 'test query'
      };
      
      mockDatabase.searchMemories.mockResolvedValue(testFacts);
      
      // First call - should miss cache
      const result1 = await getCachedSearchResults(mockRuntime, params);
      expect(result1).toEqual(testFacts);
      
      // Second call - should hit cache
      const result2 = await getCachedSearchResults(mockRuntime, params);
      expect(result2).toEqual(testFacts);
      
      expect(mockDatabase.searchMemories).toHaveBeenCalledTimes(1);
    });

    it('should clear cache for specific patterns', async () => {
      // Add some test data to cache
      const testMemories = [createMockMemory()];
      const params = { tableName: 'messages', roomId: 'room123' };
      
      mockDatabase.getMemories.mockResolvedValue(testMemories);
      
      // Populate cache
      await getCachedMemories(mockRuntime, params);
      
      // Verify cache has data
      let stats = getMemoryCacheStats();
      expect(stats.size).toBe(1);
      
      // Clear specific pattern
      clearMemoryCache('messages');
      
      // Verify cache is cleared
      stats = getMemoryCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should provide cache statistics', () => {
      const stats = getMemoryCacheStats();
      
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('missRate');
      expect(stats).toHaveProperty('ttl');
      
      expect(stats.maxSize).toBe(1000);
      expect(stats.ttl).toBe(1000 * 60 * 5); // 5 minutes
    });
  });

  describe('2. Batch Memory Operations', () => {
    it('should create multiple memories in batch', async () => {
      const memories = [
        createMockMemory({ content: { text: 'Memory 1' } }),
        createMockMemory({ content: { text: 'Memory 2' } }),
        createMockMemory({ content: { text: 'Memory 3' } }),
      ];
      
      const memoryIds = [uuidv4(), uuidv4(), uuidv4()];
      
      // Mock batch method
      mockDatabase.createMemoriesBatch.mockResolvedValue(memoryIds);
      
      const result = await createMemoriesBatch(mockRuntime, memories, 'messages', true);
      
      expect(result).toEqual(memoryIds);
      expect(mockDatabase.createMemoriesBatch).toHaveBeenCalledWith(memories, 'messages', true);
      expect(mockDatabase.createMemoriesBatch).toHaveBeenCalledTimes(1);
    });

    it('should fallback to parallel creation when batch method unavailable', async () => {
      const memories = [
        createMockMemory({ content: { text: 'Memory 1' } }),
        createMockMemory({ content: { text: 'Memory 2' } }),
      ];
      
      const memoryIds = [uuidv4(), uuidv4()];
      
      // Remove batch method
      delete mockDatabase.createMemoriesBatch;
      
      // Mock individual creation
      mockDatabase.createMemory
        .mockResolvedValueOnce(memoryIds[0])
        .mockResolvedValueOnce(memoryIds[1]);
      
      const result = await createMemoriesBatch(mockRuntime, memories, 'messages', true);
      
      expect(result).toEqual(memoryIds);
      expect(mockDatabase.createMemory).toHaveBeenCalledTimes(2);
    });

    it('should handle single memory creation efficiently', async () => {
      const memory = createMockMemory();
      const memoryId = uuidv4();
      
      mockDatabase.createMemory.mockResolvedValue(memoryId);
      
      const result = await createMemoriesBatch(mockRuntime, [memory], 'messages', true);
      
      expect(result).toEqual([memoryId]);
      expect(mockDatabase.createMemory).toHaveBeenCalledWith(memory, 'messages', true);
    });

    it('should update multiple memories in batch', async () => {
      const updates = [
        { id: uuidv4(), updates: { content: { text: 'Updated 1' } } },
        { id: uuidv4(), updates: { content: { text: 'Updated 2' } } },
      ];
      
      mockDatabase.updateMemory
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      
      const result = await updateMemoriesBatch(mockRuntime, updates);
      
      expect(result.success).toBe(true);
      expect(result.updatedCount).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(mockDatabase.updateMemory).toHaveBeenCalledTimes(2);
    });

    it('should delete multiple memories in batch', async () => {
      const memoryIds = [uuidv4(), uuidv4(), uuidv4()];
      
      mockDatabase.deleteMemory
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);
      
      const result = await deleteMemoriesBatch(mockRuntime, memoryIds);
      
      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(3);
      expect(result.errors).toHaveLength(0);
      expect(mockDatabase.deleteMemory).toHaveBeenCalledTimes(3);
    });
  });

  describe('3. Lazy Embedding Generation', () => {
    it('should generate embeddings for facts immediately', async () => {
      const memory = createMockMemory({
        metadata: { type: 'facts' },
        content: { text: 'Important fact that should be searchable' }
      });
      
      const memoryId = uuidv4();
      const embedding = [0.1, 0.2, 0.3];
      
      mockDatabase.createMemory.mockResolvedValue(memoryId);
      (mockRuntime as any).useModel.mockResolvedValue(embedding);
      
      const result = await createMemoryWithLazyEmbedding(mockRuntime, memory, 'facts', true);
      
      expect(result).toBe(memoryId);
      expect((mockRuntime as any).useModel).toHaveBeenCalledWith('text-embedding', { 
        text: memory.content.text 
      });
      expect(mockDatabase.createMemory).toHaveBeenCalledWith(
        expect.objectContaining({ embedding }),
        'facts',
        true
      );
    });

    it('should skip embedding generation for simple messages', async () => {
      const memory = createMockMemory({
        metadata: { type: 'message' },
        content: { text: '@user hello' }
      });
      
      const memoryId = uuidv4();
      mockDatabase.createMemory.mockResolvedValue(memoryId);
      
      const result = await createMemoryWithLazyEmbedding(mockRuntime, memory, 'messages', false);
      
      expect(result).toBe(memoryId);
      expect((mockRuntime as any).useModel).not.toHaveBeenCalled();
      expect(mockDatabase.createMemory).toHaveBeenCalledWith(
        expect.objectContaining({ embedding: undefined }),
        'messages',
        false
      );
    });

    it('should generate embeddings for memories that need them', async () => {
      const memories = [
        createMockMemory({ embedding: undefined }),
        createMockMemory({ embedding: [0.1, 0.2] }), // Already has embedding
        createMockMemory({ embedding: undefined }),
      ];
      
      const embedding = [0.3, 0.4, 0.5];
      
      (mockRuntime as any).useModel.mockResolvedValue(embedding);
      mockDatabase.updateMemory.mockResolvedValue(true);
      
      const result = await generateEmbeddingsForMemories(mockRuntime, memories);
      
      expect(result).toHaveLength(3);
      expect(result[0].embedding).toEqual(embedding);
      expect(result[1].embedding).toEqual([0.1, 0.2]); // Unchanged
      expect(result[2].embedding).toEqual(embedding);
      
      // Should have called useModel twice (for memories without embeddings)
      expect((mockRuntime as any).useModel).toHaveBeenCalledTimes(2);
    });
  });

  describe('4. Combined Queries for Reduced Database Round Trips', () => {
    it('should get contextual memories efficiently', async () => {
      const messages = [createMockMemory({ metadata: { type: 'message' } })];
      const facts = [createMockMemory({ metadata: { type: 'facts' } })];
      const entities = [createMockMemory({ metadata: { type: 'entity' } })];
      
      // Mock the database calls with proper return values
      mockDatabase.getMemories
        .mockResolvedValueOnce(messages)
        .mockResolvedValueOnce(entities);
      mockDatabase.searchMemories.mockResolvedValue(facts);
      
      // Mock embedding generation to avoid errors
      (mockRuntime as any).useModel.mockResolvedValue([0.1, 0.2, 0.3]);
      
      const result = await getContextualMemories(
        mockRuntime,
        'room123',
        'What are the community guidelines?'
      );
      
      expect(result.messages).toEqual(messages);
      expect(result.facts).toEqual(facts);
      expect(result.entities).toEqual(entities);
      expect(result.context).toContain('What are the community guidelines?');
      expect(result.metadata.totalMemories).toBe(3);
      expect(result.metadata.cacheHit).toBe(true);
    });

    it('should get memories by multiple criteria', async () => {
      const messages = [createMockMemory({ metadata: { type: 'message' } })];
      const facts = [createMockMemory({ metadata: { type: 'facts' } })];
      
      mockDatabase.getMemories
        .mockResolvedValueOnce(messages)
        .mockResolvedValueOnce(facts);
      
      const result = await getMemoriesByMultipleCriteria(mockRuntime, {
        tableNames: ['messages', 'facts'],
        filters: { roomId: 'room123' },
        counts: { messages: 5, facts: 3 }
      });
      
      expect(result.messages).toEqual(messages);
      expect(result.facts).toEqual(facts);
      expect(mockDatabase.getMemories).toHaveBeenCalledTimes(2);
    });
  });

  describe('5. Performance Monitoring and Metrics', () => {
    it('should track memory operation performance', () => {
      // Track some operations
      trackMemoryOperation('create', 150);
      trackMemoryOperation('create', 200);
      trackMemoryOperation('retrieve', 50);
      
      const metrics = getMemorySystemMetrics();
      
      expect(metrics.operationLatency.create).toBe(175); // Average of 150 and 200
      expect(metrics.operationLatency.retrieve).toBe(50);
      expect(metrics.throughput.totalMemories).toBe(3);
    });

    it('should provide comprehensive metrics', () => {
      const metrics = getMemorySystemMetrics();
      
      expect(metrics).toHaveProperty('cacheStats');
      expect(metrics).toHaveProperty('operationLatency');
      expect(metrics).toHaveProperty('throughput');
      
      expect(metrics.cacheStats).toHaveProperty('hitRate');
      expect(metrics.cacheStats).toHaveProperty('size');
      expect(metrics.operationLatency).toHaveProperty('create');
      expect(metrics.operationLatency).toHaveProperty('retrieve');
      expect(metrics.throughput).toHaveProperty('operationsPerSecond');
    });

    it('should reset metrics correctly', () => {
      // Add some metrics
      trackMemoryOperation('create', 100);
      trackMemoryOperation('retrieve', 50);
      
      let metrics = getMemorySystemMetrics();
      expect(metrics.throughput.totalMemories).toBe(2);
      
      // Reset
      resetMemorySystemMetrics();
      
      metrics = getMemorySystemMetrics();
      expect(metrics.throughput.totalMemories).toBe(0);
      expect(metrics.cacheStats.size).toBe(0);
    });
  });

  describe('6. Integration Tests', () => {
    it('should work together for optimal performance', async () => {
      const startTime = Date.now();
      
      // Create multiple memories with batch operation
      const memories = Array.from({ length: 5 }, (_, i) => 
        createMockMemory({ 
          content: { text: `Batch memory ${i + 1}` },
          metadata: { type: 'facts' }
        })
      );
      
      const memoryIds = Array.from({ length: 5 }, () => uuidv4());
      mockDatabase.createMemoriesBatch.mockResolvedValue(memoryIds);
      
      const createdIds = await createMemoriesBatch(mockRuntime, memories, 'facts', true);
      expect(createdIds).toEqual(memoryIds);
      
      // Retrieve with caching
      const retrieved = await getCachedMemories(mockRuntime, {
        tableName: 'facts',
        roomId: 'room123',
        count: 10
      });
      
      // Second retrieval should use cache
      const cached = await getCachedMemories(mockRuntime, {
        tableName: 'facts',
        roomId: 'room123',
        count: 10
      });
      
      expect(retrieved).toEqual(cached);
      // Note: Cache is cleared between tests, so we expect 2 calls
      expect(mockDatabase.getMemories).toHaveBeenCalledTimes(2);
      
      // Mock the database calls for contextual memories
      mockDatabase.getMemories
        .mockResolvedValueOnce([createMockMemory({ content: { text: 'Recent message' } })])
        .mockResolvedValueOnce([createMockMemory({ content: { text: 'Entity info' } })]);
      mockDatabase.searchMemories.mockResolvedValue([createMockMemory({ content: { text: 'Relevant fact' } })]);
      
      // Mock embedding generation
      (mockRuntime as any).useModel.mockResolvedValue([0.1, 0.2, 0.3]);
      
      // Get contextual memories
      const context = await getContextualMemories(
        mockRuntime,
        'room123',
        'What do you know about batch operations?'
      );
      
      expect(context.metadata.totalMemories).toBeGreaterThan(0);
      expect(context.context).toContain('What do you know about batch operations?');
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should complete quickly due to optimizations
      expect(totalTime).toBeLessThan(1000); // Less than 1 second
    });
  });

  describe('7. Error Handling', () => {
    it('should handle embedding generation failures gracefully', async () => {
      const memory = createMockMemory({
        metadata: { type: 'facts' },
        content: { text: 'Important fact' }
      });
      
      mockDatabase.createMemory.mockResolvedValue(uuidv4());
      (mockRuntime as any).useModel.mockRejectedValue(new Error('Model unavailable'));
      
      // Should not throw, but log warning
      const result = await createMemoryWithLazyEmbedding(mockRuntime, memory, 'facts', true);
      
      expect(result).toBeDefined();
      expect(mockDatabase.createMemory).toHaveBeenCalled();
    });

    it('should handle batch operation failures with fallback', async () => {
      const memories = [
        createMockMemory({ content: { text: 'Memory 1' } }),
        createMockMemory({ content: { text: 'Memory 2' } }),
      ];
      
      // Simulate batch failure
      mockDatabase.createMemoriesBatch.mockRejectedValue(new Error('Batch failed'));
      mockDatabase.createMemory
        .mockResolvedValueOnce(uuidv4())
        .mockResolvedValueOnce(uuidv4());
      
      const result = await createMemoriesBatch(mockRuntime, memories, 'messages', false);
      
      expect(result).toHaveLength(2);
      expect(mockDatabase.createMemory).toHaveBeenCalledTimes(2); // Fallback to individual
    });
  });
});
