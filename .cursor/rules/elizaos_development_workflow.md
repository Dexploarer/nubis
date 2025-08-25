# elizaOS Development Workflow

## Development Lifecycle

### 1. Project Initialization
```typescript
// 1. Create project structure
mkdir my-elizaos-agent
cd my-elizaos-agent
npm init -y

// 2. Install elizaOS dependencies
npm install @elizaos/core @elizaos/plugin-sql @elizaos/plugin-bootstrap

// 3. Install development dependencies
npm install -D typescript @types/node jest @types/jest ts-jest

// 4. Initialize TypeScript configuration
npx tsc --init

// 5. Create basic project structure
mkdir src tests config docs
mkdir src/plugins src/services src/actions src/providers
```

### 2. Character Definition
```typescript
// src/character.ts
import type { Character } from "@elizaos/core";

export const character: Character = {
  name: "MyAgent",
  bio: ["AI agent for specific purpose"],
  plugins: [
    "@elizaos/plugin-sql",      // Database support (MUST be first)
    "@elizaos/plugin-bootstrap", // Core functionality
    // Add your custom plugins here
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
```

### 3. Plugin Development
```typescript
// src/plugins/my-plugin.ts
import type { Plugin } from "@elizaos/core";
import { z } from "zod";

const configSchema = z.object({
  REQUIRED_VARIABLE: z.string().min(1, "Required variable not provided"),
});

const plugin: Plugin = {
  name: "my-plugin",
  description: "Description of plugin functionality",
  priority: 100,
  
  config: {
    REQUIRED_VARIABLE: process.env.REQUIRED_VARIABLE,
  },
  
  async init(config: Record<string, string>) {
    const validatedConfig = await configSchema.parseAsync(config);
    // Initialize plugin
  },
  
  actions: [/* Define actions */],
  providers: [/* Define providers */],
  services: [/* Define services */],
};

export default plugin;
```

## Testing Strategy

### 1. Unit Testing Setup
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

### 2. Test Utilities
```typescript
// tests/utils/mock-runtime.ts
import type { IAgentRuntime, Character, Memory, State } from "@elizaos/core";

export const createMockCharacter = (): Character => ({
  name: "TestAgent",
  bio: ["Test agent"],
  plugins: [],
});

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

export const createMockState = (overrides: Partial<State> = {}): State => ({
  values: {},
  data: {},
  text: "",
  ...overrides,
});
```

### 3. Plugin Testing
```typescript
// tests/plugins/my-plugin.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createMockRuntime } from '../utils/mock-runtime';
import myPlugin from '../../src/plugins/my-plugin';

describe("MyPlugin", () => {
  let runtime: IAgentRuntime;
  
  beforeEach(() => {
    runtime = createMockRuntime();
  });
  
  describe("initialization", () => {
    it("should initialize with valid config", async () => {
      const config = { REQUIRED_VARIABLE: "test-value" };
      
      await expect(myPlugin.init(config, runtime))
        .resolves.not.toThrow();
    });
    
    it("should fail with invalid config", async () => {
      const config = {};
      
      await expect(myPlugin.init(config, runtime))
        .rejects.toThrow("Required variable not provided");
    });
  });
  
  describe("actions", () => {
    it("should have required action properties", () => {
      expect(myPlugin.actions).toBeDefined();
      expect(myPlugin.actions.length).toBeGreaterThan(0);
      
      myPlugin.actions.forEach(action => {
        expect(action.name).toBeDefined();
        expect(action.description).toBeDefined();
        expect(action.handler).toBeDefined();
        expect(action.validate).toBeDefined();
      });
    });
    
    it("should execute action successfully", async () => {
      const action = myPlugin.actions[0];
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

### 4. Service Testing
```typescript
// tests/services/my-service.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createMockRuntime } from '../utils/mock-runtime';
import { MyService } from '../../src/services/my-service';

describe("MyService", () => {
  let runtime: IAgentRuntime;
  let service: MyService;
  
  beforeEach(() => {
    runtime = createMockRuntime();
    service = new MyService(runtime);
  });
  
  describe("lifecycle", () => {
    it("should start successfully", async () => {
      await expect(service.start()).resolves.not.toThrow();
      expect(service.isRunning).toBe(true);
    });
    
    it("should stop successfully", async () => {
      await service.start();
      await expect(service.stop()).resolves.not.toThrow();
      expect(service.isRunning).toBe(false);
    });
    
    it("should not start twice", async () => {
      await service.start();
      await service.start(); // Should not throw
      expect(service.isRunning).toBe(true);
    });
  });
  
  describe("operations", () => {
    it("should perform operation when running", async () => {
      await service.start();
      
      const result = await service.performOperation({ test: "data" });
      expect(result).toBeDefined();
    });
    
    it("should fail operation when not running", async () => {
      await expect(service.performOperation({ test: "data" }))
        .rejects.toThrow("Service is not running");
    });
  });
});
```

### 5. Integration Testing
```typescript
// tests/integration/agent-integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createAgent } from '../../src/agent';

