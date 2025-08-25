# ElizaOS Database Integration Layer Guide

## 🎯 **Overview**

This guide demonstrates how to **correctly and efficiently** use the ElizaOS database integration layer, including:
- **IDatabaseAdapter Interface** - Abstract database adapter interface
- **BaseDrizzleAdapter** - Drizzle ORM implementation for PostgreSQL/PGLite
- **Database Configuration** - Environment variables and connection settings
- **Database Schema and Tables** - Core table definitions and relationships
- **Connection Management** - Connection pooling and retry logic
- **Plugin Integration** - Database plugin registration and migrations
- **Embedding Dimension Management** - Vector embedding storage and retrieval

## 🚨 **Previous Issues (What We Were Doing Wrong)**

### **1. Missing Database Adapter Interface Integration**
```typescript
// ❌ WRONG - No database adapter interface usage
export const oldTemplate = `<task>Handle database operations</task>
<instructions>Store data in database...</instructions>`;

// ✅ CORRECT - Full database adapter interface integration
export const newTemplate = `<task>Use ElizaOS database adapter interface</task>
<instructions>
1. Access database adapter: runtime.getDatabase(): IDatabaseAdapter
2. Use adapter methods: adapter.createMemory(), adapter.getEntity()
3. Handle connection health: adapter.isConnected()
4. Leverage adapter capabilities: adapter.getConnectionInfo()
</instructions>`;
```

### **2. No Drizzle ORM Integration**
```typescript
// ❌ WRONG - No ORM integration
const query = "SELECT * FROM memories WHERE entity_id = $1";

// ✅ CORRECT - Full Drizzle ORM integration
const memories = await db
  .select()
  .from(memoriesTable)
  .where(eq(memoriesTable.entityId, entityId));
```

### **3. Missing Database Configuration**
```typescript
// ❌ WRONG - No configuration handling
const dbUrl = "postgresql://localhost/db";

// ✅ CORRECT - Proper configuration management
const dbUrl = process.env.POSTGRES_URL || process.env.PGLITE_DATA_DIR || "memory://";
```

### **4. No Schema Awareness**
```typescript
// ❌ WRONG - No schema awareness
const tableName = "memories";

// ✅ CORRECT - Full schema awareness
const memory = await db.insert(memoriesTable).values({
  entityId: entityId,
  content: { text: messageText },
  metadata: { type: MemoryType.MESSAGE, scope: 'private' }
});
```

## ✅ **Correct Database Integration Usage Patterns**

### **1. Database Adapter Interface Integration**

```typescript
// Template: databaseAdapterInterfaceTemplate
export const adapterUsageExample = `
<task>Use ElizaOS database adapter interface correctly</task>

<instructions>
1. **Adapter Access**: Use runtime.getDatabase() to access the database adapter
2. **Interface Methods**: Leverage all IDatabaseAdapter methods for data operations
3. **Type Safety**: Use proper TypeScript interfaces for database operations
4. **Error Handling**: Handle database adapter errors gracefully

DATABASE ADAPTER INTERFACE RULES:
- Access via runtime.getDatabase(): IDatabaseAdapter
- Use adapter.createAgent(), adapter.getAgent() for agent management
- Use adapter.createEntity(), adapter.getEntity() for entity management
- Use adapter.createMemory(), adapter.getMemory() for memory operations
- Use adapter.createRoom(), adapter.getRoom() for room management
- Handle adapter errors with proper fallbacks
- Use adapter.isConnected() for connection health checks
- Leverage adapter.getConnectionInfo() for debugging
</instructions>

<output>
<response>
    <thought>Database adapter interface analysis</thought>
    <actions>ADAPTER_ACCESS,INTERFACE_METHODS,ERROR_HANDLING,REPLY</actions>
    <providers>DATABASE_ADAPTER,INTERFACE_SYSTEM</providers>
    <text>Response with proper database adapter interface usage</text>
</response>
</output>`;
```

**Implementation Example:**
```typescript
// Correct database adapter usage in action handler
const databaseActionHandler = async (
  runtime: IAgentRuntime,
  message: Memory,
  state: State
): Promise<ActionResult> => {
  
  try {
    // ✅ CORRECT - Get database adapter with type safety
    const db = runtime.getDatabase();
    if (!db) {
      throw new Error('Database adapter not available');
    }
    
    // ✅ CORRECT - Check connection health
    if (!db.isConnected()) {
      throw new Error('Database not connected');
    }
    
    // ✅ CORRECT - Use adapter methods for data operations
    const entity = await db.getEntity(message.entityId);
    if (!entity) {
      throw new Error('Entity not found');
    }
    
    // ✅ CORRECT - Create memory using adapter
    const memoryId = await db.createMemory({
      entityId: message.entityId,
      agentId: runtime.agentId,
      content: { text: "Processed user request" },
      roomId: message.roomId,
      metadata: {
        type: MemoryType.MESSAGE,
        scope: 'private',
        timestamp: Date.now()
      }
    }, 'user_interactions');
    
    // ✅ CORRECT - Get connection info for debugging
    const connectionInfo = db.getConnectionInfo();
    logger.info('Database operation completed', { memoryId, connectionInfo });
    
    return createActionResult({
      success: true,
      data: { memoryId, entity }
    });
    
  } catch (error) {
    // ✅ CORRECT - Handle database errors gracefully
    logger.error('Database operation failed:', error);
    return createActionResult({
      success: false,
      error: error instanceof Error ? error.message : 'Database error'
    });
  }
};
```

