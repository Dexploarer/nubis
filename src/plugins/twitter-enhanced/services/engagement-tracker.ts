import { IAgentRuntime, Service, elizaLogger } from '@elizaos/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { NotificationMonitor } from './notification-monitor';
import type { TwitterClientService } from './twitter-client-service';

/**
 * Engagement Tracker Service
 * Connects NotificationMonitor to raid tracking system and Supabase database
 * for real-time engagement detection and automatic raid engagement updates
 */
export class EngagementTracker extends Service {
  static serviceType = 'ENGAGEMENT_TRACKER';

  public name: string = EngagementTracker.serviceType;
  public capabilityDescription = 'Real-time engagement tracking and raid integration';

  private notificationMonitor: NotificationMonitor | null = null;
  private clientService: TwitterClientService | null = null;
  private supabase: SupabaseClient | null = null;
  private activeRaids: Map<string, any> = new Map(); // tweetId -> raid data
  private engagementCounts: Map<string, any> = new Map(); // tweetId -> counts
  private trackingEnabled = true;

  constructor(runtime: IAgentRuntime) {
    super(runtime);
    
    // Initialize Supabase client
    const supabaseUrl = runtime.getSetting('SUPABASE_URL') || process.env.SUPABASE_URL;
    const supabaseServiceKey = runtime.getSetting('SUPABASE_SERVICE_ROLE_KEY') || 
                              process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    } else {
      elizaLogger.warn('Supabase configuration missing for EngagementTracker');
    }

