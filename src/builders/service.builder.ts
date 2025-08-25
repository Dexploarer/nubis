import type { IAgentRuntime } from "@elizaos/core";
import { z } from 'zod';

/**
 * Service Builder Pattern
 * Provides a fluent interface for constructing and configuring services
 */

// Service configuration schemas
export const ServiceConfigSchema = z.object({
  enabled: z.boolean().default(true),
  priority: z.number().min(-1000).max(1000).default(0),
  timeout: z.number().positive().default(30000),
  retries: z.number().int().min(0).max(10).default(3),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  metadata: z.record(z.any()).optional(),
});

export const ServiceLifecycleSchema = z.object({
  autoStart: z.boolean().default(true),
  autoStop: z.boolean().default(true),
  gracefulShutdown: z.boolean().default(true),
  shutdownTimeout: z.number().positive().default(5000),
  healthCheckInterval: z.number().positive().default(30000),
  maxRestartAttempts: z.number().int().min(0).max(10).default(3),
});

export const ServiceDependencySchema = z.object({
  name: z.string(),
  version: z.string().optional(),
  required: z.boolean().default(true),
  timeout: z.number().positive().optional(),
});

export type ServiceConfig = z.infer<typeof ServiceConfigSchema>;
export type ServiceLifecycle = z.infer<typeof ServiceLifecycleSchema>;
export type ServiceDependency = z.infer<typeof ServiceDependencySchema>;

// Service definition interface
export interface ServiceDefinition {
  name: string;
  type: string;
  config: ServiceConfig;
  lifecycle: ServiceLifecycle;
  dependencies: ServiceDependency[];
  factory: (runtime: IAgentRuntime, config: ServiceConfig) => Promise<any>;
  metadata?: Record<string, any>;
}

// Service builder class
export class ServiceBuilder<T = any> {
  private definition: Partial<ServiceDefinition> = {};
  private config: Partial<ServiceConfig> = {};
  private lifecycle: Partial<ServiceLifecycle> = {};
  private dependencies: ServiceDependency[] = [];

  /**
   * Set the service name
   */
  name(name: string): this {
    this.definition.name = name;
    return this;
  }

  /**
   * Set the service type
   */
  type(type: string): this {
    this.definition.type = type;
    return this;
  }

  /**
   * Configure basic service settings
   */
  withConfig(config: Partial<ServiceConfig>): this {
    this.config = { ...this.config, ...config };
    return this;
  }

  /**
   * Set service priority
   */
  priority(priority: number): this {
    this.config.priority = priority;
    return this;
  }

  /**
   * Set timeout for service operations
   */
  timeout(timeout: number): this {
    this.config.timeout = timeout;
    return this;
  }

  /**
   * Set retry attempts
   */
  retries(retries: number): this {
    this.config.retries = retries;
    return this;
  }

  /**
   * Set log level
   */
  logLevel(level: "debug" | "info" | "warn" | "error"): this {
    this.config.logLevel = level;
    return this;
  }

  /**
   * Configure lifecycle behavior
   */
  withLifecycle(lifecycle: Partial<ServiceLifecycle>): this {
    this.lifecycle = { ...this.lifecycle, ...lifecycle };
    return this;
  }

  /**
   * Set auto-start behavior
   */
  autoStart(enabled: boolean): this {
    this.lifecycle.autoStart = enabled;
    return this;
  }

  /**
   * Set graceful shutdown behavior
   */
  gracefulShutdown(enabled: boolean): this {
    this.lifecycle.gracefulShutdown = enabled;
    return this;
  }

  /**
   * Set health check interval
   */
  healthCheckInterval(interval: number): this {
    this.lifecycle.healthCheckInterval = interval;
    return this;
  }

  /**
   * Add a service dependency
   */
  dependsOn(dependency: ServiceDependency): this {
    this.dependencies.push(dependency);
    return this;
  }

  /**
   * Add multiple dependencies
   */
  dependsOnAll(dependencies: ServiceDependency[]): this {
    this.dependencies.push(...dependencies);
    return this;
  }

