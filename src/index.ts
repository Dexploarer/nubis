import { Project, ProjectAgent, IAgentRuntime } from '@elizaos/core';
import { defaultCharacter, getCharacter } from './characters/index.js';
import { config } from './config/environment.js';
import { getEnabledPlugins } from './plugins/index.js';

// Get character based on environment configuration
const character = getCharacter(config.CHARACTER_NAME);

// Bootstrap LLM-related environment variables at module load so providers see them early
if (config.OPENAI_BASE_URL && !process.env.OPENAI_BASE_URL) {
  process.env.OPENAI_BASE_URL = config.OPENAI_BASE_URL;
}
if (config.OPENAI_BASE_URL && !process.env.OPENAI_API_BASE_URL) {
  process.env.OPENAI_API_BASE_URL = config.OPENAI_BASE_URL;
}
if (config.OPENAI_API_KEY && !process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = config.OPENAI_API_KEY;
}
if ((config as any).DEFAULT_MODEL && !process.env.DEFAULT_MODEL) {
  process.env.DEFAULT_MODEL = (config as any).DEFAULT_MODEL as string;
}
if (process.env.DEFAULT_MODEL && !process.env.OPENAI_MODEL) {
  process.env.OPENAI_MODEL = process.env.DEFAULT_MODEL;
}
if (process.env.DEFAULT_MODEL && !process.env.MODEL) {
  process.env.MODEL = process.env.DEFAULT_MODEL;
}
if ((config as any).FALLBACK_MODEL && !process.env.FALLBACK_MODEL) {
  process.env.FALLBACK_MODEL = (config as any).FALLBACK_MODEL as string;
}

// Propagate embedding model into common env aliases so providers can find it
const embeddingModel =
  (config as any).EMBEDDING_MODEL ||
  (config as any).OPENAI_EMBEDDING_MODEL ||
  (config as any).TEXT_EMBEDDING_MODEL ||
  process.env.EMBEDDING_MODEL ||
  process.env.OPENAI_EMBEDDING_MODEL ||
  process.env.TEXT_EMBEDDING_MODEL;

if (embeddingModel) {
  if (!process.env.EMBEDDING_MODEL) process.env.EMBEDDING_MODEL = embeddingModel as string;
  if (!process.env.OPENAI_EMBEDDING_MODEL) process.env.OPENAI_EMBEDDING_MODEL = embeddingModel as string;
  if (!process.env.TEXT_EMBEDDING_MODEL) process.env.TEXT_EMBEDDING_MODEL = embeddingModel as string;
}

// Get enabled plugins based on configuration
const enabledPlugins = getEnabledPlugins();

export const projectAgent: ProjectAgent = {
  character,
  plugins: enabledPlugins,
  init: async (runtime: IAgentRuntime) => {
    console.log(`Initializing agent: ${character.name}`);
    console.log(`Community: ${config.COMMUNITY_NAME}`);
    console.log(`Environment: ${config.NODE_ENV}`);
    console.log(`Enabled plugins: ${enabledPlugins.length}`);
  },
};

const project: Project = {
  agents: [projectAgent],
};

export default project;