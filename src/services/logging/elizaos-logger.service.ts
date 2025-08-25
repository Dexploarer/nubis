/**
 * ElizaOS Logger Service
 * Following ElizaOS Bootstrap Testing Guide patterns for service implementation
 */

import { Service, Metadata } from '@elizaos/core';
import type { IAgentRuntime, Memory, State } from '@elizaos/core';

export interface LogLevel {
  DEBUG: 0;
  INFO: 1;
  WARN: 2;
  ERROR: 3;
  CRITICAL: 4;
}

export const LOG_LEVELS: LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4
};

export interface LogEntry {
  timestamp: number;
  level: keyof LogLevel;
  message: string;
  context?: Record<string, any>;
  source?: string;
  traceId?: string;
}

export interface LoggerConfig {
  level: keyof LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  maxEntries: number;
  retentionDays: number;
}

export class ElizaOSLoggerService extends Service {
  static serviceType = 'elizaos-logger';
  
  // Implement abstract property
  get capabilityDescription(): string {
    return 'Provides comprehensive logging capabilities for ElizaOS agents';
  }
  
  private _config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private logCount = 0;
  
  // Override base config property to be compatible with Service base class
  override get config(): Metadata {
    return this._config as Metadata;
  }
  
  constructor(protected runtime: IAgentRuntime) {
    super(runtime);
    this._config = {
      level: 'INFO',
      enableConsole: true,
      enableFile: false,
      enableRemote: false,
      maxEntries: 1000,
      retentionDays: 30
    };
  }
  
  static async start(runtime: IAgentRuntime, config?: Partial<LoggerConfig>) {
    const service = new ElizaOSLoggerService(runtime);
    if (config) {
      service.updateConfig(config);
    }
    await service.initialize();
    return service;
  }
  
  static async stop(runtime: IAgentRuntime) {
    const service = runtime.getService(ElizaOSLoggerService.serviceType);
    if (service && service instanceof ElizaOSLoggerService) {
      await service.stop();
    }
  }
  
  private async initialize() {
    this.log('INFO', 'ElizaOS Logger Service initialized', { 
      config: this._config,
      agentId: this.runtime.agentId 
    });
  }
  
