import type { IAgentRuntime } from "@elizaos/core";
import { z } from 'zod';
/**
 * Service Builder Pattern
 * Provides a fluent interface for constructing and configuring services
 */
export declare const ServiceConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    priority: z.ZodDefault<z.ZodNumber>;
    timeout: z.ZodDefault<z.ZodNumber>;
    retries: z.ZodDefault<z.ZodNumber>;
    logLevel: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    priority: number;
    logLevel: "info" | "debug" | "warn" | "error";
    enabled: boolean;
    timeout: number;
    retries: number;
    metadata?: Record<string, any> | undefined;
}, {
    priority?: number | undefined;
    metadata?: Record<string, any> | undefined;
    logLevel?: "info" | "debug" | "warn" | "error" | undefined;
    enabled?: boolean | undefined;
    timeout?: number | undefined;
    retries?: number | undefined;
}>;
export declare const ServiceLifecycleSchema: z.ZodObject<{
    autoStart: z.ZodDefault<z.ZodBoolean>;
    autoStop: z.ZodDefault<z.ZodBoolean>;
    gracefulShutdown: z.ZodDefault<z.ZodBoolean>;
    shutdownTimeout: z.ZodDefault<z.ZodNumber>;
    healthCheckInterval: z.ZodDefault<z.ZodNumber>;
    maxRestartAttempts: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    autoStart: boolean;
    autoStop: boolean;
    gracefulShutdown: boolean;
    shutdownTimeout: number;
    healthCheckInterval: number;
    maxRestartAttempts: number;
}, {
    autoStart?: boolean | undefined;
    autoStop?: boolean | undefined;
    gracefulShutdown?: boolean | undefined;
    shutdownTimeout?: number | undefined;
    healthCheckInterval?: number | undefined;
    maxRestartAttempts?: number | undefined;
}>;
export declare const ServiceDependencySchema: z.ZodObject<{
    name: z.ZodString;
    version: z.ZodOptional<z.ZodString>;
    required: z.ZodDefault<z.ZodBoolean>;
    timeout: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    required: boolean;
    timeout?: number | undefined;
    version?: string | undefined;
}, {
    name: string;
    timeout?: number | undefined;
    version?: string | undefined;
    required?: boolean | undefined;
}>;
export type ServiceConfig = z.infer<typeof ServiceConfigSchema>;
export type ServiceLifecycle = z.infer<typeof ServiceLifecycleSchema>;
export type ServiceDependency = z.infer<typeof ServiceDependencySchema>;
export interface ServiceDefinition {
    name: string;
    type: string;
    config: ServiceConfig;
    lifecycle: ServiceLifecycle;
    dependencies: ServiceDependency[];
    factory: (runtime: IAgentRuntime, config: ServiceConfig) => Promise<any>;
    metadata?: Record<string, any>;
}
export declare class ServiceBuilder<T = any> {
    private definition;
    private config;
    private lifecycle;
    private dependencies;
    /**
     * Set the service name
     */
    name(name: string): this;
    /**
     * Set the service type
     */
    type(type: string): this;
    /**
     * Configure basic service settings
     */
    withConfig(config: Partial<ServiceConfig>): this;
    /**
     * Set service priority
     */
    priority(priority: number): this;
    /**
     * Set timeout for service operations
     */
    timeout(timeout: number): this;
    /**
     * Set retry attempts
     */
    retries(retries: number): this;
    /**
     * Set log level
     */
    logLevel(level: "debug" | "info" | "warn" | "error"): this;
    /**
     * Configure lifecycle behavior
     */
    withLifecycle(lifecycle: Partial<ServiceLifecycle>): this;
    /**
     * Set auto-start behavior
     */
    autoStart(enabled: boolean): this;
    /**
     * Set graceful shutdown behavior
     */
    gracefulShutdown(enabled: boolean): this;
    /**
     * Set health check interval
     */
    healthCheckInterval(interval: number): this;
    /**
     * Add a service dependency
     */
    dependsOn(dependency: ServiceDependency): this;
    /**
     * Add multiple dependencies
     */
    dependsOnAll(dependencies: ServiceDependency[]): this;
    /**
     * Set the service factory function
     */
    factory<TFactory>(factory: (runtime: IAgentRuntime, config: ServiceConfig) => Promise<TFactory>): ServiceBuilder<TFactory>;
    /**
     * Add metadata to the service
     */
    withMetadata(metadata: Record<string, any>): this;
    /**
     * Build the service definition
     */
    build(): ServiceDefinition;
    /**
     * Build and validate the service definition
     */
    buildAndValidate(): ServiceDefinition;
}
export declare class ServiceRegistryBuilder {
    private services;
    /**
     * Add a service to the registry
     */
    addService(service: ServiceDefinition): this;
    /**
     * Add multiple services
     */
    addServices(services: ServiceDefinition[]): this;
    /**
     * Build the service registry
     */
    build(): ServiceDefinition[];
    /**
     * Validate all services in the registry
     */
    validate(): {
        valid: ServiceDefinition[];
        errors: Array<{
            service: string;
            error: string;
        }>;
    };
}
export declare const ServiceBuilderUtils: {
    /**
     * Create a basic service builder
     */
    create<T = any>(name: string, type: string): ServiceBuilder<T>;
    /**
     * Create a high-priority service builder
     */
    createHighPriority<T = any>(name: string, type: string): ServiceBuilder<T>;
    /**
     * Create a low-priority service builder
     */
    createLowPriority<T = any>(name: string, type: string): ServiceBuilder<T>;
    /**
     * Create a service builder with common defaults
     */
    createWithDefaults<T = any>(name: string, type: string, defaults: Partial<ServiceConfig>): ServiceBuilder<T>;
};
