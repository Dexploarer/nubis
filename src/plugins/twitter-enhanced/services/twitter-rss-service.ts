import { IAgentRuntime, Service, elizaLogger } from '@elizaos/core';
import type { TwitterClientService } from './twitter-client-service';
import express from 'express';
import { Server } from 'http';

/**
 * RSS Feed Interface
 */
export interface RSSFeed {
  id: string;
  title: string;
  description: string;
  type: 'timeline' | 'list' | 'community' | 'user';
  source: string; // list ID, community ID, or username
  lastUpdated: Date;
  tweetCount: number;
  isActive: boolean;
}

/**
 * RSS Item representing a tweet
 */
export interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  guid: string;
  author: string;
  content: string;
}

/**
 * Twitter RSS Service
 * Generates RSS feeds from Twitter lists, communities, timeline, and user tweets
 * Integrates with existing TwitterClientService for data fetching
 */
export class TwitterRSSService extends Service {
  static serviceType = 'TWITTER_RSS_SERVICE';

  public name: string = TwitterRSSService.serviceType;
  public capabilityDescription =
    'RSS feed generation from Twitter lists, communities, and timeline';

  private twitterClient: TwitterClientService | null = null;
  private feeds: Map<string, RSSFeed> = new Map();
  private server: Server | null = null;
  private app: express.Application;
  private serverPort: number; // RSS server port, configured to avoid ElizaOS conflicts

  constructor(runtime: IAgentRuntime) {
    super(runtime);
    this.app = express();

    // Configure RSS server port to avoid conflicts with ElizaOS services
    // ElizaOS typically uses:
    // - 3000: Main server
    // - 3001: Socket.IO (if enabled)
    // - 3002: WebRTC (if enabled)
    // We use 8080 as it's a common HTTP alternative port that's unlikely to conflict
    this.serverPort = Number(process.env.RSS_SERVER_PORT) || 8080;

    this.setupRoutes();
  }

  static async start(runtime: IAgentRuntime): Promise<TwitterRSSService> {
    elizaLogger.info('Starting Twitter RSS Service');
    const service = new TwitterRSSService(runtime);
    await service.initialize();
    return service;
  }

  static async stop(runtime: IAgentRuntime): Promise<void> {
    try {
      const existing = runtime?.getService?.(TwitterRSSService.serviceType);
      if (existing && typeof (existing as TwitterRSSService).stop === 'function') {
        await (existing as TwitterRSSService).stop();
      }
    } finally {
      elizaLogger.info('Twitter RSS Service stopped');
    }
  }

