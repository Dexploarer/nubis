import {
  Action,
  IAgentRuntime,
  Memory,
  State,
  HandlerCallback,
  elizaLogger,
  ActionResult,
} from "@elizaos/core";

export const viewLeaderboardAction: Action = {
  name: "VIEW_LEADERBOARD",
  similes: [
    "SHOW_LEADERBOARD",
    "CHECK_RANKINGS",
    "VIEW_RANKINGS",
    "LEADERBOARD",
    "RANKINGS",
    "TOP_USERS",
    "STANDINGS"
  ],
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const text = message.content.text?.toLowerCase() || "";
    return text.includes("leaderboard") || 
           text.includes("ranking") || 
           text.includes("rankings") ||
           text.includes("top users") ||
           text.includes("standings") ||
           text.includes("who's winning") ||
           text.includes("scores") ||
           text.includes("leaders");
  },
  description: "View community leaderboard rankings and top performers",
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown },
    callback?: HandlerCallback
  ): Promise<ActionResult> => {
    try {
      elizaLogger.info("Processing leaderboard request");

      const raidCoordinatorUrl = runtime.getSetting("RAID_COORDINATOR_URL");
      if (!raidCoordinatorUrl) {
        throw new Error("Raid coordinator URL not configured");
      }

      const response = await fetch(raidCoordinatorUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'leaderboard',
          period: 'all' // Could be extended to support weekly/monthly
        })
      });

      const result = await response.json();

      if (result.success && result.leaderboard && result.leaderboard.length > 0) {
        // Build leaderboard display
        let leaderboardText = `🏆 **COMMUNITY LEADERBOARD** 🏆\n\n`;
        leaderboardText += `*Rankings by total raid points earned*\n\n`;
        
        result.leaderboard.forEach((user: any, index: number) => {
          const position = index + 1;
          const emoji = position === 1 ? '🥇' : 
                       position === 2 ? '🥈' : 
                       position === 3 ? '🥉' : 
                       position <= 10 ? '🔸' : '▫️';
          
          const crown = position <= 3 ? ' 👑' : '';
          const badge = user.streak > 5 ? ' 🔥' : user.raids_participated > 10 ? ' ⚡' : '';
          
          leaderboardText += `${emoji} **#${position} ${user.username}**${crown}${badge}\n`;
          leaderboardText += `    💰 ${user.total_points} points`;
          if (user.raids_participated) leaderboardText += ` | 🎯 ${user.raids_participated} raids`;
          if (user.streak) leaderboardText += ` | 🔥 ${user.streak}-day streak`;
          leaderboardText += `\n\n`;
        });

        // Add user's position if they're not in top 10
        const userPosition = result.userRank;
        if (userPosition && userPosition > 10) {
          leaderboardText += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          leaderboardText += `🔍 **Your Position:**\n`;
          leaderboardText += `▫️ **#${userPosition}** - Keep climbing! 📈\n\n`;
        }

        leaderboardText += `🎯 **HOW TO CLIMB THE RANKS:**\n`;
        leaderboardText += `• Start raids with Twitter URLs 🚀\n`;
        leaderboardText += `• Join community raids regularly ⚡\n`;
        leaderboardText += `• Quality engagement over quantity 🌟\n`;
        leaderboardText += `• Help grow our community 💪\n`;
        leaderboardText += `• Maintain daily streaks 🔥\n\n`;
        
        leaderboardText += `📊 **POINT VALUES:**\n`;
        leaderboardText += `👍 Like = 1pt | 🔄 RT = 2pts | 💬 Quote = 3pts | 📝 Comment = 5pts\n\n`;
        
        leaderboardText += `🚀 **Ready to dominate?** Share a Twitter URL to start the next raid! 🎯\n\n`;
        leaderboardText += `*"Champions aren't made overnight - they're forged through consistent action!"* 💎`;

        if (callback) {
          callback({
            text: leaderboardText,
            content: {
              leaderboard: result.leaderboard,
              userRank: userPosition,
              totalUsers: result.totalUsers,
              action: 'leaderboard_displayed',
              period: 'all_time',
              topPerformer: result.leaderboard[0]?.username
            }
          });
        }

        return { success: true, text: "Leaderboard displayed successfully" };
      } else {
        // Empty leaderboard case
        if (callback) {
          callback({
            text: "📊 **LEADERBOARD** 📊\n\n" +
                  "No leaderboard data available yet.\n\n" +
                  "📊 **LEADERBOARD: AWAITING CHAMPIONS** 📊\n\n" +
                  "🌟 The battlefield is empty, but that means **UNLIMITED OPPORTUNITY!** 🌟\n\n" +
                  "**🥇 BE THE FIRST LEGEND:**\n" +
                  "🎯 Start a raid by sharing a Twitter URL\n" +
                  "⚡ Join others' raids for instant points\n" +
                  "🏆 Quality engagement = massive rewards\n" +
                  "🔥 Build streaks for bonus multipliers\n\n" +
                  "**💡 FOUNDING MEMBER ADVANTAGES:**\n" +
                  "• First to reach milestones gets special badges\n" +
                  "• Early dominance = easier ranking maintenance\n" +
                  "• Set the community standards from day one\n\n" +
                  "**🚀 READY TO MAKE HISTORY?**\n" +
                  "Drop a Twitter URL and let's inaugurate this leaderboard with your name at the top! 💪\n\n" +
                  "*\"Every legend starts with a single action. What's yours going to be?\"* ⚡",
            content: { 
              action: 'empty_leaderboard',
              opportunity: 'first_mover_advantage',
              callToAction: 'start_raid'
            }
          });
        }

        return { success: true, text: "Empty leaderboard displayed" };
      }
    } catch (error) {
      elizaLogger.error("View leaderboard action failed:", error);
      
      if (callback) {
        callback({
          text: "⚠️ **LEADERBOARD TEMPORARILY OFFLINE** ⚠️\n\n" +
                "Our ranking systems are having a moment! 📊⚙️\n\n" +
                "**While we're fixing things:**\n" +
                "🎯 Keep raiding - all actions are still being tracked!\n" +
                "📈 Your points are accumulating in the background\n" +
                "🏆 Rankings will update once systems are back online\n\n" +
                "**Pro tip:** Use this downtime to stack up engagements. When the leaderboard comes back, you might find yourself with a nice surprise ranking boost! 🚀\n\n" +
                "*\"True champions perform even when nobody's watching!\"* 💪",
          content: { 
            error: error.message,
            action: 'leaderboard_unavailable',
            assurance: 'points_still_tracking'
          }
        });
      }
      
      return { success: false, text: "Failed to display leaderboard" };
    }
  },
  examples: [
    [
      {
        name: "{{user1}}",
        content: {
          text: "Show me the leaderboard"
        }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "🏆 **COMMUNITY LEADERBOARD** 🏆\n\n*Rankings by total raid points earned*\n\n🥇 **#1 Alice** 👑⚡\n    💰 247 points | 🎯 15 raids | 🔥 7-day streak\n\n🥈 **#2 Bob** 👑🔥\n    💰 183 points | 🎯 12 raids\n\n🥉 **#3 Charlie** 👑\n    💰 156 points | 🎯 8 raids\n\n🚀 **Ready to dominate?** Share a Twitter URL to start the next raid! 🎯",
          action: "VIEW_LEADERBOARD"
        }
      }
    ],
    [
      {
        name: "{{user1}}",
        content: {
          text: "Who's winning the raids?"
        }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "🏆 **CURRENT RAID CHAMPIONS** 🏆\n\n🥇 **Alice leads with 247 points!** 👑\n\nShe's dominating with consistent high-value engagements and a 7-day streak! 🔥\n\n**Think you can challenge her throne?** \nStart raiding and climb those rankings! 💪\n\n*\"Champions aren't made overnight - they're forged through consistent action!\"* 💎",
          action: "VIEW_LEADERBOARD"
        }
      }
    ]
  ]
};
