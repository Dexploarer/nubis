import { IAgentRuntime, Service, elizaLogger } from '@elizaos/core';
import { Scraper } from 'agent-twitter-client';

/**
 * Twitter Authentication Service
 * Handles credential-based authentication using username/password/email/cookies
 * with agent-twitter-client for ElizaOS integration
 */
export class TwitterAuthService extends Service {
  static serviceType = 'TWITTER_AUTH_SERVICE';

  public name: string = TwitterAuthService.serviceType;
  public capabilityDescription = 'Manages Twitter authentication using credentials and cookies';

  private scraper: Scraper | null = null;
  private isAuthenticated = false;
  private authConfig: any = null;
  private lastAuthTime: number = 0;
  private readonly reauthInterval = 3600000; // 1 hour

  constructor(runtime: IAgentRuntime) {
    super(runtime);
    
    // Extract authentication configuration from environment
    this.authConfig = this.buildAuthConfig();
  }

  static async start(runtime: IAgentRuntime): Promise<TwitterAuthService> {
    elizaLogger.info('Starting Twitter Auth Service');
    const service = new TwitterAuthService(runtime);
    await service.initialize();
    return service;
  }

  static async stop(runtime: IAgentRuntime): Promise<void> {
    try {
      const existing = runtime?.getService?.(TwitterAuthService.serviceType);
      if (existing && typeof (existing as TwitterAuthService).stop === 'function') {
        await (existing as TwitterAuthService).stop();
      }
    } finally {
      elizaLogger.info('Twitter Auth Service stopped');
    }
  }

  async initialize(): Promise<void> {
    try {
      elizaLogger.info('Initializing Twitter Auth Service');
      
      if (!this.authConfig) {
        elizaLogger.warn('No Twitter authentication configuration found');
        return;
      }

      await this.authenticate();
      elizaLogger.info('Twitter Auth Service initialized successfully');
    } catch (error) {
      elizaLogger.error('Failed to initialize Twitter Auth Service:', error);
      // Don't throw - allow service to exist for potential retry
    }
  }

  async stop(): Promise<void> {
    if (this.scraper) {
      try {
        await this.scraper.clearCookies();
        elizaLogger.info('Twitter authentication session cleared');
      } catch (error) {
        elizaLogger.warn('Error clearing Twitter session:', error);
      }
    }
    this.scraper = null;
    this.isAuthenticated = false;
    this.lastAuthTime = 0;
  }

  /**
   * Build authentication configuration from environment variables
   */
  private buildAuthConfig(): any {
    const username = this.runtime.getSetting('TWITTER_USERNAME') || process.env.TWITTER_USERNAME;
    const password = this.runtime.getSetting('TWITTER_PASSWORD') || process.env.TWITTER_PASSWORD;
    const email = this.runtime.getSetting('TWITTER_EMAIL') || process.env.TWITTER_EMAIL;
    const cookiesStr = this.runtime.getSetting('TWITTER_COOKIES') || process.env.TWITTER_COOKIES;

    // Priority: cookies > credentials
    if (cookiesStr) {
      try {
        let cookies: string[];
        
        // Handle different cookie formats
        if (typeof cookiesStr === 'string') {
          if (cookiesStr.startsWith('[')) {
            cookies = JSON.parse(cookiesStr);
          } else {
            cookies = cookiesStr.split(',').map(c => c.trim());
          }
        } else {
          cookies = Array.isArray(cookiesStr) ? cookiesStr : [cookiesStr];
        }

        elizaLogger.info('Using cookie-based authentication');
        return { cookies };
      } catch (error) {
        elizaLogger.warn('Invalid cookie format, falling back to credentials:', error);
      }
    }

    if (username && password && email) {
      elizaLogger.info('Using credential-based authentication');
      return {
        username,
        password,
        email,
      };
    }

    elizaLogger.warn('No valid Twitter authentication configuration found');
    return null;
  }

  /**
   * Authenticate with Twitter using configured method
   */
  private async authenticate(): Promise<void> {
    if (!this.authConfig) {
      throw new Error('No authentication configuration available');
    }

    try {
      this.scraper = new Scraper();

      // Enable global fetch polyfill for agent-twitter-client
      if (typeof globalThis.fetch === 'undefined') {
        const { default: fetch } = await import('node-fetch');
        globalThis.fetch = fetch as any;
      }

      if (this.authConfig.cookies) {
        elizaLogger.info('Authenticating with cookies...');
        await this.scraper.setCookies(this.authConfig.cookies);
      } else {
        elizaLogger.info('Authenticating with credentials...');
        await this.scraper.login(
          this.authConfig.username,
          this.authConfig.password,
          this.authConfig.email
        );
      }

      // Verify authentication by getting user info
      try {
        const userInfo = await this.scraper.getProfile(this.authConfig.username || 'me');
        if (userInfo) {
          this.isAuthenticated = true;
          this.lastAuthTime = Date.now();
          elizaLogger.info('Twitter authentication successful');
        }
      } catch (error) {
        throw new Error('Authentication verification failed');
      }

    } catch (error) {
      elizaLogger.error('Twitter authentication failed:', error);
      this.isAuthenticated = false;
      this.scraper = null;
      throw error;
    }
  }

  /**
   * Get authenticated scraper instance
   */
  async getScraper(): Promise<Scraper | null> {
    // Check if re-authentication is needed
    if (this.isAuthenticated && Date.now() - this.lastAuthTime > this.reauthInterval) {
      elizaLogger.info('Twitter session expired, re-authenticating...');
      this.isAuthenticated = false;
    }

    if (!this.isAuthenticated || !this.scraper) {
      try {
        await this.authenticate();
      } catch (error) {
        elizaLogger.error('Failed to get authenticated scraper:', error);
        return null;
      }
    }

    return this.scraper;
  }

  /**
   * Check if the service is authenticated
   */
  isAuth(): boolean {
    return this.isAuthenticated && this.scraper !== null;
  }

  /**
   * Get authentication status and info
   */
  getAuthStatus(): {
    isAuthenticated: boolean;
    authMethod: string;
    lastAuthTime: number;
    username?: string;
  } {
    return {
      isAuthenticated: this.isAuthenticated,
      authMethod: this.authConfig?.cookies ? 'cookies' : 'credentials',
      lastAuthTime: this.lastAuthTime,
      username: this.authConfig?.username || 'unknown',
    };
  }

  /**
   * Force re-authentication
   */
  async reauth(): Promise<void> {
    elizaLogger.info('Forcing Twitter re-authentication...');
    this.isAuthenticated = false;
    if (this.scraper) {
      await this.scraper.clearCookies();
    }
    await this.authenticate();
  }

  /**
   * Get current auth configuration (for debugging - sanitized)
   */
  getAuthConfig(): any {
    if (!this.authConfig) return null;
    
    const sanitized = { ...this.authConfig };
    if (sanitized.password) sanitized.password = '***';
    if (sanitized.cookies) sanitized.cookies = ['***'];
    return sanitized;
  }
}

// Ensure service type is properly set for ElizaOS service loading
Object.defineProperty(TwitterAuthService, 'name', { value: TwitterAuthService.serviceType });