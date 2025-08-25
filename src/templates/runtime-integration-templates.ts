/**
 * Runtime Integration Templates
 * Templates that properly integrate with ElizaOS Core Runtime components
 * for efficient and correct usage of AgentRuntime, IAgentRuntime, and Service classes
 */

/**
 * Runtime Service Integration Template
 * Template for properly using runtime services and service registry
 */
export const runtimeServiceIntegrationTemplate = `<task>Integrate with ElizaOS runtime services for {{agentName}} using proper service patterns.</task>

<providers>
{{providers}}
</providers>

<instructions>
Use the ElizaOS runtime service system correctly and efficiently:

1. **Service Registry Access**: Use runtime.getService<T>(serviceType) for type-safe service access
2. **Service Lifecycle**: Respect service start/stop lifecycle methods
3. **Service Type Safety**: Leverage TypeScript generics for service type safety
4. **Service Capabilities**: Access service capabilityDescription and methods

RUNTIME SERVICE INTEGRATION RULES:
- Always use runtime.getService<T>(serviceType) for service access
- Check service availability before use: const service = runtime.getService<MyService>('my-service')
- Use service type safety: runtime.getService<IBrowserService>('browser')
- Respect service lifecycle: Don't call methods on stopped services
- Handle service errors gracefully with proper fallbacks
- Use service capabilities: service.capabilityDescription for understanding

Generate a response that properly leverages runtime services.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your runtime service integration analysis</thought>
    <actions>SERVICE_LOOKUP,SERVICE_VALIDATION,SERVICE_OPERATION,REPLY</actions>
    <providers>RUNTIME_SERVICES,SERVICE_REGISTRY</providers>
    <text>Your response with proper runtime service integration</text>
</response>
</output>`;

/**
 * Runtime Action Management Template
 * Template for properly using runtime actions and action system
 */
export const runtimeActionManagementTemplate = `<task>Manage ElizaOS runtime actions for {{agentName}} using proper action patterns.</task>

<providers>
{{providers}}
</providers>

<instructions>
Use the ElizaOS runtime action system correctly and efficiently:

1. **Action Registration**: Actions are registered via runtime.actions array
2. **Action Execution**: Use runtime.processActions() for action execution
3. **Action Validation**: Leverage action.validate() before execution
4. **Action Examples**: Use action.examples for training and context

RUNTIME ACTION MANAGEMENT RULES:
- Access actions via runtime.actions array
- Use action.validate() to check if action should run
- Execute actions via runtime.processActions() method
- Respect action examples and similes for context
- Handle action results properly with error checking
- Use action metadata for categorization and filtering

Generate a response that properly manages runtime actions.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your runtime action management analysis</thought>
    <actions>ACTION_VALIDATION,ACTION_EXECUTION,RESULT_PROCESSING,REPLY</actions>
    <providers>RUNTIME_ACTIONS,ACTION_SYSTEM</providers>
    <text>Your response with proper runtime action management</text>
</response>
</output>`;

/**
 * Runtime Provider Integration Template
 * Template for properly using runtime providers and provider system
 */
export const runtimeProviderIntegrationTemplate = `<task>Integrate with ElizaOS runtime providers for {{agentName}} using proper provider patterns.</task>

<providers>
{{providers}}
</providers>

<instructions>
Use the ElizaOS runtime provider system correctly and efficiently:

1. **Provider Access**: Access providers via runtime.providers array
2. **Provider Execution**: Use runtime.getProviderResults() for provider execution
3. **Provider Evaluation**: Use runtime.evaluateProviders() for provider evaluation
4. **Provider Capabilities**: Understand provider.dynamic and provider.private flags

RUNTIME PROVIDER INTEGRATION RULES:
- Access providers via runtime.providers array
- Use runtime.getProviderResults() for data retrieval
- Use runtime.evaluateProviders() for provider evaluation
- Respect provider.dynamic flag for real-time data
- Handle provider.private flag for access control
- Use provider.position for ordering when needed
- Cache provider results when appropriate

Generate a response that properly integrates with runtime providers.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your runtime provider integration analysis</thought>
    <actions>PROVIDER_LOOKUP,PROVIDER_EXECUTION,RESULT_EVALUATION,REPLY</actions>
    <providers>RUNTIME_PROVIDERS,PROVIDER_SYSTEM</providers>
    <text>Your response with proper runtime provider integration</text>
</response>
</output>`;

