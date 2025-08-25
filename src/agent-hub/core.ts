import { logger } from "@elizaos/core";

/**
 * NUBI Agent Hub Core
 *
 * This file exports all the core services and functionality
 * that make up the NUBI agent system.
 */

// Character and Plugin System
export { character } from "./character";
// Configuration
export { default as env } from "./config/environment";
// Main Project Agent
export { default as project, projectAgent } from "./index";
export { default as starterPlugin } from "./plugin";
// Core Services
export { default as AppService } from "./services/app-service";
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

			// Bot services are now handled by their respective plugins
			logger.info("[CORE] Bot services will be managed by their respective plugins");

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
				if (service && typeof service === "object" && service !== null) {
					if ("stop" in service && typeof (service as any).stop === "function") {
						await (service as any).stop();
					}
					if ("shutdown" in service && typeof (service as any).shutdown === "function") {
						await (service as any).shutdown();
					}
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
