/**
 * Forum Topic Manager for Social Raids Plugin
 * Manages Telegram forum topics for organized raid discussions
 * Provides dedicated topics for different types of raids and coordination
 */

import { Service, elizaLogger } from '@elizaos/core';
import type { IAgentRuntime } from '@elizaos/core';
import { createClient } from '@supabase/supabase-js';

export interface ForumTopic {
  message_thread_id: number;
  name: string;
  icon_color?: number;
  icon_custom_emoji_id?: string;
}

export interface RaidTopic {
  id: string;
  chat_id: string;
  topic_id: number;
  topic_name: string;
  raid_id?: string;
  raid_type: 'twitter' | 'general' | 'coordination' | 'results';
  target_platform: string;
  target_url?: string;
  status: 'active' | 'completed' | 'archived';
  participants_count: number;
  created_at: Date;
  updated_at: Date;
  auto_close_at?: Date;
  metadata: any;
}

export interface TopicTemplate {
  name: string;
  type: 'twitter' | 'general' | 'coordination' | 'results';
  icon_color: number;
  icon_custom_emoji_id?: string;
  description: string;
  auto_pin_message?: string;
  rules?: string[];
  duration_hours?: number;
}

export class ForumTopicManager extends Service {
  static serviceType = 'FORUM_TOPIC_MANAGER';
  
  public name: string = ForumTopicManager.serviceType;
  public supabase: any;
  private topicTemplates: Map<string, TopicTemplate> = new Map();
  private activeTopics: Map<string, RaidTopic> = new Map(); // chatId-topicId -> RaidTopic

  capabilityDescription = 'Manages Telegram forum topics for organized raid discussions';

  constructor(runtime: IAgentRuntime) {
    super(runtime);

    const supabaseUrl = runtime.getSetting('SUPABASE_URL') || process.env.SUPABASE_URL;
    const supabaseServiceKey = runtime.getSetting('SUPABASE_SERVICE_ROLE_KEY') || process.env.SUPABASE_SERVICE_ROLE_KEY;

    this.supabase = supabaseUrl && supabaseServiceKey
      ? createClient(supabaseUrl, supabaseServiceKey)
      : this.createNoopSupabase();

    if (!supabaseUrl || !supabaseServiceKey) {
      elizaLogger.warn('Supabase configuration missing for ForumTopicManager - using no-op client');
    }

    this.initializeTopicTemplates();
  }

  static async start(runtime: IAgentRuntime): Promise<ForumTopicManager> {
    elizaLogger.info('Starting Forum Topic Manager');
    const service = new ForumTopicManager(runtime);
    await service.initialize();
    return service;
  }

  static async stop(runtime: IAgentRuntime): Promise<void> {
    elizaLogger.info('Forum Topic Manager stopped');
  }

  async initialize(): Promise<void> {
    try {
      // Load active topics from database
      await this.loadActiveTopics();
      
      // Start cleanup process
      this.startCleanupProcess();
      
      elizaLogger.info('Forum Topic Manager initialized successfully');
    } catch (error) {
      elizaLogger.error('Failed to initialize Forum Topic Manager:', error);
      throw error;
    }
  }