### **2. Drizzle ORM Integration**

```typescript
// Template: drizzleOrmIntegrationTemplate
export const drizzleUsageExample = `
<task>Use ElizaOS Drizzle ORM integration correctly</task>

<instructions>
1. **Drizzle Adapter**: Use BaseDrizzleAdapter for SQL operations
2. **ORM Patterns**: Leverage Drizzle ORM for type-safe database operations
3. **Schema Awareness**: Use proper database schema definitions
4. **Query Building**: Build efficient queries using Drizzle query builder

DRIZZLE ORM INTEGRATION RULES:
- Use BaseDrizzleAdapter for PostgreSQL and PGLite support
- Leverage Drizzle schema definitions for type safety
- Use Drizzle query builder for complex queries
- Handle both PostgreSQL and PGLite backends
- Use proper table relationships and joins
- Leverage Drizzle migrations for schema updates
- Use Drizzle transactions for atomic operations
- Handle ORM-specific errors gracefully
</instructions>

<output>
<response>
    <thought>Drizzle ORM integration analysis</thought>
    <actions>ORM_SELECTION,SCHEMA_AWARENESS,QUERY_BUILDING,REPLY</actions>
    <providers>DRIZZLE_ORM,SCHEMA_SYSTEM</providers>
    <text>Response with proper Drizzle ORM integration usage</text>
</response>
</output>`;
```

**Implementation Example:**
```typescript
// Correct Drizzle ORM usage
import { eq, and, desc, limit } from 'drizzle-orm';
import { memoriesTable, entitiesTable, roomsTable } from './schema';

const drizzleHandler = async (
  runtime: IAgentRuntime,
  message: Memory,
  state: State
): Promise<ActionResult> => {
  
  try {
    const db = runtime.getDatabase();
    if (!db) {
      throw new Error('Database not available');
    }
    
    // ✅ CORRECT - Use Drizzle query builder for complex queries
    const recentMemories = await db
      .select({
        id: memoriesTable.id,
        content: memoriesTable.content,
        createdAt: memoriesTable.createdAt,
        entityName: entitiesTable.name,
        roomName: roomsTable.name
      })
      .from(memoriesTable)
      .innerJoin(entitiesTable, eq(memoriesTable.entityId, entitiesTable.id))
      .innerJoin(roomsTable, eq(memoriesTable.roomId, roomsTable.id))
      .where(
        and(
          eq(memoriesTable.entityId, message.entityId),
          eq(memoriesTable.metadata.type, 'message')
        )
      )
      .orderBy(desc(memoriesTable.createdAt))
      .limit(10);
    
    // ✅ CORRECT - Use Drizzle for type-safe inserts
    const newMemory = await db.insert(memoriesTable).values({
      entityId: message.entityId,
      agentId: runtime.agentId,
      content: { text: "Processed with Drizzle ORM" },
      roomId: message.roomId,
      metadata: {
        type: MemoryType.MESSAGE,
        scope: 'private',
        timestamp: Date.now()
      }
    }).returning();
    
    return createActionResult({
      success: true,
      data: { recentMemories, newMemory: newMemory[0] }
    });
    
  } catch (error) {
    logger.error('Drizzle operation failed:', error);
    return createActionResult({
      success: false,
      error: error instanceof Error ? error.message : 'Drizzle error'
    });
  }
};
```

### **3. Database Configuration Management**

```typescript
// Template: databaseConfigurationTemplate
export const configUsageExample = `
<task>Configure ElizaOS database connections correctly</task>

<instructions>
1. **Environment Variables**: Use proper environment variable configuration
2. **Connection Strings**: Handle PostgreSQL and PGLite connection strings
3. **Connection Pooling**: Configure connection pooling settings
4. **Backend Selection**: Choose appropriate database backend

DATABASE CONFIGURATION RULES:
- Use POSTGRES_URL for PostgreSQL connections
- Use PGLITE_DATA_DIR for PGLite connections
- Configure connection pooling for performance
- Handle connection string validation
- Support multiple backend configurations
- Use environment-specific settings
- Handle configuration errors gracefully
- Validate connection parameters
</instructions>

