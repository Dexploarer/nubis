# ElizaOS Testing Standards

## Test Framework & Tools

### Primary Test Runner
- **Bun**: Primary test runner for all ElizaOS tests
- **Test Framework**: Bun's built-in testing framework with `bun:test`
- **Coverage**: Built-in coverage reporting with Bun
- **Parallel Execution**: Support for parallel test execution

### Test Structure
```typescript
// Import Bun test framework
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';

// Test file structure
describe('ServiceName', () => {
  beforeEach(() => {
    // Setup test environment
  });
  
  afterEach(() => {
    // Cleanup after each test
  });
  
  describe('methodName', () => {
    it('should perform expected behavior', async () => {
      // Test implementation
      const result = await service.method();
      expect(result).toBeDefined();
    });
  });
});
```

## Test Categories

### Unit Tests
```typescript
// Test individual service methods
describe('ElizaOSLoggerService', () => {
  it('should log messages with correct format', async () => {
    const logger = new ElizaOSLoggerService(runtime, {});
    const logEntry = await logger.log('INFO', 'Test message');
    
    expect(logEntry.level).toBe('INFO');
    expect(logEntry.message).toBe('Test message');
    expect(logEntry.timestamp).toBeDefined();
  });
});
```

### Integration Tests
```typescript
// Test service interactions
describe('Plugin Integration', () => {
  it('should initialize plugins correctly', async () => {
    const bootstrap = new PluginBootstrap(runtime);
    await bootstrap.register(testPlugin);
    await bootstrap.initializeAll();
    
    expect(bootstrap.getPlugin(testPlugin.id)).toBeDefined();
    expect(testPlugin.isInitialized).toBe(true);
  });
});
```

### Matrix Tests
```typescript
// Test parameter combinations
describe('Matrix Testing', () => {
  const matrixConfig: MatrixTestConfig = {
    baseScenario: 'test-scenario.yaml',
    matrix: [
      {
        parameter: 'character.llm.model',
        values: ['gpt-4', 'gpt-3.5-turbo']
      },
      {
        parameter: 'character.temperature',
        values: [0.1, 0.7, 1.0]
      }
    ],
    runsPerCombination: 3
  };
  
  it('should run matrix tests successfully', async () => {
    const runner = new MatrixTestingRunner();
    const results = await runner.runMatrixTests(matrixConfig);
    
    expect(results.totalRuns).toBe(18); // 2 models × 3 temperatures × 3 runs
    expect(results.successRate).toBeGreaterThan(0.8);
  });
});
```

## Test Data Management

### Mock Services
```typescript
// Mock external dependencies
class MockRedisService extends Service {
  private data = new Map<string, any>();
  
  async get(key: string): Promise<any> {
    return this.data.get(key);
  }
  
  async set(key: string, value: any): Promise<void> {
    this.data.set(key, value);
  }
  
  async clear(): Promise<void> {
    this.data.clear();
  }
}
```

### Test Fixtures
```typescript
// Reusable test data
const testUser: User = {
  id: 'test-user-id' as UUID,
  name: 'Test User',
  email: 'test@example.com',
  role: UserRole.USER
};

const testMessage: Message = {
  id: 'test-message-id' as UUID,
  content: 'Test message content',
  userId: testUser.id,
  roomId: 'test-room-id' as UUID,
  timestamp: new Date().toISOString()
};
```

## Scenario Testing

### Scenario Configuration
```yaml
# test-scenario.yaml
name: 'Test Message Processing'
description: 'Tests that messages are processed correctly'
plugins:
  - name: '@elizaos/plugin-bootstrap'
    enabled: true
environment:
  type: local
  setup:
    mocks:
      - service: 'redis'
        method: 'get'
        response: 'cached-data'
run:
  - name: 'Process user message'
    input: 'Hello, how are you?'
evaluations:
  - type: 'string_contains'
    value: 'Hello'
  - type: 'execution_time'
    max_ms: 1000
```

### Scenario Execution
```typescript
describe('Scenario Testing', () => {
  it('should execute scenario successfully', async () => {
    const scenario = await loadScenario('test-scenario.yaml');
    const runner = new ScenarioRunner();
    const result = await runner.execute(scenario);
    
    expect(result.success).toBe(true);
    expect(result.evaluations.every(e => e.passed)).toBe(true);
  });
});
```

## Performance Testing

### Execution Time Validation
```typescript
describe('Performance Tests', () => {
  it('should process message within time limit', async () => {
    const startTime = Date.now();
    const result = await messageService.processMessage(testMessage);
    const executionTime = Date.now() - startTime;
    
    expect(executionTime).toBeLessThan(1000); // 1 second limit
    expect(result).toBeDefined();
  });
  
  it('should handle concurrent requests', async () => {
    const concurrentRequests = 10;
    const promises = Array(concurrentRequests).fill(null).map(() =>
      messageService.processMessage(testMessage)
    );
    
    const results = await Promise.all(promises);
    expect(results).toHaveLength(concurrentRequests);
    expect(results.every(r => r.success)).toBe(true);
  });
});
```

