import {
  Action,
  IAgentRuntime,
  Memory,
  State,
  HandlerCallback,
  elizaLogger,
} from "@elizaos/core";
import { CommunityMemoryService } from "../services/CommunityMemoryService";

export const joinRaidAction: Action = {
  name: "JOIN_RAID",
  similes: [
    "PARTICIPATE_IN_RAID",
    "ENTER_RAID",
    "SIGN_UP_RAID",
    "RAID_JOIN",
    "COUNT_ME_IN"
  ],
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const text = message.content.text.toLowerCase();
    return text.includes("join raid") || 
           text.includes("participate") ||
           text.includes("count me in") ||
           text.includes("i'm in") ||
           (text.includes("raid") && (text.includes("me") || text.includes("join")));
  },
  description: "Join an active raid and become part of the coordinated engagement",
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown },
    callback?: HandlerCallback
  ): Promise<boolean> => {
    try {
      elizaLogger.info("Processing join raid action");

      const raidCoordinatorUrl = runtime.getSetting("RAID_COORDINATOR_URL");
      if (!raidCoordinatorUrl) {
        throw new Error("Raid coordinator URL not configured");
      }

      const response = await fetch(raidCoordinatorUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join_raid',
          userId: message.userId,
          username: message.content.source || "user",
          platform: 'elizaos'
        })
      });

      const result = await response.json();

      if (result.success) {
        // Record participation in community memory
        const memoryService = runtime.getService<CommunityMemoryService>("COMMUNITY_MEMORY_SERVICE");
        if (memoryService) {
          await memoryService.recordInteraction({
            id: crypto.randomUUID(),
            userId: message.userId!,
            username: message.content.source || "user",
            interactionType: 'raid_participation',
            content: 'Joined active raid',
            context: { raidId: result.raidId, participantNumber: result.participantNumber },
            weight: 1.5,
            sentimentScore: 0.7,
            relatedRaidId: result.raidId,
            timestamp: new Date()
          });
        }

        if (callback) {
          callback({
            text: `⚡ **WELCOME TO THE BATTLEFIELD!** ⚡\n\n` +
                  `🎖️ **Soldier #${result.participantNumber}** - You're officially enlisted! 🎖️\n\n` +
                  `**🎯 YOUR MISSION:**\n` +
                  `1️⃣ Hit the target: [${result.targetUrl}](${result.targetUrl})\n` +
                  `2️⃣ Engage authentically (no spam, pure quality!)\n` +
                  `3️⃣ Report back with your engagement type\n` +
                  `4️⃣ Collect points and dominate the leaderboard\n\n` +
                  `**🏆 POINT VALUES:**\n` +
                  `👍 Like = 1 pt | 🔄 Retweet = 2 pts | 💬 Quote = 3 pts | 📝 Comment = 5 pts\n\n` +
                  `**💡 PRO TIPS:**\n` +
                  `• Quality engagement gets bonus points\n` +
                  `• Be authentic, be valuable\n` +
                  `• Help elevate the conversation\n\n` +
                  `**Now go make some noise!** Our community doesn't just engage - we enhance! 🔥\n\n` +
                  `*"Together we raid, together we conquer!"* 💪`,
            content: {
              raidId: result.raidId,
              participantNumber: result.participantNumber,
              targetUrl: result.targetUrl,
              action: 'raid_joined',
              missionStatus: 'active'
            }
          });
        }

        return true;
      } else {
        throw new Error(result.error || "Failed to join raid");
      }
    } catch (error) {
      elizaLogger.error("Join raid action failed:", error);
      
      if (callback) {
        callback({
          text: "⚠️ **NO ACTIVE RAID FOUND!** ⚠️\n\n" +
                "Looks like there's no battle to join right now, soldier! 🪖\n\n" +
                "**Start a new raid by:**\n" +
                "🎯 Sharing a Twitter URL for us to raid\n" +
                "📢 Checking our Telegram channel for active raids\n" +
                "🚀 Being the leader who initiates the next attack\n\n" +
                "**The community is ready when you are!** Drop a Twitter link and let's mobilize! 💪\n\n" +
                "*\"No battles means it's time to create one!\"* 🔥",
          content: { 
            error: error.message,
            action: 'no_active_raid',
            suggestion: 'start_new_raid'
          }
        });
      }
      
      return false;
    }
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "I want to join the raid"
        }
      },
      {
        user: "{{agentName}}",
        content: {
          text: "⚡ **WELCOME TO THE BATTLEFIELD!** ⚡\n\n🎖️ **Soldier #5** - You're officially enlisted! 🎖️\n\n**🎯 YOUR MISSION:**\n1️⃣ Hit the target: [Tweet Link]\n2️⃣ Engage authentically\n3️⃣ Report back for points\n4️⃣ Dominate the leaderboard\n\n**Now go make some noise!** 🔥",
          action: "JOIN_RAID"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Count me in for this raid!"
        }
      },
      {
        user: "{{agentName}}",
        content: {
          text: "🚀 **ENLISTED!** You're now part of the raid squad! \n\nParticipant #3 reporting for duty! 🎖️\n\n**Mission briefing incoming...**\nTarget the tweet, engage with quality, earn points, dominate! 💪\n\n*\"Together we raid, together we conquer!\"*",
          action: "JOIN_RAID"
        }
      }
    ]
  ]
};
