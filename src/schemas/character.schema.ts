import { z } from 'zod';

/**
 * Character Schema Validation
 * Provides comprehensive validation for ElizaOS character definitions
 */

// Basic content schema for messages and posts
export const ContentSchema = z.object({
  text: z.string().min(1, "Content text is required"),
  source: z.string().optional(),
  attachments: z.array(z.any()).optional(),
  mentions: z.array(z.string()).optional(),
  actions: z.array(z.string()).optional(),
  providers: z.array(z.string()).optional(),
});

// Message example schema
export const MessageExampleSchema = z.array(
  z.object({
    name: z.string().min(1, "Name is required"),
    content: ContentSchema,
  })
);

// Style guidelines schema
export const StyleSchema = z.object({
  all: z.array(z.string()).optional(),
  chat: z.array(z.string()).optional(),
  post: z.array(z.string()).optional(),
  formal: z.array(z.string()).optional(),
  casual: z.array(z.string()).optional(),
  professional: z.array(z.string()).optional(),
  friendly: z.array(z.string()).optional(),
});

// Plugin configuration schema
export const PluginConfigSchema = z.object({
  name: z.string().min(1, "Plugin name is required"),
  priority: z.number().min(-1000).max(1000).optional(),
  config: z.record(z.any()).optional(),
});

// Settings schema with validation
export const SettingsSchema = z.object({
  // Basic settings
  avatar: z.string().url().optional(),
  colorScheme: z.array(z.string()).optional(),
  visualStyle: z.string().optional(),
  responseSpeed: z.enum(["fast", "balanced", "thoughtful"]).optional(),
  
  // ElizaOS specific settings
  elizaos: z.object({
    realtime: z.object({
      enableWebSocket: z.boolean().optional(),
      autoReconnect: z.boolean().optional(),
      heartbeatInterval: z.number().positive().optional(),
      maxReconnectAttempts: z.number().positive().optional(),
      logStreaming: z.boolean().optional(),
    }).optional(),
    
    discord: z.object({
      requireMention: z.boolean().optional(),
      allowDirectMessages: z.boolean().optional(),
      ignoreBotMessages: z.boolean().optional(),
      ignoreSelfMessages: z.boolean().optional(),
      mentionPatterns: z.array(z.string()).optional(),
      allowedChannels: z.array(z.string()).optional(),
      adminRoles: z.array(z.string()).optional(),
      responseCooldown: z.number().positive().optional(),
    }).optional(),
    
    accessControl: z.object({
      defaultRole: z.string().optional(),
      adminRoles: z.array(z.string()).optional(),
      publicSettings: z.array(z.string()).optional(),
      restrictedSettings: z.array(z.string()).optional(),
    }).optional(),
    
    encryption: z.object({
      autoEncryptSecrets: z.boolean().optional(),
      encryptionAlgorithm: z.string().optional(),
      saltSource: z.string().optional(),
      keyDerivation: z.string().optional(),
    }).optional(),
  }).optional(),
  
  // Memory system configuration
  memory: z.object({
    facts: z.object({
      retentionDays: z.number().positive().optional(),
      maxFactsPerSearch: z.number().positive().optional(),
      embeddingModel: z.string().optional(),
      similarityThreshold: z.number().min(0).max(1).optional(),
    }).optional(),
    
    messages: z.object({
      retentionDays: z.number().positive().optional(),
      maxContextMessages: z.number().positive().optional(),
      enableEmbeddingSearch: z.boolean().optional(),
    }).optional(),
    
    entities: z.object({
      retentionDays: z.number().positive().optional(),
      enableRelationshipTracking: z.boolean().optional(),
      maxEntityFacts: z.number().positive().optional(),
    }).optional(),
    
    search: z.object({
      defaultCount: z.number().positive().optional(),
      enableDeduplication: z.boolean().optional(),
      maxSearchResults: z.number().positive().optional(),
      contextWindowSize: z.number().positive().optional(),
    }).optional(),
  }).optional(),
  
  // MCP configuration
  mcp: z.object({
    servers: z.record(z.object({
      type: z.string().optional(),
      command: z.string().optional(),
      args: z.array(z.string()).optional(),
      env: z.record(z.string()).optional(),
    })).optional(),
  }).optional(),
});

// Secrets schema (will be encrypted)
export const SecretsSchema = z.record(z.union([
  z.string(),
  z.number(),
  z.boolean(),
]));

// Template schema
export const TemplateSchema = z.record(z.union([
  z.string(),
  z.object({
    content: z.string(),
    variables: z.array(z.string()).optional(),
    examples: z.array(z.string()).optional(),
  }),
]));

// Main character schema
export const CharacterSchema = z.object({
  // Basic identity
  id: z.string().optional(),
  name: z.string().min(1, "Character name is required"),
  username: z.string().optional(),
  
  // Core personality
  system: z.string().optional(),
  bio: z.union([
    z.string().min(1, "Bio is required"),
    z.array(z.string()).min(1, "At least one bio entry is required")
  ]),
  
  // Expertise and knowledge
  topics: z.array(z.string()).min(1, "At least one topic is required"),
  adjectives: z.array(z.string()).optional(),
  knowledge: z.array(z.union([
    z.string(),
    z.object({
      path: z.string(),
      shared: z.boolean().optional(),
      description: z.string().optional(),
    }),
    z.object({
      type: z.enum(["file", "url", "database"]),
      content: z.string(),
      metadata: z.record(z.any()).optional(),
    }),
  ])).optional(),
  
  // Functionality
  plugins: z.array(z.string()).default([]),
  
  // Configuration
  settings: SettingsSchema.optional(),
  secrets: SecretsSchema.optional(),
  
  // Style and behavior
  style: StyleSchema.optional(),
  
  // Training examples
  messageExamples: z.array(MessageExampleSchema).optional(),
  postExamples: z.array(z.string()).optional(),
  
  // Custom templates
  templates: TemplateSchema.optional(),
});

// Export types
export type ValidatedCharacter = z.infer<typeof CharacterSchema>;
export type CharacterSettings = z.infer<typeof SettingsSchema>;
export type CharacterStyle = z.infer<typeof StyleSchema>;
export type CharacterSecrets = z.infer<typeof SecretsSchema>;

// Validation functions
export const validateCharacter = (data: unknown): ValidatedCharacter => {
  return CharacterSchema.parse(data);
};

export const validateCharacterSafe = (data: unknown): { success: boolean; data?: ValidatedCharacter; errors?: string[] } => {
  try {
    const validated = CharacterSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { success: false, errors: [String(error)] };
  }
};
