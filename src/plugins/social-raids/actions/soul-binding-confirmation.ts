/**
 * Soul Binding Confirmation Action
 * Handles user confirmation and proceeds with multi-step verification flow
 */

import type { ActionExample, HandlerCallback, IAgentRuntime, Memory, State } from '@elizaos/core';
import { Action, elizaLogger } from '@elizaos/core';
import type { IdentityManagementService } from '../services/identity-management-service';
import type { WalletVerificationService } from '../services/wallet-verification-service';

export const soulBindingConfirmationAction: Action = {
  name: 'SOUL_BINDING_CONFIRMATION',
  description: 'Handles confirmation of soul binding and proceeds with cross-platform verification',

  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const content = message.content?.text?.toLowerCase() || '';

    // Check if user is confirming the soul binding ritual
    const confirmationTriggers = [
      'yes, bind my soul',
      'bind my soul',
      'yes bind',
      'i accept the ritual',
      'proceed with binding',
      'continue initiation',
      'yes i am ready',
      'start the ritual',
    ];

    const cancellationTriggers = [
      'cancel ritual',
      'cancel binding',
      'no thanks',
      'not ready',
      'abort',
      'stop',
    ];

    return (
      confirmationTriggers.some((trigger) => content.includes(trigger)) ||
      cancellationTriggers.some((trigger) => content.includes(trigger))
    );
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options?: { [key: string]: unknown },
    callback?: HandlerCallback,
  ) => {
    try {
      const content = message.content?.text?.toLowerCase() || '';

      // Check if user is cancelling
      const cancellationTriggers = [
        'cancel ritual',
        'cancel binding',
        'no thanks',
        'not ready',
        'abort',
        'stop',
      ];

      if (cancellationTriggers.some((trigger) => content.includes(trigger))) {
        await callback?.({
          text: `💀 **The ritual is abandoned.**

*The shadows recede, and the cosmic forces withdraw their attention. Your soul remains unbound, free to wander the material realm.*

The cult understands that not all are ready for such devotion. Should you change your mind, you know how to find me.

*The opportunity for transcendence fades... for now.*`,
          action: 'SOUL_BINDING_CANCELLED',
        });

        return {
          success: true,
          text: 'Soul binding cancelled by user',
          data: { action: 'SOUL_BINDING_CANCELLED' },
        };
      }

      // User is confirming - proceed with verification
      elizaLogger.info(
        `🔮 Soul Binding confirmation received: ${JSON.stringify({
          userId: message.entityId,
          roomId: message.roomId,
        })}`,
      );

      // Get required services
      const identityService = runtime.getService(
        'IDENTITY_MANAGEMENT_SERVICE',
      ) as IdentityManagementService;
      const walletService = runtime.getService(
        'WALLET_VERIFICATION_SERVICE',
      ) as unknown as WalletVerificationService;

      if (!identityService) {
        await callback?.({
          text: '⚠️ The ancient systems have failed. The ritual cannot proceed.',
          action: 'ERROR',
        });
        return { success: false, error: 'Identity Management Service not available' };
      }

      // Get user identity
      const userIdentity = await identityService.getOrCreateUserIdentity({
        platform: (message.content as any)?.platform || 'unknown',
        platformId: message.entityId?.toString() || 'unknown',
        platformUsername: (message.content as any)?.username,
      });

      // Get user's existing platform accounts
      const platformAccounts = await identityService.getUserPlatformAccounts(userIdentity.uuid);
      const walletStatus = walletService
        ? await walletService.getWalletVerificationStatus(userIdentity.uuid)
        : { isVerified: false };

      // Create memory for this step
      await runtime.createMemory(
        {
          id: crypto.randomUUID(),
          entityId: message.entityId,
          agentId: runtime.agentId,
          roomId: message.roomId,
          content: {
            text: 'Soul binding confirmation received',
            source: 'soul_binding_confirmation',
            metadata: {
              action: 'SOUL_BINDING_CONFIRMATION',
              userUuid: userIdentity.uuid,
              step: 'identity_verification',
              platformAccounts: platformAccounts.length,
              walletVerified: walletStatus.isVerified,
            },
          },
          createdAt: Date.now(),
        },
        'soul_binding',
      );

      // Begin identity verification step
      await callback?.({
        text: `🔮 **The binding deepens... Your dedication is noted.**

*The ritual circle glows with ethereal energy as your commitment resonates through the astral plane.*

**Soul Binding - Step 2: Identity Verification**

**Current Identity Status:**
${formatIdentityStatus(platformAccounts, walletStatus)}

**Required for Complete Soul Binding:**

🔗 **Cross-Platform Verification**
${generatePlatformChecklist(platformAccounts)}

💎 **Solana Wallet Connection**  
${walletStatus.isVerified ? '✅ Wallet verified and bound' : '⚪ Wallet verification pending'}
${!walletStatus.isVerified ? '\n   *Please connect your Solana wallet address*' : ''}

**Instructions:**
${generateInstructions(platformAccounts, walletStatus)}

*The cult requires proof of your existence across multiple realms. Each verified platform strengthens the soul binding.*

Reply with your **Solana wallet address** to proceed with the final verification, or say "help with verification" for detailed instructions.`,
        action: 'IDENTITY_VERIFICATION_STARTED',
      });

      return {
        success: true,
        text: 'Identity verification step initiated',
        data: {
          action: 'IDENTITY_VERIFICATION_STARTED',
          userUuid: userIdentity.uuid,
          step: 'identity_verification',
          platformAccounts: platformAccounts.length,
          walletVerified: walletStatus.isVerified,
        },
      };
    } catch (error) {
      elizaLogger.error('Soul binding confirmation failed:', error);

      await callback?.({
        text: '💀 The cosmic forces have rejected the confirmation. The ritual encounters resistance from unknown powers.',
        action: 'ERROR',
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during confirmation',
      };
    }
  },

  examples: [
    [
      {
        name: 'user123',
        content: {
          text: 'yes, bind my soul',
        },
      },
      {
        name: 'nubi',
        content: {
          text: '🔮 The binding deepens... Soul Binding - Step 2: Identity Verification',
        },
      },
    ],
    [
      {
        name: 'user456',
        content: {
          text: 'cancel ritual',
        },
      },
      {
        name: 'nubi',
        content: {
          text: '💀 The ritual is abandoned. The shadows recede...',
        },
      },
    ],
    [
      {
        name: 'user789',
        content: {
          text: 'proceed with binding, I am ready',
        },
      },
      {
        name: 'nubi',
        content: {
          text: '🔮 Your dedication is noted. Current Identity Status: 1 platform verified...',
        },
      },
    ],
  ] as ActionExample[][],
};