  /**
   * Set the service factory function
   */
  factory<TFactory>(
    factory: (runtime: IAgentRuntime, config: ServiceConfig) => Promise<TFactory>
  ): ServiceBuilder<TFactory> {
    this.definition.factory = factory;
    return this as ServiceBuilder<TFactory>;
  }

  /**
   * Add metadata to the service
   */
  withMetadata(metadata: Record<string, any>): this {
    this.definition.metadata = metadata;
    return this;
  }

  /**
   * Build the service definition
   */
  build(): ServiceDefinition {
    // Validate required fields
    if (!this.definition.name) {
      throw new Error("Service name is required");
    }
    if (!this.definition.type) {
      throw new Error("Service type is required");
    }
    if (!this.definition.factory) {
      throw new Error("Service factory is required");
    }

    // Apply default configurations
    const finalConfig = ServiceConfigSchema.parse({
      ...this.config,
    });

    const finalLifecycle = ServiceLifecycleSchema.parse({
      ...this.lifecycle,
    });

    return {
      name: this.definition.name,
      type: this.definition.type,
      config: finalConfig,
      lifecycle: finalLifecycle,
      dependencies: this.dependencies,
      factory: this.definition.factory,
      metadata: this.definition.metadata,
    };
  }

  /**
   * Build and validate the service definition
   */
  buildAndValidate(): ServiceDefinition {
    const definition = this.build();
    
    // Validate dependencies
    for (const dep of definition.dependencies) {
      ServiceDependencySchema.parse(dep);
    }

    return definition;
  }
}

// Service registry builder for managing multiple services
export class ServiceRegistryBuilder {
  private services: ServiceDefinition[] = [];

  /**
   * Add a service to the registry
   */
  addService(service: ServiceDefinition): this {
    this.services.push(service);
    return this;
  }

  /**
   * Add multiple services
   */
  addServices(services: ServiceDefinition[]): this {
    this.services.push(...services);
    return this;
  }

  /**
   * Build the service registry
   */
  build(): ServiceDefinition[] {
    // Sort services by priority (highest first)
    return this.services.sort((a, b) => b.config.priority - a.config.priority);
  }

  /**
   * Validate all services in the registry
   */
  validate(): { valid: ServiceDefinition[]; errors: Array<{ service: string; error: string }> } {
    const valid: ServiceDefinition[] = [];
    const errors: Array<{ service: string; error: string }> = [];

    for (const service of this.services) {
      try {
        // Validate config
        ServiceConfigSchema.parse(service.config);
        
        // Validate lifecycle
        ServiceLifecycleSchema.parse(service.lifecycle);
        
        // Validate dependencies
        for (const dep of service.dependencies) {
          ServiceDependencySchema.parse(dep);
        }

        valid.push(service);
      } catch (error) {
        errors.push({
          service: service.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { valid, errors };
  }
}

// Utility functions for common service patterns
export const ServiceBuilderUtils = {
  /**
   * Create a basic service builder
   */
  create<T = any>(name: string, type: string): ServiceBuilder<T> {
    return new ServiceBuilder<T>().name(name).type(type);
  },

  /**
   * Create a high-priority service builder
   */
  createHighPriority<T = any>(name: string, type: string): ServiceBuilder<T> {
    return new ServiceBuilder<T>()
      .name(name)
      .type(type)
      .priority(100);
  },

  /**
   * Create a low-priority service builder
   */
  createLowPriority<T = any>(name: string, type: string): ServiceBuilder<T> {
    return new ServiceBuilder<T>()
      .name(name)
      .type(type)
      .priority(-100);
  },

  /**
   * Create a service builder with common defaults
   */
  createWithDefaults<T = any>(
    name: string, 
    type: string, 
    defaults: Partial<ServiceConfig>
  ): ServiceBuilder<T> {
    return new ServiceBuilder<T>()
      .name(name)
      .type(type)
      .withConfig(defaults);
  },
};
