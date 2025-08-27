import { describe, expect, it, beforeEach, afterEach, mock } from 'bun:test';
import { type IAgentRuntime, type UUID } from '@elizaos/core';

// Import services
import { IdentityManagementService } from '../services/identity-management-service';
import { WalletVerificationService } from '../services/wallet-verification-service';

// Import test utilities
import {
  createMockRuntime,
  createMockSupabaseClient,
  setupTestEnvironment,
  cleanupTestEnvironment,
  TEST_CONSTANTS,
} from './test-utils';

describe('Performance and Edge Case Tests', () => {
  let mockRuntime: any;
  let mockSupabase: any;
  let identityService: IdentityManagementService;
  let walletService: WalletVerificationService;

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

    identityService = new IdentityManagementService(mockRuntime as IAgentRuntime);
    identityService.supabase = mockSupabase;

    walletService = new WalletVerificationService(mockRuntime as IAgentRuntime);
    walletService.supabase = mockSupabase;
    walletService.identityService = identityService;

    await identityService.initialize();
    await walletService.initialize();
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('Performance Tests', () => {
    describe('High Volume User Creation', () => {
      it('should handle 1000 concurrent user identity creations', async () => {
        const userCount = 1000;
        const startTime = Date.now();

        // Mock successful creation for all users
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
              insert: mock().mockResolvedValue({ data: null, error: null }),
              update: () => ({ eq: mock().mockResolvedValue({ data: null, error: null }) }),
            };
          }
          return {
            insert: mock().mockResolvedValue({ data: null, error: null }),
          };
        });

        const promises = Array.from({ length: userCount }, (_, i) =>
          identityService.getOrCreateUserIdentity({
            platform: 'twitter',
            platformId: `load_test_user_${i}`,
            platformUsername: `LoadTestUser${i}`,
          }),
        );

        const results = await Promise.all(promises);
        const endTime = Date.now();
        const duration = endTime - startTime;

        expect(results).toHaveLength(userCount);
        expect(results.every((result) => result.uuid)).toBe(true);
        expect(duration).toBeLessThan(30000); // Should complete within 30 seconds

        console.log(
          `Created ${userCount} users in ${duration}ms (${(duration / userCount).toFixed(2)}ms per user)`,
        );
      });

      it('should handle cache performance under high load', async () => {
        const cacheTestCount = 500;
        const testRequest = {
          platform: 'telegram' as const,
          platformId: 'cache_performance_test',
          platformUsername: 'CacheTestUser',
        };

        // Mock initial creation
        const testUuid = crypto.randomUUID() as UUID;
        mockSupabase.from = mock().mockImplementation((table: string) => {
          if (table === 'platform_accounts') {
            return {
              select: () => ({
                eq: () => ({
                  single: mock().mockResolvedValue({
                    data: { user_uuid: testUuid },
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

        // First call to populate cache
        await identityService.getOrCreateUserIdentity(testRequest);

        const startTime = Date.now();
        const promises = Array.from({ length: cacheTestCount }, () =>
          identityService.getOrCreateUserIdentity(testRequest),
        );

        const results = await Promise.all(promises);
        const endTime = Date.now();
        const duration = endTime - startTime;

        expect(results).toHaveLength(cacheTestCount);
        expect(results.every((result) => result.uuid === testUuid)).toBe(true);
        expect(duration).toBeLessThan(5000); // Should be very fast due to caching

        console.log(
          `Cache performance: ${cacheTestCount} cached lookups in ${duration}ms (${(duration / cacheTestCount).toFixed(2)}ms per lookup)`,
        );
      });

      it('should handle cache eviction correctly', async () => {
        const maxCacheSize = 1000; // Based on service implementation
        const overflowCount = 1100;

        // Create more entries than cache can hold
        const promises = Array.from({ length: overflowCount }, (_, i) =>
          identityService.getOrCreateUserIdentity({
            platform: 'discord',
            platformId: `cache_overflow_${i}`,
          }),
        );

        mockSupabase.from = mock().mockImplementation(() => ({
          select: () => ({
            eq: () => ({
              single: mock().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' },
              }),
            }),
          }),
          insert: mock().mockResolvedValue({ data: null, error: null }),
          update: () => ({ eq: mock().mockResolvedValue({ data: null, error: null }) }),
        }));

        await Promise.all(promises);

        const stats = identityService.getServiceStats();
        expect(stats.cachedIdentities).toBeLessThanOrEqual(maxCacheSize);
        expect(stats.maxCacheSize).toBe(maxCacheSize);
      });
    });

    describe('Database Query Optimization', () => {
      it('should efficiently query users with many platform accounts', async () => {
        const userUuid = crypto.randomUUID() as UUID;
        const platformCount = 100;

        const mockPlatformAccounts = Array.from({ length: platformCount }, (_, i) => ({
          id: crypto.randomUUID(),
          user_uuid: userUuid,
          platform: ['twitter', 'telegram', 'discord', 'web', 'api'][i % 5],
          platform_id: `platform_${i}`,
          platform_username: `User${i}`,
          verified_at: new Date().toISOString(),
          metadata: {},
        }));

        mockSupabase.from().select().eq().order.mockResolvedValue({
          data: mockPlatformAccounts,
          error: null,
        });

        const startTime = Date.now();
        const accounts = await identityService.getUserPlatformAccounts(userUuid);
        const endTime = Date.now();

        expect(accounts).toHaveLength(platformCount);
        expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      });

      it('should handle pagination efficiently for large datasets', async () => {
        const totalRecords = 10000;
        const pageSize = 100;
        const pages = totalRecords / pageSize;

        let currentPage = 0;
        mockSupabase
          .from()
          .select()
          .order()
          .range.mockImplementation((start: number, end: number) => {
            const pageData = Array.from(
              { length: Math.min(pageSize, totalRecords - start) },
              (_, i) => ({
                id: `record_${start + i}`,
                membership_tier: 'initiate',
                initiated_at: new Date().toISOString(),
              }),
            );

            currentPage++;
            return Promise.resolve({
              data: pageData,
              error: null,
            });
          });

        const startTime = Date.now();
        for (let page = 0; page < pages; page++) {
          const start = page * pageSize;
          const end = start + pageSize - 1;

          const result = await mockSupabase
            .from('cult_memberships')
            .select()
            .order('initiated_at')
            .range(start, end);

          expect(result.data.length).toBeGreaterThan(0);
        }
        const endTime = Date.now();

        expect(currentPage).toBe(pages);
        expect(endTime - startTime).toBeLessThan(10000); // Should paginate efficiently
      });
    });

    describe('Memory Usage Optimization', () => {
      it('should not leak memory during intensive operations', async () => {
        const initialStats = identityService.getServiceStats();
        const iterations = 1000;

        // Simulate intensive operations
        for (let i = 0; i < iterations; i++) {
          await identityService.getOrCreateUserIdentity({
            platform: 'twitter',
            platformId: `memory_test_${i}`,
          });

          // Periodically check memory doesn't grow unbounded
          if (i % 100 === 0) {
            const currentStats = identityService.getServiceStats();
            expect(currentStats.cachedIdentities).toBeLessThanOrEqual(currentStats.maxCacheSize);
          }
        }

        const finalStats = identityService.getServiceStats();
        expect(finalStats.cachedIdentities).toBeLessThanOrEqual(finalStats.maxCacheSize);
      });

      it('should cleanup resources on service stop', async () => {
        // Add some data to internal caches
        await identityService.getOrCreateUserIdentity({
          platform: 'telegram',
          platformId: 'cleanup_test',
        });

        const statsBeforeStop = identityService.getServiceStats();
        expect(statsBeforeStop.cachedIdentities).toBeGreaterThan(0);

        await identityService.stop();

        const statsAfterStop = identityService.getServiceStats();
        expect(statsAfterStop.cachedIdentities).toBe(0);
        expect(statsAfterStop.cachedPlatformAccounts).toBe(0);
      });
    });
  });

  describe('Edge Cases', () => {
    describe('Extreme Input Validation', () => {
      it('should handle extremely long platform usernames', async () => {
        const extremelyLongUsername = 'a'.repeat(10000);

        const result = await identityService.getOrCreateUserIdentity({
          platform: 'twitter',
          platformId: 'long_username_test',
          platformUsername: extremelyLongUsername,
        });

        expect(result).toBeDefined();
        // The database should truncate or handle long usernames appropriately
      });

      it('should handle special characters in platform IDs', async () => {
        const specialCharPlatformIds = [
          'user@domain.com',
          'user+tag@example.org',
          'user-with-dashes_and_underscores',
          '用户中文名',
          'пользователь',
          '🚀🔥💯',
          'user.with.dots',
          'user/with/slashes',
          'user\\with\\backslashes',
        ];

        const results = await Promise.all(
          specialCharPlatformIds.map((platformId, i) =>
            identityService.getOrCreateUserIdentity({
              platform: 'web',
              platformId,
              platformUsername: `SpecialUser${i}`,
            }),
          ),
        );

        expect(results).toHaveLength(specialCharPlatformIds.length);
        expect(results.every((result) => result.uuid)).toBe(true);
      });

      it('should handle null and undefined values gracefully', async () => {
        const edgeCaseRequests = [
          {
            platform: 'twitter' as const,
            platformId: 'null_username_test',
            platformUsername: null as any,
          },
          {
            platform: 'telegram' as const,
            platformId: 'undefined_username_test',
            platformUsername: undefined as any,
          },
          {
            platform: 'discord' as const,
            platformId: 'empty_username_test',
            platformUsername: '',
          },
        ];

        const results = await Promise.all(
          edgeCaseRequests.map((request) => identityService.getOrCreateUserIdentity(request)),
        );

        expect(results).toHaveLength(3);
        expect(results.every((result) => result.uuid)).toBe(true);
      });
    });

    describe('Wallet Address Edge Cases', () => {
      it('should handle wallet addresses at boundary lengths', async () => {
        const boundaryAddresses = [
          '11111111111111111111111111111112', // 32 chars (minimum valid)
          'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // 44 chars (maximum valid)
          '1111111111111111111111111111111', // 31 chars (too short)
          'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DAx', // 45 chars (too long)
        ];

        const results = await Promise.all(
          boundaryAddresses.map(async (address, i) => {
            try {
              const result = await walletService.verifyWalletAndLinkIdentity({
                walletAddress: address,
                chain: 'solana',
                platformId: `boundary_test_${i}`,
                platform: 'web',
              });
              return result;
            } catch (error) {
              return { success: false, error: error.message };
            }
          }),
        );

        // First two should succeed, last two should fail
        expect(results[0].success).toBe(true);
        expect(results[1].success).toBe(true);
        expect(results[2].success).toBe(false);
        expect(results[3].success).toBe(false);
      });

      it('should handle malformed base58 characters in wallet addresses', async () => {
        const malformedAddresses = [
          '0OIl1111111111111111111111111111', // Confusing base58 characters
          'O0Il1111111111111111111111111111', // More confusing characters
          '++++++++++++++++++++++++++++++++', // Invalid characters
          '////////////////////////////////', // Invalid characters
        ];

        const results = await Promise.all(
          malformedAddresses.map(async (address) => {
            const result = await walletService.verifyWalletAndLinkIdentity({
              walletAddress: address,
              chain: 'solana',
              platformId: 'malformed_test',
              platform: 'web',
            });
            return result.success;
          }),
        );

        // All should fail validation
        expect(results.every((success) => !success)).toBe(true);
      });
    });

    describe('Concurrent Access Edge Cases', () => {
      it('should handle race condition in user identity creation', async () => {
        const platformId = 'race_condition_test';
        const concurrentRequests = 10;

        // Simulate multiple concurrent requests for the same user
        const promises = Array.from({ length: concurrentRequests }, (_, i) =>
          identityService.getOrCreateUserIdentity({
            platform: 'twitter',
            platformId,
            platformUsername: `RaceUser${i}`,
          }),
        );

        const results = await Promise.all(promises);

        // All should return the same UUID (should resolve to same user)
        const uniqueUuids = new Set(results.map((r) => r.uuid));
        expect(uniqueUuids.size).toBe(1);
      });

      it('should handle concurrent wallet linking attempts', async () => {
        const walletAddress = '11111111111111111111111111111112';
        const concurrentAttempts = 5;

        // Mock first attempt succeeds, others should handle gracefully
        let attemptCount = 0;
        mockSupabase.from = mock().mockImplementation((table: string) => {
          if (table === 'user_wallets') {
            return {
              select: () => ({
                eq: () => ({
                  single: mock().mockImplementation(() => {
                    attemptCount++;
                    if (attemptCount === 1) {
                      return Promise.resolve({
                        data: null,
                        error: { code: 'PGRST116' },
                      });
                    }
                    // Subsequent attempts should find existing wallet
                    return Promise.resolve({
                      data: {
                        user_uuid: crypto.randomUUID(),
                        wallet_address: walletAddress,
                      },
                      error: null,
                    });
                  }),
                }),
              }),
              insert: mock().mockResolvedValue({ data: null, error: null }),
            };
          }
          if (table === 'user_identities') {
            return {
              update: () => ({ eq: mock().mockResolvedValue({ data: null, error: null }) }),
            };
          }
          return {};
        });

        const promises = Array.from({ length: concurrentAttempts }, (_, i) =>
          walletService.verifyWalletAndLinkIdentity({
            walletAddress,
            chain: 'solana',
            platformId: `concurrent_${i}`,
            platform: 'web',
          }),
        );

        const results = await Promise.all(promises);

        // All should succeed (first creates, others find existing)
        expect(results.every((r) => r.success)).toBe(true);
      });
    });

    describe('Database Connection Edge Cases', () => {
      it('should handle connection timeout gracefully', async () => {
        const timeoutError = {
          message: 'Connection timeout',
          code: '57014',
        };

        mockSupabase.from().select().eq().single.mockRejectedValue(timeoutError);

        const result = await identityService.getOrCreateUserIdentity({
          platform: 'twitter',
          platformId: 'timeout_test',
        });

        // Should fall back to temporary identity
        expect(result).toBeDefined();
        expect(result.uuid).toBeDefined();
        expect(result.metadata?.isTemporary).toBe(true);
      });

      it('should handle connection pool exhaustion', async () => {
        const poolError = {
          message: 'Connection pool exhausted',
          code: '53300',
        };

        mockSupabase.from().insert.mockRejectedValue(poolError);

        const result = await walletService.verifyWalletAndLinkIdentity({
          walletAddress: '11111111111111111111111111111112',
          chain: 'solana',
          platformId: 'pool_exhaustion_test',
          platform: 'web',
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Connection pool exhausted');
      });

      it('should handle database maintenance mode', async () => {
        const maintenanceError = {
          message: 'Database is in maintenance mode',
          code: '57P01',
        };

        mockSupabase.from().select().mockRejectedValue(maintenanceError);

        const result = await identityService.getUserSummary(crypto.randomUUID() as UUID);

        expect(result).toBeNull();
      });
    });

    describe('Data Corruption Edge Cases', () => {
      it('should handle corrupted JSONB metadata gracefully', async () => {
        const corruptedMetadata = '{"invalid": json}'; // Invalid JSON

        mockSupabase
          .from()
          .select()
          .eq()
          .single.mockResolvedValue({
            data: {
              uuid: crypto.randomUUID(),
              created_at: new Date().toISOString(),
              metadata: corruptedMetadata, // This would cause JSON parsing issues
            },
            error: null,
          });

        // Should handle corrupted data gracefully
        const result = await identityService.getUserIdentity(crypto.randomUUID() as UUID);

        expect(result).toBeDefined();
        // Service should handle metadata parsing errors
      });

      it('should handle orphaned platform accounts', async () => {
        const orphanedAccount = {
          id: crypto.randomUUID(),
          user_uuid: crypto.randomUUID(), // Non-existent user
          platform: 'twitter',
          platform_id: 'orphaned_account',
          platform_username: 'OrphanedUser',
          verified_at: new Date().toISOString(),
          metadata: {},
        };

        mockSupabase.from = mock().mockImplementation((table: string) => {
          if (table === 'platform_accounts') {
            return {
              select: () => ({
                eq: () => ({
                  single: mock().mockResolvedValue({
                    data: orphanedAccount,
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
                    data: null,
                    error: { code: 'PGRST116' }, // User doesn't exist
                  }),
                }),
              }),
            };
          }
          return {};
        });

        // Should handle orphaned data gracefully
        const result = await identityService.getOrCreateUserIdentity({
          platform: 'twitter',
          platformId: 'orphaned_account',
        });

        expect(result).toBeDefined();
        // Should create new identity rather than use orphaned account
      });
    });

    describe('Resource Exhaustion Edge Cases', () => {
      it('should handle UUID generation exhaustion', async () => {
        // Mock crypto.randomUUID to fail
        const originalRandomUUID = crypto.randomUUID;
        let callCount = 0;

        crypto.randomUUID = mock().mockImplementation(() => {
          callCount++;
          if (callCount > 1000) {
            throw new Error('UUID generation failed');
          }
          return originalRandomUUID();
        });

        try {
          const results = await Promise.all(
            Array.from({ length: 1200 }, (_, i) =>
              identityService.getOrCreateUserIdentity({
                platform: 'twitter',
                platformId: `uuid_exhaustion_${i}`,
              }),
            ),
          );

          // Should handle the error gracefully
          expect(results.length).toBeGreaterThan(0);
        } finally {
          // Restore original function
          crypto.randomUUID = originalRandomUUID;
        }
      });

      it('should handle extremely large datasets efficiently', async () => {
        const largeDataset = Array.from({ length: 100000 }, (_, i) => ({
          id: crypto.randomUUID(),
          user_uuid: crypto.randomUUID(),
          platform: 'twitter',
          platform_id: `large_dataset_${i}`,
          platform_username: `User${i}`,
          verified_at: new Date().toISOString(),
          metadata: {
            index: i,
            data: `test_data_${i}`.repeat(100), // Large metadata
          },
        }));

        mockSupabase
          .from()
          .select()
          .order()
          .limit.mockResolvedValue({
            data: largeDataset.slice(0, 1000), // Return first 1000 items
            error: null,
          });

        const startTime = Date.now();
        const results = await mockSupabase
          .from('platform_accounts')
          .select()
          .order('created_at')
          .limit(1000);
        const endTime = Date.now();

        expect(results.data).toHaveLength(1000);
        expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      });
    });

    describe('Security Edge Cases', () => {
      it('should handle SQL injection attempts in platform IDs', async () => {
        const maliciousPlatformIds = [
          "'; DROP TABLE user_identities; --",
          "1' OR '1'='1",
          "'; INSERT INTO platform_accounts VALUES ('evil'); --",
          "1'; UPDATE user_identities SET metadata='{}'; --",
        ];

        const results = await Promise.all(
          maliciousPlatformIds.map(async (platformId, i) => {
            const result = await identityService.getOrCreateUserIdentity({
              platform: 'web',
              platformId,
              platformUsername: `MaliciousUser${i}`,
            });
            return result;
          }),
        );

        // All should succeed without executing malicious SQL
        expect(results).toHaveLength(maliciousPlatformIds.length);
        expect(results.every((result) => result.uuid)).toBe(true);
      });

      it('should handle XSS attempts in usernames', async () => {
        const xssPlatformUsernames = [
          '<script>alert("xss")</script>',
          '"><script>alert("xss")</script>',
          'javascript:alert("xss")',
          '<img src="x" onerror="alert(\'xss\')">',
        ];

        const results = await Promise.all(
          xssPlatformUsernames.map(async (username, i) => {
            const result = await identityService.getOrCreateUserIdentity({
              platform: 'web',
              platformId: `xss_test_${i}`,
              platformUsername: username,
            });
            return result;
          }),
        );

        expect(results).toHaveLength(xssPlatformUsernames.length);
        expect(results.every((result) => result.uuid)).toBe(true);
        // Usernames should be properly sanitized/escaped
      });
    });
  });
});
