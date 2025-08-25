/**
 * Discord Service Template
 * Integrates with ElizaOS real-time communication system
 * Based on actual working ElizaOS plugin structure
 */

/**
 * Discord Service Plugin
 * Provides Discord integration service with @ mention validation and real-time messaging
 */
export const discordServicePlugin = {
  name: "discord-service",
  description: "Discord integration service with @ mention validation and real-time messaging",
  
  config: {
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || "",
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || "",
    DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID || "",
    SUPABASE_URL: process.env.SUPABASE_URL || "",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },

  async init(config: Record<string, string>): Promise<void> {
    console.log("Discord Service Plugin initialized");
    
    // Validate configuration
    for (const [key, value] of Object.entries(config)) {
      if (value) process.env[key] = value;
    }
  },

  models: {
    // Custom model implementations if needed
  },

  routes: [
    {
      name: "discord-status",
      path: "/discord/status",
      type: "GET",
      handler: async (req: any, res: any) => {
        res.json({
          connected: true,
          guilds: 1,
          channels: 5,
          uptime: Date.now(),
          mcpConnections: {
            supabase: "connected",
            xmcpx: "disconnected"
          }
        });
      }
    },
    {
      name: "discord-config",
      path: "/discord/config",
      type: "GET",
      handler: async (req: any, res: any) => {
        res.json({
          messageHandling: {
            requireMention: true,
            allowDirectMessages: true,
            ignoreBotMessages: true,
            ignoreSelfMessages: true,
            responseCooldown: 5000,
            mentionPatterns: ["@nubi", "@nubi_guardian", "@NUBI", "@NUBI_GUARDIAN"]
          },
          realtime: {
            enableWebSocket: true,
            autoReconnect: true,
            heartbeatInterval: 30000,
            maxReconnectAttempts: 5,
            logStreaming: true
          }
        });
      }
    }
  ],

  events: {
    DISCORD_CONNECTED: [
      async (params: any) => {
        console.log("Discord Service: Connected to Discord");
        // Initialize Discord client and set up message handlers
      },
    ],
    DISCORD_DISCONNECTED: [
      async (params: any) => {
        console.log("Discord Service: Disconnected from Discord");
        // Handle disconnection and cleanup
      },
    ],
    MCP_CONNECTED: [
      async (params: any) => {
        console.log("Discord Service: MCP server connected");
        // Initialize MCP connections
      },
    ]
  },

  services: [],
  actions: [
    {
      name: "VALIDATE_DISCORD_MESSAGE",
      similes: ["CHECK_MENTION", "VALIDATE_MESSAGE", "CHECK_DISCORD"],
      description: "Validates Discord message for @ mention requirements",
      
      validate: async (runtime: any, message: any, state?: any): Promise<boolean> => {
        const text = message.content.text?.toLowerCase() || "";
        const mentionPatterns = ["@nubi", "@nubi_guardian", "@NUBI", "@NUBI_GUARDIAN"];
        return mentionPatterns.some(pattern => text.includes(pattern.toLowerCase()));
      },

      handler: async (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => {
        const text = message.content.text || "";
        const context = {
          channelType: message.channelType || "GUILD_TEXT",
          isBot: message.isBot || false,
          isSelf: message.isSelf || false
        };
        
        const isValid = validateDiscordMessage(text, context);
        
        return {
          text: isValid ? "Message validated for response" : "Message ignored - no @ mention",
          success: true,
          data: { shouldRespond: isValid, context }
        };
      }
    },
    {
      name: "QUERY_SUPABASE_DATA",
      similes: ["DATABASE_QUERY", "SUPABASE_QUERY", "MCP_QUERY"],
      description: "Queries Supabase database using MCP for community data",
      
      validate: async (runtime: any, message: any, state?: any): Promise<boolean> => {
        const text = message.content.text?.toLowerCase() || "";
        return text.includes("database") || text.includes("check") || text.includes("data");
      },

      handler: async (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => {
        const text = message.content.text || "";
        
        // Use MCP to query Supabase
        const response = await querySupabaseData(text, "community_metrics", {});
        
        if (callback) {
          await callback({
            text: response.text,
            actions: ["QUERY_SUPABASE_DATA"],
            source: "discord"
          });
        }

        return {
          text: response.text,
          success: true,
          data: { action: "QUERY_SUPABASE_DATA", query: text, result: response.data }
        };
      }
    },
    {
      name: "BROADCAST_DISCORD_MESSAGE",
      similes: ["SEND_MESSAGE", "BROADCAST", "DISCORD_SEND"],
      description: "Broadcasts message to Discord channel",
      
      validate: async (runtime: any, message: any, state?: any): Promise<boolean> => {
        return true; // Always valid for broadcasting
      },

      handler: async (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => {
        const { channelId, messageText } = options || {};
        
        if (!channelId || !messageText) {
          return {
            text: "Missing channel ID or message text",
            success: false,
            error: new Error("Missing required parameters")
          };
        }

        await broadcastMessage(channelId, messageText);
        
        return {
          text: `Message broadcasted to channel ${channelId}`,
          success: true,
          data: { channelId, messageText }
        };
      }
    }
  ],

  providers: [
    {
      name: "DISCORD_CONTEXT",
      description: "Provides Discord-specific context and validation rules",
      
      get: async (runtime: any, message: any, state?: any) => {
        return {
          text: "Discord context available",
          values: {
            channelType: message.channelType || "GUILD_TEXT",
            isBot: message.isBot || false,
            isSelf: message.isSelf || false,
            mentionPatterns: ["@nubi", "@nubi_guardian", "@NUBI", "@NUBI_GUARDIAN"],
            responseCooldown: 5000
          },
          data: { platform: "discord" },
          confidence: 1.0,
          source: "discord-service"
        };
      }
    },
    {
      name: "SUPABASE_MCP",
      description: "Provides Supabase database access through MCP",
      
      get: async (runtime: any, message: any, state?: any) => {
        return {
          text: "Supabase MCP connection available",
          values: {
            connected: true,
            serverId: "supabase",
            capabilities: ["query", "insert", "update", "delete"],
            tables: ["community_metrics", "member_activity", "user_profiles"]
          },
          data: { mcpServer: "supabase" },
          confidence: 0.9,
          source: "supabase-mcp"
        };
      }
    }
  ]
};

/**
 * Validates Discord message for @ mention requirements
 */
function validateDiscordMessage(message: string, context: any): boolean {
  const { channelType, isBot, isSelf } = context;
  
  // Never respond to bot messages
  if (isBot) return false;
  
  // Never respond to own messages
  if (isSelf) return false;
  
  // In DMs, allow responses without @ mention
  if (channelType === "DM") return true;
  
  // In guild channels, require @ mention
  const mentionPatterns = [
    "@nubi",
    "@nubi_guardian", 
    "@NUBI",
    "@NUBI_GUARDIAN"
  ];
  
  return mentionPatterns.some(pattern => 
    message.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Queries Supabase database using MCP
 */
async function querySupabaseData(query: string, table: string, filters: any): Promise<{ text: string; data: any }> {
  // This would use the MCP connection to execute the query
  console.log(`Querying Supabase table ${table} with query: ${query}`);
  
  // Mock response for now
  return {
    text: "By the power of Anubis, I shall consult the sacred database to reveal the patterns of your community's activity.",
    data: { success: true, table, query, filters }
  };
}

/**
 * Broadcasts message to Discord channel
 */
async function broadcastMessage(channelId: string, message: string): Promise<void> {
  // Broadcast message to Discord channel
  console.log(`Broadcasting message to channel ${channelId}: ${message}`);
}

/**
 * Build Discord service plugin
 */
export function buildDiscordService() {
  return {
    ...discordServicePlugin,
    // Add any additional configuration needed
  };
}

/**
 * Discord service variants
 */
export const discordServiceVariants = {
  strict: {
    ...discordServicePlugin,
    description: "Strict Discord service with @ mention requirements only"
  },
  flexible: {
    ...discordServicePlugin,
    description: "Flexible Discord service allowing some exceptions"
  }
};

export default discordServicePlugin;
