/**
 * Identity Management Service
 * Manages consistent user identities across platforms (Twitter, Telegram, Discord)
 * Links platform-specific accounts to unified UUIDs for cross-platform tracking
 */

import type { IAgentRuntime, UUID } from '@elizaos/core';
import { Service, ServiceType, elizaLogger } from '@elizaos/core';
import { createClient } from '@supabase/supabase-js';

interface UserIdentity {
  uuid: UUID;
  createdAt: Date;
  lastActiveAt?: Date;
  metadata?: {
    displayName?: string;
    preferredPlatform?: string;
    timezone?: string;
    language?: string;
    isTemporary?: boolean;
    fallback?: boolean;
  };
}

interface PlatformAccount {
  id: UUID;
  userUuid: UUID;
  platform: 'twitter' | 'telegram' | 'discord' | 'web' | 'api';
  platformId: string; // Platform-specific ID (Twitter handle, Telegram user ID, etc.)
  platformUsername?: string; // Display name on platform
  verifiedAt?: Date;
  metadata?: {
    profilePicture?: string;
    followerCount?: number;
    joinedDate?: Date;
    isBot?: boolean;
    permissions?: string[];
  };
}

interface IdentityLinkingRequest {
  platformId: string;
  platform: 'twitter' | 'telegram' | 'discord' | 'web' | 'api';
  platformUsername?: string;
  roomId?: string;
  metadata?: any;
}

export class IdentityManagementService extends Service {
  static serviceType = 'IDENTITY_MANAGEMENT_SERVICE';

  public name: string = IdentityManagementService.serviceType;
  public capabilityDescription =
    'Manages unified cross-platform user identities with UUID consistency';
  private supabase: any;
  private identityCache = new Map<string, UserIdentity>();
  private platformCache = new Map<string, PlatformAccount[]>();
  private readonly MAX_CACHE_SIZE = 1000;

  constructor(runtime: IAgentRuntime) {
    super(runtime);
  }

  // Static lifecycle helpers
  static async start(runtime: IAgentRuntime): Promise<IdentityManagementService> {
    elizaLogger.info('Starting Identity Management Service');
    const service = new IdentityManagementService(runtime);
    await service.initialize();
    return service;
  }

  static async stop(runtime: IAgentRuntime): Promise<void> {
    try {
      const existing = (runtime as any)?.getService?.(IdentityManagementService.serviceType);
      if (existing && typeof existing.stop === 'function') {
        await (existing as IdentityManagementService).stop();
      }
    } finally {
      elizaLogger.info('Identity Management Service stopped');
    }
  }

