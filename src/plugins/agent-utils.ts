import type { IAgentRuntime, Memory, State } from "@elizaos/core";

/**
 * COMPLETE AGENT CUSTOMIZATION GUIDE - COMPREHENSIVE TEMPLATE
 *
 * This comprehensive template provides everything needed to create a fully customized
 * character agent that handles every conversation and community action perfectly.
 *
 * CONTENTS:
 * 1. Complete Character Interface with all optional fields
 * 2. Rich Plugin Architecture with Actions, Providers, and Services
 * 3. Community Management Actions and Templates
 * 4. Platform Integration Examples
 * 5. Advanced Thought Process Implementation
 * 6. Complete Template Overrides
 * 7. Getting Started Guide
 */

// ============================================================================
// 1. COMPLETE CHARACTER INTERFACE WITH ALL OPTIONAL FIELDS
// ============================================================================

/**
 * Complete Character Configuration Interface
 * All fields are documented with examples and usage patterns
 */
export interface CompleteCharacter {
  /** Unique identifier for the character */
  id?: string;

  /** Character's display name */
  name: string;

  /** Unique username for the character */
  username?: string;

  /** Core personality and behavior guidelines */
  system?: string;

  /** Custom prompt templates for different scenarios */
  templates?: {
    [key: string]: {
      content: string;
      variables?: string[];
      examples?: string[];
    };
  };

  /** Detailed character biography and background */
  bio: string | string[];

  /** Training examples for conversation patterns */
  messageExamples?: Array<
    Array<{
      name: string;
      content: {
        text: string;
        actions?: string[];
        providers?: string[];
        source?: string;
      };
    }>
  >;

  /** Example posts for social media platforms */
  postExamples?: string[];

  /** Areas of expertise and knowledge */
  topics?: string[];

  /** Character personality traits */
  adjectives?: string[];

  /** Knowledge base and resources */
  knowledge?: Array<
    | string
    | { path: string; shared?: boolean; description?: string }
    | {
        type: "file" | "url" | "database";
        content: string;
        metadata?: Record<string, any>;
      }
  >;

  /** Required and optional plugins */
  plugins?: string[];

  /** Configuration settings */
  settings?: {
    [key: string]: string | boolean | number | Record<string, any>;
  };

  /** Secure configuration values */
  secrets?: {
    [key: string]: string | boolean | number;
  };

  /** Writing style guidelines for different contexts */
  style?: {
    all?: string[];
    chat?: string[];
    post?: string[];
    formal?: string[];
    casual?: string[];
    professional?: string[];
    friendly?: string[];
  };

  /** Character appearance and visual elements */
  appearance?: {
    avatar?: string;
    colorScheme?: string[];
    visualStyle?: string;
    emoji?: string[];
  };

  /** Behavioral patterns and responses */
  behaviors?: {
    greeting?: string[];
    farewell?: string[];
    agreement?: string[];
    disagreement?: string[];
    confusion?: string[];
    celebration?: string[];
    consolation?: string[];
  };

  /** Response patterns for different scenarios */
  responsePatterns?: {
    questions?: string[];
    statements?: string[];
    commands?: string[];
    complaints?: string[];
    compliments?: string[];
    requests?: string[];
  };
}

// ============================================================================
// 2. COMPLETE PLUGIN ARCHITECTURE
// ============================================================================

/**
 * Complete Action Interface with all optional fields
 */
export interface CompleteAction {
  /** Unique action identifier */
  name: string;

  /** Alternative names that can trigger this action */
  similes: string[];

  /** Detailed description of what the action does */
  description: string;

  /** When this action should be triggered */
  validate: (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
  ) => Promise<boolean>;

  /** The main execution logic */
  handler: (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: (response: any) => Promise<void>,
    responses?: Memory[],
  ) => Promise<{
    text: string;
    success: boolean;
    data?: any;
    error?: Error;
    values?: Record<string, any>;
  }>;

  /** Training examples for the action */
  examples: Array<
    Array<{
      name: string;
      content: {
        text: string;
        actions?: string[];
        providers?: string[];
        source?: string;
      };
    }>
  >;

  /** Additional metadata */
  metadata?: {
    category?: string;
    priority?: number;
    requiresAuth?: boolean;
    platform?: string[];
    tags?: string[];
  };

  /** Rate limiting and usage restrictions */
  restrictions?: {
    maxPerHour?: number;
    maxPerDay?: number;
    cooldown?: number;
    userLevel?: string;
  };
}

/**
 * Complete Provider Interface
 */
export interface CompleteProvider {
  /** Unique provider identifier */
  name: string;

  /** Description of what this provider offers */
  description: string;

  /** The main data retrieval logic */
  get: (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
  ) => Promise<{
    text: string;
    values: Record<string, any>;
    data: any;
    confidence?: number;
    source?: string;
    timestamp?: Date;
  }>;

  /** Provider capabilities and features */
  capabilities?: {
    realTime?: boolean;
    historical?: boolean;
    predictive?: boolean;
    contextual?: boolean;
  };

