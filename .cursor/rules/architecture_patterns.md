# ElizaOS Architecture Patterns

## Plugin System Architecture

### Plugin Lifecycle

```typescript
interface IPlugin {
  id: string;
  name: string;
  version: string;
  initialize(config: PluginConfig): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  cleanup(): Promise<void>;
}
```

### Plugin Registration Pattern

```typescript
// Plugin bootstrap system
class PluginBootstrap {
  private plugins: Map<string, IPlugin> = new Map();

  register(plugin: IPlugin): void {
    this.plugins.set(plugin.id, plugin);
  }

  async initializeAll(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      await plugin.initialize(this.config);
    }
  }
}
```

### Service Layer Architecture

#### Base Service Pattern

```typescript
abstract class Service {
  protected _config: Metadata = {} as Metadata;
  public config: Metadata = {} as Metadata;

  abstract get capabilityDescription(): string;

  constructor(runtime: IAgentRuntime, config: Metadata = {}) {
    this._config = config;
    this.config = config;
  }
}
```

#### Optimized Service Pattern

```typescript
abstract class OptimizedService extends Service {
  protected _config: Metadata = {} as Metadata;
  public config: Metadata = {} as Metadata;

  constructor(runtime: IAgentRuntime, config: Metadata = {}) {
    super(runtime, config);
    this._config = config;
    this.config = config;
  }
}
```

### Memory Management Architecture

#### Facts Provider Pattern

```typescript
class FactsProvider {
  async getMemories(tableName: string, roomId: UUID, count: number): Promise<Memory[]> {
    // Retrieve recent messages
  }

  async searchMemories(
    tableName: string,
    embedding: number[],
    roomId: UUID,
    count: number,
  ): Promise<Memory[]> {
    // Semantic search across facts
  }
}
```

#### Redis Integration Pattern

```typescript
class RedisMemoryService extends OptimizedService {
  private client: RedisClientType;

  async connect(): Promise<void> {
    this.client = createClient({
      socket: {
        host: this._config.redisHost,
        port: this._config.redisPort,
      },
    });
    await this.client.connect();
  }
}
```

### Template System Architecture

#### Template Override Pattern

```typescript
interface TemplateConfig {
  baseTemplate: string;
  overrides: TemplateOverride[];
  validation: TemplateValidation;
}

interface TemplateOverride {
  path: string;
  value: any;
  condition?: (context: any) => boolean;
}
```

#### Dynamic Character Pattern

```typescript
class DynamicCharacterService extends OptimizedService {
  async generateCharacter(config: CharacterConfig): Promise<Character> {
    const template = await this.loadTemplate(config.templateId);
    const overrides = this.applyOverrides(template, config.overrides);
    return this.validateCharacter(overrides);
  }
}
```

### Testing Architecture

#### Matrix Testing Pattern

```typescript
interface MatrixTestConfig {
  baseScenario: string;
  matrix: MatrixParameter[];
  runsPerCombination: number;
}

interface MatrixParameter {
  parameter: string;
  values: any[];
}
```

#### Scenario Testing Pattern

```typescript
interface ScenarioConfig {
  name: string;
  description: string;
  plugins: PluginConfig[];
  environment: EnvironmentConfig;
  run: ScenarioStep[];
  evaluations: Evaluation[];
}
```

### Message Processing Architecture

#### Message Handler Pattern

```typescript
class MessageHandler {
  async handleMessage(message: Message): Promise<Response> {
    const context = await this.buildContext(message);
    const response = await this.generateResponse(context);
    return this.formatResponse(response);
  }

  private async buildContext(message: Message): Promise<Context> {
    const memories = await this.factsProvider.getMemories('messages', message.roomId, 10);
    const facts = await this.factsProvider.searchMemories(
      'facts',
      message.embedding,
      message.roomId,
      6,
    );
    return { message, memories, facts };
  }
}
```

### Error Handling Architecture

#### Service Error Pattern

```typescript
class ServiceError extends Error {
  constructor(
    message: string,
    public service: string,
    public operation: string,
    public context?: any,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// Usage in services
try {
  await this.performOperation();
} catch (error) {
  throw new ServiceError('Operation failed', this.constructor.name, 'performOperation', {
    originalError: error,
  });
}
```

### Configuration Management

#### Environment Configuration Pattern

```typescript
interface EnvironmentConfig {
  type: 'local' | 'e2b';
  setup: {
    mocks?: MockConfig[];
    virtual_fs?: Record<string, string>;
  };
}

interface MockConfig {
  service: string;
  method: string;
  response: any;
  when?: {
    input?: any;
    context?: any;
  };
}
```

### Performance Optimization Patterns

#### Caching Pattern

```typescript
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item || Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  set(key: string, data: any, ttl: number = 300000): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }
}
```

#### Connection Pooling Pattern

```typescript
class ConnectionPool {
  private connections: RedisClientType[] = [];
  private maxConnections: number;

  async getConnection(): Promise<RedisClientType> {
    if (this.connections.length < this.maxConnections) {
      const connection = createClient(this.config);
      await connection.connect();
      this.connections.push(connection);
      return connection;
    }
    return this.connections[Math.floor(Math.random() * this.connections.length)];
  }
}
```

### Security Patterns

#### Authentication Pattern

```typescript
class AuthenticationService extends Service {
  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this._config.jwtSecret);
      return await this.getUser(decoded.userId);
    } catch (error) {
      return null;
    }
  }
}
```

#### Input Validation Pattern

```typescript
class InputValidator {
  validateMessage(message: any): Message {
    if (!message.content || typeof message.content !== 'string') {
      throw new ValidationError('Message content is required and must be a string');
    }

    if (!message.roomId || !this.isValidUUID(message.roomId)) {
      throw new ValidationError('Valid room ID is required');
    }

    return message as Message;
  }
}
```

## Integration Patterns

### External Service Integration

```typescript
class ExternalServiceAdapter {
  async callService<T>(service: string, method: string, params: any): Promise<T> {
    const client = await this.getServiceClient(service);
    return await client[method](params);
  }
}
```

### Event-Driven Architecture

```typescript
class EventBus {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  emit(event: string, data: any): void {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach((listener) => listener(data));
  }
}
```
