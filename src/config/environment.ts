// Environment configuration following ElizaOS standards
// Simplified version without complex Zod validation to match project's current implementation

// Parse environment variables with defaults
export const env = {
  // Node environment
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  PORT: Number(process.env.PORT) || 3000,

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // API Keys for model providers (required - choose one or more)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  GROQ_API_KEY: process.env.GROQ_API_KEY,

  // Communication channels (optional)
  DISCORD_APPLICATION_ID: process.env.DISCORD_APPLICATION_ID,
  DISCORD_API_TOKEN: process.env.DISCORD_API_TOKEN,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,

  // Twitter/X integration
  TWITTER_USERNAME: process.env.TWITTER_USERNAME,
  TWITTER_PASSWORD: process.env.TWITTER_PASSWORD,
  TWITTER_EMAIL: process.env.TWITTER_EMAIL,
  TWITTER_COOKIES: process.env.TWITTER_COOKIES,

  // Blockchain (optional)
  SOLANA_PUBLIC_KEY: process.env.SOLANA_PUBLIC_KEY,
  SOLANA_PRIVATE_KEY: process.env.SOLANA_PRIVATE_KEY,
  EVM_PUBLIC_KEY: process.env.EVM_PUBLIC_KEY,
  EVM_PRIVATE_KEY: process.env.EVM_PRIVATE_KEY,

  // Feature flags
  ENABLE_RAIDS: process.env.ENABLE_RAIDS === 'true',
  ENABLE_MODERATION: process.env.ENABLE_MODERATION !== 'false', // Default true
  ENABLE_COMMUNITY_MEMORY: process.env.ENABLE_COMMUNITY_MEMORY !== 'false', // Default true

  // Edge Functions (from the selected environment)
  EDGE_FUNCTIONS_ENABLED: process.env.EDGE_FUNCTIONS_ENABLED === 'true',
  WEBHOOK_PROCESSOR_URL: process.env.WEBHOOK_PROCESSOR_URL,
  ANALYTICS_ENGINE_URL: process.env.ANALYTICS_ENGINE_URL,
  RAID_COORDINATOR_URL: process.env.RAID_COORDINATOR_URL,
  SECURITY_FILTER_URL: process.env.SECURITY_FILTER_URL,
  TASK_QUEUE_URL: process.env.TASK_QUEUE_URL,
  PERSONALITY_EVOLUTION_URL: process.env.PERSONALITY_EVOLUTION_URL,

  // System configuration
  LOG_LEVEL: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
  MAX_REQUESTS_PER_MINUTE: Number(process.env.MAX_REQUESTS_PER_MINUTE) || 50,
  SESSION_TIMEOUT_MINUTES: Number(process.env.SESSION_TIMEOUT_MINUTES) || 1440,

  // Plugin-specific configuration
  EXAMPLE_PLUGIN_VARIABLE: process.env.EXAMPLE_PLUGIN_VARIABLE,
};

// Feature flags based on environment
export const featureFlags = {
  raids: env.ENABLE_RAIDS,
  moderation: env.ENABLE_MODERATION,
  memory: env.ENABLE_COMMUNITY_MEMORY,
  social: !!(env.DISCORD_API_TOKEN || env.TELEGRAM_BOT_TOKEN),
  edgeFunctions: env.EDGE_FUNCTIONS_ENABLED,

  // Plugin-specific flags
  plugins: {
    openai: !!env.OPENAI_API_KEY,
    anthropic: !!env.ANTHROPIC_API_KEY,
    groq: !!env.GROQ_API_KEY,
    discord: !!env.DISCORD_API_TOKEN,
    telegram: !!env.TELEGRAM_BOT_TOKEN,
    twitter: !!(env.TWITTER_USERNAME || env.TWITTER_COOKIES),
    solana: !!env.SOLANA_PRIVATE_KEY,
    evm: !!env.EVM_PRIVATE_KEY,
  },
};

// Validate that at least one model provider is configured
const hasModelProvider = env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY || env.GROQ_API_KEY;
if (!hasModelProvider && env.NODE_ENV === 'production') {
  console.warn(
    '⚠️  No model provider configured. At least one of OPENAI_API_KEY, ANTHROPIC_API_KEY, or GROQ_API_KEY is required.',
  );
}

// Log feature status
if (env.NODE_ENV !== 'test') {
  console.log('🚀 ElizaOS Environment Configuration:');
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(
    `   Features enabled: ${
      Object.entries(featureFlags)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name)
        .join(', ') || 'none'
    }`,
  );
  console.log(
    `   Model providers: ${
      Object.entries(featureFlags.plugins)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name)
        .join(', ') || 'none'
    }`,
  );
}

export type Environment = typeof env;
export type FeatureFlags = typeof featureFlags;
