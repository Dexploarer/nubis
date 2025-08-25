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
import { logger } from '@elizaos/core';

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
export class RedisMessageBusService {
  private redisManager: RedisManager | null = null;
  private handlers: Map<string, Set<MessageBusHandler>> = new Map();
  private isInitialized = false;
  private serviceId: string;
  private channelPrefix: string;

  constructor(serviceId: string, channelPrefix: string = 'elizaos:bus:') {
    this.serviceId = serviceId;
    this.channelPrefix = channelPrefix;
  }

  /**
   * Initialize the Redis message bus service
   */
  async initialize(redisManager: RedisManager): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.redisManager = redisManager;
    
    try {
      // Subscribe to the general message channel
      await this.redisManager.subscribe(`${this.channelPrefix}*`, this.handleIncomingMessage.bind(this));
      
      this.isInitialized = true;
      logger.info(`Redis Message Bus Service initialized for service: ${this.serviceId}`);
    } catch (error) {
      logger.error(`Failed to initialize Redis Message Bus Service: ${error.message}`);
      throw error;
    }
  }

  /**
   * Subscribe to a specific event type
   * @param eventType The event type to subscribe to
   * @param handler The handler function for the event
   */
  async subscribe(eventType: string, handler: MessageBusHandler): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Redis Message Bus Service not initialized');
    }

    // Add handler to local map
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    // Subscribe to Redis channel for this event type
    const channel = `${this.channelPrefix}${eventType}`;
    await this.redisManager!.subscribe(channel, this.handleIncomingMessage.bind(this));

    logger.debug(`Subscribed to event type: ${eventType} on channel: ${channel}`);
  }

  /**
   * Unsubscribe from a specific event type
   * @param eventType The event type to unsubscribe from
   * @param handler The specific handler to remove (optional)
   */
  async unsubscribe(eventType: string, handler?: MessageBusHandler): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    if (handler) {
      // Remove specific handler
      const eventHandlers = this.handlers.get(eventType);
      if (eventHandlers) {
        eventHandlers.delete(handler);
        if (eventHandlers.size === 0) {
          this.handlers.delete(eventType);
        }
      }
    } else {
      // Remove all handlers for this event type
      this.handlers.delete(eventType);
    }

    // Unsubscribe from Redis channel if no more handlers
    if (!this.handlers.has(eventType)) {
      const channel = `${this.channelPrefix}${eventType}`;
      await this.redisManager!.unsubscribe(channel);
      logger.debug(`Unsubscribed from event type: ${eventType} on channel: ${channel}`);
    }
  }

  /**
   * Publish an event to all subscribers
   * @param eventType The event type to publish
   * @param data The event data
   * @param metadata Additional metadata for the event
   */
  async publish(eventType: string, data: any, metadata?: Record<string, any>): Promise<number> {
    if (!this.isInitialized) {
      throw new Error('Redis Message Bus Service not initialized');
    }

    const event: MessageBusEvent = {
      type: eventType,
      data,
      timestamp: Date.now(),
      source: this.serviceId,
      metadata
    };

    const channel = `${this.channelPrefix}${eventType}`;
    const subscriberCount = await this.redisManager!.publish(channel, event);

    logger.debug(`Published event ${eventType} to ${subscriberCount} subscribers on channel: ${channel}`);
    return subscriberCount;
  }

  /**
   * Handle incoming messages from Redis
   * @param message The incoming message
   */
  private async handleIncomingMessage(message: any): Promise<void> {
    try {
      // Skip messages from self
      if (message.source === this.serviceId) {
        return;
      }

      const eventType = message.type;
      const handlers = this.handlers.get(eventType);

      if (handlers && handlers.size > 0) {
        logger.debug(`Processing event ${eventType} with ${handlers.size} handlers`);
        
        // Execute all handlers for this event type
        const promises = Array.from(handlers).map(async (handler) => {
          try {
            await handler(message);
          } catch (error) {
            logger.error(`Error in message bus handler for event ${eventType}: ${error.message}`);
          }
        });

        await Promise.all(promises);
      }
    } catch (error) {
      logger.error(`Error handling incoming message: ${error.message}`);
    }
  }

  /**
   * Get list of active event types
   */
  getActiveEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get handler count for a specific event type
   */
  getHandlerCount(eventType: string): number {
    const handlers = this.handlers.get(eventType);
    return handlers ? handlers.size : 0;
  }

  /**
   * Check if service is initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get service statistics
   */
  getStats(): {
    isInitialized: boolean;
    activeEventTypes: number;
    totalHandlers: number;
    serviceId: string;
    channelPrefix: string;
  } {
    let totalHandlers = 0;
    for (const handlers of this.handlers.values()) {
      totalHandlers += handlers.size;
    }

    return {
      isInitialized: this.isInitialized,
      activeEventTypes: this.handlers.size,
      totalHandlers,
      serviceId: this.serviceId,
      channelPrefix: this.channelPrefix
    };
  }

  /**
   * Cleanup and shutdown the service
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Unsubscribe from all channels
      for (const eventType of this.handlers.keys()) {
        const channel = `${this.channelPrefix}${eventType}`;
        await this.redisManager!.unsubscribe(channel);
      }

      // Clear local handlers
      this.handlers.clear();
      this.isInitialized = false;

      logger.info(`Redis Message Bus Service shutdown for service: ${this.serviceId}`);
    } catch (error) {
      logger.error(`Error during Redis Message Bus Service shutdown: ${error.message}`);
    }
  }
}

/**
 * Global Redis Message Bus Service instance
 */
let globalRedisMessageBus: RedisMessageBusService | null = null;

/**
 * Get or create global Redis Message Bus Service
 */
export function getGlobalRedisMessageBus(serviceId?: string): RedisMessageBusService | null {
  if (!globalRedisMessageBus && serviceId) {
    globalRedisMessageBus = new RedisMessageBusService(serviceId);
  }
  return globalRedisMessageBus;
}

/**
 * Initialize global Redis Message Bus Service
 */
export async function initializeGlobalRedisMessageBus(
  redisManager: RedisManager, 
  serviceId: string
): Promise<void> {
  const messageBus = getGlobalRedisMessageBus(serviceId);
  if (messageBus) {
    await messageBus.initialize(redisManager);
  }
}

/**
 * Cleanup global Redis Message Bus Service
 */
export async function cleanupGlobalRedisMessageBus(): Promise<void> {
  if (globalRedisMessageBus) {
    await globalRedisMessageBus.shutdown();
    globalRedisMessageBus = null;
  }
}

export default RedisMessageBusService;
