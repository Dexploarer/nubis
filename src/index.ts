import { Project, ProjectAgent, IAgentRuntime } from '@elizaos/core';
import { defaultCharacter, getCharacter } from './characters/index.js';
import { config } from './config/environment.js';
import { getEnabledPlugins } from './plugins/index.js';

// Get character based on environment configuration
const character = getCharacter(config.CHARACTER_NAME);

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