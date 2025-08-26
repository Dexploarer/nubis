import { Evaluator, IAgentRuntime, Memory, logger} from "@elizaos/core";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function jaccard(a: Set<string>, b: Set<string>): number {
  const inter = new Set([...a].filter(x => b.has(x))).size;
  const union = new Set([...a, ...b]).size;
  if (union === 0) return 0;
  return inter / union;
}

export const ContentRelevanceEvaluator: Evaluator = {
  name: "CONTENT_RELEVANCE",
  similes: ["RELEVANCE_EVALUATOR", "COMMENT_RELEVANCE", "QUOTE_RELEVANCE"],
  description: "Scores how relevant user comments/quotes are to the raid’s target content",
  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = (message.content?.text || "").toLowerCase();
    const target = (message.content as any)?.targetContent || (message.content as any)?.referenceText || "";
    if (!text) return false;
    const triggers = ["comment", "quote", "reply", "retweet", "analysis", "discuss", "engage"];
    return triggers.some(t => text.includes(t)) || !!target;
  },
  handler: async (_runtime: IAgentRuntime, message: Memory): Promise<void> => {
    try {
      const userText = (message.content?.text || "").trim();
      const targetContent = (message.content as any)?.targetContent || (message.content as any)?.referenceText || "";

      const userTokens = new Set(tokenize(userText));
      const targetTokens = new Set(tokenize(targetContent));

      // Base relevance via Jaccard
      let relevance = jaccard(userTokens, targetTokens);

      const indicators: string[] = [];
      if (relevance >= 0.5) indicators.push("high_token_overlap");
      else if (relevance >= 0.25) indicators.push("moderate_token_overlap");
      else indicators.push("low_token_overlap");

      // Extra signals: presence of topic/keywords if provided
      const topics: string[] = (message.content as any)?.topics || [];
      const hasTopicMatch = topics.some(t => userTokens.has(String(t).toLowerCase()));
      if (hasTopicMatch) {
        relevance = Math.min(1, relevance + 0.1);
        indicators.push("topic_match");
      }

      // Penalize generic phrases
      const genericPhrases = ["great post", "nice", "cool", "awesome", "gm", "gn", "love it"];
      if (genericPhrases.some(p => userText.toLowerCase().includes(p))) {
        relevance = Math.max(0, relevance - 0.1);
        indicators.push("generic_phrase_penalty");
      }

      (message as any).content = {
        ...message.content,
        evaluation: {
          type: "content_relevance",
          score: Number(relevance.toFixed(3)),
          indicators,
          targetProvided: Boolean(targetContent),
          timestamp: new Date()
        }
      };

      logger.debug(`Content relevance score: ${relevance.toFixed(2)}`);
      return;
    } catch (err) {
      logger.error("ContentRelevanceEvaluator error:", err);
      return;
    }
  },
  examples: [
    {
      context: "User quotes with analysis closely matching target topic",
      messages: [
        { name: "{{user1}}", content: { text: "Quoted with analysis about scalability and community-led growth.", targetContent: "This thread discusses community-led scalable growth models." } }
      ],
      outcome: "High relevance due to topic overlap"
    },
    {
      context: "Generic praise without substance",
      messages: [
        { name: "{{user1}}", content: { text: "Awesome! Love it!" } }
      ],
      outcome: "Low relevance; generic_phrase_penalty applies"
    }
  ] as any
};
