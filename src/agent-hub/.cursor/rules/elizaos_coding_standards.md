# elizaOS Coding Standards

## TypeScript Standards

### Type Definitions
- **Strict Typing**: Use strict TypeScript with `strict: true` in tsconfig.json
- **Interface Naming**: Use PascalCase for interfaces (e.g., `IAgentRuntime`, `MemoryMetadata`)
- **Type Aliases**: Use PascalCase for type aliases (e.g., `HandlerCallback`, `ActionResult`)
- **Generic Types**: Use descriptive generic names (e.g., `Map<ServiceTypeName, Service[]>`)

### Import/Export Patterns
```typescript
// Core elizaOS imports first
import { 
  type IAgentRuntime, 
  logger, 
  type Memory, 
  type State,
  type UUID 
} from "@elizaos/core";

// Third-party imports
import { z } from "zod";
import { randomUUID } from "crypto";

// Local imports last
import { createMessageMemory } from "./memory-helpers";
import { validateInput } from "./validation";
```

### Type Safety
```typescript
// Always use proper typing for function parameters
const handleAction = async (
  runtime: IAgentRuntime,
  message: Memory,
  state: State
): Promise<ActionResult> => {
  // Implementation
};

// Use type guards for runtime type checking
if (typeof value === 'string' && value.length > 0) {
  // Handle string value
}

// Use discriminated unions for complex types
type MemoryType = 
  | { type: 'MESSAGE'; content: string }
  | { type: 'FACT'; content: Record<string, unknown> }
  | { type: 'KNOWLEDGE'; content: string };
```

## Plugin Development Standards

### Plugin Structure
```typescript
// Standard plugin structure
const plugin: Plugin = {
  name: "plugin-name",
  description: "Clear description of plugin functionality",
  priority: 0, // Default priority
  
  // Configuration schema
  config: {
    REQUIRED_VARIABLE: process.env.REQUIRED_VARIABLE,
    OPTIONAL_VARIABLE: process.env.OPTIONAL_VARIABLE,
  },
  
  // Lifecycle methods
  async init(config: Record<string, string>, runtime: IAgentRuntime) {
    // Initialize plugin
  },
  
  // Component definitions
  services: [MyService],
  actions: [myAction],
  providers: [myProvider],
  evaluators: [myEvaluator],
  
  // Model handlers
  models: {
    [ModelType.TEXT_SMALL]: async (runtime, params) => {
      // Model implementation
    }
  },
  
  // Event handlers
  events: {
    MESSAGE_RECEIVED: [
      async (params) => {
        // Handle message event
      }
    ]
  },
  
  // API routes
  routes: [
    {
      name: "endpoint-name",
      path: "/api/endpoint",
      type: "GET",
      handler: async (req, res) => {
        // Route handler
      }
    }
  ]
};
```

### Plugin Configuration
```typescript
// Use Zod for configuration validation
import { z } from "zod";

const configSchema = z.object({
  REQUIRED_VARIABLE: z
    .string()
    .min(1, "Required variable is not provided")
    .optional()
    .transform((val) => {
      if (!val) {
        console.warn("Warning: Required variable not provided");
      }
      return val;
    }),
  OPTIONAL_VARIABLE: z.string().optional(),
  NUMERIC_VARIABLE: z.number().min(0).max(100).default(50),
  BOOLEAN_VARIABLE: z.boolean().default(false),
});

// In plugin init method
async init(config: Record<string, string>) {
  try {
    const validatedConfig = await configSchema.parseAsync(config);
    
    // Set environment variables
    for (const [key, value] of Object.entries(validatedConfig)) {
      if (value !== undefined) process.env[key] = String(value);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid plugin configuration: ${error.errors.map((e) => e.message).join(", ")}`
      );
    }
    throw error;
  }
}
```

## Action Development Standards

### Action Structure
```typescript
const myAction: Action = {
  name: "ACTION_NAME",
  similes: ["SIMILAR_ACTION", "RELATED_ACTION"],
  description: "Clear description of what this action does",
  
  // Validation function
  validate: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State
  ): Promise<boolean> => {
    // Validate action can be executed
    return true;
  },
  
  // Handler function
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: Record<string, unknown>,
    callback: HandlerCallback,
    responses: Memory[]
  ): Promise<ActionResult> => {
    try {
      logger.info("Handling ACTION_NAME action");
      
      // Action implementation
      const result = await performAction(runtime, message, state);
      
      // Create response content
      const responseContent: Content = {
        text: result.message,
        actions: ["ACTION_NAME"],
        source: message.content.source,
      };
      
      // Call callback with response
      await callback(responseContent);
      
      // Return success result
      return {
        text: "Action completed successfully",
        values: {
          success: true,
          result: result.data,
        },
        data: {
          actionName: "ACTION_NAME",
          messageId: message.id,
          timestamp: Date.now(),
        },
        success: true,
      };
    } catch (error) {
      logger.error({ error }, "Error in ACTION_NAME action:");
      
      // Return error result
      return {
        text: "Action failed",
        values: {
          success: false,
          error: "ACTION_FAILED",
        },
        data: {
          actionName: "ACTION_NAME",
          error: error instanceof Error ? error.message : String(error),
        },
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },
  
  // Usage examples
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "User request that triggers action",
        },
      },
      {
        name: "{{name2}}",
        content: {
          text: "Expected response from action",
          actions: ["ACTION_NAME"],
        },
      },
    ],
  ],
};
```

### Action Result Standards
```typescript
// Always return structured ActionResult
type ActionResult = {
  text: string;                    // Human-readable result description
  values: { [key: string]: any };  // Key-value pairs for state updates
  data: { [key: string]: any };    // Additional data for logging/debugging
  success: boolean;                // Success flag
  error?: Error;                   // Error object if failed
};