  /**
   * Log a message with the specified level
   */
  log(level: keyof LogLevel, message: string, context?: Record<string, any>, source?: string) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context,
      source: source || 'ElizaOSLoggerService',
      traceId: this.generateTraceId()
    };
    
    // Add to buffer
    this.logBuffer.push(entry);
    this.logCount++;
    
    // Maintain buffer size
    if (this.logBuffer.length > this._config.maxEntries) {
      this.logBuffer.shift();
    }
    
    // Output based on configuration
    if (this._config.enableConsole) {
      this.outputToConsole(entry);
    }
    
    // Store in memory for runtime access
    this.storeLogInMemory(entry);
    
    return entry;
  }
  
  /**
   * Convenience methods for different log levels
   */
  debug(message: string, context?: Record<string, any>, source?: string) {
    return this.log('DEBUG', message, context, source);
  }
  
  info(message: string, context?: Record<string, any>, source?: string) {
    return this.log('INFO', message, context, source);
  }
  
  warn(message: string, context?: Record<string, any>, source?: string) {
    return this.log('WARN', message, context, source);
  }
  
  error(message: string, context?: Record<string, any>, source?: string) {
    return this.log('ERROR', message, context, source);
  }
  
  critical(message: string, context?: Record<string, any>, source?: string) {
    return this.log('CRITICAL', message, context, source);
  }
  
  /**
   * Log agent actions and responses
   */
  logAgentAction(action: string, input: string, result: any, context?: Record<string, any>) {
    return this.info(`Agent Action: ${action}`, {
      action,
      input,
      result,
      ...context
    }, 'AgentRuntime');
  }
  
  /**
   * Log memory operations
   */
  logMemoryOperation(operation: string, tableName: string, count: number, context?: Record<string, any>) {
    return this.debug(`Memory Operation: ${operation}`, {
      operation,
      tableName,
      count,
      ...context
    }, 'MemorySystem');
  }
  
  /**
   * Log plugin operations
   */
  logPluginOperation(pluginName: string, operation: string, result: any, context?: Record<string, any>) {
    return this.info(`Plugin Operation: ${pluginName}.${operation}`, {
      pluginName,
      operation,
      result,
      ...context
    }, 'PluginSystem');
  }
  
  /**
   * Log performance metrics
   */
  logPerformance(operation: string, duration: number, context?: Record<string, any>) {
    const level = duration > 1000 ? 'WARN' : duration > 500 ? 'INFO' : 'DEBUG';
    return this.log(level, `Performance: ${operation}`, {
      operation,
      duration,
      ...context
    }, 'PerformanceMonitor');
  }
  
  /**
   * Get recent log entries
   */
  getRecentLogs(count: number = 100, level?: keyof LogLevel): LogEntry[] {
    let logs = [...this.logBuffer];
    
    if (level) {
      logs = logs.filter(log => LOG_LEVELS[log.level] >= LOG_LEVELS[level]);
    }
    
    return logs.slice(-count);
  }
  
  /**
   * Search logs by criteria
   */
  searchLogs(criteria: {
    level?: keyof LogLevel;
    source?: string;
    message?: string;
    startTime?: number;
    endTime?: number;
  }): LogEntry[] {
    return this.logBuffer.filter(log => {
      if (criteria.level && log.level !== criteria.level) return false;
      if (criteria.source && log.source !== criteria.source) return false;
      if (criteria.message && !log.message.includes(criteria.message)) return false;
      if (criteria.startTime && log.timestamp < criteria.startTime) return false;
      if (criteria.endTime && log.timestamp > criteria.endTime) return false;
      return true;
    });
  }
  
  /**
   * Get log statistics
   */
  getLogStats() {
    const stats = {
      total: this.logCount,
      bufferSize: this.logBuffer.length,
      byLevel: {} as Record<keyof LogLevel, number>,
      bySource: {} as Record<string, number>
    };
    
    // Count by level
    for (const level of Object.keys(LOG_LEVELS) as Array<keyof LogLevel>) {
      stats.byLevel[level] = 0;
    }
    
    // Count by source
    for (const log of this.logBuffer) {
      stats.byLevel[log.level]++;
      if (log.source) {
        stats.bySource[log.source] = (stats.bySource[log.source] || 0) + 1;
      }
    }
    
    return stats;
  }
  
  /**
   * Update logger configuration
   */
  updateConfig(newConfig: Partial<LoggerConfig>) {
    this._config = { ...this._config, ...newConfig };
    this.info('Logger configuration updated', { newConfig });
  }
  
  /**
   * Clear log buffer
   */
  clearLogs() {
    const count = this.logBuffer.length;
    this.logBuffer = [];
    this.info(`Log buffer cleared`, { clearedCount: count });
  }
  
  private outputToConsole(entry: LogEntry) {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.level.padEnd(7);
    const source = entry.source?.padEnd(20) || '';
    const message = entry.message;
    
    const logLine = `[${timestamp}] ${level} ${source} ${message}`;
    
    switch (entry.level) {
      case 'DEBUG':
        console.debug(logLine);
        break;
      case 'INFO':
        console.info(logLine);
        break;
      case 'WARN':
        console.warn(logLine);
        break;
      case 'ERROR':
      case 'CRITICAL':
        console.error(logLine);
        if (entry.context) {
          console.error('Context:', entry.context);
        }
        break;
    }
  }
  
  private storeLogInMemory(entry: LogEntry) {
    // Store log entry in memory for runtime access
    // This could be enhanced to store in persistent storage
    try {
      // For now, we'll just keep it in the buffer
      // In a full implementation, this would store to the memory system
    } catch (error) {
      // Don't log logging errors to avoid infinite loops
      console.error('Failed to store log in memory:', error);
    }
  }
  
  private generateTraceId(): string {
    return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  async stop() {
    this.info('ElizaOS Logger Service stopping');
    // Cleanup operations - clear logs without adding new entries
    this.logBuffer = [];
    this.logCount = 0;
  }
}
