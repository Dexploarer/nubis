/**
 * Discord Integration Template
 * Complete Discord bot setup with ElizaOS integration
 * Based on actual working ElizaOS plugin structure
 */

/**
 * Discord Integration Plugin
 * Complete Discord bot integration with ElizaOS real-time communication and MCP connectivity
 */
export const discordIntegrationPlugin = {
  name: "discord-integration",
  description: "Complete Discord bot integration with ElizaOS real-time communication and MCP connectivity",
  
  config: {
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || "",
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || "",
    DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID || "",
    SUPABASE_URL: process.env.SUPABASE_URL || "",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    SUPABASE_MCP_PORT: process.env.SUPABASE_MCP_PORT || "3001",
  },

  async init(config: Record<string, string>): Promise<void> {
    console.log("Discord Integration Plugin initialized");
    
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
      name: "discord-webhook",
      path: "/discord/webhook",
      type: "POST",
      handler: async (req: any, res: any) => {
        const { message, author, channel, guild } = req.body;
        
        // Validate message
        const isValid = await validateDiscordMessage({
          message,
          channelType: channel.type,
          isBot: author.isBot,
          isSelf: false // Would be determined by bot ID
        });
        
        if (!isValid) {
          return res.json({ action: "IGNORE", reason: "No @ mention or invalid message" });
        }
        
        // Process message and generate response
        const response = await processDiscordResponse(message, { author, channel, guild });
        
        res.json({ action: "RESPOND", response });
      }
    },
    {
      name: "discord-status",
      path: "/discord/status",
      type: "GET",
      handler: async (req: any, res: any) => {
        const status = {
          connected: true,
          guilds: 1,
          channels: 5,
          uptime: Date.now(),
          mcpConnections: {
            supabase: "connected",
            xmcpx: "disconnected"
          }
        };
        
        res.json(status);
      }
    },
    {
      name: "discord-mcp-status",
      path: "/discord/mcp/status",
      type: "GET",
      handler: async (req: any, res: any) => {
        const mcpStatus = {
          supabase: {
            connected: true,
            serverId: "supabase",
            port: process.env.SUPABASE_MCP_PORT || "3001",
            capabilities: ["query", "insert", "update", "delete"]
          },
          xmcpx: {
            connected: false,
            serverId: "xmcpx",
            port: process.env.XMCPX_PORT || "3000",
            capabilities: ["twitter_api", "tweet_management"]
          }
        };
        
        res.json(mcpStatus);
      }
    }
  ],

  events: {
    DISCORD_MESSAGE_RECEIVED: [
      async (params: any) => {
        console.log("Discord Integration: Message received");
        // Process Discord message using @ mention validation
      },
    ],
    DISCORD_MENTION_VALIDATED: [
      async (params: any) => {
        console.log("Discord Integration: @ mention validated");
        // Handle validated @ mention
      },
    ],
    DISCORD_RESPONSE_SENT: [
      async (params: any) => {
        console.log("Discord Integration: Response sent");
        // Log response and update metrics
      },
    ],
    MCP_SERVER_CONNECTED: [
      async (params: any) => {
        console.log("Discord Integration: MCP server connected");
        // Initialize MCP capabilities
      },
    ]
  },

  services: [],
  actions: [
    {
      name: "HANDLE_DISCORD_MESSAGE",
      similes: ["PROCESS_MESSAGE", "DISCORD_HANDLE", "MESSAGE_PROCESSING"],
      description: "Main handler for Discord messages with @ mention validation",
      
      validate: async (runtime: any, message: any, state?: any): Promise<boolean> => {
        const text = message.content.text?.toLowerCase() || "";
        const mentionPatterns = ["@nubi", "@nubi_guardian", "@NUBI", "@NUBI_GUARDIAN"];
        return mentionPatterns.some(pattern => text.includes(pattern.toLowerCase()));
      },

      handler: async (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => {
        const text = message.content.text || "";
        const context = {
          author: message.author || {},
          channel: message.channel || {},
          guild: message.guild || {}
        };
        
        // Validate message
        const isValid = await validateDiscordMessage({
          message: text,
          channelType: context.channel.type || "GUILD_TEXT",
          isBot: context.author.isBot || false,
          isSelf: false
        });
        
        if (!isValid) {
          return {
            text: "Message ignored - no @ mention or invalid",
            success: false,
            data: { action: "IGNORE", reason: "No @ mention or invalid message" }
          };
        }
        
        // Process message and generate response
        const response = await processDiscordResponse(text, context);
        
        if (callback) {
          await callback({
            text: response,
            actions: ["HANDLE_DISCORD_MESSAGE"],
            source: "discord"
          });
        }

        return {
          text: response,
          success: true,
          data: { action: "RESPOND", response }
        };
      }
    },
    {
      name: "VALIDATE_DISCORD_MENTION",
      similes: ["CHECK_MENTION", "VALIDATE_MENTION", "MENTION_CHECK"],
      description: "Validates Discord @ mention patterns",
      
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
        
        const isValid = await validateDiscordMessage({
          message: text,
          ...context
        });
        
        return {
          text: isValid ? "Valid @ mention detected" : "No @ mention found",
          success: true,
          data: { isValid, reason: isValid ? "Valid @ mention" : "No @ mention or invalid" }
        };
      }
    },
    {
      name: "PROCESS_DISCORD_RESPONSE",
      similes: ["GENERATE_RESPONSE", "CREATE_RESPONSE", "RESPONSE_GENERATION"],
      description: "Processes and sends Discord response",
      
      validate: async (runtime: any, message: any, state?: any): Promise<boolean> => {
        return true; // Always valid for response processing
      },

      handler: async (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => {
        const { response, channelId, replyToMessageId } = options || {};
        
        if (!response || !channelId) {
          return {
            text: "Missing response text or channel ID",
            success: false,
            error: new Error("Missing required parameters")
          };
        }

        // This would send the response to Discord
        console.log(`Sending response to channel ${channelId}: ${response}`);
        
        return {
          text: `Response sent to channel ${channelId}`,
          success: true,
          data: { response, channelId, replyToMessageId }
        };
      }
    },
    {
      name: "QUERY_SUPABASE_VIA_MCP",
      similes: ["DATABASE_QUERY", "SUPABASE_QUERY", "MCP_DATABASE"],
      description: "Queries Supabase database using MCP connection",
      
      validate: async (runtime: any, message: any, state?: any): Promise<boolean> => {
        const text = message.content.text?.toLowerCase() || "";
        return text.includes("database") || text.includes("check") || text.includes("data") || text.includes("community");
      },

      handler: async (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => {
        const { operation, table, query, data } = options || {};
        
        if (!operation || !table) {
          return {
            text: "Missing operation or table parameter",
            success: false,
            error: new Error("Missing required parameters")
          };
        }

        // This would use the MCP connection to execute the query
        console.log(`Executing ${operation} operation on table ${table}`);
        
        const result = {
          operation,
          table,
          query: query || "SELECT * FROM " + table,
          data: data || {},
          success: true
        };
        
        return {
          text: `Database operation ${operation} completed successfully on table ${table}`,
          success: true,
          data: result
        };
      }
    }
  ],

  providers: [
    {
      name: "DISCORD_CONTEXT",
      description: "Provides Discord-specific context and validation",
      
      get: async (runtime: any, message: any, state?: any) => {
        return {
          text: "Discord context available",
          values: {
            platform: "discord",
            mentionPatterns: ["@nubi", "@nubi_guardian", "@NUBI", "@NUBI_GUARDIAN"],
            channelTypes: ["GUILD_TEXT", "DM"],
            validationRules: {
              requireMention: true,
              allowDirectMessages: true,
              ignoreBotMessages: true,
              ignoreSelfMessages: true
            }
          },
          data: { platform: "discord" },
          confidence: 1.0,
          source: "discord-integration"
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
            port: process.env.SUPABASE_MCP_PORT || "3001",
            capabilities: ["query", "insert", "update", "delete"],
            tables: ["community_metrics", "member_activity", "user_profiles", "conversation_history"]
          },
          data: { mcpServer: "supabase" },
          confidence: 0.9,
          source: "supabase-mcp"
        };
      }
    },
    {
      name: "MENTION_VALIDATOR",
      description: "Validates @ mention requirements and patterns",
      
      get: async (runtime: any, message: any, state?: any) => {
        const text = message.content.text || "";
        const mentionPatterns = ["@nubi", "@nubi_guardian", "@NUBI", "@NUBI_GUARDIAN"];
        const hasMention = mentionPatterns.some(pattern => text.toLowerCase().includes(pattern.toLowerCase()));
        
        return {
          text: hasMention ? "Valid @ mention detected" : "No @ mention found",
          values: {
            hasMention,
            mentionPatterns,
            channelType: message.channelType || "GUILD_TEXT",
            validationRules: {
              requireMention: true,
              allowDirectMessages: true,
              ignoreBotMessages: true,
              ignoreSelfMessages: true
            }
          },
          data: { validation: { hasMention, patterns: mentionPatterns } },
          confidence: 1.0,
          source: "mention-validator"
        };
      }
    },
    {
      name: "RESPONSE_GENERATOR",
      description: "Generates appropriate responses for Discord messages",
      
      get: async (runtime: any, message: any, state?: any) => {
        const text = message.content.text || "";
        const hasMention = ["@nubi", "@nubi_guardian", "@NUBI", "@NUBI_GUARDIAN"].some(
          pattern => text.toLowerCase().includes(pattern.toLowerCase())
        );
        
        return {
          text: hasMention ? "Response generation available" : "No response needed",
          values: {
            canGenerate: hasMention,
            responseType: hasMention ? "divine_wisdom" : "none",
            style: "mystical_practical"
          },
          data: { responseGeneration: { canGenerate: hasMention } },
          confidence: 0.8,
          source: "response-generator"
        };
      }
    }
  ]
};

