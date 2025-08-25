/**
 * ElizaOS Logger Service Tests
 * Following ElizaOS Bootstrap Testing Guide patterns
 */

import { describe, it, expect, beforeEach, mock, afterEach } from 'bun:test';
import { ElizaOSLoggerService, LOG_LEVELS, type LoggerConfig } from '../../services/logging/elizaos-logger.service';

// Mock console methods to capture output
const mockConsole = {
  debug: mock(() => {}),
  info: mock(() => {}),
  warn: mock(() => {}),
  error: mock(() => {}),
};

describe('ElizaOS Logger Service', () => {
  let logger: ElizaOSLoggerService;
  let mockRuntime: any;

  beforeEach(() => {
    // Mock runtime
    mockRuntime = {
      getService: mock(() => null),
      getProvider: mock(() => null),
      agentId: 'test-agent-123'
    };

    // Create logger instance
    logger = new ElizaOSLoggerService(mockRuntime);

    // Mock console methods
    globalThis.console.debug = mockConsole.debug;
    globalThis.console.info = mockConsole.info;
    globalThis.console.warn = mockConsole.warn;
    globalThis.console.error = mockConsole.error;
  });

  afterEach(() => {
    // Reset mocks
    mockConsole.debug.mockReset();
    mockConsole.info.mockReset();
    mockConsole.warn.mockReset();
    mockConsole.error.mockReset();
  });

  describe('Service Initialization', () => {
    it('should initialize with default configuration', () => {
      expect(logger).toBeDefined();
      expect(logger['config'].level).toBe('INFO');
      expect(logger['config'].enableConsole).toBe(true);
      expect(logger['config'].maxEntries).toBe(1000);
    });

    it('should have correct service type and description', () => {
      expect(ElizaOSLoggerService.serviceType).toBe('elizaos-logger');
      const logger = new ElizaOSLoggerService(mockRuntime);
      expect(logger.capabilityDescription).toBe('Provides comprehensive logging capabilities for ElizaOS agents');
    });
  });

  describe('Logging Methods', () => {
    it('should log debug messages correctly', () => {
      const entry = logger.debug('Debug message', { test: true });
      
      expect(entry.level).toBe('DEBUG');
      expect(entry.message).toBe('Debug message');
      expect(entry.context).toEqual({ test: true });
      expect(entry.timestamp).toBeGreaterThan(0);
      expect(entry.traceId).toMatch(/^trace-\d+-\w+$/);
    });

    it('should log info messages correctly', () => {
      const entry = logger.info('Info message', { data: 'test' });
      
      expect(entry.level).toBe('INFO');
      expect(entry.message).toBe('Info message');
      expect(entry.context).toEqual({ data: 'test' });
    });

    it('should log warning messages correctly', () => {
      const entry = logger.warn('Warning message', { warning: true });
      
      expect(entry.level).toBe('WARN');
      expect(entry.message).toBe('Warning message');
      expect(entry.context).toEqual({ warning: true });
    });

    it('should log error messages correctly', () => {
      const entry = logger.error('Error message', { error: 'test error' });
      
      expect(entry.level).toBe('ERROR');
      expect(entry.message).toBe('Error message');
      expect(entry.context).toEqual({ error: 'test error' });
    });

    it('should log critical messages correctly', () => {
      const entry = logger.critical('Critical message', { critical: true });
      
      expect(entry.level).toBe('CRITICAL');
      expect(entry.message).toBe('Critical message');
      expect(entry.context).toEqual({ critical: true });
    });
  });

  describe('Console Output', () => {
    it('should output debug messages to console', () => {
      logger.debug('Debug test');
      
      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG')
      );
    });

    it('should output info messages to console', () => {
      logger.info('Info test');
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO')
      );
    });

    it('should output warning messages to console', () => {
      logger.warn('Warning test');
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('WARN')
      );
    });

    it('should output error messages to console', () => {
      logger.error('Error test');
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR')
      );
    });

    it('should output critical messages to console', () => {
      logger.critical('Critical test');
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('CRITICAL')
      );
    });
  });

  describe('Log Buffer Management', () => {
    it('should maintain log buffer size', () => {
      // Add more logs than maxEntries
      for (let i = 0; i < 1100; i++) {
        logger.info(`Log entry ${i}`);
      }
      
      expect(logger['logBuffer'].length).toBeLessThanOrEqual(1000);
      expect(logger['logCount']).toBe(1100);
    });

    it('should store logs in buffer', () => {
      logger.info('Test message');
      
      expect(logger['logBuffer']).toHaveLength(1);
      expect(logger['logBuffer'][0].message).toBe('Test message');
    });
  });

  describe('Specialized Logging Methods', () => {
    it('should log agent actions correctly', () => {
      const entry = logger.logAgentAction('REPLY', 'Hello', 'Response sent');
      
      expect(entry.message).toContain('Agent Action: REPLY');
      expect(entry.source).toBe('AgentRuntime');
      expect(entry.context).toHaveProperty('action', 'REPLY');
      expect(entry.context).toHaveProperty('input', 'Hello');
      expect(entry.context).toHaveProperty('result', 'Response sent');
    });

    it('should log memory operations correctly', () => {
      const entry = logger.logMemoryOperation('CREATE', 'messages', 5);
      
      expect(entry.message).toContain('Memory Operation: CREATE');
      expect(entry.source).toBe('MemorySystem');
      expect(entry.context).toHaveProperty('operation', 'CREATE');
      expect(entry.context).toHaveProperty('tableName', 'messages');
      expect(entry.context).toHaveProperty('count', 5);
    });

    it('should log plugin operations correctly', () => {
      const entry = logger.logPluginOperation('test-plugin', 'execute', { success: true });
      
      expect(entry.message).toContain('Plugin Operation: test-plugin.execute');
      expect(entry.source).toBe('PluginSystem');
      expect(entry.context).toHaveProperty('pluginName', 'test-plugin');
      expect(entry.context).toHaveProperty('operation', 'execute');
      expect(entry.context).toHaveProperty('result', { success: true });
    });

    it('should log performance metrics correctly', () => {
      const fastEntry = logger.logPerformance('fast-operation', 100);
      const slowEntry = logger.logPerformance('slow-operation', 1500);
      
      expect(fastEntry.level).toBe('DEBUG');
      expect(slowEntry.level).toBe('WARN');
    });
  });

  describe('Log Retrieval and Search', () => {
    beforeEach(() => {
      // Add some test logs
      logger.info('Test info message');
      logger.warn('Test warning message');
      logger.error('Test error message');
      logger.debug('Test debug message');
    });

    it('should get recent logs', () => {
      const recent = logger.getRecentLogs(2);
      
      expect(recent).toHaveLength(2);
      expect(recent[recent.length - 1].message).toBe('Test debug message');
    });

    it('should filter logs by level', () => {
      const warnings = logger.getRecentLogs(100, 'WARN');
      
      expect(warnings.every(log => LOG_LEVELS[log.level] >= LOG_LEVELS.WARN)).toBe(true);
    });

    it('should search logs by criteria', () => {
      const results = logger.searchLogs({ message: 'warning' });
      
      expect(results).toHaveLength(1);
      expect(results[0].message).toBe('Test warning message');
    });

    it('should search logs by source', () => {
      const results = logger.searchLogs({ source: 'ElizaOSLoggerService' });
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(log => log.source === 'ElizaOSLoggerService')).toBe(true);
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration', () => {
      const newConfig: Partial<LoggerConfig> = {
        level: 'DEBUG',
        maxEntries: 500
      };
      
      logger.updateConfig(newConfig);
      
      expect(logger['config'].level).toBe('DEBUG');
      expect(logger['config'].maxEntries).toBe(500);
    });

    it('should maintain existing configuration when updating', () => {
      const originalMaxEntries = logger['config'].maxEntries;
      
      logger.updateConfig({ level: 'WARN' });
      
      expect(logger['config'].level).toBe('WARN');
      expect(logger['config'].maxEntries).toBe(originalMaxEntries);
    });

    it('should clear logs correctly', () => {
      // Add some logs first
      logger.info('Test message 1');
      logger.info('Test message 2');
      
      expect(logger['logBuffer']).toHaveLength(2);
      
      // Clear logs
      logger.clearLogs();
      
      // After clearing, there should be 1 log entry (the "logs cleared" message)
      expect(logger['logBuffer']).toHaveLength(1);
      expect(logger['logBuffer'][0].message).toContain('Log buffer cleared');
      expect(logger['logCount']).toBe(3); // 2 original + 1 clear message
    });
  });

  describe('Statistics and Metrics', () => {
    beforeEach(() => {
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      logger.debug('Debug message');
    });

    it('should provide accurate log statistics', () => {
      const stats = logger.getLogStats();
      
      expect(stats.total).toBeGreaterThanOrEqual(4);
      expect(stats.bufferSize).toBeGreaterThanOrEqual(4);
      expect(stats.byLevel.INFO).toBeGreaterThan(0);
      expect(stats.byLevel.WARN).toBeGreaterThan(0);
      expect(stats.byLevel.ERROR).toBeGreaterThan(0);
      expect(stats.byLevel.DEBUG).toBeGreaterThan(0);
    });

    it('should count logs by source', () => {
      const stats = logger.getLogStats();
      
      expect(stats.bySource['ElizaOSLoggerService']).toBeGreaterThan(0);
    });
  });

  describe('Service Lifecycle', () => {
    it('should start and stop correctly', async () => {
      const startedLogger = await ElizaOSLoggerService.start(mockRuntime);
      
      expect(startedLogger).toBeDefined();
      expect(startedLogger).toBeInstanceOf(ElizaOSLoggerService);
      
      await ElizaOSLoggerService.stop(mockRuntime);
    });

    it('should handle stop gracefully', async () => {
      await logger.stop();
      
      // Should clear logs and log the stop action
      expect(logger['logBuffer']).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid log levels gracefully', () => {
      // This should not throw
      expect(() => {
        (logger as any).log('INVALID_LEVEL', 'test');
      }).not.toThrow();
    });

    it('should generate unique trace IDs', () => {
      const entry1 = logger.info('Message 1');
      const entry2 = logger.info('Message 2');
      
      expect(entry1.traceId).not.toBe(entry2.traceId);
      expect(entry1.traceId).toMatch(/^trace-\d+-\w+$/);
      expect(entry2.traceId).toMatch(/^trace-\d+-\w+$/);
    });
  });

  describe('Integration with ElizaOS Patterns', () => {
    it('should follow ElizaOS service patterns', () => {
      // Should extend Service class
      expect(logger).toBeInstanceOf(ElizaOSLoggerService);
      
      // Should have static start/stop methods
      expect(typeof ElizaOSLoggerService.start).toBe('function');
      expect(typeof ElizaOSLoggerService.stop).toBe('function');
      
      // Should have service type
      expect(ElizaOSLoggerService.serviceType).toBeDefined();
    });

    it('should provide comprehensive logging capabilities', () => {
      // Should support all log levels
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.critical).toBe('function');
      
      // Should support specialized logging
      expect(typeof logger.logAgentAction).toBe('function');
      expect(typeof logger.logMemoryOperation).toBe('function');
      expect(typeof logger.logPluginOperation).toBe('function');
      expect(typeof logger.logPerformance).toBe('function');
    });
  });
});
