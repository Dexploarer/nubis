// Discord Templates for NUBI Agent
// Implements @ mention validation and Supabase MCP integration
// Based on actual working ElizaOS plugin structure

// Core Discord message handling
export * from "./discord-message-handler.template";

// Discord service integration
export * from "./discord-service.template";

// Complete Discord integration
export * from "./discord-integration.template";

// Template builders - export from their respective files
export { buildDiscordMessageHandler } from "./discord-message-handler.template";
export { buildDiscordService } from "./discord-service.template";
export { buildDiscordIntegration } from "./discord-integration.template";

// Template variants - export from their respective files
export { discordMessageHandlerVariants } from "./discord-message-handler.template";
export { discordServiceVariants } from "./discord-service.template";
export { discordIntegrationVariants } from "./discord-integration.template";

// Default exports for each plugin
export { default as discordMessageHandlerPlugin } from "./discord-message-handler.template";
export { default as discordServicePlugin } from "./discord-service.template";
export { default as discordIntegrationPlugin } from "./discord-integration.template";
