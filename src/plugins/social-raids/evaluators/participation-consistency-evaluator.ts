import { Evaluator, IAgentRuntime, Memory, elizaLogger } from "@elizaos/core";

interface EngagementLike {
  raidId?: string;
  timestamp?: string | Date;
  actionType?: string;
}

function toDate(d?: string | Date): Date | null {
  if (!d) return null;
  try { return d instanceof Date ? d : new Date(d); } catch { return null; }
}

function coefOfVariation(values: number[]): number {
  if (values.length === 0) return 1;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 1;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);
  return std / mean;
}

export const ParticipationConsistencyEvaluator: Evaluator = {
  name: "PARTICIPATION_CONSISTENCY",
  similes: ["CONSISTENCY_EVALUATOR", "PARTICIPATION_VARIANCE", "ENGAGEMENT_STABILITY"],
  description: "Flags inconsistencies in a user’s engagement patterns across sessions",
  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = (message.content?.text || "").toLowerCase();
    const history = (message.content as any)?.engagementHistory || (message.content as any)?.userEngagements || [];
    return text.includes("raid") || text.includes("engage") || Array.isArray(history);
  },
  handler: async (_runtime: IAgentRuntime, message: Memory): Promise<void> => {
    try {
      const history: EngagementLike[] = (message.content as any)?.engagementHistory || (message.content as any)?.userEngagements || [];

      if (!Array.isArray(history) || history.length < 2) {
        (message as any).content = {
          ...message.content,
          evaluation: {
            type: "participation_consistency",
            score: 0.5,
            flags: ["insufficient_history"],
            timestamp: new Date()
          }
        };
        return;
      }

      const sorted = history
        .map(h => ({ ...h, ts: toDate(h.timestamp) }))
        .filter(h => h.ts)
        .sort((a, b) => (a.ts as Date).getTime() - (b.ts as Date).getTime());

      const intervals: number[] = [];
      for (let i = 1; i < sorted.length; i++) {
        intervals.push(((sorted[i].ts as Date).getTime() - (sorted[i - 1].ts as Date).getTime()) / 1000); // seconds
      }

      const cv = coefOfVariation(intervals);
      // Lower CV => more consistent. Map to score [0..1]
      let score = Math.max(0, Math.min(1, 1 - Math.min(1, cv)));

      const flags: string[] = [];
      if (cv > 0.8) flags.push("high_variance_intervals");
      if (intervals.some(x => x < 5)) flags.push("rapid_sequence_events");

      // Session hopping detection
      const sessionCounts = new Map<string, number>();
      for (const h of history) {
        const sid = String(h.raidId || "unknown");
        sessionCounts.set(sid, (sessionCounts.get(sid) || 0) + 1);
      }
      if (sessionCounts.size >= 3 && history.length / sessionCounts.size < 2) {
        flags.push("session_hopping");
        score = Math.max(0, score - 0.15);
      }

      (message as any).content = {
        ...message.content,
        evaluation: {
          type: "participation_consistency",
          score: Number(score.toFixed(3)),
          flags,
          intervalsCount: intervals.length,
          timestamp: new Date()
        }
      };

      elizaLogger.debug(`Participation consistency score: ${score.toFixed(2)} (cv=${cv.toFixed(2)})`);
      return;
    } catch (err) {
      elizaLogger.error("ParticipationConsistencyEvaluator error:", err);
      return;
    }
  },
  examples: [
    {
      context: "Regularly spaced engagements across one session",
      messages: [
        { name: "{{user1}}", content: { text: "Participated in raid A", engagementHistory: [
          { raidId: "A", timestamp: new Date(Date.now() - 30*60*1000) },
          { raidId: "A", timestamp: new Date(Date.now() - 20*60*1000) },
          { raidId: "A", timestamp: new Date(Date.now() - 10*60*1000) }
        ] } }
      ],
      outcome: "High consistency (low variance intervals)"
    },
    {
      context: "Erratic timings across multiple sessions",
      messages: [
        { name: "{{user1}}", content: { text: "Various engagements", engagementHistory: [
          { raidId: "A", timestamp: new Date(Date.now() - 3600*1000) },
          { raidId: "B", timestamp: new Date(Date.now() - 30*1000) },
          { raidId: "C", timestamp: new Date(Date.now() - 5*1000) }
        ] } }
      ],
      outcome: "Low consistency; flags: rapid_sequence_events, session_hopping"
    }
  ] as any
};