  private initializeTopicTemplates(): void {
    // Twitter Raid Templates
    this.topicTemplates.set('twitter_raid', {
      name: '🚨 Twitter Raid - {{target}}',
      type: 'twitter',
      icon_color: 0x1DA1F2, // Twitter blue
      icon_custom_emoji_id: undefined,
      description: 'Coordinated Twitter engagement raid',
      auto_pin_message: `🎯 **TWITTER RAID ACTIVE**\n\n**Target**: {{target_url}}\n**Duration**: {{duration}} minutes\n\n**📋 INSTRUCTIONS:**\n1️⃣ Click the target link\n2️⃣ Engage authentically (like, retweet, comment)\n3️⃣ Report your actions using the buttons below\n4️⃣ Earn points and climb the leaderboard!\n\n**⚡ POINT SYSTEM:**\n👍 Like = 1 point\n🔄 Retweet = 2 points\n💬 Quote = 3 points\n📝 Comment = 5 points\n\n**🚫 RAID RULES:**\n• No spam or low-quality content\n• Engage authentically and meaningfully\n• Respect Twitter's terms of service\n• Be positive and supportive\n\n**Let's dominate this together! 🔥**`,
      rules: [
        'Engage authentically - no spam',
        'Quality over quantity',
        'Respect platform terms of service',
        'Be positive and supportive',
        'Report all actions honestly',
      ],
      duration_hours: 1,
    });

    this.topicTemplates.set('coordination', {
      name: '📋 Raid Coordination',
      type: 'coordination',
      icon_color: 0x7B68EE, // Medium slate blue
      description: 'Strategic planning and coordination',
      auto_pin_message: `📋 **RAID COORDINATION CENTER**\n\n**Welcome to the strategic planning hub!**\n\nUse this topic to:\n• Plan upcoming raids\n• Coordinate timing and strategy\n• Share target suggestions\n• Discuss tactics and approaches\n\n**🎯 PLANNING COMMANDS:**\n\`/suggest <url>\` - Suggest a raid target\n\`/schedule <time>\` - Schedule a raid\n\`/strategy <plan>\` - Share raid strategy\n\n**Let's plan our next victory! 🏆**`,
      rules: [
        'Focus on strategic planning',
        'Share constructive suggestions',
        'Coordinate timing effectively',
        'Maintain operational security',
      ],
    });

    this.topicTemplates.set('results', {
      name: '📊 Raid Results & Analytics',
      type: 'results',
      icon_color: 0x32CD32, // Lime green
      description: 'Post-raid analysis and results',
      auto_pin_message: `📊 **RAID RESULTS & ANALYTICS**\n\n**Track our victories and analyze performance!**\n\nThis topic is for:\n• Raid completion reports\n• Performance analytics\n• Success stories and highlights\n• Lessons learned and improvements\n\n**📈 METRICS WE TRACK:**\n• Total participants\n• Engagement rates\n• Point distributions\n• Target platform impact\n• Community growth\n\n**Share your success stories! 🎉**`,
      rules: [
        'Share factual results and data',
        'Celebrate community achievements',
        'Provide constructive feedback',
        'Learn from each raid experience',
      ],
      duration_hours: 24, // Results topics stay open longer
    });

    this.topicTemplates.set('general', {
      name: '💬 General Raid Discussion',
      type: 'general',
      icon_color: 0xFF6347, // Tomato
      description: 'General discussion and community chat',
      auto_pin_message: `💬 **GENERAL RAID DISCUSSION**\n\n**Welcome to our community space!**\n\nThis topic is for:\n• General raid-related discussions\n• Community building and networking\n• Questions and support\n• Sharing experiences and tips\n\n**🌟 COMMUNITY GUIDELINES:**\n• Be respectful and inclusive\n• Help new members learn\n• Share knowledge and experiences\n• Keep discussions raid-focused\n\n**Building our community together! 🤝**`,
      rules: [
        'Stay on raid-related topics',
        'Be respectful and helpful',
        'Welcome new members',
        'Foster positive community spirit',
      ],
    });
  }

  /**
   * Create a new forum topic for a raid
   */
  async createRaidTopic(
    bot: any,
    chatId: number,
    raidId: string,
    targetUrl: string,
    raidType: 'twitter' | 'general' | 'coordination' | 'results' = 'twitter'
  ): Promise<RaidTopic | null> {
    try {
      if (!bot || !bot.telegram) {
        elizaLogger.error('Bot or telegram instance not available');
        return null;
      }

      const template = this.topicTemplates.get(raidType === 'twitter' ? 'twitter_raid' : raidType);
      if (!template) {
        elizaLogger.error(`Topic template not found: ${raidType}`);
        return null;
      }

      // Extract target name from URL for topic title
      const targetName = this.extractTargetName(targetUrl);
      const topicName = template.name
        .replace('{{target}}', targetName)
        .substring(0, 85); // Telegram limit

      // Create the forum topic
      const result = await bot.telegram.createForumTopic(
        chatId,
        topicName,
        {
          icon_color: template.icon_color,
          icon_custom_emoji_id: template.icon_custom_emoji_id,
        }
      );

      if (!result || !result.message_thread_id) {
        elizaLogger.error('Failed to create forum topic');
        return null;
      }

      const topicId = result.message_thread_id;
      
      // Create raid topic record
      const raidTopic: RaidTopic = {
        id: `${chatId}-${topicId}`,
        chat_id: chatId.toString(),
        topic_id: topicId,
        topic_name: topicName,
        raid_id: raidId,
        raid_type: raidType,
        target_platform: 'twitter',
        target_url: targetUrl,
        status: 'active',
        participants_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
        auto_close_at: template.duration_hours ? new Date(Date.now() + template.duration_hours * 60 * 60 * 1000) : undefined,
        metadata: {
          template_used: raidType,
          created_by_bot: true,
        },
      };

      // Save to database
      await this.saveRaidTopic(raidTopic);

      // Cache the topic
      this.activeTopics.set(raidTopic.id, raidTopic);

      // Send pinned message if template has one
      if (template.auto_pin_message) {
        await this.sendPinnedMessage(bot, chatId, topicId, template, targetUrl, raidId);
      }

      elizaLogger.info(`Created raid topic: ${topicName} (${topicId}) for raid ${raidId}`);
      return raidTopic;

    } catch (error) {
      elizaLogger.error('Failed to create raid topic:', error);
      return null;
    }
  }

