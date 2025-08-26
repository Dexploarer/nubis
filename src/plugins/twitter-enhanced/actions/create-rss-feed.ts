import {
  ActionResult,
  IAgentRuntime,
  Memory,
  State,
  type Action,
  elizaLogger,
} from '@elizaos/core';
import type { TwitterRSSService } from '../services/twitter-rss-service';

interface CreateRSSFeedContent {
  text: string;
  feedType: 'timeline' | 'list' | 'user' | 'community';
  source?: string; // list ID, username, or community ID
  title?: string;
  description?: string;
}

/**
 * Action to create RSS feeds from Twitter sources
 * Supports timeline, lists, user tweets, and communities
 */
export const createRSSFeedAction: Action = {
  name: 'CREATE_RSS_FEED',
  similes: [
    'CREATE_TWITTER_RSS',
    'MAKE_RSS_FEED',
    'SETUP_RSS',
    'RSS_FROM_TWITTER',
    'TWITTER_TO_RSS',
  ],
  description: 'Creates RSS feeds from Twitter timeline, lists, users, or communities',
  
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    try {
      const text = message.content.text.toLowerCase();
      
      // Check for RSS feed creation keywords
      const rssKeywords = [
        'create rss',
        'make rss',
        'setup rss',
        'rss feed',
        'twitter rss',
        'twitter to rss',
        'rss from',
      ];
      
      const hasRSSKeyword = rssKeywords.some(keyword => text.includes(keyword));
      
      // Check for Twitter source keywords
      const sourceKeywords = [
        'timeline',
        'list',
        'user',
        'community',
        'tweets from',
        'feed from',
      ];
      
      const hasSourceKeyword = sourceKeywords.some(keyword => text.includes(keyword));
      
      const isValid = hasRSSKeyword && hasSourceKeyword;
      
      if (isValid) {
        elizaLogger.debug('CREATE_RSS_FEED action validation passed', {
          text: text.substring(0, 100),
          hasRSSKeyword,
          hasSourceKeyword,
        });
      }
      
      return isValid;
    } catch (error) {
      elizaLogger.error('Error validating CREATE_RSS_FEED action:', error);
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
      elizaLogger.info('Executing CREATE_RSS_FEED action');

      // Get Twitter RSS service
      const rssService = runtime.getService('TWITTER_RSS_SERVICE') as TwitterRSSService;
      if (!rssService) {
        const errorMsg = 'Twitter RSS Service not available';
        elizaLogger.error(errorMsg);
        
        if (callback) {
          await callback({
            text: "Sorry, the RSS feed functionality isn't available right now. The Twitter RSS service needs to be running to create feeds.",
            error: true,
          });
        }
        
        return {
          success: false,
          error: new Error(errorMsg),
        };
      }

      const content = await parseContent(runtime, message.content.text);
      
      if (!content) {
        const errorMsg = 'Could not parse RSS feed creation request';
        elizaLogger.warn(errorMsg, { text: message.content.text });
        
        if (callback) {
          await callback({
            text: "I couldn't understand what type of RSS feed you want to create. Please specify:\n\n" +
                  "• 'timeline' for your Twitter timeline\n" +
                  "• 'user @username' for a specific user's tweets\n" +
                  "• 'list [list-id]' for a Twitter list\n" +
                  "• 'community [community-id]' for a Twitter community\n\n" +
                  "Example: 'Create RSS feed from user @elonmusk'",
            error: true,
          });
        }
        
        return {
          success: false,
          error: new Error(errorMsg),
        };
      }

      // Create RSS feed based on type
      let feedId: string;
      let feedUrl: string;
      
      try {
        switch (content.feedType) {
          case 'timeline':
            feedId = await rssService.createTimelineFeed(
              content.title || 'My Twitter Timeline',
              content.description || 'RSS feed of my Twitter timeline'
            );
            break;
            
          case 'user':
            if (!content.source) {
              throw new Error('Username required for user RSS feed');
            }
            feedId = await rssService.createUserFeed(
              content.source,
              content.title || `@${content.source} Tweets`,
              content.description || `RSS feed for @${content.source} tweets`
            );
            break;
            
          case 'list':
            if (!content.source) {
              throw new Error('List ID required for list RSS feed');
            }
            feedId = await rssService.createListFeed(
              content.source,
              content.title || `Twitter List ${content.source}`,
              content.description || `RSS feed for Twitter list ${content.source}`
            );
            break;
            
          case 'community':
            if (!content.source) {
              throw new Error('Community ID required for community RSS feed');
            }
            feedId = await rssService.createCommunityFeed(
              content.source,
              content.title || `Twitter Community ${content.source}`,
              content.description || `RSS feed for Twitter community ${content.source}`
            );
            break;
            
          default:
            throw new Error(`Unsupported feed type: ${content.feedType}`);
        }
        
        feedUrl = `${rssService.getServerUrl()}/rss/${feedId}`;
        
        elizaLogger.info('RSS feed created successfully', {
          feedId,
          feedType: content.feedType,
          source: content.source,
          url: feedUrl,
        });
        
        // Format success message based on feed type
        let successMessage = "🎉 RSS feed created successfully!\n\n";
        
        switch (content.feedType) {
          case 'timeline':
            successMessage += "📱 **Timeline Feed**\n";
            successMessage += "Your personal Twitter timeline is now available as an RSS feed.\n";
            break;
            
          case 'user':
            successMessage += `👤 **User Feed: @${content.source}**\n`;
            successMessage += `All tweets from @${content.source} are now available as an RSS feed.\n`;
            break;
            
          case 'list':
            successMessage += `📋 **List Feed: ${content.source}**\n`;
            successMessage += `Tweets from Twitter list ${content.source} are now available as an RSS feed.\n`;
            break;
            
          case 'community':
            successMessage += `🏘️ **Community Feed: ${content.source}**\n`;
            successMessage += `Tweets from Twitter community ${content.source} are now available as an RSS feed.\n`;
            break;
        }
        
        successMessage += `\n**Feed URL:** ${feedUrl}\n`;
        successMessage += `**Feed ID:** ${feedId}\n\n`;
        successMessage += "You can now subscribe to this URL in your favorite RSS reader!";
        
        if (callback) {
          await callback({
            text: successMessage,
            action: 'CREATE_RSS_FEED',
            source: content.feedType,
          });
        }

        return {
          success: true,
          text: successMessage,
          values: {
            feedId,
            feedUrl,
            feedType: content.feedType,
            source: content.source,
            serverUrl: rssService.getServerUrl(),
          },
          data: {
            actionName: 'CREATE_RSS_FEED',
            feedDetails: {
              id: feedId,
              url: feedUrl,
              type: content.feedType,
              source: content.source,
              title: content.title,
              description: content.description,
            },
          },
        };

      } catch (serviceError) {
        elizaLogger.error('Failed to create RSS feed:', serviceError);
        
        const errorMessage = `Failed to create RSS feed: ${serviceError instanceof Error ? serviceError.message : String(serviceError)}`;
        
        if (callback) {
          await callback({
            text: `Sorry, I couldn't create the RSS feed. ${errorMessage}`,
            error: true,
          });
        }
        
        return {
          success: false,
          error: serviceError instanceof Error ? serviceError : new Error(String(serviceError)),
        };
      }

    } catch (error) {
      elizaLogger.error('Error in CREATE_RSS_FEED action:', error);
      
      if (callback) {
        await callback({
          text: 'An unexpected error occurred while creating the RSS feed. Please try again.',
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
 * Parse content to extract RSS feed creation details
 */
async function parseContent(runtime: IAgentRuntime, text: string): Promise<CreateRSSFeedContent | null> {
  try {
    const lowerText = text.toLowerCase();
    
    // Determine feed type
    let feedType: 'timeline' | 'list' | 'user' | 'community';
    let source: string | undefined;
    let title: string | undefined;
    let description: string | undefined;
    
    if (lowerText.includes('timeline')) {
      feedType = 'timeline';
    } else if (lowerText.includes('user') || lowerText.includes('@')) {
      feedType = 'user';
      // Extract username
      const userMatch = text.match(/@(\w+)/) || text.match(/user\s+(\w+)/i);
      if (userMatch) {
        source = userMatch[1];
      }
    } else if (lowerText.includes('list')) {
      feedType = 'list';
      // Extract list ID
      const listMatch = text.match(/list\s+(\w+)/i) || text.match(/list[:\s]+(\w+)/i);
      if (listMatch) {
        source = listMatch[1];
      }
    } else if (lowerText.includes('community')) {
      feedType = 'community';
      // Extract community ID
      const communityMatch = text.match(/community\s+(\w+)/i) || text.match(/community[:\s]+(\w+)/i);
      if (communityMatch) {
        source = communityMatch[1];
      }
    } else {
      // Default to user feed if we can extract a username
      const userMatch = text.match(/@(\w+)/);
      if (userMatch) {
        feedType = 'user';
        source = userMatch[1];
      } else {
        return null;
      }
    }
    
    // Extract custom title
    const titleMatch = text.match(/title[:\s]+"([^"]+)"/i) || text.match(/called\s+"([^"]+)"/i);
    if (titleMatch) {
      title = titleMatch[1];
    }
    
    // Extract custom description
    const descMatch = text.match(/description[:\s]+"([^"]+)"/i) || text.match(/about\s+"([^"]+)"/i);
    if (descMatch) {
      description = descMatch[1];
    }
    
    return {
      text,
      feedType,
      source,
      title,
      description,
    };
    
  } catch (error) {
    elizaLogger.error('Error parsing RSS feed content:', error);
    return null;
  }
}