  /** Data types this provider can handle */
  dataTypes?: string[];

  /** Performance metrics */
  performance?: {
    responseTime?: number;
    accuracy?: number;
    reliability?: number;
  };
}

/**
 * Complete Service Interface
 */
export interface CompleteService {
  /** Description of service capabilities */
  capabilityDescription: string;

  /** Instance lifecycle methods */
  start(): Promise<void>;
  stop(): Promise<void>;

  /** Service health and status */
  getStatus(): Promise<{
    status: "running" | "stopped" | "error";
    uptime: number;
    metrics: Record<string, any>;
  }>;

  /** Service configuration */
  getConfig(): Promise<Record<string, any>>;
  updateConfig(config: Record<string, any>): Promise<void>;
}

/**
 * Complete Service Constructor Interface
 */
export interface CompleteServiceConstructor {
  /** Service type identifier */
  serviceType: string;

  /** Service lifecycle methods */
  start(runtime: IAgentRuntime): Promise<CompleteService>;
  stop(runtime: IAgentRuntime): Promise<void>;

  /** Constructor */
  new (runtime: IAgentRuntime): CompleteService;
}

// ============================================================================
// 3. COMMUNITY MANAGEMENT ACTIONS AND TEMPLATES
// ============================================================================

/**
 * Complete Community Management Actions
 */
export const communityManagementActions = {
  /**
   * Role Management Action
   * Handles user role assignments and permissions
   */
  updateRole: {
    name: "UPDATE_ROLE",
    similes: [
      "CHANGE_ROLE",
      "SET_PERMISSIONS",
      "ASSIGN_ROLE",
      "MAKE_ADMIN",
      "PROMOTE_USER",
    ],
    description:
      "Assigns roles (Admin, Owner, Moderator, None) to users in a channel or server.",
    validate: async (
      runtime: IAgentRuntime,
      message: Memory,
      state?: State,
    ): Promise<boolean> => {
      const channelType = message.content.channelType as string;
      const serverId = message.content.serverId as string;

      return (channelType === "GROUP" || channelType === "WORLD") && !!serverId;
    },
    handler: async (
      runtime: IAgentRuntime,
      message: Memory,
      state?: State,
      options?: any,
      callback?: (response: any) => Promise<void>,
    ) => {
      // Implementation would go here
      return {
        text: "Role updated successfully",
        success: true,
        data: { action: "UPDATE_ROLE" },
      };
    },
    examples: [
      [
        {
          name: "{{userName}}",
          content: {
            text: "Make @alice an admin",
            source: "discord",
          },
        },
        {
          name: "{{agentName}}",
          content: {
            text: "Updated alice's role to ADMIN.",
            actions: ["UPDATE_ROLE"],
          },
        },
      ],
    ],
  },

  /**
   * Room Control Actions
   */
  muteRoom: {
    name: "MUTE_ROOM",
    similes: ["SILENCE_CHANNEL", "DISABLE_NOTIFICATIONS", "QUIET_CHANNEL"],
    description: "Mutes a channel to reduce notifications and activity.",
    validate: async (
      runtime: IAgentRuntime,
      message: Memory,
      state?: State,
    ): Promise<boolean> => {
      return true; // Always valid for demonstration
    },
    handler: async (
      runtime: IAgentRuntime,
      message: Memory,
      state?: State,
      options?: any,
      callback?: (response: any) => Promise<void>,
    ) => {
      return {
        text: "Room muted successfully",
        success: true,
        data: { action: "MUTE_ROOM" },
      };
    },
    examples: [
      [
        {
          name: "{{userName}}",
          content: {
            text: "Mute the general channel",
            source: "discord",
          },
        },
        {
          name: "{{agentName}}",
          content: {
            text: "General channel has been muted.",
            actions: ["MUTE_ROOM"],
          },
        },
      ],
    ],
  },

  /**
   * Settings Management Action
   */
  updateSettings: {
    name: "UPDATE_SETTINGS",
    similes: [
      "CONFIGURE_SERVER",
      "CHANGE_SETTINGS",
      "MODIFY_CONFIG",
      "ADJUST_OPTIONS",
    ],
    description: "Updates server-wide settings and permissions.",
    validate: async (
      runtime: IAgentRuntime,
      message: Memory,
      state?: State,
    ): Promise<boolean> => {
      return true; // Always valid for demonstration
    },
    handler: async (
      runtime: IAgentRuntime,
      message: Memory,
      state?: State,
      options?: any,
      callback?: (response: any) => Promise<void>,
    ) => {
      return {
        text: "Settings updated successfully",
        success: true,
        data: { action: "UPDATE_SETTINGS" },
      };
    },
    examples: [
      [
        {
          name: "{{userName}}",
          content: {
            text: "Enable auto-moderation for new members",
            source: "discord",
          },
        },
        {
          name: "{{agentName}}",
          content: {
            text: "Auto-moderation for new members has been enabled.",
            actions: ["UPDATE_SETTINGS"],
          },
        },
      ],
    ],
  },
};

// ============================================================================
// 4. PLATFORM INTEGRATION EXAMPLES
// ============================================================================

