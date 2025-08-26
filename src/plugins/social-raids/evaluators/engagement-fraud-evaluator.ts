import { Evaluator, IAgentRuntime, Memory, elizaLogger } from "@elizaos/core";

interface RecentEngagement {
  actionType?: string;
  timestamp?: string | Date;
  evidence?: any;
  submissionText?: string;
  suspiciousPatterns?: string[];
}

function toDate(d?: string | Date): Date | null {
  if (!d) return null;
  try { return d instanceof Date ? d : new Date(d); } catch { return null; }
}

export const EngagementFraudEvaluator: Evaluator = {
  name: "ENGAGEMENT_FRAUD",
  similes: ["FRAUD_EVALUATOR", "BOT_DETECTION", "ENGAGEMENT_INTEGRITY"],
  description: "Detects fraudulent/automated engagement (e.g., repeated patterns, no evidence)",
  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = (message.content?.text || "").toLowerCase();
    const hasEngagement = text.includes("engage") || text.includes("raid") || text.includes("tweet");
    const hasContext = Boolean((message.content as any)?.engagementData) || Array.isArray((message.content as any)?.recentEngagements);
    return hasEngagement || hasContext;
  },
  handler: async (_runtime: IAgentRuntime, message: Memory): Promise<void> => {
    try {
      const content: any = message.content || {};
      const engagement = content.engagementData || {} as RecentEngagement;
      const recent: RecentEngagement[] = Array.isArray(content.recentEngagements) ? content.recentEngagements : [];

      let score = 0;
      const indicators: string[] = [];

      // Evidence checks (for higher-value actions)
      const highValue = ["verify", "quote", "comment"];
      if (highValue.includes(String(engagement.actionType || '').toLowerCase()) && !engagement.evidence) {
        score += 0.3;
        indicators.push("no_evidence_high_value");
      }

      // Suspicious patterns flag passed in
      const patterns = new Set<string>([...((engagement.suspiciousPatterns || []) as string[])]);
      if (patterns.has("rapid_fire") || patterns.has("bot_like_behavior")) {
        score += 0.3;
        indicators.push("suspicious_patterns_flag");
      }

      // Burst activity: >= 5 engagements in last 10 seconds
      const now = Date.now();
      const inLast10s = recent.filter(r => {
        const ts = toDate(r.timestamp);
        return ts ? (now - ts.getTime()) <= 10_000 : false;
      });
      if (inLast10s.length >= 5) {
        score += 0.3;
        indicators.push("burst_activity_10s");
      }

      // Identical actions ratio
      const actionCounts = new Map<string, number>();
      for (const r of recent) {
        const key = String(r.actionType || 'unknown').toLowerCase();
        actionCounts.set(key, (actionCounts.get(key) || 0) + 1);
      }
      const total = recent.length || 1;
      const maxCount = Math.max(0, ...Array.from(actionCounts.values()));
      if (total >= 5 && maxCount / total > 0.8) {
        score += 0.1;
        indicators.push("identical_actions_majority");
      }

      // Repeated submission text
      const textMap = new Map<string, number>();
      for (const r of recent) {
        const t = (r.submissionText || '').trim().toLowerCase();
        if (!t) continue;
        textMap.set(t, (textMap.get(t) || 0) + 1);
      }
      const repeatedText = Array.from(textMap.values()).some(v => v >= 3);
      if (repeatedText) {
        score += 0.2;
        indicators.push("repeated_text_patterns");
      }

      // Same timestamp cluster (milliseconds identical) across many entries
      const millisMap = new Map<number, number>();
      for (const r of recent) {
        const ts = toDate(r.timestamp);
        if (!ts) continue;
        const key = ts.getTime();
        millisMap.set(key, (millisMap.get(key) || 0) + 1);
      }
      if (Array.from(millisMap.values()).some(v => v >= 5)) {
        score += 0.25;
        indicators.push("same_timestamp_cluster");
      }

      score = Math.min(1, Math.max(0, score));
      const isFraud = score >= 0.6;

      (message as any).content = {
        ...message.content,
        evaluation: {
          type: "engagement_fraud",
          score,
          isFraud,
          indicators,
          timestamp: new Date()
        }
      };

      elizaLogger.debug(`Engagement fraud score: ${score.toFixed(2)} (${isFraud ? 'fraud' : 'ok'})`);
      return;
    } catch (err) {
      elizaLogger.error("EngagementFraudEvaluator error:", err);
      return;
    }
  },
  examples: [
    {
      context: "Rapid-fire identical likes without evidence",
      messages: [
        { name: "{{user1}}", content: { text: "Submit engagement like", engagementData: { actionType: 'like' }, recentEngagements: [
          { actionType: 'like', timestamp: new Date(), submissionText: 'nice' },
          { actionType: 'like', timestamp: new Date(), submissionText: 'nice' },
          { actionType: 'like', timestamp: new Date(), submissionText: 'nice' },
          { actionType: 'like', timestamp: new Date(), submissionText: 'nice' },
          { actionType: 'like', timestamp: new Date(), submissionText: 'nice' }
        ] } }
      ],
      outcome: "High fraud score with burst_activity_10s, identical_actions_majority, repeated_text_patterns"
    },
    {
      context: "Verified quote with evidence",
      messages: [
        { name: "{{user1}}", content: { text: "Submit engagement quote", engagementData: { actionType: 'quote', evidence: 'screenshot' }, recentEngagements: [] } }
      ],
      outcome: "Low fraud score due to evidence and lack of suspicious patterns"
    }
  ] as any
};