  /**
   * Send and pin the initial raid message
   */
  private async sendPinnedMessage(
    bot: any,
    chatId: number,
    topicId: number,
    template: TopicTemplate,
    targetUrl: string,
    raidId: string
  ): Promise<void> {
    try {
      const message = template.auto_pin_message!
        .replace('{{target_url}}', targetUrl)
        .replace('{{duration}}', (template.duration_hours! * 60).toString())
        .replace('{{raid_id}}', raidId);

      // Create inline keyboard for raid actions
      const keyboard = this.createRaidKeyboard(raidId, template.type);

      // Send the message
      const sentMessage = await bot.telegram.sendMessage(
        chatId,
        message,
        {
          message_thread_id: topicId,
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        }
      );

      // Pin the message
      if (sentMessage && sentMessage.message_id) {
        await bot.telegram.pinChatMessage(
          chatId,
          sentMessage.message_id,
          { disable_notification: true }
        );
      }

    } catch (error) {
      elizaLogger.error('Failed to send pinned message:', error);
    }
  }

  /**
   * Create inline keyboard based on topic type
   */
  private createRaidKeyboard(raidId: string, topicType: string): any {
    switch (topicType) {
      case 'twitter':
        return {
          inline_keyboard: [
            [
              { text: '👍 Liked', callback_data: `raid_action:like:${raidId}` },
              { text: '🔄 Retweeted', callback_data: `raid_action:retweet:${raidId}` },
            ],
            [
              { text: '💬 Quoted', callback_data: `raid_action:quote:${raidId}` },
              { text: '📝 Commented', callback_data: `raid_action:comment:${raidId}` },
            ],
            [
              { text: '📊 Raid Status', callback_data: `raid_menu:status:${raidId}` },
              { text: '🏆 Leaderboard', callback_data: `raid_menu:leaderboard:${raidId}` },
            ],
            [
              { text: '👥 Participants', callback_data: `raid_menu:participants:${raidId}` },
            ],
          ],
        };

      case 'coordination':
        return {
          inline_keyboard: [
            [
              { text: '🎯 Suggest Target', callback_data: `coord_action:suggest:${raidId}` },
              { text: '📅 Schedule Raid', callback_data: `coord_action:schedule:${raidId}` },
            ],
            [
              { text: '💡 Share Strategy', callback_data: `coord_action:strategy:${raidId}` },
              { text: '📋 View Plans', callback_data: `coord_action:plans:${raidId}` },
            ],
          ],
        };

      case 'results':
        return {
          inline_keyboard: [
            [
              { text: '📈 View Analytics', callback_data: `results_action:analytics:${raidId}` },
              { text: '🏅 Top Performers', callback_data: `results_action:top:${raidId}` },
            ],
            [
              { text: '📊 Export Data', callback_data: `results_action:export:${raidId}` },
            ],
          ],
        };

      default:
        return {
          inline_keyboard: [
            [
              { text: '💬 Join Discussion', callback_data: `general_action:join:${raidId}` },
              { text: '❓ Get Help', callback_data: `general_action:help:${raidId}` },
            ],
          ],
        };
    }
  }

