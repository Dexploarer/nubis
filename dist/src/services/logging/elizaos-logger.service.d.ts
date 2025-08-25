/**
 * ElizaOS Logger Service
 * Following ElizaOS Bootstrap Testing Guide patterns for service implementation
 */
import { Service, Metadata } from '@elizaos/core';
import type { IAgentRuntime } from '@elizaos/core';
export interface LogLevel {
    DEBUG: 0;
    INFO: 1;
    WARN: 2;
    ERROR: 3;
    CRITICAL: 4;
}
export declare const LOG_LEVELS: LogLevel;
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
export declare class ElizaOSLoggerService extends Service {
    protected runtime: IAgentRuntime;
    static serviceType: string;
    get capabilityDescription(): string;
    private _config;
    private logBuffer;
    private logCount;
    get config(): Metadata;
    constructor(runtime: IAgentRuntime);
    static start(runtime: IAgentRuntime, config?: Partial<LoggerConfig>): Promise<ElizaOSLoggerService>;
    static stop(runtime: IAgentRuntime): Promise<void>;
    private initialize;
    /**
     * Log a message with the specified level
     */
    log(level: keyof LogLevel, message: string, context?: Record<string, any>, source?: string): LogEntry;
    /**
     * Convenience methods for different log levels
     */
    debug(message: string, context?: Record<string, any>, source?: string): LogEntry;
    info(message: string, context?: Record<string, any>, source?: string): LogEntry;
    warn(message: string, context?: Record<string, any>, source?: string): LogEntry;
    error(message: string, context?: Record<string, any>, source?: string): LogEntry;
    critical(message: string, context?: Record<string, any>, source?: string): LogEntry;
    /**
     * Log agent actions and responses
     */
    logAgentAction(action: string, input: string, result: any, context?: Record<string, any>): LogEntry;
    /**
     * Log memory operations
     */
    logMemoryOperation(operation: string, tableName: string, count: number, context?: Record<string, any>): LogEntry;
    /**
     * Log plugin operations
     */
    logPluginOperation(pluginName: string, operation: string, result: any, context?: Record<string, any>): LogEntry;
    /**
     * Log performance metrics
     */
    logPerformance(operation: string, duration: number, context?: Record<string, any>): LogEntry;
    /**
     * Get recent log entries
     */
    getRecentLogs(count?: number, level?: keyof LogLevel): LogEntry[];
    /**
     * Search logs by criteria
     */
    searchLogs(criteria: {
        level?: keyof LogLevel;
        source?: string;
        message?: string;
        startTime?: number;
        endTime?: number;
    }): LogEntry[];
    /**
     * Get log statistics
     */
    getLogStats(): {
        total: number;
        bufferSize: number;
        byLevel: Record<keyof LogLevel, number>;
        bySource: Record<string, number>;
    };
    /**
     * Update logger configuration
     */
    updateConfig(newConfig: Partial<LoggerConfig>): void;
    /**
     * Clear log buffer
     */
    clearLogs(): void;
    private outputToConsole;
    private storeLogInMemory;
    private generateTraceId;
    stop(): Promise<void>;
}
