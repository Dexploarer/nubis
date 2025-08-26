/**
 * Environment Configuration for ElizaOS
 * Following official ElizaOS patterns with Zod validation
 */

import * as z from 'zod';

/**
 * Configuration schema with proper validation
 * Following the pattern from plugin-starter
 */
export const configSchema = z.object({
  // Core settings
  NODE_ENV: z.string().default('development'),
  LOG_LEVEL: z.string().default('info'),
  
  // AI Model configuration (at least one required)
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  
  // Database
  DATABASE_URL: z.string().default('sqlite://./data/agent.db'),
  
  // Social Media Integrations
  DISCORD_API_TOKEN: z.string().optional(),
  DISCORD_APPLICATION_ID: z.string().optional(),
  
  TWITTER_USERNAME: z.string().optional(),
  TWITTER_PASSWORD: z.string().optional(),
  TWITTER_EMAIL: z.string().optional(),
  
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHANNEL_ID: z.string().optional(),
  
  // Character configuration
  CHARACTER_NAME: z.string().default('Nubi'),
  COMMUNITY_NAME: z.string().default('Developer Community'),
});

export type AppConfig = ReturnType<typeof configSchema.parse>;

/**
 * Validate and parse configuration
 * Throws if validation fails
 */
export function validateConfig(): AppConfig {
  try {
    const config = configSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      LOG_LEVEL: process.env.LOG_LEVEL,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      DATABASE_URL: process.env.DATABASE_URL,
      DISCORD_API_TOKEN: process.env.DISCORD_API_TOKEN,
      DISCORD_APPLICATION_ID: process.env.DISCORD_APPLICATION_ID,
      TWITTER_USERNAME: process.env.TWITTER_USERNAME,
      TWITTER_PASSWORD: process.env.TWITTER_PASSWORD,
      TWITTER_EMAIL: process.env.TWITTER_EMAIL,
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHANNEL_ID: process.env.TELEGRAM_CHANNEL_ID,
      CHARACTER_NAME: process.env.CHARACTER_NAME,
      COMMUNITY_NAME: process.env.COMMUNITY_NAME,
    });
    
    // Additional validation for AI providers
    if (!config.OPENAI_API_KEY && !config.ANTHROPIC_API_KEY) {
      throw new Error('At least one AI provider API key is required (OPENAI_API_KEY or ANTHROPIC_API_KEY)');
    }
    
    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid configuration: ${error.issues.map((e: any) => `${e.path?.join?.('.') ?? ''}: ${e.message}`).join(', ')}`
      );
    }
    throw error;
  }
}

// Export validated configuration
export const config = validateConfig();

/**
 * Feature flags based on configuration
 */
export const features = {
  hasDiscord: !!config.DISCORD_API_TOKEN,
  hasTwitter: !!(config.TWITTER_USERNAME && config.TWITTER_PASSWORD),
  hasTelegram: !!config.TELEGRAM_BOT_TOKEN,
  hasDatabase: !!config.DATABASE_URL,
};