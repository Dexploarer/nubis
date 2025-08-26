import { IAgentRuntime, Service, elizaLogger } from '@elizaos/core';
import type { Scraper } from 'agent-twitter-client';
import type { TwitterAuthService } from './twitter-auth-service';

/**
 * Enhanced Twitter Client Service
 * Provides high-level Twitter operations using authenticated agent-twitter-client
 * with comprehensive ElizaLogger integration and error handling
 */
export class TwitterClientService extends Service {
  static serviceType = 'TWITTER_CLIENT_SERVICE';

  public name: string = TwitterClientService.serviceType;
  public capabilityDescription = 'High-level Twitter operations with enhanced logging and error handling';

  private authService: TwitterAuthService | null = null;

  constructor(runtime: IAgentRuntime) {
    super(runtime);
  }

  static async start(runtime: IAgentRuntime): Promise<TwitterClientService> {
    elizaLogger.info('Starting Twitter Client Service');
    const service = new TwitterClientService(runtime);
    await service.initialize();
    return service;
  }

  static async stop(runtime: IAgentRuntime): Promise<void> {
    elizaLogger.info('Twitter Client Service stopped');
  }

  async initialize(): Promise<void> {
    try {
      elizaLogger.info('Initializing Twitter Client Service');
      
      // Get auth service
      this.authService = this.runtime.getService('TWITTER_AUTH_SERVICE') as TwitterAuthService;
      if (!this.authService) {
        throw new Error('TwitterAuthService not found - ensure it is loaded first');
      }

      elizaLogger.info('Twitter Client Service initialized successfully');
    } catch (error) {
      elizaLogger.error('Failed to initialize Twitter Client Service:', error);
      throw error;
    }
  }

  /**
   * Get authenticated scraper instance
   */
  private async getScraper(): Promise<Scraper> {
    if (!this.authService) {
      throw new Error('TwitterAuthService not available');
    }

    const scraper = await this.authService.getScraper();
    if (!scraper) {
      throw new Error('Failed to get authenticated Twitter scraper');
    }

    return scraper;
  }

  /**
   * Post a tweet
   */
  async postTweet(text: string, mediaUrls: string[] = []): Promise<any> {
    try {
      elizaLogger.info(`Posting tweet: "${text.substring(0, 50)}..."`);
      
      const scraper = await this.getScraper();
      const result = await scraper.sendTweet(text, undefined, mediaUrls);
      
      elizaLogger.info('Tweet posted successfully', { 
        tweetId: result.rest_id || result.id,
        text: text.substring(0, 100) 
      });
      
      return result;
    } catch (error) {
      elizaLogger.error('Failed to post tweet:', error);
      throw error;
    }
  }

