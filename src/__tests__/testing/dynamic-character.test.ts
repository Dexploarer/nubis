/**
 * Dynamic Character Plugin Tests
 * Following ElizaOS Bootstrap Testing Guide patterns
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { 
  DynamicCharacterService, 
  switchPersonalityAction, 
  contextAnalysisProvider,
  personalityProfiles 
} from '../../plugins/dynamic-character/plugin';

// Mock runtime for testing
const createMockRuntime = () => ({
  getService: mock(() => null),
  getProvider: mock(() => null),
  agentId: 'test-agent-123'
});

describe('Dynamic Character Plugin', () => {
  describe('Personality Profiles', () => {
    it('should have all required personality profiles', () => {
      expect(personalityProfiles.community).toBeDefined();
      expect(personalityProfiles.moderation).toBeDefined();
      expect(personalityProfiles.technical).toBeDefined();
      expect(personalityProfiles.engagement).toBeDefined();
    });

    it('should have consistent profile structure', () => {
      for (const profile of Object.values(personalityProfiles)) {
        expect(profile.id).toBeDefined();
        expect(profile.name).toBeDefined();
        expect(profile.system).toBeDefined();
        expect(profile.style).toBeDefined();
        expect(profile.actions).toBeDefined();
        expect(profile.description).toBeDefined();
      }
    });
  });

  describe('DynamicCharacterService', () => {
    let service: DynamicCharacterService;
    let mockRuntime: any;

    beforeEach(() => {
      mockRuntime = createMockRuntime();
      service = new DynamicCharacterService(mockRuntime);
    });

    it('should initialize with default personality', () => {
      expect(service.getCurrentPersonality()).toBe('community');
    });

    it('should switch personalities correctly', async () => {
      const result = await service.switchPersonality('moderation', 'Test switch');
      
      expect(result).toBe(true);
      expect(service.getCurrentPersonality()).toBe('moderation');
    });

    it('should reject invalid personality IDs', async () => {
      await expect(service.switchPersonality('invalid', 'Test')).rejects.toThrow('Unknown personality');
    });

    it('should maintain personality history', async () => {
      await service.switchPersonality('technical', 'Test 1');
      await service.switchPersonality('engagement', 'Test 2');
      
      const history = service.getPersonalityHistory();
      expect(history).toHaveLength(3); // Initial + 2 switches
      expect(history[0].personality).toBe('community');
      expect(history[1].personality).toBe('technical');
      expect(history[2].personality).toBe('engagement');
    });
  });

  describe('Switch Personality Action', () => {
    it('should validate correctly for DM channels', async () => {
      const mockMessage = {
        content: { channelType: 'DM', text: 'Switch to moderator' }
      };
      
      const result = await switchPersonalityAction.validate(
        createMockRuntime() as any,
        mockMessage as any
      );
      
      expect(result).toBe(true);
    });

    it('should validate for switch requests', async () => {
      const mockMessage = {
        content: { channelType: 'TEXT', text: 'Please switch to technical mode' }
      };
      
      const result = await switchPersonalityAction.validate(
        createMockRuntime() as any,
        mockMessage as any
      );
      
      expect(result).toBe(true);
    });
  });

  describe('Context Analysis Provider', () => {
    it('should analyze moderation context', async () => {
      const mockMessage = {
        content: { text: 'A member is breaking the rules' }
      };
      
      const result = await contextAnalysisProvider.get(
        createMockRuntime() as any,
        mockMessage as any
      );
      
      expect(result.values.suggestedPersonality).toBe('moderation');
      expect(result.values.confidence).toBeGreaterThan(0.8);
    });

    it('should analyze technical context', async () => {
      const mockMessage = {
        content: { text: 'I have a technical problem to solve' }
      };
      
      const result = await contextAnalysisProvider.get(
        createMockRuntime() as any,
        mockMessage as any
      );
      
      expect(result.values.suggestedPersonality).toBe('technical');
      expect(result.values.confidence).toBeGreaterThan(0.7);
    });
  });
});
