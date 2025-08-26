import {
  Action,
  IAgentRuntime,
  Memory,
  State,
  HandlerCallback,
  elizaLogger,
  ActionResult,
} from "@elizaos/core";
import { TwitterRaidService } from "../services/twitter-raid-service";

export const scrapeTweetsAction: Action = {
  name: "SCRAPE_TWEETS",
  similes: [
    "EXPORT_TWEETS",
    "SCRAPE_USER_TWEETS",
    "GET_USER_TWEETS",
    "DOWNLOAD_TWEETS",
    "EXTRACT_TWEETS"
  ],
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const text = message.content?.text?.toLowerCase() || '';
    return text.includes("scrape") || 
           text.includes("export") ||
           text.includes("download") ||
           text.includes("extract") ||
           (text.includes("tweets") && (text.includes("from") || text.includes("of")));
  },
  description: "Scrape and export tweets from a Twitter user using the Edge Function",
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown },
    callback?: HandlerCallback
  ): Promise<ActionResult> => {
    try {
      elizaLogger.info("Processing tweet scraping request");

      // Extract username from message
      const text = message.content?.text?.toLowerCase() || '';
      // Prefer explicit @handle, otherwise look for 'from/of <handle>'
      const handleMatch = text.match(/@([a-z0-9_]{1,15})/i);
      const fromMatch = text.match(/(?:from|of)\s+@?([a-z0-9_]{1,15})/i);
      const username = (handleMatch?.[1] || fromMatch?.[1])?.toLowerCase();

      if (!username) {
        if (callback) {
          callback({
            text: "🎯 I need a Twitter username to scrape tweets from!\n\n" +
                  "**Usage examples:**\n" +
                  "• \"Scrape tweets from elonmusk\"\n" +
                  "• \"Export 500 tweets from @pmarca\"\n" +
                  "• \"Download tweets of username\"\n\n" +
                  "**Features:**\n" +
                  "• Stores tweets in database\n" +
                  "• Exports to JSON files\n" +
                  "• Supports skip count for pagination\n" +
                  "• Real-time engagement tracking\n\n" +
                  "Just tell me the username and I'll handle the rest! 🚀",
            content: { action: 'scrape_tweets_missing_username' }
          });
        }
        return { success: false, text: "Missing username" };
      }
      
      
      // Extract count if specified
      const countMatch = text.match(/(\d+)\s*tweets?/);
      const count = countMatch ? parseInt(countMatch[1]) : 100;
      
      // Extract skip count if specified
      const skipMatch = text.match(/skip\s*(\d+)/);
      const skipCount = skipMatch ? parseInt(skipMatch[1]) : 0;

      // Get Twitter service
      const twitterService = runtime.getService<TwitterRaidService>("TWITTER_RAID_SERVICE");
      if (!twitterService) {
        throw new Error("Twitter service not available");
      }

      if (callback) {
        callback({
          text: `🔄 **SCRAPING TWEETS** 🔄\n\n` +
                `Target: @${username}\n` +
                `Count: ${count}\n` +
                `Skip: ${skipCount}\n\n` +
                `Status: Initializing scraping process...\n` +
                `Method: Using Edge Function for optimal performance\n\n` +
                `This may take a few moments. I'll notify you when complete! ⏳`,
          content: {
            action: 'scrape_tweets_started',
            username,
            count,
            skipCount
          }
        });
      }

      // Start the scraping process
      const exportedTweets = await twitterService.exportTweets(username, count, skipCount);

      if (callback) {
        callback({
          text: `✅ **TWEET SCRAPING COMPLETE!** ✅\n\n` +
                `**Target:** @${username}\n` +
                `**Results:**\n` +
                `📊 Total tweets scraped: **${exportedTweets.length}**\n` +
                `📁 Files created: **exported-tweets.json**, **tweets.json**\n` +
                `💾 Database storage: **Enabled**\n` +
                `⏱️ Skip count: **${skipCount}**\n\n` +
                `**📋 Sample tweets:**\n` +
                `${exportedTweets.slice(0, 3).map((tweet, i) => 
                  `${i + 1}. "${tweet.text.substring(0, 80)}${tweet.text.length > 80 ? '...' : ''}"`
                ).join('\n')}\n\n` +
                `**🎯 Next steps:**\n` +
                `• Use these tweets for raid analysis\n` +
                `• Track engagement patterns\n` +
                `• Export more with different skip counts\n\n` +
                `*"Data is power - now let's use it strategically!"* 💪`,
          content: {
            action: 'scrape_tweets_completed',
            username,
            count,
            skipCount,
            totalScraped: exportedTweets.length,
            files: ['exported-tweets.json', 'tweets.json'],
            sampleTweets: exportedTweets.slice(0, 3)
          }
        });
      }

      return { success: true, text: "Tweet scraping completed" };
    } catch (error) {
      elizaLogger.error("Scrape tweets action failed:", error);
      
      if (callback) {
        callback({
          text: "❌ **TWEET SCRAPING FAILED!** ❌\n\n" +
                "**Error:** " + error.message + "\n\n" +
                "**Possible issues:**\n" +
                "• Username not found or private account\n" +
                "• Rate limiting from Twitter\n" +
                "• Network connectivity issues\n" +
                "• Edge Function temporarily unavailable\n\n" +
                "**Solutions:**\n" +
                "• Try a different username\n" +
                "• Wait a few minutes and retry\n" +
                "• Check if the account is public\n" +
                "• Reduce the tweet count\n\n" +
                "*\"Sometimes the best strategy is patience!\"* 🔄",
          content: { 
            error: error.message,
            action: 'scrape_tweets_failed',
            suggestions: ['try_different_username', 'wait_and_retry', 'reduce_count']
          }
        });
      }
      
      return { success: false, text: "Tweet scraping failed" };
    }
  },
  examples: [
    [
      {
        name: "{{user1}}",
        content: {
          text: "Scrape 200 tweets from elonmusk"
        }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "🔄 **SCRAPING TWEETS** 🔄\n\n**Target:** @elonmusk\n**Count:** 200 tweets\n**Status:** Initializing...\n\nThis may take a few moments. I'll notify you when complete! ⏳",
          action: "SCRAPE_TWEETS"
        }
      }
    ],
    [
      {
        name: "{{user1}}",
        content: {
          text: "Export tweets from @pmarca skip 1000"
        }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "🔄 **SCRAPING TWEETS** 🔄\n\n**Target:** @pmarca\n**Count:** 100 tweets\n**Skip:** 1000 tweets\n**Status:** Initializing...\n\nThis may take a few moments. I'll notify you when complete! ⏳",
          action: "SCRAPE_TWEETS"
        }
      }
    ]
  ]
};
