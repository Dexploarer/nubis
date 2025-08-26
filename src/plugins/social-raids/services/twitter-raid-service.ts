import type { IAgentRuntime } from '@elizaos/core';
import { Service, ServiceType, elizaLogger } from '@elizaos/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Scraper } from 'agent-twitter-client';
import * as fs from 'fs';
import type { TweetData, TwitterAuthConfig, ApiResponse } from '../types';

export class TwitterRaidService extends Service {
  static serviceType = 'TWITTER_RAID_SERVICE';

  capabilityDescription = 'Manages Twitter authentication, posting, and engagement scraping';

  public name: string = TwitterRaidService.serviceType;
  public supabase: any;
  public scraper: Scraper | null = null;
  public isAuthenticated = false;
  public twitterConfig: TwitterAuthConfig | null = null;
  private readonly raidCoordinatorUrl: string;

  constructor(runtime: IAgentRuntime) {
    super(runtime);

    // Initialize Supabase client (fallback to no-op if missing)
    const supabaseUrl = runtime.getSetting('SUPABASE_URL') || process.env.SUPABASE_URL;
    const supabaseServiceKey =
      runtime.getSetting('SUPABASE_SERVICE_ROLE_KEY') || process.env.SUPABASE_SERVICE_ROLE_KEY;

    this.supabase =
      supabaseUrl && supabaseServiceKey
        ? createClient(supabaseUrl, supabaseServiceKey)
        : this.createNoopSupabase();
    this.raidCoordinatorUrl = runtime.getSetting('RAID_COORDINATOR_URL') || '';
  }

  // Static lifecycle helpers to satisfy core service loader patterns
  static async start(runtime: IAgentRuntime): Promise<TwitterRaidService> {
    elizaLogger.info('Starting Twitter Raid Service');
    const service = new TwitterRaidService(runtime);
    await service.initialize();
    return service;
  }

  static async stop(runtime: IAgentRuntime): Promise<void> {
    try {
      const existing = (runtime as any)?.getService?.(TwitterRaidService.serviceType);
      if (existing && typeof existing.stop === 'function') {
        await (existing as TwitterRaidService).stop();
      }
    } finally {
      elizaLogger.info('Twitter Raid Service stopped');
    }
  }

  async initialize(): Promise<void> {
    elizaLogger.info('Initializing Twitter Raid Service');

    try {
      // Authenticate (will create scraper internally)
      await this.authenticate();

      elizaLogger.success('Twitter Raid Service initialized successfully');
    } catch (error) {
      elizaLogger.error('Failed to initialize Twitter Raid Service:', error);
      throw error;
    }
  }