  async initialize(): Promise<void> {
    elizaLogger.info('Initializing Identity Management Service');

    try {
      // Initialize Supabase client
      const supabaseUrl = this.runtime.getSetting('SUPABASE_URL') || process.env.SUPABASE_URL;
      const supabaseServiceKey =
        this.runtime.getSetting('SUPABASE_SERVICE_ROLE_KEY') ||
        process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        this.supabase = createClient(supabaseUrl, supabaseServiceKey);
      } else {
        elizaLogger.warn('Supabase credentials not available, using mock client');
        this.supabase = this.createNoopSupabase();
      }

      // Create database tables if they don't exist
      await this.ensureDatabaseTables();

      elizaLogger.success('Identity Management Service initialized successfully');
    } catch (error) {
      elizaLogger.error('Failed to initialize Identity Management Service:', error);
      throw error;
    }
  }

  private async ensureDatabaseTables(): Promise<void> {
    try {
      // Only attempt RPC calls if we have a real Supabase client
      if (this.supabase && typeof this.supabase.rpc === 'function') {
        // Create user_identities table
        await this.supabase.rpc('create_user_identities_table', {});

        // Create platform_accounts table
        await this.supabase.rpc('create_platform_accounts_table', {});

        elizaLogger.debug('Database tables ensured for Identity Management');
      } else {
        elizaLogger.debug('Mock Supabase client detected, skipping table creation');
      }
    } catch (error) {
      // Tables might already exist, which is fine
      elizaLogger.debug(
        'Database tables already exist or creation skipped:',
        error?.message || error,
      );
    }
  }

  /**
   * Get or create a unified user identity from a platform interaction
   * This is the main method that ensures consistent UUID usage across platforms
   */
  async getOrCreateUserIdentity(request: IdentityLinkingRequest): Promise<UserIdentity> {
    const cacheKey = `${request.platform}:${request.platformId}`;

    try {
      // Check cache first
      if (this.identityCache.has(cacheKey)) {
        const cached = this.identityCache.get(cacheKey)!;
        elizaLogger.debug(`Using cached identity for ${cacheKey}`);
        return cached;
      }

      // Check if platform account already exists
      const existingAccount = await this.findPlatformAccount(request.platform, request.platformId);

      if (existingAccount) {
        // Get the associated user identity
        const identity = await this.getUserIdentity(existingAccount.userUuid);
        if (identity) {
          this.updateCache(cacheKey, identity);
          await this.updateLastActive(identity.uuid);
          return identity;
        }
      }

      // Create new identity and platform account
      return await this.createNewUserIdentity(request);
    } catch (error) {
      elizaLogger.error('Failed to get or create user identity:', error);
      // Return a temporary identity to prevent system failure
      return this.createTemporaryIdentity(request);
    }
  }

  private async findPlatformAccount(
    platform: string,
    platformId: string,
  ): Promise<PlatformAccount | null> {
    try {
      const { data, error } = await this.supabase
        .from('platform_accounts')
        .select('*')
        .eq('platform', platform)
        .eq('platform_id', platformId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw error;
      }

      return data
        ? {
            id: data.id,
            userUuid: data.user_uuid,
            platform: data.platform,
            platformId: data.platform_id,
            platformUsername: data.platform_username,
            verifiedAt: data.verified_at ? new Date(data.verified_at) : undefined,
            metadata: data.metadata || {},
          }
        : null;
    } catch (error) {
      elizaLogger.warn('Failed to find platform account:', error);
      return null;
    }
  }

  private async getUserIdentity(uuid: UUID): Promise<UserIdentity | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_identities')
        .select('*')
        .eq('uuid', uuid)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data
        ? {
            uuid: data.uuid,
            createdAt: new Date(data.created_at),
            lastActiveAt: data.last_active_at ? new Date(data.last_active_at) : undefined,
            metadata: data.metadata || {},
          }
        : null;
    } catch (error) {
      elizaLogger.warn('Failed to get user identity:', error);
      return null;
    }
  }

  private async createNewUserIdentity(request: IdentityLinkingRequest): Promise<UserIdentity> {
    const newUuid = crypto.randomUUID() as UUID;
    const now = new Date();

    elizaLogger.info(`Creating new user identity for ${request.platform}:${request.platformId}`);

    try {
      // Create user identity
      const { error: identityError } = await this.supabase.from('user_identities').insert({
        uuid: newUuid,
        created_at: now.toISOString(),
        last_active_at: now.toISOString(),
        metadata: {
          displayName: request.platformUsername,
          preferredPlatform: request.platform,
          createdFrom: request.platform,
        },
      });

      if (identityError) {
        throw identityError;
      }

      // Create platform account
      const { error: accountError } = await this.supabase.from('platform_accounts').insert({
        id: crypto.randomUUID(),
        user_uuid: newUuid,
        platform: request.platform,
        platform_id: request.platformId,
        platform_username: request.platformUsername,
        verified_at: now.toISOString(),
        metadata: request.metadata || {},
      });

      if (accountError) {
        throw accountError;
      }

      const identity: UserIdentity = {
        uuid: newUuid,
        createdAt: now,
        lastActiveAt: now,
        metadata: {
          displayName: request.platformUsername,
          preferredPlatform: request.platform,
        },
      };

      // Cache the new identity
      const cacheKey = `${request.platform}:${request.platformId}`;
      this.updateCache(cacheKey, identity);

      elizaLogger.success(
        `Created new user identity: ${newUuid} for ${request.platform}:${request.platformId}`,
      );
      return identity;
    } catch (error) {
      elizaLogger.error('Failed to create new user identity:', error);
      throw error;
    }
  }

  private createTemporaryIdentity(request: IdentityLinkingRequest): UserIdentity {
    // Create a temporary identity for graceful degradation
    const tempUuid = crypto.randomUUID() as UUID;

    elizaLogger.warn(`Creating temporary identity for ${request.platform}:${request.platformId}`);

    return {
      uuid: tempUuid,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      metadata: {
        displayName: request.platformUsername,
        preferredPlatform: request.platform,
        isTemporary: true,
      },
    };
  }

  /**
   * Link an additional platform account to an existing user identity
   */
  async linkPlatformAccount(userUuid: UUID, request: IdentityLinkingRequest): Promise<boolean> {
    try {
      // Check if platform account already exists for this user
      const existingAccount = await this.findPlatformAccount(request.platform, request.platformId);

      if (existingAccount && existingAccount.userUuid === userUuid) {
        elizaLogger.debug('Platform account already linked to this user');
        return true;
      }

      if (existingAccount && existingAccount.userUuid !== userUuid) {
        elizaLogger.warn('Platform account already linked to different user');
        return false;
      }

      // Create new platform account link
      const { error } = await this.supabase.from('platform_accounts').insert({
        id: crypto.randomUUID(),
        user_uuid: userUuid,
        platform: request.platform,
        platform_id: request.platformId,
        platform_username: request.platformUsername,
        verified_at: new Date().toISOString(),
        metadata: request.metadata || {},
      });

      if (error) {
        throw error;
      }

      // Clear relevant caches
      const cacheKey = `${request.platform}:${request.platformId}`;
      this.identityCache.delete(cacheKey);
      this.platformCache.delete(userUuid);

      elizaLogger.success(`Linked ${request.platform} account to user ${userUuid}`);
      return true;
    } catch (error) {
      elizaLogger.error('Failed to link platform account:', error);
      return false;
    }
  }

  /**
   * Get all platform accounts for a user identity
   */
  async getUserPlatformAccounts(userUuid: UUID): Promise<PlatformAccount[]> {
    try {
      // Check cache first
      if (this.platformCache.has(userUuid)) {
        return this.platformCache.get(userUuid)!;
      }

      const { data, error } = await this.supabase
        .from('platform_accounts')
        .select('*')
        .eq('user_uuid', userUuid)
        .order('verified_at', { ascending: false });

      if (error) {
        throw error;
      }

      const accounts: PlatformAccount[] = (data || []).map((row: any) => ({
        id: row.id,
        userUuid: row.user_uuid,
        platform: row.platform,
        platformId: row.platform_id,
        platformUsername: row.platform_username,
        verifiedAt: row.verified_at ? new Date(row.verified_at) : undefined,
        metadata: row.metadata || {},
      }));

      // Cache the result
      this.platformCache.set(userUuid, accounts);

      return accounts;
    } catch (error) {
      elizaLogger.error('Failed to get user platform accounts:', error);
      return [];
    }
  }

  /**
   * Convert platform-specific user ID to unified UUID
   * This is the key method for cross-platform identity consistency
   */
  async platformIdToUuid(platform: string, platformId: string): Promise<UUID | null> {
    try {
      const identity = await this.getOrCreateUserIdentity({
        platform: platform as any,
        platformId,
      });

      return identity.uuid;
    } catch (error) {
      elizaLogger.error('Failed to convert platform ID to UUID:', error);
      return null;
    }
  }

  /**
   * Get cross-platform user summary
   */
  async getUserSummary(userUuid: UUID): Promise<any> {
    try {
      const identity = await this.getUserIdentity(userUuid);
      const platformAccounts = await this.getUserPlatformAccounts(userUuid);

      return {
        uuid: userUuid,
        identity,
        platformAccounts: platformAccounts.map((account) => ({
          platform: account.platform,
          username: account.platformUsername,
          platformId: account.platformId,
          verifiedAt: account.verifiedAt,
        })),
        stats: {
          totalPlatforms: platformAccounts.length,
          joinedDate: identity?.createdAt,
          lastActive: identity?.lastActiveAt,
        },
      };
    } catch (error) {
      elizaLogger.error('Failed to get user summary:', error);
      return null;
    }
  }

  private async updateLastActive(userUuid: UUID): Promise<void> {
    try {
      await this.supabase
        .from('user_identities')
        .update({ last_active_at: new Date().toISOString() })
        .eq('uuid', userUuid);
    } catch (error) {
      elizaLogger.debug('Failed to update last active:', error);
    }
  }

  private updateCache(key: string, identity: UserIdentity): void {
    // Implement bounded cache
    if (this.identityCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.identityCache.keys().next().value;
      if (firstKey) {
        this.identityCache.delete(firstKey);
      }
    }

    this.identityCache.set(key, identity);
  }

  private createNoopSupabase(): any {
    return {
      rpc: () => ({ data: null, error: null }),
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        eq: () => ({ data: [], error: null }),
        single: () => ({ data: null, error: { code: 'PGRST116' } }),
        order: () => ({ data: [], error: null }),
      }),
    };
  }

  /**
   * Get service statistics
   */
  getServiceStats(): any {
    return {
      cachedIdentities: this.identityCache.size,
      cachedPlatformAccounts: this.platformCache.size,
      maxCacheSize: this.MAX_CACHE_SIZE,
    };
  }

  async stop(): Promise<void> {
    this.identityCache.clear();
    this.platformCache.clear();
    elizaLogger.info('Identity Management Service stopped');
  }
}

// Ensure the class constructor reports the expected static identifier when accessed as `.name`
Object.defineProperty(IdentityManagementService, 'name', {
  value: IdentityManagementService.serviceType,
});