describe("Agent Integration", () => {
  let agent: any;
  
  beforeAll(async () => {
    agent = await createAgent();
  });
  
  afterAll(async () => {
    if (agent) {
      await agent.shutdown();
    }
  });
  
  it("should initialize all plugins", async () => {
    expect(agent.runtime.plugins.length).toBeGreaterThan(0);
    
    for (const plugin of agent.runtime.plugins) {
      expect(plugin.name).toBeDefined();
      expect(plugin.description).toBeDefined();
    }
  });
  
  it("should register all services", async () => {
    const services = Array.from(agent.runtime.services.keys());
    expect(services.length).toBeGreaterThan(0);
    
    // Check for required services
    expect(services).toContain("database");
  });
  
  it("should handle messages", async () => {
    const message = createMockMemory({
      content: { text: "Hello, agent!" }
    });
    
    const response = await agent.processMessage(message);
    expect(response).toBeDefined();
    expect(response.success).toBe(true);
  });
});
```

## Development Workflow

### 1. Feature Development
```bash
# 1. Create feature branch
git checkout -b feature/new-action

# 2. Implement feature
# - Create action in src/actions/
# - Add tests in tests/actions/
# - Update character.ts if needed
# - Update documentation

# 3. Run tests
npm test

# 4. Check code coverage
npm run test:coverage

# 5. Lint code
npm run lint

# 6. Commit changes
git add .
git commit -m "feat: add new action for user management"

# 7. Push and create PR
git push origin feature/new-action
```

### 2. Plugin Development Workflow
```typescript
// 1. Define plugin interface
interface MyPluginConfig {
  enabled: boolean;
  apiKey: string;
  maxRequests: number;
}

// 2. Create configuration schema
const configSchema = z.object({
  enabled: z.boolean().default(true),
  apiKey: z.string().min(1, "API key is required"),
  maxRequests: z.number().min(1).max(1000).default(100),
});

// 3. Implement plugin lifecycle
const plugin: Plugin = {
  name: "my-plugin",
  description: "My custom plugin",
  
  async init(config: Record<string, string>) {
    const validatedConfig = await configSchema.parseAsync(config);
    // Initialize plugin with validated config
  },
  
  // Define components
  actions: [myAction],
  providers: [myProvider],
  services: [MyService],
};

// 4. Test plugin thoroughly
describe("MyPlugin", () => {
  it("should initialize with valid config", async () => {
    // Test initialization
  });
  
  it("should handle configuration errors", async () => {
    // Test error handling
  });
  
  it("should register all components", async () => {
    // Test component registration
  });
});
```

### 3. Service Development Workflow
```typescript
// 1. Extend Service base class
export class MyService extends Service {
  static serviceType = "my-service";
  capabilityDescription = "Provides my service functionality";
  
  private config: MyServiceConfig;
  private isRunning = false;
  
  constructor(runtime: IAgentRuntime, config: MyServiceConfig = {}) {
    super(runtime);
    this.config = { enabled: true, ...config };
  }
  
  // 2. Implement lifecycle methods
  static async start(runtime: IAgentRuntime, config?: MyServiceConfig): Promise<MyService> {
    const service = new MyService(runtime, config);
    await service.start();
    return service;
  }
  
  static async stop(runtime: IAgentRuntime): Promise<void> {
    const service = runtime.getService(MyService.serviceType);
    if (service) {
      await service.stop();
    }
  }
  
  async start(): Promise<void> {
    if (this.isRunning) return;
    
    try {
      await this.initialize();
      this.isRunning = true;
    } catch (error) {
      throw error;
    }
  }
  
  async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    try {
      await this.cleanup();
      this.isRunning = false;
    } catch (error) {
      throw error;
    }
  }
  
  // 3. Implement service-specific methods
  async performOperation(data: any): Promise<any> {
    if (!this.isRunning) {
      throw new Error("Service is not running");
    }
    
    // Implementation
  }
  
  // 4. Add private helper methods
  private async initialize(): Promise<void> {
    // Initialize resources
  }
  
  private async cleanup(): Promise<void> {
    // Clean up resources
  }
}
```

## Configuration Management

### 1. Environment Configuration
```typescript
// config/environment.ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).default("3000"),
  
  // Database
  DATABASE_URL: z.string().url("Invalid database URL"),
  
  // API Keys
  OPENAI_API_KEY: z.string().optional(),
  DISCORD_API_TOKEN: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  
  // Feature flags
  ENABLE_RAIDS: z.string().transform(val => val === "true").default("false"),
  ENABLE_MODERATION: z.string().transform(val => val === "true").default("true"),
  
  // Plugin configuration
  MAX_REQUESTS_PER_MINUTE: z.string().transform(Number).default("50"),
  SESSION_TIMEOUT_MINUTES: z.string().transform(Number).default("1440"),
});

