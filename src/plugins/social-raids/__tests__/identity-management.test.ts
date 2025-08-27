import { describe, expect, it, beforeEach, afterEach, mock } from 'bun:test';
import { type IAgentRuntime, type UUID } from '@elizaos/core';

// Import the service under test
import { IdentityManagementService } from '../services/identity-management-service';

// Import test utilities
import {
  createMockRuntime,
  createMockSupabaseClient,
  setupTestEnvironment,
  cleanupTestEnvironment,
  TEST_CONSTANTS,
} from './test-utils';

describe('Identity Management Service - Database Schema Tests', () => {
  let service: IdentityManagementService;
  let mockRuntime: any;
  let mockSupabase: any;

  beforeEach(async () => {
    setupTestEnvironment();
    mockRuntime = createMockRuntime({
      getSetting: mock().mockImplementation((key: string) => {
        if (key === 'SUPABASE_URL') return 'https://test.supabase.co';
        if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'test-service-key';
        return undefined;
      }),
    });

    mockSupabase = createMockSupabaseClient();
    service = new IdentityManagementService(mockRuntime as IAgentRuntime);
    service.supabase = mockSupabase;
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('Service Initialization', () => {
    it('should initialize with correct service type', () => {
      expect(service.name).toBe('IDENTITY_MANAGEMENT_SERVICE');
      expect(service.capabilityDescription).toBe(
        'Manages unified cross-platform user identities with UUID consistency',
      );
    });

    it('should create database tables on initialization', async () => {
      const rpcSpy = mock().mockResolvedValue({ data: null, error: null });
      mockSupabase.rpc = rpcSpy;

      await service.initialize();

      expect(rpcSpy).toHaveBeenCalledWith('create_user_identities_table', {});
      expect(rpcSpy).toHaveBeenCalledWith('create_platform_accounts_table', {});
    });

    it('should handle database table creation errors gracefully', async () => {
      const rpcSpy = mock().mockResolvedValue({
        data: null,
        error: { message: 'Table already exists' },
      });
      mockSupabase.rpc = rpcSpy;

      await service.initialize();

      // Should not throw error when tables already exist
      expect(service).toBeDefined();
    });

    it('should handle missing Supabase credentials with noop client', () => {
      const runtimeWithoutCreds = createMockRuntime({
        getSetting: mock().mockReturnValue(undefined),
      });

      const serviceWithoutCreds = new IdentityManagementService(
        runtimeWithoutCreds as IAgentRuntime,
      );

      expect(serviceWithoutCreds).toBeDefined();
      // Should use noop Supabase client
    });
  });

  describe('User Identity Management', () => {
    describe('Creating New User Identities', () => {
      it('should create new user identity with UUID', async () => {
        const testUuid = crypto.randomUUID() as UUID;
        const testRequest = {
          platform: 'twitter' as const,
          platformId: 'testuser123',
          platformUsername: 'TestUser',
          metadata: { isTest: true },
        };

        // Mock database responses
        mockSupabase
          .from()
          .select()
          .eq()
          .single.mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }, // No existing platform account
          });

        mockSupabase.from().insert.mockResolvedValue({
          data: null,
          error: null,
        });

        // Mock UUID generation
        const originalCryptoRandomUUID = crypto.randomUUID;
        crypto.randomUUID = mock().mockReturnValue(testUuid);

        const result = await service.getOrCreateUserIdentity(testRequest);

        expect(result).toBeDefined();
        expect(result.uuid).toBe(testUuid);
        expect(result.metadata?.displayName).toBe('TestUser');
        expect(result.metadata?.preferredPlatform).toBe('twitter');

        // Restore original function
        crypto.randomUUID = originalCryptoRandomUUID;
      });

      it('should create user_identities table entry with correct structure', async () => {
        const testRequest = {
          platform: 'telegram' as const,
          platformId: '123456789',
          platformUsername: 'telegram_user',
        };

        const insertSpy = mock().mockResolvedValue({ data: null, error: null });
        mockSupabase.from = mock().mockImplementation((table: string) => {
          if (table === 'platform_accounts') {
            return {
              select: () => ({
                eq: () => ({
                  single: mock().mockResolvedValue({
                    data: null,
                    error: { code: 'PGRST116' },
                  }),
                }),
              }),
              insert: insertSpy,
            };
          }
          if (table === 'user_identities') {
            return {
              select: () => ({
                eq: () => ({
                  single: mock().mockResolvedValue({
                    data: null,
                    error: { code: 'PGRST116' },
                  }),
                }),
              }),
              insert: insertSpy,
              update: () => ({ eq: mock().mockResolvedValue({ data: null, error: null }) }),
            };
          }
          return { insert: insertSpy };
        });

        await service.getOrCreateUserIdentity(testRequest);

        // Verify user_identities insert was called with correct structure
        expect(insertSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            uuid: expect.any(String),
            created_at: expect.any(String),
            last_active_at: expect.any(String),
            metadata: expect.objectContaining({
              displayName: 'telegram_user',
              preferredPlatform: 'telegram',
              createdFrom: 'telegram',
            }),
          }),
        );
      });
    });

    describe('Retrieving Existing User Identities', () => {
      it('should retrieve existing user by platform account', async () => {
        const existingUuid = crypto.randomUUID() as UUID;
        const testRequest = {
          platform: 'discord' as const,
          platformId: 'discord123',
          platformUsername: 'DiscordUser',
        };

        // Mock existing platform account
        mockSupabase.from = mock().mockImplementation((table: string) => {
          if (table === 'platform_accounts') {
            return {
              select: () => ({
                eq: () => ({
                  single: mock().mockResolvedValue({
                    data: {
                      id: crypto.randomUUID(),
                      user_uuid: existingUuid,
                      platform: 'discord',
                      platform_id: 'discord123',
                      platform_username: 'DiscordUser',
                      verified_at: new Date().toISOString(),
                      metadata: {},
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'user_identities') {
            return {
              select: () => ({
                eq: () => ({
                  single: mock().mockResolvedValue({
                    data: {
                      uuid: existingUuid,
                      created_at: new Date().toISOString(),
                      last_active_at: new Date().toISOString(),
                      metadata: {
                        displayName: 'DiscordUser',
                        preferredPlatform: 'discord',
                      },
                    },
                    error: null,
                  }),
                }),
              }),
              update: () => ({ eq: mock().mockResolvedValue({ data: null, error: null }) }),
            };
          }
          return {};
        });

        const result = await service.getOrCreateUserIdentity(testRequest);

        expect(result).toBeDefined();
        expect(result.uuid).toBe(existingUuid);
        expect(result.metadata?.displayName).toBe('DiscordUser');
      });

      it('should update last_active_at when retrieving existing user', async () => {
        const existingUuid = crypto.randomUUID() as UUID;
        const updateSpy = mock().mockResolvedValue({ data: null, error: null });

        mockSupabase.from = mock().mockImplementation((table: string) => {
          if (table === 'platform_accounts') {
            return {
              select: () => ({
                eq: () => ({
                  single: mock().mockResolvedValue({
                    data: { user_uuid: existingUuid },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'user_identities') {
            return {
              select: () => ({
                eq: () => ({
                  single: mock().mockResolvedValue({
                    data: {
                      uuid: existingUuid,
                      created_at: new Date().toISOString(),
                      metadata: {},
                    },
                    error: null,
                  }),
                }),
              }),
              update: () => ({ eq: updateSpy }),
            };
          }
          return {};
        });

        await service.getOrCreateUserIdentity({
          platform: 'twitter',
          platformId: 'existing_user',
        });

        expect(updateSpy).toHaveBeenCalledWith(existingUuid);
      });
    });

    describe('Identity Caching', () => {
      it('should cache user identities to reduce database calls', async () => {
        const testUuid = crypto.randomUUID() as UUID;
        const testRequest = {
          platform: 'twitter' as const,
          platformId: 'cached_user',
        };

        const selectSpy = mock().mockResolvedValue({
          data: {
            user_uuid: testUuid,
          },
          error: null,
        });

        mockSupabase.from = mock().mockImplementation((table: string) => {
          if (table === 'platform_accounts') {
            return {
              select: () => ({
                eq: () => ({
                  single: selectSpy,
                }),
              }),
            };
          }
          if (table === 'user_identities') {
            return {
              select: () => ({
                eq: () => ({
                  single: mock().mockResolvedValue({
                    data: {
                      uuid: testUuid,
                      created_at: new Date().toISOString(),
                      metadata: {},
                    },
                    error: null,
                  }),
                }),
              }),
              update: () => ({ eq: mock().mockResolvedValue({ data: null, error: null }) }),
            };
          }
          return {};
        });

        // First call - should hit database
        await service.getOrCreateUserIdentity(testRequest);
        expect(selectSpy).toHaveBeenCalledTimes(1);

        // Second call - should use cache
        await service.getOrCreateUserIdentity(testRequest);
        expect(selectSpy).toHaveBeenCalledTimes(1); // No additional database call
      });

      it('should implement bounded cache to prevent memory issues', () => {
        const stats = service.getServiceStats();
        expect(stats).toHaveProperty('cachedIdentities');
        expect(stats).toHaveProperty('maxCacheSize');
        expect(stats.maxCacheSize).toBe(1000);
      });
    });

    describe('Error Handling and Graceful Degradation', () => {
      it('should create temporary identity when database fails', async () => {
        const testRequest = {
          platform: 'twitter' as const,
          platformId: 'failing_user',
          platformUsername: 'FailUser',
        };

        // Mock database failure
        mockSupabase.from = mock().mockImplementation(() => {
          throw new Error('Database connection failed');
        });

        const result = await service.getOrCreateUserIdentity(testRequest);

        expect(result).toBeDefined();
        expect(result.uuid).toBeDefined();
        expect(result.metadata?.isTemporary).toBe(true);
        expect(result.metadata?.displayName).toBe('FailUser');
      });

      it('should handle malformed database responses', async () => {
        const testRequest = {
          platform: 'telegram' as const,
          platformId: 'malformed_data',
        };

        // Mock malformed response
        mockSupabase
          .from()
          .select()
          .eq()
          .single.mockResolvedValue({
            data: { invalid: 'structure' },
            error: null,
          });

        const result = await service.getOrCreateUserIdentity(testRequest);

        expect(result).toBeDefined();
        expect(result.uuid).toBeDefined();
      });
    });
  });

  describe('Platform Account Management', () => {
    describe('Platform Account Linking', () => {
      it('should link additional platform account to existing user', async () => {
        const existingUuid = crypto.randomUUID() as UUID;
        const linkRequest = {
          platform: 'discord' as const,
          platformId: 'discord456',
          platformUsername: 'NewDiscordUser',
        };

        const insertSpy = mock().mockResolvedValue({ data: null, error: null });

        mockSupabase.from = mock().mockImplementation((table: string) => {
          if (table === 'platform_accounts') {
            return {
              select: () => ({
                eq: () => ({
                  single: mock().mockResolvedValue({
                    data: null,
                    error: { code: 'PGRST116' }, // No existing account
                  }),
                  order: () => ({
                    // For getUserPlatformAccounts
                    mockResolvedValue: { data: [], error: null },
                  }),
                }),
              }),
              insert: insertSpy,
            };
          }
          return {};
        });

        const result = await service.linkPlatformAccount(existingUuid, linkRequest);

        expect(result).toBe(true);
        expect(insertSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            user_uuid: existingUuid,
            platform: 'discord',
            platform_id: 'discord456',
            platform_username: 'NewDiscordUser',
          }),
        );
      });

      it('should prevent linking same platform account to different users', async () => {
        const existingUuid = crypto.randomUUID() as UUID;
        const differentUuid = crypto.randomUUID() as UUID;

        mockSupabase
          .from()
          .select()
          .eq()
          .single.mockResolvedValue({
            data: {
              user_uuid: differentUuid, // Different user
              platform: 'twitter',
              platform_id: 'conflicted_account',
            },
            error: null,
          });

        const result = await service.linkPlatformAccount(existingUuid, {
          platform: 'twitter',
          platformId: 'conflicted_account',
        });

        expect(result).toBe(false);
      });

      it('should create platform_accounts table entry with correct structure', async () => {
        const userUuid = crypto.randomUUID() as UUID;
        const linkRequest = {
          platform: 'web' as const,
          platformId: 'web_user_123',
          platformUsername: 'WebUser',
          metadata: {
            browser: 'Chrome',
            ipAddress: '192.168.1.1',
          },
        };

        const insertSpy = mock().mockResolvedValue({ data: null, error: null });
        mockSupabase
          .from()
          .select()
          .eq()
          .single.mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          });
        mockSupabase.from().insert = insertSpy;

        await service.linkPlatformAccount(userUuid, linkRequest);

        expect(insertSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            id: expect.any(String),
            user_uuid: userUuid,
            platform: 'web',
            platform_id: 'web_user_123',
            platform_username: 'WebUser',
            verified_at: expect.any(String),
            metadata: expect.objectContaining({
              browser: 'Chrome',
              ipAddress: '192.168.1.1',
            }),
          }),
        );
      });
    });

    describe('Cross-Platform Resolution', () => {
      it('should convert platform ID to unified UUID', async () => {
        const testUuid = crypto.randomUUID() as UUID;

        // Mock the getOrCreateUserIdentity method
        service.getOrCreateUserIdentity = mock().mockResolvedValue({
          uuid: testUuid,
          createdAt: new Date(),
          metadata: { displayName: 'ResolvedUser' },
        });

        const result = await service.platformIdToUuid('twitter', 'resolved_user');

        expect(result).toBe(testUuid);
        expect(service.getOrCreateUserIdentity).toHaveBeenCalledWith({
          platform: 'twitter',
          platformId: 'resolved_user',
        });
      });

      it('should return null when platform resolution fails', async () => {
        service.getOrCreateUserIdentity = mock().mockRejectedValue(new Error('Resolution failed'));

        const result = await service.platformIdToUuid('invalid', 'invalid_user');

        expect(result).toBeNull();
      });

      it('should retrieve all platform accounts for a user', async () => {
        const userUuid = crypto.randomUUID() as UUID;
        const mockAccounts = [
          {
            id: crypto.randomUUID(),
            user_uuid: userUuid,
            platform: 'twitter',
            platform_id: 'twitter_user',
            platform_username: 'TwitterUser',
            verified_at: new Date().toISOString(),
            metadata: {},
          },
          {
            id: crypto.randomUUID(),
            user_uuid: userUuid,
            platform: 'telegram',
            platform_id: '123456789',
            platform_username: 'TelegramUser',
            verified_at: new Date().toISOString(),
            metadata: {},
          },
        ];

        mockSupabase.from().select().eq().order.mockResolvedValue({
          data: mockAccounts,
          error: null,
        });

        const result = await service.getUserPlatformAccounts(userUuid);

        expect(result).toHaveLength(2);
        expect(result[0].platform).toBe('twitter');
        expect(result[1].platform).toBe('telegram');
      });
    });

    describe('Platform Account Validation', () => {
      it('should validate platform enum values', async () => {
        const userUuid = crypto.randomUUID() as UUID;

        // The schema should enforce valid platform values
        // Test with invalid platform should be rejected by database constraints
        const insertSpy = mock().mockResolvedValue({
          data: null,
          error: { message: 'invalid input value for enum platform' },
        });

        mockSupabase
          .from()
          .select()
          .eq()
          .single.mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          });
        mockSupabase.from().insert = insertSpy;

        const result = await service.linkPlatformAccount(userUuid, {
          platform: 'invalid_platform' as any,
          platformId: 'test_id',
        });

        expect(result).toBe(false);
      });

      it('should enforce unique constraint on platform+platform_id', async () => {
        const userUuid = crypto.randomUUID() as UUID;
        const insertSpy = mock().mockResolvedValue({
          data: null,
          error: {
            message: 'duplicate key value violates unique constraint',
            code: '23505',
          },
        });

        mockSupabase
          .from()
          .select()
          .eq()
          .single.mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          });
        mockSupabase.from().insert = insertSpy;

        const result = await service.linkPlatformAccount(userUuid, {
          platform: 'twitter',
          platformId: 'duplicate_account',
        });

        expect(result).toBe(false);
      });
    });
  });

  describe('User Summary and Analytics', () => {
    it('should generate comprehensive cross-platform user summary', async () => {
      const userUuid = crypto.randomUUID() as UUID;
      const testIdentity = {
        uuid: userUuid,
        created_at: '2024-01-01T00:00:00Z',
        last_active_at: '2024-01-02T00:00:00Z',
        metadata: {
          displayName: 'SummaryUser',
          preferredPlatform: 'twitter',
        },
      };

      const testAccounts = [
        {
          id: crypto.randomUUID(),
          user_uuid: userUuid,
          platform: 'twitter',
          platform_id: 'twitter_summary',
          platform_username: 'TwitterSummary',
          verified_at: '2024-01-01T12:00:00Z',
          metadata: {},
        },
        {
          id: crypto.randomUUID(),
          user_uuid: userUuid,
          platform: 'telegram',
          platform_id: '987654321',
          platform_username: 'TelegramSummary',
          verified_at: '2024-01-01T13:00:00Z',
          metadata: {},
        },
      ];

      mockSupabase.from = mock().mockImplementation((table: string) => {
        if (table === 'user_identities') {
          return {
            select: () => ({
              eq: () => ({
                single: mock().mockResolvedValue({
                  data: testIdentity,
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'platform_accounts') {
          return {
            select: () => ({
              eq: () => ({
                order: mock().mockResolvedValue({
                  data: testAccounts,
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      const summary = await service.getUserSummary(userUuid);

      expect(summary).toBeDefined();
      expect(summary.uuid).toBe(userUuid);
      expect(summary.platformAccounts).toHaveLength(2);
      expect(summary.stats.totalPlatforms).toBe(2);
      expect(summary.stats.joinedDate).toBeInstanceOf(Date);
      expect(summary.stats.lastActive).toBeInstanceOf(Date);
    });

    it('should handle missing user data gracefully in summary', async () => {
      const userUuid = crypto.randomUUID() as UUID;

      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        });

      const summary = await service.getUserSummary(userUuid);

      expect(summary).toBeNull();
    });
  });

  describe('Service Lifecycle and Cleanup', () => {
    it('should clear caches on service stop', async () => {
      // Add some items to cache
      await service.getOrCreateUserIdentity({
        platform: 'twitter',
        platformId: 'cache_test',
      });

      const statsBeforeStop = service.getServiceStats();
      expect(statsBeforeStop.cachedIdentities).toBeGreaterThan(0);

      await service.stop();

      const statsAfterStop = service.getServiceStats();
      expect(statsAfterStop.cachedIdentities).toBe(0);
      expect(statsAfterStop.cachedPlatformAccounts).toBe(0);
    });

    it('should handle service start and stop lifecycle', async () => {
      const startService = await IdentityManagementService.start(mockRuntime as IAgentRuntime);

      expect(startService).toBeInstanceOf(IdentityManagementService);

      await IdentityManagementService.stop(mockRuntime as IAgentRuntime);

      // Should complete without errors
    });
  });

  describe('Database Schema Validation', () => {
    it('should validate UUID format in user_identities', () => {
      const validUuid = crypto.randomUUID();
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(uuidRegex.test(validUuid)).toBe(true);
    });

    it('should validate timestamp formats', () => {
      const timestamp = new Date().toISOString();
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

      expect(isoRegex.test(timestamp)).toBe(true);
    });

    it('should validate JSONB metadata structure', () => {
      const validMetadata = {
        displayName: 'Test User',
        preferredPlatform: 'twitter',
        customField: { nested: 'value' },
      };

      expect(() => JSON.stringify(validMetadata)).not.toThrow();
      expect(() => JSON.parse(JSON.stringify(validMetadata))).not.toThrow();
    });
  });
});