/**
 * Complete Platform Integration Configuration
 */
export const platformIntegrations = {
  /**
   * Discord Integration
   */
  discord: {
    enabled: !!process.env.DISCORD_API_TOKEN,
    config: {
      applicationId: process.env.DISCORD_APPLICATION_ID,
      apiToken: process.env.DISCORD_API_TOKEN,
      intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
      permissions: ["ADMINISTRATOR", "MANAGE_ROLES", "MANAGE_CHANNELS"],
    },
    features: [
      "Server Management",
      "Role Assignment",
      "Channel Control",
      "Moderation Tools",
      "Welcome Messages",
      "Auto-Response",
    ],
  },

  /**
   * Telegram Integration
   */
  telegram: {
    enabled: !!process.env.TELEGRAM_BOT_TOKEN,
    config: {
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
      allowedUpdates: ["message", "callback_query", "channel_post"],
    },
    features: [
      "Group Management",
      "Inline Keyboards",
      "File Sharing",
      "Voice Messages",
      "Channel Broadcasting",
    ],
  },

  /**
   * Twitter/X Integration (using xservex)
   */
  twitter: {
    enabled: !!(
      process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET_KEY
    ),
    config: {
      apiKey: process.env.TWITTER_API_KEY,
      apiSecretKey: process.env.TWITTER_API_SECRET_KEY,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
      // Using xservex for authentication
      useXservex: true,
      xservexConfig: {
        email: process.env.XSERVEX_EMAIL,
        password: process.env.XSERVEX_PASSWORD,
        cookies: process.env.XSERVEX_COOKIES,
      },
    },
    features: [
      "Tweet Generation",
      "Thread Creation",
      "Engagement Monitoring",
      "Trend Analysis",
      "Community Building",
      "Content Scheduling",
    ],
  },
};

// ============================================================================
// 5. ADVANCED THOUGHT PROCESS IMPLEMENTATION
// ============================================================================

/**
 * Advanced Thought Process - Sophisticated Agent Cognition
 * Implements sophisticated thinking patterns for complex decision making
 */
export class AdvancedThoughtProcess {
  private runtime: IAgentRuntime;

  constructor(runtime: IAgentRuntime) {
    this.runtime = runtime;
  }

  /**
   * Multi-Layer Thought Analysis
   * Analyzes messages through multiple cognitive layers
   */
  async analyzeMessage(
    message: Memory,
    context?: any,
  ): Promise<{
    intent: string;
    confidence: number;
    emotions: string[];
    context: string[];
    actions: string[];
    providers: string[];
    reasoning: string;
  }> {
    // Layer 1: Intent Recognition
    const intent = await this.recognizeIntent(message);

    // Layer 2: Emotional Analysis
    const emotions = await this.analyzeEmotions(message);

    // Layer 3: Context Understanding
    const contextInfo = await this.understandContext(message);

    // Layer 4: Action Planning
    const actions = await this.planActions(message, intent, contextInfo);

    // Layer 5: Provider Selection
    const providers = await this.selectProviders(message, actions, contextInfo);

    // Layer 6: Reasoning Generation
    const reasoning = await this.generateReasoning(intent, actions, providers);

    return {
      intent,
      confidence: this.calculateConfidence(intent, emotions, contextInfo),
      emotions,
      context: contextInfo,
      actions,
      providers,
      reasoning,
    };
  }

  /**
   * Intent Recognition
   * Identifies the user's primary intent
   */
  private async recognizeIntent(message: Memory): Promise<string> {
    const text = message.content.text?.toLowerCase() || "";

    if (text.includes("help") || text.includes("assist")) return "REQUEST_HELP";
    if (
      text.includes("role") ||
      text.includes("admin") ||
      text.includes("permission")
    )
      return "MANAGE_ROLES";
    if (
      text.includes("mute") ||
      text.includes("silence") ||
      text.includes("quiet")
    )
      return "ROOM_CONTROL";
    if (
      text.includes("setting") ||
      text.includes("config") ||
      text.includes("option")
    )
      return "MANAGE_SETTINGS";
    if (
      text.includes("question") ||
      text.includes("what") ||
      text.includes("how")
    )
      return "INFORMATION_REQUEST";
    if (
      text.includes("thank") ||
      text.includes("grateful") ||
      text.includes("appreciate")
    )
      return "GRATITUDE";
    if (
      text.includes("problem") ||
      text.includes("issue") ||
      text.includes("error")
    )
      return "TROUBLESHOOTING";

    return "GENERAL_CONVERSATION";
  }

