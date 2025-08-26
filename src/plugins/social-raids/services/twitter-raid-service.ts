import type { IAgentRuntime} from "@elizaos/core";
import { Service, ServiceType, elizaLogger } from "@elizaos/core";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Scraper } from "agent-twitter-client";
import * as fs from "fs";
import type { TweetData, TwitterAuthConfig, ApiResponse } from "../types";

export class TwitterRaidService extends Service {
  static serviceType = "TWITTER_RAID_SERVICE";
  
  capabilityDescription = "Manages Twitter authentication, posting, and engagement scraping";
  
  public name: string = TwitterRaidService.serviceType;
  public supabase: any;
  public scraper: Scraper | null = null;
  public isAuthenticated = false;
  public twitterConfig: TwitterAuthConfig | null = null;
  private readonly raidCoordinatorUrl: string;

  constructor(runtime: IAgentRuntime) {
    super(runtime);
    
    // Initialize Supabase client (fallback to no-op if missing)
    const supabaseUrl = runtime.getSetting("SUPABASE_URL") || process.env.SUPABASE_URL;
    const supabaseServiceKey = runtime.getSetting("SUPABASE_SERVICE_ROLE_KEY") || process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    this.supabase = (supabaseUrl && supabaseServiceKey)
      ? createClient(supabaseUrl, supabaseServiceKey)
      : this.createNoopSupabase();
    this.raidCoordinatorUrl = runtime.getSetting("RAID_COORDINATOR_URL") || "";
  }

  // Static lifecycle helpers to satisfy core service loader patterns
  static async start(runtime: IAgentRuntime): Promise<TwitterRaidService> {
    elizaLogger.info("Starting Twitter Raid Service");
    const service = new TwitterRaidService(runtime);
    await service.initialize();
    return service;
  }

  static async stop(runtime: IAgentRuntime): Promise<void> {
    try {
      const existing = (runtime as any)?.getService?.(TwitterRaidService.serviceType);
      if (existing && typeof existing.stop === "function") {
        await (existing as TwitterRaidService).stop();
      }
    } finally {
      elizaLogger.info("Twitter Raid Service stopped");
    }
  }

