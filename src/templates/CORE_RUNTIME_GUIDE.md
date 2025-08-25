# ElizaOS Core Runtime Integration Guide

## 🎯 **Overview**

This guide demonstrates how to **correctly and efficiently** use the ElizaOS Core Runtime components:
- **AgentRuntime** - Main runtime class for agent execution
- **IAgentRuntime** - Runtime interface for type safety
- **Service classes** - Service architecture and lifecycle management

## 🚨 **Previous Issues (What We Were Doing Wrong)**

### **1. Missing Runtime Integration**
```typescript
// ❌ WRONG - No runtime integration
export const oldTemplate = `<task>Handle message for {{agentName}}</task>
<instructions>Generate a response...</instructions>`;

// ✅ CORRECT - Full runtime integration
export const newTemplate = `<task>Use ElizaOS runtime for {{agentName}}</task>
<instructions>
1. Access runtime services: runtime.getService<T>(serviceType)
2. Use runtime actions: runtime.processActions()
3. Leverage runtime providers: runtime.getProviderResults()
4. Manage runtime state: state.values, state.data
</instructions>`;
```

### **2. Incomplete Service Usage**
```typescript
// ❌ WRONG - No service lifecycle management
const service = new MyService();

// ✅ CORRECT - Proper service lifecycle
class MyService extends Service {
  static serviceType = "my-service";
  static async start(runtime: IAgentRuntime): Promise<MyService> {
    const service = new MyService(runtime);
    await service.start();
    return service;
  }
}
```

### **3. Limited Runtime Capabilities**
```typescript
// ❌ WRONG - No runtime memory system usage
const response = "Static response";

// ✅ CORRECT - Full runtime memory integration
const memory = await runtime.createMemory({
  entityId: userId,
  content: { text: userMessage },
  metadata: { type: MemoryType.MESSAGE, scope: 'private' }
});
```

## ✅ **Correct Core Runtime Usage Patterns**

### **1. Runtime Service Integration**

```typescript
// Template: runtimeServiceIntegrationTemplate
export const serviceUsageExample = `
<task>Use ElizaOS runtime services correctly</task>

<instructions>
1. **Service Registry Access**: Use runtime.getService<T>(serviceType)
2. **Service Lifecycle**: Respect service start/stop lifecycle
3. **Service Type Safety**: Leverage TypeScript generics
4. **Service Capabilities**: Access service.capabilityDescription

RUNTIME SERVICE INTEGRATION RULES:
- Always use runtime.getService<T>(serviceType) for service access
- Check service availability before use
- Use service type safety with generics
- Respect service lifecycle methods
- Handle service errors gracefully
</instructions>

<output>
<response>
    <thought>Runtime service integration analysis</thought>
    <actions>SERVICE_LOOKUP,SERVICE_VALIDATION,SERVICE_OPERATION,REPLY</actions>
    <providers>RUNTIME_SERVICES,SERVICE_REGISTRY</providers>
    <text>Response with proper runtime service integration</text>
</response>
</output>`;
```

**Implementation Example:**
```typescript
// Correct service usage in action handler
const actionHandler = async (
  runtime: IAgentRuntime,
  message: Memory,
  state: State
): Promise<ActionResult> => {
  
  // ✅ CORRECT - Type-safe service access
  const browserService = runtime.getService<IBrowserService>('browser');
  if (!browserService) {
    throw new Error('Browser service not available');
  }
  
  // ✅ CORRECT - Service capability check
  logger.info(`Using service: ${browserService.capabilityDescription}`);
  
  // ✅ CORRECT - Service operation
  const result = await browserService.navigate(url);
  
  return createActionResult({
    success: true,
    data: result
  });
};
```

### **2. Runtime Action Management**

```typescript
// Template: runtimeActionManagementTemplate
export const actionUsageExample = `
<task>Manage ElizaOS runtime actions correctly</task>

<instructions>
1. **Action Registration**: Actions are registered via runtime.actions array
2. **Action Execution**: Use runtime.processActions() for execution
3. **Action Validation**: Leverage action.validate() before execution
4. **Action Examples**: Use action.examples for training and context

RUNTIME ACTION MANAGEMENT RULES:
- Access actions via runtime.actions array
- Use action.validate() to check if action should run
- Execute actions via runtime.processActions() method
- Respect action examples and similes for context
- Handle action results properly with error checking
</instructions>

