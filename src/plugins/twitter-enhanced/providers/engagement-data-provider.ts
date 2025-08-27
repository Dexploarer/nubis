import { elizaLogger } from '@elizaos/core';
import type { IAgentRuntime, Memory, Provider, ProviderResult, State } from '@elizaos/core';
import type { EngagementTracker } from '../services/engagement-tracker';
import type { NotificationMonitor } from '../services/notification-monitor';

/**
 * Engagement Data Provider
 * Provides real-time engagement data and raid statistics for the agent
 */
export const engagementDataProvider: Provider = {
  name: 'engagement-data',
  description: 'Provides real-time Twitter engagement data and raid statistics',

  get: async (runtime: IAgentRuntime, message: Memory, state: State): Promise<ProviderResult> => {
    try {
      elizaLogger.debug('EngagementDataProvider: Fetching engagement data');

      // Get engagement tracker service
      const tracker = runtime.getService('ENGAGEMENT_TRACKER') as EngagementTracker;
      const monitor = runtime.getService('NOTIFICATION_MONITOR') as NotificationMonitor;

      if (!tracker) {
        return {
          text: 'Engagement tracking not available.',
          data: { available: false },
        };
      }

      const status = tracker.getStatus();
      const activeRaids = tracker.getActiveRaids();

      // Build engagement context
      let engagementContext = 'Current Engagement Status:\n\n';

      // Overall status
      engagementContext += `• Tracking: ${status.trackingEnabled ? 'Active' : 'Inactive'}\n`;
      engagementContext += `• Active Raids: ${status.activeRaids}\n`;
      engagementContext += `• Total Engagements: ${status.totalEngagements}\n\n`;

      if (activeRaids.length > 0) {
        engagementContext += 'Active Raid Performance:\n';

        for (const { tweetId, raid, counts } of activeRaids.slice(0, 3)) {
          const totalEngagement =
            (counts?.likes || 0) +
            (counts?.retweets || 0) +
            (counts?.quotes || 0) +
            (counts?.replies || 0);

          engagementContext += `• Raid ${raid.id.slice(0, 8)}: ${totalEngagement} total engagements\n`;
          engagementContext += `  Breakdown: ${counts?.likes || 0}❤️ ${counts?.retweets || 0}🔄 ${counts?.quotes || 0}💬 ${counts?.replies || 0}💭\n`;
        }
      }

      // Add recent notification activity if available
      if (monitor) {
        const recentEngagements = monitor.getEngagementHistory('all', 3);
        if (recentEngagements.length > 0) {
          engagementContext += '\nRecent Activity:\n';
          for (const engagement of recentEngagements) {
            const time = new Date(engagement.timestamp).toLocaleTimeString();
            engagementContext += `• ${engagement.type} by @${engagement.author} (${time})\n`;
          }
        }
      }

      return {
        text: engagementContext.trim() || 'No engagement data available.',
        data: {
          trackingEnabled: status.trackingEnabled,
          activeRaids: status.activeRaids,
          totalEngagements: status.totalEngagements,
          raidDetails: activeRaids.slice(0, 3).map(({ tweetId, raid, counts }) => ({
            raidId: raid.id,
            tweetId,
            engagements: {
              likes: counts?.likes || 0,
              retweets: counts?.retweets || 0,
              quotes: counts?.quotes || 0,
              replies: counts?.replies || 0,
            },
          })),
        },
      };
    } catch (error) {
      elizaLogger.error('EngagementDataProvider error:', error);
      return {
        text: 'Unable to fetch engagement data.',
        data: { error: true },
      };
    }
  },
};