  /**
   * Get tweet by ID
   */
  async getTweet(tweetId: string): Promise<any> {
    try {
      elizaLogger.debug(`Fetching tweet: ${tweetId}`);
      
      const scraper = await this.getScraper();
      const tweet = await scraper.getTweet(tweetId);
      
      if (!tweet) {
        throw new Error(`Tweet ${tweetId} not found`);
      }

      elizaLogger.debug('Tweet fetched successfully', { 
        tweetId,
        author: tweet.username || tweet.user?.username || 'unknown'
      });
      
      return tweet;
    } catch (error) {
      elizaLogger.error(`Failed to fetch tweet ${tweetId}:`, error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getProfile(username: string): Promise<any> {
    try {
      elizaLogger.debug(`Fetching profile: @${username}`);
      
      const scraper = await this.getScraper();
      const profile = await scraper.getProfile(username);
      
      if (!profile) {
        throw new Error(`Profile @${username} not found`);
      }

      elizaLogger.debug('Profile fetched successfully', { 
        username,
        name: profile.name,
        followers: profile.followersCount || profile.followers_count || 0
      });
      
      return profile;
    } catch (error) {
      elizaLogger.error(`Failed to fetch profile @${username}:`, error);
      throw error;
    }
  }

  /**
   * Get user tweets
   */
  async getUserTweets(username: string, count: number = 20): Promise<any[]> {
    try {
      elizaLogger.debug(`Fetching tweets for @${username} (count: ${count})`);
      
      const scraper = await this.getScraper();
      const tweets = await scraper.getTweets(username, count);
      
      elizaLogger.debug('User tweets fetched successfully', { 
        username,
        count: tweets.length
      });
      
      return tweets;
    } catch (error) {
      elizaLogger.error(`Failed to fetch tweets for @${username}:`, error);
      throw error;
    }
  }

  /**
   * Search tweets
   */
  async searchTweets(query: string, maxResults: number = 20): Promise<any[]> {
    try {
      elizaLogger.debug(`Searching tweets: "${query}" (max: ${maxResults})`);
      
      const scraper = await this.getScraper();
      const results = await scraper.searchTweets(query, maxResults);
      
      elizaLogger.debug('Tweet search completed', { 
        query: query.substring(0, 50),
        resultsCount: results.length
      });
      
      return results;
    } catch (error) {
      elizaLogger.error(`Failed to search tweets for "${query}":`, error);
      throw error;
    }
  }

  /**
   * Like a tweet
   */
  async likeTweet(tweetId: string): Promise<void> {
    try {
      elizaLogger.info(`Liking tweet: ${tweetId}`);
      
      const scraper = await this.getScraper();
      await scraper.likeTweet(tweetId);
      
      elizaLogger.info('Tweet liked successfully', { tweetId });
    } catch (error) {
      elizaLogger.error(`Failed to like tweet ${tweetId}:`, error);
      throw error;
    }
  }

  /**
   * Retweet a tweet
   */
  async retweet(tweetId: string): Promise<void> {
    try {
      elizaLogger.info(`Retweeting: ${tweetId}`);
      
      const scraper = await this.getScraper();
      await scraper.retweet(tweetId);
      
      elizaLogger.info('Tweet retweeted successfully', { tweetId });
    } catch (error) {
      elizaLogger.error(`Failed to retweet ${tweetId}:`, error);
      throw error;
    }
  }

  /**
   * Reply to a tweet
   */
  async replyToTweet(tweetId: string, text: string): Promise<any> {
    try {
      elizaLogger.info(`Replying to tweet ${tweetId}: "${text.substring(0, 50)}..."`);
      
      const scraper = await this.getScraper();
      const result = await scraper.sendTweet(text, tweetId);
      
      elizaLogger.info('Reply posted successfully', { 
        tweetId,
        replyId: result.rest_id || result.id,
        text: text.substring(0, 100)
      });
      
      return result;
    } catch (error) {
      elizaLogger.error(`Failed to reply to tweet ${tweetId}:`, error);
      throw error;
    }
  }

  /**
   * Quote tweet
   */
  async quoteTweet(tweetId: string, text: string): Promise<any> {
    try {
      elizaLogger.info(`Quote tweeting ${tweetId}: "${text.substring(0, 50)}..."`);
      
      const scraper = await this.getScraper();
      // agent-twitter-client doesn't have direct quote tweet method
      // Construct quote tweet manually
      const originalTweet = await scraper.getTweet(tweetId);
      const tweetUrl = `https://twitter.com/${originalTweet.username}/status/${tweetId}`;
      const quoteText = `${text} ${tweetUrl}`;
      
      const result = await scraper.sendTweet(quoteText);
      
      elizaLogger.info('Quote tweet posted successfully', { 
        originalTweetId: tweetId,
        quoteTweetId: result.rest_id || result.id,
        text: text.substring(0, 100)
      });
      
      return result;
    } catch (error) {
      elizaLogger.error(`Failed to quote tweet ${tweetId}:`, error);
      throw error;
    }
  }

  /**
   * Get notifications (mentions, likes, retweets, etc.)
   */
  async getNotifications(): Promise<any[]> {
    try {
      elizaLogger.debug('Fetching Twitter notifications');
      
      const scraper = await this.getScraper();
      
      // Note: agent-twitter-client might not have direct notification API
      // This is a placeholder for potential implementation
      // We may need to use timeline or mentions instead
      const notifications = await this.getMentions();
      
      elizaLogger.debug('Notifications fetched successfully', { 
        count: notifications.length
      });
      
      return notifications;
    } catch (error) {
      elizaLogger.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  /**
   * Get mentions (users mentioning our account)
   */
  async getMentions(): Promise<any[]> {
    try {
      elizaLogger.debug('Fetching mentions');
      
      const scraper = await this.getScraper();
      
      // Get current user to find username
      const authStatus = this.authService?.getAuthStatus();
      const username = authStatus?.username;
      
      if (!username) {
        throw new Error('Cannot get mentions without authenticated username');
      }

      // Search for mentions of our username
      const mentions = await scraper.searchTweets(`@${username}`, 50);
      
      elizaLogger.debug('Mentions fetched successfully', { 
        username,
        count: mentions.length
      });
      
      return mentions;
    } catch (error) {
      elizaLogger.error('Failed to fetch mentions:', error);
      throw error;
    }
  }

  /**
   * Extract tweet ID from URL
   */
  extractTweetId(url: string): string {
    const match = url.match(/status\/(\d+)/);
    if (!match) {
      throw new Error(`Invalid Twitter URL: ${url}`);
    }
    return match[1];
  }

  /**
   * Check if service is ready
   */
  async isReady(): Promise<boolean> {
    try {
      if (!this.authService) {
        return false;
      }
      
      return this.authService.isAuth();
    } catch (error) {
      elizaLogger.warn('Twitter Client Service readiness check failed:', error);
      return false;
    }
  }

  /**
   * Get user timeline tweets (authenticated user's timeline)
   */
  async getTimelineTweets(count: number = 20): Promise<any[]> {
    try {
      elizaLogger.debug(`Fetching timeline tweets (count: ${count})`);
      
      const scraper = await this.getScraper();
      
      // Note: agent-twitter-client timeline access may be limited
      // This is a placeholder for timeline functionality
      elizaLogger.warn('Timeline fetching requires authenticated user context - using search fallback');
      
      // Fallback: get recent tweets from authenticated user
      const authStatus = this.authService?.getAuthStatus();
      const username = authStatus?.username;
      
      if (username) {
        return await this.getUserTweets(username, count);
      }
      
      return [];
    } catch (error) {
      elizaLogger.error('Failed to fetch timeline tweets:', error);
      throw error;
    }
  }

  /**
   * Get tweets from a Twitter list
   */
  async getListTweets(listId: string, count: number = 20): Promise<any[]> {
    try {
      elizaLogger.debug(`Fetching list tweets: ${listId} (count: ${count})`);
      
      const scraper = await this.getScraper();
      
      // Note: agent-twitter-client may not have direct list support
      // This would require Twitter API v2 lists endpoint access
      elizaLogger.warn(`List tweet fetching not fully supported for list: ${listId}`);
      
      // Placeholder for list implementation
      // In a full implementation, this would use Twitter API v2 lists endpoint
      return [];
    } catch (error) {
      elizaLogger.error(`Failed to fetch list tweets for ${listId}:`, error);
      throw error;
    }
  }

  /**
   * Get tweets from a Twitter community
   */
  async getCommunityTweets(communityId: string, count: number = 20): Promise<any[]> {
    try {
      elizaLogger.debug(`Fetching community tweets: ${communityId} (count: ${count})`);
      
      const scraper = await this.getScraper();
      
      // Note: Community API access requires special permissions
      elizaLogger.warn(`Community tweet fetching requires special API access for community: ${communityId}`);
      
      // Placeholder for community implementation
      // This would require Twitter's Community API access
      return [];
    } catch (error) {
      elizaLogger.error(`Failed to fetch community tweets for ${communityId}:`, error);
      throw error;
    }
  }

  /**
   * Search tweets with advanced options for RSS feeds
   */
  async searchTweetsAdvanced(query: string, options: {
    maxResults?: number;
    sinceId?: string;
    untilId?: string;
    resultType?: 'recent' | 'popular' | 'mixed';
  } = {}): Promise<any[]> {
    try {
      const { maxResults = 20, resultType = 'recent' } = options;
      elizaLogger.debug(`Advanced tweet search: "${query}" (max: ${maxResults}, type: ${resultType})`);
      
      const scraper = await this.getScraper();
      
      // Basic search with agent-twitter-client
      const results = await scraper.searchTweets(query, maxResults);
      
      elizaLogger.debug('Advanced tweet search completed', { 
        query: query.substring(0, 50),
        resultsCount: results.length,
        resultType
      });
      
      return results;
    } catch (error) {
      elizaLogger.error(`Failed advanced tweet search for "${query}":`, error);
      throw error;
    }
  }

  /**
   * Get trending topics
   */
  async getTrendingTopics(): Promise<any[]> {
    try {
      elizaLogger.debug('Fetching trending topics');
      
      const scraper = await this.getScraper();
      
      // Note: Trending topics might not be available in agent-twitter-client
      elizaLogger.warn('Trending topics fetching not fully supported');
      
      // Placeholder for trends implementation
      return [];
    } catch (error) {
      elizaLogger.error('Failed to fetch trending topics:', error);
      throw error;
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    isReady: boolean;
    authStatus: any;
    lastError?: string;
  }> {
    try {
      const isReady = await this.isReady();
      const authStatus = this.authService?.getAuthStatus() || null;
      
      return {
        isReady,
        authStatus,
      };
    } catch (error) {
      return {
        isReady: false,
        authStatus: null,
        lastError: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// Ensure service type is properly set for ElizaOS service loading
Object.defineProperty(TwitterClientService, 'name', { value: TwitterClientService.serviceType });