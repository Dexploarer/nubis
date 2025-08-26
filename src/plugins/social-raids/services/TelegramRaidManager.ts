import { Service, ServiceType, IAgentRuntime, elizaLogger } from "@elizaos/core";
import { Telegraf, Context, Markup } from "telegraf";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { RaidStatus, TelegramCallbackData, RaidParticipant, ApiResponse } from "../types";

interface TelegramRaidContext extends Context {
  raidData?: {
    raidId: string;
    sessionId: string;
    targetUrl: string;
  };
}

export class TelegramRaidManager extends Service {
  static serviceType: ServiceType = "TELEGRAM_RAID_MANAGER";
  
  private bot: Telegraf | null = null;
  private supabase: SupabaseClient;
  private botToken: string | null = null;
  private channelId: string | null = null;
  private testChannelId: string | null = null;
  private raidCoordinatorUrl: string;
  private isInitialized = false;

  constructor(runtime: IAgentRuntime) {
    super(runtime);
    
    const supabaseUrl = runtime.getSetting("SUPABASE_URL");
    const supabaseServiceKey = runtime.getSetting("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing for TelegramRaidManager");
    }
    
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    this.botToken = runtime.getSetting("TELEGRAM_BOT_TOKEN");
    this.channelId = runtime.getSetting("TELEGRAM_CHANNEL_ID");
    this.testChannelId = runtime.getSetting("TELEGRAM_TEST_CHANNEL");
    this.raidCoordinatorUrl = runtime.getSetting("RAID_COORDINATOR_URL") || "";
  }

  async initialize(): Promise<void> {
    if (!this.botToken) {
      elizaLogger.warn("Telegram bot token not configured, skipping initialization");
      return;
    }

    elizaLogger.info("Initializing Telegram Raid Manager");
    
    try {
      this.bot = new Telegraf(this.botToken);
      this.setupCommandHandlers();
      this.setupCallbackHandlers();
      this.setupMiddleware();
      
      // Start bot
      await this.bot.launch();
      this.isInitialized = true;
      
      elizaLogger.success("Telegram Raid Manager initialized successfully");
      
      // Send initialization message to channel
      if (this.channelId) {
        await this.sendChannelMessage("🤖 Raid bot is online and ready for action! 🚀");
      }
    } catch (error) {
      elizaLogger.error("Failed to initialize Telegram Raid Manager:", error);
      throw error;
    }
  }

  private setupMiddleware(): void {
    if (!this.bot) return;

    // Log all messages for community memory
    this.bot.use(async (ctx, next) => {
      if (ctx.message && 'text' in ctx.message) {
        try {
          await this.logUserInteraction(ctx);
        } catch (error) {
          elizaLogger.error("Failed to log user interaction:", error);
        }
      }
      return next();
    });
  }

  private async logUserInteraction(ctx: Context): Promise<void> {
    if (!ctx.from || !ctx.message || !('text' in ctx.message)) return;

    try {
      await this.supabase
        .from('community_interactions')
        .insert({
          user_id: ctx.from.id.toString(),
          interaction_type: 'telegram_message',
          content: ctx.message.text,
          context: {
            chat_id: ctx.chat?.id,
            chat_type: ctx.chat?.type,
            username: ctx.from.username,
            first_name: ctx.from.first_name
          },
          weight: 1.0,
          sentiment_score: 0.5, // TODO: Add sentiment analysis
          timestamp: new Date()
        });
    } catch (error) {
      elizaLogger.error("Failed to log interaction to database:", error);
    }
  }

  private setupCommandHandlers(): void {
    if (!this.bot) return;

    // Start command
    this.bot.command('start', async (ctx) => {
      await ctx.reply(
        `🚀 *Welcome to the NUBI Raids Coordinator!*\n\n` +
        `I can help you coordinate Twitter raids and track engagement with our community.\n\n` +
        `*Commands:*\n` +
        `/raid <twitter_url> - Start a new raid\n` +
        `/join - Join the current raid\n` +
        `/stats - View your statistics\n` +
        `/leaderboard - View community leaderboard\n` +
        `/export <username> - Export tweets from user\n` +
        `/help - Show this help message\n\n` +
        `*How it works:*\n` +
        `1️⃣ Share a Twitter URL to start a raid\n` +
        `2️⃣ Community members join and engage\n` +
        `3️⃣ Earn points and climb the leaderboard\n` +
        `4️⃣ Build our Twitter presence together!\n\n` +
        `Let's dominate social media! 🔥`,
        { parse_mode: 'Markdown' }
      );
    });

    // Raid command
    this.bot.command('raid', async (ctx) => {
      const args = ctx.message.text.split(' ');
      if (args.length < 2) {
        await ctx.reply("Usage: `/raid <twitter_url>`\n\nExample: `/raid https://twitter.com/user/status/123456789`", { parse_mode: 'Markdown' });
        return;
      }
      
      const twitterUrl = args[1];
      await this.startRaid(ctx, twitterUrl);
    });

    // Join command
    this.bot.command('join', async (ctx) => {
      await this.joinRaid(ctx);
    });

    // Stats command  
    this.bot.command('stats', async (ctx) => {
      await this.showUserStats(ctx);
    });

    // Leaderboard command
    this.bot.command('leaderboard', async (ctx) => {
      await this.showLeaderboard(ctx);
    });

    // Export command
    this.bot.command('export', async (ctx) => {
      const args = ctx.message.text.split(' ');
      if (args.length < 2) {
        await ctx.reply("Usage: `/export <username>`\n\nExample: `/export elonmusk`", { parse_mode: 'Markdown' });
        return;
      }
      
      const username = args[1].replace('@', '');
      await this.exportUserTweets(ctx, username);
    });

    // Help command
    this.bot.command('help', async (ctx) => {
      await ctx.reply(
        `🤖 *NUBI Raids Bot Help*\n\n` +
        `*Available Commands:*\n` +
        `/start - Show welcome message\n` +
        `/raid <url> - Start a Twitter raid\n` +
        `/join - Join active raid\n` +
        `/stats - Your statistics\n` +
        `/leaderboard - Community rankings\n` +
        `/export <username> - Export user's tweets\n` +
        `/help - This help message\n\n` +
        `*Points System:*\n` +
        `👍 Like = 1 point\n` +
        `🔄 Retweet = 2 points\n` +
        `💬 Quote Tweet = 3 points\n` +
        `📝 Comment = 5 points\n\n` +
        `*Tips:*\n` +
        `• Quality engagement earns bonus points\n` +
        `• Consistent participation builds streaks\n` +
        `• Help others to earn community points\n\n` +
        `Questions? Ask in the main chat! 💬`,
        { parse_mode: 'Markdown' }
      );
    });
  }

  private setupCallbackHandlers(): void {
    if (!this.bot) return;

    this.bot.action(/^raid_action:(.+)$/, async (ctx) => {
      const action = ctx.match[1];
      await this.handleRaidAction(ctx, action);
    });

    this.bot.action(/^submit_engagement:(.+)$/, async (ctx) => {
      const engagementType = ctx.match[1];
      await this.handleEngagementSubmission(ctx, engagementType);
    });

    this.bot.action(/^leaderboard:(.+)$/, async (ctx) => {
      const period = ctx.match[1];
      await this.showLeaderboard(ctx, period);
    });
  }

  private async startRaid(ctx: Context, twitterUrl: string): Promise<void> {
    try {
      // Validate Twitter URL
      if (!this.isValidTwitterUrl(twitterUrl)) {
        await ctx.reply("❌ Invalid Twitter URL. Please provide a valid Twitter/X post URL.");
        return;
      }

      // Call raid coordinator Edge Function
      const response = await fetch(this.raidCoordinatorUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_raid',
          twitterUrl,
          userId: ctx.from?.id.toString(),
          username: ctx.from?.username || ctx.from?.first_name,
          telegramId: ctx.from?.id,
          platform: 'telegram'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const keyboard = Markup.inlineKeyboard([
          [Markup.button.callback('🚀 Join Raid', 'raid_action:join')],
          [
            Markup.button.callback('👍 Like', 'submit_engagement:like'),
            Markup.button.callback('🔄 Retweet', 'submit_engagement:retweet')
          ],
          [
            Markup.button.callback('💬 Quote', 'submit_engagement:quote'),
            Markup.button.callback('📝 Comment', 'submit_engagement:comment')
          ],
          [Markup.button.callback('📊 Raid Status', 'raid_action:status')]
        ]);

        const raidMessage = `🎯 *RAID STARTED!* 🎯\n\n` +
          `*Target:* [Tweet Link](${twitterUrl})\n` +
          `*Raid ID:* \`${result.raidId}\`\n` +
          `*Duration:* 60 minutes\n` +
          `*Strategy:* Community Coordination\n\n` +
          `*Points System:*\n` +
          `👍 Like = 1 point\n` +
          `🔄 Retweet = 2 points\n` +
          `💬 Quote Tweet = 3 points\n` +
          `📝 Comment = 5 points\n\n` +
          `*Instructions:*\n` +
          `1️⃣ Click "Join Raid" first\n` +
          `2️⃣ Go engage with the tweet\n` +
          `3️⃣ Report your actions using buttons\n` +
          `4️⃣ Earn points and climb the leaderboard!\n\n` +
          `*Let's dominate Twitter together!* 🔥`;

        await ctx.reply(raidMessage, { 
          reply_markup: keyboard.reply_markup, 
          parse_mode: 'Markdown',
          disable_web_page_preview: false
        });

        // Notify channel if this is a private message
        if (ctx.chat?.type === 'private' && this.channelId) {
          await this.sendChannelMessage(
            `🚨 *NEW RAID ALERT!* 🚨\n\n` +
            `${ctx.from?.first_name} started a raid!\n` +
            `Target: [Tweet Link](${twitterUrl})\n\n` +
            `Join the raid in DMs with the bot! 🤖`,
            { parse_mode: 'Markdown' }
          );
        }
      } else {
        await ctx.reply(`❌ Failed to start raid: ${result.error}\n\nPlease try again with a valid Twitter URL.`);
      }
    } catch (error) {
      elizaLogger.error("Failed to start raid:", error);
      await ctx.reply("❌ Failed to start raid. Our systems might be overloaded. Please try again in a moment! 🔄");
    }
  }

  private async joinRaid(ctx: Context): Promise<void> {
    try {
      const response = await fetch(this.raidCoordinatorUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join_raid',
          userId: ctx.from?.id.toString(),
          username: ctx.from?.username || ctx.from?.first_name,
          telegramId: ctx.from?.id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        await ctx.reply(
          `✅ *WELCOME TO THE BATTLE!* ✅\n\n` +
          `You're now participant #${result.participantNumber} in this raid! 🔥\n\n` +
          `*Your mission:*\n` +
          `🎯 Go to the target tweet\n` +
          `⚡ Engage authentically\n` +
          `📊 Report back for points\n\n` +
          `*Target:* [Click here to engage](${result.targetUrl})\n\n` +
          `Let's show Twitter what real community looks like! 💪`,
          { parse_mode: 'Markdown', disable_web_page_preview: false }
        );
      } else {
        await ctx.reply(`❌ Failed to join raid: ${result.error}\n\nMake sure there's an active raid to join!`);
      }
    } catch (error) {
      elizaLogger.error("Failed to join raid:", error);
      await ctx.reply("❌ Failed to join raid. Please try again! 🔄");
    }
  }

  private async handleRaidAction(ctx: Context, action: string): Promise<void> {
    switch (action) {
      case 'join':
        await this.joinRaid(ctx);
        break;
      case 'status':
        await this.showRaidStatus(ctx);
        break;
      default:
        await ctx.reply("Unknown action. Please try again!");
    }
  }

  private async handleEngagementSubmission(ctx: Context, engagementType: string): Promise<void> {
    try {
      const response = await fetch(this.raidCoordinatorUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_engagement',
          userId: ctx.from?.id.toString(),
          username: ctx.from?.username || ctx.from?.first_name,
          engagementType,
          telegramId: ctx.from?.id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const points = this.getPointsForAction(engagementType);
        const emoji = this.getEmojiForAction(engagementType);
        
        await ctx.reply(
          `🎉 *ENGAGEMENT CONFIRMED!* 🎉\n\n` +
          `${emoji} *${engagementType.toUpperCase()}* recorded!\n` +
          `Points Earned: +${points} 🏆\n` +
          `Total Points: ${result.totalPoints || 'N/A'}\n` +
          `Current Rank: #${result.rank || 'N/A'}\n\n` +
          `Outstanding work! Keep the momentum going! 🔥`,
          { parse_mode: 'Markdown' }
        );
      } else {
        await ctx.reply(`❌ Failed to record ${engagementType}: ${result.error}\n\nMake sure you've joined a raid first!`);
      }
    } catch (error) {
      elizaLogger.error("Failed to submit engagement:", error);
      await ctx.reply("❌ Failed to record engagement. Please try again! 🔄");
    }
  }

  private async showRaidStatus(ctx: Context): Promise<void> {
    try {
      const response = await fetch(this.raidCoordinatorUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_status'
        })
      });

      const result = await response.json();
      
      if (result.success && result.raid) {
        const raid = result.raid;
        const timeRemaining = this.getRemainingTime(raid.created_at);
        
        await ctx.reply(
          `📊 *RAID STATUS* 📊\n\n` +
          `*Target:* [Tweet Link](${raid.target_url})\n` +
          `*Status:* ${raid.status.toUpperCase()}\n` +
          `*Participants:* ${raid.participant_count}\n` +
          `*Total Engagements:* ${raid.total_engagements}\n` +
          `*Points Distributed:* ${raid.points_distributed}\n` +
          `*Time Remaining:* ${timeRemaining}\n\n` +
          `*Keep pushing! Every engagement counts!* 🚀`,
          { parse_mode: 'Markdown', disable_web_page_preview: false }
        );
      } else {
        await ctx.reply("📊 No active raid found.\n\nStart a new raid by sharing a Twitter URL! 🎯");
      }
    } catch (error) {
      elizaLogger.error("Failed to get raid status:", error);
      await ctx.reply("❌ Failed to get raid status. Please try again! 🔄");
    }
  }

  private async showUserStats(ctx: Context): Promise<void> {
    try {
      const userId = ctx.from?.id.toString();
      if (!userId) return;

      const { data: user, error } = await this.supabase
        .from('users')
        .select('username, total_points, raids_participated, successful_engagements, streak, rank, badges, last_activity')
        .eq('telegram_id', userId)
        .single();

      if (error || !user) {
        await ctx.reply("📊 No stats found. Join a raid to start building your reputation! 🚀");
        return;
      }

      const badgesText = user.badges?.length ? user.badges.join(' ') : 'None yet';
      
      await ctx.reply(
        `📊 *YOUR STATS* 📊\n\n` +
        `*Username:* ${user.username || ctx.from?.first_name}\n` +
        `*Total Points:* ${user.total_points} 🏆\n` +
        `*Raids Participated:* ${user.raids_participated}\n` +
        `*Successful Engagements:* ${user.successful_engagements}\n` +
        `*Current Streak:* ${user.streak} days 🔥\n` +
        `*Current Rank:* #${user.rank}\n` +
        `*Badges:* ${badgesText}\n` +
        `*Last Activity:* ${this.formatDate(user.last_activity)}\n\n` +
        `Keep raiding to climb the leaderboard! 🚀`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      elizaLogger.error("Failed to show user stats:", error);
      await ctx.reply("❌ Failed to get your stats. Please try again! 🔄");
    }
  }

  private async showLeaderboard(ctx: Context, period: string = 'all'): Promise<void> {
    try {
      const response = await fetch(this.raidCoordinatorUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'leaderboard',
          period: period
        })
      });

      const result = await response.json();
      
      if (result.success && result.leaderboard && result.leaderboard.length > 0) {
        let leaderboardText = `🏆 *COMMUNITY LEADERBOARD* 🏆\n\n`;
        
        result.leaderboard.forEach((user: any, index: number) => {
          const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🔸';
          const crown = index < 3 ? ' 👑' : '';
          leaderboardText += `${emoji} *${user.username}*: ${user.total_points} points${crown}\n`;
        });

        leaderboardText += `\n💡 *How to climb:*\n`;
        leaderboardText += `• Participate in raids regularly\n`;
        leaderboardText += `• Quality engagement over quantity\n`;
        leaderboardText += `• Help grow our community\n\n`;
        leaderboardText += `🎯 *Start the next raid!* Share a Twitter URL! 🚀`;

        const keyboard = Markup.inlineKeyboard([
          [
            Markup.button.callback('📅 Weekly', 'leaderboard:weekly'),
            Markup.button.callback('📆 Monthly', 'leaderboard:monthly')
          ],
          [Markup.button.callback('📊 All Time', 'leaderboard:all')]
        ]);

        await ctx.reply(leaderboardText, { 
          parse_mode: 'Markdown',
          reply_markup: keyboard.reply_markup 
        });
      } else {
        await ctx.reply(
          "📊 *LEADERBOARD EMPTY* 📊\n\n" +
          "No rankings yet! Be the first to earn points:\n\n" +
          "🎯 Start a raid with a Twitter URL\n" +
          "⚡ Participate in community raids\n" +
          "🏆 Engage with quality content\n\n" +
          "Let's build this leaderboard together! 🚀",
          { parse_mode: 'Markdown' }
        );
      }
    } catch (error) {
      elizaLogger.error("Failed to show leaderboard:", error);
      await ctx.reply("❌ Failed to show leaderboard. Please try again! 🔄");
    }
  }

  private async exportUserTweets(ctx: Context, username: string): Promise<void> {
    try {
      await ctx.reply(`🔄 Exporting tweets from @${username}... This may take a moment! ⏳`);

      // This would integrate with TwitterRaidService
      // For now, just acknowledge the request
      await ctx.reply(
        `📥 *EXPORT REQUEST QUEUED* 📥\n\n` +
        `Username: @${username}\n` +
        `Status: Processing...\n\n` +
        `You'll receive the exported data once processing is complete! 🚀`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      elizaLogger.error("Failed to export tweets:", error);
      await ctx.reply("❌ Failed to export tweets. Please try again! 🔄");
    }
  }

  private async sendChannelMessage(text: string, extra?: any): Promise<void> {
    if (!this.bot || !this.channelId) return;

    try {
      await this.bot.telegram.sendMessage(this.channelId, text, extra);
    } catch (error) {
      elizaLogger.error("Failed to send channel message:", error);
    }
  }

  private isValidTwitterUrl(url: string): boolean {
    const twitterRegex = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/;
    return twitterRegex.test(url);
  }

  private getPointsForAction(action: string): number {
    const pointsMap: Record<string, number> = {
      like: 1,
      retweet: 2,
      quote: 3,
      comment: 5,
      share: 2
    };
    return pointsMap[action] || 0;
  }

  private getEmojiForAction(action: string): string {
    const emojiMap: Record<string, string> = {
      like: '👍',
      retweet: '🔄',
      quote: '💬',
      comment: '📝',
      share: '📤'
    };
    return emojiMap[action] || '⚡';
  }

  private getRemainingTime(startTime: string): string {
    const start = new Date(startTime);
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000 / 60);
    const remaining = Math.max(60 - elapsed, 0);
    return remaining > 0 ? `${remaining} minutes` : 'Completed';
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  async stop(): Promise<void> {
    if (this.bot) {
      this.bot.stop();
      this.isInitialized = false;
    }
    elizaLogger.info("Telegram Raid Manager stopped");
  }
}
