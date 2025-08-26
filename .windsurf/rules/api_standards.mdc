# ElizaOS API Standards

## REST API Design

### URL Structure
```
/api/v1/{resource}/{id}/{sub-resource}
```

**Examples:**
- `GET /api/v1/messages` - List messages
- `GET /api/v1/messages/{id}` - Get specific message
- `POST /api/v1/messages` - Create message
- `PUT /api/v1/messages/{id}` - Update message
- `DELETE /api/v1/messages/{id}` - Delete message
- `GET /api/v1/messages/{id}/replies` - Get message replies

### HTTP Methods
```typescript
// Standard HTTP method usage
GET    - Retrieve resources
POST   - Create new resources
PUT    - Update entire resources
PATCH  - Partial resource updates
DELETE - Remove resources
```

### Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    version: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
```

### Error Handling
```typescript
// Standard error responses
interface ApiError {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'AUTHENTICATION_ERROR' | 'AUTHORIZATION_ERROR' | 'NOT_FOUND' | 'INTERNAL_ERROR';
    message: string;
    details?: {
      field?: string;
      value?: any;
      constraint?: string;
    }[];
  };
  meta: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// Example error responses
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "value": "invalid-email",
        "constraint": "must be valid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req-123456",
    "version": "1.0.0"
  }
}
```

## Plugin API Standards

### Plugin Interface
```typescript
interface IPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  
  initialize(config: PluginConfig): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  cleanup(): Promise<void>;
  
  // Plugin-specific methods
  [key: string]: any;
}
```

### Plugin Configuration
```typescript
interface PluginConfig {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  settings: Record<string, any>;
  dependencies?: string[];
  permissions?: string[];
}
```

### Plugin Method Standards
```typescript
class StandardPlugin implements IPlugin {
  id = 'plugin-id';
  name = 'Plugin Name';
  version = '1.0.0';
  description = 'Plugin description';
  
  async initialize(config: PluginConfig): Promise<void> {
    // Validate configuration
    this.validateConfig(config);
    
    // Initialize resources
    await this.setupResources();
    
    // Register event handlers
    this.registerEventHandlers();
  }
  
  async start(): Promise<void> {
    // Start plugin operations
    await this.startOperations();
  }
  
  async stop(): Promise<void> {
    // Stop plugin operations
    await this.stopOperations();
  }
  
  async cleanup(): Promise<void> {
    // Clean up resources
    await this.cleanupResources();
  }
  
  // Plugin-specific methods should follow naming conventions
  async performOperation(params: OperationParams): Promise<OperationResult> {
    // Validate parameters
    this.validateParams(params);
    
    // Perform operation
    const result = await this.executeOperation(params);
    
    // Log operation
    await this.logOperation(params, result);
    
    return result;
  }
}
```

## Service API Standards

### Service Base Interface
```typescript
abstract class Service {
  protected _config: Metadata = {} as Metadata;
  public config: Metadata = {} as Metadata;
  
  abstract get capabilityDescription(): string;
  
  constructor(runtime: IAgentRuntime, config: Metadata = {}) {
    this._config = config;
    this.config = config;
  }
  
  // Standard service lifecycle methods
  async initialize(): Promise<void> {
    // Override in subclasses
  }
  
  async start(): Promise<void> {
    // Override in subclasses
  }
  
  async stop(): Promise<void> {
    // Override in subclasses
  }
  
  async cleanup(): Promise<void> {
    // Override in subclasses
  }
}
```

### Service Method Standards
```typescript
class StandardService extends Service {
  get capabilityDescription(): string {
    return 'Standard service for common operations';
  }
  
  // CRUD operations
  async create<T>(data: T): Promise<T> {
    this.validateCreateData(data);
    const result = await this.performCreate(data);
    await this.logOperation('create', { data, result });
    return result;
  }
  
  async read<T>(id: string): Promise<T | null> {
    this.validateId(id);
    const result = await this.performRead(id);
    await this.logOperation('read', { id, result });
    return result;
  }
  
  async update<T>(id: string, data: Partial<T>): Promise<T> {
    this.validateId(id);
    this.validateUpdateData(data);
    const result = await this.performUpdate(id, data);
    await this.logOperation('update', { id, data, result });
    return result;
  }
  
  async delete(id: string): Promise<boolean> {
    this.validateId(id);
    const result = await this.performDelete(id);
    await this.logOperation('delete', { id, result });
    return result;
  }
  
  // List operations
  async list<T>(options: ListOptions = {}): Promise<ListResult<T>> {
    const result = await this.performList(options);
    await this.logOperation('list', { options, result });
    return result;
  }
}
```

## Message API Standards

### Message Format
```typescript
interface Message {
  id: UUID;
  content: string;
  userId: UUID;
  roomId: UUID;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'system';
  metadata?: {
    attachments?: Attachment[];
    mentions?: UUID[];
    reactions?: Reaction[];
    threadId?: UUID;
  };
}
```

### Message Processing
```typescript
interface MessageProcessor {
  async processMessage(message: Message): Promise<ProcessedMessage> {
    // Validate message
    this.validateMessage(message);
    
    // Process content
    const processedContent = await this.processContent(message.content);
    
    // Generate response
    const response = await this.generateResponse(processedContent);
    
    // Store in memory
    await this.storeMessage(message, response);
    
    return {
      originalMessage: message,
      processedContent,
      response,
      metadata: {
        processingTime: Date.now() - message.timestamp,
        confidence: this.calculateConfidence(response)
      }
    };
  }
}
```

## Memory API Standards

### Memory Operations
```typescript
interface MemoryService {
  // Store memory
  async storeMemory(memory: Memory): Promise<void>;
  