  async createRaid(params: {
    targetUrl: string;
    targetPlatform: string;
    platform: string;
    createdBy: string;
  }): Promise<any> {
    try {
      // Validate and format created_by as UUID
      let createdByUuid = params.createdBy;
      
      // Check if it's already a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(params.createdBy)) {
        // If not a UUID, use default system UUID
        createdByUuid = '00000000-0000-0000-0000-000000000000';
        elizaLogger.warn(`Invalid UUID format for createdBy: ${params.createdBy}, using system default`);
      }

      const payload = {
        target_url: params.targetUrl,
        target_platform: params.targetPlatform,
        platform: params.platform,
        created_by: createdByUuid,
        status: 'active',
        created_at: new Date(),
      } as any;

      const { data, error } = await this.supabase.from('raids').insert(payload).select();

      if (error) {
        throw new Error(error.message || 'Failed to create raid');
      }

      // Register the new raid with the engagement tracker for real-time monitoring
      try {
        const engagementTracker = this.runtime.getService('ENGAGEMENT_TRACKER');
        if (engagementTracker && typeof (engagementTracker as any).addRaidForTracking === 'function') {
          await (engagementTracker as any).addRaidForTracking(data[0]?.id, params.targetUrl);
          elizaLogger.info(`Registered raid ${data[0]?.id} with engagement tracker for real-time monitoring`);
        }
      } catch (error) {
        elizaLogger.warn('Failed to register raid with engagement tracker:', error);
        // Don't fail the raid creation if tracking registration fails
      }

      return data;
    } catch (error: any) {
      elizaLogger.error('Failed to create raid:', error);
      throw error;
    }
  }

  async authenticate(): Promise<boolean> {
    try {
      // Use global.import if available so tests can mock it, otherwise fallback to native import()
      const dynamicImport: (s: string) => Promise<any> = (global as any).import
        ? (global as any).import
        : (s: string) => import(s);
      const mod = await dynamicImport('agent-twitter-client');
      const Impl = mod.Scraper || (undefined as unknown as Scraper);
      this.scraper = new Impl();
      await this.authenticateTwitter();
      return this.isAuthenticated;
    } catch (error) {
      this.isAuthenticated = false;
      elizaLogger.error('Twitter authentication error:', error);
      throw error;
    }
  }

  private async authenticateTwitter(): Promise<void> {
    try {
      // Determine auth method (default to credentials)
      const authMethod = (
        this.runtime.getSetting('TWITTER_AUTH_METHOD') ||
        this.runtime.getSetting('AUTH_METHOD') ||
        process.env.TWITTER_AUTH_METHOD ||
        process.env.AUTH_METHOD ||
        'credentials'
      )
        .toString()
        .toLowerCase();

      if (authMethod === 'cookies') {
        const cookiesStr =
          this.runtime.getSetting('TWITTER_COOKIES') || process.env.TWITTER_COOKIES;
        if (!cookiesStr) {
          elizaLogger.warn('TWITTER_COOKIES not configured; falling back to credentials auth');
        } else {
          let cookies: any;
          try {
            cookies = typeof cookiesStr === 'string' ? JSON.parse(cookiesStr) : cookiesStr;
          } catch (e) {
            elizaLogger.warn(
              'TWITTER_COOKIES is not valid JSON array; falling back to credentials auth',
            );
            cookies = null;
          }
          if (Array.isArray(cookies) && cookies.length > 0 && this.scraper) {
            if (typeof (this.scraper as any).setCookies === 'function') {
              await (this.scraper as any).setCookies(cookies);
            } else {
              elizaLogger.warn(
                'Scraper does not support setCookies; continuing without explicit cookie injection',
              );
            }
            // If scraper exposes isLoggedIn, use it; otherwise assume true after cookie set
            const probe = (this.scraper as any).isLoggedIn;
            this.isAuthenticated =
              typeof probe === 'function' ? await probe.call(this.scraper) : true;

            if (this.isAuthenticated) {
              elizaLogger.success('Twitter authentication successful (cookies)');
              // Best-effort status write; do not fail auth on DB issues
              try {
                await this.supabase
                  .from('system_config')
                  .upsert({ key: 'twitter_authenticated', value: 'true', updated_at: new Date() });
              } catch (_) {}
              return;
            }
            // Fall through to credentials if cookie probe fails
            elizaLogger.warn('Cookie-based auth probe failed; falling back to credentials auth');
          }
        }
      }

      // Credentials flow (default)
      const username = this.runtime.getSetting('TWITTER_USERNAME') || process.env.TWITTER_USERNAME;
      const password = this.runtime.getSetting('TWITTER_PASSWORD') || process.env.TWITTER_PASSWORD;
      const email = this.runtime.getSetting('TWITTER_EMAIL') || process.env.TWITTER_EMAIL;

      if (!username || !password) {
        throw new Error('Twitter credentials not configured');
      }

      this.twitterConfig = { username, password, email };

      if (this.scraper) {
        await (this.scraper as any).login(username, password, email);
        this.isAuthenticated = await (this.scraper as any).isLoggedIn();

        if (this.isAuthenticated) {
          elizaLogger.success('Twitter authentication successful (credentials)');
          // Best-effort status write; ignore DB errors
          try {
            await this.supabase
              .from('system_config')
              .upsert({ key: 'twitter_authenticated', value: 'true', updated_at: new Date() });
          } catch (_) {}
        } else {
          throw new Error('Twitter authentication failed (credentials)');
        }
      }
    } catch (error) {
      elizaLogger.error('Twitter authentication error:', error);
      // Preserve original auth error; attempt best-effort status write
      const originalError = error instanceof Error ? error : new Error(String(error));
      try {
        await this.supabase.from('system_config').upsert({
          key: 'twitter_authenticated',
          value: 'false',
          updated_at: new Date(),
        });
      } catch (_) {}
      throw originalError;
    }
  }

  async postTweet(content: string): Promise<any> {
    if (!this.isAuthenticated || !this.scraper) {
      throw new Error('Twitter not authenticated');
    }

    try {
      const result: any = await (this.scraper as any).postTweet(content);
      elizaLogger.info('Tweet posted successfully:', String(result?.id || 'ok'));

      // 🧠 Store in ElizaOS memory system via Community Memory Service
      try {
        const communityMemoryService = this.runtime.getService('COMMUNITY_MEMORY_SERVICE');
        if (communityMemoryService && typeof (communityMemoryService as any).recordInteraction === 'function') {
          
          const interaction = {
            userId: 'agent', // This is the agent posting
            interactionType: 'twitter_post',
            content: content,
            platform: 'twitter',
            roomId: 'agent_timeline', // Agent's own timeline
            context: {
              tweet_id: result?.id || result?.rest_id || result?.data?.id,
              post_type: 'original_tweet',
              character_length: content.length,
              is_agent_generated: true,
            },
            sentimentScore: 0.7, // Assume positive sentiment for agent posts
            timestamp: new Date(),
          };

          await (communityMemoryService as any).recordInteraction(interaction);
          elizaLogger.debug('Twitter post stored in ElizaOS memory system');
        }
      } catch (memoryError) {
        elizaLogger.warn('Failed to store tweet in ElizaOS memory:', memoryError);
      }

      // Fallback: Log the tweet to database (secondary storage)
      await this.supabase.from('agent_tweets').insert({
        tweet_id: result?.id || result?.rest_id || result?.data?.id,
        content: content,
        platform: 'twitter',
        posted_at: new Date(),
        status: 'posted',
      });

      return result;
    } catch (error) {
      elizaLogger.error('Failed to post tweet:', error);
      throw error;
    }
  }

  async scrapeEngagement(tweetUrl: string): Promise<TweetData> {
    try {
      elizaLogger.debug('TwitterRaidService: Fetching engagement data for', tweetUrl);
      
      // First, try to get real-time engagement data from the enhanced Twitter plugin
      try {
        const engagementTracker = this.runtime.getService('ENGAGEMENT_TRACKER');
        if (engagementTracker && typeof (engagementTracker as any).getRaidEngagement === 'function') {
          const engagement = await (engagementTracker as any).getRaidEngagement(tweetUrl);
          if (engagement) {
            elizaLogger.info('Using real-time engagement data from enhanced Twitter plugin');
            
            const tweetId = this.extractTweetId(tweetUrl);
            const tweetData: TweetData = {
              id: tweetId,
              text: 'Real-time tracked tweet', // We don't have tweet text from engagement tracker
              author: 'tracked',
              createdAt: new Date(),
              metrics: {
                likes: engagement.likes || 0,
                retweets: engagement.retweets || 0,
                quotes: engagement.quotes || 0,
                comments: engagement.replies || 0,
              },
            };

            // Store engagement snapshot
            try {
              await this.supabase.from('engagement_snapshots').insert({
                tweet_id: tweetData.id,
                likes: tweetData.metrics.likes,
                retweets: tweetData.metrics.retweets,
                quotes: tweetData.metrics.quotes,
                comments: tweetData.metrics.comments,
                timestamp: new Date(),
              });
            } catch (_) {}

            return tweetData;
          }
        }
      } catch (error) {
        elizaLogger.debug('Real-time engagement not available, falling back to scraping:', error);
      }

      // Fall back to enhanced Twitter client if available
      try {
        const twitterClient = this.runtime.getService('TWITTER_CLIENT_SERVICE');
        if (twitterClient && typeof (twitterClient as any).getTweet === 'function') {
          elizaLogger.info('Using enhanced Twitter client for engagement scraping');
          
          const tweetId = this.extractTweetId(tweetUrl);
          const tweet = await (twitterClient as any).getTweet(tweetId);
          
          if (tweet) {
            const author = tweet.username || tweet.user?.username || tweet.author?.username || 'unknown';
            const createdAt = tweet.createdAt || tweet.created_at || tweet.date || Date.now();
            const likes = tweet.likeCount ?? tweet.favoriteCount ?? tweet.favorites ?? tweet.likes ?? 0;
            const retweets = tweet.retweetCount ?? tweet.retweets ?? 0;
            const quotes = tweet.quoteCount ?? tweet.quotes ?? 0;
            const comments = tweet.replyCount ?? tweet.replies ?? 0;

            const tweetData: TweetData = {
              id: String(tweet.id || tweet.rest_id || tweetId),
              text: tweet.text || tweet.full_text || '',
              author,
              createdAt: new Date(createdAt),
              metrics: { likes, retweets, quotes, comments },
            };

            // Store engagement snapshot
            try {
              await this.supabase.from('engagement_snapshots').insert({
                tweet_id: tweetData.id,
                likes: tweetData.metrics.likes,
                retweets: tweetData.metrics.retweets,
                quotes: tweetData.metrics.quotes,
                comments: tweetData.metrics.comments,
                timestamp: new Date(),
              });
            } catch (_) {}

            return tweetData;
          }
        }
      } catch (error) {
        elizaLogger.debug('Enhanced Twitter client not available, using legacy scraper:', error);
      }

      // Legacy fallback: use direct scraper (for backward compatibility)
      if (!this.scraper) {
        throw new Error('Twitter not authenticated and no enhanced Twitter plugin available');
      }

      const tweetId = this.extractTweetId(tweetUrl);
      const tweet: any = await (this.scraper as any).getTweet(tweetId);
      if (!tweet) {
        throw new Error('Tweet not found');
      }

      const author = tweet.username || tweet.user?.username || tweet.author?.username || 'unknown';
      const createdAt = tweet.createdAt || tweet.created_at || tweet.date || Date.now();
      const likes = tweet.likeCount ?? tweet.favoriteCount ?? tweet.favorites ?? tweet.likes ?? 0;
      const retweets = tweet.retweetCount ?? tweet.retweets ?? 0;
      const quotes = tweet.quoteCount ?? tweet.quotes ?? 0;
      const comments = tweet.replyCount ?? tweet.replies ?? 0;

      const tweetData: TweetData = {
        id: String(tweet.id || tweet.rest_id || tweetId),
        text: tweet.text || tweet.full_text || '',
        author,
        createdAt: new Date(createdAt),
        metrics: { likes, retweets, quotes, comments },
      };

      // Store engagement snapshot
      try {
        await this.supabase.from('engagement_snapshots').insert({
          tweet_id: tweetData.id,
          likes: tweetData.metrics.likes,
          retweets: tweetData.metrics.retweets,
          quotes: tweetData.metrics.quotes,
          comments: tweetData.metrics.comments,
          timestamp: new Date(),
        });
      } catch (_) {}

      return tweetData;
    } catch (error) {
      elizaLogger.error('Failed to scrape engagement:', error);
      // Maintain legacy error surface for tests/callers
      throw new Error('Tweet scraping failed');
    }
  }

  async exportTweets(username: string, count = 100, skipCount = 0): Promise<TweetData[]> {
    try {
      elizaLogger.info(`Exporting ${count} tweets from @${username} (skipping ${skipCount})`);

      if (!this.scraper) {
        throw new Error('Twitter not authenticated');
      }

      const targetTotal = count + (skipCount || 0);
      const collected: any[] = [];
      // Iterate scraper tweets stream
      for await (const tweet of (this.scraper as any).getTweets(username, targetTotal)) {
        collected.push(tweet);
        if (collected.length >= targetTotal) break;
      }

      const sliced = collected.slice(skipCount || 0).slice(0, count);
      const exportedTweets: TweetData[] = sliced.map((tweet: any) => {
        const author =
          tweet.username || tweet.user?.username || tweet.author?.username || 'unknown';
        const createdAt = tweet.createdAt || tweet.created_at || tweet.date || Date.now();
        const likes = tweet.likeCount ?? tweet.favoriteCount ?? tweet.favorites ?? tweet.likes ?? 0;
        const retweets = tweet.retweetCount ?? tweet.retweets ?? 0;
        const quotes = tweet.quoteCount ?? tweet.quotes ?? 0;
        const comments = tweet.replyCount ?? tweet.replies ?? 0;
        return {
          id: String(tweet.id || tweet.rest_id),
          text: tweet.text || tweet.full_text || '',
          author,
          createdAt: new Date(createdAt),
          metrics: { likes, retweets, quotes, comments },
        };
      });

      // Save to file like the user's example
      const exportedData = exportedTweets.map((tweet) => ({
        id: tweet.id,
        text: tweet.text,
        username: `@${tweet.author}`,
        isRetweet: false,
        createdAt: tweet.createdAt,
        favoriteCount: tweet.metrics.likes,
        retweetCount: tweet.metrics.retweets,
      }));

      fs.writeFileSync('exported-tweets.json', JSON.stringify(exportedData, null, 2));

      // Extract just the text like in user's example
      const tweetTexts = exportedTweets.map((tweet) => tweet.text).filter((text) => text !== null);
      fs.writeFileSync('tweets.json', JSON.stringify(tweetTexts, null, 2));

      // Best-effort DB record
      try {
        await this.supabase.from('data_exports').insert({
          export_type: 'tweets',
          username: username,
          count: exportedTweets.length,
          exported_at: new Date(),
          file_path: 'exported-tweets.json',
        });
      } catch (_) {}

      elizaLogger.success(
        `Successfully exported ${exportedTweets.length} tweets using local scraper`,
      );
      return exportedTweets;
    } catch (error) {
      elizaLogger.error('Failed to export tweets:', error);
      throw error;
    }
  }

  async engageWithTweet(
    tweetUrl: string,
    engagementType: 'like' | 'retweet' | 'quote' | 'comment',
    content?: string,
  ): Promise<boolean> {
    if (!this.isAuthenticated || !this.scraper) {
      throw new Error('Twitter not authenticated');
    }

    try {
      const tweetId = this.extractTweetId(tweetUrl);

      let result = false;

      switch (engagementType) {
        case 'like':
          await this.scraper.likeTweet(tweetId);
          result = true;
          break;
        case 'retweet':
          await this.scraper.retweet(tweetId);
          result = true;
          break;
        case 'quote':
          if (content) {
            await this.scraper.sendQuoteTweet(content, tweetId);
            result = true;
          }
          break;
        case 'comment':
          if (content) {
            await this.scraper.sendTweet(content, tweetId);
            result = true;
          }
          break;
      }

      if (result) {
        // 🧠 Store engagement in ElizaOS memory system via Community Memory Service
        try {
          const communityMemoryService = this.runtime.getService('COMMUNITY_MEMORY_SERVICE');
          if (communityMemoryService && typeof (communityMemoryService as any).recordInteraction === 'function') {
            
            const interaction = {
              userId: 'agent', // Agent performing engagement
              interactionType: `twitter_${engagementType}`,
              content: content || `Agent ${engagementType} on tweet ${tweetId}`,
              platform: 'twitter',
              roomId: `tweet_${tweetId}`, // Group by tweet ID
              context: {
                target_tweet_id: tweetId,
                target_tweet_url: tweetUrl,
                engagement_type: engagementType,
                is_agent_engagement: true,
                success: true,
              },
              sentimentScore: 0.8, // Positive sentiment for successful engagement
              timestamp: new Date(),
            };

            await (communityMemoryService as any).recordInteraction(interaction);
            elizaLogger.debug(`Twitter ${engagementType} stored in ElizaOS memory system`);
          }
        } catch (memoryError) {
          elizaLogger.warn('Failed to store Twitter engagement in ElizaOS memory:', memoryError);
        }

        // Fallback: Log engagement action (secondary storage)
        await this.supabase.from('agent_engagements').insert({
          tweet_id: tweetId,
          engagement_type: engagementType,
          content: content,
          performed_at: new Date(),
          success: true,
        });
      }

      return result;
    } catch (error) {
      elizaLogger.error(`Failed to ${engagementType} tweet:`, error);

      // Log failed engagement
      try {
        const tweetId = this.extractTweetId(tweetUrl);
        await this.supabase.from('agent_engagements').insert({
          tweet_id: tweetId,
          engagement_type: engagementType,
          content: content,
          performed_at: new Date(),
          success: false,
          error_message: error.message,
        });
      } catch (logError) {
        elizaLogger.error('Failed to log engagement error:', logError);
      }

      throw error;
    }
  }

  private extractTweetId(url: string): string {
    const match = url.match(/status\/(\d+)/);
    if (!match) {
      throw new Error('Invalid Twitter URL format');
    }
    return match[1];
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.scraper || !this.isAuthenticated) {
        return false;
      }

      // Try a simple operation to check if authentication is still valid
      const isLoggedIn = await this.scraper.isLoggedIn();

      if (!isLoggedIn && this.twitterConfig) {
        // Try to re-authenticate
        await this.authenticateTwitter();
        return this.isAuthenticated;
      }

      return isLoggedIn;
    } catch (error) {
      elizaLogger.error('Twitter health check failed:', error);
      return false;
    }
  }

  async postRaidStatus(raidData: any): Promise<any> {
    if (!this.isAuthenticated || !this.scraper) {
      throw new Error('Twitter not authenticated');
    }

    try {
      const statusText = this.formatRaidStatusTweet(raidData);
      const result = await this.postTweet(statusText);
      
      elizaLogger.info('Raid status posted to Twitter:', String(result?.id || 'ok'));
      
      // Log the raid status tweet
      await this.supabase.from('agent_tweets').insert({
        tweet_id: result?.id || result?.rest_id || result?.data?.id,
        content: statusText,
        platform: 'twitter',
        posted_at: new Date(),
        status: 'posted',
        tweet_type: 'raid_status',
        related_raid_id: raidData.raidId,
      });

      return result;
    } catch (error) {
      elizaLogger.error('Failed to post raid status:', error);
      throw error;
    }
  }

  async postRaidCompletion(raidData: any, stats: any): Promise<any> {
    if (!this.isAuthenticated || !this.scraper) {
      throw new Error('Twitter not authenticated');
    }

    try {
      const completionText = this.formatRaidCompletionTweet(raidData, stats);
      const result = await this.postTweet(completionText);
      
      elizaLogger.info('Raid completion posted to Twitter:', String(result?.id || 'ok'));
      
      // Log the completion tweet
      await this.supabase.from('agent_tweets').insert({
        tweet_id: result?.id || result?.rest_id || result?.data?.id,
        content: completionText,
        platform: 'twitter',
        posted_at: new Date(),
        status: 'posted',
        tweet_type: 'raid_completion',
        related_raid_id: raidData.raidId,
      });

      return result;
    } catch (error) {
      elizaLogger.error('Failed to post raid completion:', error);
      throw error;
    }
  }

  async postSelfRaidTweet(content: string, context?: any): Promise<any> {
    if (!this.isAuthenticated || !this.scraper) {
      throw new Error('Twitter not authenticated');
    }

    try {
      // Add raid indicators to the content
      const enhancedContent = this.enhanceContentForRaid(content, context);
      const result = await this.postTweet(enhancedContent);
      
      elizaLogger.info('Self-raid tweet posted:', String(result?.id || 'ok'));
      
      // Log as self-raid tweet
      await this.supabase.from('agent_tweets').insert({
        tweet_id: result?.id || result?.rest_id || result?.data?.id,
        content: enhancedContent,
        platform: 'twitter',
        posted_at: new Date(),
        status: 'posted',
        tweet_type: 'self_raid',
        context: context,
      });

      return result;
    } catch (error) {
      elizaLogger.error('Failed to post self-raid tweet:', error);
      throw error;
    }
  }

  private formatRaidStatusTweet(raidData: any): string {
    const participantCount = raidData.participantCount || 0;
    const targetUrl = raidData.targetUrl || raidData.target_url;
    
    return `🚨 RAID ACTIVE! 🚨\n\n` +
           `${participantCount} warriors mobilized!\n` +
           `Target acquired: ${targetUrl}\n\n` +
           `Join the coordination in our Telegram! 🔥\n\n` +
           `#SocialRaid #CommunityPower #NUBI`;
  }

  private formatRaidCompletionTweet(raidData: any, stats: any): string {
    const participants = stats.participants || 0;
    const engagements = stats.totalEngagements || 0;
    const targetUrl = raidData.targetUrl || raidData.target_url;
    
    return `✅ RAID COMPLETED! ✅\n\n` +
           `Mission accomplished with ${participants} participants!\n` +
           `Total engagements: ${engagements}\n\n` +
           `Target: ${targetUrl}\n\n` +
           `Community power unleashed! 💪\n\n` +
           `#RaidComplete #CommunityWin #NUBI`;
  }

  private enhanceContentForRaid(content: string, context?: any): string {
    // Add engaging elements to make the tweet more raid-worthy
    const hashtags = ['#NUBI', '#Community', '#Web3'];
    const callToAction = '\n\nWhat do you think? 👇';
    
    let enhanced = content;
    
    // Add call to action if not too long
    if (enhanced.length + callToAction.length <= 240) {
      enhanced += callToAction;
    }
    
    // Add hashtags if there's room
    const availableSpace = 280 - enhanced.length;
    const hashtagText = '\n\n' + hashtags.join(' ');
    
    if (availableSpace >= hashtagText.length) {
      enhanced += hashtagText;
    }
    
    return enhanced;
  }

  async getEngagementMetrics(tweetUrl: string): Promise<any> {
    try {
      const tweetData = await this.scrapeEngagement(tweetUrl);
      
      return {
        likes: tweetData.metrics.likes,
        retweets: tweetData.metrics.retweets,
        quotes: tweetData.metrics.quotes,
        comments: tweetData.metrics.comments,
        total: tweetData.metrics.likes + tweetData.metrics.retweets + tweetData.metrics.quotes + tweetData.metrics.comments,
        author: tweetData.author,
        createdAt: tweetData.createdAt,
        text: tweetData.text
      };
    } catch (error) {
      elizaLogger.error('Failed to get engagement metrics:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.scraper) {
      try {
        // Note: logout method may not be available in current version
        // Just clean up the scraper instance
      } catch (error) {
        elizaLogger.error('Error during Twitter cleanup:', error);
      }
      this.scraper = null;
      this.isAuthenticated = false;
    }
    elizaLogger.info('Twitter Raid Service stopped');
  }

  // Minimal no-op Supabase client to avoid runtime errors when env is missing
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
    };
    return { from: () => chain, channel: () => ({ send: async () => true }) };
  }
}

// Ensure the class constructor reports the expected static identifier when accessed as `.name`
Object.defineProperty(TwitterRaidService, 'name', { value: TwitterRaidService.serviceType });