// Success result pattern
{
  text: "Action completed successfully",
  values: {
    success: true,
    processedItems: 5,
    status: "completed"
  },
  data: {
    actionName: "ACTION_NAME",
    messageId: "msg-123",
    timestamp: Date.now(),
    executionTime: 150
  },
  success: true
}

// Error result pattern
{
  text: "Action failed: Invalid input provided",
  values: {
    success: false,
    error: "INVALID_INPUT",
    retryable: true
  },
  data: {
    actionName: "ACTION_NAME",
    error: "Input validation failed",
    input: { received: "invalid" },
    timestamp: Date.now()
  },
  success: false,
  error: new Error("Input validation failed")
}
```

## Service Development Standards

### Service Base Class
```typescript
export class MyService extends Service {
  static serviceType = "my-service";
  capabilityDescription = "Description of what this service provides";
  
  private config: MyServiceConfig;
  private isRunning = false;
  
  constructor(runtime: IAgentRuntime, config: MyServiceConfig = {}) {
    super(runtime);
    this.config = {
      enabled: true,
      intervalMs: 30000,
      ...config
    };
  }
  
  // Static lifecycle methods
  static async start(runtime: IAgentRuntime, config?: MyServiceConfig): Promise<MyService> {
    logger.info("*** Starting MyService ***");
    const service = new MyService(runtime, config);
    await service.start();
    return service;
  }
  
  static async stop(runtime: IAgentRuntime): Promise<void> {
    logger.info("*** Stopping MyService ***");
    const service = runtime.getService(MyService.serviceType);
    if (service) {
      await service.stop();
    }
  }
  
  // Instance lifecycle methods
  async start(): Promise<void> {
    if (this.isRunning) return;
    
    try {
      // Initialize service
      await this.initialize();
      this.isRunning = true;
      logger.info("MyService started successfully");
    } catch (error) {
      logger.error({ error }, "Failed to start MyService");
      throw error;
    }
  }
  
  async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    try {
      // Cleanup service
      await this.cleanup();
      this.isRunning = false;
      logger.info("MyService stopped successfully");
    } catch (error) {
      logger.error({ error }, "Error stopping MyService");
      throw error;
    }
  }
  
  // Service-specific methods
  private async initialize(): Promise<void> {
    // Initialize resources, start timers, etc.
  }
  
  private async cleanup(): Promise<void> {
    // Clean up resources, stop timers, etc.
  }
  
  // Public API methods
  async performOperation(data: any): Promise<any> {
    if (!this.isRunning) {
      throw new Error("Service is not running");
    }
    
    // Implementation
  }
}
```

## Memory Management Standards

### Memory Creation
```typescript
// Use factory functions for memory creation
import { createMessageMemory } from "@elizaos/core";

const messageMemory = createMessageMemory({
  text: "Hello world",
  source: "user123",
  target: "agent456",
  roomId: "room789"
});

