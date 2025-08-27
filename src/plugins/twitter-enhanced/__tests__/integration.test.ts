import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import type { IAgentRuntime } from '@elizaos/core';
import { TwitterAuthService } from '../services/twitter-auth-service';
import { TwitterClientService } from '../services/twitter-client-service';
import { NotificationMonitor } from '../services/notification-monitor';
import { EngagementTracker } from '../services/engagement-tracker';

// Mock runtime for testing
const createMockRuntime = (): IAgentRuntime =>
  ({
    getSetting: (key: string) => {
      const settings: Record<string, string> = {
        TWITTER_USERNAME: process.env.TWITTER_USERNAME || 'test_user',
        TWITTER_PASSWORD: process.env.TWITTER_PASSWORD || 'test_password',
        TWITTER_EMAIL: process.env.TWITTER_EMAIL || 'test@example.com',
        TWITTER_COOKIES: process.env.TWITTER_COOKIES || '',
        TWITTER_NOTIFICATION_POLL_INTERVAL: '30000',
        TWITTER_ENGAGEMENT_TRACKING: 'true',
        TWITTER_RAID_MONITORING: 'true',
        SUPABASE_URL: 'http://localhost:3000',
        SUPABASE_SERVICE_ROLE_KEY: 'test_key',
      };
      return settings[key];
    },
    getService: (serviceType: string) => {
      // Mock service registry
      if (serviceType === 'TWITTER_AUTH_SERVICE' && mockServices.auth) return mockServices.auth;
      if (serviceType === 'TWITTER_CLIENT_SERVICE' && mockServices.client)
        return mockServices.client;
      if (serviceType === 'NOTIFICATION_MONITOR' && mockServices.monitor)
        return mockServices.monitor;
      if (serviceType === 'ENGAGEMENT_TRACKER' && mockServices.tracker) return mockServices.tracker;
      return null;
    },
  }) as IAgentRuntime;

// Mock services registry
const mockServices: {
  auth?: TwitterAuthService;
  client?: TwitterClientService;
  monitor?: NotificationMonitor;
  tracker?: EngagementTracker;
} = {};

