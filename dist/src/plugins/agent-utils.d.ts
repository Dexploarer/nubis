import type { IAgentRuntime, Memory, State, UUID } from "@elizaos/core";
/**
 * Get memories with caching support
 * Falls back to runtime query if not cached
 */
export declare function getCachedMemories(runtime: IAgentRuntime, params: {
    tableName: string;
    roomId: string;
    count?: number;
    unique?: boolean;
    entityId?: string;
    agentId?: string;
    worldId?: string;
}): Promise<Memory[]>;
/**
 * Get search results with caching support
 * Caches semantic search results for repeated queries
 */
export declare function getCachedSearchResults(runtime: IAgentRuntime, params: {
    tableName: string;
    embedding?: number[];
    roomId: string;
    count?: number;
    query?: string;
    similarityThreshold?: number;
}): Promise<Memory[]>;
/**
 * Clear memory cache for specific patterns
 * Useful when memories are updated or deleted
 */
export declare function clearMemoryCache(pattern?: string): void;
/**
 * Get cache statistics for monitoring
 */
export declare function getMemoryCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    missRate: number;
    ttl: number;
};
/**
 * Create multiple memories in a single batch operation
 * Significantly improves performance for bulk memory creation
 */
export declare function createMemoriesBatch(runtime: IAgentRuntime, memories: Memory[], tableName: string, unique?: boolean): Promise<UUID[]>;
/**
 * Update multiple memories in batch
 * Efficiently updates multiple memory records
 */
export declare function updateMemoriesBatch(runtime: IAgentRuntime, updates: Array<{
    id: UUID;
    updates: Partial<Memory>;
}>): Promise<{
    success: boolean;
    updatedCount: number;
    errors: string[];
}>;
/**
 * Delete multiple memories in batch
 * Efficiently removes multiple memory records
 */
export declare function deleteMemoriesBatch(runtime: IAgentRuntime, memoryIds: UUID[]): Promise<{
    success: boolean;
    deletedCount: number;
    errors: string[];
}>;
/**
 * Create memory with lazy embedding generation
 * Only generates embeddings when needed for search operations
 */
export declare function createMemoryWithLazyEmbedding(runtime: IAgentRuntime, memory: Omit<Memory, 'embedding'>, tableName: string, unique?: boolean): Promise<UUID>;
/**
 * Generate embeddings for memories that need them
 * Batch embedding generation for better performance
 */
export declare function generateEmbeddingsForMemories(runtime: IAgentRuntime, memories: Memory[]): Promise<Memory[]>;
/**
 * Get comprehensive context for a conversation
 * Combines messages, facts, and entities in a single optimized query
 */
export declare function getContextualMemories(runtime: IAgentRuntime, roomId: string, userMessage: string, options?: {
    messageCount?: number;
    factCount?: number;
    entityCount?: number;
    similarityThreshold?: number;
    includeEmbeddings?: boolean;
}): Promise<{
    messages: Memory[];
    facts: Memory[];
    entities: Memory[];
    context: string;
    metadata: {
        totalMemories: number;
        cacheHit: boolean;
        queryTime: number;
    };
}>;
/**
 * Get memories by multiple criteria in a single optimized query
 * Reduces multiple database calls to a single operation
 */
export declare function getMemoriesByMultipleCriteria(runtime: IAgentRuntime, criteria: {
    tableNames: string[];
    filters: {
        roomId?: string;
        entityId?: string;
        agentId?: string;
        worldId?: string;
        memoryType?: string;
        dateRange?: {
            start: number;
            end: number;
        };
        tags?: string[];
    };
    counts: Record<string, number>;
    includeEmbeddings?: boolean;
}): Promise<Record<string, Memory[]>>;
/**
 * Memory system performance metrics
 * Tracks performance for optimization analysis
 */
export interface MemorySystemMetrics {
    cacheStats: {
        hitRate: number;
        missRate: number;
        size: number;
        maxSize: number;
    };
    operationLatency: {
        create: number[];
        retrieve: number[];
        search: number[];
        update: number[];
        delete: number[];
    };
    throughput: {
        operationsPerSecond: number;
        averageBatchSize: number;
        totalMemories: number;
    };
}
declare const performanceMetrics: {
    operationLatency: {
        create: number[];
        retrieve: number[];
        search: number[];
        update: number[];
        delete: number[];
    };
    operationCounts: {
        create: number;
        retrieve: number;
        search: number;
        update: number;
        delete: number;
    };
    startTime: number;
};
/**
 * Track memory operation performance
 * Records timing data for performance analysis
 */
