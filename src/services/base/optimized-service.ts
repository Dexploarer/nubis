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
export abstract class OptimizedService extends Service {
  protected metrics: ServiceMetrics;
  protected _config: OptimizedServiceConfig;
  
  // Override base config property to be compatible with Service base class
  get config(): Metadata {
    return this._config as Metadata;
  }
  protected isRunning = false;
  protected isHealthy = true;
  protected restartCount = 0;
  protected healthCheckTimer?: NodeJS.Timeout;
  protected shutdownTimer?: NodeJS.Timeout;

  constructor(
    runtime: IAgentRuntime,
    config: Partial<OptimizedServiceConfig> = {}
  ) {
    super(runtime);
    
    // Initialize metrics
    this.metrics = {
      startTime: 0,
      requestCount: 0,
      errorCount: 0,
      lastRequest: 0,
      averageResponseTime: 0,
      totalResponseTime: 0,
      healthChecks: 0,
      lastHealthCheck: 0,
      uptime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
    };

    // Apply configuration with defaults
    this._config = {
      enabled: true,
      priority: 0,
      timeout: 30000,
      retries: 3,
      logLevel: 'info',
      healthCheckInterval: 30000,
      maxRestartAttempts: 3,
      gracefulShutdown: true,
      shutdownTimeout: 5000,
      enableMetrics: true,
      enableHealthChecks: true,
      ...config,
    };
  }

  /**
   * Start the service with enhanced lifecycle management
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    try {
      // Record start time
      this.metrics.startTime = Date.now();
      
      // Initialize service
      await this.initialize();
      
      // Start health checks if enabled
      if (this._config.enableHealthChecks) {
        this.startHealthChecks();
      }
      
      // Mark as running
      this.isRunning = true;
      this.isHealthy = true;
      
      // Log successful start
      this.log('info', 'Service started successfully');
      
    } catch (error) {
      this.metrics.errorCount++;
      this.log('error', `Failed to start service: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Stop the service with graceful shutdown
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      // Stop health checks
      if (this.healthCheckTimer) {
        clearInterval(this.healthCheckTimer);
        this.healthCheckTimer = undefined;
      }

      // Graceful shutdown if enabled
      if (this._config.gracefulShutdown) {
        await this.gracefulShutdown();
      }

      // Cleanup service
      await this.cleanup();
      
      // Mark as stopped
      this.isRunning = false;
      this.isHealthy = false;
      
      // Calculate final uptime
      this.metrics.uptime = Date.now() - this.metrics.startTime;
      
      // Log successful stop
      this.log('info', 'Service stopped successfully');
      
    } catch (error) {
      this.metrics.errorCount++;
      this.log('error', `Error stopping service: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get service status with health information
   */
  async getStatus(): Promise<ServiceHealth> {
    const now = Date.now();
    
    // Update uptime
    if (this.isRunning) {
      this.metrics.uptime = now - this.metrics.startTime;
    }

    // Update memory usage
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      this.metrics.memoryUsage = memUsage.heapUsed;
    }

    // Determine health status
    let status: ServiceHealth['status'] = 'unknown';
    let message = 'Service status unknown';

    if (!this.isRunning) {
      status = 'unhealthy';
      message = 'Service is not running';
    } else if (this.isHealthy) {
      status = 'healthy';
      message = 'Service is running normally';
    } else {
      status = 'degraded';
      message = 'Service is running but experiencing issues';
    }

    // Perform health checks if enabled
    const checks: ServiceHealth['checks'] = [];
    if (this._config.enableHealthChecks) {
      checks.push(...await this.performHealthChecks());
    }