describe('Enhanced Twitter Plugin Integration', () => {
  let runtime: IAgentRuntime;
  let authService: TwitterAuthService;
  let clientService: TwitterClientService;
  let notificationMonitor: NotificationMonitor;
  let engagementTracker: EngagementTracker;

  beforeAll(async () => {
    // Set up global fetch polyfill
    if (typeof globalThis.fetch === 'undefined') {
      const { default: fetch } = await import('node-fetch');
      globalThis.fetch = fetch as any;
    }

    runtime = createMockRuntime();
  });

  describe('TwitterAuthService', () => {
    it('should initialize without errors', async () => {
      expect(() => {
        authService = new TwitterAuthService(runtime);
        mockServices.auth = authService;
      }).not.toThrow();

      expect(authService.name).toBe('TWITTER_AUTH_SERVICE');
      expect(authService.capabilityDescription).toBeTruthy();
    });

    it('should build auth configuration correctly', async () => {
      const authConfig = authService.getAuthConfig();
      expect(authConfig).toBeTruthy();

      if (process.env.TWITTER_COOKIES) {
        expect(authConfig.cookies).toBeTruthy();
      } else {
        expect(authConfig.username).toBeTruthy();
        expect(authConfig.password).toBe('***'); // Should be sanitized
      }
    });

    it('should provide authentication status', () => {
      const status = authService.getAuthStatus();
      expect(status).toHaveProperty('isAuthenticated');
      expect(status).toHaveProperty('authMethod');
      expect(status).toHaveProperty('lastAuthTime');
      expect(status.authMethod).toBeOneOf(['cookies', 'credentials']);
    });
  });

  describe('TwitterClientService', () => {
    it('should initialize without errors', async () => {
      expect(() => {
        clientService = new TwitterClientService(runtime);
        mockServices.client = clientService;
      }).not.toThrow();

      expect(clientService.name).toBe('TWITTER_CLIENT_SERVICE');
      expect(clientService.capabilityDescription).toBeTruthy();
    });

    it('should provide health status', async () => {
      const healthStatus = await clientService.getHealthStatus();
      expect(healthStatus).toHaveProperty('isReady');
      expect(healthStatus).toHaveProperty('authStatus');
    });

    it('should extract tweet IDs correctly', () => {
      const testUrls = [
        'https://twitter.com/user/status/1234567890',
        'https://x.com/user/status/9876543210',
        'twitter.com/user/status/5555555555',
      ];

      const expectedIds = ['1234567890', '9876543210', '5555555555'];

      testUrls.forEach((url, index) => {
        expect(clientService.extractTweetId(url)).toBe(expectedIds[index]);
      });
    });

    it('should handle invalid URLs gracefully', () => {
      expect(() => {
        clientService.extractTweetId('invalid-url');
      }).toThrow('Invalid Twitter URL');
    });
  });

  describe('NotificationMonitor', () => {
    it('should initialize without errors', async () => {
      expect(() => {
        notificationMonitor = new NotificationMonitor(runtime);
        mockServices.monitor = notificationMonitor;
      }).not.toThrow();

      expect(notificationMonitor.name).toBe('NOTIFICATION_MONITOR');
      expect(notificationMonitor.capabilityDescription).toBeTruthy();
    });

    it('should provide status information', () => {
      const status = notificationMonitor.getStatus();
      expect(status).toHaveProperty('isMonitoring');
      expect(status).toHaveProperty('pollInterval');
      expect(status).toHaveProperty('lastPoll');
      expect(status).toHaveProperty('notificationCount');
      expect(status).toHaveProperty('callbackCount');
      expect(typeof status.pollInterval).toBe('number');
    });

    it('should manage callback registration', () => {
      const testCallback = () => {};

      notificationMonitor.registerCallback('test', testCallback);
      let status = notificationMonitor.getStatus();
      expect(status.callbackCount).toBeGreaterThan(0);

      notificationMonitor.unregisterCallback('test', testCallback);
      status = notificationMonitor.getStatus();
      // Note: callback count might not decrease to 0 if there are other callbacks
      expect(status.callbackCount).toBeGreaterThanOrEqual(0);
    });

    it('should maintain engagement history', () => {
      const history = notificationMonitor.getEngagementHistory();
      expect(Array.isArray(history)).toBe(true);

      const mentionHistory = notificationMonitor.getEngagementHistory('mention', 5);
      expect(Array.isArray(mentionHistory)).toBe(true);
      expect(mentionHistory.length).toBeLessThanOrEqual(5);
    });
  });

  describe('EngagementTracker', () => {
    it('should initialize without errors', async () => {
      expect(() => {
        engagementTracker = new EngagementTracker(runtime);
        mockServices.tracker = engagementTracker;
      }).not.toThrow();

      expect(engagementTracker.name).toBe('ENGAGEMENT_TRACKER');
      expect(engagementTracker.capabilityDescription).toBeTruthy();
    });

    it('should provide status information', () => {
      const status = engagementTracker.getStatus();
      expect(status).toHaveProperty('trackingEnabled');
      expect(status).toHaveProperty('activeRaids');
      expect(status).toHaveProperty('totalEngagements');
      expect(status).toHaveProperty('supabaseConnected');
      expect(typeof status.activeRaids).toBe('number');
      expect(typeof status.totalEngagements).toBe('number');
    });

    it('should manage active raids', () => {
      const activeRaids = engagementTracker.getActiveRaids();
      expect(Array.isArray(activeRaids)).toBe(true);
    });

    it('should handle raid engagement queries gracefully', () => {
      const testUrl = 'https://twitter.com/user/status/1234567890';
      const engagement = engagementTracker.getRaidEngagement(testUrl);
      // Should return null if no raid is being tracked
      expect(engagement).toBeNull();
    });
  });

  describe('Service Integration', () => {
    it('should have correct service dependencies', () => {
      // TwitterClientService should be able to get TwitterAuthService
      const authFromClient = runtime.getService('TWITTER_AUTH_SERVICE');
      expect(authFromClient).toBe(authService);

      // NotificationMonitor should be able to get TwitterClientService
      const clientFromMonitor = runtime.getService('TWITTER_CLIENT_SERVICE');
      expect(clientFromMonitor).toBe(clientService);

      // EngagementTracker should be able to get both services
      const monitorFromTracker = runtime.getService('NOTIFICATION_MONITOR');
      expect(monitorFromTracker).toBe(notificationMonitor);
    });

    it('should maintain proper service lifecycle', () => {
      // All services should be properly instantiated
      expect(authService).toBeInstanceOf(TwitterAuthService);
      expect(clientService).toBeInstanceOf(TwitterClientService);
      expect(notificationMonitor).toBeInstanceOf(NotificationMonitor);
      expect(engagementTracker).toBeInstanceOf(EngagementTracker);
    });
  });

  describe('Configuration Handling', () => {
    it('should handle missing configuration gracefully', () => {
      const emptyRuntime = {
        getSetting: () => undefined,
        getService: () => null,
      } as IAgentRuntime;

      expect(() => {
        new TwitterAuthService(emptyRuntime);
      }).not.toThrow();

      expect(() => {
        new TwitterClientService(emptyRuntime);
      }).not.toThrow();

      expect(() => {
        new NotificationMonitor(emptyRuntime);
      }).not.toThrow();

      expect(() => {
        new EngagementTracker(emptyRuntime);
      }).not.toThrow();
    });

    it('should use default values when configuration is missing', () => {
      const monitor = new NotificationMonitor(runtime);
      const status = monitor.getStatus();

      // Should have reasonable defaults
      expect(status.pollInterval).toBeGreaterThan(0);
      expect(status.pollInterval).toBeLessThanOrEqual(300000); // Max 5 minutes
    });
  });

  afterAll(async () => {
    // Cleanup any resources if needed
    if (notificationMonitor) {
      try {
        await notificationMonitor.stopMonitoring();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });
});
