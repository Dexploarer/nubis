import { logger } from "@elizaos/core";

/**
 * NUBI Agent Hub Core
 *
 * This file exports all the core services, bots, and functionality
 * that make up the NUBI agent system.
 */

// Bot Services
export { default as DiscordBotService } from "./bots/discord-bot";
export { default as TelegramBotService } from "./bots/telegram-bot";
// Character and Plugin System
export { character } from "./character";
// Configuration
export { default as env } from "./config/environment";
// Main Project Agent
export { default as project, projectAgent } from "./index";
export { default as starterPlugin } from "./plugin";
// Raid System
export * from "./raids/telegram-raids";
export { default as AppService } from "./services/app-service";
export { BotManager, botManager } from "./services/bot-manager";
// Core Services
export { default as DatabaseService } from "./services/database";

/**
 * NUBI Service Manager
 *
 * Centralized service management for the NUBI agent system
 */
export class NUBIServiceManager {
	private static instance: NUBIServiceManager;
	private services: Map<string, unknown> = new Map();
	private isInitialized = false;

	private constructor() {}

	public static getInstance(): NUBIServiceManager {
		if (!NUBIServiceManager.instance) {
			NUBIServiceManager.instance = new NUBIServiceManager();
		}
		return NUBIServiceManager.instance;
	}

	public async initialize(): Promise<void> {
		if (this.isInitialized) return;

		try {
			// Note: SQL plugin should already be initialized by this point
			// as projectAgent.init() is called before serviceManager.initialize() in main.ts

			// Initialize database service
			const { DatabaseService } = await import("./services/database");
			const dbService = new DatabaseService();
			this.services.set("database", dbService);

			// Bot services are now managed by the centralized BotManager
			// No need to initialize them here to prevent conflicts
			logger.info("[CORE] Bot services will be managed by BotManager");

			// Initialize raid system
			const { EnhancedTelegramRaidsService } = await import(
				"./raids/telegram-raids/elizaos-enhanced-telegram-raids"
			);
			const raidsService = new EnhancedTelegramRaidsService(
				{} as Record<string, unknown>,
			);
			this.services.set("raids", raidsService);

			this.isInitialized = true;
		} catch (error) {
			throw new Error(`Failed to initialize NUBI services: ${error}`);
		}
	}

	public getService<T>(name: string): T | undefined {
		return this.services.get(name) as T;
	}

	public getAllServices(): Map<string, unknown> {
		return new Map(this.services);
	}

	public isServiceAvailable(name: string): boolean {
		return this.services.has(name);
	}

	public async shutdown(): Promise<void> {
		for (const [name, service] of this.services) {
			try {
				if (service.stop && typeof service.stop === "function") {
					await service.stop();
				}
				if (service.shutdown && typeof service.shutdown === "function") {
					await service.shutdown();
				}
			} catch (error) {
				console.error(`Error shutting down service ${name}:`, error);
			}
		}
		this.services.clear();
		this.isInitialized = false;
	}
}

// Export the service manager instance
export const serviceManager = NUBIServiceManager.getInstance();