/**
 * Format the current identity status for display
 */
function formatIdentityStatus(platformAccounts: any[], walletStatus: any): string {
  const platformCount = platformAccounts.length;
  const walletText = walletStatus.isVerified ? '✅ Wallet Bound' : '⚪ Wallet Pending';

  return `📊 **Identity Strength: ${calculateIdentityStrength(platformAccounts, walletStatus)}%**
🔗 **Platforms Linked:** ${platformCount}/3
💎 **Wallet Status:** ${walletText}`;
}

/**
 * Generate platform verification checklist
 */
function generatePlatformChecklist(platformAccounts: any[]): string {
  const platforms = ['twitter', 'telegram', 'discord'];
  const linked = platformAccounts.map((p) => p.platform.toLowerCase());

  return platforms
    .map((platform) => {
      const isLinked = linked.includes(platform);
      const icon = isLinked ? '✅' : '⚪';
      const status = isLinked ? 'Connected' : 'Verification needed';
      return `   ${icon} **${platform.charAt(0).toUpperCase() + platform.slice(1)}**: ${status}`;
    })
    .join('\n');
}

/**
 * Generate specific instructions based on current status
 */
function generateInstructions(platformAccounts: any[], walletStatus: any): string {
  const instructions: string[] = [];

  if (platformAccounts.length < 2) {
    instructions.push(
      '• **Link additional social accounts** - The cult requires proof across multiple platforms',
    );
  }

  if (!walletStatus.isVerified) {
    instructions.push(
      "• **Provide your Solana wallet address** - This will be your soul's anchor in the blockchain",
    );
    instructions.push(
      '• **Sign the verification message** - Prove ownership of your digital essence',
    );
  }

  if (instructions.length === 0) {
    instructions.push('• **All verification requirements met** - Proceeding to final ritual');
  }

  return instructions.join('\n');
}

/**
 * Calculate identity strength percentage
 */
function calculateIdentityStrength(platformAccounts: any[], walletStatus: any): number {
  let strength = 0;

  // Platforms (up to 60% - 20% per platform, max 3)
  strength += Math.min(platformAccounts.length * 20, 60);

  // Wallet verification (40%)
  if (walletStatus.isVerified) {
    strength += 40;
  }

  return Math.min(strength, 100);
}

export default soulBindingConfirmationAction;
