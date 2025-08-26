---
trigger: model_decision
description: ElizaOS Memory System: Operational Rules and Best Practices
globs:
---
# ElizaOS Memory System: Operational Rules and Best Practices

## Critical Development Rules

### Rule 1: Memory System Architecture Compliance

**Rule 1.1: Unified Interface Adherence**
- **ALWAYS use** the `AgentRuntime` class methods for memory operations
- **NEVER access** database adapters directly from runtime
- **MUST follow** the `IDatabaseAdapter` interface contract defined in [database.ts](mdc:packages/core/src/types/database.ts:99-167)

**Rule 1.2: Memory Type Classification**
- **EVERY memory** MUST be classified using predefined types from [memory.ts](mdc:packages/core/src/types/memory.ts:17-23)
- **CUSTOM types** MUST extend `BaseMetadata` interface properly
- **Metadata validation** MUST be implemented for all custom types

**Rule 1.3: Essential Field Requirements**
- **REQUIRED fields**: `entityId`, `roomId`, `content`
- **OPTIONAL but RECOMMENDED**: `agentId`, `worldId`, `embedding`
- **Metadata MUST** include `type` and `timestamp`

### Rule 2: Memory Operations Protocol

**Rule 2.1: Creation Operations**
```typescript
// ✅ CORRECT - Use runtime methods with proper parameters
const memoryId = await runtime.createMemory({
  entityId: userId,
  roomId: roomId,
  content: { text: "Memory content" },
  metadata: { type: MemoryType.CUSTOM }
}, 'custom_table', true);

// ❌ INCORRECT - Missing required fields
const memoryId = await runtime.createMemory({
  content: { text: "Memory content" }
}, 'custom_table');
```

**Rule 2.2: Retrieval Operations**
```typescript
// ✅ CORRECT - Use proper query parameters
const memories = await runtime.getMemories({
  tableName: 'messages',
  roomId: roomId,
  count: 10,
  unique: false
});

// ❌ INCORRECT - Missing required tableName
const memories = await runtime.getMemories({ roomId });
```

**Rule 2.3: Search Operations**
```typescript
// ✅ CORRECT - Semantic search with embeddings
const results = await runtime.searchMemories({
  tableName: 'facts',
  embedding: queryEmbedding,
  roomId: roomId,
  count: 5,
  match_threshold: 0.7
});

// ❌ INCORRECT - Search without tableName
const results = await runtime.searchMemories({ embedding: queryEmbedding });
```

### Rule 3: Memory Content and Metadata Standards

**Rule 3.1: Content Structure**
```typescript
// ✅ CORRECT - Proper content structure
const memory: Memory = {
  content: {
    text: "Primary text content",
    source: "user_input",
    additional: "Extra data"
  }
};

// ❌ INCORRECT - Missing text field
const memory: Memory = {
  content: {
    source: "user_input"
  }
};
```

**Rule 3.2: Metadata Implementation**
```typescript
// ✅ CORRECT - Proper metadata with type guards
const metadata: CustomMetadata = {
  type: MemoryType.CUSTOM,
  source: 'action_result',
  timestamp: Date.now(),
  tags: ['action', 'result'],
  customField: 'value'
};

// ❌ INCORRECT - Missing required type field
const metadata = {
  source: 'action_result',
  customField: 'value'
};
```

### Rule 4: Embedding and Semantic Search

**Rule 4.1: Embedding Generation**
```typescript
// ✅ CORRECT - Generate embeddings before storage
if (memory.content.text) {
  const embedding = await runtime.useModel(ModelType.TEXT_EMBEDDING, {
    text: memory.content.text
  });
  memory.embedding = embedding;
}

// ❌ INCORRECT - Store without embedding for searchable content
await runtime.createMemory(memory, 'searchable_table');
```

