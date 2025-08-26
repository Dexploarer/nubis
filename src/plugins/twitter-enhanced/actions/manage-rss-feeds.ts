import {
  ActionResult,
  IAgentRuntime,
  Memory,
  State,
  type Action,
  elizaLogger,
} from '@elizaos/core';
import type { TwitterRSSService } from '../services/twitter-rss-service';

/**
 * Action to manage existing RSS feeds (list, delete, toggle, status)
 */
export const manageRSSFeedsAction: Action = {
  name: 'MANAGE_RSS_FEEDS',
  similes: [
    'LIST_RSS_FEEDS',
    'DELETE_RSS_FEED',
    'TOGGLE_RSS_FEED',
    'RSS_FEED_STATUS',
    'SHOW_RSS_FEEDS',
    'RSS_FEEDS',
  ],
  description: 'Manages existing RSS feeds - list, delete, toggle, or show status',
  
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    try {
      const text = message.content.text.toLowerCase();
      
      // Check for management keywords
      const managementKeywords = [
        'list rss',
        'show rss',
        'rss feeds',
        'my rss',
        'delete rss',
        'remove rss',
        'disable rss',
        'enable rss',
        'toggle rss',
        'rss status',
        'feed status',
        'manage feeds',
      ];
      
      const hasManagementKeyword = managementKeywords.some(keyword => text.includes(keyword));
      
      if (hasManagementKeyword) {
        elizaLogger.debug('MANAGE_RSS_FEEDS action validation passed', {
          text: text.substring(0, 100),
        });
      }
      
      return hasManagementKeyword;
    } catch (error) {
      elizaLogger.error('Error validating MANAGE_RSS_FEEDS action:', error);
      return false;
    }
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: any,
    callback?: any,
  ): Promise<ActionResult> => {
    try {
      elizaLogger.info('Executing MANAGE_RSS_FEEDS action');

      // Get Twitter RSS service
      const rssService = runtime.getService('TWITTER_RSS_SERVICE') as TwitterRSSService;
      if (!rssService) {
        const errorMsg = 'Twitter RSS Service not available';
        elizaLogger.error(errorMsg);
        
        if (callback) {
          await callback({
            text: "Sorry, the RSS feed management functionality isn't available right now.",
            error: true,
          });
        }
        
        return {
          success: false,
          error: new Error(errorMsg),
        };
      }

      const text = message.content.text.toLowerCase();
      const originalText = message.content.text;
      
      // Determine action type
      if (text.includes('list') || text.includes('show') || text.includes('feeds')) {
        return await handleListFeeds(rssService, callback);
      } else if (text.includes('delete') || text.includes('remove')) {
        return await handleDeleteFeed(rssService, originalText, callback);
      } else if (text.includes('disable') || text.includes('enable') || text.includes('toggle')) {
        return await handleToggleFeed(rssService, originalText, callback);
      } else if (text.includes('status')) {
        return await handleFeedStatus(rssService, originalText, callback);
      } else {
        // Default to list feeds
        return await handleListFeeds(rssService, callback);
      }

    } catch (error) {
      elizaLogger.error('Error in MANAGE_RSS_FEEDS action:', error);
      
      if (callback) {
        await callback({
          text: 'An unexpected error occurred while managing RSS feeds. Please try again.',
          error: true,
        });
      }

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },
};

/**
 * Handle listing all RSS feeds
 */
