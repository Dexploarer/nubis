/**
 * Entity Synchronization Service for Social Raids Plugin
 * Manages synchronization of users and chats between Telegram and database
 * for better raid coordination and analytics
 */

import { Service, elizaLogger } from '@elizaos/core';
import type { IAgentRuntime } from '@elizaos/core';
import { createClient } from '@supabase/supabase-js';

export interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  is_bot?: boolean;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_forum?: boolean;
  description?: string;
}

export interface SyncedUser {
  telegram_id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  display_name: string;
  language_code?: string;
  is_bot: boolean;
  is_premium: boolean;
  first_seen_at: Date;
  last_seen_at: Date;
  total_raids_joined: number;
  total_points: number;
  status: 'active' | 'banned' | 'inactive';
  metadata: any;
}

export interface SyncedChat {
  telegram_id: string;
  type: string;
  title?: string;
  username?: string;
  description?: string;
  is_forum: boolean;
  member_count?: number;
  administrators?: string[];
  raid_settings: {
    raids_enabled: boolean;
    auto_raid_detection: boolean;
    min_raid_participants: number;
    max_concurrent_raids: number;
    allowed_raid_platforms: string[];
  };
  created_at: Date;
  updated_at: Date;
  last_activity_at: Date;
  total_raids_created: number;
  metadata: any;
}

export class EntitySyncService extends Service {
  static serviceType = 'ENTITY_SYNC_SERVICE';

  public name: string = EntitySyncService.serviceType;
  public supabase: any;
  private userCache = new Map<string, SyncedUser>();
  private chatCache = new Map<string, SyncedChat>();
  private syncQueue = new Set<string>();
  private isProcessing = false;

  capabilityDescription =
    'Synchronizes Telegram users and chats with database for raid coordination';

  constructor(runtime: IAgentRuntime) {
    super(runtime);

    const supabaseUrl = runtime.getSetting('SUPABASE_URL') || process.env.SUPABASE_URL;
    const supabaseServiceKey =
      runtime.getSetting('SUPABASE_SERVICE_ROLE_KEY') || process.env.SUPABASE_SERVICE_ROLE_KEY;

    this.supabase =
      supabaseUrl && supabaseServiceKey
        ? createClient(supabaseUrl, supabaseServiceKey)
        : this.createNoopSupabase();

    if (!supabaseUrl || !supabaseServiceKey) {
      elizaLogger.warn('Supabase configuration missing for EntitySyncService - using no-op client');
    }
  }

  static async start(runtime: IAgentRuntime): Promise<EntitySyncService> {
    elizaLogger.info('Starting Entity Sync Service');
    const service = new EntitySyncService(runtime);
    await service.initialize();
    return service;
  }

  static async stop(runtime: IAgentRuntime): Promise<void> {
    elizaLogger.info('Entity Sync Service stopped');
  }

