import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import type { IAgentRuntime, Memory, State } from '@elizaos/core';

import { ContentRelevanceEvaluator } from '../evaluators/content-relevance-evaluator';
import { EngagementFraudEvaluator } from '../evaluators/engagement-fraud-evaluator';
import { ParticipationConsistencyEvaluator } from '../evaluators/participation-consistency-evaluator';
import { SpamScoreEvaluator } from '../evaluators/spam-score-evaluator';

import {
  createMockRuntime,
  createMockMemory,
  setupTestEnvironment,
  cleanupTestEnvironment,
} from './test-utils';

describe('Social Raids Evaluators - Additional Coverage', () => {
  let runtime: IAgentRuntime;

  beforeEach(() => {
    setupTestEnvironment();
    runtime = createMockRuntime() as unknown as IAgentRuntime;
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('ContentRelevanceEvaluator', () => {
    it('validate() returns true for comment trigger and for targetContent', async () => {
      const msg1 = createMockMemory({ content: { text: 'Please comment on this' } }) as Memory;
      const msg2 = createMockMemory({ content: { text: '', targetContent: 'target text' } }) as any;

      await expect(ContentRelevanceEvaluator.validate(runtime, msg1 as Memory)).resolves.toBe(true);
      await expect(ContentRelevanceEvaluator.validate(runtime, msg2 as Memory)).resolves.toBe(true);
    });

    it('validate() returns false when no triggers and no target', async () => {
      const msg = createMockMemory({ content: { text: 'hello world' } }) as Memory;
      await expect(ContentRelevanceEvaluator.validate(runtime, msg)).resolves.toBe(false);
    });

    it('handler() attaches evaluation with indicators and targetProvided', async () => {
      const msg = createMockMemory({
        content: {
          text: 'Great post! Awesome thoughts on scaling',
          targetContent: 'A post about scaling communities',
          topics: ['scaling'],
        },
      }) as Memory;

      await ContentRelevanceEvaluator.handler(runtime, msg);

      const evaln = (msg as any).content?.evaluation;
      expect(evaln).toBeDefined();
      expect(evaln.type).toBe('content_relevance');
      expect(typeof evaln.score).toBe('number');
      expect(evaln.targetProvided).toBe(true);
      expect(Array.isArray(evaln.indicators)).toBe(true);
      // should include at least one of these indicators
      expect(
        evaln.indicators.some((x: string) => x === 'topic_match' || x === 'generic_phrase_penalty'),
      ).toBe(true);
    });
  });

  describe('EngagementFraudEvaluator', () => {
    it('validate() returns true with engagement context', async () => {
      const msg = createMockMemory({
        content: { text: 'submit engagement for raid', engagementData: { actionType: 'like' } },
      }) as Memory;
      await expect(EngagementFraudEvaluator.validate(runtime, msg)).resolves.toBe(true);
    });

    it('flags suspicious burst/identical/repeated patterns and sets isFraud=true', async () => {
      const sameTs = new Date();
      const recent = Array.from({ length: 5 }).map(() => ({
        actionType: 'like',
        timestamp: sameTs,
        submissionText: 'nice',
      }));

      const msg = createMockMemory({
        content: {
          text: 'engage raid tweet',
          engagementData: { actionType: 'like', suspiciousPatterns: ['rapid_fire'] },
          recentEngagements: recent,
        },
      }) as Memory;

      await EngagementFraudEvaluator.handler(runtime, msg);

      const evaln = (msg as any).content?.evaluation;
      expect(evaln).toBeDefined();
      expect(evaln.type).toBe('engagement_fraud');
      expect(typeof evaln.score).toBe('number');
      expect(evaln.isFraud).toBe(true);
      const inds = new Set(evaln.indicators as string[]);
      expect(inds.has('suspicious_patterns_flag')).toBe(true);
      expect(inds.has('burst_activity_10s')).toBe(true);
      expect(inds.has('identical_actions_majority')).toBe(true);
      expect(inds.has('repeated_text_patterns')).toBe(true);
      expect(inds.has('same_timestamp_cluster')).toBe(true);
    });

    it('low score and isFraud=false when verified high-value action has evidence', async () => {
      const msg = createMockMemory({
        content: {
          text: 'Submit engagement quote',
          engagementData: { actionType: 'quote', evidence: 'screenshot' },
          recentEngagements: [],
        },
      }) as Memory;

      await EngagementFraudEvaluator.handler(runtime, msg);
      const evaln = (msg as any).content?.evaluation;
      expect(evaln).toBeDefined();
      expect(evaln.isFraud).toBe(false);
    });
  });

  describe('ParticipationConsistencyEvaluator', () => {
    it('validate() returns true when history array provided', async () => {
      const msg = createMockMemory({ content: { text: 'anything', engagementHistory: [] } }) as any;
      await expect(
        ParticipationConsistencyEvaluator.validate(runtime, msg as Memory),
      ).resolves.toBe(true);
    });

    it('flags insufficient_history when fewer than 2 events', async () => {
      const msg = createMockMemory({ content: { text: 'raid', engagementHistory: [{}] } }) as any;
      await ParticipationConsistencyEvaluator.handler(runtime, msg as Memory);
      const evaln = (msg as any).content?.evaluation;
      expect(evaln.flags).toContain('insufficient_history');
      expect(evaln.score).toBe(0.5);
    });

    it('detects high variance, rapid sequence events and session hopping', async () => {
      const now = Date.now();
      const history = [
        { raidId: 'A', timestamp: new Date(now - 3600 * 1000) },
        { raidId: 'B', timestamp: new Date(now - 30 * 1000) },
        { raidId: 'C', timestamp: new Date(now - 5 * 1000) },
        { raidId: 'C', timestamp: new Date(now - 2 * 1000) },
      ];

      const msg = createMockMemory({
        content: { text: 'engage', engagementHistory: history },
      }) as any;
      await ParticipationConsistencyEvaluator.handler(runtime, msg as Memory);
      const evaln = (msg as any).content?.evaluation;
      expect(typeof evaln.score).toBe('number');
      expect(Array.isArray(evaln.flags)).toBe(true);
      // We expect at least these flags to appear for this pattern
      expect(evaln.flags).toEqual(
        expect.arrayContaining(['rapid_sequence_events', 'session_hopping']),
      );
    });
  });

  describe('SpamScoreEvaluator', () => {
    it('validate() returns true on trigger words', async () => {
      const msg = createMockMemory({ content: { text: 'please retweet' } }) as Memory;
      await expect(SpamScoreEvaluator.validate(runtime, msg)).resolves.toBe(true);
    });

    it('assigns high spam score and indicators for spammy text', async () => {
      const spamText =
        'THIS IS A PROMO CLICK HERE!!! BUY NOW!!! FREE GIVEAWAY!!! follow me https://a.com https://b.com';
      const msg = createMockMemory({ content: { text: spamText } }) as Memory;

      await SpamScoreEvaluator.handler(runtime, msg);

      const evaln = (msg as any).content?.evaluation;
      expect(evaln).toBeDefined();
      expect(evaln.type).toBe('spam_score');
      expect(typeof evaln.score).toBe('number');
      expect(evaln.isSpam).toBe(true);
      const inds = new Set(evaln.indicators as string[]);
      expect(inds.has('click here')).toBe(true);
      expect(inds.has('buy now')).toBe(true);
      expect(inds.has('free')).toBe(true);
      expect(inds.has('giveaway')).toBe(true);
      expect(inds.has('promo')).toBe(true);
      expect(inds.has('excessive_exclamations')).toBe(true);
      expect(inds.has('multiple_links')).toBe(true);
      expect(inds.has('all_caps_ratio')).toBe(true);
    });
  });
});