<output>
<response>
    <thought>Runtime action management analysis</thought>
    <actions>ACTION_VALIDATION,ACTION_EXECUTION,RESULT_PROCESSING,REPLY</actions>
    <providers>RUNTIME_ACTIONS,ACTION_SYSTEM</providers>
    <text>Response with proper runtime action management</text>
</response>
</output>`;
```

**Implementation Example:**
```typescript
// Correct action management in provider
const providerHandler = async (
  runtime: IAgentRuntime,
  message: Memory,
  state: State
): Promise<ProviderResult> => {
  
  // ✅ CORRECT - Access runtime actions
  const availableActions = runtime.actions;
  
  // ✅ CORRECT - Action validation
  const validActions = availableActions.filter(action => 
    action.validate(runtime, message, state)
  );
  
  // ✅ CORRECT - Action execution via runtime
  const actionResults = await runtime.processActions(validActions, message, state);
  
  return {
    text: `Available actions: ${validActions.map(a => a.name).join(', ')}`,
    values: { actions: actionResults },
    data: validActions
  };
};
```

### **3. Runtime Memory System**

```typescript
// Template: runtimeMemorySystemTemplate
export const memoryUsageExample = `
<task>Use ElizaOS runtime memory system correctly</task>

<instructions>
1. **Memory Creation**: Use runtime.createMemory() for creation
2. **Memory Retrieval**: Use runtime.getMemories() for retrieval
3. **Memory Search**: Use runtime.searchMemories() for semantic search
4. **Memory Types**: Leverage MemoryType enum for categorization

RUNTIME MEMORY SYSTEM RULES:
- Use runtime.createMemory(memory, tableName) for creation
- Use runtime.getMemories(options) for retrieval
- Use runtime.searchMemories(query, options) for semantic search
- Respect MemoryType: DOCUMENT, FRAGMENT, MESSAGE, DESCRIPTION, CUSTOM
- Use memory.metadata.scope for access control
- Handle memory.embedding for vector similarity search
</instructions>

<output>
<response>
    <thought>Runtime memory system analysis</thought>
    <actions>MEMORY_CREATION,MEMORY_RETRIEVAL,MEMORY_SEARCH,REPLY</actions>
    <providers>RUNTIME_MEMORY,MEMORY_SYSTEM</providers>
    <text>Response with proper runtime memory system usage</text>
</response>
</output>`;
```

**Implementation Example:**
```typescript
// Correct memory system usage
const memoryHandler = async (
  runtime: IAgentRuntime,
  message: Memory,
  state: State
): Promise<ActionResult> => {
  
  // ✅ CORRECT - Memory creation with proper metadata
  const newMemory = await runtime.createMemory({
    entityId: message.entityId,
    agentId: runtime.agentId,
    content: { text: "Processed user request" },
    roomId: message.roomId,
    metadata: {
      type: MemoryType.MESSAGE,
      scope: 'private',
      timestamp: Date.now(),
      tags: ['user-request', 'processed']
    }
  }, 'user_interactions');
  
  // ✅ CORRECT - Memory search with semantic query
  const relatedMemories = await runtime.searchMemories(
    "user preferences and settings",
    {
      entityId: message.entityId,
      limit: 5,
      similarityThreshold: 0.7
    }
  );
  
  // ✅ CORRECT - Memory retrieval with options
  const recentMemories = await runtime.getMemories({
    entityId: message.entityId,
    limit: 10,
    orderBy: 'createdAt',
    order: 'desc'
  });
  
  return createActionResult({
    success: true,
    data: { newMemory, relatedMemories, recentMemories }
  });
};
```

### **4. Runtime Model Management**

```typescript
// Template: runtimeModelManagementTemplate
export const modelUsageExample = `
<task>Use ElizaOS runtime model system correctly</task>

<instructions>
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
</instructions>

<output>
<response>
    <thought>Runtime model management analysis</thought>
    <actions>MODEL_SELECTION,MODEL_EXECUTION,RESULT_PROCESSING,REPLY</actions>
    <providers>RUNTIME_MODELS,MODEL_SYSTEM</providers>
    <text>Response with proper runtime model system usage</text>