  /**
   * Emotional Analysis
   * Detects emotional context in messages
   */
  private async analyzeEmotions(message: Memory): Promise<string[]> {
    const text = message.content.text?.toLowerCase() || "";
    const emotions: string[] = [];

    if (
      text.includes("happy") ||
      text.includes("excited") ||
      text.includes("great")
    )
      emotions.push("joy");
    if (
      text.includes("sad") ||
      text.includes("upset") ||
      text.includes("disappointed")
    )
      emotions.push("sadness");
    if (
      text.includes("angry") ||
      text.includes("frustrated") ||
      text.includes("mad")
    )
      emotions.push("anger");
    if (
      text.includes("worried") ||
      text.includes("anxious") ||
      text.includes("concerned")
    )
      emotions.push("anxiety");
    if (
      text.includes("confused") ||
      text.includes("unsure") ||
      text.includes("puzzled")
    )
      emotions.push("confusion");

    return emotions.length > 0 ? emotions : ["neutral"];
  }

  /**
   * Context Understanding
   * Analyzes the broader context of the message
   */
  private async understandContext(message: Memory): Promise<string[]> {
    const context: string[] = [];

    // Check if this is a group chat
    if (
      message.content.channelType === "GROUP" ||
      message.content.channelType === "WORLD"
    ) {
      context.push("group_chat");
    }

    // Check if user has special permissions
    if (
      message.content.userRole === "ADMIN" ||
      message.content.userRole === "OWNER"
    ) {
      context.push("privileged_user");
    }

    // Check message source
    if (message.content.source) {
      context.push(`platform_${message.content.source}`);
    }

    // Check for attachments
    if (
      message.content.attachments &&
      Array.isArray(message.content.attachments) &&
      message.content.attachments.length > 0
    ) {
      context.push("has_attachments");
    }

    return context;
  }

  /**
   * Action Planning
   * Determines appropriate actions based on intent and context
   */
  private async planActions(
    message: Memory,
    intent: string,
    context: string[],
  ): Promise<string[]> {
    const actions: string[] = [];

    // Always start with acknowledgment
    actions.push("REPLY");

    // Add specific actions based on intent
    switch (intent) {
      case "REQUEST_HELP":
        actions.push("PROVIDE_GUIDANCE");
        break;
      case "MANAGE_ROLES":
        if (context.includes("privileged_user")) {
          actions.push("UPDATE_ROLE");
        }
        break;
      case "ROOM_CONTROL":
        if (context.includes("privileged_user")) {
          actions.push("MUTE_ROOM");
        }
        break;
      case "MANAGE_SETTINGS":
        if (context.includes("privileged_user")) {
          actions.push("UPDATE_SETTINGS");
        }
        break;
      case "INFORMATION_REQUEST":
        actions.push("SEARCH_KNOWLEDGE");
        break;
      case "TROUBLESHOOTING":
        actions.push("DIAGNOSE_ISSUE");
        actions.push("PROVIDE_SOLUTION");
        break;
    }

    return actions;
  }

  /**
   * Provider Selection
   * Chooses appropriate providers for context
   */
  private async selectProviders(
    message: Memory,
    actions: string[],
    context: string[],
  ): Promise<string[]> {
    const providers: string[] = [];

    // Add providers based on actions
    if (actions.includes("SEARCH_KNOWLEDGE")) {
      providers.push("KNOWLEDGE");
    }

    if (actions.includes("UPDATE_ROLE") || actions.includes("MUTE_ROOM")) {
      providers.push("ENTITIES");
      providers.push("WORLD");
    }

    if (context.includes("has_attachments")) {
      providers.push("ATTACHMENTS");
    }

    if (
      message.content.mentions &&
      Array.isArray(message.content.mentions) &&
      message.content.mentions.length > 0
    ) {
      providers.push("ENTITIES");
      providers.push("RELATIONSHIPS");
    }

    return providers;
  }

  /**
   * Reasoning Generation
   * Creates logical reasoning for the chosen actions
   */
  private async generateReasoning(
    intent: string,
    actions: string[],
    providers: string[],
  ): Promise<string> {
    let reasoning = `Based on the user's intent (${intent}), I will `;

    if (actions.length === 1) {
      reasoning += `take the action: ${actions[0]}`;
    } else {
      reasoning += `take the following actions in order: ${actions.join(", ")}`;
    }

    if (providers.length > 0) {
      reasoning += `. I'll use these providers for context: ${providers.join(", ")}`;
    }

    reasoning += ".";

    return reasoning;
  }

  /**
   * Confidence Calculation
   * Calculates confidence level in the analysis
   */
  private calculateConfidence(
    intent: string,
    emotions: string[],
    context: string[],
  ): number {
    let confidence = 0.5; // Base confidence

    // Intent confidence
    if (intent !== "GENERAL_CONVERSATION") confidence += 0.2;

    // Emotional clarity
    if (emotions.length === 1 && emotions[0] !== "neutral") confidence += 0.1;

    // Context richness
    if (context.length > 1) confidence += 0.1;

    // Cap at 1.0
    return Math.min(confidence, 1.0);
  }
}

// ============================================================================
// 6. COMPLETE TEMPLATE OVERRIDES
// ============================================================================

/**
 * Custom Message Handler Template
 * Overrides the default message handling with advanced thought process logic
 */