  async initialize(): Promise<void> {
    try {
      // Create database tables if they don't exist
      await this.createTables();

      // Start periodic sync process
      this.startPeriodicSync();

      elizaLogger.info('Entity Sync Service initialized successfully');
    } catch (error) {
      elizaLogger.error('Failed to initialize Entity Sync Service:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    try {
      // Create users table
      await this.supabase.rpc('create_synced_users_table_if_not_exists');

      // Create chats table
      await this.supabase.rpc('create_synced_chats_table_if_not_exists');

      elizaLogger.info('Entity sync database tables ensured');
    } catch (error) {
      // Tables might already exist or RPC might not be available
      elizaLogger.debug('Database table creation skipped:', error.message);
    }
  }

  /**
   * Synchronize a Telegram user with the database
   */
  async syncUser(telegramUser: TelegramUser, chatId?: string): Promise<SyncedUser> {
    try {
      const userId = telegramUser.id.toString();

      // Check cache first
      if (this.userCache.has(userId)) {
        const cachedUser = this.userCache.get(userId)!;
        // Update last seen time
        cachedUser.last_seen_at = new Date();
        return cachedUser;
      }

      // Prepare user data
      const displayName = this.generateDisplayName(telegramUser);
      const now = new Date();

      const userData: Partial<SyncedUser> = {
        telegram_id: userId,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        display_name: displayName,
        language_code: telegramUser.language_code,
        is_bot: telegramUser.is_bot || false,
        is_premium: telegramUser.is_premium || false,
        last_seen_at: now,
        status: 'active',
        metadata: {
          added_to_attachment_menu: telegramUser.added_to_attachment_menu,
          sync_source: 'telegram',
          last_chat_id: chatId,
        },
      };

      // Upsert user to database
      const { data, error } = await this.supabase
        .from('synced_users')
        .upsert(
          {
            ...userData,
            first_seen_at: now, // Only set on insert
            total_raids_joined: 0,
            total_points: 0,
          },
          {
            onConflict: 'telegram_id',
            ignoreDuplicates: false,
          },
        )
        .select()
        .single();

      if (error) {
        elizaLogger.error('Failed to sync user:', error);
        throw error;
      }

      const syncedUser: SyncedUser = {
        telegram_id: data.telegram_id,
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        display_name: data.display_name,
        language_code: data.language_code,
        is_bot: data.is_bot,
        is_premium: data.is_premium,
        first_seen_at: new Date(data.first_seen_at),
        last_seen_at: new Date(data.last_seen_at),
        total_raids_joined: data.total_raids_joined || 0,
        total_points: data.total_points || 0,
        status: data.status,
        metadata: data.metadata || {},
      };

      // Cache the user
      this.userCache.set(userId, syncedUser);

      elizaLogger.debug(`User synced: ${displayName} (${userId})`);
      return syncedUser;
    } catch (error) {
      elizaLogger.error('Failed to sync user:', error);
      throw error;
    }
  }

  /**
   * Synchronize a Telegram chat with the database
   */
  async syncChat(telegramChat: TelegramChat): Promise<SyncedChat> {
    try {
      const chatId = telegramChat.id.toString();

      // Check cache first
      if (this.chatCache.has(chatId)) {
        const cachedChat = this.chatCache.get(chatId)!;
        cachedChat.last_activity_at = new Date();
        return cachedChat;
      }

      const now = new Date();
      const chatData: Partial<SyncedChat> = {
        telegram_id: chatId,
        type: telegramChat.type,
        title: telegramChat.title,
        username: telegramChat.username,
        description: telegramChat.description,
        is_forum: telegramChat.is_forum || false,
        raid_settings: {
          raids_enabled: true,
          auto_raid_detection: true,
          min_raid_participants: 2,
          max_concurrent_raids: 3,
          allowed_raid_platforms: ['twitter', 'x'],
        },
        updated_at: now,
        last_activity_at: now,
        metadata: {
          sync_source: 'telegram',
          first_name: telegramChat.first_name,
          last_name: telegramChat.last_name,
        },
      };

      // Upsert chat to database
      const { data, error } = await this.supabase
        .from('synced_chats')
        .upsert(
          {
            ...chatData,
            created_at: now, // Only set on insert
            total_raids_created: 0,
          },
          {
            onConflict: 'telegram_id',
            ignoreDuplicates: false,
          },
        )
        .select()
        .single();

      if (error) {
        elizaLogger.error('Failed to sync chat:', error);
        throw error;
      }

      const syncedChat: SyncedChat = {
        telegram_id: data.telegram_id,
        type: data.type,
        title: data.title,
        username: data.username,
        description: data.description,
        is_forum: data.is_forum,
        member_count: data.member_count,
        administrators: data.administrators || [],
        raid_settings: data.raid_settings || chatData.raid_settings,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        last_activity_at: new Date(data.last_activity_at),
        total_raids_created: data.total_raids_created || 0,
        metadata: data.metadata || {},
      };

      // Cache the chat
      this.chatCache.set(chatId, syncedChat);

      elizaLogger.debug(`Chat synced: ${syncedChat.title || syncedChat.type} (${chatId})`);
      return syncedChat;
    } catch (error) {
      elizaLogger.error('Failed to sync chat:', error);
      throw error;
    }
  }

  /**
   * Update user's raid participation statistics
   */
  async updateUserRaidStats(userId: string, pointsEarned: number, raidId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('synced_users')
        .update({
          total_raids_joined: this.supabase.sql`total_raids_joined + 1`,
          total_points: this.supabase.sql`total_points + ${pointsEarned}`,
          last_seen_at: new Date().toISOString(),
          metadata: this.supabase.sql`jsonb_set(metadata, '{last_raid_id}', '"${raidId}"')`,
        })
        .eq('telegram_id', userId);

      if (error) {
        elizaLogger.error('Failed to update user raid stats:', error);
        return;
      }

      // Update cache
      const cachedUser = this.userCache.get(userId);
      if (cachedUser) {
        cachedUser.total_raids_joined += 1;
        cachedUser.total_points += pointsEarned;
        cachedUser.last_seen_at = new Date();
      }

      elizaLogger.debug(`Updated raid stats for user ${userId}: +${pointsEarned} points`);
    } catch (error) {
      elizaLogger.error('Failed to update user raid stats:', error);
    }
  }

  /**
   * Update chat's raid statistics
   */
  async updateChatRaidStats(chatId: string, raidCreated: boolean = false): Promise<void> {
    try {
      const updateData: any = {
        last_activity_at: new Date().toISOString(),
      };

      if (raidCreated) {
        updateData.total_raids_created = this.supabase.sql`total_raids_created + 1`;
      }

      const { error } = await this.supabase
        .from('synced_chats')
        .update(updateData)
        .eq('telegram_id', chatId);

      if (error) {
        elizaLogger.error('Failed to update chat raid stats:', error);
        return;
      }

      // Update cache
      const cachedChat = this.chatCache.get(chatId);
      if (cachedChat) {
        cachedChat.last_activity_at = new Date();
        if (raidCreated) {
          cachedChat.total_raids_created += 1;
        }
      }

      elizaLogger.debug(
        `Updated raid stats for chat ${chatId}${raidCreated ? ' (raid created)' : ''}`,
      );
    } catch (error) {
      elizaLogger.error('Failed to update chat raid stats:', error);
    }
  }