async function handleListFeeds(
  rssService: TwitterRSSService,
  callback?: any
): Promise<ActionResult> {
  try {
    const feeds = rssService.getAllFeeds();
    
    if (feeds.length === 0) {
      const message = "📋 **Your RSS Feeds**\n\nYou don't have any RSS feeds yet!\n\nCreate one by saying something like:\n" +
                     "• 'Create RSS feed from my timeline'\n" +
                     "• 'Create RSS feed from user @username'\n" +
                     "• 'Create RSS feed from list [list-id]'";
      
      if (callback) {
        await callback({
          text: message,
          action: 'LIST_RSS_FEEDS',
        });
      }
      
      return {
        success: true,
        text: message,
        values: { feedCount: 0 },
      };
    }
    
    const serverUrl = rssService.getServerUrl();
    let message = `📋 **Your RSS Feeds** (${feeds.length})\n\n`;
    
    feeds.forEach((feed, index) => {
      const status = feed.isActive ? '✅ Active' : '❌ Inactive';
      const typeIcon = getTypeIcon(feed.type);
      
      message += `${index + 1}. ${typeIcon} **${feed.title}**\n`;
      message += `   Type: ${feed.type}\n`;
      message += `   Status: ${status}\n`;
      message += `   URL: ${serverUrl}/rss/${feed.id}\n`;
      message += `   Last Updated: ${feed.lastUpdated.toLocaleString()}\n`;
      message += `   Tweet Count: ${feed.tweetCount}\n\n`;
    });
    
    message += `**RSS Server:** ${serverUrl}\n`;
    message += `**Management:** View feeds at ${serverUrl}/feeds`;
    
    if (callback) {
      await callback({
        text: message,
        action: 'LIST_RSS_FEEDS',
      });
    }
    
    return {
      success: true,
      text: message,
      values: {
        feedCount: feeds.length,
        activeFeeds: feeds.filter(f => f.isActive).length,
        serverUrl,
      },
      data: { feeds },
    };
    
  } catch (error) {
    elizaLogger.error('Error listing RSS feeds:', error);
    throw error;
  }
}

/**
 * Handle deleting an RSS feed
 */
async function handleDeleteFeed(
  rssService: TwitterRSSService,
  text: string,
  callback?: any
): Promise<ActionResult> {
  try {
    // Extract feed ID from message
    const feedId = extractFeedId(text);
    
    if (!feedId) {
      const message = "To delete an RSS feed, please specify the feed ID.\n\n" +
                     "Example: 'Delete RSS feed timeline_1234567890'\n\n" +
                     "Use 'list rss feeds' to see all your feed IDs.";
      
      if (callback) {
        await callback({
          text: message,
          error: true,
        });
      }
      
      return {
        success: false,
        error: new Error('Feed ID not provided'),
      };
    }
    
    const feed = rssService.getFeed(feedId);
    if (!feed) {
      const message = `RSS feed '${feedId}' not found.\n\nUse 'list rss feeds' to see available feeds.`;
      
      if (callback) {
        await callback({
          text: message,
          error: true,
        });
      }
      
      return {
        success: false,
        error: new Error(`Feed ${feedId} not found`),
      };
    }
    
    const deleted = await rssService.deleteFeed(feedId);
    
    if (deleted) {
      const message = `🗑️ **Feed Deleted Successfully**\n\n` +
                     `Deleted: **${feed.title}**\n` +
                     `Type: ${feed.type}\n` +
                     `Feed ID: ${feedId}`;
      
      if (callback) {
        await callback({
          text: message,
          action: 'DELETE_RSS_FEED',
        });
      }
      
      return {
        success: true,
        text: message,
        values: { deletedFeedId: feedId },
      };
    } else {
      throw new Error('Failed to delete feed');
    }
    
  } catch (error) {
    elizaLogger.error('Error deleting RSS feed:', error);
    throw error;
  }
}

/**
 * Handle toggling an RSS feed active/inactive status
 */
async function handleToggleFeed(
  rssService: TwitterRSSService,
  text: string,
  callback?: any
): Promise<ActionResult> {
  try {
    // Extract feed ID from message
    const feedId = extractFeedId(text);
    
    if (!feedId) {
      const message = "To toggle an RSS feed, please specify the feed ID.\n\n" +
                     "Example: 'Toggle RSS feed timeline_1234567890'\n\n" +
                     "Use 'list rss feeds' to see all your feed IDs.";
      
      if (callback) {
        await callback({
          text: message,
          error: true,
        });
      }
      
      return {
        success: false,
        error: new Error('Feed ID not provided'),
      };
    }
    
    const feed = rssService.getFeed(feedId);
    if (!feed) {
      const message = `RSS feed '${feedId}' not found.\n\nUse 'list rss feeds' to see available feeds.`;
      
      if (callback) {
        await callback({
          text: message,
          error: true,
        });
      }
      
      return {
        success: false,
        error: new Error(`Feed ${feedId} not found`),
      };
    }
    
    const newStatus = await rssService.toggleFeed(feedId);
    const statusText = newStatus ? 'activated' : 'deactivated';
    const statusIcon = newStatus ? '✅' : '❌';
    
    const message = `${statusIcon} **Feed ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}**\n\n` +
                   `Feed: **${feed.title}**\n` +
                   `Type: ${feed.type}\n` +
                   `Status: ${newStatus ? 'Active' : 'Inactive'}\n` +
                   `Feed ID: ${feedId}`;
    
    if (callback) {
      await callback({
        text: message,
        action: 'TOGGLE_RSS_FEED',
      });
    }
    
    return {
      success: true,
      text: message,
      values: {
        feedId,
        newStatus,
        action: statusText,
      },
    };
    
  } catch (error) {
    elizaLogger.error('Error toggling RSS feed:', error);
    throw error;
  }
}

