import { describe, expect, it } from 'bun:test';
import { socialRaidsPlugin } from '../index';

describe('Social Raids Plugin - Basic Structure', () => {
  it('should have correct plugin structure', () => {
    expect(socialRaidsPlugin.name).toBe('social-raids');
    expect(socialRaidsPlugin.description).toBe(
      'Manages Twitter/Telegram raids, engagement tracking, and community memory.',
    );

    expect(socialRaidsPlugin.services).toBeDefined();
    expect(socialRaidsPlugin.actions).toBeDefined();
    expect(socialRaidsPlugin.providers).toBeDefined();
    expect(socialRaidsPlugin.evaluators).toBeDefined();
    expect(socialRaidsPlugin.config).toBeDefined();
  });

  it('should have all required services', () => {
    const serviceNames = (socialRaidsPlugin.services ?? []).map((service) => service.name);
    expect(serviceNames).toContain('TWITTER_RAID_SERVICE');
    expect(serviceNames).toContain('TELEGRAM_RAID_MANAGER');
    expect(serviceNames).toContain('COMMUNITY_MEMORY_SERVICE');
  });

  it('should have all required actions', () => {
    const actionNames = (socialRaidsPlugin.actions ?? []).map((action) => action.name);
    expect(actionNames).toContain('START_RAID');
    expect(actionNames).toContain('JOIN_RAID');
    expect(actionNames).toContain('SUBMIT_ENGAGEMENT');
    expect(actionNames).toContain('VIEW_LEADERBOARD');
    expect(actionNames).toContain('SCRAPE_TWEETS');
  });

  it('should have all required providers', () => {
    const providerNames = (socialRaidsPlugin.providers ?? []).map((provider) => provider.name);
    expect(providerNames).toContain('RAID_STATUS');
    expect(providerNames).toContain('USER_STATS');
    expect(providerNames).toContain('COMMUNITY_MEMORY');
  });

  it('should have all required evaluators', () => {
    const evaluatorNames = (socialRaidsPlugin.evaluators ?? []).map((evaluator) => evaluator.name);
    expect(evaluatorNames).toContain('ENGAGEMENT_QUALITY');
  });

  it('should have required configuration', () => {
    const configKeys = Object.keys(socialRaidsPlugin.config ?? ({} as any));
    expect(configKeys).toContain('TELEGRAM_BOT_TOKEN');
    expect(configKeys).toContain('TELEGRAM_CHANNEL_ID');
    expect(configKeys).toContain('TWITTER_USERNAME');
    expect(configKeys).toContain('TWITTER_PASSWORD');
    expect(configKeys).toContain('TWEET_SCRAPER_URL');
  });
});
