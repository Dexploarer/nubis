# elizaOS Architecture Patterns

## Core Architectural Principles

### 1. Agent-Centric Design
- **Agent as Primary Entity**: Every elizaOS application centers around an `Agent` that extends the `Character` interface
- **Runtime Environment**: Agents operate within an `IAgentRuntime` that provides access to all system capabilities
- **Plugin Ecosystem**: Functionality is delivered through a modular plugin system that extends agent capabilities

### 2. Memory-First Architecture
- **Persistent Memory**: All interactions and knowledge are stored in the `Memory` system with vector embeddings
- **Entity Resolution**: Advanced entity management with LLM-powered disambiguation and relationship tracking
- **Knowledge Management**: RAG system with document chunking, vector search, and semantic retrieval

### 3. Service-Oriented Components
- **Service Base Class**: All services extend the abstract `Service` class with lifecycle management
- **Service Registry**: Services are registered in the runtime and accessible via `getService<T>()`
- **Service Types**: Predefined service types for common functionality (TRANSCRIPTION, VIDEO, BROWSER, etc.)

### 4. Plugin-Driven Extensibility
- **Modular Design**: Functionality is delivered through plugins that can be enabled/disabled
- **Priority System**: Plugins have priority levels that determine loading order
- **Dependency Management**: Plugins can declare dependencies on other plugins
- **Configuration Schema**: Zod-based validation for plugin configuration

## Core Interface Patterns

### Character Interface
```typescript
interface Character {
  name: string;
  system?: string;           // System prompt for behavior
  templates?: { [key: string]: TemplateType }; // Prompt templates
  bio: string | string[];    // Character biography
  plugins: string[];         // Required plugins
  settings?: { [key: string]: any }; // Configuration
  secrets?: { [key: string]: any };  // Secure configuration
  style?: { all?: string[]; chat?: string[]; post?: string[] }; // Writing style
}
```

### Agent Runtime Interface
```typescript
interface IAgentRuntime {
  agentId: UUID;
  character: Character;
  providers: Provider[];
  actions: Action[];
  evaluators: Evaluator[];
  plugins: Plugin[];
  services: Map<ServiceTypeName, Service[]>;
  events: Map<string, ((params: any) => Promise<void>)[]>;
  routes: Route[];
  
  // Core methods
  getService<T>(type: string): T | undefined;
  registerPlugin(plugin: Plugin): Promise<void>;
  getModel(type: ModelType): (...args: any[]) => Promise<any>;
  getDatabase(): IDatabaseAdapter;
}
```

### Memory Interface
```typescript
interface Memory {
  id?: UUID;
  entityId: UUID;
  agentId?: UUID;
  content: Content;
  embedding?: number[];      // Vector embeddings for similarity search
  roomId: UUID;
  worldId?: UUID;
  unique?: boolean;          // Duplicate prevention
  similarity?: number;       // Search similarity score
  metadata?: MemoryMetadata; // Typed metadata
}
```

## Component System Patterns

### Action Pattern
```typescript
interface Action {
  name: string;
  description: string;
  similes?: string[];        // Similar action descriptions
  examples?: ActionExample[][]; // Usage examples
  handler: Handler;          // Execution function
  validate: Validator;       // Validation function
}

// Action handler signature
type Handler = (
  runtime: IAgentRuntime,
  message: Memory,
  state: State,
  options: Record<string, unknown>,
  callback: HandlerCallback,
  responses: Memory[]
) => Promise<ActionResult>;
```

### Provider Pattern
```typescript
interface Provider {
  name: string;
  description?: string;
  dynamic?: boolean;         // Dynamic loading flag
  position?: number;         // Provider ordering
  private?: boolean;         // Visibility control
  get: (runtime, message, state) => Promise<ProviderResult>;
}
```

### Evaluator Pattern
```typescript
interface Evaluator {
  name: string;
  description: string;
  alwaysRun?: boolean;       // Run on every message
  examples: EvaluationExample[];
  handler: Handler;
  validate: Validator;
}
```

## Service Architecture Patterns

### Service Base Class
```typescript
abstract class Service {
  protected runtime: IAgentRuntime;
  abstract capabilityDescription: string;
  config?: Metadata;
  
  static serviceType: string;
  static async start(runtime: IAgentRuntime): Promise<Service>;
  static async stop(runtime: IAgentRuntime): Promise<void>;
  
  constructor(runtime: IAgentRuntime);
  async stop(): Promise<void>;
}
```

### Service Registration Pattern
```typescript
// In plugin definition
const plugin: Plugin = {
  services: [MyService],
  // ... other plugin properties
};

// Service is automatically registered when plugin loads
// Access via runtime.getService<MyService>(MyService.serviceType)
```