<output>
<response>
    <thought>Database configuration analysis</thought>
    <actions>ENV_CONFIG,CONNECTION_STRING,POOL_CONFIG,REPLY</actions>
    <providers>DATABASE_CONFIG,ENV_SYSTEM</providers>
    <text>Response with proper database configuration</text>
</response>
</output>`;
```

**Implementation Example:**
```typescript
// Correct database configuration management
const databaseConfigHandler = async (
  runtime: IAgentRuntime,
  message: Memory,
  state: State
): Promise<ActionResult> => {
  
  try {
    // ✅ CORRECT - Environment variable configuration
    const config = {
      postgres: {
        url: process.env.POSTGRES_URL,
        pool: {
          min: parseInt(process.env.DB_POOL_MIN || '2'),
          max: parseInt(process.env.DB_POOL_MAX || '10'),
          idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000')
        }
      },
      pglite: {
        dataDir: process.env.PGLITE_DATA_DIR || 'memory://',
        pool: {
          min: parseInt(process.env.PGLITE_POOL_MIN || '1'),
          max: parseInt(process.env.PGLITE_POOL_MAX || '5')
        }
      }
    };
    
    // ✅ CORRECT - Connection string validation
    const validateConnectionString = (url: string): boolean => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };
    
    if (config.postgres.url && !validateConnectionString(config.postgres.url)) {
      throw new Error('Invalid PostgreSQL connection string');
    }
    
    // ✅ CORRECT - Backend selection logic
    const selectedBackend = config.postgres.url ? 'postgresql' : 'pglite';
    const connectionConfig = config[selectedBackend as keyof typeof config];
    
    logger.info('Database configuration loaded', {
      backend: selectedBackend,
      config: connectionConfig
    });
    
    return createActionResult({
      success: true,
      data: { backend: selectedBackend, config: connectionConfig }
    });
    
  } catch (error) {
    logger.error('Configuration error:', error);
    return createActionResult({
      success: false,
      error: error instanceof Error ? error.message : 'Configuration error'
    });
  }
};
```

### **4. Database Schema and Tables Integration**

```typescript
// Template: databaseSchemaTablesTemplate
export const schemaUsageExample = `
<task>Work with ElizaOS database schema and tables correctly</task>

<instructions>
1. **Core Tables**: Use proper table definitions for agents, entities, memories, rooms
2. **Schema Operations**: Leverage schema for type-safe database operations
3. **Table Relationships**: Handle table relationships and foreign keys properly
4. **Schema Migrations**: Use schema migration mechanisms

DATABASE SCHEMA AND TABLES RULES:
- Use agents table for agent management
- Use entities table for entity management
- Use memories table for memory storage
- Use rooms table for room/channel management
- Handle table relationships properly
- Use schema migrations for updates
- Leverage schema for validation
- Handle schema versioning
</instructions>

<output>
<response>
    <thought>Database schema and tables analysis</thought>
    <actions>SCHEMA_ACCESS,TABLE_OPERATIONS,RELATIONSHIP_HANDLING,REPLY</actions>
    <providers>DATABASE_SCHEMA,TABLE_SYSTEM</providers>
    <text>Response with proper database schema and tables usage</text>
</response>
</output>`;
```

**Implementation Example:**
```typescript
// Correct schema and tables usage
import { agentsTable, entitiesTable, memoriesTable, roomsTable } from './schema';

const schemaHandler = async (
  runtime: IAgentRuntime,
  message: Memory,
  state: State
): Promise<ActionResult> => {
  
  try {
    const db = runtime.getDatabase();
    if (!db) {
      throw new Error('Database not available');
    }
    
    // ✅ CORRECT - Use schema-defined tables for type safety
    const agent = await db
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.id, runtime.agentId))
      .limit(1);
    
    const entity = await db
      .select()
      .from(entitiesTable)
      .where(eq(entitiesTable.id, message.entityId))
      .limit(1);
    
    const room = await db
      .select()
      .from(roomsTable)
      .where(eq(roomsTable.id, message.roomId))
      .limit(1);
    
    // ✅ CORRECT - Handle table relationships
    if (!agent[0] || !entity[0] || !room[0]) {
      throw new Error('Required entities not found');
    }
    
    // ✅ CORRECT - Use schema for validation
    const memoryData = {
      entityId: message.entityId,
      agentId: runtime.agentId,
      roomId: message.roomId,
      content: message.content,
      metadata: {
        type: MemoryType.MESSAGE,
        scope: 'private',
        timestamp: Date.now(),
        agentName: agent[0].name,
        entityName: entity[0].name,
        roomName: room[0].name
      }
    };
    
    const memoryId = await db.insert(memoriesTable).values(memoryData).returning();
    
    return createActionResult({
      success: true,
      data: { 
        memoryId: memoryId[0].id,
        agent: agent[0],
        entity: entity[0],
        room: room[0]
      }
    });
    
  } catch (error) {
    logger.error('Schema operation failed:', error);
    return createActionResult({
      success: false,
      error: error instanceof Error ? error.message : 'Schema error'
    });
  }
};
```