**Rule 4.2: Search Thresholds**
```typescript
// ✅ CORRECT - Use appropriate similarity thresholds
const results = await runtime.searchMemories({
  tableName: 'facts',
  embedding: queryEmbedding,
  match_threshold: 0.8,  // High precision
  count: 10
});

// ❌ INCORRECT - No threshold (may return irrelevant results)
const results = await runtime.searchMemories({
  tableName: 'facts',
  embedding: queryEmbedding
});
```

### Rule 5: Memory Lifecycle Management

**Rule 5.1: Update Operations**
```typescript
// ✅ CORRECT - Partial updates with required id
const success = await runtime.updateMemory({
  id: memoryId,
  content: { text: "Updated content" },
  metadata: { tags: ['updated'] }
});

// ❌ INCORRECT - Missing required id field
const success = await runtime.updateMemory({
  content: { text: "Updated content" }
});
```

**Rule 5.2: Deletion Operations**
```typescript
// ✅ CORRECT - Proper deletion with error handling
try {
  await runtime.deleteMemory(memoryId);
} catch (error) {
  logger.error(`Failed to delete memory ${memoryId}:`, error);
}

// ❌ INCORRECT - No error handling
await runtime.deleteMemory(memoryId);
```

### Rule 6: Provider Integration Patterns

**Rule 6.1: Memory Provider Structure**
```typescript
// ✅ CORRECT - Proper provider implementation
const memoryProvider: Provider = {
  name: 'MEMORY_DATA',
  description: 'Retrieves relevant memory data',
  dynamic: true,
  get: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
    try {
      const memories = await runtime.searchMemories({
        tableName: 'relevant_data',
        embedding: await runtime.useModel(ModelType.TEXT_EMBEDDING, { 
          text: message.content.text 
        }),
        roomId: message.roomId,
        count: 5
      });
      
      return {
        values: { data: formatMemories(memories) },
        data: { memories },
        text: formatMemories(memories)
      };
    } catch (error) {
      logger.error('Error in memory provider:', error);
      return { values: { data: '' }, data: { memories: [] }, text: 'No data available' };
    }
  }
};
```

**Rule 6.2: Error Handling in Providers**
```typescript
// ✅ CORRECT - Comprehensive error handling
get: async (runtime: IAgentRuntime, message: Memory) => {
  try {
    // Memory operations
    const result = await performMemoryOperation();
    return formatResult(result);
  } catch (error) {
    logger.error('Provider error:', error);
    return getDefaultResponse();
  }
}

// ❌ INCORRECT - No error handling
get: async (runtime: IAgentRuntime, message: Memory) => {
  const result = await performMemoryOperation();
  return formatResult(result);
}
```

### Rule 7: Performance and Optimization

**Rule 7.1: Query Optimization**
```typescript
// ✅ CORRECT - Optimized queries with limits
const memories = await runtime.getMemories({
  tableName: 'messages',
  roomId: roomId,
  count: 20,        // Reasonable limit
  start: startTime, // Time-based filtering
  end: endTime
});

// ❌ INCORRECT - Unbounded queries
const memories = await runtime.getMemories({
  tableName: 'messages',
  roomId: roomId
  // No count limit - could return thousands of results
});
```

**Rule 7.2: Batch Operations**
```typescript
// ✅ CORRECT - Batch deletion for multiple memories
if (memoryIds.length > 0) {
  await runtime.deleteManyMemories(memoryIds);
}

// ❌ INCORRECT - Individual deletions in loop
for (const id of memoryIds) {
  await runtime.deleteMemory(id); // Inefficient
}
```

### Rule 8: Security and Access Control

**Rule 8.1: Memory Scoping**
```typescript
// ✅ CORRECT - Proper scope implementation
const privateMemory: Memory = {
  content: { text: "Private data" },
  metadata: {
    type: MemoryType.CUSTOM,
    scope: 'private',  // Restricts access
    tags: ['private', 'sensitive']
  }
};

// ❌ INCORRECT - No scope specification
const memory: Memory = {
  content: { text: "Data" },
  metadata: { type: MemoryType.CUSTOM }
  // No scope - defaults to shared
};
```

