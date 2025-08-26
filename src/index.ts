// Core elizaOS imports first
import { logger, type Project, type ProjectAgent } from '@elizaos/core';

// Local imports last
import { character as buniCharacter } from './character.ts';
import { character } from './nubi.ts'; // Nubi is now the main character
import plugin from './plugin.ts';
import { twitterEnhancedPlugin } from './plugins/twitter-enhanced/index.ts';
import { socialRaidsPlugin } from './plugins/social-raids/index.ts';
import { ProjectStarterTestSuite } from './__tests__/e2e/project-starter.e2e';

// Main project agent (Nubi) - now the primary agent
export const projectAgent: ProjectAgent = {
  character, // This is Nubi character
  
  // Project-specific plugins (loaded after character's core plugins)
  // Order matters: twitter-enhanced loads first (priority 90), then social-raids (priority 100)
  plugins: [
    plugin,              // Starter plugin with basic functionality
    twitterEnhancedPlugin, // Enhanced Twitter integration with RSS feeds
    socialRaidsPlugin,   // Social raids coordination and management
  ],
  
  tests: [ProjectStarterTestSuite],
};

// Secondary agent (Buni) - supportive community builder
export const buniAgent: ProjectAgent = {
  character: buniCharacter,
  
  // Same plugin configuration as main agent
  plugins: [
    plugin,
    twitterEnhancedPlugin,
    socialRaidsPlugin,
  ],
  
  tests: [ProjectStarterTestSuite],
};

// Project configuration with multiple agents
const project: Project = {
  agents: [
    projectAgent, // Primary agent (Nubi)
    buniAgent,    // Secondary agent (Buni)
  ],
};

// Export character configurations for direct use
export { character } from './nubi.ts'; // Main character export is now Nubi
export { character as buniCharacter } from './character.ts'; // Buni as secondary

// Export plugin instances for external use
export { plugin, twitterEnhancedPlugin, socialRaidsPlugin };

export default project;
