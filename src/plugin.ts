/**
 * ElizaOS Plugin Definition
 * This file defines the main plugin for the ElizaOS project
 */

import type { Plugin } from '@elizaos/core';
import { ModelType } from '@elizaos/core';

export const plugin: Plugin = {
  name: 'elizaos-project',
  version: '1.0.0',
  description: 'Main plugin for ElizaOS project with character management and community features',
  
  // Plugin lifecycle hooks
  async initialize(runtime) {
    console.log('ElizaOS Project Plugin initialized');
  },
  
  async cleanup(runtime) {
    console.log('ElizaOS Project Plugin cleaned up');
  },

  // Models for text generation
  models: {
    [ModelType.TEXT_SMALL]: async (runtime, params) => {
      const { prompt = "" } = params;
      if (!prompt) return "No prompt provided";
      return `Generated response for: ${prompt}`;
    },
    [ModelType.TEXT_LARGE]: async (runtime, params) => {
      const { prompt = "" } = params;
      if (!prompt) return "No prompt provided";
      return `Detailed response for: ${prompt}`;
    }
  },

  // Providers for context and data
  providers: [
    {
      name: "HELLO_WORLD_PROVIDER",
      description: "Provides basic hello world functionality for testing",
      
      get: async (runtime, message, state) => {
        return {
          text: "Hello, World!",
          values: {
            greeting: "Hello",
            target: "World",
            timestamp: Date.now()
          },
          data: {
            source: "hello-world-provider",
            message: "Basic greeting provided"
          },
          confidence: 1.0,
          source: "hello-world-provider"
        };
      }
    }
  ],

  // Actions for plugin functionality
  actions: [],

  // Routes for HTTP endpoints
  routes: [],

  // Events for plugin lifecycle
  events: {},

  // Services for external integrations
  services: []
};

export default plugin;
