---
trigger: model_decision
description: Interface Guide and Rules
---

# ElizaOS Interface System: The Definitive Development Guide

## Core Interfaces Overview

ElizaOS is built on four fundamental interfaces that form the building blocks of intelligent agents:

### 1. Actions: The Agent's Verbs (What an Agent CAN DO)

Actions define specific capabilities an agent can perform, from simple replies to complex external API calls.

**Key Characteristics:**

- Represent discrete, executable tasks
- Modify agent state or affect external world
- Must have inputSchema and outputSchema using Zod
- Return Promise<ActionResult>

**Example Structure:**

```typescript
interface ActionDefinition {
  name: string; // Unique name (e.g., "SEND_EMAIL", "CREATE_TASK")
  description: string; // Clear explanation of purpose and effect
  inputSchema: Zod.ZodObject<any>; // Input validation schema
  outputSchema: Zod.ZodObject<any>; // Output validation schema
  handler: ActionHandlerFunction; // Execution logic
}

type ActionHandlerFunction = (context: ActionContext) => Promise<ActionResult>;
```

### 2. Providers: The Agent's Senses (What an Agent CAN KNOW)

Providers supply contextual information to the agent's reasoning process.

**Key Characteristics:**

- Side-effect free information retrieval
- Passive data sources the agent can "observe"
- Optional refreshInterval for data updates
- Must have outputSchema using Zod

**Example Structure:**

```typescript
interface ProviderDefinition {
  name: string; // Unique name (e.g., "CURRENT_TIME", "USER_PROFILE")
  description: string; // What information is provided
  outputSchema: Zod.ZodObject<any>; // Data structure schema
  handler: ProviderHandlerFunction; // Data retrieval logic
  refreshInterval?: number; // Optional refresh rate in ms
}
```

### 3. Evaluators: The Agent's Conscience (How an Agent ASSESSES)

Evaluators assess agent performance, outputs, and behavior quality.

**Key Characteristics:**

- Assess outputs, decisions, or behaviors
- Enable self-improvement and learning
- Must have inputSchema and outputSchema using Zod
- Provide structured feedback

**Example Structure:**

```typescript
interface EvaluatorDefinition {
  name: string; // Unique name (e.g., "RESPONSE_QUALITY", "SAFETY_CHECK")
  description: string; // What is being evaluated
  inputSchema: Zod.ZodObject<any>; // Input data schema
  outputSchema: Zod.ZodObject<any>; // Evaluation result schema
  handler: EvaluatorHandlerFunction; // Assessment logic
}
```

### 4. Services: The Agent's Infrastructure (How an Agent MANAGES State and Integrations)

Services provide persistent state, manage long-running processes, and handle external integrations.

**Key Characteristics:**

- Manage persistent state and connections
- Encapsulate complex business logic
- Initialized once, remain active throughout lifecycle
- Provide APIs for other components

**Example Structure:**

```typescript
interface ServiceDefinition {
  name: string; // Unique name (e.g., "DATABASE_SERVICE", "EMAIL_GATEWAY")
  description: string; // What functionality is provided
  init: (context: ServiceContext) => Promise<void>; // Initialization
  destroy?: (context: ServiceContext) => Promise<void>; // Optional cleanup
  // Service-specific methods and properties
}
```

## Plugin Structure and Creation

### Basic Plugin Export Structure

```typescript
interface ElizaOSPlugin {
  name: string; // Unique plugin identifier
  description: string; // Plugin purpose explanation
  version: string; // Semantic versioning
  actions?: Record<string, ActionDefinition>;
  providers?: Record<string, ProviderDefinition>;
  evaluators?: Record<string, EvaluatorDefinition>;
  services?: Record<string, ServiceDefinition>;
  configSchema?: Zod.ZodObject<any>; // Configuration validation
  init?: (config: Record<string, any>) => Promise<void>;
}

export const myPlugin: ElizaOSPlugin = {
  name: 'my-first-plugin',
  description: 'A simple plugin demonstrating core interfaces.',
  version: '1.0.0',
  actions: {
    /* action definitions */
  },
  providers: {
    /* provider definitions */
  },
  evaluators: {
    /* evaluator definitions */
  },
  services: {
    /* service definitions */
  },
};
```

### Plugin Configuration Schema

```typescript
import { z } from 'zod';

const pluginConfigSchema = z.object({
  apiKey: z.string().min(1, 'API Key cannot be empty.'),
  baseUrl: z.string().url().optional(),
  timeoutMs: z.number().int().min(1000).default(5000),
});

const plugin: ElizaOSPlugin = {
  name: 'external-api-plugin',
  configSchema: pluginConfigSchema,
  // ... other properties
};
```