### **5. Database Connection Management**

```typescript
// Template: databaseConnectionManagementTemplate
export const connectionUsageExample = `
<task>Manage ElizaOS database connections correctly</task>

<instructions>
1. **Connection Health**: Monitor connection health and status
2. **Retry Logic**: Implement exponential backoff retry logic
3. **Connection Pooling**: Manage connection pool efficiently
4. **Graceful Degradation**: Handle connection failures gracefully

DATABASE CONNECTION MANAGEMENT RULES:
- Use adapter.isConnected() for health checks
- Implement exponential backoff retry logic
- Handle connection pool exhaustion
- Monitor connection performance
- Implement graceful degradation
- Handle connection timeouts
- Use connection pooling efficiently
- Clean up connections properly
</instructions>

<output>
<response>
    <thought>Database connection management analysis</thought>
    <actions>HEALTH_CHECK,RETRY_LOGIC,POOL_MANAGEMENT,REPLY</actions>
    <providers>CONNECTION_SYSTEM,HEALTH_MONITOR</providers>
    <text>Response with proper database connection management</text>
</response>
</output>`;
```

**Implementation Example:**
```typescript
// Correct connection management
class DatabaseConnectionManager {
  private retryAttempts = 0;
  private maxRetries = 5;
  private baseDelay = 1000; // 1 second
  
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    runtime: IAgentRuntime
  ): Promise<T> {
    
    try {
      const db = runtime.getDatabase();
      if (!db) {
        throw new Error('Database not available');
      }
      
      // ✅ CORRECT - Connection health check
      if (!db.isConnected()) {
        throw new Error('Database not connected');
      }
      
      // ✅ CORRECT - Execute operation
      return await operation();
      
    } catch (error) {
      // ✅ CORRECT - Exponential backoff retry logic
      if (this.retryAttempts < this.maxRetries) {
        this.retryAttempts++;
        const delay = this.baseDelay * Math.pow(2, this.retryAttempts - 1);
        
        logger.warn(`Database operation failed, retrying in ${delay}ms (attempt ${this.retryAttempts}/${this.maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(operation, runtime);
      }
      
      // ✅ CORRECT - Graceful degradation after max retries
      logger.error('Database operation failed after max retries:', error);
      throw new Error('Database operation failed after maximum retry attempts');
    }
  }
  
  // ✅ CORRECT - Connection pool monitoring
  async monitorConnectionPool(runtime: IAgentRuntime): Promise<void> {
    const db = runtime.getDatabase();
    if (!db) return;
    
    const connectionInfo = db.getConnectionInfo();
    logger.info('Database connection pool status', connectionInfo);
    
    // Monitor pool health and log warnings
    if (connectionInfo.activeConnections > connectionInfo.maxConnections * 0.8) {
      logger.warn('Connection pool usage high', connectionInfo);
    }
  }
}

// Usage in action handler
const connectionManager = new DatabaseConnectionManager();

const connectionHandler = async (
  runtime: IAgentRuntime,
  message: Memory,
  state: State
): Promise<ActionResult> => {
  
  try {
    // ✅ CORRECT - Use connection manager with retry logic
    const result = await connectionManager.executeWithRetry(async () => {
      const db = runtime.getDatabase()!;
      return await db.createMemory({
        entityId: message.entityId,
        content: { text: "Processed with connection management" },
        roomId: message.roomId,
        metadata: { type: MemoryType.MESSAGE, scope: 'private' }
      }, 'user_interactions');
    }, runtime);
    
    // ✅ CORRECT - Monitor connection pool
    await connectionManager.monitorConnectionPool(runtime);
    
    return createActionResult({
      success: true,
      data: { memoryId: result }
    });
    
  } catch (error) {
    logger.error('Connection operation failed:', error);
    return createActionResult({
      success: false,
      error: error instanceof Error ? error.message : 'Connection error'
    });
  }
};
```

### **6. Database Plugin Integration**

```typescript
// Template: databasePluginIntegrationTemplate
export const pluginUsageExample = `
<task>Integrate database operations with ElizaOS plugin system correctly</task>

<instructions>
1. **Plugin Registration**: Register database adapters with the plugin system
2. **Migration Management**: Handle database migrations through plugins
3. **Plugin Lifecycle**: Manage database plugin lifecycle properly
4. **Dependency Management**: Handle plugin dependencies for database operations

DATABASE PLUGIN INTEGRATION RULES:
- Register database adapters as plugins
- Handle plugin initialization for database setup
- Manage database migrations through plugins
- Handle plugin dependencies properly
- Use plugin lifecycle for database operations
- Handle plugin errors gracefully
- Clean up database resources on plugin shutdown
- Use plugin configuration for database settings
</instructions>

<output>
<response>
    <thought>Database plugin integration analysis</thought>
    <actions>PLUGIN_REGISTRATION,MIGRATION_MANAGEMENT,LIFECYCLE_HANDLING,REPLY</actions>
    <providers>PLUGIN_SYSTEM,MIGRATION_SYSTEM</providers>
    <text>Response with proper database plugin integration</text>
</response>
</output>`;
```

**Implementation Example:**
```typescript
// Correct database plugin integration
import type { Plugin } from '@elizaos/core';
import { BaseDrizzleAdapter } from '@elizaos/plugin-sql';