/**
 * Runtime Memory System Template
 * Template for properly using runtime memory system
 */
export const runtimeMemorySystemTemplate = `<task>Use ElizaOS runtime memory system for {{agentName}} using proper memory patterns.</task>

<providers>
{{providers}}
</providers>

<instructions>
Use the ElizaOS runtime memory system correctly and efficiently:

1. **Memory Creation**: Use runtime.createMemory() for memory creation
2. **Memory Retrieval**: Use runtime.getMemories() for memory retrieval
3. **Memory Search**: Use runtime.searchMemories() for semantic search
4. **Memory Types**: Leverage MemoryType enum for proper memory categorization

RUNTIME MEMORY SYSTEM RULES:
- Use runtime.createMemory(memory, tableName) for creation
- Use runtime.getMemories(options) for retrieval
- Use runtime.searchMemories(query, options) for semantic search
- Respect MemoryType: DOCUMENT, FRAGMENT, MESSAGE, DESCRIPTION, CUSTOM
- Use memory.metadata.scope for access control: 'shared', 'private', 'room'
- Handle memory.embedding for vector similarity search
- Use memory.unique flag to prevent duplicates

Generate a response that properly uses the runtime memory system.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your runtime memory system analysis</thought>
    <actions>MEMORY_CREATION,MEMORY_RETRIEVAL,MEMORY_SEARCH,REPLY</actions>
    <providers>RUNTIME_MEMORY,MEMORY_SYSTEM</providers>
    <text>Your response with proper runtime memory system usage</text>
</response>
</output>`;

/**
 * Runtime Model Management Template
 * Template for properly using runtime model system
 */
export const runtimeModelManagementTemplate = `<task>Use ElizaOS runtime model system for {{agentName}} using proper model patterns.</task>

<providers>
{{providers}}
</providers>

<instructions>
Use the ElizaOS runtime model system correctly and efficiently:

1. **Model Access**: Use runtime.getModel(type) for model access
2. **Model Types**: Leverage ModelType enum for proper model selection
3. **Model Parameters**: Use proper parameter types for model calls
4. **Model Results**: Handle model results with proper typing

RUNTIME MODEL MANAGEMENT RULES:
- Use runtime.getModel(ModelType.TEXT_GENERATION) for text generation
- Use runtime.getModel(ModelType.EMBEDDING) for embeddings
- Use runtime.getModel(ModelType.IMAGE_GENERATION) for image generation
- Handle model parameters with proper typing
- Use model-specific settings from MODEL_SETTINGS
- Handle model errors and rate limits gracefully
- Cache model results when appropriate

Generate a response that properly uses the runtime model system.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your runtime model management analysis</thought>
    <actions>MODEL_SELECTION,MODEL_EXECUTION,RESULT_PROCESSING,REPLY</actions>
    <providers>RUNTIME_MODELS,MODEL_SYSTEM</providers>
    <text>Your response with proper runtime model system usage</text>
</response>
</output>`;

/**
 * Runtime Event System Template
 * Template for properly using runtime event system
 */
export const runtimeEventSystemTemplate = `<task>Use ElizaOS runtime event system for {{agentName}} using proper event patterns.</task>

<providers>
{{providers}}
</providers>

<instructions>
Use the ElizaOS runtime event system correctly and efficiently:

1. **Event Registration**: Use runtime.events Map for event handling
2. **Event Types**: Leverage EventType enum for proper event categorization
3. **Event Handlers**: Register event handlers with proper typing
4. **Event Publishing**: Use event bus for inter-service communication

RUNTIME EVENT SYSTEM RULES:
- Access events via runtime.events Map
- Use EventType enum for event categorization
- Register event handlers with proper typing
- Use event bus for inter-service communication
- Handle event errors gracefully
- Use event payloads for data transfer
- Clean up event handlers on service stop

Generate a response that properly uses the runtime event system.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your runtime event system analysis</thought>
    <actions>EVENT_REGISTRATION,EVENT_HANDLING,EVENT_PUBLISHING,REPLY</actions>
    <providers>RUNTIME_EVENTS,EVENT_SYSTEM</providers>
    <text>Your response with proper runtime event system usage</text>
</response>
</output>`;

