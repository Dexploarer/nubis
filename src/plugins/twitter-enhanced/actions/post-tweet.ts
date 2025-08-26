import type { Action, ActionResult, IAgentRuntime, Memory, State } from '@elizaos/core';
import { elizaLogger } from '@elizaos/core';
import type { TwitterClientService } from '../services/twitter-client-service';

export const postTweetAction: Action = {
  name: 'POST_TWEET',
  description: 'Post a tweet using enhanced Twitter client with credential authentication',
  similes: ['tweet', 'post', 'share', 'publish'],
  
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const content = message.content?.text;
    return Boolean(content && content.trim().length > 0 && content.length <= 4000);
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: any,
    callback?: any
  ): Promise<ActionResult> => {
    try {
      elizaLogger.info('Executing POST_TWEET action');
      
      // Get Twitter client service
      const twitterClient = runtime.getService('TWITTER_CLIENT_SERVICE') as TwitterClientService;
      if (!twitterClient) {
        throw new Error('TwitterClientService not available');
      }

      // Check if service is ready
      if (!(await twitterClient.isReady())) {
        throw new Error('Twitter client not authenticated or ready');
      }

      const tweetText = message.content?.text || '';
      if (!tweetText.trim()) {
        throw new Error('Tweet text is empty');
      }

      // Post the tweet
      const result = await twitterClient.postTweet(tweetText);
      
      const tweetId = result.rest_id || result.id || 'unknown';
      const tweetUrl = `https://twitter.com/user/status/${tweetId}`;

      elizaLogger.info('Tweet posted successfully', { tweetId, text: tweetText });

      // Send success callback
      if (callback) {
        await callback({
          text: `✅ Tweet posted successfully!\n\nTweet: "${tweetText.substring(0, 100)}${tweetText.length > 100 ? '...' : ''}"\n\nURL: ${tweetUrl}`,
          action: 'POST_TWEET',
          success: true,
        });
      }

      return {
        success: true,
        text: `Tweet posted successfully: ${tweetUrl}`,
        data: {
          tweetId,
          tweetUrl,
          text: tweetText,
          result,
        },
      };

    } catch (error) {
      elizaLogger.error('Failed to post tweet:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (callback) {
        await callback({
          text: `❌ Failed to post tweet: ${errorMessage}`,
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
        user: 'user',
        content: { text: 'Post a tweet saying hello world' },
      },
      {
        user: 'assistant', 
        content: { text: 'I\'ll post that tweet for you right now!' },
      },
    ],
    [
      {
        user: 'user',
        content: { text: 'Share this on Twitter: Just discovered an amazing new project!' },
      },
      {
        user: 'assistant',
        content: { text: 'I\'ll post that tweet to share your discovery!' },
      },
    ],
  ],
};