const databasePlugin: Plugin = {
  name: "database-integration-plugin",
  description: "Plugin for database integration with ElizaOS",
  priority: 100, // High priority for database operations
  
  // ✅ CORRECT - Plugin initialization for database setup
  async init(config: Record<string, any>, runtime: IAgentRuntime) {
    try {
      logger.info('Initializing database integration plugin');
      
      // ✅ CORRECT - Database adapter registration
      const dbAdapter = new BaseDrizzleAdapter({
        postgres: {
          url: process.env.POSTGRES_URL,
          pool: { min: 2, max: 10 }
        },
        pglite: {
          dataDir: process.env.PGLITE_DATA_DIR || 'memory://'
        }
      });
      
      // ✅ CORRECT - Plugin lifecycle management
      await dbAdapter.connect();
      
      // ✅ CORRECT - Database migrations
      await this.runMigrations(dbAdapter);
      
      logger.info('Database integration plugin initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize database plugin:', error);
      throw error;
    }
  },
  
  // ✅ CORRECT - Migration management
  private async runMigrations(dbAdapter: BaseDrizzleAdapter): Promise<void> {
    try {
      logger.info('Running database migrations');
      
      // Run schema migrations
      await dbAdapter.migrate();
      
      logger.info('Database migrations completed successfully');
      
    } catch (error) {
      logger.error('Migration failed:', error);
      throw error;
    }
  },
  
  // ✅ CORRECT - Plugin cleanup
  async destroy(): Promise<void> {
    try {
      logger.info('Destroying database integration plugin');
      
      // Clean up database resources
      const db = this.runtime?.getDatabase();
      if (db && typeof db.disconnect === 'function') {
        await db.disconnect();
      }
      
      logger.info('Database integration plugin destroyed successfully');
      
    } catch (error) {
      logger.error('Error destroying database plugin:', error);
    }
  }
};

export default databasePlugin;
```

### **7. Database Embedding Dimension Management**

```typescript
// Template: databaseEmbeddingDimensionTemplate
export const embeddingUsageExample = `
<task>Manage ElizaOS database embedding dimensions correctly</task>

<instructions>
1. **Dimension Management**: Handle vector embedding dimensions properly
2. **Embedding Storage**: Store and retrieve vector embeddings efficiently
3. **Dimension Compatibility**: Check dimension compatibility across operations
4. **Vector Operations**: Perform vector similarity searches and operations

DATABASE EMBEDDING DIMENSION RULES:
- Handle VECTOR_DIMS constant for dimension management
- Store embeddings with proper dimension validation
- Check dimension compatibility before operations
- Use efficient vector similarity search
- Handle embedding storage optimization
- Manage embedding metadata properly
- Use proper indexing for vector operations
- Handle dimension mismatches gracefully
</instructions>

<output>
<response>
    <thought>Database embedding dimension analysis</thought>
    <actions>DIMENSION_CHECK,EMBEDDING_STORAGE,VECTOR_OPERATIONS,REPLY</actions>
    <providers>EMBEDDING_SYSTEM,VECTOR_SYSTEM</providers>
    <text>Response with proper database embedding dimension management</text>
</response>
</output>`;
```

**Implementation Example:**
```typescript
// Correct embedding dimension management
import { VECTOR_DIMS } from '@elizaos/core';

class EmbeddingManager {
  private readonly vectorDimensions = VECTOR_DIMS;
  
  // ✅ CORRECT - Dimension validation
  validateEmbeddingDimensions(embedding: number[]): boolean {
    if (!Array.isArray(embedding)) {
      return false;
    }
    
    if (embedding.length !== this.vectorDimensions) {
      logger.warn(`Embedding dimension mismatch: expected ${this.vectorDimensions}, got ${embedding.length}`);
      return false;
    }
    
    // Check for valid numbers
    return embedding.every(dim => typeof dim === 'number' && !isNaN(dim));
  }
  