  /**
   * Get user statistics and profile
   */
  async getUserProfile(userId: string): Promise<SyncedUser | null> {
    try {
      // Check cache first
      if (this.userCache.has(userId)) {
        return this.userCache.get(userId)!;
      }

      const { data, error } = await this.supabase
        .from('synced_users')
        .select('*')
        .eq('telegram_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      const user: SyncedUser = {
        telegram_id: data.telegram_id,
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        display_name: data.display_name,
        language_code: data.language_code,
        is_bot: data.is_bot,
        is_premium: data.is_premium,
        first_seen_at: new Date(data.first_seen_at),
        last_seen_at: new Date(data.last_seen_at),
        total_raids_joined: data.total_raids_joined || 0,
        total_points: data.total_points || 0,
        status: data.status,
        metadata: data.metadata || {},
      };

      // Cache the user
      this.userCache.set(userId, user);

      return user;
    } catch (error) {
      elizaLogger.error('Failed to get user profile:', error);
      return null;
    }
  }

  /**
   * Get chat configuration and statistics
   */
  async getChatProfile(chatId: string): Promise<SyncedChat | null> {
    try {
      // Check cache first
      if (this.chatCache.has(chatId)) {
        return this.chatCache.get(chatId)!;
      }

      const { data, error } = await this.supabase
        .from('synced_chats')
        .select('*')
        .eq('telegram_id', chatId)
        .single();

      if (error || !data) {
        return null;
      }

      const chat: SyncedChat = {
        telegram_id: data.telegram_id,
        type: data.type,
        title: data.title,
        username: data.username,
        description: data.description,
        is_forum: data.is_forum,
        member_count: data.member_count,
        administrators: data.administrators || [],
        raid_settings: data.raid_settings,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        last_activity_at: new Date(data.last_activity_at),
        total_raids_created: data.total_raids_created || 0,
        metadata: data.metadata || {},
      };

      // Cache the chat
      this.chatCache.set(chatId, chat);

      return chat;
    } catch (error) {
      elizaLogger.error('Failed to get chat profile:', error);
      return null;
    }
  }

  /**
   * Get top users by points in a chat
   */
  async getChatLeaderboard(chatId: string, limit: number = 10): Promise<SyncedUser[]> {
    try {
      const { data, error } = await this.supabase
        .from('synced_users')
        .select('*')
        .eq('metadata->>last_chat_id', chatId)
        .eq('status', 'active')
        .order('total_points', { ascending: false })
        .limit(limit);

      if (error) {
        elizaLogger.error('Failed to get chat leaderboard:', error);
        return [];
      }

      return data.map((user: any) => ({
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        display_name: user.display_name,
        language_code: user.language_code,
        is_bot: user.is_bot,
        is_premium: user.is_premium,
        first_seen_at: new Date(user.first_seen_at),
        last_seen_at: new Date(user.last_seen_at),
        total_raids_joined: user.total_raids_joined || 0,
        total_points: user.total_points || 0,
        status: user.status,
        metadata: user.metadata || {},
      }));
    } catch (error) {
      elizaLogger.error('Failed to get chat leaderboard:', error);
      return [];
    }
  }

  private generateDisplayName(user: TelegramUser): string {
    if (user.username) {
      return `@${user.username}`;
    }
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    return `User${user.id}`;
  }

  private startPeriodicSync(): void {
    // Sync cached data every 5 minutes
    setInterval(
      async () => {
        await this.processSyncQueue();
      },
      5 * 60 * 1000,
    );
  }

  private async processSyncQueue(): Promise<void> {
    if (this.isProcessing || this.syncQueue.size === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const entitiesToSync = Array.from(this.syncQueue);
      this.syncQueue.clear();

      elizaLogger.debug(`Processing sync queue: ${entitiesToSync.length} entities`);

      // Process in batches to avoid overwhelming the database
      const batchSize = 10;
      for (let i = 0; i < entitiesToSync.length; i += batchSize) {
        const batch = entitiesToSync.slice(i, i + batchSize);

        await Promise.allSettled(
          batch.map(async (entityId) => {
            // Additional sync logic if needed
          }),
        );
      }
    } catch (error) {
      elizaLogger.error('Error processing sync queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async stop(): Promise<void> {
    elizaLogger.info('Entity Sync Service stopped');
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
Object.defineProperty(EntitySyncService, 'name', { value: EntitySyncService.serviceType });