// Store with proper metadata
const memory = await runtime.getDatabase().createMemory({
  entityId: "user123",
  content: messageMemory,
  roomId: "room789",
  metadata: {
    type: "MESSAGE",
    source: "discord",
    priority: "medium",
    tags: ["greeting", "user-interaction"]
  }
});
```

### Memory Search
```typescript
// Use proper search parameters
const searchResults = await runtime.getDatabase().searchMemories({
  query: "community guidelines",
  roomId: "room123",
  count: 10,
  similarityThreshold: 0.7,
  filters: {
    type: "KNOWLEDGE",
    priority: "high"
  }
});

// Handle search results properly
if (searchResults.length > 0) {
  const bestMatch = searchResults[0];
  if (bestMatch.similarity && bestMatch.similarity > 0.8) {
    // Use high-confidence result
  }
}
```

## Event Handling Standards

### Event Registration
```typescript
// In plugin definition
events: {
  MESSAGE_RECEIVED: [
    async (params) => {
      try {
        const { message, room, world, agent } = params;
        logger.info("Processing received message", { 
          messageId: message.id, 
          roomId: room.id 
        });
        
        // Handle message event
        await processMessage(message, room, world, agent);
      } catch (error) {
        logger.error({ error }, "Error handling MESSAGE_RECEIVED event");
      }
    }
  ],
  
  WORLD_CONNECTED: [
    async (params) => {
      try {
        const { world, agent } = params;
        logger.info("World connected", { worldId: world.id });
        
        // Handle world connection
        await initializeWorld(world, agent);
      } catch (error) {
        logger.error({ error }, "Error handling WORLD_CONNECTED event");
      }
    }
  ]
}
```

### Event Handler Patterns
```typescript
// Always wrap event handlers in try-catch
const messageHandler = async (params: MessageReceivedParams) => {
  try {
    // Extract parameters
    const { message, room, world, agent } = params;
    
    // Validate parameters
    if (!message || !room) {
      logger.warn("Invalid message parameters", { params });
      return;
    }
    
    // Process event
    await processMessage(message, room, world, agent);
    
  } catch (error) {
    logger.error({ error, params }, "Error in message handler");
    
    // Don't throw from event handlers - log and continue
  }
};
```

## Model Integration Standards

### Model Handler Implementation
```typescript
// In plugin definition
models: {
  [ModelType.TEXT_LARGE]: async (
    runtime: IAgentRuntime,
    params: GenerateTextParams
  ): Promise<string> => {
    try {
      const { prompt, temperature = 0.7, maxTokens = 8192 } = params;
      
      // Validate parameters
      if (!prompt || prompt.trim().length === 0) {
        throw new Error("Prompt is required");
      }
      
      // Get model service
      const modelService = runtime.getService<TextModelService>("text-model");
      if (!modelService) {
        throw new Error("Text model service not available");
      }
      
      // Generate response
      const response = await modelService.generate({
        prompt: prompt.trim(),
        temperature,
        maxTokens,
        stopSequences: params.stopSequences || []
      });
      
      return response;
      
    } catch (error) {
      logger.error({ error, params }, "Error in text generation model");
      throw error;
    }
  },
  
  [ModelType.TEXT_EMBEDDING]: async (
    runtime: IAgentRuntime,
    params: TextEmbeddingParams
  ): Promise<number[]> => {
    try {
      const { text } = params;
      
      if (!text || text.trim().length === 0) {
        throw new Error("Text is required for embedding");
      }
      
      const embeddingService = runtime.getService<EmbeddingService>("embedding");
      if (!embeddingService) {
        throw new Error("Embedding service not available");
      }
      
      const embedding = await embeddingService.embed(text.trim());
      return embedding;
      
    } catch (error) {
      logger.error({ error, params }, "Error in text embedding model");
      throw error;
    }
  }
}
```

## API Route Standards

### Route Definition
```typescript
// In plugin definition
routes: [
  {
    name: "get-status",
    path: "/api/status",
    type: "GET",
    handler: async (req: Record<string, unknown>, res: Record<string, unknown>) => {
      try {
        // Validate request
        if (!req.query || typeof req.query.format !== 'string') {
          res.status = 400;
          res.json = { error: "Invalid request format" };
          return;
        }
        
        // Process request
        const status = await getSystemStatus();
        
        // Return response
        res.status = 200;
        res.json = {
          status: "healthy",
          timestamp: new Date().toISOString(),
          data: status
        };
        
      } catch (error) {
        logger.error({ error }, "Error in status endpoint");
        
        res.status = 500;
        res.json = {
          error: "Internal server error",
          message: "Failed to retrieve system status"
        };
      }
    }
  },
  
  {
    name: "create-item",
    path: "/api/items",
    type: "POST",
    handler: async (req: Record<string, unknown>, res: Record<string, unknown>) => {
      try {
        // Validate request body
        const { name, description } = req.body as { name?: string; description?: string };
        
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
          res.status = 400;
          res.json = { error: "Name is required" };
          return;
        }
        
        // Create item
        const item = await createItem({
          name: name.trim(),
          description: description?.trim() || ""
        });
        
        // Return response
        res.status = 201;
        res.json = {
          success: true,
          data: item
        };
        
      } catch (error) {
        logger.error({ error, body: req.body }, "Error creating item");
        
        res.status = 500;
        res.json = {
          error: "Internal server error",
          message: "Failed to create item"
        };
      }
    }
  }
]
```

## Error Handling Standards

### Error Types
```typescript
// Define custom error types
export class ElizaOSError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ElizaOSError';
  }
}

