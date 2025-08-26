import type { Action, ActionResult, IAgentRuntime, Memory, State } from '@elizaos/core';
import { elizaLogger } from '@elizaos/core';
import type { NotificationMonitor } from '../services/notification-monitor';

export const monitorMentionsAction: Action = {
  name: 'MONITOR_MENTIONS',
  description: 'Monitor Twitter mentions and notifications in real-time',
  similes: ['watch mentions', 'track mentions', 'monitor notifications', 'check mentions'],
  
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const content = message.content?.text?.toLowerCase() || '';
    return content.includes('mention') || content.includes('notification') || content.includes('monitor');
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: any,
    callback?: any
  ): Promise<ActionResult> => {
    try {
      elizaLogger.info('Executing MONITOR_MENTIONS action');
      
      // Get notification monitor service
      const monitor = runtime.getService('NOTIFICATION_MONITOR') as NotificationMonitor;
      if (!monitor) {
        throw new Error('NotificationMonitor service not available');
      }

      const content = message.content?.text?.toLowerCase() || '';
      
      if (content.includes('status') || content.includes('check')) {
        // Get monitoring status
        const status = monitor.getStatus();
        const history = monitor.getEngagementHistory('all', 10);
        
        const statusText = `📊 **Twitter Monitoring Status**\n\n` +
          `• **Status**: ${status.isMonitoring ? '🟢 Active' : '🔴 Inactive'}\n` +
          `• **Poll Interval**: ${status.pollInterval / 1000} seconds\n` +
          `• **Last Poll**: ${status.lastPoll > 0 ? new Date(status.lastPoll).toLocaleString() : 'Never'}\n` +
          `• **Total Notifications**: ${status.notificationCount}\n` +
          `• **Active Callbacks**: ${status.callbackCount}\n\n` +
          `**Recent Activity** (last 10):\n` +
          (history.length > 0 
            ? history.map(h => `• ${h.type}: @${h.author} - ${new Date(h.timestamp).toLocaleTimeString()}`).join('\n')
            : '• No recent activity');

        if (callback) {
          await callback({
            text: statusText,
            action: 'MONITOR_MENTIONS',
            success: true,
          });
        }

        return {
          success: true,
          text: statusText,
          data: { status, history },
        };
        
      } else if (content.includes('start') || content.includes('begin')) {
        // Start monitoring
        await monitor.startMonitoring();
        
        const successText = '✅ Twitter mention monitoring started!\n\nI\'ll now track all mentions, replies, and engagements in real-time.';
        
        if (callback) {
          await callback({
            text: successText,
            action: 'MONITOR_MENTIONS',
            success: true,
          });
        }

        return {
          success: true,
          text: successText,
          data: { action: 'started' },
        };
        
      } else if (content.includes('stop') || content.includes('pause')) {
        // Stop monitoring
        await monitor.stopMonitoring();
        
        const successText = '⏹️ Twitter mention monitoring stopped.';
        
        if (callback) {
          await callback({
            text: successText,
            action: 'MONITOR_MENTIONS',
            success: true,
          });
        }

        return {
          success: true,
          text: successText,
          data: { action: 'stopped' },
        };
        
      } else if (content.includes('force') || content.includes('poll now')) {
        // Force a poll
        await monitor.forcePoll();
        
        const successText = '🔄 Manual poll triggered. Check for new mentions and notifications.';
        
        if (callback) {
          await callback({
            text: successText,
            action: 'MONITOR_MENTIONS',
            success: true,
          });
        }

        return {
          success: true,
          text: successText,
          data: { action: 'polled' },
        };
        
      } else {
        // Default: show recent mentions
        const history = monitor.getEngagementHistory('mention', 10);
        const status = monitor.getStatus();
        
        const mentionsText = `💬 **Recent Mentions** (last 10)\n\n` +
          `Monitoring: ${status.isMonitoring ? '🟢 Active' : '🔴 Inactive'}\n\n` +
          (history.length > 0
            ? history.map(h => 
                `• **@${h.author}**: ${h.text.substring(0, 100)}${h.text.length > 100 ? '...' : ''}\n` +
                `  *${new Date(h.timestamp).toLocaleString()}*`
              ).join('\n\n')
            : 'No recent mentions found.');

        if (callback) {
          await callback({
            text: mentionsText,
            action: 'MONITOR_MENTIONS',
            success: true,
          });
        }

        return {
          success: true,
          text: mentionsText,
          data: { history, status },
        };
      }

    } catch (error) {
      elizaLogger.error('Failed to handle mention monitoring:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (callback) {
        await callback({
          text: `❌ Mention monitoring error: ${errorMessage}`,
          error: true,
        });
      }

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  examples: [
    [
      {
        user: 'user',
        content: { text: 'Check my Twitter mentions' },
      },
      {
        user: 'assistant', 
        content: { text: 'I\'ll check your recent Twitter mentions and monitoring status!' },
      },
    ],
    [
      {
        user: 'user',
        content: { text: 'Start monitoring Twitter notifications' },
      },
      {
        user: 'assistant',
        content: { text: 'I\'ll start monitoring your Twitter mentions and notifications in real-time!' },
      },
    ],
  ],
};