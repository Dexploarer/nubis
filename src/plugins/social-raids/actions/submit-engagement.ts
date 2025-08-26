import {
  Action,
  IAgentRuntime,
  Memory,
  State,
  HandlerCallback,
  ActionResult, elizaLogger} from "@elizaos/core";
import type { CommunityMemoryService } from "../services/community-memory-service";
import type { SubmitEngagementResponse } from "../types";

const getPointsForAction = (action: string): number => {
  const pointsMap: Record<string, number> = {
    like: 1,
    retweet: 2,
    quote: 3,
    comment: 5,
    share: 2
  };
  return pointsMap[action] || 1;
};

const getEmojiForAction = (action: string): string => {
  const emojiMap: Record<string, string> = {
    like: '👍',
    retweet: '🔄',
    quote: '💬',
    comment: '📝',
    share: '📤'
  };
  return emojiMap[action] || '⚡';
};

export const submitEngagementAction: Action = {
  name: "SUBMIT_ENGAGEMENT",
  similes: [
    "REPORT_ENGAGEMENT",
    "LOG_ENGAGEMENT", 
    "RECORD_ACTION",
    "SUBMIT_ACTION",
    "ENGAGEMENT_DONE"
  ],
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const text = message.content?.text?.toLowerCase() || '';

    // direct command phrasing from tests: "submit engagement like for raid session-123"
    const directSubmit = text.includes('submit engagement');

    // Check for engagement keywords
    const hasEngagementWords = directSubmit || text.includes("liked") || text.includes("retweeted") || 
            text.includes("quoted") || text.includes("commented") ||
            text.includes("engaged") || text.includes("done") ||
            text.includes("shared") || text.includes("replied");
    
    // Check for context (tweet/post/it reference) or explicit raid mention
    const hasContext = text.includes("tweet") || text.includes("post") || 
                      text.includes("it") || text.includes("that") ||
                      text.includes("link") || text.includes('for raid') || text.includes('raid ');
    
    return hasEngagementWords && hasContext;
  },
  description: "Submit engagement proof for raid participation and earn points",
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown },
    callback?: HandlerCallback
  ): Promise<ActionResult> => {
    try {
      elizaLogger.info("Processing engagement submission");

      // Detect engagement type from message
      const text = message.content?.text?.toLowerCase() || '';
      let engagementType = 'like'; // default
      
      if (text.includes('retweeted') || text.includes('retweet')) engagementType = 'retweet';
      else if (text.includes('quoted') || text.includes('quote')) engagementType = 'quote';  
      else if (text.includes('commented') || text.includes('comment') || text.includes('replied')) engagementType = 'comment';
      else if (text.includes('shared') || text.includes('share')) engagementType = 'share';

      const raidCoordinatorUrl = runtime.getSetting("RAID_COORDINATOR_URL");
      if (!raidCoordinatorUrl) {
        throw new Error("Raid coordinator URL not configured");
      }

      const response = await fetch(raidCoordinatorUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_engagement',
          userId: message.entityId,
          username: message.content?.source || "user",
          engagementType: engagementType,
          platform: 'elizaos'
        })
      });

      const result = await response.json() as SubmitEngagementResponse;

      if (result.success) {
        const points = getPointsForAction(engagementType);
        const emoji = getEmojiForAction(engagementType);
        
        // Record engagement in community memory
        const memoryService = runtime.getService<CommunityMemoryService>("COMMUNITY_MEMORY_SERVICE");
        if (memoryService) {
          await memoryService.recordInteraction({
            id: crypto.randomUUID(),
            userId: message.entityId,
            username: message.content?.source || "user",
            interactionType: 'quality_engagement',
            content: `Submitted ${engagementType} engagement`,
            context: { engagementType, points, raidId: result.raidId },
            weight: points / 2, // Engagement weight based on points
            sentimentScore: 0.8,
            relatedRaidId: result.raidId,
            timestamp: new Date()
          });
        }

        if (callback) {
          const rankChange = result.rankChange || 0;
          const rankText = rankChange > 0 ? `📈 +${rankChange} rank positions!` :
                          rankChange < 0 ? `📉 ${Math.abs(rankChange)} rank positions` :
                          '📊 Rank maintained';

          callback({
            text: `🎉 **ENGAGEMENT CONFIRMED!** 🎉\n\n` +
                  `${emoji} **${engagementType.toUpperCase()}** successfully recorded!\n\n` +
                  `**📊 SCORE UPDATE:**\n` +
                  `🏆 Points Earned: **+${points}**\n` +
                  `💰 Total Points: **${result.totalPoints || 'N/A'}**\n` +
                  `🥇 Current Rank: **#${result.rank || 'N/A'}**\n` +
                  `${rankText}\n\n` +
                  `**🔥 IMPACT ANALYSIS:**\n` +
                  `${points >= 5 ? '🌟 HIGH VALUE' : points >= 3 ? '⭐ QUALITY' : '✨ SOLID'} engagement detected!\n` +
                  `${result.streak ? `🎯 Streak: ${result.streak} actions\n` : ''}` +
                  `${result.bonusPoints ? `🎁 Bonus: +${result.bonusPoints} pts\n` : ''}` +
                  `\n**Outstanding work, champion!** 🏆\n` +
                  `Every engagement strengthens our community's voice! Keep the momentum blazing! 🔥\n\n` +
                  `*"Quality over quantity - you're setting the standard!"* 💪`,
            content: {
              engagementType,
              points,
              totalPoints: result.totalPoints,
              rank: result.rank,
              rankChange,
              streak: result.streak,
              bonusPoints: result.bonusPoints,
              action: 'engagement_submitted'
            }
          });
        }

        return { success: true, text: "Engagement submitted successfully" };
      } else {
        throw new Error(result.error || "Failed to submit engagement");
      }
    } catch (error) {
      elizaLogger.error("Submit engagement action failed:", error);
      
      if (callback) {
        callback({
          text: "⚠️ **ENGAGEMENT SUBMISSION FAILED!** ⚠️\n\n" +
                "Couldn't record your engagement right now, soldier! 🪖\n\n" +
                "**Possible issues:**\n" +
                "🎯 No active raid to submit to\n" +
                "🔐 You haven't joined the current raid yet\n" +
                "🌐 System temporarily overloaded\n\n" +
                "**Quick fixes:**\n" +
                "• Use `join raid` to participate first\n" +
                "• Check if there's an active raid running\n" +
                "• Try again in a moment\n\n" +
                "**Your engagement still counts!** The community appreciates your participation even if the system hiccuped! 💪",
          content: { 
            error: error.message,
            action: 'engagement_failed',
            suggestions: ['join_raid_first', 'check_active_raids', 'retry_later']
          }
        });
      }
      
      return { success: false, text: "Failed to submit engagement" };
    }
  },
  examples: [
    [
      {
        name: "{{user1}}",
        content: {
          text: "I liked and retweeted the post!"
        }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "🎉 **ENGAGEMENT CONFIRMED!** 🎉\n\n🔄 **RETWEET** successfully recorded!\n\n**📊 SCORE UPDATE:**\n🏆 Points Earned: **+2**\n💰 Total Points: **47**\n🥇 Current Rank: **#12**\n📈 +2 rank positions!\n\n**Outstanding work, champion!** 🏆",
          action: "SUBMIT_ENGAGEMENT"
        }
      }
    ],
    [
      {
        name: "{{user1}}",
        content: {
          text: "Done! I commented on that tweet with my thoughts"
        }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "🎉 **ENGAGEMENT CONFIRMED!** 🎉\n\n📝 **COMMENT** successfully recorded!\n\n**📊 SCORE UPDATE:**\n🏆 Points Earned: **+5**\n💰 Total Points: **82**\n🥇 Current Rank: **#7**\n\n**🔥 IMPACT ANALYSIS:**\n🌟 HIGH VALUE engagement detected!\n\n*\"Quality over quantity - you're setting the standard!\"* 💪",
          action: "SUBMIT_ENGAGEMENT"
        }
      }
    ]
  ]
};