    this.trackingEnabled = (runtime.getSetting('TWITTER_ENGAGEMENT_TRACKING') || 
                           process.env.TWITTER_ENGAGEMENT_TRACKING || 
                           'true').toLowerCase() === 'true';
  }

  static async start(runtime: IAgentRuntime): Promise<EngagementTracker> {
    elizaLogger.info('Starting Engagement Tracker');
    const service = new EngagementTracker(runtime);
    await service.initialize();
    return service;
  }

  static async stop(runtime: IAgentRuntime): Promise<void> {
    try {
      const existing = runtime?.getService?.(EngagementTracker.serviceType);
      if (existing && typeof (existing as EngagementTracker).stop === 'function') {
        await (existing as EngagementTracker).stop();
      }
    } finally {
      elizaLogger.info('Engagement Tracker stopped');
    }
  }

  async initialize(): Promise<void> {
    try {
      elizaLogger.info('Initializing Engagement Tracker');
      
      if (!this.trackingEnabled) {
        elizaLogger.info('Engagement tracking is disabled');
        return;
      }

      // Get required services
      this.notificationMonitor = this.runtime.getService('NOTIFICATION_MONITOR') as NotificationMonitor;
      this.clientService = this.runtime.getService('TWITTER_CLIENT_SERVICE') as TwitterClientService;

      if (!this.notificationMonitor) {
        throw new Error('NotificationMonitor service not found');
      }

      if (!this.clientService) {
        throw new Error('TwitterClientService not found');
      }

      // Register notification callbacks
      this.registerNotificationCallbacks();

      // Load active raids from database
      await this.loadActiveRaids();

      elizaLogger.info('Engagement Tracker initialized successfully');
    } catch (error) {
      elizaLogger.error('Failed to initialize Engagement Tracker:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    // Clean up notification callbacks
    if (this.notificationMonitor) {
      // Note: We would need to store callback references to properly unregister
      elizaLogger.info('Engagement Tracker cleanup completed');
    }
  }

  /**
   * Register callbacks with NotificationMonitor
   */
  private registerNotificationCallbacks(): void {
    if (!this.notificationMonitor) return;

    // Register for all engagement types
    this.notificationMonitor.registerCallback('reply', this.handleReply.bind(this));
    this.notificationMonitor.registerCallback('retweet', this.handleRetweet.bind(this));
    this.notificationMonitor.registerCallback('quote', this.handleQuote.bind(this));
    this.notificationMonitor.registerCallback('mention', this.handleMention.bind(this));

    elizaLogger.info('Registered engagement tracking callbacks');
  }

  /**
   * Load active raids from database
   */
  private async loadActiveRaids(): Promise<void> {
    if (!this.supabase) {
      elizaLogger.warn('Cannot load active raids - Supabase not configured');
      return;
    }

    try {
      const { data: raids, error } = await this.supabase
        .from('raids')
        .select('*')
        .eq('status', 'active')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

      if (error) {
        elizaLogger.error('Failed to load active raids:', error);
        return;
      }

      // Store active raids by tweet URL/ID
      for (const raid of raids || []) {
        if (raid.target_url) {
          try {
            const tweetId = this.extractTweetId(raid.target_url);
            this.activeRaids.set(tweetId, raid);
            
            // Initialize engagement counts
            this.engagementCounts.set(tweetId, {
              likes: 0,
              retweets: 0,
              quotes: 0,
              replies: 0,
              lastUpdated: Date.now()
            });
          } catch (error) {
            elizaLogger.warn(`Invalid raid target URL: ${raid.target_url}`);
          }
        }
      }

      elizaLogger.info(`Loaded ${this.activeRaids.size} active raids for tracking`);
    } catch (error) {
      elizaLogger.error('Failed to load active raids:', error);
    }
  }

  /**
   * Handle reply notifications
   */
  private async handleReply(engagementData: any): Promise<void> {
    try {
      const repliedToTweetId = engagementData.originalNotification?.in_reply_to_status_id;
      
      if (repliedToTweetId && this.activeRaids.has(repliedToTweetId)) {
        elizaLogger.info(`Reply detected for raid tweet ${repliedToTweetId}`, {
          author: engagementData.author,
          tweetId: engagementData.id
        });

        await this.recordEngagement(repliedToTweetId, 'reply', engagementData);
      }
    } catch (error) {
      elizaLogger.error('Failed to handle reply engagement:', error);
    }
  }

  /**
   * Handle retweet notifications
   */
  private async handleRetweet(engagementData: any): Promise<void> {
    try {
      // Extract original tweet ID from retweet
      const originalTweetId = this.extractOriginalTweetFromRetweet(engagementData.originalNotification);
      
      if (originalTweetId && this.activeRaids.has(originalTweetId)) {
        elizaLogger.info(`Retweet detected for raid tweet ${originalTweetId}`, {
          author: engagementData.author,
          tweetId: engagementData.id
        });

        await this.recordEngagement(originalTweetId, 'retweet', engagementData);
      }
    } catch (error) {
      elizaLogger.error('Failed to handle retweet engagement:', error);
    }
  }

  /**
   * Handle quote tweet notifications
   */
  private async handleQuote(engagementData: any): Promise<void> {
    try {
      const quotedTweetId = engagementData.originalNotification?.quoted_status?.id ||
                           this.extractTweetIdFromText(engagementData.text);
      
      if (quotedTweetId && this.activeRaids.has(quotedTweetId)) {
        elizaLogger.info(`Quote tweet detected for raid tweet ${quotedTweetId}`, {
          author: engagementData.author,
          tweetId: engagementData.id
        });

        await this.recordEngagement(quotedTweetId, 'quote', engagementData);
      }
    } catch (error) {
      elizaLogger.error('Failed to handle quote engagement:', error);
    }
  }

  /**
   * Handle mention notifications
   */
  private async handleMention(engagementData: any): Promise<void> {
    try {
      // Check if this mention is about any of our active raids
      for (const [tweetId, raid] of this.activeRaids) {
        if (engagementData.text.includes(tweetId) || 
            engagementData.text.includes(raid.target_url)) {
          
          elizaLogger.info(`Mention detected for raid tweet ${tweetId}`, {
            author: engagementData.author,
            tweetId: engagementData.id
          });

          await this.recordEngagement(tweetId, 'mention', engagementData);
          break;
        }
      }
    } catch (error) {
      elizaLogger.error('Failed to handle mention engagement:', error);
    }
  }

  /**
   * Record engagement in database and update counts
   */
  private async recordEngagement(tweetId: string, type: string, engagementData: any): Promise<void> {
    if (!this.supabase) {
      elizaLogger.warn('Cannot record engagement - Supabase not configured');
      return;
    }

    try {
      const raid = this.activeRaids.get(tweetId);
      if (!raid) {
        elizaLogger.warn(`No active raid found for tweet ${tweetId}`);
        return;
      }

      // Record in raid_engagements table
      const { error: engagementError } = await this.supabase
        .from('raid_engagements')
        .insert({
          raid_id: raid.id,
          user_id: engagementData.author,
          engagement_type: type,
          tweet_id: engagementData.id,
          original_tweet_id: tweetId,
          timestamp: new Date(),
          metadata: {
            author: engagementData.author,
            text: engagementData.text?.substring(0, 500), // Limit text length
            originalNotification: engagementData.originalNotification
          }
        });

      if (engagementError) {
        elizaLogger.error('Failed to record raid engagement:', engagementError);
        return;
      }

      // Update engagement counts
      const counts = this.engagementCounts.get(tweetId) || {
        likes: 0, retweets: 0, quotes: 0, replies: 0, lastUpdated: 0
      };

      switch (type) {
        case 'reply':
          counts.replies++;
          break;
        case 'retweet':
          counts.retweets++;
          break;
        case 'quote':
          counts.quotes++;
          break;
        case 'like':
          counts.likes++;
          break;
      }

      counts.lastUpdated = Date.now();
      this.engagementCounts.set(tweetId, counts);

      // Update raid statistics
      await this.updateRaidStatistics(raid.id, counts);

      elizaLogger.info(`Recorded ${type} engagement for raid ${raid.id}`, {
        tweetId,
        author: engagementData.author,
        newCounts: counts
      });

    } catch (error) {
      elizaLogger.error('Failed to record engagement:', error);
    }
  }

  /**
   * Update raid statistics in database
   */
  private async updateRaidStatistics(raidId: string, counts: any): Promise<void> {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('raids')
        .update({
          engagement_stats: counts,
          updated_at: new Date()
        })
        .eq('id', raidId);

      if (error) {
        elizaLogger.error('Failed to update raid statistics:', error);
      }
    } catch (error) {
      elizaLogger.error('Failed to update raid statistics:', error);
    }
  }

  /**
   * Add new raid for tracking
   */
  async addRaidForTracking(raidId: string, targetUrl: string): Promise<void> {
    try {
      const tweetId = this.extractTweetId(targetUrl);
      
      // Load raid data from database
      if (this.supabase) {
        const { data: raid, error } = await this.supabase
          .from('raids')
          .select('*')
          .eq('id', raidId)
          .single();

        if (!error && raid) {
          this.activeRaids.set(tweetId, raid);
          this.engagementCounts.set(tweetId, {
            likes: 0,
            retweets: 0,
            quotes: 0,
            replies: 0,
            lastUpdated: Date.now()
          });

          elizaLogger.info(`Added raid ${raidId} for tracking (tweet: ${tweetId})`);
        }
      }
    } catch (error) {
      elizaLogger.error(`Failed to add raid ${raidId} for tracking:`, error);
    }
  }

  /**
   * Remove raid from tracking
   */
  removeRaidFromTracking(targetUrl: string): void {
    try {
      const tweetId = this.extractTweetId(targetUrl);
      this.activeRaids.delete(tweetId);
      this.engagementCounts.delete(tweetId);
      
      elizaLogger.info(`Removed raid from tracking (tweet: ${tweetId})`);
    } catch (error) {
      elizaLogger.error('Failed to remove raid from tracking:', error);
    }
  }

  /**
   * Get real-time engagement data for a raid
   */
  getRaidEngagement(targetUrl: string): any | null {
    try {
      const tweetId = this.extractTweetId(targetUrl);
      return this.engagementCounts.get(tweetId) || null;
    } catch (error) {
      elizaLogger.error('Failed to get raid engagement:', error);
      return null;
    }
  }

  /**
   * Get all active raids being tracked
   */
  getActiveRaids(): Array<{ tweetId: string; raid: any; counts: any }> {
    const result = [];
    for (const [tweetId, raid] of this.activeRaids) {
      const counts = this.engagementCounts.get(tweetId);
      result.push({ tweetId, raid, counts });
    }
    return result;
  }

  /**
   * Utility: Extract tweet ID from URL
   */
  private extractTweetId(url: string): string {
    const match = url.match(/status\/(\d+)/);
    if (!match) {
      throw new Error(`Invalid Twitter URL: ${url}`);
    }
    return match[1];
  }

  /**
   * Utility: Extract original tweet ID from retweet
   */
  private extractOriginalTweetFromRetweet(notification: any): string | null {
    // Check for retweeted_status
    if (notification.retweeted_status?.id) {
      return notification.retweeted_status.id;
    }

    // Check for RT pattern in text
    const text = notification.text || notification.full_text || '';
    const rtMatch = text.match(/RT @\w+: .*https:\/\/twitter\.com\/\w+\/status\/(\d+)/);
    if (rtMatch) {
      return rtMatch[1];
    }

    return null;
  }

  /**
   * Utility: Extract tweet ID from text (for quote tweets)
   */
  private extractTweetIdFromText(text: string): string | null {
    const urlMatch = text.match(/https:\/\/twitter\.com\/\w+\/status\/(\d+)/);
    return urlMatch ? urlMatch[1] : null;
  }

  /**
   * Get service status
   */
  getStatus(): {
    trackingEnabled: boolean;
    activeRaids: number;
    totalEngagements: number;
    supabaseConnected: boolean;
  } {
    let totalEngagements = 0;
    for (const [_, counts] of this.engagementCounts) {
      totalEngagements += counts.likes + counts.retweets + counts.quotes + counts.replies;
    }

    return {
      trackingEnabled: this.trackingEnabled,
      activeRaids: this.activeRaids.size,
      totalEngagements,
      supabaseConnected: this.supabase !== null,
    };
  }
}

// Ensure service type is properly set for ElizaOS service loading
Object.defineProperty(EngagementTracker, 'name', { value: EngagementTracker.serviceType });