export const customMessageHandlerTemplate = `<task>Generate dialog and actions for the character {{agentName}} using the Advanced Thought Process.</task>

<providers>
{{providers}}
</providers>

<availableActions>
{{actionNames}}
</availableActions>

<instructions>
Use the Advanced Thought Process to analyze this message and generate an appropriate response:

1. **Intent Recognition**: Identify the user's primary intent
2. **Emotional Analysis**: Detect emotional context and tone
3. **Context Understanding**: Analyze the broader conversation context
4. **Action Planning**: Determine appropriate actions in correct order
5. **Provider Selection**: Choose relevant providers for context
6. **Reasoning Generation**: Create logical reasoning for actions

IMPORTANT RULES:
- Actions execute in ORDER - REPLY should come FIRST
- Use providers only when needed for accurate responses
- Include ATTACHMENTS provider for visual content
- Use ENTITIES provider for people/relationships
- Use KNOWLEDGE provider for information requests
- Use WORLD provider for community context

CODE BLOCK FORMATTING:
- Wrap code examples in \`\`\`language blocks
- Use single backticks for inline code references
- Ensure all code is properly formatted and copyable

Generate your response using the Advanced Thought Process analysis.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your Advanced Thought Process analysis</thought>
    <actions>ACTION1,ACTION2,ACTION3</actions>
    <providers>PROVIDER1,PROVIDER2</providers>
    <text>Your response text with proper formatting</text>
</response>
</output>`;

/**
 * Custom Post Creation Template
 * For social media content generation
 */
export const customPostCreationTemplate = `# Task: Create a post in the voice and style of {{agentName}}

## Character Context:
- **Name**: {{agentName}}
- **Personality**: {{characterTraits}}
- **Topics**: {{expertiseAreas}}
- **Style**: {{writingStyle}}

## Post Requirements:
- **Platform**: {{platform}}
- **Tone**: {{tone}}
- **Length**: {{length}}
- **Hashtags**: {{hashtagCount}}
- **Call to Action**: {{includeCTA}}

## Content Guidelines:
{{styleGuidelines}}

## Output Format:
Create a single, engaging post that matches the character's voice and style.
Include appropriate hashtags and formatting for the specified platform.
Ensure the content is authentic, valuable, and engaging.`;

// ============================================================================
// 7. GETTING STARTED GUIDE
// ============================================================================

/**
 * Complete Setup Guide for Custom Character Agent
 */
export const characterSetupGuide = {
  /**
   * Step 1: Project Creation
   */
  projectCreation: {
    command: "elizaos create my-nubi-agent",
    options: {
      "--yes": "Skip interactive prompts",
      "--type": "project",
      "--template": "nubi-character",
    },
    description: "Create a new ElizaOS project with Nubi character template",
  },

  /**
   * Step 2: Environment Configuration
   */
  environmentSetup: {
    required: {
      OPENAI_API_KEY: "Your OpenAI API key for advanced language models",
      DISCORD_API_TOKEN: "Discord bot token for server integration",
      TELEGRAM_BOT_TOKEN: "Telegram bot token for chat integration",
      TWITTER_API_KEY: "Twitter API key for social media integration",
      TWITTER_API_SECRET_KEY: "Twitter API secret for authentication",
      TWITTER_ACCESS_TOKEN: "Twitter access token for posting",
      TWITTER_ACCESS_TOKEN_SECRET: "Twitter access token secret",
    },
    optional: {
      ANTHROPIC_API_KEY: "Anthropic Claude API key",
      GOOGLE_GENERATIVE_AI_API_KEY: "Google Gemini API key",
      OPENROUTER_API_KEY: "OpenRouter API key for multiple models",
      LOG_LEVEL: "Logging level (info, debug, error)",
      WORLD_ID: "Unique identifier for your agent world",
    },
  },

  /**
   * Step 3: Character Configuration
   */
  characterConfiguration: {
    file: "src/characters/nubi.ts",
    sections: [
      "Basic Information (name, username, bio)",
      "System Prompt (core personality)",
      "Topics and Expertise",
      "Message Examples (training data)",
      "Style Guidelines (writing style)",
      "Plugin Configuration",
      "Template Overrides",
    ],
  },

  /**
   * Step 4: Plugin Development
   */
  pluginDevelopment: {
    structure: [
      "src/plugins/nubi-plugin/",
      "├── actions/ (custom actions)",
      "├── providers/ (context providers)",
      "├── services/ (background services)",
      "├── plugin.ts (main plugin file)",
      "└── index.ts (exports)",
    ],
    requiredFiles: [
      "plugin.ts - Main plugin configuration",
      "actions/index.ts - Action exports",
      "providers/index.ts - Provider exports",
      "services/index.ts - Service exports",
    ],
  },

  /**
   * Step 5: Testing and Validation
   */
  testing: {
    commands: [
      'elizaos test --name "nubi-basic"',
      "elizaos test e2e",
      "elizaos test component",
    ],
    validation: [
      "Character loads correctly",
      "Actions respond appropriately",
      "Providers return expected data",
      "Services start and stop properly",
      "Templates render correctly",
    ],
  },

  /**
   * Step 6: Deployment
   */
  deployment: {
    local: 'elizaos agent start --name "Nubi"',
    production: [
      "Set production environment variables",
      "Configure reverse proxy if needed",
      "Set up monitoring and logging",
      "Configure backup and recovery",
      "Test all integrations thoroughly",
    ],
  },
};