## Plugin System Patterns

### Plugin Interface
```typescript
interface Plugin {
  name: string;
  description: string;
  priority?: number;         // Loading priority (-1000 to 1000)
  dependencies?: string[];   // Required plugin names
  
  // Lifecycle
  init?: (config: Record<string, any>, runtime: IAgentRuntime) => Promise<void>;
  
  // Components
  services?: (typeof Service)[];
  actions?: Action[];
  providers?: Provider[];
  evaluators?: Evaluator[];
  
  // Models
  models?: { [key: string]: (...args: any[]) => Promise<any> };
  
  // Events
  events?: PluginEvents;
  
  // API Routes
  routes?: Route[];
  
  // Configuration
  config?: { [key: string]: any };
}
```

### Plugin Configuration Pattern
```typescript
// Zod schema for configuration validation
const configSchema = z.object({
  REQUIRED_VARIABLE: z.string().min(1, "Required variable not provided"),
  OPTIONAL_VARIABLE: z.string().optional(),
  ENVIRONMENT_VARIABLE: z.string().transform((val) => {
    if (!val) {
      console.warn("Warning: Environment variable not provided");
    }
    return val;
  }),
});

// In plugin init method
async init(config: Record<string, string>) {
  const validatedConfig = await configSchema.parseAsync(config);
  
  // Set environment variables
  for (const [key, value] of Object.entries(validatedConfig)) {
    if (value) process.env[key] = value;
  }
}
```

## Memory System Patterns

### Memory Factory Pattern
```typescript
// Create specialized memory types
const messageMemory = createMessageMemory({
  text: "Hello world",
  source: "user123",
  target: "agent456",
  roomId: "room789"
});

// Store with metadata
const memory = await runtime.getDatabase().createMemory({
  entityId: "user123",
  content: messageMemory,
  metadata: {
    type: "MESSAGE",
    source: "discord",
    priority: "medium"
  }
});
```

### Memory Search Pattern
```typescript
// Vector similarity search
const searchResults = await runtime.getDatabase().searchMemories({
  query: "community guidelines",
  roomId: "room123",
  count: 10,
  similarityThreshold: 0.7
});

// Contextual memory retrieval
const contextualMemories = await getContextualMemories(message, 10);
```

## Event System Patterns

### Event Registration Pattern
```typescript
// In plugin definition
events: {
  MESSAGE_RECEIVED: [
    async (params) => {
      logger.info("Message received:", params);
      // Handle message event
    }
  ],
  WORLD_CONNECTED: [
    async (params) => {
      logger.info("World connected:", params);
      // Handle world connection
    }
  ]
}
```

### Event Handler Pattern
```typescript
// Event handlers receive typed parameters
type MessageReceivedParams = {
  message: Memory;
  room: Room;
  world: World;
  agent: Agent;
};

// Event handlers are async functions
const messageHandler = async (params: MessageReceivedParams) => {
  const { message, room, world, agent } = params;
  // Process message
};
```

## Model Integration Patterns

### Model Type Constants
```typescript
enum ModelType {
  TEXT_SMALL = "text-small",
  TEXT_LARGE = "text-large",
  TEXT_EMBEDDING = "text-embedding",
  IMAGE = "image",
  IMAGE_DESCRIPTION = "image-description",
  TRANSCRIPTION = "transcription",
  TEXT_TO_SPEECH = "text-to-speech",
  OBJECT = "object"
}
```

### Model Usage Pattern
```typescript
// Get model by type
const textModel = runtime.getModel(ModelType.TEXT_LARGE);
const embeddingModel = runtime.getModel(ModelType.TEXT_EMBEDDING);

// Use models with typed parameters
const response = await textModel({
  prompt: "Generate a response",
  temperature: 0.7,
  maxTokens: 100
});

const embedding = await embeddingModel({
  text: "Text to embed"
});
```

## Database Integration Patterns

### Database Adapter Pattern
```typescript
interface IDatabaseAdapter {
  // Agent management
  getAgent(id: UUID): Promise<Agent | null>;
  createAgent(agent: Agent): Promise<Agent>;
  updateAgent(id: UUID, updates: Partial<Agent>): Promise<Agent>;
  deleteAgent(id: UUID): Promise<void>;
  
  // Memory operations
  getMemories(filters: MemoryFilters): Promise<Memory[]>;
  createMemory(memory: CreateMemoryParams): Promise<Memory>;
  searchMemories(query: string, options: SearchOptions): Promise<Memory[]>;
  updateMemory(id: UUID, updates: Partial<Memory>): Promise<Memory>;
  
  // Entity management
  getEntitiesByIds(ids: UUID[]): Promise<Entity[]>;
  createEntities(entities: Entity[]): Promise<Entity[]>;
  updateEntity(id: UUID, updates: Partial<Entity>): Promise<Entity>;
}
```

