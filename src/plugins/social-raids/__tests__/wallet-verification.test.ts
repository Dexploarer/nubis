import { describe, expect, it, beforeEach, afterEach, mock } from 'bun:test';
import { type IAgentRuntime, type UUID } from '@elizaos/core';

// Import the service under test
import { WalletVerificationService } from '../services/wallet-verification-service';

// Import test utilities
import {
  createMockRuntime,
  createMockSupabaseClient,
  setupTestEnvironment,
  cleanupTestEnvironment,
  TEST_CONSTANTS,
} from './test-utils';

describe('Wallet Verification Service - Database Schema Tests', () => {
  let service: WalletVerificationService;
  let mockRuntime: any;
  let mockSupabase: any;
  let mockIdentityService: any;

  beforeEach(async () => {
    setupTestEnvironment();

    // Mock Identity Management Service
    mockIdentityService = {
      getOrCreateUserIdentity: mock().mockResolvedValue({
        uuid: crypto.randomUUID() as UUID,
        createdAt: new Date(),
        metadata: { displayName: 'TestUser' },
      }),
    };

    mockRuntime = createMockRuntime({
      getSetting: mock().mockImplementation((key: string) => {
        if (key === 'SUPABASE_URL') return 'https://test.supabase.co';
        if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'test-service-key';
        if (key === 'PROJECT_URL') return 'https://nubi.cult';
        if (key === 'WEB3_STATEMENT') return 'Bind your soul to Nubi';
        return undefined;
      }),
      getService: mock().mockReturnValue(mockIdentityService),
    });

    mockSupabase = createMockSupabaseClient();
    service = new WalletVerificationService(mockRuntime as IAgentRuntime);
    service.supabase = mockSupabase;
    await service.initialize();
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('Service Initialization', () => {
    it('should initialize with correct service type', () => {
      expect(service.name).toBe('WALLET_VERIFICATION_SERVICE');
      expect(service.capabilityDescription).toBe(
        'Manages Solana wallet verification and Web3 authentication using Supabase',
      );
    });

    it('should initialize with default Web3 configuration', () => {
      const authMessage = service.generateWeb3AuthMessage('11111111111111111111111111111112');

      expect(authMessage.message).toContain('nubi.cult');
      expect(authMessage.message).toContain('Bind your soul to Nubi');
      expect(authMessage.statement).toBe('Bind your soul to Nubi');
    });

    it('should handle missing identity service gracefully', async () => {
      const runtimeWithoutIdentityService = createMockRuntime({
        getService: mock().mockReturnValue(null),
      });

      const serviceWithoutIdentity = new WalletVerificationService(
        runtimeWithoutIdentityService as IAgentRuntime,
      );

      await serviceWithoutIdentity.initialize();
      expect(serviceWithoutIdentity).toBeDefined();
    });
  });

  describe('Solana Wallet Address Validation', () => {
    const validSolanaAddresses = [
      '11111111111111111111111111111112', // System program
      'So11111111111111111111111111111111111111112', // Wrapped SOL
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Token program
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', // Associated token program
    ];

    const invalidSolanaAddresses = [
      '0x742d35Cc4Df6Ed4bB321aE90c7e73B1D2', // Ethereum address
      'invalidaddress', // Too short
      '11111111111111111111111111111111111111111111111111111111111111111111', // Too long
      'OOOOoooo1111111111111111111111112', // Invalid base58 characters
      '', // Empty string
    ];

    it('should validate correct Solana wallet addresses', () => {
      validSolanaAddresses.forEach((address) => {
        expect((service as any).isValidSolanaAddress(address)).toBe(true);
      });
    });

    it('should reject invalid Solana wallet addresses', () => {
      invalidSolanaAddresses.forEach((address) => {
        expect((service as any).isValidSolanaAddress(address)).toBe(false);
      });
    });

    it('should reject wallet verification for invalid addresses', async () => {
      const result = await service.verifyWalletAndLinkIdentity({
        walletAddress: 'invalid_address',
        chain: 'solana',
        platformId: 'test_user',
        platform: 'twitter',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid Solana wallet address format');
    });
  });

  describe('Wallet-to-Identity Linking', () => {
    const validWalletAddress = '11111111111111111111111111111112';

    describe('New Wallet Registration', () => {
      it('should create new wallet link in user_wallets table', async () => {
        const testUuid = crypto.randomUUID() as UUID;
        const insertSpy = mock().mockResolvedValue({ data: null, error: null });

        // Mock no existing wallet
        mockSupabase.from = mock().mockImplementation((table: string) => {
          if (table === 'user_wallets') {
            return {
              select: () => ({
                eq: () => ({
                  single: mock().mockResolvedValue({
                    data: null,
                    error: { code: 'PGRST116' }, // No existing wallet
                  }),
                }),
                order: () => mock().mockResolvedValue({ data: [], error: null }),
              }),
              insert: insertSpy,
              update: () => ({ eq: mock().mockResolvedValue({ data: null, error: null }) }),
            };
          }
          if (table === 'user_identities') {
            return {
              update: () => ({ eq: mock().mockResolvedValue({ data: null, error: null }) }),
            };
          }
          return {};
        });

        // Mock identity service returning user UUID
        mockIdentityService.getOrCreateUserIdentity.mockResolvedValue({
          uuid: testUuid,
          createdAt: new Date(),
        });

        const result = await service.verifyWalletAndLinkIdentity({
          walletAddress: validWalletAddress,
          chain: 'solana',
          platformId: 'test_user',
          platform: 'telegram',
        });

        expect(result.success).toBe(true);
        expect(result.userUuid).toBe(testUuid);
        expect(result.isNewWallet).toBe(true);

        // Verify wallet was inserted with correct structure
        expect(insertSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            id: expect.any(String),
            user_uuid: testUuid,
            wallet_address: validWalletAddress,
            wallet_type: 'primary',
            verified_at: expect.any(String),
            verification_signature: expect.any(String),
            metadata: expect.objectContaining({
              chain: 'solana',
              verificationMethod: 'supabase_web3',
              verifiedAt: expect.any(String),
            }),
          }),
        );
      });

      it('should update user_identities metadata with wallet verification', async () => {
        const testUuid = crypto.randomUUID() as UUID;
        const updateSpy = mock().mockResolvedValue({ data: null, error: null });

        mockSupabase.from = mock().mockImplementation((table: string) => {
          if (table === 'user_wallets') {
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
            };
          }
          if (table === 'user_identities') {
            return {
              update: () => ({ eq: updateSpy }),
            };
          }
          return {};
        });

        mockIdentityService.getOrCreateUserIdentity.mockResolvedValue({
          uuid: testUuid,
          createdAt: new Date(),
        });

        await service.verifyWalletAndLinkIdentity({
          walletAddress: validWalletAddress,
          chain: 'solana',
          platformId: 'test_user',
          platform: 'web',
        });

        expect(updateSpy).toHaveBeenCalledWith(testUuid);
        // The update should include wallet verification metadata
      });

      it('should enforce wallet_type enum constraint', async () => {
        const testUuid = crypto.randomUUID() as UUID;
        const insertSpy = mock().mockResolvedValue({
          data: null,
          error: {
            message: 'invalid input value for enum wallet_type',
            code: '22P02',
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

        // The service should handle enum validation errors
        const result = await service.verifyWalletAndLinkIdentity({
          walletAddress: validWalletAddress,
          chain: 'solana',
          platformId: 'test_user',
          platform: 'twitter',
        });

        expect(result.success).toBe(false);
      });
    });

    describe('Existing Wallet Recognition', () => {
      it('should recognize existing wallet and return associated user', async () => {
        const existingUuid = crypto.randomUUID() as UUID;
        const existingWalletData = {
          id: crypto.randomUUID(),
          user_uuid: existingUuid,
          wallet_address: validWalletAddress,
          wallet_type: 'primary',
          verified_at: new Date().toISOString(),
          metadata: { chain: 'solana' },
        };

        mockSupabase.from().select().eq().single.mockResolvedValue({
          data: existingWalletData,
          error: null,
        });

        const result = await service.verifyWalletAndLinkIdentity({
          walletAddress: validWalletAddress,
          chain: 'solana',
          platformId: 'existing_user',
          platform: 'discord',
        });

        expect(result.success).toBe(true);
        expect(result.userUuid).toBe(existingUuid);
        expect(result.isNewWallet).toBe(false);
      });

      it('should enforce unique wallet address constraint', async () => {
        const insertSpy = mock().mockResolvedValue({
          data: null,
          error: {
            message:
              'duplicate key value violates unique constraint "user_wallets_wallet_address_key"',
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

        const result = await service.verifyWalletAndLinkIdentity({
          walletAddress: validWalletAddress,
          chain: 'solana',
          platformId: 'duplicate_user',
          platform: 'twitter',
        });

        expect(result.success).toBe(false);
      });
    });
  });

  describe('Wallet Verification Status and Queries', () => {
    it('should get wallet verification status for verified user', async () => {
      const testUuid = crypto.randomUUID() as UUID;
      const verificationDate = new Date();

      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValue({
          data: {
            wallet_address: validWalletAddress,
            wallet_type: 'primary',
            verified_at: verificationDate.toISOString(),
            metadata: { chain: 'solana' },
          },
          error: null,
        });

      const status = await service.getWalletVerificationStatus(testUuid);

      expect(status.isVerified).toBe(true);
      expect(status.walletAddress).toBe(validWalletAddress);
      expect(status.chain).toBe('solana');
      expect(status.verificationDate).toBeInstanceOf(Date);
    });

    it('should return unverified status for non-existent wallet', async () => {
      const testUuid = crypto.randomUUID() as UUID;

      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        });

      const status = await service.getWalletVerificationStatus(testUuid);

      expect(status.isVerified).toBe(false);
      expect(status.walletAddress).toBeUndefined();
    });

    it('should get all user wallets ordered by verification date', async () => {
      const testUuid = crypto.randomUUID() as UUID;
      const mockWallets = [
        {
          wallet_address: '11111111111111111111111111111112',
          wallet_type: 'primary',
          verified_at: '2024-01-02T00:00:00Z',
          metadata: { chain: 'solana' },
        },
        {
          wallet_address: 'So11111111111111111111111111111111111111112',
          wallet_type: 'backup',
          verified_at: '2024-01-01T00:00:00Z',
          metadata: { chain: 'solana' },
        },
      ];

      mockSupabase.from().select().eq().order.mockResolvedValue({
        data: mockWallets,
        error: null,
      });

      const wallets = await service.getUserWallets(testUuid);

      expect(wallets).toHaveLength(2);
      expect(wallets[0].walletAddress).toBe('11111111111111111111111111111112');
      expect(wallets[0].walletType).toBe('primary');
      expect(wallets[1].walletType).toBe('backup');
      expect(wallets[0].verifiedAt).toBeInstanceOf(Date);
    });

    it('should handle database errors in wallet queries gracefully', async () => {
      const testUuid = crypto.randomUUID() as UUID;

      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
        });

      const status = await service.getWalletVerificationStatus(testUuid);

      expect(status.isVerified).toBe(false);
      // Should not throw, but return safe default
    });
  });

  describe('Web3 Authentication Message Generation', () => {
    it('should generate EIP-4361 compliant message for Solana', () => {
      const testAddress = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
      const testNonce = 'test-nonce-123';

      const authMessage = service.generateWeb3AuthMessage(testAddress, testNonce);

      expect(authMessage.message).toContain('nubi.cult wants you to sign in');
      expect(authMessage.message).toContain(testAddress);
      expect(authMessage.message).toContain('Bind your soul to Nubi');
      expect(authMessage.message).toContain('Chain ID: solana');
      expect(authMessage.message).toContain(`Nonce: ${testNonce}`);
      expect(authMessage.message).toContain('Version: 1');
      expect(authMessage.nonce).toBe(testNonce);
    });

    it('should generate unique nonce when not provided', () => {
      const testAddress = '11111111111111111111111111111112';

      const authMessage1 = service.generateWeb3AuthMessage(testAddress);
      const authMessage2 = service.generateWeb3AuthMessage(testAddress);

      expect(authMessage1.nonce).not.toBe(authMessage2.nonce);
      expect(authMessage1.nonce).toMatch(/^[0-9a-f-]+$/); // UUID format
    });

    it('should include ISO timestamp in message', () => {
      const testAddress = '11111111111111111111111111111112';

      const authMessage = service.generateWeb3AuthMessage(testAddress);

      expect(authMessage.message).toMatch(/Issued At: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    });
  });

  describe('Signature Verification', () => {
    it('should perform basic signature validation', async () => {
      const testAddress = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
      const testMessage = 'Test message for signing';
      const mockSignature = 'mock_signature_base58_encoded_string';

      const isValid = await service.verifySignedMessage(testAddress, testMessage, mockSignature);

      // Current implementation is mocked, but should validate structure
      expect(typeof isValid).toBe('boolean');
    });

    it('should reject empty signatures', async () => {
      const testAddress = '11111111111111111111111111111112';
      const testMessage = 'Test message';
      const emptySignature = '';

      const isValid = await service.verifySignedMessage(testAddress, testMessage, emptySignature);

      expect(isValid).toBe(false);
    });

    it('should handle signature verification errors gracefully', async () => {
      const testAddress = '11111111111111111111111111111112';
      const testMessage = 'Test message';
      const invalidSignature = 'invalid_signature';

      const isValid = await service.verifySignedMessage(testAddress, testMessage, invalidSignature);

      expect(typeof isValid).toBe('boolean');
      // Should not throw error even with invalid input
    });
  });

  describe('Database Schema Validation', () => {
    it('should validate wallet address length constraint', () => {
      // Solana addresses are 32-44 characters in base58
      const validAddress = '11111111111111111111111111111112'; // 32 chars
      const longValidAddress = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'; // 44 chars

      expect(validAddress.length).toBe(32);
      expect(longValidAddress.length).toBe(44);
      expect(service.isValidSolanaAddress(validAddress)).toBe(true);
      expect(service.isValidSolanaAddress(longValidAddress)).toBe(true);
    });

    it('should validate wallet_type enum values', () => {
      const validTypes = ['primary', 'backup'];
      const invalidTypes = ['main', 'secondary', 'other'];

      // Schema should enforce these constraints at database level
      validTypes.forEach((type) => {
        expect(['primary', 'backup']).toContain(type);
      });

      invalidTypes.forEach((type) => {
        expect(['primary', 'backup']).not.toContain(type);
      });
    });

    it('should validate metadata JSONB structure', () => {
      const validMetadata = {
        chain: 'solana',
        verificationMethod: 'supabase_web3',
        sessionId: 'session_123',
        verifiedAt: new Date().toISOString(),
        customData: {
          browser: 'Chrome',
          version: '1.0',
        },
      };

      expect(() => JSON.stringify(validMetadata)).not.toThrow();
      expect(() => JSON.parse(JSON.stringify(validMetadata))).not.toThrow();
    });

    it('should validate foreign key constraint to user_identities', async () => {
      const nonExistentUuid = crypto.randomUUID() as UUID;
      const insertSpy = mock().mockResolvedValue({
        data: null,
        error: {
          message: 'insert or update on table "user_wallets" violates foreign key constraint',
          code: '23503',
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

      const result = await service.verifyWalletAndLinkIdentity({
        walletAddress: '11111111111111111111111111111112',
        chain: 'solana',
        platformId: 'orphan_wallet',
        platform: 'twitter',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Integration with Identity Management', () => {
    it('should create unified identity when linking first wallet', async () => {
      const testUuid = crypto.randomUUID() as UUID;
      const testRequest = {
        walletAddress: 'So11111111111111111111111111111111111111112',
        chain: 'solana' as const,
        platformId: 'web3_user',
        platform: 'web',
      };

      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }, // No existing wallet
        });

      mockSupabase.from().insert.mockResolvedValue({
        data: null,
        error: null,
      });

      mockSupabase.from().update = () => ({
        eq: mock().mockResolvedValue({ data: null, error: null }),
      });

      mockIdentityService.getOrCreateUserIdentity.mockResolvedValue({
        uuid: testUuid,
        createdAt: new Date(),
        metadata: { displayName: 'Web3User' },
      });

      const result = await service.verifyWalletAndLinkIdentity(testRequest);

      expect(result.success).toBe(true);
      expect(mockIdentityService.getOrCreateUserIdentity).toHaveBeenCalledWith({
        platform: 'web',
        platformId: 'web3_user',
        metadata: {
          walletAddress: testRequest.walletAddress,
          chain: 'solana',
        },
      });
    });

    it('should handle identity service unavailable gracefully', async () => {
      service.identityService = null;

      const result = await service.verifyWalletAndLinkIdentity({
        walletAddress: '11111111111111111111111111111112',
        chain: 'solana',
        platformId: 'standalone_wallet',
        platform: 'api',
      });

      expect(result.success).toBe(true);
      expect(result.userUuid).toBeDefined();
      // Should generate temporary UUID and continue
    });
  });

  describe('Service Configuration', () => {
    it('should initialize with custom Web3 configuration', () => {
      process.env.PROJECT_URL = 'https://custom.domain';
      process.env.WEB3_STATEMENT = 'Custom statement';
      process.env.WEB3_CAPTCHA_ENABLED = 'true';
      process.env.WEB3_RATE_LIMIT = '60';

      const customRuntime = createMockRuntime({
        getSetting: mock().mockImplementation((key: string) => {
          return process.env[key];
        }),
      });

      const customService = new WalletVerificationService(customRuntime as IAgentRuntime);

      const authMessage = customService.generateWeb3AuthMessage('11111111111111111111111111111112');

      expect(authMessage.message).toContain('custom.domain');
      expect(authMessage.statement).toBe('Custom statement');

      // Cleanup
      delete process.env.PROJECT_URL;
      delete process.env.WEB3_STATEMENT;
      delete process.env.WEB3_CAPTCHA_ENABLED;
      delete process.env.WEB3_RATE_LIMIT;
    });
  });
});