  /**
   * Close and archive a raid topic
   */
  async closeRaidTopic(
    bot: any,
    chatId: number,
    topicId: number,
    reason: string = 'Raid completed'
  ): Promise<void> {
    try {
      const topicKey = `${chatId}-${topicId}`;
      const raidTopic = this.activeTopics.get(topicKey);

      if (!raidTopic) {
        elizaLogger.warn(`Topic not found for closing: ${topicKey}`);
        return;
      }

      // Send closing message
      const closingMessage = `🏁 **TOPIC CLOSING**\n\n**Reason**: ${reason}\n**Duration**: ${this.formatDuration(raidTopic.created_at, new Date())}\n**Participants**: ${raidTopic.participants_count}\n\n**Thank you for participating!** 🎉\n\nThis topic will be archived shortly.`;

      await bot.telegram.sendMessage(
        chatId,
        closingMessage,
        {
          message_thread_id: topicId,
          parse_mode: 'Markdown',
        }
      );

      // Close the topic (if bot has permissions)
      try {
        await bot.telegram.closeForumTopic(chatId, topicId);
      } catch (closeError) {
        elizaLogger.warn('Could not close forum topic (insufficient permissions):', closeError.message);
      }

      // Update status in database
      raidTopic.status = 'completed';
      raidTopic.updated_at = new Date();
      await this.saveRaidTopic(raidTopic);

      // Remove from active topics
      this.activeTopics.delete(topicKey);

      elizaLogger.info(`Closed raid topic: ${raidTopic.topic_name} (${topicId})`);

    } catch (error) {
      elizaLogger.error('Failed to close raid topic:', error);
    }
  }

  /**
   * Get topic information
   */
  async getTopicInfo(chatId: string, topicId: number): Promise<RaidTopic | null> {
    const topicKey = `${chatId}-${topicId}`;
    
    // Check cache first
    if (this.activeTopics.has(topicKey)) {
      return this.activeTopics.get(topicKey)!;
    }

    // Try to load from database
    try {
      const { data, error } = await this.supabase
        .from('raid_topics')
        .select('*')
        .eq('chat_id', chatId)
        .eq('topic_id', topicId)
        .single();

      if (error || !data) {
        return null;
      }

      const raidTopic: RaidTopic = this.mapDatabaseToRaidTopic(data);
      
      // Cache if active
      if (raidTopic.status === 'active') {
        this.activeTopics.set(topicKey, raidTopic);
      }

      return raidTopic;
    } catch (error) {
      elizaLogger.error('Failed to get topic info:', error);
      return null;
    }
  }

  /**
   * Update topic participant count
   */
  async updateTopicParticipants(chatId: string, topicId: number, increment: number = 1): Promise<void> {
    try {
      const topicKey = `${chatId}-${topicId}`;
      const raidTopic = this.activeTopics.get(topicKey);

      if (raidTopic) {
        raidTopic.participants_count += increment;
        raidTopic.updated_at = new Date();
        await this.saveRaidTopic(raidTopic);
      } else {
        // Update directly in database
        await this.supabase
          .from('raid_topics')
          .update({
            participants_count: this.supabase.sql`participants_count + ${increment}`,
            updated_at: new Date().toISOString(),
          })
          .eq('chat_id', chatId)
          .eq('topic_id', topicId);
      }
    } catch (error) {
      elizaLogger.error('Failed to update topic participants:', error);
    }
  }

  /**
   * List active topics for a chat
   */
  async getActiveTopics(chatId: string): Promise<RaidTopic[]> {
    try {
      const { data, error } = await this.supabase
        .from('raid_topics')
        .select('*')
        .eq('chat_id', chatId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        elizaLogger.error('Failed to get active topics:', error);
        return [];
      }

      return (data || []).map(this.mapDatabaseToRaidTopic);
    } catch (error) {
      elizaLogger.error('Failed to get active topics:', error);
      return [];
    }
  }