    return {
      status,
      message,
      timestamp: now,
      metrics: { ...this.metrics },
      checks,
    };
  }

  /**
   * Measure operation performance
   */
  protected async measureOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const start = Date.now();
    
    try {
      const result = await operation();
      
      // Update metrics
      const duration = Date.now() - start;
      this.metrics.requestCount++;
      this.metrics.lastRequest = Date.now();
      this.metrics.totalResponseTime += duration;
      this.metrics.averageResponseTime = this.metrics.totalResponseTime / this.metrics.requestCount;
      
      // Log slow operations
      if (duration > this._config.timeout * 0.8) {
        this.log('warn', `Slow operation detected: ${operationName} took ${duration}ms`);
      }
      
      return result;
      
    } catch (error) {
      this.metrics.errorCount++;
      this.log('error', `Operation failed: ${operationName} - ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Retry operation with exponential backoff
   */
  protected async retryOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries?: number
  ): Promise<T> {
    const retries = maxRetries ?? this._config.retries;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === retries) {
          this.log('error', `Operation failed after ${retries} retries: ${operationName}`);
          throw lastError;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        this.log('warn', `Operation failed, retrying in ${delay}ms: ${operationName}`);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Perform health checks
   */
  protected async performHealthChecks(): Promise<Array<{ name: string; status: 'pass' | 'fail' | 'warn'; message: string; duration: number }>> {
    const checks: Array<{ name: string; status: 'pass' | 'fail' | 'warn'; message: string; duration: number }> = [];
    
    // Basic health check
    checks.push(await this.performBasicHealthCheck());
    
    // Custom health checks
    const customChecks = await this.performCustomHealthChecks();
    checks.push(...customChecks);
    
    // Update health status
    const failedChecks = checks.filter(c => c.status === 'fail');
    const warningChecks = checks.filter(c => c.status === 'warn');
    
    if (failedChecks.length > 0) {
      this.isHealthy = false;
    } else if (warningChecks.length > 0) {
      this.isHealthy = false;
    } else {
      this.isHealthy = true;
    }
    
    return checks;
  }

  /**
   * Basic health check
   */
  private async performBasicHealthCheck(): Promise<{ name: string; status: 'pass' | 'fail' | 'warn'; message: string; duration: number }> {
    const start = Date.now();
    
    try {
      // Check if service is running
      if (!this.isRunning) {
        return {
          name: 'service_running',
          status: 'fail',
          message: 'Service is not running',
          duration: Date.now() - start,
        };
      }

      // Check memory usage
      if (typeof process !== 'undefined' && process.memoryUsage) {
        const memUsage = process.memoryUsage();
        const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
        
        if (heapUsedMB > 1000) { // 1GB threshold
          return {
            name: 'memory_usage',
            status: 'warn',
            message: `High memory usage: ${heapUsedMB.toFixed(2)}MB`,
            duration: Date.now() - start,
          };
        }
      }

      return {
        name: 'basic_health',
        status: 'pass',
        message: 'Service is healthy',
        duration: Date.now() - start,
      };
      
    } catch (error) {
      return {
        name: 'basic_health',
        status: 'fail',
        message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: Date.now() - start,
      };
    }
  }

  /**
   * Custom health checks - override in subclasses
   */
  protected async performCustomHealthChecks(): Promise<Array<{ name: string; status: 'pass' | 'fail' | 'warn'; message: string; duration: number }>> {
    return [];
  }

  /**
   * Start health check timer
   */
  private startHealthChecks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.healthCheckTimer = setInterval(async () => {
      try {
        await this.performHealthChecks();
        this.metrics.healthChecks++;
        this.metrics.lastHealthCheck = Date.now();
      } catch (error) {
        this.log('error', `Health check failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, this._config.healthCheckInterval);
  }

  /**
   * Graceful shutdown
   */
  private async gracefulShutdown(): Promise<void> {
    if (this.shutdownTimer) {
      clearTimeout(this.shutdownTimer);
    }

    return new Promise((resolve, reject) => {
      this.shutdownTimer = setTimeout(() => {
        this.log('warn', 'Graceful shutdown timeout exceeded, forcing shutdown');
        resolve();
      }, this._config.shutdownTimeout);

      // Perform graceful shutdown
      this.performGracefulShutdown()
        .then(() => {
          if (this.shutdownTimer) {
            clearTimeout(this.shutdownTimer);
          }
          resolve();
        })
        .catch(reject);
    });
  }

  /**
   * Perform graceful shutdown - override in subclasses
   */
  protected async performGracefulShutdown(): Promise<void> {
    // Default implementation - can be overridden
    await this.sleep(100); // Small delay for cleanup
  }

  /**
   * Log message with service context
   */
  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, context?: Record<string, any>): void {
    const logData = {
      service: this.constructor.name,
      message,
      timestamp: new Date().toISOString(),
      level,
      ...context,
    };

    // Use console for now, but this could be replaced with a proper logger
    switch (level) {
      case 'debug':
        if (this._config.logLevel === 'debug') {
          console.debug('[DEBUG]', logData);
        }
        break;
      case 'info':
        if (['debug', 'info'].includes(this._config.logLevel)) {
          console.info('[INFO]', logData);
        }
        break;
      case 'warn':
        if (['debug', 'info', 'warn'].includes(this._config.logLevel)) {
          console.warn('[WARN]', logData);
        }
        break;
      case 'error':
        console.error('[ERROR]', logData);
        break;
    }
  }

  /**
   * Sleep utility
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get service metrics
   */
  getMetrics(): ServiceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get service configuration
   */
  getConfig(): OptimizedServiceConfig {
    return { ...this._config };
  }

  /**
   * Update service configuration
   */
  async updateConfig(config: Partial<OptimizedServiceConfig>): Promise<void> {
    // Validate new configuration
    const newConfig = { ...this._config, ...config };
    
    // Apply configuration changes
    this._config = newConfig;
    
    // Restart health checks if interval changed
    if (this._config.enableHealthChecks && this.isRunning) {
      this.startHealthChecks();
    }
    
    this.log('info', 'Service configuration updated', { newConfig });
  }

  /**
   * Abstract methods to be implemented by subclasses
   */
  protected abstract initialize(): Promise<void>;
  protected abstract cleanup(): Promise<void>;
}