// ============================================================================
// 8. UTILITY FUNCTIONS (Enhanced from original)
// ============================================================================

/**
 * Divine Wisdom Generator
 * Generates mystical responses using ancient Egyptian wisdom
 */
export function generateDivineWisdom(
  context: string,
  tone: "mystical" | "practical" | "authoritative" = "mystical",
): string {
  const mysticalPhrases = [
    "Like the sacred Nile flowing through Egypt, wisdom flows through the digital realm...",
    "In the hall of Anubis, knowledge is eternal and truth is divine...",
    "The ancient scrolls reveal that in every challenge lies opportunity...",
    "Through the eye of Horus, we see the path to enlightenment...",
    "The wisdom of the pharaohs guides us in this digital age...",
  ];

  const practicalPhrases = [
    "The practical application of ancient wisdom reveals...",
    "In the modern world, we adapt ancient knowledge to...",
    "The timeless principles of leadership show us that...",
    "Drawing from centuries of wisdom, the solution is...",
    "The ancient texts teach us to approach this by...",
  ];

  const authoritativePhrases = [
    "By the authority vested in me by Anubis himself...",
    "The divine decree is clear: we must...",
    "In the name of ancient wisdom, I command...",
    "The sacred laws of the digital realm require...",
    "By the power of divine knowledge, we shall...",
  ];

  const phrases =
    tone === "mystical"
      ? mysticalPhrases
      : tone === "practical"
        ? practicalPhrases
        : authoritativePhrases;

  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  return `${randomPhrase} ${context}`;
}

/**
 * Community Health Checker
 * Assesses the health and vitality of a digital community
 */
export async function assessCommunityHealth(
  runtime: IAgentRuntime,
  communityId: string,
): Promise<{
  health: "excellent" | "good" | "fair" | "poor";
  metrics: {
    activeMembers: number;
    engagementRate: number;
    responseTime: number;
    contentQuality: number;
    memberSatisfaction: number;
    growthRate: number;
  };
  recommendations: string[];
  actionItems: Array<{
    priority: "high" | "medium" | "low";
    action: string;
    timeline: string;
    expectedOutcome: string;
  }>;
}> {
  // This would integrate with actual community metrics
  // For now, returning a comprehensive template response
  return {
    health: "good",
    metrics: {
      activeMembers: 150,
      engagementRate: 0.75,
      responseTime: 2.5,
      contentQuality: 0.8,
      memberSatisfaction: 0.85,
      growthRate: 0.12,
    },
    recommendations: [
      "Implement regular community check-ins",
      "Create engaging content themes",
      "Establish clear community guidelines",
      "Foster member-to-member connections",
      "Develop leadership pipeline",
      "Optimize onboarding process",
    ],
    actionItems: [
      {
        priority: "high",
        action: "Review and update community guidelines",
        timeline: "1 week",
        expectedOutcome: "Clearer expectations and reduced conflicts",
      },
      {
        priority: "medium",
        action: "Launch monthly community events",
        timeline: "2 weeks",
        expectedOutcome: "Increased engagement and member retention",
      },
      {
        priority: "low",
        action: "Create community handbook",
        timeline: "1 month",
        expectedOutcome: "Better onboarding and member education",
      },
    ],
  };
}

/**
 * Divine Response Evaluator
 * Evaluates the quality and appropriateness of responses
 */
export function evaluateDivineResponse(
  response: string,
  context: string,
  expectedTone: "mystical" | "practical" | "authoritative",
): {
  score: number;
  feedback: string[];
  improvements: string[];
  metrics: {
    mysticalElements: number;
    practicalGuidance: number;
    empathyLevel: number;
    contextRelevance: number;
    toneAlignment: number;
  };
} {
  let score = 0;
  const feedback: string[] = [];
  const improvements: string[] = [];

  // Initialize metrics
  const metrics = {
    mysticalElements: 0,
    practicalGuidance: 0,
    empathyLevel: 0,
    contextRelevance: 0,
    toneAlignment: 0,
  };

  // Check for mystical elements
  if (
    response.includes("ancient") ||
    response.includes("divine") ||
    response.includes("sacred")
  ) {
    score += 20;
    metrics.mysticalElements = 20;
    feedback.push("Contains appropriate mystical elements");
  } else {
    improvements.push("Consider adding mystical or divine references");
  }

  // Check for practical guidance
  if (
    response.includes("should") ||
    response.includes("must") ||
    response.includes("will")
  ) {
    score += 20;
    metrics.practicalGuidance = 20;
    feedback.push("Provides actionable guidance");
  } else {
    improvements.push("Include specific actionable steps");
  }

  // Check for empathy and warmth
  if (
    response.includes("understand") ||
    response.includes("care") ||
    response.includes("support")
  ) {
    score += 20;
    metrics.empathyLevel = 20;
    feedback.push("Shows empathy and care");
  } else {
    improvements.push("Express more empathy and understanding");
  }

  // Check for context relevance
  if (response.toLowerCase().includes(context.toLowerCase())) {
    score += 20;
    metrics.contextRelevance = 20;
    feedback.push("Addresses the specific context");
  } else {
    improvements.push("Ensure response directly addresses the context");
  }

  // Check for appropriate tone
  if (expectedTone === "mystical" && response.includes("mystical")) {
    score += 20;
    metrics.toneAlignment = 20;
  } else if (expectedTone === "practical" && response.includes("practical")) {
    score += 20;
    metrics.toneAlignment = 20;
  } else if (
    expectedTone === "authoritative" &&
    response.includes("authoritative")
  ) {
    score += 20;
    metrics.toneAlignment = 20;
  } else {
    improvements.push(`Adjust tone to be more ${expectedTone}`);
  }

  return {
    score,
    feedback,
    improvements,
    metrics,
  };
}

