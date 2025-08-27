import type { Action, ActionResult, IAgentRuntime, Memory, State } from '@elizaos/core';
import { elizaLogger } from '@elizaos/core';
import type { EngagementTracker } from '../services/engagement-tracker';

export const trackEngagementAction: Action = {
  name: 'TRACK_ENGAGEMENT',
  description: 'Track engagement for specific tweets or raids in real-time',
  similes: ['track engagement', 'monitor engagement', 'check raid progress', 'engagement stats'],

  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const content = message.content?.text?.toLowerCase() || '';
    return (
      content.includes('engagement') ||
      content.includes('track') ||
      (content.includes('raid') && (content.includes('progress') || content.includes('stats')))
    );
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: any,
    callback?: any,
  ): Promise<ActionResult> => {
    try {
      elizaLogger.info('Executing TRACK_ENGAGEMENT action');

      // Get engagement tracker service
      const tracker = runtime.getService('ENGAGEMENT_TRACKER') as EngagementTracker;
      if (!tracker) {
        throw new Error('EngagementTracker service not available');
      }

      const content = message.content?.text || '';

      // Check if specific tweet URL is provided
      const tweetUrlMatch = content.match(/https:\/\/(?:twitter\.com|x\.com)\/\w+\/status\/\d+/);

      if (tweetUrlMatch) {
        // Track specific tweet
        const tweetUrl = tweetUrlMatch[0];
        const engagement = tracker.getRaidEngagement(tweetUrl);

        if (engagement) {
          const engagementText =
            `📊 **Engagement Tracking: ${tweetUrl}**\n\n` +
            `• **Likes**: ${engagement.likes}\n` +
            `• **Retweets**: ${engagement.retweets}\n` +
            `• **Quote Tweets**: ${engagement.quotes}\n` +
            `• **Replies**: ${engagement.replies}\n\n` +
            `**Total Engagements**: ${engagement.likes + engagement.retweets + engagement.quotes + engagement.replies}\n` +
            `**Last Updated**: ${new Date(engagement.lastUpdated).toLocaleString()}`;

          if (callback) {
            await callback({
              text: engagementText,
              action: 'TRACK_ENGAGEMENT',
              success: true,
            });
          }

          return {
            success: true,
            text: engagementText,
            data: { tweetUrl, engagement },
          };
        } else {
          const notFoundText = `❌ No engagement tracking found for: ${tweetUrl}\n\nThis tweet may not be part of an active raid or tracking may not have started yet.`;

          if (callback) {
            await callback({
              text: notFoundText,
              action: 'TRACK_ENGAGEMENT',
              success: false,
            });
          }

          return {
            success: false,
            text: notFoundText,
            data: { tweetUrl, found: false },
          };
        }
      } else {
        // Show all active raids and their engagement
        const activeRaids = tracker.getActiveRaids();
        const status = tracker.getStatus();

        if (activeRaids.length === 0) {
          const noRaidsText =
            `📊 **Engagement Tracking Status**\n\n` +
            `• **Tracking Enabled**: ${status.trackingEnabled ? '✅' : '❌'}\n` +
            `• **Active Raids**: 0\n` +
            `• **Database Connected**: ${status.supabaseConnected ? '✅' : '❌'}\n\n` +
            `No active raids are currently being tracked.`;

          if (callback) {
            await callback({
              text: noRaidsText,
              action: 'TRACK_ENGAGEMENT',
              success: true,
            });
          }

          return {
            success: true,
            text: noRaidsText,
            data: { status, activeRaids: [] },
          };
        }

        // Format active raids engagement data
        let raidsText =
          `📊 **Active Raid Engagement Tracking**\n\n` +
          `• **Tracking Status**: ${status.trackingEnabled ? '🟢 Active' : '🔴 Inactive'}\n` +
          `• **Active Raids**: ${status.activeRaids}\n` +
          `• **Total Engagements**: ${status.totalEngagements}\n` +
          `• **Database**: ${status.supabaseConnected ? '✅ Connected' : '❌ Disconnected'}\n\n` +
          `**Raid Details:**\n\n`;

        for (const { tweetId, raid, counts } of activeRaids.slice(0, 5)) {
          // Limit to 5 most recent
          const tweetUrl = `https://twitter.com/user/status/${tweetId}`;
          const totalEngagement =
            (counts?.likes || 0) +
            (counts?.retweets || 0) +
            (counts?.quotes || 0) +
            (counts?.replies || 0);

          raidsText +=
            `🎯 **Raid ${raid.id.slice(0, 8)}**\n` +
            `• Target: [Tweet](${tweetUrl})\n` +
            `• Likes: ${counts?.likes || 0} | Retweets: ${counts?.retweets || 0}\n` +
            `• Quotes: ${counts?.quotes || 0} | Replies: ${counts?.replies || 0}\n` +
            `• **Total**: ${totalEngagement} engagements\n` +
            `• Updated: ${counts?.lastUpdated ? new Date(counts.lastUpdated).toLocaleString() : 'Never'}\n\n`;
        }

        if (activeRaids.length > 5) {
          raidsText += `*... and ${activeRaids.length - 5} more raids*`;
        }

        if (callback) {
          await callback({
            text: raidsText,
            action: 'TRACK_ENGAGEMENT',
            success: true,
          });
        }

        return {
          success: true,
          text: raidsText,
          data: { status, activeRaids },
        };
      }
    } catch (error) {
      elizaLogger.error('Failed to track engagement:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      if (callback) {
        await callback({
          text: `❌ Engagement tracking error: ${errorMessage}`,
          error: true,
        });
      }

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  examples: [
    [
      {
        name: 'user',
        content: { text: 'Track engagement for https://twitter.com/user/status/1234567890' },
      },
      {
        name: 'assistant',
        content: { text: "I'll track the engagement metrics for that tweet!" },
      },
    ],
    [
      {
        name: 'user',
        content: { text: 'Show me current raid engagement stats' },
      },
      {
        name: 'assistant',
        content: {
          text: "I'll show you the current engagement tracking status for all active raids!",
        },
      },
    ],
  ],
};
