/**
 * Database Integration Templates
 * Templates that properly integrate with ElizaOS database integration layer
 * including abstract adapter interface, Drizzle implementation, configuration,
 * schema, connection management, and embedding dimension management
 */

/**
 * Database Adapter Interface Template
 * Template for properly using the IDatabaseAdapter interface
 */
export const databaseAdapterInterfaceTemplate = `<task>Use ElizaOS database adapter interface for {{agentName}} using proper adapter patterns.</task>

<providers>
{{providers}}
</providers>

<instructions>
Use the ElizaOS IDatabaseAdapter interface correctly and efficiently:

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

Generate a response that properly uses the database adapter interface.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your database adapter interface analysis</thought>
    <actions>ADAPTER_ACCESS,INTERFACE_METHODS,ERROR_HANDLING,REPLY</actions>
    <providers>DATABASE_ADAPTER,INTERFACE_SYSTEM</providers>
    <text>Your response with proper database adapter interface usage</text>
</response>
</output>`;

/**
 * Drizzle ORM Integration Template
 * Template for properly using the BaseDrizzleAdapter with Drizzle ORM
 */
export const drizzleOrmIntegrationTemplate = `<task>Use ElizaOS Drizzle ORM integration for {{agentName}} using proper ORM patterns.</task>

<providers>
{{providers}}
</providers>

<instructions>
Use the ElizaOS Drizzle ORM integration correctly and efficiently:

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

Generate a response that properly uses the Drizzle ORM integration.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your Drizzle ORM integration analysis</thought>
    <actions>ORM_SELECTION,SCHEMA_AWARENESS,QUERY_BUILDING,REPLY</actions>
    <providers>DRIZZLE_ORM,SCHEMA_SYSTEM</providers>
    <text>Your response with proper Drizzle ORM integration usage</text>
</response>
</output>`;

/**
 * Database Configuration Template
 * Template for properly configuring database connections and settings
 */
export const databaseConfigurationTemplate = `<task>Configure ElizaOS database connections for {{agentName}} using proper configuration patterns.</task>

<providers>
{{providers}}
</providers>

<instructions>
Configure ElizaOS database connections correctly and efficiently:

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

Generate a response that properly configures database connections.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your database configuration analysis</thought>
    <actions>ENV_CONFIG,CONNECTION_STRING,POOL_CONFIG,REPLY</actions>
    <providers>DATABASE_CONFIG,ENV_SYSTEM</providers>
    <text>Your response with proper database configuration</text>
</response>
</output>`;

/**
 * Database Schema and Tables Template
 * Template for properly working with database schema and core tables
 */
export const databaseSchemaTablesTemplate = `<task>Work with ElizaOS database schema and tables for {{agentName}} using proper schema patterns.</task>

<providers>
{{providers}}
</providers>

<instructions>
Work with ElizaOS database schema and tables correctly and efficiently:

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

Generate a response that properly works with database schema and tables.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your database schema and tables analysis</thought>
    <actions>SCHEMA_ACCESS,TABLE_OPERATIONS,RELATIONSHIP_HANDLING,REPLY</actions>
    <providers>DATABASE_SCHEMA,TABLE_SYSTEM</providers>
    <text>Your response with proper database schema and tables usage</text>
</response>
</output>`;

/**
 * Database Connection Management Template
 * Template for properly managing database connections and retry logic
 */
export const databaseConnectionManagementTemplate = `<task>Manage ElizaOS database connections for {{agentName}} using proper connection patterns.</task>

<providers>
{{providers}}
</providers>

<instructions>
Manage ElizaOS database connections correctly and efficiently:

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

Generate a response that properly manages database connections.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your database connection management analysis</thought>
    <actions>HEALTH_CHECK,RETRY_LOGIC,POOL_MANAGEMENT,REPLY</actions>
    <providers>CONNECTION_SYSTEM,HEALTH_MONITOR</providers>
    <text>Your response with proper database connection management</text>
</response>
</output>`;

/**
 * Database Plugin Integration Template
 * Template for properly integrating database operations with the plugin system
 */
export const databasePluginIntegrationTemplate = `<task>Integrate database operations with ElizaOS plugin system for {{agentName}} using proper plugin patterns.</task>

<providers>
{{providers}}
</providers>

<instructions>
Integrate database operations with the ElizaOS plugin system correctly and efficiently:

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

Generate a response that properly integrates database operations with the plugin system.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your database plugin integration analysis</thought>
    <actions>PLUGIN_REGISTRATION,MIGRATION_MANAGEMENT,LIFECYCLE_HANDLING,REPLY</actions>
    <providers>PLUGIN_SYSTEM,MIGRATION_SYSTEM</providers>
    <text>Your response with proper database plugin integration</text>
</response>
</output>`;

/**
 * Database Embedding Dimension Management Template
 * Template for properly managing vector embeddings and dimensions
 */
