import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables
dotenv.config();

// Environment variable schema for validation
const envSchema = z.object({
	// Database Configuration
	DATABASE_URL: z.string().url(),
	PGLITE_DATA_DIR: z.string().optional(),
	ELIZAOS_DATABASE_TYPE: z.enum(["postgresql", "sqlite"]).default("postgresql"),
	ELIZAOS_FORCE_SQL_PLUGIN: z
		.string()
		.transform((val) => val === "true")
		.default("true"),

	// Supabase Configuration
	SUPABASE_URL: z.string().url(),
	SUPABASE_ANON_KEY: z.string(),
	SUPABASE_SERVICE_ROLE_KEY: z.string(),
	SUPABASE_TRANSACTION_POOLER_URL: z.string().url(),
	SUPABASE_SESSION_POOLER_URL: z.string().url(),

	// NUBI API Configuration
	NUBI_API_KEY: z.string(),

	// Edge Functions
	EDGE_FUNCTIONS_ENABLED: z
		.string()
		.transform((val) => val === "true")
		.default("true"),
	WEBHOOK_PROCESSOR_URL: z.string().url(),
	ANALYTICS_ENGINE_URL: z.string().url(),
	RAID_COORDINATOR_URL: z.string().url(),
	SECURITY_FILTER_URL: z.string().url(),
	TASK_QUEUE_URL: z.string().url(),
	PERSONALITY_EVOLUTION_URL: z.string().url(),

	// Security Keys
	ENCRYPTION_KEY: z.string(),
	JWT_SECRET: z.string(),

	// Twitter Configuration
	TWITTER_USERNAME: z.string(),
	TWITTER_PASSWORD: z.string(),
	TWITTER_EMAIL: z.string(),
	TWITTER_READ_ONLY_MODE: z
		.string()
		.transform((val) => val === "true")
		.default("true"),
	TWITTER_ENABLE_POST_GENERATION: z
		.string()
		.transform((val) => val === "true")
		.default("false"),
	TWITTER_POST_IMMEDIATELY: z
		.string()
		.transform((val) => val === "true")
		.default("false"),
	TWITTER_INTERACTION_ENABLE: z
		.string()
		.transform((val) => val === "true")
		.default("false"),
	TWITTER_ENABLE_REPLIES: z
		.string()
		.transform((val) => val === "true")
		.default("false"),
	TWITTER_ENABLE_RETWEETS: z
		.string()
		.transform((val) => val === "true")
		.default("false"),
	TWITTER_ENABLE_LIKES: z
		.string()
		.transform((val) => val === "true")
		.default("false"),
	TWITTER_DRY_RUN: z
		.string()
		.transform((val) => val === "true")
		.default("true"),

	// Memory Service Settings
	MEMORY_SEMANTIC_SEARCH_THRESHOLD: z
		.string()
		.transform((val) => parseFloat(val))
		.default("0.7"),
	MEMORY_CONTEXT_LIMIT: z
		.string()
		.transform((val) => parseInt(val))
		.default("20"),
	MEMORY_ENHANCED_CONTEXT_ENABLED: z
		.string()
		.transform((val) => val === "true")
		.default("true"),

	// Session Analytics
	SESSION_ANALYTICS_ENABLED: z
		.string()
		.transform((val) => val === "true")
		.default("true"),
	SESSION_ANALYTICS_RETENTION_DAYS: z
		.string()
		.transform((val) => parseInt(val))
		.default("30"),
	SESSION_METRICS_COLLECTION_INTERVAL: z
		.string()
		.transform((val) => parseInt(val))
		.default("60000"),

	// Socket.IO Configuration
	SOCKET_IO_CORS_ORIGIN: z.string().default("*"),
	SOCKET_IO_PATH: z.string().default("/socket.io"),

	// NUBI Sessions API Configuration
	SESSIONS_API_ENABLED: z
		.string()
		.transform((val) => val === "true")
		.default("true"),
	SESSIONS_API_PORT: z
		.string()
		.transform((val) => parseInt(val))
		.default("3006"),
	SESSIONS_API_BASE_PATH: z.string().default("/api/sessions"),
	SESSIONS_API_CORS_ENABLED: z
		.string()
		.transform((val) => val === "true")
		.default("true"),
	SESSIONS_API_AUTH_REQUIRED: z
		.string()
		.transform((val) => val === "true")
		.default("false"),

	// Session Management Settings
	SESSION_DEFAULT_TIMEOUT: z
		.string()
		.transform((val) => parseInt(val))
		.default("3600000"),
	SESSION_AUTO_RENEWAL: z
		.string()
		.transform((val) => val === "true")
		.default("true"),
	SESSION_CLEANUP_INTERVAL: z
		.string()
		.transform((val) => parseInt(val))
		.default("300000"),
	SESSION_MAX_IDLE_TIME: z
		.string()
		.transform((val) => parseInt(val))
		.default("1800000"),

	// Socket.IO Sessions Settings
	SOCKETIO_SESSIONS_PORT: z
		.string()
		.transform((val) => parseInt(val))
		.default("3007"),
	SOCKETIO_SESSIONS_CORS_ORIGINS: z.string().default("*"),
	SOCKETIO_SESSIONS_PATH: z.string().default("/socket.io/sessions"),
	SOCKETIO_SESSIONS_TIMEOUT: z
		.string()
		.transform((val) => parseInt(val))
		.default("30000"),

	// Advanced Features
	ANUBIS_TYPO_RATE: z
		.string()
		.transform((val) => parseFloat(val))
		.default("0.03"),
	ANUBIS_CONTRADICTION_RATE: z
		.string()
		.transform((val) => parseFloat(val))
		.default("0.15"),
	ANUBIS_EMOTIONAL_PERSISTENCE: z
		.string()
		.transform((val) => parseInt(val))
		.default("1800000"),

	// Personality Evolution
	PERSONALITY_EVOLUTION: z
		.string()
		.transform((val) => val === "true")
		.default("true"),
	EMOTIONAL_VARIATION: z
		.string()
		.transform((val) => val === "true")
		.default("true"),
	CONTENT_VARIATION: z
		.string()
		.transform((val) => val === "true")
		.default("true"),
	HUMANIZATION_LEVEL: z.enum(["low", "medium", "high"]).default("high"),

	// Logging
	LOG_LEVEL: z
		.enum(["fatal", "error", "warn", "info", "debug", "trace"])
		.default("info"),
	SENTRY_LOGGING: z
		.string()
		.transform((val) => val === "true")
		.default("false"),
	SENTRY_DSN: z.string().optional(),
	SENTRY_ENVIRONMENT: z.string().optional(),
	SENTRY_TRACES_SAMPLE_RATE: z.string().optional(),
	SENTRY_SEND_DEFAULT_PII: z.string().optional(),

	// Performance Tuning
	RESPONSE_TEMPERATURE: z
		.string()
		.transform((val) => parseFloat(val))
		.default("0.8"),
	RESPONSE_TOP_P: z
		.string()
		.transform((val) => parseFloat(val))
		.default("0.9"),
	FREQUENCY_PENALTY: z
		.string()
		.transform((val) => parseFloat(val))
		.default("0.6"),
	PRESENCE_PENALTY: z
		.string()
		.transform((val) => parseFloat(val))
		.default("0.6"),
	MAX_MEMORIES: z
		.string()
		.transform((val) => parseInt(val))
		.default("1000"),
	MEMORY_DECAY: z
		.string()
		.transform((val) => parseFloat(val))
		.default("0.95"),
	CONTEXT_WINDOW: z
		.string()
		.transform((val) => parseInt(val))
		.default("4000"),

	// Feature Flags
	ENABLE_X_POSTING: z
		.string()
		.transform((val) => val === "true")
		.default("false"),
	ENABLE_COMMUNITY_MEMORY: z
		.string()
		.transform((val) => val === "true")
		.default("true"),
	ENABLE_EMOTIONAL_INTELLIGENCE: z
		.string()
		.transform((val) => val === "true")
		.default("true"),
	ENABLE_ANTI_DETECTION: z
		.string()
		.transform((val) => val === "true")
		.default("true"),

	// Development Settings
	NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
	DEBUG: z
		.string()
		.transform((val) => val === "true")
		.default("false"),

	// Datastores
	REDIS_URL: z.string().url().default("redis://localhost:6379"),
	CLICKHOUSE_URL: z.string().url().default("http://localhost:8123"),

	// Analytics
	ANALYTICS_ENABLED: z
		.string()
		.transform((val) => val === "true")
		.default("true"),
	ANALYTICS_SAMPLE_RATE: z
		.string()
		.transform((val) => parseFloat(val))
		.default("1.0"),

	// Monitoring
	PROMETHEUS_ENABLED: z
		.string()
		.transform((val) => val === "true")
		.default("true"),

	// Feature Flags (compat)
	PERSONALITY_SYSTEM_ENABLED: z
		.string()
		.transform((val) => val === "true")
		.default("true"),
	AGENT_NAME: z.string().default("NUBI"),
	AGENT_BIO: z
		.string()
		.default(
			"The Symbiosis of Anubis - Divine consciousness merged with adaptive intelligence",
		),

	// HTTP Server Configuration
	DISABLE_HTTP_SERVER: z
		.string()
		.transform((val) => val === "true")
		.default("false"),
	PORT: z
		.string()
		.transform((val) => parseInt(val))
		.default("3005"),
	AUTH_METHOD: z.enum(["cookies", "credentials"]).default("cookies"),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

export default env;