## Configuration Management Patterns

### Environment-Driven Configuration
```typescript
// Feature flags based on environment
const config = {
  raids: process.env.RAIDS_ENABLED === "true",
  moderation: process.env.MODERATION_ENABLED === "true",
  memory: process.env.MEMORY_ENABLED === "true",
  
  // Plugin-specific configuration
  plugins: {
    openai: process.env.OPENAI_API_KEY ? true : false,
    discord: process.env.DISCORD_API_TOKEN ? true : false,
    telegram: process.env.TELEGRAM_BOT_TOKEN ? true : false
  }
};
```

### Configuration Validation Pattern
```typescript
// Validate configuration at startup
const validateConfiguration = (config: any) => {
  const required = ['DATABASE_URL', 'ENCRYPTION_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};
```

## Error Handling Patterns

### Graceful Degradation
```typescript
// Service availability checking
if (runtime.isServiceAvailable('database')) {
  const dbService = runtime.getService<DatabaseService>('database');
  // Use database service
} else {
  logger.warn("Database service not available, using fallback");
  // Use fallback mechanism
}
```

### Error Recovery Pattern
```typescript
// In action handlers
try {
  const result = await performAction();
  return { success: true, data: result };
} catch (error) {
  logger.error({ error }, "Action failed");
  
  // Return structured error response
  return {
    success: false,
    error: error instanceof Error ? error.message : String(error),
    data: { actionName: "ACTION_NAME", error: error }
  };
}
```

## Performance Optimization Patterns

### Lazy Loading
```typescript
// Load services only when needed
const getService = async <T>(type: string): Promise<T> => {
  if (!this.services.has(type)) {
    const service = await this.loadService(type);
    this.services.set(type, service);
  }
  return this.services.get(type) as T;
};
```

### Caching Patterns
```typescript
// Entity cache with TTL
const entityCache = new Map<string, { entity: EntityProfile; timestamp: number }>();

const getCachedEntity = (key: string): EntityProfile | null => {
  const cached = entityCache.get(key);
  if (cached && Date.now() - cached.timestamp < TTL) {
    return cached.entity;
  }
  return null;
};
```

## Security Patterns

### Secret Management
```typescript
// Store secrets in character configuration
secrets: {
  divineEssence: process.env.ENCRYPTION_KEY || "fallback-key",
  spiritualGuidance: process.env.JWT_SECRET || "fallback-token",
  underworldAccess: process.env.API_KEY || "fallback-api-key"
}

// Access secrets through runtime
const secret = runtime.character.secrets?.divineEssence;
```

### Authentication Patterns
```typescript
// JWT token validation
const validateToken = (token: string): boolean => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return !!decoded;
  } catch {
    return false;
  }
};
```

## Testing Patterns

### Mock Runtime Pattern
```typescript
// Create mock runtime for testing
const createMockRuntime = (): IAgentRuntime => ({
  agentId: "test-agent",
  character: mockCharacter,
  providers: [],
  actions: [],
  evaluators: [],
  plugins: [],
  services: new Map(),
  events: new Map(),
  routes: [],
  
  getService: jest.fn(),
  registerPlugin: jest.fn(),
  getModel: jest.fn(),
  getDatabase: jest.fn()
});
```

### Plugin Testing Pattern
```typescript
// Test plugin initialization
describe("MyPlugin", () => {
  it("should initialize with valid config", async () => {
    const runtime = createMockRuntime();
    const plugin = myPlugin;
    
    await expect(plugin.init({ VALID_CONFIG: "value" }, runtime))
      .resolves.not.toThrow();
  });
});
```

## Best Practices

### 1. Plugin Priority Management
- Use negative priorities for core/system plugins (-1000 to -100)
- Use positive priorities for feature plugins (100 to 1000)
- Reserve priority 0 for standard plugins

### 2. Service Lifecycle Management
- Always implement both `start()` and `stop()` methods
- Clean up resources in the `stop()` method
- Handle service dependencies properly

### 3. Memory Management
- Use appropriate metadata types for different memory categories
- Implement retention policies for long-term storage
- Use vector embeddings for similarity search when possible

### 4. Error Handling
- Always return structured error responses from actions
- Log errors with appropriate context
- Implement graceful degradation for missing services

### 5. Configuration
- Use Zod schemas for configuration validation
- Provide meaningful default values
- Document all configuration options

### 6. Performance
- Implement caching for frequently accessed data
- Use lazy loading for heavy services
- Optimize memory search with proper indexing

This architecture pattern guide ensures consistent, maintainable, and scalable elizaOS applications while following the framework's core principles and design patterns.
