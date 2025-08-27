// Core elizaOS imports first
import { logger, type Project, type ProjectAgent } from '@elizaos/core';

// Local imports last
import { Nubi, Buni } from './characters/index.ts';
import { validateCharacter } from './characters/validation.ts';
import plugin from './plugin.ts';
import { twitterEnhancedPlugin } from './plugins/twitter-enhanced/index.ts';
import { socialRaidsPlugin } from './plugins/social-raids/index.ts';
import { ProjectStarterTestSuite } from './__tests__/e2e/project-starter.e2e';
import { assertProjectPluginOrder } from './utils/plugin-order-guard.ts';

function validateAgentCharacter(character: unknown, characterName: string) {
  const res = validateCharacter(character);
  if (!res.valid) {
    logger.error(res.errors.join('; '));
    throw new Error(`${characterName} character failed validation`);
  }
}

// Main project agent (Nubi) - now the primary agent
validateAgentCharacter(Nubi, 'Nubi')
export const projectAgent: ProjectAgent = {
  character: Nubi,

  plugins: [plugin, twitterEnhancedPlugin, socialRaidsPlugin],

  tests: [ProjectStarterTestSuite],
};
assertProjectPluginOrder(projectAgent.plugins, logger);

// Secondary agent (Buni) - supportive community builder
validateAgentCharacter(Buni, 'Buni')
export const buniAgent: ProjectAgent = {
  character: Buni,

  plugins: [plugin, twitterEnhancedPlugin, socialRaidsPlugin],

  tests: [ProjectStarterTestSuite],
};
assertProjectPluginOrder(buniAgent.plugins, logger);

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