  private async saveRaidTopic(raidTopic: RaidTopic): Promise<void> {
    try {
      await this.supabase
        .from('raid_topics')
        .upsert({
          id: raidTopic.id,
          chat_id: raidTopic.chat_id,
          topic_id: raidTopic.topic_id,
          topic_name: raidTopic.topic_name,
          raid_id: raidTopic.raid_id,
          raid_type: raidTopic.raid_type,
          target_platform: raidTopic.target_platform,
          target_url: raidTopic.target_url,
          status: raidTopic.status,
          participants_count: raidTopic.participants_count,
          created_at: raidTopic.created_at.toISOString(),
          updated_at: raidTopic.updated_at.toISOString(),
          auto_close_at: raidTopic.auto_close_at?.toISOString(),
          metadata: raidTopic.metadata,
        });
    } catch (error) {
      elizaLogger.error('Failed to save raid topic:', error);
    }
  }

  private async loadActiveTopics(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('raid_topics')
        .select('*')
        .eq('status', 'active');

      if (error) {
        elizaLogger.debug('Could not load active topics from database:', error.message);
        return;
      }

      (data || []).forEach((topicData: any) => {
        const raidTopic = this.mapDatabaseToRaidTopic(topicData);
        this.activeTopics.set(raidTopic.id, raidTopic);
      });

      elizaLogger.info(`Loaded ${this.activeTopics.size} active raid topics`);
    } catch (error) {
      elizaLogger.error('Failed to load active topics:', error);
    }
  }

  private mapDatabaseToRaidTopic(data: any): RaidTopic {
    return {
      id: data.id,
      chat_id: data.chat_id,
      topic_id: data.topic_id,
      topic_name: data.topic_name,
      raid_id: data.raid_id,
      raid_type: data.raid_type,
      target_platform: data.target_platform,
      target_url: data.target_url,
      status: data.status,
      participants_count: data.participants_count || 0,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      auto_close_at: data.auto_close_at ? new Date(data.auto_close_at) : undefined,
      metadata: data.metadata || {},
    };
  }

  private extractTargetName(url: string): string {
    try {
      const match = url.match(/(?:twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/);
      if (match) {
        return `@${match[1]}`;
      }
      return 'Unknown Target';
    } catch {
      return 'Unknown Target';
    }
  }

  private formatDuration(start: Date, end: Date): string {
    const diffMs = end.getTime() - start.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }

  private startCleanupProcess(): void {
    // Clean up expired topics every 10 minutes
    setInterval(async () => {
      await this.cleanupExpiredTopics();
    }, 10 * 60 * 1000);
  }

  private async cleanupExpiredTopics(): Promise<void> {
    try {
      const now = new Date();
      const expiredTopics: RaidTopic[] = [];

      // Find expired topics
      this.activeTopics.forEach((topic) => {
        if (topic.auto_close_at && topic.auto_close_at <= now) {
          expiredTopics.push(topic);
        }
      });

      elizaLogger.debug(`Found ${expiredTopics.length} expired topics to clean up`);

      // Archive expired topics
      for (const topic of expiredTopics) {
        try {
          // Update status in database
          topic.status = 'archived';
          topic.updated_at = now;
          await this.saveRaidTopic(topic);

          // Remove from active cache
          this.activeTopics.delete(topic.id);

          elizaLogger.debug(`Archived expired topic: ${topic.topic_name}`);
        } catch (error) {
          elizaLogger.error(`Failed to archive topic ${topic.id}:`, error);
        }
      }
    } catch (error) {
      elizaLogger.error('Error during topic cleanup:', error);
    }
  }

  async stop(): Promise<void> {
    elizaLogger.info('Forum Topic Manager stopped');
  }

  private createNoopSupabase(): any {
    const resolved = Promise.resolve({ data: null, error: null });
    const chain: any = {
      select: () => chain,
      insert: () => ({ select: () => resolved }),
      upsert: () => ({ select: () => resolved }),
      update: () => ({ eq: () => ({ select: () => resolved }) }),
      delete: () => ({ eq: () => resolved }),
      order: () => ({ limit: () => resolved, range: () => resolved }),
      limit: () => resolved,
      single: () => resolved,
      eq: () => ({ single: () => resolved, order: () => ({ limit: () => resolved }) }),
      gte: () => resolved,
      in: () => resolved,
      sql: (strings: TemplateStringsArray, ...values: any[]) => strings.join('?'),
    };
    return {
      from: () => chain,
      rpc: async () => ({ data: null, error: null }),
    };
  }
}

// Ensure the class constructor reports the expected static identifier when accessed as `.name`
Object.defineProperty(ForumTopicManager, 'name', { value: ForumTopicManager.serviceType });