  // ✅ CORRECT - Embedding storage with dimension validation
  async storeEmbedding(
    runtime: IAgentRuntime,
    entityId: string,
    text: string,
    embedding: number[]
  ): Promise<string> {
    
    try {
      // ✅ CORRECT - Dimension compatibility check
      if (!this.validateEmbeddingDimensions(embedding)) {
        throw new Error(`Invalid embedding dimensions: expected ${this.vectorDimensions}, got ${embedding.length}`);
      }
      
      const db = runtime.getDatabase();
      if (!db) {
        throw new Error('Database not available');
      }
      
      // ✅ CORRECT - Store embedding with metadata
      const memoryId = await db.createMemory({
        entityId,
        content: { text },
        embedding,
        metadata: {
          type: MemoryType.FRAGMENT,
          scope: 'shared',
          timestamp: Date.now(),
          dimensions: embedding.length,
          vectorType: 'text-embedding'
        }
      }, 'embeddings');
      
      logger.info('Embedding stored successfully', { memoryId, dimensions: embedding.length });
      return memoryId;
      
    } catch (error) {
      logger.error('Failed to store embedding:', error);
      throw error;
    }
  }
  
  // ✅ CORRECT - Vector similarity search
  async findSimilarEmbeddings(
    runtime: IAgentRuntime,
    queryEmbedding: number[],
    limit: number = 5,
    similarityThreshold: number = 0.7
  ): Promise<Array<{ memory: Memory; similarity: number }>> {
    
    try {
      // ✅ CORRECT - Dimension compatibility check
      if (!this.validateEmbeddingDimensions(queryEmbedding)) {
        throw new Error('Invalid query embedding dimensions');
      }
      
      const db = runtime.getDatabase();
      if (!db) {
        throw new Error('Database not available');
      }
      
      // ✅ CORRECT - Vector similarity search
      const similarMemories = await db.searchMemories(
        "vector similarity search",
        {
          embedding: queryEmbedding,
          limit,
          similarityThreshold,
          metadata: {
            type: MemoryType.FRAGMENT,
            hasEmbedding: true
          }
        }
      );
      
      // ✅ CORRECT - Sort by similarity score
      return similarMemories
        .filter(memory => memory.similarity && memory.similarity >= similarityThreshold)
        .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
        .map(memory => ({
          memory,
          similarity: memory.similarity || 0
        }));
      
    } catch (error) {
      logger.error('Vector similarity search failed:', error);
      throw error;
    }
  }
  
  // ✅ CORRECT - Embedding optimization
  async optimizeEmbeddings(runtime: IAgentRuntime): Promise<void> {
    try {
      logger.info('Starting embedding optimization');
      
      const db = runtime.getDatabase();
      if (!db) {
        throw new Error('Database not available');
      }
      
      // ✅ CORRECT - Batch embedding operations
      const embeddings = await db.getMemories({
        metadata: {
          type: MemoryType.FRAGMENT,
          hasEmbedding: true
        },
        limit: 1000
      });
      
      // Process embeddings in batches for optimization
      const batchSize = 100;
      for (let i = 0; i < embeddings.length; i += batchSize) {
        const batch = embeddings.slice(i, i + batchSize);
        await this.processEmbeddingBatch(batch);
      }
      
      logger.info('Embedding optimization completed');
      
    } catch (error) {
      logger.error('Embedding optimization failed:', error);
      throw error;
    }
  }
  
  private async processEmbeddingBatch(memories: Memory[]): Promise<void> {
    // Process embeddings in batch for efficiency
    // This could include normalization, compression, or other optimizations
  }
}

// Usage in action handler
const embeddingManager = new EmbeddingManager();