export class ValidationError extends ElizaOSError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400, false);
    this.name = 'ValidationError';
  }
}

export class ServiceUnavailableError extends ElizaOSError {
  constructor(serviceName: string) {
    super(`Service ${serviceName} is not available`, 'SERVICE_UNAVAILABLE', 503, true);
    this.name = 'ServiceUnavailableError';
  }
}
```

### Error Handling Patterns
```typescript
// In action handlers
try {
  const result = await performAction();
  return { success: true, data: result };
} catch (error) {
  // Log error with context
  logger.error({ 
    error, 
    action: "ACTION_NAME",
    messageId: message.id,
    userId: message.entityId 
  }, "Action execution failed");
  
  // Handle specific error types
  if (error instanceof ValidationError) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      message: error.message,
      field: error.field,
      retryable: false
    };
  }
  
  if (error instanceof ServiceUnavailableError) {
    return {
      success: false,
      error: "SERVICE_UNAVAILABLE",
      message: error.message,
      retryable: true
    };
  }
  
  // Generic error handling
  return {
    success: false,
    error: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
    retryable: false
  };
}
```

## Logging Standards

### Logging Patterns
```typescript
// Use structured logging with context
logger.info("Action started", {
  actionName: "ACTION_NAME",
  messageId: message.id,
  userId: message.entityId,
  timestamp: new Date().toISOString()
});

logger.warn("Service degraded", {
  serviceName: "database",
  error: "Connection timeout",
  retryCount: 3
});

logger.error({ error }, "Critical error occurred", {
  context: "user-authentication",
  userId: "user123",
  timestamp: new Date().toISOString()
});

// Use appropriate log levels
// - debug: Detailed debugging information
// - info: General information about application flow
// - warn: Warning messages for potentially harmful situations
// - error: Error events that might still allow the application to continue
// - fatal: Very severe error events that will presumably lead to application failure
```

## Testing Standards

### Test Structure
```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createMockRuntime } from './test-utils';

describe("MyPlugin", () => {
  let runtime: IAgentRuntime;
  let plugin: Plugin;
  
  beforeEach(() => {
    runtime = createMockRuntime();
    plugin = myPlugin;
  });
  
  describe("initialization", () => {
    it("should initialize with valid config", async () => {
      const config = { REQUIRED_VARIABLE: "test-value" };
      
      await expect(plugin.init(config, runtime))
        .resolves.not.toThrow();
    });
    
    it("should fail with invalid config", async () => {
      const config = { INVALID_VARIABLE: "test-value" };
      
      await expect(plugin.init(config, runtime))
        .rejects.toThrow("Invalid plugin configuration");
    });
  });
  
  describe("actions", () => {
    it("should execute action successfully", async () => {
      const message = createMockMessage();
      const state = createMockState();
      
      const result = await plugin.actions[0].handler(
        runtime,
        message,
        state,
        {},
        jest.fn(),
        []
      );
      
      expect(result.success).toBe(true);
      expect(result.text).toBe("Action completed successfully");
    });
  });
});
```

### Mock Runtime
```typescript
export const createMockRuntime = (): IAgentRuntime => ({
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
  getDatabase: jest.fn(),
  
  // Add other runtime methods as needed
});
```

## Performance Standards

### Memory Management
```typescript
// Use appropriate data structures
const entityCache = new Map<string, { entity: EntityProfile; timestamp: number }>();