/**
 * Handle getting RSS feed status
 */
async function handleFeedStatus(
  rssService: TwitterRSSService,
  text: string,
  callback?: any
): Promise<ActionResult> {
  try {
    // Extract feed ID from message
    const feedId = extractFeedId(text);
    
    if (!feedId) {
      // Show general status
      const feeds = rssService.getAllFeeds();
      const activeFeeds = feeds.filter(f => f.isActive).length;
      const serverUrl = rssService.getServerUrl();
      
      const message = `📊 **RSS Service Status**\n\n` +
                     `Total Feeds: ${feeds.length}\n` +
                     `Active Feeds: ${activeFeeds}\n` +
                     `Inactive Feeds: ${feeds.length - activeFeeds}\n\n` +
                     `Server URL: ${serverUrl}\n` +
                     `Health Check: ${serverUrl}/health\n` +
                     `Feed List: ${serverUrl}/feeds`;
      
      if (callback) {
        await callback({
          text: message,
          action: 'RSS_SERVICE_STATUS',
        });
      }
      
      return {
        success: true,
        text: message,
        values: {
          totalFeeds: feeds.length,
          activeFeeds,
          serverUrl,
        },
      };
    }
    
    const feed = rssService.getFeed(feedId);
    if (!feed) {
      const message = `RSS feed '${feedId}' not found.\n\nUse 'list rss feeds' to see available feeds.`;
      
      if (callback) {
        await callback({
          text: message,
          error: true,
        });
      }
      
      return {
        success: false,
        error: new Error(`Feed ${feedId} not found`),
      };
    }
    
    const serverUrl = rssService.getServerUrl();
    const statusIcon = feed.isActive ? '✅' : '❌';
    const typeIcon = getTypeIcon(feed.type);
    
    const message = `📊 **Feed Status**\n\n` +
                   `${typeIcon} **${feed.title}**\n\n` +
                   `Status: ${statusIcon} ${feed.isActive ? 'Active' : 'Inactive'}\n` +
                   `Type: ${feed.type}\n` +
                   `Source: ${feed.source || 'N/A'}\n` +
                   `Tweet Count: ${feed.tweetCount}\n` +
                   `Last Updated: ${feed.lastUpdated.toLocaleString()}\n\n` +
                   `**URLs:**\n` +
                   `Feed: ${serverUrl}/rss/${feed.id}\n` +
                   `Description: ${feed.description}`;
    
    if (callback) {
      await callback({
        text: message,
        action: 'RSS_FEED_STATUS',
      });
    }
    
    return {
      success: true,
      text: message,
      values: {
        feedId: feed.id,
        isActive: feed.isActive,
        type: feed.type,
        tweetCount: feed.tweetCount,
      },
      data: { feed },
    };
    
  } catch (error) {
    elizaLogger.error('Error getting RSS feed status:', error);
    throw error;
  }
}

/**
 * Extract feed ID from text
 */
function extractFeedId(text: string): string | null {
  // Look for feed ID patterns
  const patterns = [
    /feed\s+([a-z]+_\d+)/i,
    /id\s+([a-z]+_\d+)/i,
    /([a-z]+_\d+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Get emoji icon for feed type
 */
function getTypeIcon(type: string): string {
  switch (type) {
    case 'timeline':
      return '📱';
    case 'user':
      return '👤';
    case 'list':
      return '📋';
    case 'community':
      return '🏘️';
    default:
      return '📰';
  }
}