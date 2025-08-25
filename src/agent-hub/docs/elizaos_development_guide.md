# elizaOS Development Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Core Concepts](#core-concepts)
4. [Plugin Development](#plugin-development)
5. [Service Development](#service-development)
6. [Action Development](#action-development)
7. [Memory Management](#memory-management)
8. [Security Implementation](#security-implementation)
9. [Testing Strategy](#testing-strategy)
10. [Deployment](#deployment)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

## Introduction

elizaOS is a comprehensive framework for building AI agents with advanced capabilities including memory management, plugin systems, and multi-modal interactions. This guide provides comprehensive information for developers to build robust, secure, and scalable AI agents.

### Key Features

- **Agent-Centric Architecture**: Every application centers around an intelligent agent
- **Plugin System**: Modular functionality through extensible plugins
- **Memory Management**: Advanced memory systems with vector embeddings and entity resolution
- **Service Architecture**: Robust service layer with lifecycle management
- **Security First**: Built-in security protocols and authentication systems
- **TypeScript Native**: Full TypeScript support with strict typing

### Architecture Overview

```
elizaOS Application
├── Agent (Character + Runtime)
├── Plugins (Actions, Services, Providers)
├── Memory System (Vector Storage + Entity Management)
├── Security Layer (Auth, RBAC, Encryption)
└── Database Layer (PostgreSQL + Vector Search)
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- TypeScript 5.0+
- PostgreSQL 14+ (for production)
- Redis (optional, for caching)

### Quick Start

```bash
# 1. Create new project
mkdir my-elizaos-agent
cd my-elizaos-agent

# 2. Initialize project
npm init -y

# 3. Install dependencies
npm install @elizaos/core @elizaos/plugin-sql @elizaos/plugin-bootstrap
npm install -D typescript @types/node

# 4. Create TypeScript config
npx tsc --init

# 5. Create project structure
mkdir src tests config docs
mkdir src/plugins src/services src/actions
```

### Basic Agent Setup

```typescript
// src/character.ts
import type { Character } from "@elizaos/core";

export const character: Character = {
  name: "MyAgent",
  bio: ["AI agent for specific purpose"],
  plugins: [
    "@elizaos/plugin-sql",      // Database support (MUST be first)
    "@elizaos/plugin-bootstrap", // Core functionality
  ],
  system: `You are MyAgent, an AI assistant that...`,
  settings: {
    // Agent-specific settings
  },
  secrets: {
    // Environment-based secrets
    apiKey: process.env.API_KEY || "",
  }
};

// src/index.ts
import { character } from "./character";
import { createAgent } from "@elizaos/core";

export const projectAgent = {
  character,
  plugins: [],
  tests: [],
};

// src/main.ts
import { projectAgent } from "./index";

async function main() {
  try {
    const agent = await createAgent(projectAgent);
    console.log("Agent started successfully");
    
    // Keep agent running
    process.on('SIGINT', async () => {
      console.log("Shutting down agent...");
      await agent.shutdown();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start agent:", error);
    process.exit(1);
  }
}

main();
```

## Core Concepts

### 1. Agent Architecture

The agent is the central entity in elizaOS, composed of:

- **Character**: Defines personality, capabilities, and configuration
- **Runtime**: Provides execution environment and service access
- **Plugins**: Extend functionality through modular components

```typescript
interface Agent {
  character: Character;
  runtime: IAgentRuntime;
  plugins: Plugin[];
}

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

### 2. Memory System

elizaOS provides advanced memory management with:

- **Vector Embeddings**: Semantic similarity search
- **Entity Resolution**: LLM-powered entity disambiguation
- **Knowledge Management**: RAG system with document chunking

```typescript
// Memory creation
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

// Vector similarity search
const searchResults = await runtime.getDatabase().searchMemories({
  query: "community guidelines",
  roomId: "room123",
  count: 10,
  similarityThreshold: 0.7
});
```

### 3. Plugin System

Plugins are the primary way to extend elizaOS functionality:

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

## Plugin Development

### Plugin Structure

```typescript
// src/plugins/my-plugin.ts
import type { Plugin } from "@elizaos/core";
import { z } from "zod";

// Configuration schema
const configSchema = z.object({
  REQUIRED_VARIABLE: z.string().min(1, "Required variable not provided"),
  OPTIONAL_VARIABLE: z.string().optional(),
  NUMERIC_VARIABLE: z.number().min(0).max(100).default(50),
});

// Plugin definition
const plugin: Plugin = {
  name: "my-plugin",
  description: "Description of plugin functionality",
  priority: 100,
  
  config: {
    REQUIRED_VARIABLE: process.env.REQUIRED_VARIABLE,
    OPTIONAL_VARIABLE: process.env.OPTIONAL_VARIABLE,
    NUMERIC_VARIABLE: process.env.NUMERIC_VARIABLE,
  },
  
  async init(config: Record<string, string>) {
    try {
      const validatedConfig = await configSchema.parseAsync(config);
      
      // Set environment variables
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value !== undefined) process.env[key] = String(value);
      }
      
      console.log("MyPlugin initialized successfully");
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid plugin configuration: ${error.errors.map((e) => e.message).join(", ")}`
        );
      }
      throw error;
    }
  },
  
  // Define components
  services: [MyService],
  actions: [myAction],
  providers: [myProvider],
  evaluators: [myEvaluator],
  
  // Event handlers
  events: {
    MESSAGE_RECEIVED: [
      async (params) => {
        console.log("Message received:", params);
        // Handle message event
      }
    ]
  },
  
  // API routes
  routes: [
    {
      name: "get-status",
      path: "/api/status",
      type: "GET",
      handler: async (req, res) => {
        res.json = { status: "healthy" };
      }
    }
  ]
};

export default plugin;
```

### Plugin Configuration

Always use Zod for configuration validation:

```typescript
// Configuration validation
const configSchema = z.object({
  REQUIRED_VARIABLE: z
    .string()
    .min(1, "Required variable not provided")
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
  const validatedConfig = await configSchema.parseAsync(config);
  
  // Set environment variables
  for (const [key, value] of Object.entries(validatedConfig)) {
    if (value !== undefined) process.env[key] = String(value);
  }
}
```

### Plugin Priority Management

- **Negative priorities (-1000 to -100)**: Core/system plugins
- **Priority 0**: Standard plugins
- **Positive priorities (100 to 1000)**: Feature plugins

```typescript
const plugin: Plugin = {
  name: "core-plugin",
  priority: -500,  // High priority (loads early)
  // ... other properties
};

const featurePlugin: Plugin = {
  name: "feature-plugin",
  priority: 100,   // Lower priority (loads after core)
  // ... other properties
};
```

## Service Development

### Service Base Class

All services must extend the Service base class:

```typescript
import { Service } from "@elizaos/core";

export class MyService extends Service {
  static serviceType = "my-service";
  capabilityDescription = "Description of what this service provides";
  
  private config: MyServiceConfig;
  private isRunning = false;
  
  constructor(runtime: IAgentRuntime, config: MyServiceConfig = {}) {
    super(runtime);
    this.config = { enabled: true, ...config };
  }
  
  // Static lifecycle methods
  static async start(runtime: IAgentRuntime, config?: MyServiceConfig): Promise<MyService> {
    console.log("*** Starting MyService ***");
    const service = new MyService(runtime, config);
    await service.start();
    return service;
  }
  
  static async stop(runtime: IAgentRuntime): Promise<void> {
    console.log("*** Stopping MyService ***");
    const service = runtime.getService(MyService.serviceType);
    if (service) {
      await service.stop();
    }
  }
  
  // Instance lifecycle methods
  async start(): Promise<void> {
    if (this.isRunning) return;
    
    try {
      await this.initialize();
      this.isRunning = true;
      console.log("MyService started successfully");
    } catch (error) {
      console.error("Failed to start MyService:", error);
      throw error;
    }
  }
  
  async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    try {
      await this.cleanup();
      this.isRunning = false;
      console.log("MyService stopped successfully");
    } catch (error) {
      console.error("Error stopping MyService:", error);
      throw error;
    }
  }
  
  // Service-specific methods
  async performOperation(data: any): Promise<any> {
    if (!this.isRunning) {
      throw new Error("Service is not running");
    }
    
    // Implementation
    return { success: true, data };
  }
  
  // Private helper methods
  private async initialize(): Promise<void> {
    // Initialize resources, start timers, etc.
  }
  
  private async cleanup(): Promise<void> {
    // Clean up resources, stop timers, etc.
  }
}
```

### Service Registration

Services are automatically registered when the plugin loads:

```typescript
const plugin: Plugin = {
  services: [MyService],
  // ... other plugin properties
};

// Service is automatically registered when plugin loads
// Access via runtime.getService<MyService>(MyService.serviceType)
```

## Action Development

### Action Structure

Actions define what the agent can do:

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
      console.log("Handling ACTION_NAME action");
      
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
          processedItems: 5,
          status: "completed"
        },
        data: {
          actionName: "ACTION_NAME",
          messageId: message.id,
          timestamp: Date.now(),
          executionTime: 150
        },
        success: true
      };
    } catch (error) {
      console.error("Error in ACTION_NAME action:", error);
      
      // Return error result
      return {
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

Always return structured ActionResult:

```typescript
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

## Memory Management

### Memory Creation

Use factory functions for memory creation:

```typescript
import { createMessageMemory } from "@elizaos/core";

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

Use proper search parameters:

```typescript
// Vector similarity search
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

### Entity Management

elizaOS provides advanced entity resolution:

```typescript
// Entity resolution
const entity = await entityManager.resolveEntity(message, state);

// Get entity profiles
const profile = await entityManager.getEntityProfile(entityId);

// Manage relationships
await entityManager.addRelationship(
  sourceEntityId,
  targetEntityId,
  'friend',
  { strength: 0.8 }
);

// Get entity statistics
const stats = await entityManager.getEntityStats(entityId);
```

## Security Implementation

### Authentication

Implement JWT-based authentication:

```typescript
import { AuthService } from "./services/auth.service";

const authService = runtime.getService<AuthService>('auth');

// Generate token
const token = authService.generateToken({
  userId: "user123",
  username: "john_doe",
  roles: ["user"],
  permissions: ["read:own", "write:own"]
});

// Verify token
const payload = authService.verifyToken(token);
if (payload) {
  // Token is valid
}
```

### Authorization

Use role-based access control:

```typescript
import { RBACService } from "./services/rbac.service";

const rbacService = runtime.getService<RBACService>('rbac');

// Check permissions
if (rbacService.hasPermission(userId, 'admin:users:read')) {
  // User can read admin user data
}

// Check multiple permissions
if (rbacService.hasAllPermissions(userId, ['user:read', 'user:write'])) {
  // User has both read and write permissions
}
```

### Input Validation

Always validate and sanitize input:

```typescript
import { ValidationService } from "./services/validation.service";

const validationService = runtime.getService<ValidationService>('validation');

// Validate user input
try {
  const userInput = validationService.validateUserInput(input);
  // Process validated input
} catch (error) {
  // Handle validation error
}

// Sanitize HTML content
const sanitizedHtml = validationService.sanitizeHtml(userHtml);
```

## Testing Strategy

### Test Setup

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Test Utilities

```typescript
// tests/utils/mock-runtime.ts
export const createMockRuntime = (): IAgentRuntime => ({
  agentId: "test-agent",
  character: createMockCharacter(),
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
});

export const createMockMemory = (overrides: Partial<Memory> = {}): Memory => ({
  id: "test-memory",
  entityId: "test-entity",
  content: { text: "Test message" },
  roomId: "test-room",
  ...overrides,
});
```

### Plugin Testing

```typescript
// tests/plugins/my-plugin.test.ts
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
      const config = {};
      
      await expect(plugin.init(config, runtime))
        .rejects.toThrow("Required variable not provided");
    });
  });
  
  describe("actions", () => {
    it("should execute action successfully", async () => {
      const action = plugin.actions[0];
      const message = createMockMemory();
      const state = createMockState();
      
      const result = await action.handler(
        runtime,
        message,
        state,
        {},
        jest.fn(),
        []
      );
      
      expect(result.success).toBe(true);
    });
  });
});
```

## Deployment

### Production Build

```bash
# 1. Build TypeScript
npm run build

# 2. Run production tests
npm run test:production

# 3. Check for vulnerabilities
npm audit

# 4. Create production bundle
npm run bundle
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY dist/ ./dist/
COPY config/ ./config/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S elizaos -u 1001

# Change ownership
RUN chown -R elizaos:nodejs /app
USER elizaos

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["node", "dist/index.js"]
```

### Environment Configuration

```bash
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
ENCRYPTION_KEY=your-production-encryption-key
JWT_SECRET=your-production-jwt-secret

# Feature flags
ENABLE_RAIDS=true
ENABLE_MODERATION=true
ENABLE_COMMUNITY_MEMORY=true

# Plugin configuration
OPENAI_API_KEY=your-openai-api-key
DISCORD_API_TOKEN=your-discord-token
TELEGRAM_BOT_TOKEN=your-telegram-token
```

## Best Practices

### 1. Plugin Development
- **Single Responsibility**: Each plugin should have one clear purpose
- **Configuration Validation**: Always validate configuration with Zod
- **Error Handling**: Implement proper error handling and logging
- **Testing**: Write comprehensive tests for all plugin functionality
- **Documentation**: Document all public APIs and configuration options

### 2. Service Development
- **Lifecycle Management**: Always implement start/stop methods
- **Resource Cleanup**: Clean up resources in stop method
- **Error Recovery**: Implement graceful error recovery
- **Health Checks**: Provide health check methods
- **Performance Monitoring**: Record performance metrics

### 3. Security
- **Input Validation**: Always validate and sanitize input
- **Authentication**: Implement proper authentication mechanisms
- **Authorization**: Use role-based access control
- **Encryption**: Encrypt sensitive data at rest and in transit
- **Audit Logging**: Log all security-relevant events

### 4. Performance
- **Caching**: Implement appropriate caching strategies
- **Lazy Loading**: Load resources only when needed
- **Async Operations**: Use proper async patterns
- **Memory Management**: Implement proper memory cleanup
- **Monitoring**: Monitor performance metrics

### 5. Testing
- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete user workflows
- **Performance Tests**: Test under load
- **Security Tests**: Test for common vulnerabilities

## Troubleshooting

### Common Issues

#### 1. Plugin Not Loading
```typescript
// Check plugin priority
const plugin: Plugin = {
  name: "my-plugin",
  priority: 100, // Ensure proper priority
  // ... other properties
};

// Check dependencies
const plugin: Plugin = {
  name: "my-plugin",
  dependencies: ["required-plugin"], // Ensure dependencies exist
  // ... other properties
};
```

#### 2. Service Not Available
```typescript
// Check service registration
const plugin: Plugin = {
  services: [MyService], // Ensure service is included
  // ... other properties
};

// Check service type
export class MyService extends Service {
  static serviceType = "my-service"; // Ensure unique service type
  // ... other properties
}
```

#### 3. Memory Search Issues
```typescript
// Check metadata structure
const memory = await runtime.getDatabase().createMemory({
  entityId: "user123",
  content: messageMemory,
  metadata: {
    type: "MESSAGE", // Use consistent metadata types
    source: "discord",
    priority: "medium"
  }
});

// Check search parameters
const searchResults = await runtime.getDatabase().searchMemories({
  query: "search term",
  count: 10,
  similarityThreshold: 0.7, // Adjust threshold as needed
  filters: {
    type: "MESSAGE" // Use proper filter types
  }
});
```

#### 4. Authentication Issues
```typescript
// Check JWT configuration
const authService = new AuthService(runtime);
const token = authService.generateToken(payload);

// Verify token
const payload = authService.verifyToken(token);
if (!payload) {
  // Token is invalid
}

// Check permissions
const rbacService = runtime.getService<RBACService>('rbac');
if (!rbacService.hasPermission(userId, permission)) {
  // User lacks permission
}
```

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
// Enable debug mode
process.env.DEBUG = 'elizaos:*';

// Or set log level
process.env.LOG_LEVEL = 'debug';

// Check runtime state
console.log("Runtime services:", Array.from(runtime.services.keys()));
console.log("Runtime plugins:", runtime.plugins.map(p => p.name));
console.log("Runtime actions:", runtime.actions.map(a => a.name));
```

### Performance Issues

```typescript
// Monitor memory usage
const memoryUsage = process.memoryUsage();
console.log("Memory usage:", memoryUsage);

// Check service performance
const performanceService = runtime.getService<PerformanceService>('performance');
const metrics = await performanceService.getMetrics();
console.log("Performance metrics:", metrics);

// Optimize database queries
const searchResults = await runtime.getDatabase().searchMemories({
  query: "search term",
  count: 10, // Limit results
  similarityThreshold: 0.8, // Increase threshold for better performance
});
```

This comprehensive development guide provides everything needed to build robust, secure, and scalable elizaOS applications. Follow the patterns and best practices outlined here to ensure your agents are production-ready and maintainable.
