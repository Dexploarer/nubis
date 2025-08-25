import { logger } from "@elizaos/core";
import env from "../config/environment";
import DatabaseService from "./database";

export class AppService {
	private databaseService: DatabaseService;
	private isInitialized = false;

	constructor() {
		this.databaseService = new DatabaseService();
	}

	public async initialize() {
		try {
			logger.info("[APP] Initializing NUBI application...");

			// Initialize database connections
			await this.initializeDatabase();

			this.isInitialized = true;
			logger.info("[APP] NUBI application initialized successfully");

			// Start health monitoring
			this.startHealthMonitoring();
		} catch (error) {
			logger.error("[APP] Failed to initialize application:", error);
			throw error;
		}
	}

	private async initializeDatabase() {
		logger.info("[APP] Initializing database connections...");

		try {
			const health = await this.databaseService.healthCheck();

			if (health.overall) {
				logger.info("[APP] All database connections successful");
			} else {
				logger.warn("[APP] Some database connections failed:", JSON.stringify(health));
			}
		} catch (error) {
			logger.error("[APP] Database initialization error:", error);
			// Continue with partial initialization
		}
	}

	private startHealthMonitoring() {
		// Monitor health every 30 seconds
		setInterval(async () => {
			try {
				const dbHealth = await this.databaseService.healthCheck();

				const overallHealth = dbHealth.overall;

				if (!overallHealth) {
					logger.warn("[APP] Health check failed:", JSON.stringify({
						database: dbHealth,
					}));
				} else {
					logger.debug("[APP] Health check passed");
				}
			} catch (error) {
				logger.error("[APP] Health check error:", error);
			}
		}, 30000);
	}

	public async getStatus() {
		try {
			const dbHealth = await this.databaseService.healthCheck();

			return {
				application: {
					initialized: this.isInitialized,
					uptime: process.uptime(),
					version: process.env.npm_package_version || "1.0.0",
					environment: env.NODE_ENV,
				},
				services: {
					database: dbHealth,
				},
				features: {
					communityMemory: env.ENABLE_COMMUNITY_MEMORY,
					emotionalIntelligence: env.ENABLE_EMOTIONAL_INTELLIGENCE,
					antiDetection: env.ENABLE_ANTI_DETECTION,
				},
			};
		} catch (error) {
			logger.error("[APP] Status check error:", error);
			return {
				error: "Failed to get status",
				timestamp: new Date().toISOString(),
			};
		}
	}

	public async shutdown() {
		logger.info("[APP] Shutting down NUBI application...");

		try {
			// Close database connections
			await this.databaseService.closeConnections();

			logger.info("[APP] Application shutdown completed");
		} catch (error) {
			logger.error("[APP] Shutdown error:", error);
		}
	}

	public getDatabaseService() {
		return this.databaseService;
	}

	public isReady() {
		return this.isInitialized;
	}
}

export default AppService;