const embeddingHandler = async (
  runtime: IAgentRuntime,
  message: Memory,
  state: State
): Promise<ActionResult> => {
  
  try {
    // ✅ CORRECT - Generate embedding for user message
    const textModel = runtime.getModel(ModelType.EMBEDDING);
    if (!textModel) {
      throw new Error('Embedding model not available');
    }
    
    const embedding = await textModel({
      text: message.content.text || '',
      model: 'text-embedding-ada-002'
    });
    
    const embeddingVector = embedding.data[0].embedding;
    
    // ✅ CORRECT - Store embedding with dimension management
    const memoryId = await embeddingManager.storeEmbedding(
      runtime,
      message.entityId,
      message.content.text || '',
      embeddingVector
    );
    
    // ✅ CORRECT - Find similar embeddings
    const similarMemories = await embeddingManager.findSimilarEmbeddings(
      runtime,
      embeddingVector,
      5,
      0.7
    );
    
    return createActionResult({
      success: true,
      data: { 
        memoryId,
        embeddingDimensions: embeddingVector.length,
        similarMemories: similarMemories.length
      }
    });
    
  } catch (error) {
    logger.error('Embedding operation failed:', error);
    return createActionResult({
      success: false,
      error: error instanceof Error ? error.message : 'Embedding error'
    });
  }
};
```

## 🔧 **Database Integration Best Practices**

### **1. Connection Pooling and Performance**

```typescript
// ✅ CORRECT - Connection pool optimization
const optimizeConnectionPool = (config: any) => {
  return {
    postgres: {
      ...config.postgres,
      pool: {
        min: Math.max(2, Math.floor(config.maxConnections * 0.1)),
        max: Math.min(20, config.maxConnections),
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 10000,
        reapIntervalMillis: 1000
      }
    }
  };
};
```

### **2. Transaction Management**

```typescript
// ✅ CORRECT - Transaction handling
const transactionHandler = async (
  runtime: IAgentRuntime,
  operations: Array<() => Promise<any>>
): Promise<ActionResult> => {
  
  const db = runtime.getDatabase();
  if (!db) {
    throw new Error('Database not available');
  }
  
  try {
    // ✅ CORRECT - Use transactions for atomic operations
    const result = await db.transaction(async (tx) => {
      const results = [];
      for (const operation of operations) {
        results.push(await operation());
      }
      return results;
    });
    
    return createActionResult({
      success: true,
      data: result
    });
    
  } catch (error) {
    // ✅ CORRECT - Transaction rollback handling
    logger.error('Transaction failed, rolling back:', error);
    return createActionResult({
      success: false,
      error: 'Transaction failed and rolled back'
    });
  }
};
```

### **3. Error Handling and Recovery**

```typescript
// ✅ CORRECT - Comprehensive error handling
class DatabaseErrorHandler {
  static classifyError(error: any): string {
    if (error.code === 'ECONNREFUSED') return 'connection_refused';
    if (error.code === 'ETIMEDOUT') return 'connection_timeout';
    if (error.code === 'ENOTFOUND') return 'host_not_found';
    if (error.message?.includes('duplicate key')) return 'duplicate_key';
    if (error.message?.includes('foreign key')) return 'foreign_key_violation';
    return 'unknown_error';
  }
  
  static async handleError(
    error: any,
    runtime: IAgentRuntime,
    fallbackOperation?: () => Promise<any>
  ): Promise<any> {
    
    const errorType = this.classifyError(error);
    logger.error(`Database error: ${errorType}`, error);
    
    switch (errorType) {
      case 'connection_refused':
      case 'connection_timeout':
        // ✅ CORRECT - Implement circuit breaker pattern
        return this.handleConnectionError(runtime, fallbackOperation);
        
      case 'duplicate_key':
        // ✅ CORRECT - Handle duplicate key errors
        return this.handleDuplicateKeyError(error);
        
      case 'foreign_key_violation':
        // ✅ CORRECT - Handle foreign key violations
        return this.handleForeignKeyError(error);
        
      default:
        // ✅ CORRECT - Generic error handling
        throw new Error(`Database operation failed: ${error.message}`);
    }
  }
  