  async initialize(): Promise<void> {
    elizaLogger.info("Initializing Twitter Raid Service");
    
    try {
      // Authenticate (will create scraper internally)
      await this.authenticate();
      
      elizaLogger.success("Twitter Raid Service initialized successfully");
    } catch (error) {
      elizaLogger.error("Failed to initialize Twitter Raid Service:", error);
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
      const payload = {
        target_url: params.targetUrl,
        target_platform: params.targetPlatform,
        platform: params.platform,
        created_by: params.createdBy,
        status: 'active',
        created_at: new Date()
      } as any;

      const { data, error } = await this.supabase
        .from('raids')
        .insert(payload)
        .select();

      if (error) {
        throw new Error(error.message || 'Failed to create raid');
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
      const mod = await dynamicImport("agent-twitter-client");
      const Impl = (mod).Scraper || (undefined as unknown as Scraper);
      this.scraper = new Impl();
      await this.authenticateTwitter();
      return this.isAuthenticated;
    } catch (error) {
      this.isAuthenticated = false;
      elizaLogger.error("Twitter authentication error:", error);
      throw error;
    }
  }

  private async authenticateTwitter(): Promise<void> {
    try {
      // Determine auth method (default to credentials)
      const authMethod = (
        this.runtime.getSetting("TWITTER_AUTH_METHOD") ||
        this.runtime.getSetting("AUTH_METHOD") ||
        process.env.TWITTER_AUTH_METHOD ||
        process.env.AUTH_METHOD ||
        'credentials'
      ).toString().toLowerCase();

      if (authMethod === 'cookies') {
        const cookiesStr = this.runtime.getSetting("TWITTER_COOKIES") || process.env.TWITTER_COOKIES;
        if (!cookiesStr) {
          elizaLogger.warn("TWITTER_COOKIES not configured; falling back to credentials auth");
        } else {
          let cookies: any;
          try {
            cookies = typeof cookiesStr === 'string' ? JSON.parse(cookiesStr) : cookiesStr;
          } catch (e) {
            elizaLogger.warn("TWITTER_COOKIES is not valid JSON array; falling back to credentials auth");
            cookies = null;
          }
          if (Array.isArray(cookies) && cookies.length > 0 && this.scraper) {
            if (typeof (this.scraper as any).setCookies === 'function') {
              await (this.scraper as any).setCookies(cookies);
            } else {
              elizaLogger.warn("Scraper does not support setCookies; continuing without explicit cookie injection");
            }
            // If scraper exposes isLoggedIn, use it; otherwise assume true after cookie set
            const probe = (this.scraper as any).isLoggedIn;
            this.isAuthenticated = typeof probe === 'function' ? await probe.call(this.scraper) : true;

            if (this.isAuthenticated) {
              elizaLogger.success("Twitter authentication successful (cookies)");
              // Best-effort status write; do not fail auth on DB issues
              try {
                await this.supabase
                  .from('system_config')
                  .upsert({ key: 'twitter_authenticated', value: 'true', updated_at: new Date() });
              } catch (_) {}
              return;
            }
            // Fall through to credentials if cookie probe fails
            elizaLogger.warn("Cookie-based auth probe failed; falling back to credentials auth");
          }
        }
      }

      // Credentials flow (default)
      const username = this.runtime.getSetting("TWITTER_USERNAME") || process.env.TWITTER_USERNAME;
      const password = this.runtime.getSetting("TWITTER_PASSWORD") || process.env.TWITTER_PASSWORD;
      const email = this.runtime.getSetting("TWITTER_EMAIL") || process.env.TWITTER_EMAIL;

      if (!username || !password) {
        throw new Error("Twitter credentials not configured");
      }

      this.twitterConfig = { username, password, email };

      if (this.scraper) {
        await (this.scraper as any).login(username, password, email);
        this.isAuthenticated = await (this.scraper as any).isLoggedIn();

        if (this.isAuthenticated) {
          elizaLogger.success("Twitter authentication successful (credentials)");
          // Best-effort status write; ignore DB errors
          try {
            await this.supabase
              .from('system_config')
              .upsert({ key: 'twitter_authenticated', value: 'true', updated_at: new Date() });
          } catch (_) {}
        } else {
          throw new Error("Twitter authentication failed (credentials)");
        }
      }
    } catch (error) {
      elizaLogger.error("Twitter authentication error:", error);
      // Preserve original auth error; attempt best-effort status write
      const originalError = error instanceof Error ? error : new Error(String(error));
      try {
        await this.supabase
          .from('system_config')
          .upsert({
            key: 'twitter_authenticated',
            value: 'false',
            updated_at: new Date()
          });
      } catch (_) {}
      throw originalError;
    }
  }

  async postTweet(content: string): Promise<any> {
    if (!this.isAuthenticated || !this.scraper) {
      throw new Error("Twitter not authenticated");
    }
    
    try {
      const result: any = await (this.scraper as any).postTweet(content);
      elizaLogger.info("Tweet posted successfully:", String(result?.id || 'ok'));
      
      // Log the tweet to database
      await this.supabase
        .from('agent_tweets')
        .insert({
          tweet_id: result?.id || result?.rest_id || result?.data?.id,
          content: content,
          platform: 'twitter',
          posted_at: new Date(),
          status: 'posted'
        });
      
      return result;
    } catch (error) {
      elizaLogger.error("Failed to post tweet:", error);
      throw error;
    }
  }

  async scrapeEngagement(tweetUrl: string): Promise<TweetData> {
    try {
      // Ensure we have a scraper. Do NOT attempt network auth here to keep tests isolated.
      if (!this.scraper) {
        throw new Error("Twitter not authenticated");
      }

      const tweetId = this.extractTweetId(tweetUrl);
      const tweet: any = await (this.scraper as any).getTweet(tweetId);
      if (!tweet) {
        throw new Error("Tweet not found");
      }

      const author = tweet.username || tweet.user?.username || tweet.author?.username || "unknown";
      const createdAt = tweet.createdAt || tweet.created_at || tweet.date || Date.now();
      const likes = tweet.likeCount ?? tweet.favoriteCount ?? tweet.favorites ?? tweet.likes ?? 0;
      const retweets = tweet.retweetCount ?? tweet.retweets ?? 0;
      const quotes = tweet.quoteCount ?? tweet.quotes ?? 0;
      const comments = tweet.replyCount ?? tweet.replies ?? 0;

      const tweetData: TweetData = {
        id: String(tweet.id || tweet.rest_id || tweetId),
        text: tweet.text || tweet.full_text || "",
        author,
        createdAt: new Date(createdAt),
        metrics: { likes, retweets, quotes, comments }
      };

      // Best-effort: store engagement snapshot; do not fail method on DB issues
      try {
        await this.supabase
          .from('engagement_snapshots')
          .insert({
            tweet_id: tweetData.id,
            likes: tweetData.metrics.likes,
            retweets: tweetData.metrics.retweets,
            quotes: tweetData.metrics.quotes,
            comments: tweetData.metrics.comments,
            timestamp: new Date()
          });
      } catch (_) {}

      return tweetData;
    } catch (error) {
      elizaLogger.error("Failed to scrape engagement:", error);
      // Maintain legacy error surface for tests/callers
      throw new Error("Tweet scraping failed");
    }
  }

  async exportTweets(username: string, count = 100, skipCount = 0): Promise<TweetData[]> {
    try {
      elizaLogger.info(`Exporting ${count} tweets from @${username} (skipping ${skipCount})`);

      if (!this.scraper) {
        throw new Error("Twitter not authenticated");
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
        const author = tweet.username || tweet.user?.username || tweet.author?.username || "unknown";
        const createdAt = tweet.createdAt || tweet.created_at || tweet.date || Date.now();
        const likes = tweet.likeCount ?? tweet.favoriteCount ?? tweet.favorites ?? tweet.likes ?? 0;
        const retweets = tweet.retweetCount ?? tweet.retweets ?? 0;
        const quotes = tweet.quoteCount ?? tweet.quotes ?? 0;
        const comments = tweet.replyCount ?? tweet.replies ?? 0;
        return {
          id: String(tweet.id || tweet.rest_id),
          text: tweet.text || tweet.full_text || "",
          author,
          createdAt: new Date(createdAt),
          metrics: { likes, retweets, quotes, comments }
        };
      });

      // Save to file like the user's example
      const exportedData = exportedTweets.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        username: `@${tweet.author}`,
        isRetweet: false,
        createdAt: tweet.createdAt,
        favoriteCount: tweet.metrics.likes,
        retweetCount: tweet.metrics.retweets
      }));

      fs.writeFileSync("exported-tweets.json", JSON.stringify(exportedData, null, 2));

      // Extract just the text like in user's example
      const tweetTexts = exportedTweets.map(tweet => tweet.text).filter(text => text !== null);
      fs.writeFileSync("tweets.json", JSON.stringify(tweetTexts, null, 2));

      // Best-effort DB record
      try {
        await this.supabase
          .from('data_exports')
          .insert({
            export_type: 'tweets',
            username: username,
            count: exportedTweets.length,
            exported_at: new Date(),
            file_path: 'exported-tweets.json'
          });
      } catch (_) {}

      elizaLogger.success(`Successfully exported ${exportedTweets.length} tweets using local scraper`);
      return exportedTweets;
    } catch (error) {
      elizaLogger.error("Failed to export tweets:", error);
      throw error;
    }
  }

  async engageWithTweet(tweetUrl: string, engagementType: 'like' | 'retweet' | 'quote' | 'comment', content?: string): Promise<boolean> {
    if (!this.isAuthenticated || !this.scraper) {
      throw new Error("Twitter not authenticated");
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
        // Log engagement action
        await this.supabase
          .from('agent_engagements')
          .insert({
            tweet_id: tweetId,
            engagement_type: engagementType,
            content: content,
            performed_at: new Date(),
            success: true
          });
      }

      return result;
    } catch (error) {
      elizaLogger.error(`Failed to ${engagementType} tweet:`, error);
      
      // Log failed engagement
      try {
        const tweetId = this.extractTweetId(tweetUrl);
        await this.supabase
          .from('agent_engagements')
          .insert({
            tweet_id: tweetId,
            engagement_type: engagementType,
            content: content,
            performed_at: new Date(),
            success: false,
            error_message: error.message
          });
      } catch (logError) {
        elizaLogger.error("Failed to log engagement error:", logError);
      }
      
      throw error;
    }
  }

  private extractTweetId(url: string): string {
    const match = url.match(/status\/(\d+)/);
    if (!match) {
      throw new Error("Invalid Twitter URL format");
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
      elizaLogger.error("Twitter health check failed:", error);
      return false;
    }
  }

  async stop(): Promise<void> {
    if (this.scraper) {
      try {
        // Note: logout method may not be available in current version
        // Just clean up the scraper instance
      } catch (error) {
        elizaLogger.error("Error during Twitter cleanup:", error);
      }
      this.scraper = null;
      this.isAuthenticated = false;
    }
    elizaLogger.info("Twitter Raid Service stopped");
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
      in: () => resolved
    };
    return { from: () => chain, channel: () => ({ send: async () => true }) };
  }
}

// Ensure the class constructor reports the expected static identifier when accessed as `.name`
Object.defineProperty(TwitterRaidService, 'name', { value: TwitterRaidService.serviceType });