### Memory Usage Testing
```typescript
describe('Memory Tests', () => {
  it('should not leak memory during operations', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Perform operations
    for (let i = 0; i < 100; i++) {
      await memoryService.storeMemory(testMemory);
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (less than 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});
```

## Load Testing

### Concurrent Execution Testing
```typescript
describe('Load Tests', () => {
  it('should handle high concurrent load', async () => {
    const concurrentUsers = 50;
    const requestsPerUser = 10;
    
    const userPromises = Array(concurrentUsers).fill(null).map(async (_, userIndex) => {
      const userRequests = Array(requestsPerUser).fill(null).map(async (_, requestIndex) => {
        const message = {
          ...testMessage,
          content: `Message ${requestIndex} from user ${userIndex}`
        };
        return await messageService.processMessage(message);
      });
      
      return Promise.all(userRequests);
    });
    
    const allResults = await Promise.all(userPromises);
    const totalRequests = allResults.flat().length;
    
    expect(totalRequests).toBe(concurrentUsers * requestsPerUser);
    expect(allResults.flat().every(r => r.success)).toBe(true);
  });
});
```

## Coverage Requirements

### Coverage Standards
- **Minimum Coverage**: 80% for all production code
- **Critical Paths**: 100% coverage for authentication, authorization, and data processing
- **Plugin Code**: 90% coverage for all plugin implementations
- **Service Layer**: 85% coverage for all service methods

### Coverage Reporting
```typescript
// Run tests with coverage
bun test --coverage

// Generate coverage report
bun test --coverage --reporter=html
```

## Test Environment Setup

### Test Configuration
```typescript
// test-config.ts
export const testConfig = {
  redis: {
    host: 'localhost',
    port: 6379,
    database: 15 // Use separate database for tests
  },
  database: {
    url: 'postgresql://test:test@localhost:5432/elizaos_test'
  },
  logging: {
    level: 'error', // Reduce log noise during tests
    output: 'test.log'
  }
};
```

### Test Utilities
```typescript
// test-utils.ts
export class TestUtils {
  static async createTestUser(): Promise<User> {
    return {
      id: crypto.randomUUID() as UUID,
      name: `Test User ${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      role: UserRole.USER
    };
  }
  
  static async cleanupTestData(): Promise<void> {
    // Clean up test data after tests
    await redisClient.flushdb();
  }
  
  static mockTime(date: Date): void {
    jest.useFakeTimers();
    jest.setSystemTime(date);
  }
}
```

## Continuous Integration

### CI Pipeline Tests
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test
      - run: bun test --coverage
```

### Pre-commit Hooks
```json
// package.json
{
  "scripts": {
    "pre-commit": "bun test && bun run lint",
    "test:watch": "bun test --watch",
    "test:coverage": "bun test --coverage"
  }
}
```

## Test Documentation

### Test Documentation Standards
```typescript
/**
 * Tests the ElizaOS message processing pipeline
 * 
 * @group integration
 * @group message-processing
 */
describe('Message Processing Pipeline', () => {
  /**
   * Verifies that messages are processed and stored correctly
   * 
   * @test
   * @scenario User sends a message
   * @expected Message is processed and stored in memory
   */
  it('should process and store messages', async () => {
    // Test implementation
  });
});
```

### Test Case Naming
- Use descriptive test names that explain the scenario
- Follow the pattern: "should [expected behavior] when [condition]"
- Include the method name and expected outcome
- Use consistent terminology across test files

## Error Testing

### Error Handling Tests
```typescript
describe('Error Handling', () => {
  it('should handle database connection errors gracefully', async () => {
    // Mock database failure
    jest.spyOn(databaseService, 'connect').mockRejectedValue(new Error('Connection failed'));
    
    const service = new MessageService(runtime, {});
    
    await expect(service.initialize()).rejects.toThrow('Connection failed');
  });
  
  it('should retry failed operations', async () => {
    const mockOperation = jest.fn()
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockResolvedValueOnce('Success');
    
    const result = await retryOperation(mockOperation, { maxRetries: 3 });
    
    expect(result).toBe('Success');
    expect(mockOperation).toHaveBeenCalledTimes(2);
  });
});
```

## Test Maintenance

### Test Data Cleanup
```typescript
describe('Test Cleanup', () => {
  afterAll(async () => {
    // Clean up all test data
    await TestUtils.cleanupTestData();
    await databaseService.disconnect();
    await redisService.disconnect();
  });
});
```

### Test Isolation
```typescript
describe('Isolated Tests', () => {
  beforeEach(async () => {
    // Each test gets a fresh environment
    await TestUtils.setupTestEnvironment();
  });
  
  afterEach(async () => {
    // Clean up after each test
    await TestUtils.cleanupTestEnvironment();
  });
});
```