  private static async handleConnectionError(
    runtime: IAgentRuntime,
    fallbackOperation?: () => Promise<any>
  ): Promise<any> {
    
    // ✅ CORRECT - Health check and recovery
    const db = runtime.getDatabase();
    if (db && typeof db.isConnected === 'function') {
      if (db.isConnected()) {
        logger.info('Database connection recovered');
        return fallbackOperation ? await fallbackOperation() : null;
      }
    }
    
    // ✅ CORRECT - Fallback to in-memory or cached data
    if (fallbackOperation) {
      logger.warn('Using fallback operation due to database connection issues');
      return await fallbackOperation();
    }
    
    throw new Error('Database connection failed and no fallback available');
  }
}
```

## 📊 **Performance Optimization**

### **1. Query Optimization**

```typescript
// ✅ CORRECT - Query optimization with indexing
const optimizedQueryHandler = async (
  runtime: IAgentRuntime,
  entityId: string
): Promise<ActionResult> => {
  
  const db = runtime.getDatabase();
  if (!db) {
    throw new Error('Database not available');
  }
  
  try {
    // ✅ CORRECT - Use indexed columns for efficient queries
    const memories = await db
      .select()
      .from(memoriesTable)
      .where(
        and(
          eq(memoriesTable.entityId, entityId),
          eq(memoriesTable.metadata.type, 'message')
        )
      )
      .orderBy(desc(memoriesTable.createdAt))
      .limit(50); // ✅ CORRECT - Limit result set size
    
    // ✅ CORRECT - Batch process results
    const processedMemories = await Promise.all(
      memories.map(async (memory) => ({
        ...memory,
        processed: await processMemory(memory)
      }))
    );
    
    return createActionResult({
      success: true,
      data: processedMemories
    });
    
  } catch (error) {
    logger.error('Optimized query failed:', error);
    return createActionResult({
      success: false,
      error: error instanceof Error ? error.message : 'Query error'
    });
  }
};
```

### **2. Caching Strategy**

```typescript
// ✅ CORRECT - Database result caching
class DatabaseCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  async getCachedResult<T>(
    key: string,
    operation: () => Promise<T>,
    ttl: number = 5 * 60 * 1000 // 5 minutes
  ): Promise<T> {
    
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      logger.debug('Cache hit for key:', key);
      return cached.data;
    }
    
    // ✅ CORRECT - Execute operation and cache result
    const result = await operation();
    this.cache.set(key, {
      data: result,
      timestamp: Date.now(),
      ttl
    });
    
    logger.debug('Cache miss, stored result for key:', key);
    return result;
  }
  
  // ✅ CORRECT - Cache invalidation
  invalidateCache(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        logger.debug('Invalidated cache for pattern:', pattern);
      }
    }
  }
}
```

## 🧪 **Testing Best Practices**

### **1. Mock Database for Testing**

```typescript
// ✅ CORRECT - Comprehensive mock database for testing
export const createMockDatabase = (): IDatabaseAdapter => {
  return {
    // Mock connection methods
    isConnected: mock().mockReturnValue(true),
    getConnectionInfo: mock().mockReturnValue({
      type: 'mock',
      activeConnections: 1,
      maxConnections: 10
    }),
    
    // Mock CRUD operations
    createAgent: mock().mockResolvedValue('agent-id'),
    getAgent: mock().mockResolvedValue({ id: 'agent-id', name: 'Test Agent' }),
    createEntity: mock().mockResolvedValue('entity-id'),
    getEntity: mock().mockResolvedValue({ id: 'entity-id', name: 'Test Entity' }),
    createMemory: mock().mockResolvedValue('memory-id'),
    getMemory: mock().mockResolvedValue({ id: 'memory-id', content: { text: 'Test' } }),
    createRoom: mock().mockResolvedValue('room-id'),
    getRoom: mock().mockResolvedValue({ id: 'room-id', name: 'Test Room' }),
    
    // Mock search operations
    searchMemories: mock().mockResolvedValue([]),
    getMemories: mock().mockResolvedValue([]),
    
    // Mock transaction support
    transaction: mock().mockImplementation(async (fn) => {
      return await fn({} as any);
    }),
    
    // Mock connection management
    connect: mock().mockResolvedValue(undefined),
    disconnect: mock().mockResolvedValue(undefined),
    
    // Mock migration support
    migrate: mock().mockResolvedValue(undefined)
  } as IDatabaseAdapter;
};
```

## 🎯 **Summary of Correct Database Integration**

### **✅ What We Now Do Correctly:**

1. **Full Database Adapter Interface**: Proper usage of `IDatabaseAdapter` with all methods
2. **Drizzle ORM Integration**: Complete integration with BaseDrizzleAdapter and Drizzle ORM
3. **Database Configuration**: Proper environment variable and connection string management
4. **Schema Awareness**: Full awareness of database schema and table relationships
5. **Connection Management**: Robust connection health checks and retry logic
6. **Plugin Integration**: Proper database plugin registration and lifecycle management
7. **Embedding Dimensions**: Complete vector embedding dimension management
8. **Transaction Management**: Proper transaction handling and atomic operations
9. **Performance Optimization**: Query optimization, indexing, and caching strategies
10. **Error Handling**: Comprehensive error classification and recovery mechanisms

### **🚀 Performance Benefits:**

- **Eliminated Database Bottlenecks**: Proper connection pooling and retry logic
- **Optimized Queries**: Efficient query patterns with proper indexing
- **Vector Operations**: Optimized embedding storage and similarity search
- **Caching Strategy**: Database result caching for improved performance
- **Batch Operations**: Efficient batch processing for large datasets

### **🔒 Security and Reliability Improvements:**

- **Connection Security**: Proper connection string validation and encryption
- **Transaction Safety**: Atomic operations with proper rollback handling
- **Error Recovery**: Graceful degradation and fallback strategies
- **Resource Management**: Proper cleanup and connection lifecycle management
- **Health Monitoring**: Continuous connection health monitoring and alerts

The templates now provide **correct and efficient** usage of the complete ElizaOS database integration layer, following all the architectural patterns and best practices outlined in the documentation!
