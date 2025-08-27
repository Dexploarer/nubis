import { describe, it, expect } from 'bun:test';
import { assertProjectPluginOrder } from '../utils/plugin-order-guard';

describe('plugin order guard', () => {
  it('passes when twitterEnhancedPlugin comes before socialRaidsPlugin', () => {
    const plugins = [{ name: 'plugin' }, { name: 'twitterEnhancedPlugin' }, { name: 'socialRaidsPlugin' }];
    expect(() => assertProjectPluginOrder(plugins)).not.toThrow();
  });

  it('throws when order is reversed', () => {
    const plugins = [{ name: 'socialRaidsPlugin' }, { name: 'twitterEnhancedPlugin' }];
    expect(() => assertProjectPluginOrder(plugins)).toThrow();
  });
});
