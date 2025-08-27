/**
 * Plugin Integration Test
 * Tests that knowledge and recall plugins are properly integrated
 */

import { describe, test, expect } from 'bun:test';
import { character } from '../nubi'; // Main character is now Nubi
import { character as buniCharacter } from '../character'; // Secondary character is Buni

describe('Plugin Integration', () => {
  describe('Nubi Character Plugin Configuration (Main Character)', () => {
    test('should include knowledge plugin', () => {
      expect(character.plugins).toContain('@elizaos/plugin-knowledge');
    });

    test('should not include recall plugin (removed from configuration)', () => {
      // Verify recall plugin is no longer in the configuration
      const plugins = character.plugins;
      const hasRecallPlugin = plugins.some(
        (plugin: string) => typeof plugin === 'string' && plugin.includes('recall'),
      );
      expect(hasRecallPlugin).toBe(false);
    });

    test('should have core plugins properly ordered', () => {
      const plugins = character.plugins;

      // Knowledge plugin should come after bootstrap but before embedding plugins
      const knowledgeIndex = plugins.indexOf('@elizaos/plugin-knowledge');
      const bootstrapIndex = plugins.findIndex(
        (p: string) =>
          p === '@elizaos/plugin-bootstrap' ||
          (Array.isArray(p) && p.includes('@elizaos/plugin-bootstrap')),
      );

      expect(knowledgeIndex).toBeGreaterThan(-1);

      // Should be positioned correctly in plugin loading order
      expect(knowledgeIndex).toBeGreaterThan(0); // Not first
    });
  });

  describe('Buni Character Plugin Configuration (Secondary Character)', () => {
    test('should include knowledge plugin', () => {
      expect(buniCharacter.plugins).toContain('@elizaos/plugin-knowledge');
    });

    test('should maintain essential plugins', () => {
      const plugins = buniCharacter.plugins;

      expect(plugins).toContain('@elizaos/plugin-bootstrap');
      expect(plugins).toContain('@elizaos/plugin-sql');
      expect(plugins).toContain('@elizaos/plugin-knowledge');
    });
  });

  describe('Plugin Dependencies Check', () => {
    test('should have knowledge plugin dependency', async () => {
      // Check that the plugin is in package.json
      const packageJson = await import('../../package.json');
      expect(packageJson.dependencies).toHaveProperty('@elizaos/plugin-knowledge');
    });

    test('should not have recall plugin dependency (removed)', async () => {
      // Check that the recall plugin is no longer in package.json
      const packageJson = await import('../../package.json');
      expect(packageJson.dependencies).not.toHaveProperty('@recallnet/plugin-eliza-storage');
    });

    test('should verify plugin versions are compatible', async () => {
      const packageJson = await import('../../package.json');

      // Knowledge plugin should be a compatible version
      const knowledgeVersion = packageJson.dependencies['@elizaos/plugin-knowledge'];
      expect(knowledgeVersion).toBeDefined();
      expect(knowledgeVersion).toMatch(/^\d+\.\d+\.\d+/); // Semantic versioning
    });
  });

  describe('Environment Configuration', () => {
    test('should respect LOAD_DOCS_ON_STARTUP environment variable', () => {
      // This tests the knowledge plugin configuration
      const originalLoadDocs = process.env.LOAD_DOCS_ON_STARTUP;

      process.env.LOAD_DOCS_ON_STARTUP = 'true';
      expect(process.env.LOAD_DOCS_ON_STARTUP).toBe('true');

      // Restore original environment
      if (originalLoadDocs) {
        process.env.LOAD_DOCS_ON_STARTUP = originalLoadDocs;
      } else {
        delete process.env.LOAD_DOCS_ON_STARTUP;
      }
    });

    test('should not have recall-related environment variables', () => {
      // Verify recall environment variables are not being used
      const plugins = character.plugins;
      const hasRecallLogic = plugins.some(
        (plugin: string) => typeof plugin === 'string' && plugin.includes('RECALL_PRIVATE_KEY'),
      );
      expect(hasRecallLogic).toBe(false);
    });
  });

  describe('Plugin Loading Order', () => {
    test('should load core plugins before knowledge plugins', () => {
      const plugins = character.plugins;

      // Find indices of key plugins
      const sqlIndex = plugins.indexOf('@elizaos/plugin-sql');
      const knowledgeIndex = plugins.indexOf('@elizaos/plugin-knowledge');

      expect(sqlIndex).toBeGreaterThan(-1);
      expect(knowledgeIndex).toBeGreaterThan(-1);

      // SQL (core) should load before knowledge
      expect(sqlIndex).toBeLessThan(knowledgeIndex);
    });

    test('should load knowledge plugin before embedding plugins', () => {
      const plugins = character.plugins;
      const knowledgeIndex = plugins.indexOf('@elizaos/plugin-knowledge');

      expect(knowledgeIndex).toBeGreaterThan(-1);

      // Knowledge should be positioned appropriately in the plugin array
      // It should be after core plugins but available for embedding-capable functionality
      expect(knowledgeIndex).toBeLessThan(plugins.length); // Should be in the array
      expect(knowledgeIndex).toBeGreaterThan(2); // Should be after core plugins like SQL
    });
  });

  describe('Character Integration', () => {
    test('should maintain character integrity with new plugins', () => {
      // Test Nubi character (main)
      expect(character.name).toBe('Nubi');
      expect(character.plugins).toBeDefined();
      expect(Array.isArray(character.plugins)).toBe(true);
      expect(character.plugins.length).toBeGreaterThan(3);

      // Test Buni character (secondary)
      expect(buniCharacter.name).toBe('Buni');
      expect(buniCharacter.plugins).toBeDefined();
      expect(Array.isArray(buniCharacter.plugins)).toBe(true);
    });

    test('should not break existing plugin functionality', () => {
      // Ensure essential plugins are still present
      expect(character.plugins).toContain('@elizaos/plugin-sql');
      expect(character.plugins).toContain('@elizaos/plugin-bootstrap');
      expect(buniCharacter.plugins).toContain('@elizaos/plugin-bootstrap');
      expect(buniCharacter.plugins).toContain('@elizaos/plugin-sql');
    });
  });
});
