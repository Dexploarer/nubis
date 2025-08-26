"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const dotenv_1 = require("dotenv");
// Load environment variables early (CommonJS default)
dotenv_1.config();
// Skip these tests unless specifically enabled. Avoid importing heavy deps unless running.
const runIntegrationTests = process.env.RUN_INTEGRATION_TESTS === 'true' || process.env.INTEGRATION_TESTS_ENABLED === 'true';
if (!runIntegrationTests) {
    // Intentionally do not register tests unless enabled
}
else {
    (0, bun_test_1.describe)('Twitter Integration Tests', () => {
    let client;
    let authConfig;
    (0, bun_test_1.beforeAll)(async () => {
        // Set up auth config from environment variables
        const authMethod = process.env.AUTH_METHOD || 'credentials';
        if (authMethod === 'cookies') {
            const cookiesStr = process.env.TWITTER_COOKIES;
            if (!cookiesStr) {
                throw new Error('TWITTER_COOKIES environment variable is required for cookie auth');
            }
            authConfig = {
                method: 'cookies',
                data: { cookies: JSON.parse(cookiesStr) }
            };
        }
        else if (authMethod === 'credentials') {
            const username = process.env.TWITTER_USERNAME;
            const password = process.env.TWITTER_PASSWORD;
            if (!username || !password) {
                throw new Error('TWITTER_USERNAME and TWITTER_PASSWORD are required for credential auth');
            }
            authConfig = {
                method: 'credentials',
                data: {
                    username,
                    password,
                    email: process.env.TWITTER_EMAIL,
                    twoFactorSecret: process.env.TWITTER_2FA_SECRET
                }
            };
        }
        else if (authMethod === 'api') {
            const apiKey = process.env.TWITTER_API_KEY;
            const apiSecretKey = process.env.TWITTER_API_SECRET_KEY;
            const accessToken = process.env.TWITTER_ACCESS_TOKEN;
            const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
            if (!apiKey || !apiSecretKey || !accessToken || !accessTokenSecret) {
                throw new Error('API credentials are required for API auth');
            }
            authConfig = {
                method: 'api',
                data: {
                    apiKey,
                    apiSecretKey,
                    accessToken,
                    accessTokenSecret
                }
            };
        }
        else {
            throw new Error(`Auth method ${authMethod} not configured for tests`);
        }
        // Lazily import TwitterClient only when running integration tests
        const mod = await Promise.resolve().then(() => require('../../twitter-client.js'));
        const TwitterClient = mod.TwitterClient || mod.default;
        client = new TwitterClient();
    });
    (0, bun_test_1.it)('can fetch a user profile', async () => {
        const profile = await client.getUserProfile(authConfig, 'twitter');
        (0, bun_test_1.expect)(profile).toBeDefined();
        (0, bun_test_1.expect)(profile.username).toBe('twitter');
    }, 30000); // Longer timeout for API calls
    (0, bun_test_1.it)('can search tweets', async () => {
        const results = await client.searchTweets(authConfig, 'twitter', 5, 'Top');
        (0, bun_test_1.expect)(results).toBeDefined();
        (0, bun_test_1.expect)(results.tweets.length).toBeGreaterThan(0);
    }, 30000);
    (0, bun_test_1.it)('can get tweets from a user', async () => {
        const tweets = await client.getUserTweets(authConfig, 'twitter', 5);
        (0, bun_test_1.expect)(tweets).toBeDefined();
        (0, bun_test_1.expect)(tweets.length).toBeGreaterThan(0);
    }, 30000);
    // Only run write tests if explicitly enabled
    const runWriteTests = process.env.RUN_WRITE_TESTS === 'true';
    if (runWriteTests) {
        (0, bun_test_1.it)('can post a tweet', async () => {
            const testText = `Test tweet from Twitter MCP ${Date.now()}`;
            const tweet = await client.sendTweet(authConfig, testText);
            (0, bun_test_1.expect)(tweet).toBeDefined();
            (0, bun_test_1.expect)(tweet.text).toBe(testText);
        }, 30000);
    }
    });
}
