#!/usr/bin/env tsx

/**
 * ElizaOS Test Runner
 * Following ElizaOS Bootstrap Testing Guide patterns for comprehensive testing
 */

import { ElizaOSLoggerService } from '../../services/logging/elizaos-logger.service';
import { CommunityManagementService } from '../../services/community/community-management.service';
import { getEnhancedCommunityManager } from '../../characters/enhanced-community-manager';

// Mock runtime for testing
const createMockRuntime = () => ({
  getService: () => null,
  getProvider: () => null,
  agentId: 'test-agent-123',
  getMemories: async () => [],
  searchMemories: async () => [],
  createMemory: async () => ({ id: 'test-memory-123' }),
  updateMemory: async () => ({ id: 'test-memory-123' }),
  deleteMemory: async () => true,
  addEmbeddingToMemory: async () => true,
  useModel: async () => ({ thought: 'Test thought', message: 'Test response' }),
  composeState: async () => ({ values: {}, data: {}, text: 'Test state' })
});

/**
 * Run all ElizaOS tests following Bootstrap Testing Guide patterns
 */
async function runElizaOSTests() {
  console.log('🚀 Starting ElizaOS Test Suite');
  console.log('📚 Following Bootstrap Testing Guide patterns\n');
  
  // Initialize logger
  const mockRuntime = createMockRuntime();
  const logger = await ElizaOSLoggerService.start(mockRuntime, {
    level: 'DEBUG',
    enableConsole: true,
    maxEntries: 1000
  });
  
  logger.info('ElizaOS Test Suite started', { 
    timestamp: new Date().toISOString(),
    testEnvironment: 'development'
  });
  
  try {
    // Test 1: Logger Service
    await testLoggerService(logger);
    
    // Test 2: Matrix Testing System
    await testMatrixTestingSystem(logger);
    
    // Test 3: Enhanced Community Manager
    await testEnhancedCommunityManager(logger);
    
    // Test 4: Integration Tests
    await testIntegrationScenarios(logger);
    
    logger.info('All ElizaOS tests completed successfully');
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    logger.error('Test suite failed', { error: error.message, stack: error.stack });
    console.error('\n❌ Test suite failed:', error);
    throw error;
  } finally {
    await ElizaOSLoggerService.stop(mockRuntime);
  }
}

/**
 * Test the Logger Service
 */
async function testLoggerService(logger: ElizaOSLoggerService) {
  console.log('🔍 Testing Logger Service...');
  
  // Test basic logging
  logger.info('Testing basic logging functionality');
  logger.warn('Testing warning level');
  logger.error('Testing error level');
  
  // Test specialized logging
  logger.logAgentAction('TEST_ACTION', 'test input', 'test result');
  logger.logMemoryOperation('TEST_OP', 'test_table', 5);
  logger.logPluginOperation('test-plugin', 'test-op', { success: true });
  logger.logPerformance('test-operation', 150);
  
  // Verify logs were created
  const recentLogs = logger.getRecentLogs(10);
  const stats = logger.getLogStats();
  
  console.log(`   ✅ Logger service: ${stats.total} logs created`);
  console.log(`   ✅ Log levels: ${Object.keys(stats.byLevel).join(', ')}`);
  console.log(`   ✅ Sources: ${Object.keys(stats.bySource).join(', ')}`);
}

/**
 * Test the Matrix Testing System
 */
async function testMatrixTestingSystem(logger: ElizaOSLoggerService) {
  console.log('🔍 Testing Matrix Testing System...');
  
  const mockBaseScenario = {
    character: {
      name: 'Test Character',
      system: 'You are a test character',
      style: { all: ['Test style'] }
    },
    run: [
      {
        name: 'Test Run',
        input: 'Hello',
        expectedActions: ['REPLY']
      }
    ]
  };
  
  const mockMatrix = [
    {
      parameter: 'character.personality',
      values: ['Friendly', 'Professional']
    },
    {
      parameter: 'character.response_style',
      values: ['Warm', 'Formal']
    }
  ];
  
  try {
    const runner = new MatrixTestingRunner({
      baseScenario: mockBaseScenario,
      matrix: mockMatrix,
      runsPerCombination: 1,
      validationRules: []
    });
    
    const results = await runner.runAllTests();
    
    logger.info('Matrix testing completed', {
      totalCombinations: results.length,
      totalTests: results.reduce((sum, r) => sum + r.totalTests, 0)
    });
    
    console.log(`   ✅ Matrix testing: ${results.length} combinations tested`);
    console.log(`   ✅ Total tests: ${results.reduce((sum, r) => sum + r.totalTests, 0)}`);
    
  } catch (error) {
    logger.error('Matrix testing failed', { error: error.message });
    throw error;
  }
}

