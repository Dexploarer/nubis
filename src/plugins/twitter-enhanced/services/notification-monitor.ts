import { IAgentRuntime, Service, elizaLogger } from '@elizaos/core';
import type { TwitterClientService } from './twitter-client-service';

/**
 * Notification Monitor Service
 * Monitors Twitter notifications and mentions in real-time to detect
 * engagement activities for raid tracking and general monitoring
 */
export class NotificationMonitor extends Service {
  static serviceType = 'NOTIFICATION_MONITOR';

  public name: string = NotificationMonitor.serviceType;
  public capabilityDescription = 'Real-time Twitter notification and engagement monitoring';

  private clientService: TwitterClientService | null = null;
  private isMonitoring = false;
  private monitorInterval: NodeJS.Timeout | null = null;
  private pollInterval: number = 60000; // 1 minute default
  private lastNotificationTimestamp: number = 0;
  private notificationCallbacks: Map<string, Function[]> = new Map();
  private engagementHistory: Map<string, any[]> = new Map();

  constructor(runtime: IAgentRuntime) {
    super(runtime);

    // Get poll interval from config
    const intervalStr =
      runtime.getSetting('TWITTER_NOTIFICATION_POLL_INTERVAL') ||
      process.env.TWITTER_NOTIFICATION_POLL_INTERVAL ||
      '60000';
    this.pollInterval = parseInt(intervalStr);

    elizaLogger.info(`NotificationMonitor configured with ${this.pollInterval}ms poll interval`);
  }

  static async start(runtime: IAgentRuntime): Promise<NotificationMonitor> {
    elizaLogger.info('Starting Notification Monitor');
    const service = new NotificationMonitor(runtime);
    await service.initialize();
    return service;
  }

  static async stop(runtime: IAgentRuntime): Promise<void> {
    try {
      const existing = runtime?.getService?.(NotificationMonitor.serviceType);
      if (existing && typeof (existing as NotificationMonitor).stop === 'function') {
        await (existing as NotificationMonitor).stop();
      }
    } finally {
      elizaLogger.info('Notification Monitor stopped');
    }
  }

  async initialize(): Promise<void> {
    try {
      elizaLogger.info('Initializing Notification Monitor');

      // Get Twitter client service
      this.clientService = this.runtime.getService(
        'TWITTER_CLIENT_SERVICE',
      ) as TwitterClientService;
      if (!this.clientService) {
        throw new Error('TwitterClientService not found - ensure it is loaded first');
      }

      // Start monitoring if enabled
      const monitoringEnabled =
        (
          this.runtime.getSetting('TWITTER_RAID_MONITORING') ||
          process.env.TWITTER_RAID_MONITORING ||
          'true'
        ).toLowerCase() === 'true';

      if (monitoringEnabled) {
        await this.startMonitoring();
      }

      elizaLogger.info('Notification Monitor initialized successfully');
    } catch (error) {
      elizaLogger.error('Failed to initialize Notification Monitor:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    await this.stopMonitoring();
  }

  /**
   * Start monitoring Twitter notifications
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      elizaLogger.warn('Notification monitoring is already running');
      return;
    }

    try {
      // Check if Twitter client is ready
      if (!this.clientService || !(await this.clientService.isReady())) {
        throw new Error('Twitter client not ready for monitoring');
      }

      elizaLogger.info('Starting Twitter notification monitoring...');
      this.isMonitoring = true;
      this.lastNotificationTimestamp = Date.now();

      // Start polling
      this.monitorInterval = setInterval(async () => {
        try {
          await this.pollNotifications();
        } catch (error) {
          elizaLogger.error('Error during notification polling:', error);
        }
      }, this.pollInterval);

      // Do initial poll
      await this.pollNotifications();

      elizaLogger.info(
        `Twitter notification monitoring started (interval: ${this.pollInterval}ms)`,
      );
    } catch (error) {
      this.isMonitoring = false;
      elizaLogger.error('Failed to start notification monitoring:', error);
      throw error;
    }
  }

  /**
   * Stop monitoring Twitter notifications
   */
  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      return;
    }

    elizaLogger.info('Stopping Twitter notification monitoring...');

    this.isMonitoring = false;

    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }

    elizaLogger.info('Twitter notification monitoring stopped');
  }

  /**
   * Poll for new notifications
   */
  private async pollNotifications(): Promise<void> {
    if (!this.clientService) {
      elizaLogger.error('Twitter client service not available for polling');
      return;
    }

    try {
      elizaLogger.debug('Polling Twitter notifications...');

      // Get mentions (our primary notification source)
      const mentions = await this.clientService.getMentions();

      // Filter for new notifications since last poll
      const newNotifications = mentions.filter((mention) => {
        const mentionTime = new Date(
          mention.createdAt || mention.created_at || mention.timestamp || 0,
        ).getTime();
        return mentionTime > this.lastNotificationTimestamp;
      });

      if (newNotifications.length > 0) {
        elizaLogger.info(`Found ${newNotifications.length} new Twitter notifications`);

        // Process each notification
        for (const notification of newNotifications) {
          await this.processNotification(notification);
        }

        // Update last notification timestamp
        this.lastNotificationTimestamp = Date.now();
      } else {
        elizaLogger.debug('No new notifications found');
      }
    } catch (error) {
      elizaLogger.error('Failed to poll notifications:', error);
    }
  }

  /**
   * Process a single notification
   */
  private async processNotification(notification: any): Promise<void> {
    try {
      const notificationType = this.classifyNotification(notification);
      const tweetId = notification.id || notification.rest_id || notification.id_str;

      elizaLogger.info(
        `Processing notification: ${notificationType} from ${notification.username || notification.user?.username || 'unknown'} (${tweetId || 'unknown'})`,
      );

      // Store in engagement history
      const engagementData = {
        id: tweetId,
        type: notificationType,
        author: notification.username || notification.user?.username || 'unknown',
        text: notification.text || notification.full_text || '',
        timestamp: Date.now(),
        originalNotification: notification,
      };

      // Add to history
      if (!this.engagementHistory.has(notificationType)) {
        this.engagementHistory.set(notificationType, []);
      }
      this.engagementHistory.get(notificationType)!.push(engagementData);

      // Trigger callbacks
      await this.triggerCallbacks(notificationType, engagementData);
      await this.triggerCallbacks('all', engagementData);
    } catch (error) {
      elizaLogger.error('Failed to process notification:', error);
    }
  }

  /**
   * Classify notification type
   */
  private classifyNotification(notification: any): string {
    const text = notification.text || notification.full_text || '';
    const author = notification.username || notification.user?.username || '';

    // Check if it's a reply (contains @mentions or reply structure)
    if (notification.in_reply_to_status_id || text.includes('@')) {
      return 'reply';
    }

    // Check if it's a retweet
    if (notification.retweeted_status || text.startsWith('RT @')) {
      return 'retweet';
    }

    // Check if it's a quote tweet
    if (notification.quoted_status || text.includes('https://twitter.com/')) {
      return 'quote';
    }

    // Check if it's a like (harder to detect from mentions - would need notification API)
    // For now, classify as mention if none of the above
    return 'mention';
  }

  /**
   * Register callback for specific notification type
   */
  registerCallback(type: string, callback: Function): void {
    if (!this.notificationCallbacks.has(type)) {
      this.notificationCallbacks.set(type, []);
    }
    this.notificationCallbacks.get(type)!.push(callback);

    elizaLogger.debug(`Registered notification callback for type: ${type}`);
  }

  /**
   * Unregister callback
   */
  unregisterCallback(type: string, callback: Function): void {
    const callbacks = this.notificationCallbacks.get(type);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        elizaLogger.debug(`Unregistered notification callback for type: ${type}`);
      }
    }
  }

  /**
   * Trigger callbacks for notification type
   */
  private async triggerCallbacks(type: string, data: any): Promise<void> {
    const callbacks = this.notificationCallbacks.get(type);
    if (callbacks && callbacks.length > 0) {
      elizaLogger.debug(`Triggering ${callbacks.length} callbacks for type: ${type}`);

      for (const callback of callbacks) {
        try {
          await callback(data);
        } catch (error) {
          elizaLogger.error(`Callback error for type ${type}:`, error);
        }
      }
    }
  }

  /**
   * Get recent engagement history
   */
  getEngagementHistory(type?: string, limit: number = 50): any[] {
    if (type) {
      return (this.engagementHistory.get(type) || []).slice(-limit);
    }

    // Return all types combined
    const allEngagements: any[] = [];
    for (const [_, engagements] of this.engagementHistory) {
      allEngagements.push(...engagements);
    }

    return allEngagements.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  /**
   * Check if monitoring specific tweet/raid
   */
  isMonitoringTweet(tweetId: string): boolean {
    // Check if any engagement history contains this tweet ID
    for (const [_, engagements] of this.engagementHistory) {
      if (
        engagements.some(
          (e) =>
            e.originalNotification?.in_reply_to_status_id === tweetId ||
            e.originalNotification?.quoted_status?.id === tweetId ||
            e.id === tweetId,
        )
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get monitoring status
   */
  getStatus(): {
    isMonitoring: boolean;
    pollInterval: number;
    lastPoll: number;
    notificationCount: number;
    callbackCount: number;
  } {
    let totalNotifications = 0;
    let totalCallbacks = 0;

    for (const [_, engagements] of this.engagementHistory) {
      totalNotifications += engagements.length;
    }

    for (const [_, callbacks] of this.notificationCallbacks) {
      totalCallbacks += callbacks.length;
    }

    return {
      isMonitoring: this.isMonitoring,
      pollInterval: this.pollInterval,
      lastPoll: this.lastNotificationTimestamp,
      notificationCount: totalNotifications,
      callbackCount: totalCallbacks,
    };
  }

  /**
   * Manually trigger a poll (for testing/debugging)
   */
  async forcePoll(): Promise<void> {
    elizaLogger.info('Manually triggering notification poll...');
    await this.pollNotifications();
  }
}

// Ensure service type is properly set for ElizaOS service loading
Object.defineProperty(NotificationMonitor, 'name', { value: NotificationMonitor.serviceType });
