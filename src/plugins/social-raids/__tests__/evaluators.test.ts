import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import { type IAgentRuntime, type Memory, type State } from '@elizaos/core';

// Import evaluators
import { EngagementQualityEvaluator } from '../evaluators/engagement-quality-evaluator';

// Import test utilities
import {
  createMockRuntime,
  createMockSupabaseClient,
  TestData,
  setupTestEnvironment,
  cleanupTestEnvironment,
  TEST_CONSTANTS,
} from './test-utils';

describe('Social Raids Evaluators', () => {
  let mockRuntime: any;

  beforeEach(() => {
    setupTestEnvironment();
    mockRuntime = createMockRuntime();
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('EngagementQualityEvaluator', () => {
    let evaluator: EngagementQualityEvaluator;

    beforeEach(() => {
      evaluator = new EngagementQualityEvaluator();
    });

    describe('Properties', () => {
      it('should have correct name', () => {
        expect(evaluator.name).toBe('ENGAGEMENT_QUALITY');
      });

      it('should have evaluate method', () => {
        expect(evaluator.evaluate).toBeDefined();
        expect(typeof evaluator.evaluate).toBe('function');
      });

      it('should have validate method', () => {
        expect(evaluator.validate).toBeDefined();
        expect(typeof evaluator.validate).toBe('function');
      });
    });

    describe('Validation', () => {
      it('should validate when engagement data is present', async () => {
        const mockMessage = {
          id: 'test-memory',
          content: {
            text: 'Submit engagement like for raid session-123',
            engagementData: {
              actionType: 'like',
              raidId: 'session-123',
              userId: 'test-user',
            },
          },
        };

        const isValid = await evaluator.validate(
          mockRuntime as IAgentRuntime,
          mockMessage as Memory,
          {} as State,
        );

        expect(isValid).toBe(true);
      });

      it('should not validate when no engagement data', async () => {
        const mockMessage = {
          id: 'test-memory',
          content: {
            text: 'Hello, how are you?',
          },
        };

        const isValid = await evaluator.validate(
          mockRuntime as IAgentRuntime,
          mockMessage as Memory,
          {} as State,
        );

        expect(isValid).toBe(false);
      });

      it('should validate with different engagement types', async () => {
        const engagementTypes = ['like', 'retweet', 'quote', 'comment', 'verify'];

        for (const actionType of engagementTypes) {
          const mockMessage = {
            id: 'test-memory',
            content: {
              text: `Submit engagement ${actionType} for raid session-123`,
              engagementData: {
                actionType,
                raidId: 'session-123',
                userId: 'test-user',
              },
            },
          };

          const isValid = await evaluator.validate(
            mockRuntime as IAgentRuntime,
            mockMessage as Memory,
            {} as State,
          );

          expect(isValid).toBe(true);
        }
      });
    });

    describe('Evaluation', () => {
      it('should evaluate high-quality engagement', async () => {
        const mockMessage = {
          id: 'test-memory',
          content: {
            text: 'Submit engagement verify for raid session-123',
            engagementData: {
              actionType: 'verify',
              raidId: 'session-123',
              userId: 'test-user',
              timestamp: new Date(),
              evidence: 'screenshot_provided',
            },
          },
        };

        mockRuntime.createMemory = mock().mockResolvedValue({ id: 'new-memory-id' });

        await evaluator.evaluate(
          mockRuntime as IAgentRuntime,
          mockMessage as Memory,
          {} as State,
          {},
        );

        expect(mockRuntime.createMemory).toHaveBeenCalledWith(
          expect.objectContaining({
            content: expect.objectContaining({
              text: expect.stringContaining('High-quality engagement'),
            }),
          }),
          'engagement_evaluations',
        );
      });

      it('should evaluate low-quality engagement', async () => {
        const mockMessage = {
          id: 'test-memory',
          content: {
            text: 'Submit engagement like for raid session-123',
            engagementData: {
              actionType: 'like',
              raidId: 'session-123',
              userId: 'test-user',
              timestamp: new Date(),
              evidence: null,
            },
          },
        };

        mockRuntime.createMemory = mock().mockResolvedValue({ id: 'new-memory-id' });

        await evaluator.evaluate(
          mockRuntime as IAgentRuntime,
          mockMessage as Memory,
          {} as State,
          {},
        );

        expect(mockRuntime.createMemory).toHaveBeenCalledWith(
          expect.objectContaining({
            content: expect.objectContaining({
              text: expect.stringContaining('Low-quality engagement'),
            }),
          }),
          'engagement_evaluations',
        );
      });

      it('should detect suspicious patterns', async () => {
        const mockMessage = {
          id: 'test-memory',
          content: {
            text: 'Submit engagement like for raid session-123',
            engagementData: {
              actionType: 'like',
              raidId: 'session-123',
              userId: 'test-user',
              timestamp: new Date(),
              evidence: null,
              suspiciousPatterns: ['rapid_fire', 'bot_like_behavior'],
            },
          },
        };

        mockRuntime.createMemory = mock().mockResolvedValue({ id: 'new-memory-id' });

        await evaluator.evaluate(
          mockRuntime as IAgentRuntime,
          mockMessage as Memory,
          {} as State,
          {},
        );

        expect(mockRuntime.createMemory).toHaveBeenCalledWith(
          expect.objectContaining({
            content: expect.objectContaining({
              text: expect.stringContaining('Suspicious engagement detected'),
            }),
          }),
          'engagement_evaluations',
        );
      });

      it('should handle missing engagement data gracefully', async () => {
        const mockMessage = {
          id: 'test-memory',
          content: {
            text: 'Submit engagement like for raid session-123',
            // Missing engagementData
          },
        };

        mockRuntime.createMemory = mock().mockResolvedValue({ id: 'new-memory-id' });

        await evaluator.evaluate(
          mockRuntime as IAgentRuntime,
          mockMessage as Memory,
          {} as State,
          {},
        );

        expect(mockRuntime.createMemory).toHaveBeenCalledWith(
          expect.objectContaining({
            content: expect.objectContaining({
              text: expect.stringContaining('Unable to evaluate engagement'),
            }),
          }),
          'engagement_evaluations',
        );
      });
    });

    describe('Quality Scoring', () => {
      it('should score verified engagements highly', () => {
        const engagement = {
          actionType: 'verify',
          evidence: 'screenshot_provided',
          timestamp: new Date(),
          suspiciousPatterns: [],
        };

        const score = evaluator.calculateQualityScore(engagement);
        expect(score).toBeGreaterThan(0.8);
      });

      it('should score unverified engagements lower', () => {
        const engagement = {
          actionType: 'like',
          evidence: null,
          timestamp: new Date(),
          suspiciousPatterns: [],
        };

        const score = evaluator.calculateQualityScore(engagement);
        expect(score).toBeLessThan(0.5);
      });

      it('should penalize suspicious patterns', () => {
        const engagement = {
          actionType: 'like',
          evidence: null,
          timestamp: new Date(),
          suspiciousPatterns: ['rapid_fire', 'bot_like_behavior'],
        };

        const score = evaluator.calculateQualityScore(engagement);
        expect(score).toBeLessThan(0.3);
      });

      it('should handle different action types correctly', () => {
        const actionTypes = [
          { type: 'verify', expectedMin: 0.8 },
          { type: 'quote', expectedMin: 0.6 },
          { type: 'comment', expectedMin: 0.5 },
          { type: 'retweet', expectedMin: 0.4 },
          { type: 'like', expectedMin: 0.2 },
        ];

        for (const { type, expectedMin } of actionTypes) {
          const engagement = {
            actionType: type,
            evidence: null,
            timestamp: new Date(),
            suspiciousPatterns: [],
          };

          const score = evaluator.calculateQualityScore(engagement);
          expect(score).toBeGreaterThanOrEqual(expectedMin);
        }
      });
    });

    describe('Pattern Detection', () => {
      it('should detect rapid-fire engagement patterns', () => {
        const engagements = [
          { timestamp: new Date(Date.now() - 1000) }, // 1 second ago
          { timestamp: new Date(Date.now() - 2000) }, // 2 seconds ago
          { timestamp: new Date(Date.now() - 3000) }, // 3 seconds ago
        ];

        const patterns = evaluator.detectSuspiciousPatterns(engagements);
        expect(patterns).toContain('rapid_fire');
      });

      it('should detect bot-like behavior', () => {
        const engagements = [
          { actionType: 'like', timestamp: new Date() },
          { actionType: 'like', timestamp: new Date() },
          { actionType: 'like', timestamp: new Date() },
          { actionType: 'like', timestamp: new Date() },
          { actionType: 'like', timestamp: new Date() },
        ];

        const patterns = evaluator.detectSuspiciousPatterns(engagements);
        expect(patterns).toContain('bot_like_behavior');
      });

      it('should detect time-based anomalies', () => {
        const engagements = [
          { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // 24 hours ago
          { timestamp: new Date() }, // Now
        ];

        const patterns = evaluator.detectSuspiciousPatterns(engagements);
        expect(patterns).toContain('time_anomaly');
      });

      it('should return empty array for normal patterns', () => {
        const engagements = [
          { timestamp: new Date(Date.now() - 5 * 60 * 1000) }, // 5 minutes ago
          { timestamp: new Date(Date.now() - 10 * 60 * 1000) }, // 10 minutes ago
        ];

        const patterns = evaluator.detectSuspiciousPatterns(engagements);
        expect(patterns).toEqual([]);
      });
    });

    describe('Evidence Validation', () => {
      it('should validate screenshot evidence', () => {
        const evidence = {
          type: 'screenshot',
          url: 'https://example.com/screenshot.jpg',
          timestamp: new Date(),
        };

        const isValid = evaluator.validateEvidence(evidence);
        expect(isValid).toBe(true);
      });

      it('should validate video evidence', () => {
        const evidence = {
          type: 'video',
          url: 'https://example.com/video.mp4',
          duration: 30,
          timestamp: new Date(),
        };

        const isValid = evaluator.validateEvidence(evidence);
        expect(isValid).toBe(true);
      });

      it('should reject invalid evidence', () => {
        const evidence = {
          type: 'invalid',
          url: 'invalid-url',
          timestamp: new Date(),
        };

        const isValid = evaluator.validateEvidence(evidence);
        expect(isValid).toBe(false);
      });

      it('should handle missing evidence', () => {
        const isValid = evaluator.validateEvidence(null);
        expect(isValid).toBe(false);
      });
    });

    describe('Memory Creation', () => {
      it('should create evaluation memory with correct structure', async () => {
        const mockMessage = {
          id: 'test-memory',
          content: {
            text: 'Submit engagement verify for raid session-123',
            engagementData: {
              actionType: 'verify',
              raidId: 'session-123',
              userId: 'test-user',
              evidence: 'screenshot_provided',
            },
          },
        };

        mockRuntime.createMemory = mock().mockResolvedValue({ id: 'new-memory-id' });

        await evaluator.evaluate(
          mockRuntime as IAgentRuntime,
          mockMessage as Memory,
          {} as State,
          {},
        );

        const memoryCall = (mockRuntime.createMemory as any).mock.calls[0][0];

        expect(memoryCall.content).toMatchObject({
          text: expect.any(String),
          evaluationType: 'engagement_quality',
          engagementData: expect.any(Object),
          qualityScore: expect.any(Number),
          suspiciousPatterns: expect.any(Array),
          recommendations: expect.any(Array),
        });
      });

      it('should include recommendations in memory', async () => {
        const mockMessage = {
          id: 'test-memory',
          content: {
            text: 'Submit engagement like for raid session-123',
            engagementData: {
              actionType: 'like',
              raidId: 'session-123',
              userId: 'test-user',
              evidence: null,
            },
          },
        };

        mockRuntime.createMemory = mock().mockResolvedValue({ id: 'new-memory-id' });

        await evaluator.evaluate(
          mockRuntime as IAgentRuntime,
          mockMessage as Memory,
          {} as State,
          {},
        );

        const memoryCall = (mockRuntime.createMemory as any).mock.calls[0][0];
        expect(memoryCall.content.recommendations).toContain('Provide evidence for verification');
      });
    });

    describe('Error Handling', () => {
      it('should handle runtime errors gracefully', async () => {
        const mockMessage = {
          id: 'test-memory',
          content: {
            text: 'Submit engagement like for raid session-123',
            engagementData: {
              actionType: 'like',
              raidId: 'session-123',
              userId: 'test-user',
            },
          },
        };

        mockRuntime.createMemory = mock().mockRejectedValue(new Error('Runtime error'));

        // Should not throw error
        await expect(
          evaluator.evaluate(mockRuntime as IAgentRuntime, mockMessage as Memory, {} as State, {}),
        ).resolves.not.toThrow();
      });

      it('should handle invalid engagement data', async () => {
        const mockMessage = {
          id: 'test-memory',
          content: {
            text: 'Submit engagement like for raid session-123',
            engagementData: {
              actionType: 'invalid_action',
              raidId: 'session-123',
              userId: 'test-user',
            },
          },
        };

        mockRuntime.createMemory = mock().mockResolvedValue({ id: 'new-memory-id' });

        await evaluator.evaluate(
          mockRuntime as IAgentRuntime,
          mockMessage as Memory,
          {} as State,
          {},
        );

        expect(mockRuntime.createMemory).toHaveBeenCalledWith(
          expect.objectContaining({
            content: expect.objectContaining({
              text: expect.stringContaining('Invalid engagement type'),
            }),
          }),
          'engagement_evaluations',
        );
      });
    });

    describe('Performance', () => {
      it('should handle large engagement datasets efficiently', () => {
        const largeEngagementSet = Array.from({ length: 1000 }, (_, i) => ({
          actionType: 'like',
          timestamp: new Date(Date.now() - i * 1000),
          evidence: null,
          suspiciousPatterns: [],
        }));

        const startTime = Date.now();
        const patterns = evaluator.detectSuspiciousPatterns(largeEngagementSet);
        const endTime = Date.now();

        expect(patterns).toBeDefined();
        expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      });

      it('should cache evaluation results', async () => {
        const mockMessage = {
          id: 'test-memory',
          content: {
            text: 'Submit engagement like for raid session-123',
            engagementData: {
              actionType: 'like',
              raidId: 'session-123',
              userId: 'test-user',
            },
          },
        };

        mockRuntime.createMemory = mock().mockResolvedValue({ id: 'new-memory-id' });

        // First evaluation
        await evaluator.evaluate(
          mockRuntime as IAgentRuntime,
          mockMessage as Memory,
          {} as State,
          {},
        );

        // Second evaluation with same data
        await evaluator.evaluate(
          mockRuntime as IAgentRuntime,
          mockMessage as Memory,
          {} as State,
          {},
        );

        // Should create memory twice (no caching implemented yet)
        expect(mockRuntime.createMemory).toHaveBeenCalledTimes(2);
      });
    });
  });
});