</response>
</output>`;
```

**Implementation Example:**
```typescript
// Correct model system usage
const modelHandler = async (
  runtime: IAgentRuntime,
  message: Memory,
  state: State
): Promise<ActionResult> => {
  
  try {
    // ✅ CORRECT - Model access with proper typing
    const textModel = runtime.getModel(ModelType.TEXT_GENERATION);
    const embeddingModel = runtime.getModel(ModelType.EMBEDDING);
    
    if (!textModel || !embeddingModel) {
      throw new Error('Required models not available');
    }
    
    // ✅ CORRECT - Model execution with proper parameters
    const embedding = await embeddingModel({
      text: message.content.text || '',
      model: 'text-embedding-ada-002'
    });
    
    const generatedText = await textModel({
      prompt: `Process: ${message.content.text}`,
      maxTokens: 150,
      temperature: 0.7
    });
    
    // ✅ CORRECT - Model result handling
    return createActionResult({
      success: true,
      data: { 
        embedding: embedding.data[0].embedding,
        generatedText: generatedText.choices[0].text
      }
    });
    
  } catch (error) {
    // ✅ CORRECT - Model error handling
    logger.error('Model operation failed:', error);
    return createActionResult({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
```

## 🔧 **Service Architecture Best Practices**

### **1. Service Base Class Extension**

```typescript
// ✅ CORRECT - Proper service implementation
export class MyService extends Service {
  static serviceType = "my-service";
  capabilityDescription = "Provides advanced functionality for my use case";
  
  private config: MyServiceConfig;
  private isRunning = false;
  
  constructor(runtime: IAgentRuntime, config: MyServiceConfig = {}) {
    super(runtime);
    this.config = { enabled: true, ...config };
  }
  
  // ✅ CORRECT - Static lifecycle methods
  static async start(runtime: IAgentRuntime, config?: MyServiceConfig): Promise<MyService> {
    logger.info("Starting MyService");
    const service = new MyService(runtime, config);
    await service.start();
    return service;
  }
  
  static async stop(runtime: IAgentRuntime): Promise<void> {
    logger.info("Stopping MyService");
    const service = runtime.getService<MyService>(MyService.serviceType);
    if (service) {
      await service.stop();
    }
  }
  
  // ✅ CORRECT - Instance lifecycle methods
  async start(): Promise<void> {
    if (this.isRunning) return;
    
    try {
      await this.initialize();
      this.isRunning = true;
      logger.info("MyService started successfully");
    } catch (error) {
      logger.error("Failed to start MyService:", error);
      throw error;
    }
  }
  
  async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    try {
      await this.cleanup();
      this.isRunning = false;
      logger.info("MyService stopped successfully");
    } catch (error) {
      logger.error("Error stopping MyService:", error);
      throw error;
    }
  }
  
  // ✅ CORRECT - Service-specific methods
  async performOperation(data: any): Promise<any> {
    if (!this.isRunning) {
      throw new Error('Service is not running');
    }
    
    // Service logic here
    return { result: 'success', data };
  }
  
  private async initialize(): Promise<void> {
    // Initialize resources, start timers, etc.
  }
  
  private async cleanup(): Promise<void> {
    // Clean up resources, stop timers, etc.
  }
}
```

### **2. Service Registration and Usage**

```typescript
// ✅ CORRECT - Plugin with service registration
const plugin: Plugin = {
  name: "my-plugin",
  description: "Plugin with proper service management",
  priority: 100,
  
  services: [MyService], // Service automatically registered
  
  async init(config: Record<string, any>, runtime: IAgentRuntime) {
    // Service is automatically started when plugin loads
    logger.info("MyPlugin initialized with MyService");
  }
};

// ✅ CORRECT - Service usage in other components
const actionHandler = async (
  runtime: IAgentRuntime,
  message: Memory,
  state: State
): Promise<ActionResult> => {
  
  // Get service with type safety
  const myService = runtime.getService<MyService>('my-service');
  if (!myService) {
    throw new Error('MyService not available');
  }
  
  // Use service methods
  const result = await myService.performOperation(message.content);
  
  return createActionResult({
    success: true,
    data: result
  });
};
```

## 📊 **Performance Optimization**

### **1. Service Caching**

