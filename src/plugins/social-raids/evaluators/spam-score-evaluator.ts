import { Evaluator, IAgentRuntime, Memory, elizaLogger } from "@elizaos/core";

export const SpamScoreEvaluator: Evaluator = {
  name: "SPAM_SCORE",
  similes: ["SPAM_EVALUATOR", "LOW_EFFORT_DETECTOR", "SPAM_SCORE_EVAL"],
  description: "Detects low-effort or spammy engagement submissions",
  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = (message.content?.text || "").toLowerCase();
    if (!text) return false;
    const triggers = [
      "engage", "raid", "tweet", "retweet", "comment", "quote", "like",
      "follow", "giveaway", "promo", "check out", "click here"
    ];
    return triggers.some(t => text.includes(t));
  },
  handler: async (_runtime: IAgentRuntime, message: Memory): Promise<void> => {
    try {
      const textRaw = message.content?.text || "";
      const text = textRaw.toLowerCase();

      // Heuristics
      const spamIndicators: string[] = [];
      let score = 0;

      const patterns = [
        { key: "follow me", weight: 0.25 },
        { key: "buy now", weight: 0.3 },
        { key: "click here", weight: 0.25 },
        { key: "free", weight: 0.2 },
        { key: "promo", weight: 0.2 },
        { key: "giveaway", weight: 0.2 }
      ];
      for (const p of patterns) {
        if (text.includes(p.key)) {
          score += p.weight;
          spamIndicators.push(p.key);
        }
      }

      const exclamations = (text.match(/!+/g) || []).join("").length;
      if (exclamations >= 3) { score += 0.15; spamIndicators.push("excessive_exclamations"); }

      const links = (textRaw.match(/https?:\/\/\S+/g) || []).length;
      if (links >= 2) { score += 0.15; spamIndicators.push("multiple_links"); }

      const capsRatio = textRaw ? (textRaw.replace(/[^A-Z]/g, "").length / Math.max(1, textRaw.length)) : 0;
      if (capsRatio > 0.4 && textRaw.length > 12) { score += 0.2; spamIndicators.push("all_caps_ratio"); }

      // Normalize
      score = Math.min(1, Math.max(0, score));
      const isSpam = score >= 0.7;

      // Attach evaluation to message content
      (message as any).content = {
        ...message.content,
        evaluation: {
          type: "spam_score",
          score,
          isSpam,
          indicators: spamIndicators,
          timestamp: new Date()
        }
      };

      elizaLogger.debug(`Spam score evaluation: ${score.toFixed(2)} (${isSpam ? "spam" : "ok"})`);
      return;
    } catch (err) {
      elizaLogger.error("SpamScoreEvaluator error:", err);
      return;
    }
  },
  examples: [
    {
      context: "Low-effort promo submission",
      messages: [
        { name: "{{user1}}", content: { text: "CLICK HERE!!! Free giveaway, follow me and buy now!" } }
      ],
      outcome: "High spam score with indicators: excessive_exclamations, free, follow me, buy now"
    },
    {
      context: "Normal engagement",
      messages: [
        { name: "{{user1}}", content: { text: "I commented thoughtfully on the tweet with my perspective." } }
      ],
      outcome: "Low spam score"
    }
  ] as any
};