  // Retrieve memories
  async getMemories(tableName: string, roomId: UUID, count: number): Promise<Memory[]>;
  
  // Search memories
  async searchMemories(tableName: string, embedding: number[], roomId: UUID, count: number): Promise<Memory[]>;
  
  // Update memory
  async updateMemory(id: UUID, updates: Partial<Memory>): Promise<Memory>;
  
  // Delete memory
  async deleteMemory(id: UUID): Promise<boolean>;
}
```

### Memory Schema
```typescript
interface Memory {
  id: UUID;
  tableName: string;
  roomId: UUID;
  content: string;
  embedding?: number[];
  metadata: {
    source: string;
    timestamp: string;
    type: 'message' | 'fact' | 'context';
    tags?: string[];
    confidence?: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

## Authentication & Authorization

### Authentication Standards
```typescript
interface AuthService {
  // Generate JWT token
  async generateToken(user: User): Promise<string>;
  
  // Validate token
  async validateToken(token: string): Promise<User | null>;
  
  // Refresh token
  async refreshToken(refreshToken: string): Promise<string>;
  
  // Revoke token
  async revokeToken(token: string): Promise<void>;
}
```

### Authorization Standards
```typescript
interface AuthorizationService {
  // Check permission
  async checkPermission(user: User, resource: string, action: string): Promise<boolean>;
  
  // Get user permissions
  async getUserPermissions(userId: UUID): Promise<Permission[]>;
  
  // Grant permission
  async grantPermission(userId: UUID, permission: Permission): Promise<void>;
  
  // Revoke permission
  async revokePermission(userId: UUID, permission: Permission): Promise<void>;
}
```

## Versioning Standards

### API Versioning
```typescript
// URL versioning
/api/v1/messages
/api/v2/messages

// Header versioning
Accept: application/vnd.elizaos.v1+json
Accept: application/vnd.elizaos.v2+json

// Version compatibility
interface VersionInfo {
  current: string;
  supported: string[];
  deprecated: string[];
  sunset: string[];
}
```

### Backward Compatibility
```typescript
class VersionedService extends Service {
  async handleRequest(version: string, request: any): Promise<any> {
    switch (version) {
      case 'v1':
        return this.handleV1Request(request);
      case 'v2':
        return this.handleV2Request(request);
      default:
        throw new Error(`Unsupported API version: ${version}`);
    }
  }
  
  private async handleV1Request(request: any): Promise<any> {
    // Handle v1 format
    return this.processV1Request(request);
  }
  
  private async handleV2Request(request: any): Promise<any> {
    // Handle v2 format with backward compatibility
    const v1Request = this.convertV2ToV1(request);
    const v1Result = await this.processV1Request(v1Request);
    return this.convertV1ToV2(v1Result);
  }
}
```

## Documentation Standards

### API Documentation
```typescript
/**
 * @api {post} /api/v1/messages Send Message
 * @apiName SendMessage
 * @apiGroup Messages
 * @apiVersion 1.0.0
 * 
 * @apiParam {string} content Message content
 * @apiParam {string} roomId Room identifier
 * @apiParam {string} userId User identifier
 * 
 * @apiSuccess {string} id Message identifier
 * @apiSuccess {string} content Processed message content
 * @apiSuccess {string} timestamp ISO timestamp
 * 
 * @apiError {400} ValidationError Invalid message format
 * @apiError {401} Unauthorized Invalid authentication
 * @apiError {500} InternalError Processing failed
 */
```

### Plugin Documentation
```typescript
/**
 * @plugin @elizaos/plugin-name
 * @version 1.0.0
 * @description Plugin description
 * 
 * @method methodName
 * @description Method description
 * @param {ParamType} param Description
 * @returns {Promise<ReturnType>} Description
 * 
 * @example
 * ```typescript
 * const result = await plugin.methodName(params);
 * ```
 */
```

## Testing Standards

### API Testing
```typescript
describe('Message API', () => {
  it('should create message successfully', async () => {
    const message = {
      content: 'Test message',
      roomId: 'room-123',
      userId: 'user-456'
    };
    
    const response = await request(app)
      .post('/api/v1/messages')
      .send(message)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.content).toBe(message.content);
  });
  
  it('should return validation error for invalid message', async () => {
    const invalidMessage = {
      content: '', // Empty content
      roomId: 'invalid-id'
    };
    
    const response = await request(app)
      .post('/api/v1/messages')
      .send(invalidMessage)
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

### Plugin Testing
```typescript
describe('Plugin Integration', () => {
  it('should initialize plugin correctly', async () => {
    const plugin = new TestPlugin(runtime, {
      apiKey: 'test-key',
      endpoint: 'https://api.test.com'
    });
    
    await plugin.initialize();
    
    expect(plugin.isInitialized).toBe(true);
    expect(plugin.config.apiKey).toBe('test-key');
  });
  
  it('should handle plugin errors gracefully', async () => {
    const plugin = new TestPlugin(runtime, {
      apiKey: 'invalid-key'
    });
    
    await expect(plugin.initialize()).rejects.toThrow('Invalid API key');
  });
});
```