export declare function trackMemoryOperation(operation: keyof typeof performanceMetrics.operationLatency, duration: number): void;
/**
 * Get comprehensive memory system metrics
 * Provides insights for performance optimization
 */
export declare function getMemorySystemMetrics(): MemorySystemMetrics;
/**
 * Reset memory system metrics
 * Useful for testing and performance benchmarking
 */
export declare function resetMemorySystemMetrics(): void;
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
    messageExamples?: Array<Array<{
        name: string;
        content: {
            text: string;
            actions?: string[];
            providers?: string[];
            source?: string;
        };
    }>>;
    /** Example posts for social media platforms */
    postExamples?: string[];
    /** Areas of expertise and knowledge */
    topics?: string[];
    /** Character personality traits */
    adjectives?: string[];
    /** Knowledge base and resources */
    knowledge?: Array<string | {
        path: string;
        shared?: boolean;
        description?: string;
    } | {
        type: "file" | "url" | "database";
        content: string;
        metadata?: Record<string, any>;
    }>;
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
    validate: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<boolean>;
    /** The main execution logic */
    handler: (runtime: IAgentRuntime, message: Memory, state?: State, options?: any, callback?: (response: any) => Promise<void>, responses?: Memory[]) => Promise<{
        text: string;
        success: boolean;
        data?: any;
        error?: Error;
        values?: Record<string, any>;
    }>;
    /** Training examples for the action */
    examples: Array<Array<{
        name: string;
        content: {
            text: string;
            actions?: string[];
            providers?: string[];
            source?: string;
        };
    }>>;
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
    get: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<{
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
/**
 * Complete Community Management Actions
 */
export declare const communityManagementActions: {
    /**
     * Role Management Action
     * Handles user role assignments and permissions
     */
    updateRole: {
        name: string;
        similes: string[];
        description: string;
        validate: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<boolean>;
        handler: (runtime: IAgentRuntime, message: Memory, state?: State, options?: any, callback?: (response: any) => Promise<void>) => Promise<{
            text: string;
            success: boolean;
            data: {
                action: string;
            };
        }>;
        examples: ({
            name: string;
            content: {
                text: string;
                source: string;
                actions?: undefined;
            };
        } | {
            name: string;
            content: {
                text: string;
                actions: string[];
                source?: undefined;
            };
        })[][];
    };
    /**
     * Room Control Actions
     */
    muteRoom: {
        name: string;
        similes: string[];
        description: string;
        validate: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<boolean>;
        handler: (runtime: IAgentRuntime, message: Memory, state?: State, options?: any, callback?: (response: any) => Promise<void>) => Promise<{
            text: string;
            success: boolean;
            data: {
                action: string;
            };
        }>;
        examples: ({
            name: string;
            content: {
                text: string;
                source: string;
                actions?: undefined;
            };
        } | {
            name: string;
            content: {
                text: string;
                actions: string[];
                source?: undefined;
            };
        })[][];
    };
    /**
     * Settings Management Action
     */
    updateSettings: {
        name: string;
        similes: string[];
        description: string;
        validate: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<boolean>;
        handler: (runtime: IAgentRuntime, message: Memory, state?: State, options?: any, callback?: (response: any) => Promise<void>) => Promise<{
            text: string;
            success: boolean;
            data: {
                action: string;
            };
        }>;
        examples: ({
            name: string;
            content: {
                text: string;
                source: string;
                actions?: undefined;
            };
        } | {
            name: string;
            content: {
                text: string;
                actions: string[];
                source?: undefined;
            };
        })[][];
    };
};
/**
 * Complete Platform Integration Configuration
 */
export declare const platformIntegrations: {
    /**
     * Discord Integration
     */
    discord: {
        enabled: boolean;
        config: {
            applicationId: string | undefined;
            apiToken: string | undefined;
            intents: string[];
            permissions: string[];
        };
        features: string[];
    };
    /**
     * Telegram Integration
     */
    telegram: {
        enabled: boolean;
        config: {
            botToken: string | undefined;
            webhookUrl: string | undefined;
            allowedUpdates: string[];
        };
        features: string[];
    };
    /**
     * Twitter/X Integration (using xservex)
     */
    twitter: {
        enabled: boolean;
        config: {
            apiKey: string | undefined;
            apiSecretKey: string | undefined;
            accessToken: string | undefined;
            accessTokenSecret: string | undefined;
            useXservex: boolean;
            xservexConfig: {
                email: string | undefined;
                password: string | undefined;
                cookies: string | undefined;
            };
        };
        features: string[];
    };
};
/**
 * Advanced Thought Process - Sophisticated Agent Cognition
 * Implements sophisticated thinking patterns for complex decision making
 */
export declare class AdvancedThoughtProcess {
    private runtime;
    constructor(runtime: IAgentRuntime);
    /**
     * Multi-Layer Thought Analysis
     * Analyzes messages through multiple cognitive layers
     */
    analyzeMessage(message: Memory, context?: any): Promise<{
        intent: string;
        confidence: number;
        emotions: string[];
        context: string[];
        actions: string[];
        providers: string[];
        reasoning: string;
    }>;
    /**
     * Intent Recognition
     * Identifies the user's primary intent
     */
    private recognizeIntent;
    /**
     * Emotional Analysis
     * Detects emotional context in messages
     */
    private analyzeEmotions;
    /**
     * Context Understanding
     * Analyzes the broader context of the message
     */
    private understandContext;
    /**
     * Action Planning
     * Determines appropriate actions based on intent and context
     */
    private planActions;
    /**
     * Provider Selection
     * Chooses appropriate providers for context
     */
    private selectProviders;
    /**
     * Reasoning Generation
     * Creates logical reasoning for the chosen actions
     */
    private generateReasoning;
    /**
     * Confidence Calculation
     * Calculates confidence level in the analysis
     */
    private calculateConfidence;
}
/**
 * Custom Message Handler Template
 * Overrides the default message handling with advanced thought process logic
 */
export declare const customMessageHandlerTemplate = "<task>Generate dialog and actions for the character {{agentName}} using the Advanced Thought Process.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<availableActions>\n{{actionNames}}\n</availableActions>\n\n<instructions>\nUse the Advanced Thought Process to analyze this message and generate an appropriate response:\n\n1. **Intent Recognition**: Identify the user's primary intent\n2. **Emotional Analysis**: Detect emotional context and tone\n3. **Context Understanding**: Analyze the broader conversation context\n4. **Action Planning**: Determine appropriate actions in correct order\n5. **Provider Selection**: Choose relevant providers for context\n6. **Reasoning Generation**: Create logical reasoning for actions\n\nIMPORTANT RULES:\n- Actions execute in ORDER - REPLY should come FIRST\n- Use providers only when needed for accurate responses\n- Include ATTACHMENTS provider for visual content\n- Use ENTITIES provider for people/relationships\n- Use KNOWLEDGE provider for information requests\n- Use WORLD provider for community context\n\nCODE BLOCK FORMATTING:\n- Wrap code examples in ```language blocks\n- Use single backticks for inline code references\n- Ensure all code is properly formatted and copyable\n\nGenerate your response using the Advanced Thought Process analysis.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your Advanced Thought Process analysis</thought>\n    <actions>ACTION1,ACTION2,ACTION3</actions>\n    <providers>PROVIDER1,PROVIDER2</providers>\n    <text>Your response text with proper formatting</text>\n</response>\n</output>";
/**
 * Custom Post Creation Template
 * For social media content generation
 */
export declare const customPostCreationTemplate = "# Task: Create a post in the voice and style of {{agentName}}\n\n## Character Context:\n- **Name**: {{agentName}}\n- **Personality**: {{characterTraits}}\n- **Topics**: {{expertiseAreas}}\n- **Style**: {{writingStyle}}\n\n## Post Requirements:\n- **Platform**: {{platform}}\n- **Tone**: {{tone}}\n- **Length**: {{length}}\n- **Hashtags**: {{hashtagCount}}\n- **Call to Action**: {{includeCTA}}\n\n## Content Guidelines:\n{{styleGuidelines}}\n\n## Output Format:\nCreate a single, engaging post that matches the character's voice and style.\nInclude appropriate hashtags and formatting for the specified platform.\nEnsure the content is authentic, valuable, and engaging.";
/**
 * Complete Setup Guide for Custom Character Agent
 */
export declare const characterSetupGuide: {
    /**
     * Step 1: Project Creation
     */
    projectCreation: {
        command: string;
        options: {
            "--yes": string;
            "--type": string;
            "--template": string;
        };
        description: string;
    };
    /**
     * Step 2: Environment Configuration
     */
    environmentSetup: {
        required: {
            OPENAI_API_KEY: string;
            DISCORD_API_TOKEN: string;
            TELEGRAM_BOT_TOKEN: string;
            TWITTER_API_KEY: string;
            TWITTER_API_SECRET_KEY: string;
            TWITTER_ACCESS_TOKEN: string;
            TWITTER_ACCESS_TOKEN_SECRET: string;
        };
        optional: {
            ANTHROPIC_API_KEY: string;
            GOOGLE_GENERATIVE_AI_API_KEY: string;
            OPENROUTER_API_KEY: string;
            LOG_LEVEL: string;
            WORLD_ID: string;
        };
    };
    /**
     * Step 3: Character Configuration
     */
    characterConfiguration: {
        file: string;
        sections: string[];
    };
    /**
     * Step 4: Plugin Development
     */
    pluginDevelopment: {
        structure: string[];
        requiredFiles: string[];
    };
    /**
     * Step 5: Testing and Validation
     */
    testing: {
        commands: string[];
        validation: string[];
    };
    /**
     * Step 6: Deployment
     */
    deployment: {
        local: string;
        production: string[];
    };
};
/**
 * Divine Wisdom Generator
 * Generates mystical responses using ancient Egyptian wisdom
 */
export declare function generateDivineWisdom(context: string, tone?: "mystical" | "practical" | "authoritative"): string;
/**
 * Community Health Checker
 * Assesses the health and vitality of a digital community
 */
export declare function assessCommunityHealth(runtime: IAgentRuntime, communityId: string): Promise<{
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
}>;
/**
 * Divine Response Evaluator
 * Evaluates the quality and appropriateness of responses
 */
export declare function evaluateDivineResponse(response: string, context: string, expectedTone: "mystical" | "practical" | "authoritative"): {
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
};
/**
 * Memory Enhancement Utility
 * Enhances memory retrieval with divine wisdom context
 */
export declare function enhanceMemoryWithWisdom(runtime: IAgentRuntime, memory: Memory, context: string): Promise<Memory & {
    divineContext?: string;
    enhancedMetadata?: Record<string, any>;
}>;
/**
 * Platform Integration Checker
 * Checks which platforms are available and configured
 */
export declare function checkPlatformAvailability(): {
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
};
/**
 * Divine Error Handler
 * Provides mystical context for error handling
 */
export declare function handleErrorWithDivineWisdom(error: Error, context: string): {
    message: string;
    guidance: string;
    nextSteps: string[];
    errorCode: string;
    severity: "low" | "medium" | "high" | "critical";
    recoveryTime: string;
};
/**
 * Community Engagement Calculator
 * Calculates optimal engagement strategies
 */
export declare function calculateEngagementStrategy(memberCount: number, activityLevel: "low" | "medium" | "high", platform: "discord" | "telegram" | "twitter" | "mixed"): {
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
};
/**
 * Complete Agent Utilities Export
 * Includes all interfaces, classes, and utility functions
 */
export declare const agentUtils: {
    communityManagementActions: {
        /**
         * Role Management Action
         * Handles user role assignments and permissions
         */
        updateRole: {
            name: string;
            similes: string[];
            description: string;
            validate: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<boolean>;
            handler: (runtime: IAgentRuntime, message: Memory, state?: State, options?: any, callback?: (response: any) => Promise<void>) => Promise<{
                text: string;
                success: boolean;
                data: {
                    action: string;
                };
            }>;
            examples: ({
                name: string;
                content: {
                    text: string;
                    source: string;
                    actions?: undefined;
                };
            } | {
                name: string;
                content: {
                    text: string;
                    actions: string[];
                    source?: undefined;
                };
            })[][];
        };
        /**
         * Room Control Actions
         */
        muteRoom: {
            name: string;
            similes: string[];
            description: string;
            validate: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<boolean>;
            handler: (runtime: IAgentRuntime, message: Memory, state?: State, options?: any, callback?: (response: any) => Promise<void>) => Promise<{
                text: string;
                success: boolean;
                data: {
                    action: string;
                };
            }>;
            examples: ({
                name: string;
                content: {
                    text: string;
                    source: string;
                    actions?: undefined;
                };
            } | {
                name: string;
                content: {
                    text: string;
                    actions: string[];
                    source?: undefined;
                };
            })[][];
        };
        /**
         * Settings Management Action
         */
        updateSettings: {
            name: string;
            similes: string[];
            description: string;
            validate: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<boolean>;
            handler: (runtime: IAgentRuntime, message: Memory, state?: State, options?: any, callback?: (response: any) => Promise<void>) => Promise<{
                text: string;
                success: boolean;
                data: {
                    action: string;
                };
            }>;
            examples: ({
                name: string;
                content: {
                    text: string;
                    source: string;
                    actions?: undefined;
                };
            } | {
                name: string;
                content: {
                    text: string;
                    actions: string[];
                    source?: undefined;
                };
            })[][];
        };
    };
    platformIntegrations: {
        /**
         * Discord Integration
         */
        discord: {
            enabled: boolean;
            config: {
                applicationId: string | undefined;
                apiToken: string | undefined;
                intents: string[];
                permissions: string[];
            };
            features: string[];
        };
        /**
         * Telegram Integration
         */
        telegram: {
            enabled: boolean;
            config: {
                botToken: string | undefined;
                webhookUrl: string | undefined;
                allowedUpdates: string[];
            };
            features: string[];
        };
        /**
         * Twitter/X Integration (using xservex)
         */
        twitter: {
            enabled: boolean;
            config: {
                apiKey: string | undefined;
                apiSecretKey: string | undefined;
                accessToken: string | undefined;
                accessTokenSecret: string | undefined;
                useXservex: boolean;
                xservexConfig: {
                    email: string | undefined;
                    password: string | undefined;
                    cookies: string | undefined;
                };
            };
            features: string[];
        };
    };
    AdvancedThoughtProcess: typeof AdvancedThoughtProcess;
    customMessageHandlerTemplate: string;
    customPostCreationTemplate: string;
    characterSetupGuide: {
        /**
         * Step 1: Project Creation
         */
        projectCreation: {
            command: string;
            options: {
                "--yes": string;
                "--type": string;
                "--template": string;
            };
            description: string;
        };
        /**
         * Step 2: Environment Configuration
         */
        environmentSetup: {
            required: {
                OPENAI_API_KEY: string;
                DISCORD_API_TOKEN: string;
                TELEGRAM_BOT_TOKEN: string;
                TWITTER_API_KEY: string;
                TWITTER_API_SECRET_KEY: string;
                TWITTER_ACCESS_TOKEN: string;
                TWITTER_ACCESS_TOKEN_SECRET: string;
            };
            optional: {
                ANTHROPIC_API_KEY: string;
                GOOGLE_GENERATIVE_AI_API_KEY: string;
                OPENROUTER_API_KEY: string;
                LOG_LEVEL: string;
                WORLD_ID: string;
            };
        };
        /**
         * Step 3: Character Configuration
         */
        characterConfiguration: {
            file: string;
            sections: string[];
        };
        /**
         * Step 4: Plugin Development
         */
        pluginDevelopment: {
            structure: string[];
            requiredFiles: string[];
        };
        /**
         * Step 5: Testing and Validation
         */
        testing: {
            commands: string[];
            validation: string[];
        };
        /**
         * Step 6: Deployment
         */
        deployment: {
            local: string;
            production: string[];
        };
    };
    generateDivineWisdom: typeof generateDivineWisdom;
    assessCommunityHealth: typeof assessCommunityHealth;
    evaluateDivineResponse: typeof evaluateDivineResponse;
    enhanceMemoryWithWisdom: typeof enhanceMemoryWithWisdom;
    checkPlatformAvailability: typeof checkPlatformAvailability;
    handleErrorWithDivineWisdom: typeof handleErrorWithDivineWisdom;
    calculateEngagementStrategy: typeof calculateEngagementStrategy;
};
export default agentUtils;
