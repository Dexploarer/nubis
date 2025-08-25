import { logger } from "@elizaos/core";
import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";
import env from "../config/environment";

export class DatabaseService {
	private supabaseClient: ReturnType<typeof createClient>;
	private postgresPool: Pool;
	private isConnected = false;

	constructor() {
		this.initializeSupabase();
		// Make PostgreSQL connection optional - only initialize if DATABASE_URL is provided
		if (
			env.DATABASE_URL &&
			env.DATABASE_URL !==
				"postgresql://postgres:[YOUR_PASSWORD]@db.nfnmoqepgjyutcbbaqjg.supabase.co:5432/postgres"
		) {
			this.initializePostgres();
		} else {
			logger.info(
				"[DATABASE] PostgreSQL connection skipped - no valid DATABASE_URL provided",
			);
		}
	}

	private initializeSupabase() {
		try {
			this.supabaseClient = createClient(
				env.SUPABASE_URL,
				env.SUPABASE_SERVICE_ROLE_KEY,
				{
					auth: {
						autoRefreshToken: false,
						persistSession: false,
					},
				},
			);
			logger.info("[DATABASE] Supabase client initialized");
		} catch (error) {
			logger.error("[DATABASE] Failed to initialize Supabase client:", error);
		}
	}

	private initializePostgres() {
		try {
			this.postgresPool = new Pool({
				connectionString: env.DATABASE_URL,
				max: 20,
				idleTimeoutMillis: 30000,
				connectionTimeoutMillis: 2000,
			});

			// Test connection
			this.testPostgresConnection();
		} catch (error) {
			logger.error("[DATABASE] Failed to initialize PostgreSQL pool:", error);
		}
	}

	private async testPostgresConnection() {
		try {
			const client = await this.postgresPool.connect();
			const result = await client.query("SELECT NOW()");
			client.release();

			this.isConnected = true;
			logger.info(
				"[DATABASE] PostgreSQL connection successful:",
				result.rows[0],
			);
		} catch (error) {
			logger.error("[DATABASE] PostgreSQL connection failed:", error);
			this.isConnected = false;
		}
	}

	public async testSupabaseConnection() {
		try {
			// Use a simple health check instead of querying a non-existent table
			const { data, error } = await this.supabaseClient.rpc("version");

			if (error) {
				// If RPC version doesn't exist, try a simple auth check
				const { data: authData, error: authError } =
					await this.supabaseClient.auth.getSession();

				if (authError) {
					logger.error("[DATABASE] Supabase connection error:", authError);
					return false;
				}

				logger.info(
					"[DATABASE] Supabase connection successful (auth verified)",
				);
				return true;
			}

			logger.info(
				"[DATABASE] Supabase connection successful (RPC version:",
				data,
				")",
			);
			return true;
		} catch (error) {
			logger.error("[DATABASE] Supabase connection failed:", error);
			return false;
		}
	}

	public getSupabaseClient() {
		return this.supabaseClient;
	}

	public getPostgresPool() {
		return this.postgresPool;
	}

	public isPostgresConnected() {
		return this.isConnected;
	}

	public async healthCheck() {
		const supabaseStatus = await this.testSupabaseConnection();
		const postgresStatus = this.isPostgresConnected();

		return {
			supabase: supabaseStatus,
			postgres: postgresStatus,
			overall: supabaseStatus && postgresStatus,
		};
	}

	public async closeConnections() {
		if (this.postgresPool) {
			await this.postgresPool.end();
			logger.info("[DATABASE] PostgreSQL connections closed");
		}
	}
}

export default DatabaseService;