export const env = envSchema.parse(process.env);
```

### 2. Feature Flags
```typescript
// config/feature-flags.ts
export const featureFlags = {
  raids: env.ENABLE_RAIDS,
  moderation: env.ENABLE_MODERATION,
  memory: true, // Always enabled
  social: env.DISCORD_API_TOKEN || env.TELEGRAM_BOT_TOKEN,
  
  // Plugin-specific flags
  plugins: {
    openai: !!env.OPENAI_API_KEY,
    discord: !!env.DISCORD_API_TOKEN,
    telegram: !!env.TELEGRAM_BOT_TOKEN,
  }
};

// Usage in code
if (featureFlags.raids) {
  // Enable raid functionality
}

if (featureFlags.plugins.openai) {
  // Enable OpenAI integration
}
```

## Deployment Workflow

### 1. Production Build
```bash
# 1. Build TypeScript
npm run build

# 2. Run production tests
npm run test:production

# 3. Check for vulnerabilities
npm audit

# 4. Create production bundle
npm run bundle

# 5. Run integration tests
npm run test:integration
```

### 2. Docker Deployment
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

### 3. Environment Management
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

## Monitoring and Debugging

### 1. Logging Configuration
```typescript
// config/logging.ts
import { logger } from "@elizaos/core";

export const configureLogging = () => {
  // Configure log levels based on environment
  const logLevel = process.env.LOG_LEVEL || "info";
  
  // Add custom log formatters
  logger.addFormat((level, message, meta) => {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    };
  });
  
  // Add log persistence for production
  if (process.env.NODE_ENV === "production") {
    logger.addTransport({
      type: "file",
      filename: "logs/elizaos.log",
      maxSize: "10m",
      maxFiles: 5,
    });
  }
};
```

### 2. Health Checks
```typescript
// src/services/health.service.ts
export class HealthService extends Service {
  static serviceType = "health";
  
  async getHealthStatus(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkExternalServices(),
      this.checkMemoryUsage(),
    ]);
    
    const results = checks.map((result, index) => ({
      service: ["database", "external", "memory"][index],
      status: result.status === "fulfilled" ? "healthy" : "unhealthy",
      error: result.status === "rejected" ? result.reason : undefined,
    }));
    
    const overallStatus = results.every(r => r.status === "healthy") 
      ? "healthy" 
      : "degraded";
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results,
    };
  }
  
  private async checkDatabase(): Promise<boolean> {
    try {
      const db = this.runtime.getDatabase();
      await db.healthCheck();
      return true;
    } catch {
      return false;
    }
  }
}
```

### 3. Performance Monitoring
```typescript
// src/services/performance.service.ts
export class PerformanceService extends Service {
  private metrics = new Map<string, number[]>();
  
  async recordMetric(name: string, value: number): Promise<void> {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name)!.push(value);
    
    // Keep only last 1000 values
    if (this.metrics.get(name)!.length > 1000) {
      this.metrics.get(name)!.shift();
    }
  }
  
  async getMetrics(): Promise<PerformanceMetrics> {
    const result: PerformanceMetrics = {};
    
    for (const [name, values] of this.metrics) {
      if (values.length > 0) {
        result[name] = {
          count: values.length,
          average: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          p95: this.percentile(values, 95),
          p99: this.percentile(values, 99),
        };
      }
    }
    
    return result;
  }
  
  private percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }
}
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

### 3. Testing Strategy
- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete user workflows
- **Performance Tests**: Test under load
- **Security Tests**: Test for common vulnerabilities

### 4. Deployment
- **Environment Separation**: Use different configs for dev/staging/prod
- **Health Monitoring**: Implement comprehensive health checks
- **Logging**: Use structured logging with appropriate levels
- **Security**: Follow security best practices
- **Rollback Strategy**: Plan for quick rollbacks

### 5. Maintenance
- **Regular Updates**: Keep dependencies updated
- **Security Audits**: Regular security audits
- **Performance Monitoring**: Monitor performance metrics
- **Backup Strategy**: Implement data backup strategies
- **Documentation**: Keep documentation updated

This development workflow ensures consistent, high-quality elizaOS applications with proper testing, deployment, and maintenance procedures.
