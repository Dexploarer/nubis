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

// Main project agent (Nubi) - now the primary agent
{
  const n = validateCharacter(Nubi);
  if (!n.valid) {
    logger.error(n.errors.join('; '));
    throw new Error('Nubi character failed validation');
  }
}
export const projectAgent: ProjectAgent = {
  character: Nubi,

  plugins: [plugin, twitterEnhancedPlugin, socialRaidsPlugin],

  tests: [ProjectStarterTestSuite],
};
assertProjectPluginOrder(projectAgent.plugins as any, logger as any);

// Secondary agent (Buni) - supportive community builder
{
  const b = validateCharacter(Buni);
  if (!b.valid) {
    logger.error(b.errors.join('; '));
    throw new Error('Buni character failed validation');
  }
}
export const buniAgent: ProjectAgent = {
  character: Buni,

  plugins: [plugin, twitterEnhancedPlugin, socialRaidsPlugin],

  tests: [ProjectStarterTestSuite],
};
assertProjectPluginOrder(buniAgent.plugins as any, logger as any);

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