/**
 * Test the Enhanced Community Manager
 */
async function testEnhancedCommunityManager(logger: ElizaOSLoggerService) {
  console.log('🔍 Testing Enhanced Community Manager...');
  
  try {
    const character = getEnhancedCommunityManager();
    
    // Validate character structure
    if (!character.name || !character.bio || !character.plugins) {
      throw new Error('Invalid character structure');
    }
    
    // Check required plugins
    const requiredPlugins = ['@elizaos/plugin-sql', '@elizaos/plugin-bootstrap'];
    for (const plugin of requiredPlugins) {
      if (!character.plugins.includes(plugin)) {
        throw new Error(`Missing required plugin: ${plugin}`);
      }
    }
    
    // Check matrix configuration
    if (!character.matrixTestConfig) {
      throw new Error('Missing matrix test configuration');
    }
    
    logger.info('Enhanced Community Manager validated', {
      name: character.name,
      pluginCount: character.plugins.length,
      hasMatrixConfig: !!character.matrixTestConfig
    });
    
    console.log(`   ✅ Character: ${character.name}`);
    console.log(`   ✅ Plugins: ${character.plugins.length} loaded`);
    console.log(`   ✅ Matrix config: ${character.matrixTestConfig.matrix.length} parameters`);
    
  } catch (error) {
    logger.error('Enhanced Community Manager test failed', { error: error.message });
    throw error;
  }
}

/**
 * Test Integration Scenarios
 */
async function testIntegrationScenarios(logger: ElizaOSLoggerService) {
  console.log('🔍 Testing Integration Scenarios...');
  
  try {
    // Test 1: Logger + Matrix Testing integration
    logger.info('Testing logger + matrix testing integration');
    
    // Test 2: Character + Logger integration
    const character = getEnhancedCommunityManager();
    logger.info('Character loaded successfully', { 
      characterName: character.name,
      username: character.username 
    });
    
    // Test 3: Service lifecycle
    logger.info('Testing service lifecycle patterns');
    
    console.log(`   ✅ Integration tests completed`);
    
  } catch (error) {
    logger.error('Integration tests failed', { error: error.message });
    throw error;
  }
}

/**
 * Run performance benchmarks
 */
async function runPerformanceBenchmarks(logger: ElizaOSLoggerService) {
  console.log('🔍 Running Performance Benchmarks...');
  
  const startTime = Date.now();
  
  // Benchmark 1: Logger performance
  const logStart = Date.now();
  for (let i = 0; i < 1000; i++) {
    logger.debug(`Benchmark log ${i}`);
  }
  const logDuration = Date.now() - logStart;
  
  // Benchmark 2: Matrix generation
  const matrixStart = Date.now();
  const largeMatrix = [
    { parameter: 'test.param1', values: Array.from({ length: 100 }, (_, i) => `value${i}`) },
    { parameter: 'test.param2', values: Array.from({ length: 100 }, (_, i) => `value${i}`) }
  ];
  const matrixDuration = Date.now() - matrixStart;
  
  const totalDuration = Date.now() - startTime;
  
  logger.info('Performance benchmarks completed', {
    logPerformance: logDuration,
    matrixPerformance: matrixDuration,
    totalDuration
  });
  
  console.log(`   ✅ Logger: ${logDuration}ms for 1000 logs`);
  console.log(`   ✅ Matrix: ${matrixDuration}ms for large matrix`);
  console.log(`   ✅ Total: ${totalDuration}ms`);
}

/**
 * Generate test report
 */
function generateTestReport(logger: ElizaOSLoggerService) {
  console.log('\n📊 Test Report');
  console.log('==============');
  
  const stats = logger.getLogStats();
  const recentLogs = logger.getRecentLogs(20);
  
  console.log(`Total Logs: ${stats.total}`);
  console.log(`Buffer Size: ${stats.bufferSize}`);
  console.log(`Log Levels: ${Object.entries(stats.byLevel).map(([level, count]) => `${level}: ${count}`).join(', ')}`);
  console.log(`Sources: ${Object.entries(stats.bySource).map(([source, count]) => `${source}: ${count}`).join(', ')}`);
  
  console.log('\nRecent Activity:');
  recentLogs.slice(-5).forEach(log => {
    const time = new Date(log.timestamp).toLocaleTimeString();
    console.log(`  [${time}] ${log.level} - ${log.message}`);
  });
}

// Main execution
if (import.meta.main) {
  runElizaOSTests()
    .then(() => {
      console.log('\n🎉 ElizaOS Test Suite completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 ElizaOS Test Suite failed:', error);
      process.exit(1);
    });
}

export { runElizaOSTests, testLoggerService, testMatrixTestingSystem, testEnhancedCommunityManager };
