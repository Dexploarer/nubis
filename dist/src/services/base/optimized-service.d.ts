import type { IAgentRuntime } from "@elizaos/core";
import { Service, Metadata } from "@elizaos/core";
/**
 * Service Metrics Interface
 */
export interface ServiceMetrics {
    startTime: number;
    requestCount: number;
    errorCount: number;
    lastRequest: number;
    averageResponseTime: number;
    totalResponseTime: number;
    healthChecks: number;
    lastHealthCheck: number;
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
}
/**
 * Service Health Status
 */
export interface ServiceHealth {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    message: string;
    timestamp: number;
    metrics: ServiceMetrics;
    checks: Array<{
        name: string;
        status: 'pass' | 'fail' | 'warn';
        message: string;
        duration: number;
    }>;
}
/**
 * Service Configuration
 */
export interface OptimizedServiceConfig {
    enabled: boolean;
    priority: number;
    timeout: number;
    retries: number;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    healthCheckInterval: number;
    maxRestartAttempts: number;
    gracefulShutdown: boolean;
    shutdownTimeout: number;
    enableMetrics: boolean;
    enableHealthChecks: boolean;
    metadata?: Record<string, any>;
}
/**
 * Optimized Service Base Class
 * Extends the base Service class with performance monitoring and lifecycle management
 */
export declare abstract class OptimizedService extends Service {
    protected metrics: ServiceMetrics;
    protected _config: OptimizedServiceConfig;
    get config(): Metadata;
    protected isRunning: boolean;
    protected isHealthy: boolean;
    protected restartCount: number;
    protected healthCheckTimer?: NodeJS.Timeout;
    protected shutdownTimer?: NodeJS.Timeout;
    constructor(runtime: IAgentRuntime, config?: Partial<OptimizedServiceConfig>);
    /**
     * Start the service with enhanced lifecycle management
     */
    start(): Promise<void>;
    /**
     * Stop the service with graceful shutdown
     */
    stop(): Promise<void>;
    /**
     * Get service status with health information
     */
    getStatus(): Promise<ServiceHealth>;
    /**
     * Measure operation performance
     */
    protected measureOperation<T>(operation: () => Promise<T>, operationName: string): Promise<T>;
    /**
     * Retry operation with exponential backoff
     */
    protected retryOperation<T>(operation: () => Promise<T>, operationName: string, maxRetries?: number): Promise<T>;
    /**
     * Perform health checks
     */
    protected performHealthChecks(): Promise<Array<{
        name: string;
        status: 'pass' | 'fail' | 'warn';
        message: string;
        duration: number;
    }>>;
    /**
     * Basic health check
     */
    private performBasicHealthCheck;
    /**
     * Custom health checks - override in subclasses
     */
    protected performCustomHealthChecks(): Promise<Array<{
        name: string;
        status: 'pass' | 'fail' | 'warn';
        message: string;
        duration: number;
    }>>;
    /**
     * Start health check timer
     */
    private startHealthChecks;
    /**
     * Graceful shutdown
     */
    private gracefulShutdown;
    /**
     * Perform graceful shutdown - override in subclasses
     */
    protected performGracefulShutdown(): Promise<void>;
    /**
     * Log message with service context
     */
    protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, context?: Record<string, any>): void;
    /**
     * Sleep utility
     */
    protected sleep(ms: number): Promise<void>;
    /**
     * Get service metrics
     */
    getMetrics(): ServiceMetrics;
    /**
     * Get service configuration
     */
    getConfig(): OptimizedServiceConfig;
    /**
     * Update service configuration
     */
    updateConfig(config: Partial<OptimizedServiceConfig>): Promise<void>;
    /**
     * Abstract methods to be implemented by subclasses
     */
    protected abstract initialize(): Promise<void>;
    protected abstract cleanup(): Promise<void>;
}