// Implement TTL for cache entries
const getCachedEntity = (key: string): EntityProfile | null => {
  const cached = entityCache.get(key);
  if (cached && Date.now() - cached.timestamp < TTL) {
    return cached.entity;
  }
  
  // Remove expired entry
  entityCache.delete(key);
  return null;
};

// Limit cache size
const addToCache = (key: string, entity: EntityProfile) => {
  if (entityCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entries
    const oldestKey = entityCache.keys().next().value;
    entityCache.delete(oldestKey);
  }
  
  entityCache.set(key, {
    entity,
    timestamp: Date.now()
  });
};
```

### Async Operations
```typescript
// Use Promise.all for parallel operations
const results = await Promise.all([
  fetchUserData(userId),
  fetchUserPreferences(userId),
  fetchUserHistory(userId)
]);

// Use Promise.allSettled for operations that shouldn't fail together
const results = await Promise.allSettled([
  updateUserProfile(userId, profile),
  sendNotification(userId, "Profile updated"),
  logActivity(userId, "profile_update")
]);

// Handle partial failures
const successful = results.filter(r => r.status === 'fulfilled');
const failed = results.filter(r => r.status === 'rejected');

if (failed.length > 0) {
  logger.warn("Some operations failed", { failed: failed.length, total: results.length });
}
```

## Security Standards

### Input Validation
```typescript
// Always validate input data
const validateUserInput = (input: unknown): UserInput => {
  if (!input || typeof input !== 'object') {
    throw new ValidationError("Input must be an object");
  }
  
  const { name, email, age } = input as any;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new ValidationError("Name is required");
  }
  
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new ValidationError("Valid email is required");
  }
  
  if (age !== undefined && (typeof age !== 'number' || age < 0 || age > 150)) {
    throw new ValidationError("Age must be a valid number between 0 and 150");
  }
  
  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    age: age || undefined
  };
};
```

### Secret Management
```typescript
// Never log sensitive information
logger.info("Processing user request", {
  userId: message.entityId,
  action: "LOGIN",
  // DO NOT log: password, tokens, API keys, etc.
});

// Use environment variables for secrets
const config = {
  apiKey: process.env.API_KEY,
  secretKey: process.env.SECRET_KEY,
  databaseUrl: process.env.DATABASE_URL
};

// Validate required secrets
const missingSecrets = Object.entries(config)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingSecrets.length > 0) {
  throw new Error(`Missing required secrets: ${missingSecrets.join(', ')}`);
}
```

## Documentation Standards

### Code Documentation
```typescript
/**
 * Processes a user message and generates an appropriate response.
 * 
 * @param runtime - The agent runtime environment
 * @param message - The user message to process
 * @param state - Current conversation state
 * @param options - Additional processing options
 * @returns Promise resolving to the processing result
 * 
 * @example
 * ```typescript
 * const result = await processMessage(runtime, message, state, {});
 * if (result.success) {
 *   console.log("Message processed:", result.data);
 * }
 * ```
 */
async function processMessage(
  runtime: IAgentRuntime,
  message: Memory,
  state: State,
  options: ProcessingOptions
): Promise<ProcessingResult> {
  // Implementation
}
```

### Plugin Documentation
```typescript
/**
 * MyPlugin - A comprehensive plugin for elizaOS
 * 
 * This plugin provides advanced functionality for:
 * - User management and authentication
 * - Content moderation and filtering
 * - Analytics and reporting
 * - Integration with external services
 * 
 * ## Configuration
 * 
 * The plugin requires the following environment variables:
 * - `API_KEY`: External service API key
 * - `WEBHOOK_URL`: Webhook endpoint for notifications
 * - `MAX_USERS`: Maximum number of users (default: 1000)
 * 
 * ## Usage
 * 
 * ```typescript
 * import { myPlugin } from './my-plugin';
 * 
 * const agent = {
 *   plugins: [myPlugin],
 *   // ... other agent configuration
 * };
 * ```
 * 
 * ## Events
 * 
 * - `USER_CREATED`: Fired when a new user is created
 * - `USER_UPDATED`: Fired when user information is updated
 * - `CONTENT_MODERATED`: Fired when content is moderated
 * 
 * ## API Endpoints
 * 
 * - `GET /api/users` - List all users
 * - `POST /api/users` - Create a new user
 * - `PUT /api/users/:id` - Update user information
 * - `DELETE /api/users/:id` - Delete a user
 */
```

These coding standards ensure consistent, maintainable, and secure elizaOS applications while following TypeScript best practices and the framework's architectural patterns.