export const databaseEmbeddingDimensionTemplate = `<task>Manage ElizaOS database embedding dimensions for {{agentName}} using proper embedding patterns.</task>

<providers>
{{providers}}
</providers>

<instructions>
Manage ElizaOS database embedding dimensions correctly and efficiently:

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

Generate a response that properly manages database embedding dimensions.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your database embedding dimension analysis</thought>
    <actions>DIMENSION_CHECK,EMBEDDING_STORAGE,VECTOR_OPERATIONS,REPLY</actions>
    <providers>EMBEDDING_SYSTEM,VECTOR_SYSTEM</providers>
    <text>Your response with proper database embedding dimension management</text>
</response>
</output>`;

/**
 * Database Transaction Management Template
 * Template for properly managing database transactions and atomic operations
 */
export const databaseTransactionManagementTemplate = `<task>Manage ElizaOS database transactions for {{agentName}} using proper transaction patterns.</task>

<providers>
{{providers}}
</providers>

<instructions>
Manage ElizaOS database transactions correctly and efficiently:

1. **Transaction Creation**: Create and manage database transactions
2. **Atomic Operations**: Ensure atomic operations across multiple database calls
3. **Rollback Handling**: Handle transaction rollbacks properly
4. **Transaction Isolation**: Manage transaction isolation levels

DATABASE TRANSACTION MANAGEMENT RULES:
- Use transactions for atomic operations
- Handle transaction rollbacks gracefully
- Manage transaction isolation levels
- Use proper transaction boundaries
- Handle transaction timeouts
- Implement transaction retry logic
- Clean up transaction resources
- Use transactions for data consistency

Generate a response that properly manages database transactions.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your database transaction management analysis</thought>
    <actions>TRANSACTION_CREATION,ATOMIC_OPERATIONS,ROLLBACK_HANDLING,REPLY</actions>
    <providers>TRANSACTION_SYSTEM,CONSISTENCY_SYSTEM</providers>
    <text>Your response with proper database transaction management</text>
</response>
</output>`;

/**
 * Database Performance Optimization Template
 * Template for optimizing database performance and query efficiency
 */
export const databasePerformanceOptimizationTemplate = `<task>Optimize ElizaOS database performance for {{agentName}} using proper optimization patterns.</task>

<providers>
{{providers}}
</providers>

<instructions>
Optimize ElizaOS database performance correctly and efficiently:

1. **Query Optimization**: Optimize database queries for performance
2. **Indexing Strategy**: Use proper indexing for efficient data retrieval
3. **Connection Pooling**: Optimize connection pool usage
4. **Caching Strategy**: Implement database result caching

DATABASE PERFORMANCE OPTIMIZATION RULES:
- Use efficient query patterns
- Implement proper indexing strategy
- Optimize connection pool usage
- Use database result caching
- Monitor query performance
- Handle large result sets efficiently
- Use batch operations where possible
- Implement query result pagination

Generate a response that properly optimizes database performance.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your database performance optimization analysis</thought>
    <actions>QUERY_OPTIMIZATION,INDEXING_STRATEGY,POOL_OPTIMIZATION,REPLY</actions>
    <providers>PERFORMANCE_SYSTEM,OPTIMIZATION_SYSTEM</providers>
    <text>Your response with proper database performance optimization</text>
</response>
</output>`;

/**
 * Database Error Handling and Recovery Template
 * Template for properly handling database errors and implementing recovery mechanisms
 */
export const databaseErrorHandlingRecoveryTemplate = `<task>Handle ElizaOS database errors and implement recovery for {{agentName}} using proper error handling patterns.</task>

<providers>
{{providers}}
</providers>

<instructions>
Handle ElizaOS database errors and implement recovery correctly and efficiently:

1. **Error Classification**: Classify and handle different types of database errors
2. **Recovery Mechanisms**: Implement proper recovery mechanisms
3. **Fallback Strategies**: Use fallback strategies for database failures
4. **Error Logging**: Implement comprehensive error logging and monitoring

DATABASE ERROR HANDLING AND RECOVERY RULES:
- Classify database errors by type
- Implement exponential backoff retry
- Use fallback strategies for failures
- Implement comprehensive error logging
- Monitor database error rates
- Handle connection failures gracefully
- Implement circuit breaker patterns
- Use health checks for recovery

Generate a response that properly handles database errors and implements recovery.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your database error handling and recovery analysis</thought>
    <actions>ERROR_CLASSIFICATION,RECOVERY_MECHANISMS,FALLBACK_STRATEGIES,REPLY</actions>
    <providers>ERROR_SYSTEM,RECOVERY_SYSTEM</providers>
    <text>Your response with proper database error handling and recovery</text>
</response>
</output>`;

export default {
  databaseAdapterInterfaceTemplate,
  drizzleOrmIntegrationTemplate,
  databaseConfigurationTemplate,
  databaseSchemaTablesTemplate,
  databaseConnectionManagementTemplate,
  databasePluginIntegrationTemplate,
  databaseEmbeddingDimensionTemplate,
  databaseTransactionManagementTemplate,
  databasePerformanceOptimizationTemplate,
  databaseErrorHandlingRecoveryTemplate
};