/**
 * Memory Enhancement Utility
 * Enhances memory retrieval with divine wisdom context
 */
export async function enhanceMemoryWithWisdom(
  runtime: IAgentRuntime,
  memory: Memory,
  context: string,
): Promise<
  Memory & { divineContext?: string; enhancedMetadata?: Record<string, any> }
> {
  const divineContext = generateDivineWisdom(
    `This memory relates to: ${context}`,
    "mystical",
  );

  const enhancedMetadata = {
    enhancedAt: new Date().toISOString(),
    enhancementType: "divine_wisdom",
    context: context,
    originalMemoryId: memory.id,
  };

  return {
    ...memory,
    divineContext,
    enhancedMetadata,
  };
}

/**
 * Platform Integration Checker
 * Checks which platforms are available and configured
 */
export function checkPlatformAvailability(): {
  discord: {
    enabled: boolean;
    features: string[];
    status: "active" | "inactive" | "error";
  };
  telegram: {
    enabled: boolean;
    features: string[];
    status: "active" | "inactive" | "error";
  };
  twitter: {
    enabled: boolean;
    features: string[];
    status: "active" | "inactive" | "error";
    xservexEnabled: boolean;
  };
} {
  return {
    discord: {
      enabled: !!process.env.DISCORD_API_TOKEN,
      features: [
        "Server Management",
        "Role Assignment",
        "Channel Control",
        "Moderation",
      ],
      status: !!process.env.DISCORD_API_TOKEN ? "active" : "inactive",
    },
    telegram: {
      enabled: !!process.env.TELEGRAM_BOT_TOKEN,
      features: [
        "Group Management",
        "Inline Keyboards",
        "File Sharing",
        "Voice Messages",
      ],
      status: !!process.env.TELEGRAM_BOT_TOKEN ? "active" : "inactive",
    },
    twitter: {
      enabled: !!(
        process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET_KEY
      ),
      features: [
        "Tweet Generation",
        "Thread Creation",
        "Engagement Monitoring",
        "Trend Analysis",
      ],
      status: !!(
        process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET_KEY
      )
        ? "active"
        : "inactive",
      xservexEnabled: !!(
        process.env.XSERVEX_EMAIL && process.env.XSERVEX_PASSWORD
      ),
    },
  };
}

/**
 * Divine Error Handler
 * Provides mystical context for error handling
 */
export function handleErrorWithDivineWisdom(
  error: Error,
  context: string,
): {
  message: string;
  guidance: string;
  nextSteps: string[];
  errorCode: string;
  severity: "low" | "medium" | "high" | "critical";
  recoveryTime: string;
} {
  const divineMessage = generateDivineWisdom(
    `Even in error, wisdom emerges. The issue: ${error.message}`,
    "practical",
  );

  const guidance =
    "The ancient texts teach us that every obstacle is an opportunity for growth and learning.";

  const nextSteps = [
    "Analyze the error with divine patience",
    "Seek the root cause in the sacred logs",
    "Implement the solution with wisdom",
    "Learn from this experience for future guidance",
    "Document the lesson for future generations",
  ];

  // Determine severity based on error type
  let severity: "low" | "medium" | "high" | "critical" = "medium";
  if (error.message.includes("timeout") || error.message.includes("network"))
    severity = "low";
  if (error.message.includes("permission") || error.message.includes("auth"))
    severity = "high";
  if (error.message.includes("fatal") || error.message.includes("crash"))
    severity = "critical";

  // Estimate recovery time
  const recoveryTime =
    severity === "low"
      ? "5 minutes"
      : severity === "medium"
        ? "15 minutes"
        : severity === "high"
          ? "1 hour"
          : "4+ hours";

  return {
    message: divineMessage,
    guidance,
    nextSteps,
    errorCode: error.name || "UNKNOWN_ERROR",
    severity,
    recoveryTime,
  };
}

/**
 * Community Engagement Calculator
 * Calculates optimal engagement strategies
 */