## Context and Communication

### Action Context

```typescript
interface ActionContext {
  params: any; // Validated input parameters
  agent: AgentRuntime; // Agent runtime access
  services: ServiceRegistry; // Service registry access
  logger: Logger; // Logging utility
  eventBus: EventBus; // Event system access
}
```

### Service Context

```typescript
interface ServiceContext {
  config: Record<string, any>; // Service configuration
  agent: AgentRuntime; // Agent runtime access
  services: ServiceRegistry; // Other services access
  logger: Logger; // Logging utility
  eventBus: EventBus; // Event system access
}
```

### Inter-Plugin Communication

**Service Registry (Direct Calls):**

```typescript
// Access other services directly
const loggerService = context.services.get('LOGGER_SERVICE');
const paymentService = context.services.get('PAYMENT_SERVICE');

// Use service methods
loggerService.info('Processing order');
const result = await paymentService.processPayment(orderId, amount);
```

**Event Bus (Asynchronous Communication):**

```typescript
// Publish events
context.eventBus.publish('ORDER_PROCESSED', {
  orderId: 'ABC123',
  status: 'completed',
});

// Subscribe to events
context.eventBus.subscribe('ORDER_PROCESSED', (payload) => {
  console.log(`Order ${payload.orderId} was ${payload.status}`);
});
```

## Best Practices

### 1. Interface Design Principles

- **Single Responsibility**: Each interface should have one clear purpose
- **Clear Naming**: Use descriptive, uppercase names (e.g., SEND_EMAIL, CURRENT_WEATHER)
- **Comprehensive Descriptions**: Explain purpose, use case, and effect clearly
- **Schema Validation**: Always use Zod for input/output validation

### 2. Error Handling

```typescript
// In action handlers
try {
  const result = await performAction();
  return { success: true, data: result };
} catch (error) {
  context.logger.error('Action failed:', error);
  return {
    success: false,
    message: error.message,
    error: error,
  };
}
```

### 3. Asynchronous Operations

- Assume all handlers are asynchronous
- Always use async/await and return Promises
- Handle external API calls and database operations properly

### 4. Security Considerations

- Validate all inputs against schemas
- Sanitize user-provided data
- Use environment variables for sensitive configuration
- Implement proper authentication/authorization in services

### 5. Testing Strategy

- Unit tests for individual handlers
- Integration tests for plugin interactions
- End-to-end tests for agent behavior
- Mock external dependencies

## Common Patterns

### Action Pattern

```typescript
const myAction: ActionDefinition = {
  name: 'PROCESS_ORDER',
  description: 'Processes a customer order and updates inventory',
  inputSchema: z.object({
    orderId: z.string(),
    items: z.array(
      z.object({
        productId: z.string(),
        quantity: z.number().positive(),
      }),
    ),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    orderStatus: z.string(),
    inventoryUpdated: z.boolean(),
  }),
  handler: async (context) => {
    const { params, services, logger } = context;

    try {
      logger.info(`Processing order: ${params.orderId}`);
      // Implementation logic
      return { success: true, orderStatus: 'processed', inventoryUpdated: true };
    } catch (error) {
      logger.error('Order processing failed:', error);
      return { success: false, orderStatus: 'failed', inventoryUpdated: false };
    }
  },
};
```

### Provider Pattern

```typescript
const myProvider: ProviderDefinition = {
  name: 'INVENTORY_STATUS',
  description: 'Provides current inventory levels for products',
  outputSchema: z.object({
    products: z.array(
      z.object({
        productId: z.string(),
        quantity: z.number(),
        lastUpdated: z.string(),
      }),
    ),
  }),
  handler: async (context) => {
    const { services } = context;
    const dbService = services.get('DATABASE_SERVICE');

    const inventory = await dbService.query('SELECT * FROM inventory');
    return { products: inventory };
  },
  refreshInterval: 300000, // 5 minutes
};
```

### Service Pattern

```typescript
const myService: ServiceDefinition = {
  name: 'INVENTORY_SERVICE',
  description: 'Manages product inventory and stock levels',

  async init(context) {
    const { config, logger } = context;
    logger.info('Initializing inventory service');
    // Setup database connections, load configuration
  },

  async destroy(context) {
    const { logger } = context;
    logger.info('Shutting down inventory service');
    // Cleanup connections, save state
  },

  // Service-specific methods
  async updateStock(productId: string, quantity: number) {
    // Implementation
  },

  async getStockLevel(productId: string) {
    // Implementation
  },
};
```

This comprehensive guide provides the foundation for building robust, scalable ElizaOS agents using the interface system. Follow these patterns and best practices to create maintainable and effective plugins.
description:
globs:
alwaysApply: false

---
