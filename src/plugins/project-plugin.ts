/**
 * Main Project Plugin for ElizaOS
 * 
 * Integrates all project-specific actions, providers, and services
 * following official ElizaOS plugin patterns
 */

import type { Plugin, IAgentRuntime } from '@elizaos/core';
import { logger } from '@elizaos/core';
import { z } from 'zod';

// Import our actions and providers
import { mentorAction, buildCommunityAction } from '../actions/community-actions.js';
import { 
  communityContextProvider, 
  learningContextProvider, 
  engagementStrategyProvider 
} from '../providers/community-providers.js';

/**
 * Configuration schema for the project plugin
 */
const projectConfigSchema = z.object({
  CHARACTER_NAME: z.string().default('Nubi'),
  COMMUNITY_NAME: z.string().default('Developer Community'),
  ENABLE_MENTORSHIP: z.string().transform((val: string) => val === 'true').default('true'),
  ENABLE_COMMUNITY_BUILDING: z.string().transform((val: string) => val === 'true').default('true'),
});

/**
 * Main Project Plugin
 * Contains all the custom functionality for our ElizaOS project
 */
export const projectPlugin: Plugin = {
  name: 'project-main',
  description: 'Main project plugin with community management, mentorship, and AI agent functionality',
  
  // Configuration following ElizaOS patterns
  config: {
    CHARACTER_NAME: process.env.CHARACTER_NAME,
    COMMUNITY_NAME: process.env.COMMUNITY_NAME,
    ENABLE_MENTORSHIP: process.env.ENABLE_MENTORSHIP,
    ENABLE_COMMUNITY_BUILDING: process.env.ENABLE_COMMUNITY_BUILDING,
  },

  // Initialize plugin with config validation
  async init(config: Record<string, string>, runtime: IAgentRuntime) {
    logger.debug('Project plugin initialized');
    try {
      const validatedConfig = await projectConfigSchema.parseAsync(config);
      
      // Set environment variables
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value) process.env[key] = String(value);
      }
      
      logger.info(`Character: ${validatedConfig.CHARACTER_NAME}`);
      logger.info(`Community: ${validatedConfig.COMMUNITY_NAME}`);
      logger.info(`Mentorship enabled: ${validatedConfig.ENABLE_MENTORSHIP}`);
      logger.info(`Community building enabled: ${validatedConfig.ENABLE_COMMUNITY_BUILDING}`);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid project configuration: ${error.errors.map((e: any) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  },

  // Actions - behaviors the agent can perform
  actions: [
    mentorAction,
    buildCommunityAction,
  ],

  // Providers - data sources for context
  providers: [
    engagementStrategyProvider,  // Run first (position: -1)
    communityContextProvider,
    learningContextProvider,
  ],

  // Routes - HTTP endpoints for status and management
  routes: [
    {
      name: 'project-status',
      path: '/api/project/status',
      type: 'GET',
      handler: async (_req: any, res: any, runtime: IAgentRuntime) => {
        res.json({
          character: process.env.CHARACTER_NAME || 'Nubi',
          community: process.env.COMMUNITY_NAME || 'Developer Community',
          features: {
            mentorship: process.env.ENABLE_MENTORSHIP !== 'false',
            communityBuilding: process.env.ENABLE_COMMUNITY_BUILDING !== 'false',
          },
          status: 'active',
        });
      },
    },
    {
      name: 'project-actions',
      path: '/api/project/actions',
      type: 'GET',
      handler: async (_req: any, res: any, runtime: IAgentRuntime) => {
        const actions = runtime.actions.map(action => ({
          name: action.name,
          description: action.description,
          similes: action.similes,
        }));
        res.json({ actions });
      },
    },
  ],

  // Event handlers
  events: {
    MESSAGE_RECEIVED: [
      async (params: any) => {
        logger.debug('Project plugin received MESSAGE_RECEIVED event');
        // Could implement message analytics here
      },
    ],
  },
};

export default projectPlugin;
