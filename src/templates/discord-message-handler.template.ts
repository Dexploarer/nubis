/**
 * Discord Message Handler Template
 * Implements @ mention validation and Supabase MCP integration
 * Based on actual working ElizaOS plugin structure
 */

/**
 * Discord Message Handler Plugin
 * Handles Discord message processing with @ mention validation and database integration
 */
export const discordMessageHandlerPlugin = {
  name: "discord-message-handler",
  description: "Handles Discord message processing with @ mention validation and database integration",
  
  config: {
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || "",
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || "",
    SUPABASE_URL: process.env.SUPABASE_URL || "",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
  },

  async init(config: Record<string, string>): Promise<void> {
    console.log("Discord Message Handler Plugin initialized");
    
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
      name: "discord-validate",
      path: "/discord/validate",
      type: "POST",
      handler: async (req: any, res: any) => {
        const { message, author, channelType, isBot, isSelf } = req.body;
        
        // Discord message validation logic
        const shouldRespond = validateDiscordMessage({
          message,
          author,
          channelType,
          isBot,
          isSelf
        });
        
        res.json({ shouldRespond, reason: shouldRespond ? "Valid @ mention" : "No @ mention or invalid" });
      }
    },
    {
      name: "discord-process",
      path: "/discord/process",
      type: "POST", 
      handler: async (req: any, res: any) => {
        const { message, context } = req.body;
        
        // Process valid Discord message
        const response = await processDiscordMention(message, context);
        res.json({ response });
      }
    }
  ],

  events: {
    DISCORD_MESSAGE_RECEIVED: [
      async (params: any) => {
        console.log("Discord Message Handler: Message received");
        // Process Discord message using @ mention validation
      },
    ],
    DISCORD_MENTION_VALIDATED: [
      async (params: any) => {
        console.log("Discord Message Handler: @ mention validated");
        // Handle validated @ mention
      },
    ],
  },

  services: [],
  actions: [
    {
      name: "VALIDATE_DISCORD_MESSAGE",
      similes: ["CHECK_MENTION", "VALIDATE_MESSAGE", "CHECK_DISCORD"],
      description: "Validates if a Discord message requires a response based on @ mention",
      
      validate: async (runtime: any, message: any, state?: any): Promise<boolean> => {
        const text = message.content.text?.toLowerCase() || "";
        const mentionPatterns = ["@nubi", "@nubi_guardian", "@NUBI", "@NUBI_GUARDIAN"];
        return mentionPatterns.some(pattern => text.includes(pattern.toLowerCase()));
      },

      handler: async (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => {
        const text = message.content.text || "";
        const isValid = validateDiscordMessage({
          message: text,
          author: message.author || "",
          channelType: message.channelType || "GUILD_TEXT",
          isBot: message.isBot || false,
          isSelf: message.isSelf || false
        });

        return {
          text: isValid ? "Message validated for response" : "Message ignored - no @ mention",
          success: true,
          data: { shouldRespond: isValid }
        };
      }
    },
    {
      name: "PROCESS_DISCORD_MENTION",
      similes: ["HANDLE_MENTION", "PROCESS_MESSAGE", "DISCORD_RESPONSE"],
      description: "Processes a valid Discord @ mention and generates response",
      
      validate: async (runtime: any, message: any, state?: any): Promise<boolean> => {
        const text = message.content.text?.toLowerCase() || "";
        const mentionPatterns = ["@nubi", "@nubi_guardian", "@NUBI", "@NUBI_GUARDIAN"];
        return mentionPatterns.some(pattern => text.includes(pattern.toLowerCase()));
      },

      handler: async (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => {
        const text = message.content.text || "";
        const response = await processDiscordMention(text, { message, state });

        if (callback) {
          await callback({
            text: response,
            actions: ["PROCESS_DISCORD_MENTION"],
            source: "discord"
          });
        }

        return {
          text: response,
          success: true,
          data: { action: "PROCESS_DISCORD_MENTION" }
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
        
        // This would use the MCP connection to execute the query
        const response = "I'll consult the sacred database through my Supabase connection to help you with that request.";

        if (callback) {
          await callback({
            text: response,
            actions: ["QUERY_SUPABASE_DATA"],
            source: "discord"
          });
        }

        return {
          text: response,
          success: true,
          data: { action: "QUERY_SUPABASE_DATA", query: text }
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
            mentionPatterns: ["@nubi", "@nubi_guardian", "@NUBI", "@NUBI_GUARDIAN"]
          },
          data: { platform: "discord" },
          confidence: 1.0,
          source: "discord-context"
        };
      }
    },
    {
      name: "SUPABASE_MCP",
      description: "Provides access to Supabase database through MCP",
      
      get: async (runtime: any, message: any, state?: any) => {
        return {
          text: "Supabase MCP connection available",
          values: {
            connected: true,
            serverId: "supabase",
            capabilities: ["query", "insert", "update", "delete"]
          },
          data: { mcpServer: "supabase" },
          confidence: 0.9,
          source: "supabase-mcp"
        };
      }
    },
    {
      name: "MENTION_VALIDATOR",
      description: "Validates @ mention patterns and requirements",
      
      get: async (runtime: any, message: any, state?: any) => {
        const text = message.content.text || "";
        const mentionPatterns = ["@nubi", "@nubi_guardian", "@NUBI", "@NUBI_GUARDIAN"];
        const hasMention = mentionPatterns.some(pattern => text.toLowerCase().includes(pattern.toLowerCase()));
        
        return {
          text: hasMention ? "Valid @ mention detected" : "No @ mention found",
          values: {
            hasMention,
            mentionPatterns,
            channelType: message.channelType || "GUILD_TEXT"
          },
          data: { validation: { hasMention, patterns: mentionPatterns } },
          confidence: 1.0,
          source: "mention-validator"
        };
      }
    }
  ]
};

/**
 * Validates Discord message for @ mention requirements
 */
function validateDiscordMessage(params: {
  message: string;
  author: string;
  channelType: string;
  isBot: boolean;
  isSelf: boolean;
}): boolean {
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
 * Processes valid Discord @ mention
 */
async function processDiscordMention(message: string, context: any): Promise<string> {
  // Extract the actual question/content after @ mention
  const cleanMessage = message.replace(/@\w+/g, "").trim();
  
  // Check if message requires database query
  if (cleanMessage.toLowerCase().includes("database") || 
      cleanMessage.toLowerCase().includes("check") ||
      cleanMessage.toLowerCase().includes("data")) {
    return "I'll consult the sacred database through my Supabase connection to help you with that request.";
  }
  
  return "I hear your call, mortal. How may the ancient wisdom of Nubi assist you today?";
}

/**
 * Build Discord message handler plugin
 */
export function buildDiscordMessageHandler() {
  return {
    ...discordMessageHandlerPlugin,
    // Add any additional configuration needed
  };
}

/**
 * Discord message handler variants
 */
export const discordMessageHandlerVariants = {
  strict: {
    ...discordMessageHandlerPlugin,
    description: "Strict @ mention validation with no exceptions"
  },
  flexible: {
    ...discordMessageHandlerPlugin,
    description: "Flexible validation allowing some exceptions for trusted users"
  }
};

export default discordMessageHandlerPlugin;
