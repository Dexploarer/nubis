import {
  Action,
  IAgentRuntime,
  Memory,
  State,
  HandlerCallback,
  elizaLogger,
  ActionResult,
} from "@elizaos/core";
import { CommunityMemoryService } from "../services/community-memory-service";

export const startRaidAction: Action = {
  name: "START_RAID",
  similes: [
    "START_TWITTER_RAID",
    "INITIATE_RAID", 
    "BEGIN_RAID",
    "LAUNCH_RAID",
    "CREATE_RAID"
  ],
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const text = message.content.text?.toLowerCase() || '';
    
    // Check if message contains raid-related keywords and a Twitter URL
    const hasRaidKeywords = text.includes("start raid") || 
           text.includes("launch raid") ||
           text.includes("begin raid") ||
           text.includes("initiate raid") ||
           (text.includes("raid") && (text.includes("this") || text.includes("let's")));
    
    // Check for Twitter/X URLs
    const hasTwitterUrl = /https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/i.test(text);
    
    return hasRaidKeywords || hasTwitterUrl;
  },
  description: "Start a new Twitter raid with the community",
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown },
    callback?: HandlerCallback
  ): Promise<ActionResult> => {
    try {
      elizaLogger.info("Starting raid action handler");

      // Extract Twitter URL from message
      const urlRegex = /(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/i;
      const match = message.content.text?.match(urlRegex);
      
      if (!match) {
        if (callback) {
          callback({
            text: "🎯 I need a Twitter/X URL to start a raid! Share the tweet you'd like our community to raid and I'll coordinate the attack! 🚀\n\nJust paste the Twitter link and I'll handle the rest! 💪",
            content: { action: 'start_raid_missing_url' }
          });
        }
        return { success: false, text: 'Missing Twitter/X URL to start raid' } as ActionResult;
      }

      let twitterUrl = match[0];
      if (!twitterUrl.startsWith('http')) {
        twitterUrl = 'https://' + twitterUrl;
      }

      // Get raid coordinator service URL
      const raidCoordinatorUrl = runtime.getSetting("RAID_COORDINATOR_URL");
      if (!raidCoordinatorUrl) {
        throw new Error("Raid coordinator URL not configured");
      }

      // Start the raid via Edge Function
      const response = await fetch(raidCoordinatorUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_raid',
          twitterUrl: twitterUrl,
          userId: message.entityId,
          username: message.content.source || runtime.character?.name || "agent",
          platform: 'elizaos'
        })
      });

      const result = await response.json();

      if (result.success) {
        // Record the raid initiation in community memory
        const memoryService = runtime.getService<CommunityMemoryService>("COMMUNITY_MEMORY_SERVICE");
        if (memoryService) {
          await memoryService.recordInteraction({
            id: crypto.randomUUID(),
            userId: message.entityId,
            username: message.content.source || "user",
            interactionType: 'raid_initiation',
            content: `Started raid for: ${twitterUrl}`,
            context: { twitterUrl, raidId: result.raidId, platform: 'elizaos' },
            weight: 2.0,
            sentimentScore: 0.8,
            relatedRaidId: result.raidId,
            timestamp: new Date()
          });
        }

        if (callback) {
          const raidMessage = `🎯 **RAID INITIATED!** 🎯\n\n` +
            `**Target:** ${twitterUrl}\n` +
            `**Raid ID:** \`${result.raidId}\`\n` +
            `**Duration:** 60 minutes\n` +
            `**Strategy:** Community Coordination\n\n` +
            `**🏆 POINT SYSTEM:**\n` +
            `👍 Like = 1 point\n` +
            `🔄 Retweet = 2 points\n` +
            `💬 Quote Tweet = 3 points\n` +
            `📝 Comment = 5 points\n\n` +
            `**📋 MISSION BRIEFING:**\n` +
            `1️⃣ Go to the target tweet\n` +
            `2️⃣ Engage authentically (no spam!)\n` +
            `3️⃣ Report back with your actions\n` +
            `4️⃣ Earn points and climb the leaderboard\n\n` +
            `**🚀 TELEGRAM INTEGRATION:**\n` +
            `Head to our Telegram channel and use:\n` +
            `\`/raid ${twitterUrl}\`\n\n` +
            `**Let's dominate this together!** Our community's engagement power is about to make waves! 🌊\n\n` +
            `*"When we raid, we don't just engage - we elevate the conversation!"* 💪`;

          callback({
            text: raidMessage,
            content: {
              action: 'raid_started',
              raidId: result.raidId,
              twitterUrl: twitterUrl,
              points: {
                like: 1,
                retweet: 2,
                quote: 3,
                comment: 5
              }
            }
          });
        }
        
        return { success: true, text: 'Raid started successfully' } as ActionResult;
      } else {
        if (callback) {
          callback({
            text: "❌ Failed to start raid. Please try again or contact support.",
            content: { action: 'raid_start_failed', error: result.error }
          });
        }
        return { success: false, text: 'Failed to start raid' } as ActionResult;
      }
    } catch (error) {
      elizaLogger.error("Error in start raid action:", error);
      
      if (callback) {
        callback({
          text: "❌ Failed to start raid due to an error. Please try again.",
          content: { action: 'raid_start_error', error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
      
      return { success: false, text: 'Error starting raid' } as ActionResult;
    }
  },
  examples: [
    [
      {
        name: "{{user1}}",
        content: {
          text: "Let's raid this tweet: https://twitter.com/elonmusk/status/1234567890"
        }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "🎯 **RAID INITIATED!** 🎯\n\n**Target:** https://twitter.com/elonmusk/status/1234567890\n**Raid ID:** `raid_abc123`\n**Duration:** 60 minutes\n\n**🏆 POINT SYSTEM:**\n👍 Like = 1 point\n🔄 Retweet = 2 points\n💬 Quote Tweet = 3 points\n📝 Comment = 5 points\n\n**Let's dominate this together!** Our community's engagement power is about to make waves! 🌊",
          action: "START_RAID"
        }
      }
    ],
    [
      {
        name: "{{user1}}",
        content: {
          text: "Start raid on this https://x.com/jack/status/9876543210"
        }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "🚀 **RAID LAUNCHING!** 🚀\n\nTarget locked: https://x.com/jack/status/9876543210\n\n**Mission briefing:**\n• Engage authentically \n• Report your actions\n• Earn points and glory!\n\n**Rally the troops in Telegram!** Use `/raid https://x.com/jack/status/9876543210` 💪",
          action: "START_RAID"
        }
      }
    ],
    [
      {
        name: "{{user1}}",
        content: {
          text: "Can we do a community raid?"
        }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "🎯 Absolutely! I'm ready to coordinate an epic community raid! 🚀\n\nJust share the Twitter/X URL of the tweet you want us to raid and I'll handle the rest!\n\nOur community will:\n• Engage authentically\n• Earn points for participation\n• Dominate the conversation! 💪\n\nWhat's our target? 🔥",
          action: "START_RAID"
        }
      }
    ]
  ]
};