  async initialize(): Promise<void> {
    try {
      elizaLogger.info('Initializing Twitter RSS Service');

      // Get Twitter client service (may not be available immediately)
      this.twitterClient = this.runtime.getService(
        'TWITTER_CLIENT_SERVICE',
      ) as TwitterClientService;
      if (!this.twitterClient) {
        elizaLogger.warn(
          'TwitterClientService not found during initialization - will attempt to connect later',
        );
      }

      // Start RSS server
      await this.startServer();

      // Load existing feeds from storage
      await this.loadFeeds();

      elizaLogger.info('Twitter RSS Service initialized successfully');
    } catch (error) {
      elizaLogger.error('Failed to initialize Twitter RSS Service:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => {
          elizaLogger.info('RSS server stopped');
          resolve();
        });
      });
    }
    this.feeds.clear();
  }

  /**
   * Setup Express routes for RSS feeds
   */
  private setupRoutes(): void {
    this.app.use(express.json());

    // Serve RSS feed by ID
    this.app.get('/rss/:feedId', async (req, res) => {
      try {
        const feedId = req.params.feedId;
        const rssXml = await this.generateRSSXML(feedId);

        res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
        res.send(rssXml);

        elizaLogger.debug(`Served RSS feed: ${feedId}`);
      } catch (error) {
        elizaLogger.error(`Failed to serve RSS feed ${req.params.feedId}:`, error);
        res.status(500).json({ error: 'Failed to generate RSS feed' });
      }
    });

    // List all available feeds
    this.app.get('/feeds', (req, res) => {
      const feedList = Array.from(this.feeds.values()).map((feed) => ({
        id: feed.id,
        title: feed.title,
        description: feed.description,
        type: feed.type,
        url: `http://localhost:${this.serverPort}/rss/${feed.id}`,
        isActive: feed.isActive,
        lastUpdated: feed.lastUpdated,
        tweetCount: feed.tweetCount,
      }));

      res.json({ feeds: feedList, total: feedList.length });
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'TwitterRSSService',
        activeFeeds: this.feeds.size,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Start RSS server
   */
  private async startServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.serverPort, () => {
          elizaLogger.info(`RSS server started on port ${this.serverPort}`);
          resolve();
        });
      } catch (error) {
        elizaLogger.error('Failed to start RSS server:', error);
        reject(error);
      }
    });
  }

  /**
   * Create RSS feed from Twitter timeline
   */
  async createTimelineFeed(
    title: string = 'My Timeline',
    description: string = 'My Twitter Timeline',
  ): Promise<string> {
    const feedId = `timeline_${Date.now()}`;

    const feed: RSSFeed = {
      id: feedId,
      title,
      description,
      type: 'timeline',
      source: 'timeline',
      lastUpdated: new Date(),
      tweetCount: 0,
      isActive: true,
    };

    this.feeds.set(feedId, feed);
    await this.saveFeeds();

    elizaLogger.info(`Created timeline RSS feed: ${feedId}`);
    return feedId;
  }

  /**
   * Create RSS feed from Twitter list
   */
  async createListFeed(listId: string, title?: string, description?: string): Promise<string> {
    const feedId = `list_${listId}_${Date.now()}`;

    const feed: RSSFeed = {
      id: feedId,
      title: title || `Twitter List ${listId}`,
      description: description || `RSS feed for Twitter list ${listId}`,
      type: 'list',
      source: listId,
      lastUpdated: new Date(),
      tweetCount: 0,
      isActive: true,
    };

    this.feeds.set(feedId, feed);
    await this.saveFeeds();

    elizaLogger.info(`Created list RSS feed: ${feedId} for list: ${listId}`);
    return feedId;
  }

  /**
   * Create RSS feed from user tweets
   */
  async createUserFeed(username: string, title?: string, description?: string): Promise<string> {
    const feedId = `user_${username}_${Date.now()}`;

    const feed: RSSFeed = {
      id: feedId,
      title: title || `@${username} Tweets`,
      description: description || `RSS feed for @${username} tweets`,
      type: 'user',
      source: username,
      lastUpdated: new Date(),
      tweetCount: 0,
      isActive: true,
    };

    this.feeds.set(feedId, feed);
    await this.saveFeeds();

    elizaLogger.info(`Created user RSS feed: ${feedId} for user: @${username}`);
    return feedId;
  }

  /**
   * Create RSS feed from Twitter community (placeholder - requires community API access)
   */
  async createCommunityFeed(
    communityId: string,
    title?: string,
    description?: string,
  ): Promise<string> {
    const feedId = `community_${communityId}_${Date.now()}`;

    const feed: RSSFeed = {
      id: feedId,
      title: title || `Twitter Community ${communityId}`,
      description: description || `RSS feed for Twitter community ${communityId}`,
      type: 'community',
      source: communityId,
      lastUpdated: new Date(),
      tweetCount: 0,
      isActive: true,
    };

    this.feeds.set(feedId, feed);
    await this.saveFeeds();

    elizaLogger.info(`Created community RSS feed: ${feedId} for community: ${communityId}`);
    return feedId;
  }

  /**
   * Generate RSS XML for a specific feed
   */
  async generateRSSXML(feedId: string): Promise<string> {
    const feed = this.feeds.get(feedId);
    if (!feed) {
      throw new Error(`RSS feed not found: ${feedId}`);
    }

    if (!feed.isActive) {
      throw new Error(`RSS feed is inactive: ${feedId}`);
    }

    try {
      // Fetch tweets based on feed type
      const tweets = await this.fetchTweetsForFeed(feed);

      // Convert tweets to RSS items
      const rssItems = tweets.map((tweet) => this.tweetToRSSItem(tweet));

      // Update feed stats
      feed.tweetCount = rssItems.length;
      feed.lastUpdated = new Date();

      // Generate RSS XML
      const rssXml = this.generateRSSXMLContent(feed, rssItems);

      elizaLogger.debug(`Generated RSS XML for feed ${feedId}: ${rssItems.length} items`);
      return rssXml;
    } catch (error) {
      elizaLogger.error(`Failed to generate RSS XML for feed ${feedId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch tweets for a specific feed
   */
  private async fetchTweetsForFeed(feed: RSSFeed): Promise<any[]> {
    // Try to get TwitterClientService if not already connected
    if (!this.twitterClient) {
      this.twitterClient = this.runtime.getService(
        'TWITTER_CLIENT_SERVICE',
      ) as TwitterClientService;
    }

    if (!this.twitterClient) {
      elizaLogger.warn('TwitterClientService not available for RSS feed generation');
      return [];
    }

    try {
      switch (feed.type) {
        case 'timeline':
          // Note: Timeline requires authenticated user context
          // This is a placeholder - real implementation would need timeline API
          elizaLogger.warn('Timeline fetching not fully implemented - using fallback');
          return [];

        case 'list':
          // Fetch tweets from Twitter list
          return await this.fetchListTweets(feed.source);

        case 'user':
          // Fetch user tweets
          return await this.twitterClient.getUserTweets(feed.source, 20);

        case 'community':
          // Community API access required
          elizaLogger.warn('Community fetching requires special API access - using fallback');
          return [];

        default:
          throw new Error(`Unknown feed type: ${feed.type}`);
      }
    } catch (error) {
      elizaLogger.error(`Failed to fetch tweets for feed ${feed.id}:`, error);
      return [];
    }
  }

  /**
   * Fetch tweets from a Twitter list (placeholder - requires list API)
   */
  private async fetchListTweets(listId: string): Promise<any[]> {
    // Note: agent-twitter-client may not have direct list support
    // This is a placeholder for list tweet fetching
    elizaLogger.warn(`List tweet fetching not fully implemented for list: ${listId}`);

    try {
      // Fallback: could search for list-related tweets or use alternative methods
      return [];
    } catch (error) {
      elizaLogger.error(`Failed to fetch list tweets for ${listId}:`, error);
      return [];
    }
  }

  /**
   * Convert tweet to RSS item
   */
  private tweetToRSSItem(tweet: any): RSSItem {
    const tweetId = tweet.rest_id || tweet.id_str || tweet.id;
    const username =
      tweet.core?.user_results?.result?.legacy?.screen_name ||
      tweet.user?.screen_name ||
      tweet.username ||
      'unknown';

    const text = tweet.legacy?.full_text || tweet.full_text || tweet.text || 'No content available';

    const createdAt = tweet.legacy?.created_at || tweet.created_at || new Date().toISOString();

    const tweetUrl = `https://twitter.com/${username}/status/${tweetId}`;

    return {
      title: `@${username}: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`,
      description: text,
      link: tweetUrl,
      pubDate: new Date(createdAt),
      guid: tweetId,
      author: `@${username}`,
      content: this.generateRSSContent(tweet, text, username, tweetUrl),
    };
  }

  /**
   * Generate rich RSS content for a tweet
   */
  private generateRSSContent(tweet: any, text: string, username: string, tweetUrl: string): string {
    let content = `<![CDATA[`;
    content += `<p><strong>@${username}</strong></p>`;
    content += `<p>${text}</p>`;

    // Add media if available
    const media = tweet.legacy?.extended_entities?.media || tweet.extended_entities?.media || [];
    if (media.length > 0) {
      content += `<p><strong>Media:</strong></p>`;
      media.forEach((item: any) => {
        if (item.type === 'photo') {
          content += `<img src="${item.media_url_https}" alt="Tweet media" style="max-width: 100%;" />`;
        }
      });
    }

    content += `<p><a href="${tweetUrl}" target="_blank">View on Twitter</a></p>`;
    content += `]]>`;

    return content;
  }

  /**
   * Generate complete RSS XML document
   */
  private generateRSSXMLContent(feed: RSSFeed, items: RSSItem[]): string {
    const now = new Date().toUTCString();
    const baseUrl = `http://localhost:${this.serverPort}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
    xml += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`;
    xml += `<channel>`;
    xml += `<title><![CDATA[${feed.title}]]></title>`;
    xml += `<description><![CDATA[${feed.description}]]></description>`;
    xml += `<link>${baseUrl}/rss/${feed.id}</link>`;
    xml += `<atom:link href="${baseUrl}/rss/${feed.id}" rel="self" type="application/rss+xml" />`;
    xml += `<language>en-us</language>`;
    xml += `<lastBuildDate>${now}</lastBuildDate>`;
    xml += `<pubDate>${now}</pubDate>`;
    xml += `<generator>TwitterRSSService - ElizaOS Enhanced Twitter Plugin</generator>`;

    // Add items
    items.forEach((item) => {
      xml += `<item>`;
      xml += `<title><![CDATA[${item.title}]]></title>`;
      xml += `<description><![CDATA[${item.description}]]></description>`;
      xml += `<link>${item.link}</link>`;
      xml += `<guid isPermaLink="true">${item.link}</guid>`;
      xml += `<pubDate>${item.pubDate.toUTCString()}</pubDate>`;
      xml += `<author><![CDATA[${item.author}]]></author>`;
      xml += `<content:encoded>${item.content}</content:encoded>`;
      xml += `</item>`;
    });

    xml += `</channel>`;
    xml += `</rss>`;

    return xml;
  }

  /**
   * Get all RSS feeds
   */
  getAllFeeds(): RSSFeed[] {
    return Array.from(this.feeds.values());
  }

  /**
   * Get RSS feed by ID
   */
  getFeed(feedId: string): RSSFeed | null {
    return this.feeds.get(feedId) || null;
  }

  /**
   * Delete RSS feed
   */
  async deleteFeed(feedId: string): Promise<boolean> {
    const deleted = this.feeds.delete(feedId);
    if (deleted) {
      await this.saveFeeds();
      elizaLogger.info(`Deleted RSS feed: ${feedId}`);
    }
    return deleted;
  }

  /**
   * Toggle feed active status
   */
  async toggleFeed(feedId: string): Promise<boolean> {
    const feed = this.feeds.get(feedId);
    if (!feed) return false;

    feed.isActive = !feed.isActive;
    await this.saveFeeds();

    elizaLogger.info(`Toggled RSS feed ${feedId} to ${feed.isActive ? 'active' : 'inactive'}`);
    return feed.isActive;
  }

  /**
   * Get RSS server URL
   */
  getServerUrl(): string {
    return `http://localhost:${this.serverPort}`;
  }

  /**
   * Load feeds from storage (placeholder)
   */
  private async loadFeeds(): Promise<void> {
    try {
      // This would load feeds from persistent storage (database, file, etc.)
      // For now, we'll just log that we're loading
      elizaLogger.debug('Loading RSS feeds from storage...');

      // Placeholder - in a real implementation, this would restore feeds from database
      elizaLogger.debug(`Loaded ${this.feeds.size} RSS feeds`);
    } catch (error) {
      elizaLogger.warn('Failed to load RSS feeds from storage:', error);
    }
  }

  /**
   * Save feeds to storage (placeholder)
   */
  private async saveFeeds(): Promise<void> {
    try {
      // This would save feeds to persistent storage
      elizaLogger.debug(`Saving ${this.feeds.size} RSS feeds to storage...`);

      // Placeholder - in a real implementation, this would persist feeds to database
    } catch (error) {
      elizaLogger.warn('Failed to save RSS feeds to storage:', error);
    }
  }
}

// Ensure service type is properly set for ElizaOS service loading
Object.defineProperty(TwitterRSSService, 'name', { value: TwitterRSSService.serviceType });
