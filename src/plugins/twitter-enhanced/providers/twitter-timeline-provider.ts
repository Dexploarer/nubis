import { elizaLogger } from '@elizaos/core';
import type { IAgentRuntime, Memory, Provider, ProviderResult, State } from '@elizaos/core';
import type { TwitterClientService } from '../services/twitter-client-service';

/**
 * Twitter Timeline Provider
 * Provides Twitter timeline data and context for the agent
 */
export const twitterTimelineProvider: Provider = {
  name: 'twitter-timeline',
  description: 'Provides Twitter timeline data and context',

  get: async (runtime: IAgentRuntime, message: Memory, state: State): Promise<ProviderResult> => {
    try {
      elizaLogger.debug('TwitterTimelineProvider: Fetching timeline data');

      // Get Twitter client service
      const twitterClient = runtime.getService('TWITTER_CLIENT_SERVICE') as TwitterClientService;
      if (!twitterClient || !(await twitterClient.isReady())) {
        elizaLogger.debug('TwitterTimelineProvider: Twitter client not ready');
        return {
          text: 'Twitter timeline data not available - client not authenticated.',
          data: { error: true, reason: 'client_not_authenticated' },
        };
      }

      // Get recent mentions and activity
      try {
        const mentions = await twitterClient.getMentions();
        const recentMentions = mentions.slice(0, 5); // Last 5 mentions

        if (recentMentions.length === 0) {
          return {
            text: 'No recent Twitter mentions or activity.',
            data: { mentions: [], activityCount: 0 },
          };
        }

        let timelineContext = 'Recent Twitter Activity:\n\n';

        for (const mention of recentMentions) {
          const author = mention.username || mention.user?.username || 'unknown';
          const text = mention.text || mention.full_text || '';
          const time = new Date(mention.createdAt || mention.created_at || Date.now());

          timelineContext += `• @${author} (${time.toLocaleTimeString()}): ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}\n`;
        }

        return {
          text: timelineContext,
          data: {
            mentions: recentMentions.slice(0, 5).map((mention) => ({
              id: mention.id,
              author: mention.username || mention.user?.username || 'unknown',
              text: (mention.text || mention.full_text || '').substring(0, 100),
              timestamp: mention.createdAt || mention.created_at || Date.now(),
            })),
            activityCount: recentMentions.length,
          },
        };
      } catch (error) {
        elizaLogger.warn('TwitterTimelineProvider: Failed to fetch timeline data:', error);
        return {
          text: 'Unable to fetch Twitter timeline data at this time.',
          data: { error: true, reason: 'fetch_failed' },
        };
      }
    } catch (error) {
      elizaLogger.error('TwitterTimelineProvider error:', error);
      return {
        text: 'Twitter timeline provider error.',
        data: { error: true, reason: 'provider_error' },
      };
    }
  },
};

// Helper functions for formatting
function formatMentions(mentions: any[]): string {
  if (mentions.length === 0) {
    return 'No recent mentions.';
  }

  let formatted = 'Recent Mentions:\n';
  for (const mention of mentions) {
    const author = mention.username || mention.user?.username || 'unknown';
    const text = mention.text || mention.full_text || '';
    formatted += `• @${author}: ${text.substring(0, 80)}${text.length > 80 ? '...' : ''}\n`;
  }

  return formatted;
}

function formatActivity(activities: any[]): string {
  if (activities.length === 0) {
    return 'No recent activity.';
  }

  let formatted = 'Recent Twitter Activity:\n';
  for (const activity of activities) {
    const author = activity.username || activity.user?.username || 'unknown';
    const text = activity.text || activity.full_text || '';
    const time = new Date(activity.createdAt || activity.created_at || Date.now());

    formatted += `• @${author} (${time.toLocaleDateString()}): ${text.substring(0, 60)}${text.length > 60 ? '...' : ''}\n`;
  }

  return formatted;
}