/**
 * Runtime Database Integration Template
 * Template for properly using runtime database system
 */
export const runtimeDatabaseIntegrationTemplate = `<task>Use ElizaOS runtime database system for {{agentName}} using proper database patterns.</task>

<providers>
{{providers}}
</providers>

<instructions>
Use the ElizaOS runtime database system correctly and efficiently:

1. **Database Access**: Use runtime.getDatabase() for database access
2. **Database Adapter**: Leverage IDatabaseAdapter interface for operations
3. **Database Operations**: Use proper database methods for CRUD operations
4. **Database Transactions**: Handle transactions and rollbacks properly

RUNTIME DATABASE INTEGRATION RULES:
- Use runtime.getDatabase() to access database adapter
- Use IDatabaseAdapter interface for type safety
- Handle database connection errors gracefully
- Use proper transaction management
- Handle database rollbacks on errors
- Use database connection pooling when available
- Cache database results when appropriate

Generate a response that properly uses the runtime database system.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your runtime database integration analysis</thought>
    <actions>DATABASE_ACCESS,DATABASE_OPERATION,TRANSACTION_MANAGEMENT,REPLY</actions>
    <providers>RUNTIME_DATABASE,DATABASE_SYSTEM</providers>
    <text>Your response with proper runtime database system usage</text>
</response>
</output>`;

/**
 * Runtime Plugin Management Template
 * Template for properly using runtime plugin system
 */
export const runtimePluginManagementTemplate = `<task>Use ElizaOS runtime plugin system for {{agentName}} using proper plugin patterns.</task>

<providers>
{{providers}}
</providers>

<instructions>
Use the ElizaOS runtime plugin system correctly and efficiently:

1. **Plugin Registration**: Use runtime.registerPlugin() for plugin registration
2. **Plugin Access**: Access plugins via runtime.plugins array
3. **Plugin Lifecycle**: Respect plugin init and destroy lifecycle
4. **Plugin Dependencies**: Handle plugin dependencies properly

RUNTIME PLUGIN MANAGEMENT RULES:
- Use runtime.registerPlugin(plugin) for registration
- Access plugins via runtime.plugins array
- Respect plugin.priority for loading order
- Handle plugin.dependencies for proper initialization
- Use plugin.init() for initialization
- Handle plugin errors gracefully
- Clean up plugins on shutdown

Generate a response that properly uses the runtime plugin system.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your runtime plugin management analysis</thought>
    <actions>PLUGIN_REGISTRATION,PLUGIN_INITIALIZATION,PLUGIN_ACCESS,REPLY</actions>
    <providers>RUNTIME_PLUGINS,PLUGIN_SYSTEM</providers>
    <text>Your response with proper runtime plugin system usage</text>
</response>
</output>`;

/**
 * Runtime State Management Template
 * Template for properly using runtime state management
 */
export const runtimeStateManagementTemplate = `<task>Use ElizaOS runtime state management for {{agentName}} using proper state patterns.</task>

<providers>
{{providers}}
</providers>

<instructions>
Use the ElizaOS runtime state management correctly and efficiently:

1. **State Access**: Access state via State interface with proper typing
2. **State Updates**: Update state.values and state.data properly
3. **State Persistence**: Use state.text for persistent state representation
4. **State Validation**: Validate state changes before applying

RUNTIME STATE MANAGEMENT RULES:
- Use State interface for proper typing
- Update state.values for general state variables
- Update state.data for structured data
- Use state.text for persistent state representation
- Validate state changes before applying
- Handle state conflicts gracefully
- Use state metadata for additional context

Generate a response that properly uses runtime state management.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your runtime state management analysis</thought>
    <actions>STATE_ACCESS,STATE_UPDATE,STATE_VALIDATION,REPLY</actions>
    <providers>RUNTIME_STATE,STATE_SYSTEM</providers>
    <text>Your response with proper runtime state management usage</text>
</response>
</output>`;

export default {
  runtimeServiceIntegrationTemplate,
  runtimeActionManagementTemplate,
  runtimeProviderIntegrationTemplate,
  runtimeMemorySystemTemplate,
  runtimeModelManagementTemplate,
  runtimeEventSystemTemplate,
  runtimeDatabaseIntegrationTemplate,
  runtimePluginManagementTemplate,
  runtimeStateManagementTemplate
};
