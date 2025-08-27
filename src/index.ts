// Core elizaOS imports first
import { logger, type Project, type ProjectAgent } from '@elizaos/core';

// Local imports last
import { Nubi, Buni } from './characters/index.ts';
import plugin from './plugin.ts';
import { twitterEnhancedPlugin } from './plugins/twitter-enhanced/index.ts';
import { socialRaidsPlugin } from './plugins/social-raids/index.ts';
import { ProjectStarterTestSuite } from './__tests__/e2e/project-starter.e2e';

// Main project agent (Nubi) - now the primary agent
export const projectAgent: ProjectAgent = {
  character: Nubi,

  plugins: [
    plugin,
    twitterEnhancedPlugin,
    socialRaidsPlugin,
  ],

  tests: [ProjectStarterTestSuite],
};

// Secondary agent (Buni) - supportive community builder
export const buniAgent: ProjectAgent = {
  character: Buni,

  plugins: [plugin, twitterEnhancedPlugin, socialRaidsPlugin],

  tests: [ProjectStarterTestSuite],
};

// Project configuration with multiple agents
const project: Project = {
  agents: [
    projectAgent, // Primary agent (Nubi)
    buniAgent, // Secondary agent (Buni)
  ],
};

// Export character configurations for direct use
export { Nubi as character, Buni as buniCharacter } from './characters/index.ts';

// Export plugin instances for external use
export { plugin, twitterEnhancedPlugin, socialRaidsPlugin };

export default project;
