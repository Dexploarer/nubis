/**
 * Redis Message Bus Service
 * =========================
 *
 * Replaces the in-memory EventTarget-based message bus for multi-process deployments.
 * Follows ElizaOS patterns for distributed message handling.
 *
 * This service implements Redis Pub/Sub to replace the in-memory bus.ts:5-6
 * when deploying across multiple processes or servers.
 */
import { RedisManager } from '../../utils/redis-config';
/**
 * Message bus event handler type
 */
export type MessageBusHandler = (message: any) => void | Promise<void>;
/**
 * Message bus event type
 */
export interface MessageBusEvent {
    type: string;
    data: any;
    timestamp: number;
    source: string;
    metadata?: Record<string, any>;
}
/**
 * Redis Message Bus Service
 * Provides distributed message bus functionality using Redis Pub/Sub
 */
export declare class RedisMessageBusService {
    private redisManager;
    private handlers;
    private isInitialized;
    private serviceId;
    private channelPrefix;
    constructor(serviceId: string, channelPrefix?: string);
    /**
     * Initialize the Redis message bus service
     */
    initialize(redisManager: RedisManager): Promise<void>;
    /**
     * Subscribe to a specific event type
     * @param eventType The event type to subscribe to
     * @param handler The handler function for the event
     */
    subscribe(eventType: string, handler: MessageBusHandler): Promise<void>;
    /**
     * Unsubscribe from a specific event type
     * @param eventType The event type to unsubscribe from
     * @param handler The specific handler to remove (optional)
     */
    unsubscribe(eventType: string, handler?: MessageBusHandler): Promise<void>;
    /**
     * Publish an event to all subscribers
     * @param eventType The event type to publish
     * @param data The event data
     * @param metadata Additional metadata for the event
     */
    publish(eventType: string, data: any, metadata?: Record<string, any>): Promise<number>;
    /**
     * Handle incoming messages from Redis
     * @param message The incoming message
     */
    private handleIncomingMessage;
    /**
     * Get list of active event types
     */
    getActiveEventTypes(): string[];
    /**
     * Get handler count for a specific event type
     */
    getHandlerCount(eventType: string): number;
    /**
     * Check if service is initialized
     */
    isServiceInitialized(): boolean;
    /**
     * Get service statistics
     */
    getStats(): {
        isInitialized: boolean;
        activeEventTypes: number;
        totalHandlers: number;
        serviceId: string;
        channelPrefix: string;
    };
    /**
     * Cleanup and shutdown the service
     */
    shutdown(): Promise<void>;
}
/**
 * Get or create global Redis Message Bus Service
 */
export declare function getGlobalRedisMessageBus(serviceId?: string): RedisMessageBusService | null;
/**
 * Initialize global Redis Message Bus Service
 */
export declare function initializeGlobalRedisMessageBus(redisManager: RedisManager, serviceId: string): Promise<void>;
/**
 * Cleanup global Redis Message Bus Service
 */
export declare function cleanupGlobalRedisMessageBus(): Promise<void>;
export default RedisMessageBusService;
