import {
  elizaLogger,
  type Action,
  type IAgentRuntime,
  type Memory,
  type State,
  type HandlerCallback,
  type ActionResult,
} from '@elizaos/core';
import type { CommunityMemoryService } from '../services/community-memory-service';
import type { JoinRaidResponse } from '../types';

export const joinRaidAction: Action = {
  name: 'JOIN_RAID',
  similes: ['PARTICIPATE_IN_RAID', 'ENTER_RAID', 'SIGN_UP_RAID', 'RAID_JOIN', 'COUNT_ME_IN'],
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const text = message.content?.text?.toLowerCase() || '';
    return (
      text.includes('join raid') ||
      text.includes('participate') ||
      text.includes('count me in') ||
      text.includes("i'm in") ||
      (text.includes('raid') && (text.includes('me') || text.includes('join')))
    );
  },
  description: 'Join an active raid and become part of the coordinated engagement',
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown },
    callback?: HandlerCallback,
  ): Promise<ActionResult> => {
    try {
      elizaLogger.info('Processing join raid action');

      // Extract session id from message (expects patterns like "session-123")
      const text = message.content?.text?.toLowerCase() || '';
      const sessionMatch = text.match(/session-([a-z0-9_-]+)/i);
      const sessionId = sessionMatch ? `session-${sessionMatch[1]}` : null;

      if (!sessionId) {
        if (callback) {
          callback({
            text: "⚠️ Session ID required to join a raid. Example: 'Join raid session-123'",
            content: { action: 'join_raid_missing_session', hint: 'Session ID required' },
          });
        }
        return { success: false, text: 'Session ID required' };
      }

      const raidCoordinatorUrl = runtime.getSetting('RAID_COORDINATOR_URL');
      if (!raidCoordinatorUrl) {
        throw new Error('Raid coordinator URL not configured');
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const serviceKey =
        runtime.getSetting('SUPABASE_SERVICE_ROLE_KEY') || process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceKey) {
        headers['Authorization'] = `Bearer ${serviceKey}`;
        headers['apikey'] = serviceKey;
      }

      const response = await fetch(raidCoordinatorUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'join_raid',
          userId: message.entityId,
          username: message.content?.source || 'user',
          platform: 'elizaos',
          sessionId,
        }),
      });

      const result = (await response.json()) as JoinRaidResponse;

      if (result.success) {
        // Record participation in community memory
        const memoryService = runtime.getService<CommunityMemoryService>(
          'COMMUNITY_MEMORY_SERVICE',
        );
        if (memoryService && typeof (memoryService as any).recordInteraction === 'function') {
          await (memoryService as any).recordInteraction({
            id: crypto.randomUUID(),
            userId: message.entityId,
            username: message.content?.source || 'user',
            interactionType: 'raid_participation',
            content: 'Joined active raid',
            context: { raidId: result.raidId, participantNumber: result.participantNumber },
            weight: 1.5,
            sentimentScore: 0.7,
            relatedRaidId: result.raidId,
            timestamp: new Date(),
          });
        }

        if (callback) {
          callback({
            text:
              `✅ **JOINED RAID** ✅\n\n` +
              `⚡ **WELCOME TO THE BATTLEFIELD!** ⚡\n\n` +
              `🎖️ **Soldier #${result.participantNumber}** - You're officially enlisted! 🎖️\n\n` +
              `**🎯 YOUR MISSION:**\n` +
              `1️⃣ Hit the target: [${result.targetUrl}](${result.targetUrl})\n` +
              `2️⃣ Engage authentically (no spam, pure quality!)\n` +
              `3️⃣ Report back with your engagement type\n` +
              `4️⃣ Collect points and dominate the leaderboard\n\n` +
              `**🏆 POINT VALUES:**\n` +
              `👍 Like = 1 pt | 🔄 Retweet = 2 pts | 💬 Quote = 3 pts | 📝 Comment = 5 pts\n\n` +
              `**💡 PRO TIPS:**\n` +
              `• Quality engagement gets bonus points\n` +
              `• Be authentic, be valuable\n` +
              `• Help elevate the conversation\n\n` +
              `**Now go make some noise!** Our community doesn't just engage - we enhance! 🔥\n\n` +
              `*"Together we raid, together we conquer!"* 💪`,
            content: {
              raidId: result.raidId,
              participantNumber: result.participantNumber,
              targetUrl: result.targetUrl,
              action: 'raid_joined',
              missionStatus: 'active',
            },
          });
        }

        return { success: true, text: 'Successfully joined raid' };
      } else {
        throw new Error(result.error || 'Failed to join raid');
      }
    } catch (error) {
      elizaLogger.error('Join raid action failed:', error);

      if (callback) {
        callback({
          text:
            '⚠️ **NO ACTIVE RAID FOUND!** ⚠️\n\n' +
            "Looks like there's no battle to join right now, soldier! 🪖\n\n" +
            '**Start a new raid by:**\n' +
            '🎯 Sharing a Twitter URL for us to raid\n' +
            '📢 Checking our Telegram channel for active raids\n' +
            '🚀 Being the leader who initiates the next attack\n\n' +
            "**The community is ready when you are!** Drop a Twitter link and let's mobilize! 💪\n\n" +
            '*"No battles means it\'s time to create one!"* 🔥',
          content: {
            error: error.message,
            action: 'no_active_raid',
            suggestion: 'start_new_raid',
          },
        });
      }

      return { success: false, text: 'Failed to join raid' };
    }
  },
  examples: [
    [
      {
        name: '{{user1}}',
        content: {
          text: 'I want to join the raid',
        },
      },
      {
        name: '{{agentName}}',
        content: {
          text: "⚡ **WELCOME TO THE BATTLEFIELD!** ⚡\n\n🎖️ **Soldier #5** - You're officially enlisted! 🎖️\n\n**🎯 YOUR MISSION:**\n1️⃣ Hit the target: [Tweet Link]\n2️⃣ Engage authentically\n3️⃣ Report back for points\n4️⃣ Dominate the leaderboard\n\n**Now go make some noise!** 🔥",
          action: 'JOIN_RAID',
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Count me in for this raid!',
        },
      },
      {
        name: '{{agentName}}',
        content: {
          text: '🚀 **ENLISTED!** You\'re now part of the raid squad! \n\nParticipant #3 reporting for duty! 🎖️\n\n**Mission briefing incoming...**\nTarget the tweet, engage with quality, earn points, dominate! 💪\n\n*"Together we raid, together we conquer!"*',
          action: 'JOIN_RAID',
        },
      },
    ],
  ],
};
