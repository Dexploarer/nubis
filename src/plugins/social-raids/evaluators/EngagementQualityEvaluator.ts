import { Evaluator, IAgentRuntime, Memory, elizaLogger } from "@elizaos/core";

export const EngagementQualityEvaluator: Evaluator = {
  name: "ENGAGEMENT_QUALITY_EVALUATOR",
  similes: ["QUALITY_EVALUATOR", "ENGAGEMENT_ASSESSOR", "RAID_EVALUATOR"],
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = message.content.text.toLowerCase();
    return text.includes('engag') ||
           text.includes('raid') ||
           text.includes('tweet') ||
           text.includes('like') ||
           text.includes('retweet') ||
           text.includes('comment') ||
           text.includes('quote');
  },
  description: "Evaluates the quality of user engagement in raids and social interactions",
  handler: async (runtime: IAgentRuntime, message: Memory): Promise<Memory[]> => {
    try {
      const text = message.content.text.toLowerCase();
      let engagementScore = 0.5; // Base score
      let qualityIndicators: string[] = [];
      
      // Analyze content quality
      const contentLength = text.length;
      
      // Length-based scoring
      if (contentLength > 100) {
        engagementScore += 0.2;
        qualityIndicators.push('detailed_content');
      } else if (contentLength < 20) {
        engagementScore -= 0.1;
        qualityIndicators.push('brief_content');
      }
      
      // Quality language indicators
      const qualityWords = [
        'because', 'however', 'therefore', 'although', 'moreover',
        'furthermore', 'specifically', 'particularly', 'detailed',
        'explanation', 'example', 'solution', 'approach', 'insightful',
        'thoughtful', 'comprehensive', 'analysis', 'perspective'
      ];
      
      let qualityWordCount = 0;
      qualityWords.forEach(word => {
        if (text.includes(word)) {
          qualityWordCount++;
        }
      });
      
      if (qualityWordCount > 0) {
        engagementScore += Math.min(0.3, qualityWordCount * 0.1);
        qualityIndicators.push('quality_language');
      }
      
      // Engagement type detection and scoring
      const engagementTypes: Record<string, number> = {
        'comment': 0.4, // Highest value
        'quote': 0.3,
        'retweet': 0.2,
        'like': 0.1,
        'share': 0.2
      };
      
      let detectedEngagement = '';
      let maxEngagementValue = 0;
      
      for (const [type, value] of Object.entries(engagementTypes)) {
        if (text.includes(type) && value > maxEngagementValue) {
          detectedEngagement = type;
          maxEngagementValue = value;
        }
      }
      
      if (detectedEngagement) {
        engagementScore += maxEngagementValue;
        qualityIndicators.push(`${detectedEngagement}_engagement`);
      }
      
      // Community context bonus
      const communityWords = ['community', 'together', 'us', 'we', 'team', 'help', 'support'];
      const hasCommunityContext = communityWords.some(word => text.includes(word));
      if (hasCommunityContext) {
        engagementScore += 0.15;
        qualityIndicators.push('community_focused');
      }
      
      // Authenticity detection (avoid obvious spam/bot patterns)
      const spamIndicators = ['follow me', 'check out', 'buy now', 'click here', '100%', '!!!'];
      const hasSpamIndicators = spamIndicators.some(indicator => text.includes(indicator));
      if (hasSpamIndicators) {
        engagementScore -= 0.3;
        qualityIndicators.push('potential_spam');
      }
      
      // Emotional intelligence indicators
      const emotionalWords = ['feel', 'think', 'believe', 'appreciate', 'understand', 'respect'];
      const hasEmotionalIntelligence = emotionalWords.some(word => text.includes(word));
      if (hasEmotionalIntelligence) {
        engagementScore += 0.1;
        qualityIndicators.push('emotional_intelligence');
      }
      
      // Normalize score between 0 and 1
      engagementScore = Math.max(0, Math.min(1, engagementScore));
      
      // Determine quality tier
      let qualityTier: string;
      let feedback: string;
      
      if (engagementScore >= 0.8) {
        qualityTier = 'exceptional';
        feedback = 'Exceptional quality engagement - thoughtful, detailed, and community-focused';
      } else if (engagementScore >= 0.65) {
        qualityTier = 'high';
        feedback = 'High quality engagement - meaningful contribution with good depth';
      } else if (engagementScore >= 0.5) {
        qualityTier = 'good';
        feedback = 'Good engagement - solid participation with room for enhancement';
      } else if (engagementScore >= 0.35) {
        qualityTier = 'basic';
        feedback = 'Basic engagement - consider adding more context or personal insight';
      } else {
        qualityTier = 'low';
        feedback = 'Low quality engagement - needs significant improvement for community value';
      }
      
      // Create evaluation memory
      const evaluatedMemory: Memory = {
        ...message,
        content: {
          ...message.content,
          evaluation: {
            type: 'engagement_quality',
            score: engagementScore,
            qualityTier: qualityTier,
            feedback: feedback,
            indicators: qualityIndicators,
            engagementType: detectedEngagement || 'unknown',
            bonusEligible: engagementScore >= 0.7,
            timestamp: new Date()
          }
        }
      };
      
      elizaLogger.debug(`Engagement quality evaluation: ${engagementScore.toFixed(2)} (${qualityTier})`);
      
      return [evaluatedMemory];
      
    } catch (error) {
      elizaLogger.error("EngagementQualityEvaluator error:", error);
      return [message];
    }
  },
  examples: [
    {
      context: "User submitted a retweet with thoughtful commentary",
      messages: [
        {
          user: "{{user1}}",
          content: {
            text: "Retweeted with: 'This is exactly why our community values authentic engagement over numbers. Quality discourse builds lasting connections, and I believe this approach will help us create something truly meaningful together.' 🎯"
          }
        }
      ],
      outcome: "High quality engagement detected - thoughtful commentary adds significant value (Score: 0.85)"
    },
    {
      context: "User submitted basic engagement report",
      messages: [
        {
          user: "{{user1}}",
          content: {
            text: "liked it"
          }
        }
      ],
      outcome: "Basic engagement detected - brief but authentic participation (Score: 0.4)"
    },
    {
      context: "User provides detailed analysis with engagement",
      messages: [
        {
          user: "{{user1}}",
          content: {
            text: "I commented with a detailed analysis of why this approach works: The strategy outlined here specifically addresses the community engagement challenge we discussed. Furthermore, the implementation seems thoughtful because it considers both quality and scalability. This could help our community grow sustainably."
          }
        }
      ],
      outcome: "Exceptional quality engagement - comprehensive analysis with community focus (Score: 0.92)"
    }
  ]
};