```typescript
// ✅ CORRECT - Service result caching
class CachedService extends Service {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  
  async getCachedData(key: string): Promise<any> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    
    const data = await this.fetchData(key);
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }
}
```

### **2. Memory Optimization**

```typescript
// ✅ CORRECT - Efficient memory operations
const efficientMemoryHandler = async (
  runtime: IAgentRuntime,
  message: Memory,
  state: State
): Promise<ActionResult> => {
  
  // Batch memory operations
  const memories = await Promise.all([
    runtime.getMemories({ entityId: message.entityId, limit: 5 }),
    runtime.searchMemories("recent activity", { limit: 3 }),
    runtime.createMemory(newMemory, 'table_name')
  ]);
  
  // Process results efficiently
  const [recent, searchResults, newMem] = memories;
  
  return createActionResult({
    success: true,
    data: { recent, searchResults, newMemory: newMem }
  });
};
```

## 🧪 **Testing Best Practices**

### **1. Mock Runtime Creation**

```typescript
// ✅ CORRECT - Comprehensive mock runtime for testing
export const createMockRuntime = (): IAgentRuntime => {
  return {
    agentId: 'test-agent-id' as UUID,
    character: {
      name: "Test Character",
      bio: ["Test character for testing"],
      plugins: [],
      topics: ["testing"]
    },
    
    // Mock services
    getService: mock().mockImplementation((serviceType: string) => {
      const mockServices: Record<string, any> = {
        'browser': { navigate: mock().mockResolvedValue({ success: true }) },
        'database': { query: mock().mockResolvedValue([]) },
        'memory': { create: mock().mockResolvedValue('memory-id') }
      };
      return mockServices[serviceType];
    }),
    
    // Mock actions
    actions: [
      {
        name: "TEST_ACTION",
        description: "Test action",
        validate: mock().mockResolvedValue(true),
        handler: mock().mockResolvedValue({ success: true })
      }
    ],
    
    // Mock providers
    providers: [
      {
        name: "TEST_PROVIDER",
        get: mock().mockResolvedValue({ text: "Test data", values: {} })
      }
    ],
    
    // Mock memory system
    createMemory: mock().mockResolvedValue('memory-id'),
    getMemories: mock().mockResolvedValue([]),
    searchMemories: mock().mockResolvedValue([]),
    
    // Mock model system
    getModel: mock().mockImplementation((type: ModelType) => {
      return mock().mockResolvedValue({ choices: [{ text: "Test response" }] });
    }),
    
    // Mock plugin system
    plugins: [],
    registerPlugin: mock().mockResolvedValue(undefined),
    
    // Mock event system
    events: new Map(),
    
    // Mock database
    getDatabase: mock().mockReturnValue({
      query: mock().mockResolvedValue([]),
      transaction: mock().mockResolvedValue({})
    })
  } as IAgentRuntime;
};
```

## 🎯 **Summary of Correct Usage**

### **✅ What We Now Do Correctly:**

1. **Full Runtime Integration**: All templates now properly reference and use runtime components
2. **Service Architecture**: Proper service lifecycle management with start/stop patterns
3. **Type Safety**: Full TypeScript integration with generics and interfaces
4. **Memory System**: Complete integration with runtime memory operations
5. **Action Management**: Proper action validation and execution via runtime
6. **Provider System**: Correct provider access and evaluation patterns
7. **Model Management**: Proper model access and parameter handling
8. **Event System**: Runtime event registration and handling
9. **Database Integration**: Runtime database adapter usage
10. **Plugin Management**: Proper plugin lifecycle and registration

### **🚀 Performance Benefits:**

- **Eliminated Redundant Code**: No more duplicate service implementations
- **Proper Resource Management**: Services start/stop correctly
- **Memory Optimization**: Efficient memory operations and caching
- **Type Safety**: Reduced runtime errors through compile-time checking
- **Scalability**: Proper service architecture for horizontal scaling

### **🔒 Security Improvements:**

- **Service Isolation**: Services properly isolated and managed
- **Access Control**: Runtime-level access control and validation
- **Error Handling**: Proper error handling and fallbacks
- **Resource Cleanup**: Automatic cleanup on service shutdown

The templates now provide **correct and efficient** usage of all ElizaOS Core Runtime components, following best practices for performance, security, and maintainability!
