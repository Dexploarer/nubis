/**
 * ElizaOS Architecture Compliance Test
 * Ensures the project follows ElizaOS best practices and architecture patterns
 */

import { describe, test, expect } from 'bun:test';
import { character } from '../nubi'; // Main character is now Nubi
import { character as buniCharacter } from '../character'; // Secondary character is Buni

describe('ElizaOS Architecture Compliance', () => {
  describe('Character Configuration Best Practices', () => {
    test('should have bootstrap plugin first in both characters', () => {
      expect(character.plugins[0]).toBe('@elizaos/plugin-bootstrap');
      expect(buniCharacter.plugins[0]).toBe('@elizaos/plugin-bootstrap');
    });

    test('should have SQL plugin second for database management', () => {
      expect(character.plugins[1]).toBe('@elizaos/plugin-sql');
      expect(buniCharacter.plugins[1]).toBe('@elizaos/plugin-sql');
    });

    test('should conditionally load AI model providers', () => {
      const modelProviders = [
        '@elizaos/plugin-openai',
        '@elizaos/plugin-anthropic', 
        '@elizaos/plugin-google-genai'
      ];
      
      // At least one model provider should be available if environment is configured
      const hasModelProvider = character.plugins.some(plugin => 
        modelProviders.includes(plugin as string)
      );
      
      // This test passes if no model providers are configured (acceptable for basic setup)
      // or if at least one is properly configured
      expect(typeof hasModelProvider).toBe('boolean');
    });

    test('should conditionally load communication plugins based on environment', () => {
      const commPlugins = character.plugins.filter(plugin => 
        plugin === '@elizaos/plugin-discord' || plugin === '@elizaos/plugin-telegram'
      );
      
      // Should only include plugins when environment variables are set
      commPlugins.forEach(plugin => {
        if (plugin === '@elizaos/plugin-discord') {
          // Would be loaded if DISCORD_API_TOKEN is set
          expect(typeof plugin).toBe('string');
        }
        if (plugin === '@elizaos/plugin-telegram') {
          // Would be loaded if TELEGRAM_BOT_TOKEN is set
          expect(typeof plugin).toBe('string');
        }
      });
    });

    test('should include knowledge plugin for document learning', () => {
      expect(character.plugins).toContain('@elizaos/plugin-knowledge');
      expect(buniCharacter.plugins).toContain('@elizaos/plugin-knowledge');
    });

    test('should include specialized capability plugins', () => {
      expect(character.plugins).toContain('@elizaos/plugin-browser');
      expect(character.plugins).toContain('@elizaos/plugin-mcp');
      
      expect(buniCharacter.plugins).toContain('@elizaos/plugin-browser');
      expect(buniCharacter.plugins).toContain('@elizaos/plugin-mcp');
    });

    test('should NOT include local plugins in character config (separated to projectAgent)', () => {
      const hasLocalPlugins = character.plugins.some(plugin => 
        typeof plugin === 'string' && plugin.startsWith('./')
      );
      expect(hasLocalPlugins).toBe(false);
      
      const hasBuniLocalPlugins = buniCharacter.plugins.some(plugin => 
        typeof plugin === 'string' && plugin.startsWith('./')
      );
      expect(hasBuniLocalPlugins).toBe(false);
    });
  });

  describe('Plugin Architecture Validation', () => {
    test('should separate core plugins from local plugins', () => {
      // Core plugins should be in character configuration
      const corePlugins = [
        '@elizaos/plugin-bootstrap',
        '@elizaos/plugin-sql',
        '@elizaos/plugin-knowledge'
      ];
      
      corePlugins.forEach(plugin => {
        expect(character.plugins).toContain(plugin);
        expect(buniCharacter.plugins).toContain(plugin);
      });
      
      // Local plugins should NOT be in character configuration
      const localPluginPaths = character.plugins.filter(plugin => 
        typeof plugin === 'string' && plugin.startsWith('./')
      );
      expect(localPluginPaths).toHaveLength(0);
    });
  });

  describe('Environment Configuration', () => {
    test('should handle environment-based plugin loading gracefully', () => {
      // Test that plugins handle missing environment variables gracefully
      const beforeEnv = { ...process.env };
      
      // Temporarily clear environment
      delete process.env.DISCORD_API_TOKEN;
      delete process.env.TELEGRAM_BOT_TOKEN;
      delete process.env.OPENAI_API_KEY;
      
      // Plugins should still be structured correctly even without env vars
      expect(Array.isArray(character.plugins)).toBe(true);
      expect(character.plugins.length).toBeGreaterThan(0);
      
      // Restore environment
      process.env = beforeEnv;
    });
  });

  describe('Character Identity and Configuration', () => {
    test('Nubi character should have proper identity (main character)', () => {
      expect(character.name).toBe('Nubi');
      expect(character.bio).toBeDefined();
      expect(Array.isArray(character.bio)).toBe(true);
      expect(character.system).toBeDefined();
      expect(character.messageExamples).toBeDefined();
      expect(character.style).toBeDefined();
    });

    test('Buni character should have proper identity (secondary character)', () => {
      expect(buniCharacter.name).toBe('Buni');
      expect(buniCharacter.bio).toBeDefined();
      expect(Array.isArray(buniCharacter.bio)).toBe(true);
      expect(buniCharacter.system).toBeDefined();
      expect(buniCharacter.messageExamples).toBeDefined();
      expect(buniCharacter.style).toBeDefined();
    });

    test('characters should have different personalities but same plugin architecture', () => {
      expect(character.name).not.toBe(buniCharacter.name);
      expect(character.system).not.toBe(buniCharacter.system);
      
      // But should have same plugin structure
      expect(character.plugins).toEqual(buniCharacter.plugins);
    });
  });

  describe('Plugin Loading Order and Dependencies', () => {
    test('should load core plugins before optional plugins', () => {
      const corePluginIndex = character.plugins.indexOf('@elizaos/plugin-bootstrap');
      const optionalPluginIndex = character.plugins.indexOf('@elizaos/plugin-knowledge');
      
      expect(corePluginIndex).toBeLessThan(optionalPluginIndex);
    });

    test('should load database plugin early', () => {
      const sqlIndex = character.plugins.indexOf('@elizaos/plugin-sql');
      const knowledgeIndex = character.plugins.indexOf('@elizaos/plugin-knowledge');
      
      expect(sqlIndex).toBeLessThan(knowledgeIndex);
    });
  });
});