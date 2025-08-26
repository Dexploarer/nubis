import { Service, ServiceType, IAgentRuntime, elizaLogger } from "@elizaos/core";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Scraper } from "agent-twitter-client";
import * as fs from "fs";
import type { TweetData, TwitterAuthConfig, ApiResponse } from "../types";

export class TwitterRaidService extends Service {
  static serviceType: ServiceType = "TWITTER_RAID_SERVICE";
  
  private supabase: SupabaseClient;
  private scraper: Scraper | null = null;
  private isAuthenticated = false;
  private twitterConfig: TwitterAuthConfig | null = null;
  private raidCoordinatorUrl: string;

  constructor(runtime: IAgentRuntime) {
    super(runtime);
    
    // Initialize Supabase client
    const supabaseUrl = runtime.getSetting("SUPABASE_URL");
    const supabaseServiceKey = runtime.getSetting("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing for TwitterRaidService");
    }
    
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    this.raidCoordinatorUrl = runtime.getSetting("RAID_COORDINATOR_URL") || "";
  }

  async initialize(): Promise<void> {
    elizaLogger.info("Initializing Twitter Raid Service");
    
    try {
      // Initialize Twitter scraper
      this.scraper = new Scraper();
      
      // Authenticate with Twitter using credentials (not API)
      await this.authenticateTwitter();
      
      elizaLogger.success("Twitter Raid Service initialized successfully");
    } catch (error) {
      elizaLogger.error("Failed to initialize Twitter Raid Service:", error);
      throw error;
    }
  }

  private async authenticateTwitter(): Promise<void> {
    try {
      const username = this.runtime.getSetting("TWITTER_USERNAME");
      const password = this.runtime.getSetting("TWITTER_PASSWORD");
      const email = this.runtime.getSetting("TWITTER_EMAIL");
      
      if (!username || !password) {
        throw new Error("Twitter credentials not configured");
      }
      
      this.twitterConfig = { username, password, email };
      
      if (this.scraper) {
        await this.scraper.login(username, password, email);
        this.isAuthenticated = await this.scraper.isLoggedIn();
        
        if (this.isAuthenticated) {
          elizaLogger.success("Twitter authentication successful");
          
          // Store authentication state in database
          await this.supabase
            .from('system_config')
            .upsert({
              key: 'twitter_authenticated',
              value: 'true',
              updated_at: new Date()
            });
        } else {
          throw new Error("Twitter authentication failed");
        }
      }
    } catch (error) {
      elizaLogger.error("Twitter authentication error:", error);
      
      // Store failed authentication state
      await this.supabase
        .from('system_config')
        .upsert({
          key: 'twitter_authenticated',
          value: 'false',
          updated_at: new Date()
        });
      
      throw error;
    }
  }

  async postTweet(content: string): Promise<string> {
    if (!this.isAuthenticated || !this.scraper) {
      throw new Error("Twitter not authenticated");
    }
    
    try {
      const result = await this.scraper.sendTweet(content);
      elizaLogger.info("Tweet posted successfully:", result);
      
      // Log the tweet to database
      await this.supabase
        .from('agent_tweets')
        .insert({
          tweet_id: result.rest_id || result.id,
          content: content,
          platform: 'twitter',
          posted_at: new Date(),
          status: 'posted'
        });
      
      return result.rest_id || result.id || "";
    } catch (error) {
      elizaLogger.error("Failed to post tweet:", error);
      throw error;
    }
  }

  async scrapeEngagement(tweetUrl: string): Promise<TweetData> {
    try {
      // Use the existing tweet-scraper Edge Function
      const tweetScraperUrl = this.runtime.getSetting("TWEET_SCRAPER_URL") || 
                             "https://nfnmoqepgjyutcbbaqjg.supabase.co/functions/v1/tweet-scraper";
      
      const response = await fetch(tweetScraperUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scrape_tweet_by_url',
          tweetUrl: tweetUrl,
          storeInDatabase: true
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`Tweet scraping failed: ${result.error}`);
      }

      const tweet = result.data.tweet;
      
      const tweetData: TweetData = {
        id: tweet.id,
        text: tweet.text,
        author: tweet.username,
        createdAt: new Date(tweet.createdAt),
        metrics: {
          likes: tweet.likeCount || 0,
          retweets: tweet.retweetCount || 0,
          quotes: tweet.quoteCount || 0,
          comments: tweet.replyCount || 0,
        }
      };

      // Store engagement snapshot
      await this.supabase
        .from('engagement_snapshots')
        .insert({
          tweet_id: tweet.id,
          likes: tweetData.metrics.likes,
          retweets: tweetData.metrics.retweets,
          quotes: tweetData.metrics.quotes,
          comments: tweetData.metrics.comments,
          timestamp: new Date()
        });

      return tweetData;
    } catch (error) {
      elizaLogger.error("Failed to scrape engagement:", error);
      throw error;
    }
  }

  async exportTweets(username: string, count: number = 100, skipCount: number = 0): Promise<TweetData[]> {
    try {
      elizaLogger.info(`Exporting ${count} tweets from @${username} (skipping ${skipCount})`);
      
      // Use the existing tweet-scraper Edge Function
      const tweetScraperUrl = this.runtime.getSetting("TWEET_SCRAPER_URL") || 
                             "https://nfnmoqepgjyutcbbaqjg.supabase.co/functions/v1/tweet-scraper";
      
      const response = await fetch(tweetScraperUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scrape_user_tweets',
          username: username,
          count: count,
          skipCount: skipCount,
          includeReplies: false,
          includeRetweets: true,
          storeInDatabase: true,
          exportFormat: 'json'
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`Tweet scraping failed: ${result.error}`);
      }

      // Convert the scraped data to our TweetData format
      const exportedTweets: TweetData[] = result.data.tweets.map((tweet: any) => ({
        id: tweet.id,
        text: tweet.text,
        author: tweet.username,
        createdAt: new Date(tweet.createdAt),
        metrics: {
          likes: tweet.likeCount || 0,
          retweets: tweet.retweetCount || 0,
          quotes: tweet.quoteCount || 0,
          comments: tweet.replyCount || 0,
        }
      }));

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
      
      // Store export record in database
      await this.supabase
        .from('data_exports')
        .insert({
          export_type: 'tweets',
          username: username,
          count: exportedTweets.length,
          exported_at: new Date(),
          file_path: 'exported-tweets.json',
          scraping_session_id: result.data.scrapingStats?.sessionId
        });
      
      elizaLogger.success(`Successfully exported ${exportedTweets.length} tweets using Edge Function`);
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
        await this.scraper.logout();
      } catch (error) {
        elizaLogger.error("Error during Twitter logout:", error);
      }
      this.isAuthenticated = false;
    }
    elizaLogger.info("Twitter Raid Service stopped");
  }
}
