import { type IAgentRuntime, logger, Service } from "@elizaos/core";
import { Pool, type PoolClient, type QueryResult } from "pg";

export enum PoolType {
	DEFAULT = "default",
	TRANSACTION = "transaction",
	SESSION = "session",
}

export interface PoolConfig {
	poolType: PoolType;
	timeout?: number;
}

export class DatabasePoolerManager extends Service {
	static serviceType = "database-pooler-manager" as const;
	capabilityDescription =
		"Manages database connection pools for optimized access";

	private pools: Map<PoolType, Pool> = new Map();
	protected runtime: IAgentRuntime;

	constructor(runtime: IAgentRuntime) {
		super();
		this.runtime = runtime;
	}

	async initialize(): Promise<void> {
		try {
			// Initialize default pool
			const defaultPool = new Pool({
				connectionString: this.runtime.getSetting("DATABASE_URL"),
				max: 20,
				idleTimeoutMillis: 30000,
				connectionTimeoutMillis: 2000,
			});
			this.pools.set(PoolType.DEFAULT, defaultPool);

			// Initialize transaction pool (optimized for short-lived operations)
			const transactionPool = new Pool({
				connectionString: this.runtime.getSetting("DATABASE_URL"),
				max: 10,
				idleTimeoutMillis: 10000,
				connectionTimeoutMillis: 1000,
			});
			this.pools.set(PoolType.TRANSACTION, transactionPool);

			// Initialize session pool (optimized for longer operations)
			const sessionPoolUrl =
				this.runtime.getSetting("SUPABASE_SESSION_POOLER_URL") ||
				this.runtime.getSetting("DATABASE_URL");
			const sessionPool = new Pool({
				connectionString: sessionPoolUrl,
				max: 5,
				idleTimeoutMillis: 60000,
				connectionTimeoutMillis: 5000,
			});
			this.pools.set(PoolType.SESSION, sessionPool);

			logger.info(
				"[DATABASE_POOLER] All database pools initialized successfully",
			);
		} catch (error) {
			logger.error(
				"[DATABASE_POOLER] Failed to initialize database pools:",
				error instanceof Error ? error.message : String(error),
			);
			throw error;
		}
	}

	async stop(): Promise<void> {
		await this.cleanup();
	}

	/**
	 * Execute a query using the specified pool
	 */
	async query(
		text: string,
		params: unknown[] = [],
		config: Partial<PoolConfig> = {},
	): Promise<QueryResult> {
		const poolType = config.poolType || PoolType.DEFAULT;
		const pool = this.pools.get(poolType);

		if (!pool) {
			throw new Error(`Pool type ${poolType} not initialized`);
		}

		try {
			return await pool.query(text, params);
		} catch (error) {
			logger.error(
				`[DATABASE_POOLER] Query error in ${poolType} pool:`,
				error instanceof Error ? error.message : String(error),
			);
			throw error;
		}
	}

	/**
	 * Execute multiple queries in a transaction
	 */
	async transaction<T>(
		operations: Array<{ sql: string; params: unknown[] }>,
		config: Partial<PoolConfig> = {},
	): Promise<T[]> {
		const poolType = config.poolType || PoolType.TRANSACTION;
		const pool = this.pools.get(poolType);

		if (!pool) {
			throw new Error(`Pool type ${poolType} not initialized`);
		}

		const client = await pool.connect();
		try {
			await client.query("BEGIN");

			const results: T[] = [];
			for (const op of operations) {
				const result = await client.query(op.sql, op.params);
				results.push(result.rows as T);
			}

			await client.query("COMMIT");
			return results;
		} catch (error) {
			await client.query("ROLLBACK");
			logger.error(
				`[DATABASE_POOLER] Transaction error in ${poolType} pool:`,
				error instanceof Error ? error.message : String(error),
			);
			throw error;
		} finally {
			client.release();
		}
	}

	/**
	 * Get a client from the specified pool
	 */
	async getClient(poolType: PoolType = PoolType.DEFAULT): Promise<PoolClient> {
		const pool = this.pools.get(poolType);

		if (!pool) {
			throw new Error(`Pool type ${poolType} not initialized`);
		}

		return await pool.connect();
	}

	/**
	 * Check health of all pools
	 */
	async healthCheck(): Promise<Record<PoolType, boolean>> {
		const health: Record<PoolType, boolean> = {
			[PoolType.DEFAULT]: false,
			[PoolType.TRANSACTION]: false,
			[PoolType.SESSION]: false,
		};

		for (const [type, pool] of this.pools.entries()) {
			try {
				const client = await pool.connect();
				const result = await client.query("SELECT 1");
				client.release();
				health[type] = result.rowCount === 1;
			} catch (error) {
				logger.error(
					`[DATABASE_POOLER] Health check failed for ${type} pool:`,
					error instanceof Error ? error.message : String(error),
				);
				health[type] = false;
			}
		}

		return health;
	}

	/**
	 * Close all pool connections
	 */
	async cleanup(): Promise<void> {
		for (const [type, pool] of this.pools.entries()) {
			try {
				await pool.end();
				logger.info(`[DATABASE_POOLER] ${type} pool connections closed`);
			} catch (error) {
				logger.error(
					`[DATABASE_POOLER] Error closing ${type} pool:`,
					error instanceof Error ? error.message : String(error),
				);
			}
		}
		this.pools.clear();
	}
}