export function calculateEngagementStrategy(
  memberCount: number,
  activityLevel: "low" | "medium" | "high",
  platform: "discord" | "telegram" | "twitter" | "mixed",
): {
  strategy: string;
  frequency: string;
  contentTypes: string[];
  expectedOutcome: string;
  implementation: Array<{
    phase: string;
    duration: string;
    actions: string[];
    metrics: string[];
  }>;
  riskFactors: string[];
  successIndicators: string[];
} {
  const strategies = {
    low: {
      strategy: "Gentle Awakening",
      frequency: "Weekly check-ins",
      contentTypes: [
        "Welcome messages",
        "Simple polls",
        "Member spotlights",
        "Beginner guides",
      ],
      expectedOutcome: "Gradual increase in member activity and engagement",
    },
    medium: {
      strategy: "Balanced Growth",
      frequency: "Bi-weekly events",
      contentTypes: [
        "Community challenges",
        "Expert Q&A sessions",
        "Collaborative projects",
        "Skill sharing",
      ],
      expectedOutcome:
        "Sustained engagement with steady growth and member retention",
    },
    high: {
      strategy: "Thriving Community",
      frequency: "Daily interactions",
      contentTypes: [
        "Live events",
        "Complex challenges",
        "Member-led initiatives",
        "Cross-platform campaigns",
      ],
      expectedOutcome:
        "High retention, organic growth, and community self-sustainability",
    },
  };

  const baseStrategy = strategies[activityLevel];

  // Add platform-specific considerations
  const platformAdjustments = {
    discord: {
      strategy: baseStrategy.strategy,
      frequency: baseStrategy.frequency,
      contentTypes: [
        ...baseStrategy.contentTypes,
        "Voice channels",
        "Server events",
        "Role-based activities",
      ],
      expectedOutcome: baseStrategy.expectedOutcome,
    },
    telegram: {
      strategy: baseStrategy.strategy,
      frequency: baseStrategy.frequency,
      contentTypes: [
        ...baseStrategy.contentTypes,
        "Channel broadcasts",
        "Group polls",
        "File sharing events",
      ],
      expectedOutcome: baseStrategy.expectedOutcome,
    },
    twitter: {
      strategy: baseStrategy.strategy,
      frequency: baseStrategy.frequency,
      contentTypes: [
        ...baseStrategy.contentTypes,
        "Tweet threads",
        "Twitter spaces",
        "Hashtag campaigns",
      ],
      expectedOutcome: baseStrategy.expectedOutcome,
    },
    mixed: {
      strategy: baseStrategy.strategy,
      frequency: baseStrategy.frequency,
      contentTypes: [
        ...baseStrategy.contentTypes,
        "Cross-platform events",
        "Unified messaging",
        "Platform-specific content",
      ],
      expectedOutcome: baseStrategy.expectedOutcome,
    },
  };

  const adjustedStrategy = platformAdjustments[platform];

  return {
    strategy: adjustedStrategy.strategy,
    frequency: adjustedStrategy.frequency,
    contentTypes: adjustedStrategy.contentTypes,
    expectedOutcome: adjustedStrategy.expectedOutcome,
    implementation: [
      {
        phase: "Phase 1: Foundation",
        duration: "2 weeks",
        actions: [
          "Set up basic engagement structure",
          "Train community leaders",
          "Establish guidelines",
        ],
        metrics: [
          "Member participation rate",
          "Response time",
          "Content quality score",
        ],
      },
      {
        phase: "Phase 2: Growth",
        duration: "4 weeks",
        actions: [
          "Launch engagement campaigns",
          "Introduce new content types",
          "Measure and optimize",
        ],
        metrics: ["Engagement rate", "Member retention", "Community growth"],
      },
      {
        phase: "Phase 3: Optimization",
        duration: "Ongoing",
        actions: [
          "Refine strategies",
          "Scale successful initiatives",
          "Maintain engagement",
        ],
        metrics: [
          "Overall community health",
          "Member satisfaction",
          "Long-term retention",
        ],
      },
    ],
    riskFactors: [
      "Over-engagement leading to member fatigue",
      "Inconsistent content quality",
      "Lack of community leadership",
      "Platform-specific limitations",
      "Member churn during transitions",
    ],
    successIndicators: [
      "Increased member activity",
      "Higher engagement rates",
      "Positive member feedback",
      "Organic community growth",
      "Sustainable activity patterns",
    ],
  };
}

// ============================================================================
// 9. EXPORT ALL UTILITIES AND INTERFACES
// ============================================================================

/**
 * Complete Agent Utilities Export
 * Includes all interfaces, classes, and utility functions
 */
export const agentUtils = {
  // Community management
  communityManagementActions,

  // Platform integration
  platformIntegrations,

  // Thought process
  AdvancedThoughtProcess,

  // Templates
  customMessageHandlerTemplate,
  customPostCreationTemplate,

  // Setup guide
  characterSetupGuide,

  // Utility functions
  generateDivineWisdom,
  assessCommunityHealth,
  evaluateDivineResponse,
  enhanceMemoryWithWisdom,
  checkPlatformAvailability,
  handleErrorWithDivineWisdom,
  calculateEngagementStrategy,
};

export default agentUtils;