**Rule 8.2: Input Validation**
```typescript
// ✅ CORRECT - Validate memory before storage
const validateMemory = (memory: Memory): boolean => {
  if (!memory.content?.text) return false;
  if (!memory.entityId || !memory.roomId) return false;
  if (memory.embedding && !Array.isArray(memory.embedding)) return false;
  return true;
};

if (!validateMemory(memory)) {
  throw new Error('Invalid memory data');
}
await runtime.createMemory(memory, 'table');
```

### Rule 9: Testing and Quality Assurance

**Rule 9.1: Mock Memory Creation**
```typescript
// ✅ CORRECT - Use test utilities
import { createMockMemory, createMockUserMessage } from '@elizaos/test-utils';

const mockMemory = createMockMemory({
  content: { text: 'Test content' },
  metadata: { type: MemoryType.MESSAGE }
});

// ❌ INCORRECT - Manual mock creation
const mockMemory: Memory = {
  id: 'test-id' as UUID,
  entityId: 'test-entity' as UUID,
  // ... missing required fields
};
```

**Rule 9.2: Memory Testing Patterns**
```typescript
// ✅ CORRECT - Test memory operations
describe('Memory Operations', () => {
  it('should create memory with proper metadata', async () => {
    const memory = createMockMemory({
      metadata: { type: MemoryType.CUSTOM, tags: ['test'] }
    });
    
    const id = await runtime.createMemory(memory, 'test_table');
    expect(id).toBeDefined();
    
    const retrieved = await runtime.getMemoryById(id);
    expect(retrieved?.metadata?.tags).toContain('test');
  });
});
```

### Rule 10: Integration and API Usage

**Rule 10.1: REST API Integration**
```typescript
// ✅ CORRECT - Proper API client usage
import { MemoryService } from '@elizaos/api-client';

const memoryService = new MemoryService(baseUrl);

try {
  const { memories } = await memoryService.getAgentMemories(agentId, {
    tableName: 'messages',
    count: 10
  });
  return memories;
} catch (error) {
  logger.error('API call failed:', error);
  return [];
}

// ❌ INCORRECT - No error handling
const { memories } = await memoryService.getAgentMemories(agentId);
return memories;
```

## Compliance Checklist

Before deploying any memory-related code, ensure:

- [ ] All memory operations use `AgentRuntime` methods
- [ ] Required fields are properly populated
- [ ] Metadata includes proper type classification
- [ ] Error handling is implemented for all operations
- [ ] Memory scoping is appropriate for data sensitivity
- [ ] Embeddings are generated for searchable content
- [ ] Query limits are implemented to prevent performance issues
- [ ] Input validation is performed before storage
- [ ] Tests cover all memory operation scenarios
- [ ] API integration includes proper error handling

## Violation Consequences

**Minor Violations:**
- Performance degradation
- Inconsistent data retrieval
- Poor user experience

**Major Violations:**
- Data corruption
- Security vulnerabilities
- System crashes
- Memory leaks

**Critical Violations:**
- Complete system failure
- Data loss
- Security breaches

## Best Practices Summary

1. **ALWAYS** use runtime methods, never direct database access
2. **ALWAYS** include required fields and proper metadata
3. **ALWAYS** implement comprehensive error handling
4. **ALWAYS** validate input data before storage
5. **ALWAYS** use appropriate memory scoping
6. **ALWAYS** generate embeddings for searchable content
7. **ALWAYS** implement query limits and pagination
8. **ALWAYS** test memory operations thoroughly
9. **ALWAYS** follow the established patterns and interfaces
10. **NEVER** bypass the memory system architecture

Following these rules ensures robust, secure, and performant memory systems that integrate seamlessly with the ElizaOS framework.
description:
globs:
alwaysApply: false
---
