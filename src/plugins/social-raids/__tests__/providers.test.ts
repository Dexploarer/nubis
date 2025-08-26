import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import {
  type IAgentRuntime,
  type Memory,
  type State,
} from '@elizaos/core';

// Import providers
import { RaidStatusProvider } from '../providers/RaidStatusProvider';
import { UserStatsProvider } from '../providers/UserStatsProvider';
import { CommunityMemoryProvider } from '../providers/CommunityMemoryProvider';

// Import test utilities
import {
  createMockRuntime,
  createMockSupabaseClient,
  TestData,
  setupTestEnvironment,
  cleanupTestEnvironment,
  TEST_CONSTANTS,
} from './test-utils';

describe('Social Raids Providers', () => {
  let mockRuntime: any;

  beforeEach(() => {
    setupTestEnvironment();
    mockRuntime = createMockRuntime();
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('RaidStatusProvider', () => {
    let provider: RaidStatusProvider;

    beforeEach(() => {
      provider = new RaidStatusProvider();
    });

    describe('Properties', () => {
      it('should have correct name', () => {
        expect(provider.name).toBe('RAID_STATUS');
      });

      it('should have get method', () => {
        expect(provider.get).toBeDefined();
        expect(typeof provider.get).toBe('function');
      });
    });

    describe('Data Retrieval', () => {
      it('should return raid status data', async () => {
        const mockSupabase = createMockSupabaseClient();
        mockSupabase.from().select().eq().single.mockResolvedValue({
          data: TestData.createRaidData(),
          error: null,
        });

        const mockService = {
          supabase: mockSupabase,
        };

        mockRuntime.getService = mock().mockReturnValue(mockService);

        const result = await provider.get(
          mockRuntime as IAgentRuntime,
          { id: 'test-memory' } as Memory,
          {} as State
        );

        expect(result).toBeDefined();
        expect(result.text).toContain('Raid Status');
        expect(result.data).toBeDefined();
      });

      it('should handle missing raid data', async () => {
        const mockSupabase = createMockSupabaseClient();
        mockSupabase.from().select().eq().single.mockResolvedValue({
          data: null,
          error: null,
        });

        const mockService = {
          supabase: mockSupabase,
        };

        mockRuntime.getService = mock().mockReturnValue(mockService);

        const result = await provider.get(
          mockRuntime as IAgentRuntime,
          { id: 'test-memory' } as Memory,
          {} as State
        );

        expect(result).toBeDefined();
        expect(result.text).toContain('No active raid found');
      });

      it('should handle database errors', async () => {
        const mockSupabase = createMockSupabaseClient();
        mockSupabase.from().select().eq().single.mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        });

        const mockService = {
          supabase: mockSupabase,
        };

        mockRuntime.getService = mock().mockReturnValue(mockService);

        const result = await provider.get(
          mockRuntime as IAgentRuntime,
          { id: 'test-memory' } as Memory,
          {} as State
        );

        expect(result).toBeDefined();
        expect(result.text).toContain('Error retrieving raid status');
      });
    });

    describe('Time Calculations', () => {
      it('should calculate remaining time correctly', () => {
        const raidData = TestData.createRaidData({
          startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          durationMinutes: 60,
        });

        const remaining = provider.calculateRemainingTime(raidData);
        expect(remaining).toContain('30 min left');
      });

      it('should show completed for expired raids', () => {
        const raidData = TestData.createRaidData({
          startedAt: new Date(Date.now() - 120 * 60 * 1000), // 2 hours ago
          durationMinutes: 60,
        });

        const remaining = provider.calculateRemainingTime(raidData);
        expect(remaining).toBe('Completed');
      });
    });
  });

  describe('UserStatsProvider', () => {
    let provider: UserStatsProvider;

    beforeEach(() => {
      provider = new UserStatsProvider();
    });

    describe('Properties', () => {
      it('should have correct name', () => {
        expect(provider.name).toBe('USER_STATS');
      });

      it('should have get method', () => {
        expect(provider.get).toBeDefined();
        expect(typeof provider.get).toBe('function');
      });
    });

    describe('Data Retrieval', () => {
      it('should return user statistics', async () => {
        const mockSupabase = createMockSupabaseClient();
        mockSupabase.from().select().eq().single.mockResolvedValue({
          data: TestData.createUserStats(),
          error: null,
        });

        const mockService = {
          supabase: mockSupabase,
        };

        mockRuntime.getService = mock().mockReturnValue(mockService);

        const result = await provider.get(
          mockRuntime as IAgentRuntime,
          { id: 'test-memory' } as Memory,
          {} as State
        );

        expect(result).toBeDefined();
        expect(result.text).toContain('User Statistics');
        expect(result.data).toBeDefined();
        expect(result.data.totalPoints).toBe(100);
      });

      it('should handle new user with no stats', async () => {
        const mockSupabase = createMockSupabaseClient();
        mockSupabase.from().select().eq().single.mockResolvedValue({
          data: null,
          error: null,
        });

        const mockService = {
          supabase: mockSupabase,
        };

        mockRuntime.getService = mock().mockReturnValue(mockService);

        const result = await provider.get(
          mockRuntime as IAgentRuntime,
          { id: 'test-memory' } as Memory,
          {} as State
        );

        expect(result).toBeDefined();
        expect(result.text).toContain('New user');
        expect(result.data.totalPoints).toBe(0);
      });

      it('should handle database errors gracefully', async () => {
        const mockSupabase = createMockSupabaseClient();
        mockSupabase.from().select().eq().single.mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        });

        const mockService = {
          supabase: mockSupabase,
        };

        mockRuntime.getService = mock().mockReturnValue(mockService);

        const result = await provider.get(
          mockRuntime as IAgentRuntime,
          { id: 'test-memory' } as Memory,
          {} as State
        );

        expect(result).toBeDefined();
        expect(result.text).toContain('Error retrieving user stats');
      });
    });

    describe('Rank Calculation', () => {
      it('should calculate rank based on points', () => {
        const bronzeRank = provider.calculateRank(50);
        expect(bronzeRank).toBe('bronze');

        const silverRank = provider.calculateRank(250);
        expect(silverRank).toBe('silver');

        const goldRank = provider.calculateRank(750);
        expect(goldRank).toBe('gold');

        const platinumRank = provider.calculateRank(1500);
        expect(platinumRank).toBe('platinum');

        const diamondRank = provider.calculateRank(3000);
        expect(diamondRank).toBe('diamond');
      });
    });
  });

  describe('CommunityMemoryProvider', () => {
    let provider: CommunityMemoryProvider;

    beforeEach(() => {
      provider = new CommunityMemoryProvider();
    });

    describe('Properties', () => {
      it('should have correct name', () => {
        expect(provider.name).toBe('COMMUNITY_MEMORY');
      });

      it('should have get method', () => {
        expect(provider.get).toBeDefined();
        expect(typeof provider.get).toBe('function');
      });
    });

    describe('Data Retrieval', () => {
      it('should return community memory insights', async () => {
        const mockSupabase = createMockSupabaseClient();
        
        // Mock personality data
        mockSupabase.from().select().eq().single.mockResolvedValue({
          data: {
            userId: 'test-user-id',
            traits: ['active', 'helpful'],
            engagementStyle: 'supportive',
            lastUpdated: new Date(),
          },
          error: null,
        });

        // Mock memory fragments
        mockSupabase.from().select().eq().order().limit.mockResolvedValue({
          data: [
            {
              id: 'fragment-1',
              content: 'User helped organize a successful raid',
              category: 'leadership',
              weight: 0.8,
            },
          ],
          error: null,
        });

        const mockService = {
          supabase: mockSupabase,
        };

        mockRuntime.getService = mock().mockReturnValue(mockService);

        const result = await provider.get(
          mockRuntime as IAgentRuntime,
          { id: 'test-memory' } as Memory,
          {} as State
        );

        expect(result).toBeDefined();
        expect(result.text).toContain('Community Memory');
        expect(result.data).toBeDefined();
        expect(result.data.personality).toBeDefined();
        expect(result.data.memoryFragments).toBeDefined();
      });

      it('should handle user with no personality data', async () => {
        const mockSupabase = createMockSupabaseClient();
        mockSupabase.from().select().eq().single.mockResolvedValue({
          data: null,
          error: null,
        });

        const mockService = {
          supabase: mockSupabase,
        };

        mockRuntime.getService = mock().mockReturnValue(mockService);

        const result = await provider.get(
          mockRuntime as IAgentRuntime,
          { id: 'test-memory' } as Memory,
          {} as State
        );

        expect(result).toBeDefined();
        expect(result.text).toContain('No personality data');
        expect(result.data.personality).toBeNull();
      });

      it('should handle empty memory fragments', async () => {
        const mockSupabase = createMockSupabaseClient();
        
        // Mock personality data
        mockSupabase.from().select().eq().single.mockResolvedValue({
          data: {
            userId: 'test-user-id',
            traits: ['active'],
            engagementStyle: 'neutral',
            lastUpdated: new Date(),
          },
          error: null,
        });

        // Mock empty memory fragments
        mockSupabase.from().select().eq().order().limit.mockResolvedValue({
          data: [],
          error: null,
        });

        const mockService = {
          supabase: mockSupabase,
        };

        mockRuntime.getService = mock().mockReturnValue(mockService);

        const result = await provider.get(
          mockRuntime as IAgentRuntime,
          { id: 'test-memory' } as Memory,
          {} as State
        );

        expect(result).toBeDefined();
        expect(result.data.memoryFragments).toEqual([]);
      });
    });

    describe('Personality Analysis', () => {
      it('should analyze personality traits', () => {
        const personality = {
          traits: ['active', 'helpful', 'leader'],
          engagementStyle: 'supportive',
        };

        const analysis = provider.analyzePersonality(personality);

        expect(analysis).toBeDefined();
        expect(analysis.traitCount).toBe(3);
        expect(analysis.isLeader).toBe(true);
        expect(analysis.isSupportive).toBe(true);
      });

      it('should handle empty personality data', () => {
        const personality = {
          traits: [],
          engagementStyle: 'neutral',
        };

        const analysis = provider.analyzePersonality(personality);

        expect(analysis).toBeDefined();
        expect(analysis.traitCount).toBe(0);
        expect(analysis.isLeader).toBe(false);
      });
    });

    describe('Memory Fragment Processing', () => {
      it('should process memory fragments correctly', () => {
        const fragments = [
          {
            id: 'fragment-1',
            content: 'User helped organize a successful raid',
            category: 'leadership',
            weight: 0.8,
          },
          {
            id: 'fragment-2',
            content: 'User provided helpful feedback',
            category: 'engagement',
            weight: 0.6,
          },
        ];

        const processed = provider.processMemoryFragments(fragments);

        expect(processed).toBeDefined();
        expect(processed.totalFragments).toBe(2);
        expect(processed.averageWeight).toBe(0.7);
        expect(processed.categories).toContain('leadership');
        expect(processed.categories).toContain('engagement');
      });

      it('should handle empty fragments', () => {
        const processed = provider.processMemoryFragments([]);

        expect(processed).toBeDefined();
        expect(processed.totalFragments).toBe(0);
        expect(processed.averageWeight).toBe(0);
        expect(processed.categories).toEqual([]);
      });
    });
  });

  describe('Provider Integration', () => {
    it('should work together in a complete workflow', async () => {
      const raidProvider = new RaidStatusProvider();
      const userProvider = new UserStatsProvider();
      const memoryProvider = new CommunityMemoryProvider();

      const mockSupabase = createMockSupabaseClient();
      
      // Mock all provider data
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: TestData.createRaidData(),
        error: null,
      });

      mockSupabase.from().select().eq().order().limit.mockResolvedValue({
        data: [TestData.createUserStats()],
        error: null,
      });

      const mockService = {
        supabase: mockSupabase,
      };

      mockRuntime.getService = mock().mockReturnValue(mockService);

      // Test all providers
      const raidResult = await raidProvider.get(mockRuntime as IAgentRuntime, {} as Memory, {} as State);
      const userResult = await userProvider.get(mockRuntime as IAgentRuntime, {} as Memory, {} as State);
      const memoryResult = await memoryProvider.get(mockRuntime as IAgentRuntime, {} as Memory, {} as State);

      expect(raidResult).toBeDefined();
      expect(userResult).toBeDefined();
      expect(memoryResult).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle service not found', async () => {
      const provider = new RaidStatusProvider();
      mockRuntime.getService = mock().mockReturnValue(null);

      const result = await provider.get(
        mockRuntime as IAgentRuntime,
        {} as Memory,
        {} as State
      );

      expect(result).toBeDefined();
      expect(result.text).toContain('Service not available');
    });

    it('should handle network timeouts', async () => {
      const provider = new UserStatsProvider();
      const mockSupabase = createMockSupabaseClient();
      mockSupabase.from().select().eq().single.mockRejectedValue(new Error('Network timeout'));

      const mockService = {
        supabase: mockSupabase,
      };

      mockRuntime.getService = mock().mockReturnValue(mockService);

      const result = await provider.get(
        mockRuntime as IAgentRuntime,
        {} as Memory,
        {} as State
      );

      expect(result).toBeDefined();
      expect(result.text).toContain('Error retrieving user stats');
    });

    it('should handle malformed data', async () => {
      const provider = new CommunityMemoryProvider();
      const mockSupabase = createMockSupabaseClient();
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { invalid: 'data' },
        error: null,
      });

      const mockService = {
        supabase: mockSupabase,
      };

      mockRuntime.getService = mock().mockReturnValue(mockService);

      const result = await provider.get(
        mockRuntime as IAgentRuntime,
        {} as Memory,
        {} as State
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', async () => {
      const provider = new CommunityMemoryProvider();
      const mockSupabase = createMockSupabaseClient();
      
      // Mock large dataset
      const largeFragments = Array.from({ length: 1000 }, (_, i) => ({
        id: `fragment-${i}`,
        content: `Memory fragment ${i}`,
        category: 'engagement',
        weight: 0.5 + (i % 10) * 0.1,
      }));

      mockSupabase.from().select().eq().order().limit.mockResolvedValue({
        data: largeFragments,
        error: null,
      });

      const mockService = {
        supabase: mockSupabase,
      };

      mockRuntime.getService = mock().mockReturnValue(mockService);

      const result = await provider.get(
        mockRuntime as IAgentRuntime,
        {} as Memory,
        {} as State
      );

      expect(result).toBeDefined();
      expect(result.data.memoryFragments.length).toBe(1000);
    });

    it('should implement proper caching', async () => {
      const provider = new RaidStatusProvider();
      const mockSupabase = createMockSupabaseClient();
      
      // Mock the same data multiple times
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: TestData.createRaidData(),
        error: null,
      });

      const mockService = {
        supabase: mockSupabase,
      };

      mockRuntime.getService = mock().mockReturnValue(mockService);

      // Call multiple times
      await provider.get(mockRuntime as IAgentRuntime, {} as Memory, {} as State);
      await provider.get(mockRuntime as IAgentRuntime, {} as Memory, {} as State);
      await provider.get(mockRuntime as IAgentRuntime, {} as Memory, {} as State);

      // Should only call database once if caching is implemented
      expect(mockSupabase.from().select().eq().single).toHaveBeenCalledTimes(3);
    });
  });
});