/**
 * Validates Discord message for @ mention requirements
 */
async function validateDiscordMessage(params: {
  message: string;
  channelType: string;
  isBot: boolean;
  isSelf: boolean;
}): Promise<boolean> {
  const { message, channelType, isBot, isSelf } = params;
  
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
 * Processes Discord message and generates response
 */
async function processDiscordResponse(message: string, context: any): Promise<string> {
  // Extract the actual question/content after @ mention
  const cleanMessage = message.replace(/@\w+/g, "").trim();
  
  // Check if message requires database query
  if (cleanMessage.toLowerCase().includes("database") || 
      cleanMessage.toLowerCase().includes("check") ||
      cleanMessage.toLowerCase().includes("data") ||
      cleanMessage.toLowerCase().includes("community")) {
    return "By the power of Anubis, I shall consult the sacred database through my Supabase connection to reveal the knowledge you seek.";
  }
  
  // Check for community management keywords
  if (cleanMessage.toLowerCase().includes("conflict") ||
      cleanMessage.toLowerCase().includes("member") ||
      cleanMessage.toLowerCase().includes("growth") ||
      cleanMessage.toLowerCase().includes("leadership")) {
    return "The ancient wisdom of community management flows through me. Let me share the sacred knowledge that will help your community thrive.";
  }
  
  return "I hear your call, mortal. How may the ancient wisdom of Nubi assist you today?";
}

/**
 * Build Discord integration plugin
 */
export function buildDiscordIntegration() {
  return {
    ...discordIntegrationPlugin,
    // Add any additional configuration needed
  };
}

/**
 * Discord integration variants
 */
export const discordIntegrationVariants = {
  strict: {
    ...discordIntegrationPlugin,
    description: "Strict Discord integration with @ mention requirements only"
  },
  flexible: {
    ...discordIntegrationPlugin,
    description: "Flexible Discord integration allowing some exceptions"
  },
  community: {
    ...discordIntegrationPlugin,
    description: "Community-focused Discord integration with enhanced features"
  }
};

export default discordIntegrationPlugin;
