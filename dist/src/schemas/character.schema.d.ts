import { z } from 'zod';
/**
 * Character Schema Validation
 * Provides comprehensive validation for ElizaOS character definitions
 */
export declare const ContentSchema: z.ZodObject<{
    text: z.ZodString;
    source: z.ZodOptional<z.ZodString>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
    mentions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    actions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    providers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    text: string;
    source?: string | undefined;
    attachments?: any[] | undefined;
    mentions?: string[] | undefined;
    actions?: string[] | undefined;
    providers?: string[] | undefined;
}, {
    text: string;
    source?: string | undefined;
    attachments?: any[] | undefined;
    mentions?: string[] | undefined;
    actions?: string[] | undefined;
    providers?: string[] | undefined;
}>;
export declare const MessageExampleSchema: z.ZodArray<z.ZodObject<{
    name: z.ZodString;
    content: z.ZodObject<{
        text: z.ZodString;
        source: z.ZodOptional<z.ZodString>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        mentions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        actions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        providers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        source?: string | undefined;
        attachments?: any[] | undefined;
        mentions?: string[] | undefined;
        actions?: string[] | undefined;
        providers?: string[] | undefined;
    }, {
        text: string;
        source?: string | undefined;
        attachments?: any[] | undefined;
        mentions?: string[] | undefined;
        actions?: string[] | undefined;
        providers?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    name: string;
    content: {
        text: string;
        source?: string | undefined;
        attachments?: any[] | undefined;
        mentions?: string[] | undefined;
        actions?: string[] | undefined;
        providers?: string[] | undefined;
    };
}, {
    name: string;
    content: {
        text: string;
        source?: string | undefined;
        attachments?: any[] | undefined;
        mentions?: string[] | undefined;
        actions?: string[] | undefined;
        providers?: string[] | undefined;
    };
}>, "many">;
export declare const StyleSchema: z.ZodObject<{
    all: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    chat: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    post: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    formal: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    casual: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    professional: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    friendly: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    all?: string[] | undefined;
    chat?: string[] | undefined;
    post?: string[] | undefined;
    formal?: string[] | undefined;
    casual?: string[] | undefined;
    professional?: string[] | undefined;
    friendly?: string[] | undefined;
}, {
    all?: string[] | undefined;
    chat?: string[] | undefined;
    post?: string[] | undefined;
    formal?: string[] | undefined;
    casual?: string[] | undefined;
    professional?: string[] | undefined;
    friendly?: string[] | undefined;
}>;
export declare const PluginConfigSchema: z.ZodObject<{
    name: z.ZodString;
    priority: z.ZodOptional<z.ZodNumber>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    priority?: number | undefined;
    config?: Record<string, any> | undefined;
}, {
    name: string;
    priority?: number | undefined;
    config?: Record<string, any> | undefined;
}>;
export declare const SettingsSchema: z.ZodObject<{
    avatar: z.ZodOptional<z.ZodString>;
    colorScheme: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    visualStyle: z.ZodOptional<z.ZodString>;
    responseSpeed: z.ZodOptional<z.ZodEnum<["fast", "balanced", "thoughtful"]>>;
    elizaos: z.ZodOptional<z.ZodObject<{
        realtime: z.ZodOptional<z.ZodObject<{
            enableWebSocket: z.ZodOptional<z.ZodBoolean>;
            autoReconnect: z.ZodOptional<z.ZodBoolean>;
            heartbeatInterval: z.ZodOptional<z.ZodNumber>;
            maxReconnectAttempts: z.ZodOptional<z.ZodNumber>;
            logStreaming: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            enableWebSocket?: boolean | undefined;
            autoReconnect?: boolean | undefined;
            heartbeatInterval?: number | undefined;
            maxReconnectAttempts?: number | undefined;
            logStreaming?: boolean | undefined;
        }, {
            enableWebSocket?: boolean | undefined;
            autoReconnect?: boolean | undefined;
            heartbeatInterval?: number | undefined;
            maxReconnectAttempts?: number | undefined;
            logStreaming?: boolean | undefined;
        }>>;
        discord: z.ZodOptional<z.ZodObject<{
            requireMention: z.ZodOptional<z.ZodBoolean>;
            allowDirectMessages: z.ZodOptional<z.ZodBoolean>;
            ignoreBotMessages: z.ZodOptional<z.ZodBoolean>;
            ignoreSelfMessages: z.ZodOptional<z.ZodBoolean>;
            mentionPatterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            allowedChannels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            adminRoles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            responseCooldown: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            requireMention?: boolean | undefined;
            allowDirectMessages?: boolean | undefined;
            ignoreBotMessages?: boolean | undefined;
            ignoreSelfMessages?: boolean | undefined;
            mentionPatterns?: string[] | undefined;
            allowedChannels?: string[] | undefined;
            adminRoles?: string[] | undefined;
            responseCooldown?: number | undefined;
        }, {
            requireMention?: boolean | undefined;
            allowDirectMessages?: boolean | undefined;
            ignoreBotMessages?: boolean | undefined;
            ignoreSelfMessages?: boolean | undefined;
            mentionPatterns?: string[] | undefined;
            allowedChannels?: string[] | undefined;
            adminRoles?: string[] | undefined;
            responseCooldown?: number | undefined;
        }>>;
        accessControl: z.ZodOptional<z.ZodObject<{
            defaultRole: z.ZodOptional<z.ZodString>;
            adminRoles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            publicSettings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            restrictedSettings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            adminRoles?: string[] | undefined;
            defaultRole?: string | undefined;
            publicSettings?: string[] | undefined;
            restrictedSettings?: string[] | undefined;
        }, {
            adminRoles?: string[] | undefined;
            defaultRole?: string | undefined;
            publicSettings?: string[] | undefined;
            restrictedSettings?: string[] | undefined;
        }>>;
        encryption: z.ZodOptional<z.ZodObject<{
            autoEncryptSecrets: z.ZodOptional<z.ZodBoolean>;
            encryptionAlgorithm: z.ZodOptional<z.ZodString>;
            saltSource: z.ZodOptional<z.ZodString>;
            keyDerivation: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            autoEncryptSecrets?: boolean | undefined;
            encryptionAlgorithm?: string | undefined;
            saltSource?: string | undefined;
            keyDerivation?: string | undefined;
        }, {
            autoEncryptSecrets?: boolean | undefined;
            encryptionAlgorithm?: string | undefined;
            saltSource?: string | undefined;
            keyDerivation?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        realtime?: {
            enableWebSocket?: boolean | undefined;
            autoReconnect?: boolean | undefined;
            heartbeatInterval?: number | undefined;
            maxReconnectAttempts?: number | undefined;
            logStreaming?: boolean | undefined;
        } | undefined;
        discord?: {
            requireMention?: boolean | undefined;
            allowDirectMessages?: boolean | undefined;
            ignoreBotMessages?: boolean | undefined;
            ignoreSelfMessages?: boolean | undefined;
            mentionPatterns?: string[] | undefined;
            allowedChannels?: string[] | undefined;
            adminRoles?: string[] | undefined;
            responseCooldown?: number | undefined;
        } | undefined;
        accessControl?: {
            adminRoles?: string[] | undefined;
            defaultRole?: string | undefined;
            publicSettings?: string[] | undefined;
            restrictedSettings?: string[] | undefined;
        } | undefined;
        encryption?: {
            autoEncryptSecrets?: boolean | undefined;
            encryptionAlgorithm?: string | undefined;
            saltSource?: string | undefined;
            keyDerivation?: string | undefined;
        } | undefined;
    }, {
        realtime?: {
            enableWebSocket?: boolean | undefined;
            autoReconnect?: boolean | undefined;
            heartbeatInterval?: number | undefined;
            maxReconnectAttempts?: number | undefined;
            logStreaming?: boolean | undefined;
        } | undefined;
        discord?: {
            requireMention?: boolean | undefined;
            allowDirectMessages?: boolean | undefined;
            ignoreBotMessages?: boolean | undefined;
            ignoreSelfMessages?: boolean | undefined;
            mentionPatterns?: string[] | undefined;
            allowedChannels?: string[] | undefined;
            adminRoles?: string[] | undefined;
            responseCooldown?: number | undefined;
        } | undefined;
        accessControl?: {
            adminRoles?: string[] | undefined;
            defaultRole?: string | undefined;
            publicSettings?: string[] | undefined;
            restrictedSettings?: string[] | undefined;
        } | undefined;
        encryption?: {
            autoEncryptSecrets?: boolean | undefined;
            encryptionAlgorithm?: string | undefined;
            saltSource?: string | undefined;
            keyDerivation?: string | undefined;
        } | undefined;
    }>>;
    memory: z.ZodOptional<z.ZodObject<{
        facts: z.ZodOptional<z.ZodObject<{
            retentionDays: z.ZodOptional<z.ZodNumber>;
            maxFactsPerSearch: z.ZodOptional<z.ZodNumber>;
            embeddingModel: z.ZodOptional<z.ZodString>;
            similarityThreshold: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            retentionDays?: number | undefined;
            maxFactsPerSearch?: number | undefined;
            embeddingModel?: string | undefined;
            similarityThreshold?: number | undefined;
        }, {
            retentionDays?: number | undefined;
            maxFactsPerSearch?: number | undefined;
            embeddingModel?: string | undefined;
            similarityThreshold?: number | undefined;
        }>>;
        messages: z.ZodOptional<z.ZodObject<{
            retentionDays: z.ZodOptional<z.ZodNumber>;
            maxContextMessages: z.ZodOptional<z.ZodNumber>;
            enableEmbeddingSearch: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            retentionDays?: number | undefined;
            maxContextMessages?: number | undefined;
            enableEmbeddingSearch?: boolean | undefined;
        }, {
            retentionDays?: number | undefined;
            maxContextMessages?: number | undefined;
            enableEmbeddingSearch?: boolean | undefined;
        }>>;
        entities: z.ZodOptional<z.ZodObject<{
            retentionDays: z.ZodOptional<z.ZodNumber>;
            enableRelationshipTracking: z.ZodOptional<z.ZodBoolean>;
            maxEntityFacts: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            retentionDays?: number | undefined;
            enableRelationshipTracking?: boolean | undefined;
            maxEntityFacts?: number | undefined;
        }, {
            retentionDays?: number | undefined;
            enableRelationshipTracking?: boolean | undefined;
            maxEntityFacts?: number | undefined;
        }>>;
        search: z.ZodOptional<z.ZodObject<{
            defaultCount: z.ZodOptional<z.ZodNumber>;
            enableDeduplication: z.ZodOptional<z.ZodBoolean>;
            maxSearchResults: z.ZodOptional<z.ZodNumber>;
            contextWindowSize: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            defaultCount?: number | undefined;
            enableDeduplication?: boolean | undefined;
            maxSearchResults?: number | undefined;
            contextWindowSize?: number | undefined;
        }, {
            defaultCount?: number | undefined;
            enableDeduplication?: boolean | undefined;
            maxSearchResults?: number | undefined;
            contextWindowSize?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        facts?: {
            retentionDays?: number | undefined;
            maxFactsPerSearch?: number | undefined;
            embeddingModel?: string | undefined;
            similarityThreshold?: number | undefined;
        } | undefined;
        messages?: {
            retentionDays?: number | undefined;
            maxContextMessages?: number | undefined;
            enableEmbeddingSearch?: boolean | undefined;
        } | undefined;
        entities?: {
            retentionDays?: number | undefined;
            enableRelationshipTracking?: boolean | undefined;
            maxEntityFacts?: number | undefined;
        } | undefined;
        search?: {
            defaultCount?: number | undefined;
            enableDeduplication?: boolean | undefined;
            maxSearchResults?: number | undefined;
            contextWindowSize?: number | undefined;
        } | undefined;
    }, {
        facts?: {
            retentionDays?: number | undefined;
            maxFactsPerSearch?: number | undefined;
            embeddingModel?: string | undefined;
            similarityThreshold?: number | undefined;
        } | undefined;
        messages?: {
            retentionDays?: number | undefined;
            maxContextMessages?: number | undefined;
            enableEmbeddingSearch?: boolean | undefined;
        } | undefined;
        entities?: {
            retentionDays?: number | undefined;
            enableRelationshipTracking?: boolean | undefined;
            maxEntityFacts?: number | undefined;
        } | undefined;
        search?: {
            defaultCount?: number | undefined;
            enableDeduplication?: boolean | undefined;
            maxSearchResults?: number | undefined;
            contextWindowSize?: number | undefined;
        } | undefined;
    }>>;
    mcp: z.ZodOptional<z.ZodObject<{
        servers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            type: z.ZodOptional<z.ZodString>;
            command: z.ZodOptional<z.ZodString>;
            args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            type?: string | undefined;
            command?: string | undefined;
            args?: string[] | undefined;
            env?: Record<string, string> | undefined;
        }, {
            type?: string | undefined;
            command?: string | undefined;
            args?: string[] | undefined;
            env?: Record<string, string> | undefined;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        servers?: Record<string, {
            type?: string | undefined;
            command?: string | undefined;
            args?: string[] | undefined;
            env?: Record<string, string> | undefined;
        }> | undefined;
    }, {
        servers?: Record<string, {
            type?: string | undefined;
            command?: string | undefined;
            args?: string[] | undefined;
            env?: Record<string, string> | undefined;
        }> | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    avatar?: string | undefined;
    colorScheme?: string[] | undefined;
    visualStyle?: string | undefined;
    responseSpeed?: "fast" | "balanced" | "thoughtful" | undefined;
    elizaos?: {
        realtime?: {
            enableWebSocket?: boolean | undefined;
            autoReconnect?: boolean | undefined;
            heartbeatInterval?: number | undefined;
            maxReconnectAttempts?: number | undefined;
            logStreaming?: boolean | undefined;
        } | undefined;
        discord?: {
            requireMention?: boolean | undefined;
            allowDirectMessages?: boolean | undefined;
            ignoreBotMessages?: boolean | undefined;
            ignoreSelfMessages?: boolean | undefined;
            mentionPatterns?: string[] | undefined;
            allowedChannels?: string[] | undefined;
            adminRoles?: string[] | undefined;
            responseCooldown?: number | undefined;
        } | undefined;
        accessControl?: {
            adminRoles?: string[] | undefined;
            defaultRole?: string | undefined;
            publicSettings?: string[] | undefined;
            restrictedSettings?: string[] | undefined;
        } | undefined;
        encryption?: {
            autoEncryptSecrets?: boolean | undefined;
            encryptionAlgorithm?: string | undefined;
            saltSource?: string | undefined;
            keyDerivation?: string | undefined;
        } | undefined;
    } | undefined;
    memory?: {
        facts?: {
            retentionDays?: number | undefined;
            maxFactsPerSearch?: number | undefined;
            embeddingModel?: string | undefined;
            similarityThreshold?: number | undefined;
        } | undefined;
        messages?: {
            retentionDays?: number | undefined;
            maxContextMessages?: number | undefined;
            enableEmbeddingSearch?: boolean | undefined;
        } | undefined;
        entities?: {
            retentionDays?: number | undefined;
            enableRelationshipTracking?: boolean | undefined;
            maxEntityFacts?: number | undefined;
        } | undefined;
        search?: {
            defaultCount?: number | undefined;
            enableDeduplication?: boolean | undefined;
            maxSearchResults?: number | undefined;
            contextWindowSize?: number | undefined;
        } | undefined;
    } | undefined;
    mcp?: {
        servers?: Record<string, {
            type?: string | undefined;
            command?: string | undefined;
            args?: string[] | undefined;
            env?: Record<string, string> | undefined;
        }> | undefined;
    } | undefined;
}, {
    avatar?: string | undefined;
    colorScheme?: string[] | undefined;
    visualStyle?: string | undefined;
    responseSpeed?: "fast" | "balanced" | "thoughtful" | undefined;
    elizaos?: {
        realtime?: {
            enableWebSocket?: boolean | undefined;
            autoReconnect?: boolean | undefined;
            heartbeatInterval?: number | undefined;
            maxReconnectAttempts?: number | undefined;
            logStreaming?: boolean | undefined;
        } | undefined;
        discord?: {
            requireMention?: boolean | undefined;
            allowDirectMessages?: boolean | undefined;
            ignoreBotMessages?: boolean | undefined;
            ignoreSelfMessages?: boolean | undefined;
            mentionPatterns?: string[] | undefined;
            allowedChannels?: string[] | undefined;
            adminRoles?: string[] | undefined;
            responseCooldown?: number | undefined;
        } | undefined;
        accessControl?: {
            adminRoles?: string[] | undefined;
            defaultRole?: string | undefined;
            publicSettings?: string[] | undefined;
            restrictedSettings?: string[] | undefined;
        } | undefined;
        encryption?: {
            autoEncryptSecrets?: boolean | undefined;
            encryptionAlgorithm?: string | undefined;
            saltSource?: string | undefined;
            keyDerivation?: string | undefined;
        } | undefined;
    } | undefined;
    memory?: {
        facts?: {
            retentionDays?: number | undefined;
            maxFactsPerSearch?: number | undefined;
            embeddingModel?: string | undefined;
            similarityThreshold?: number | undefined;
        } | undefined;
        messages?: {
            retentionDays?: number | undefined;
            maxContextMessages?: number | undefined;
            enableEmbeddingSearch?: boolean | undefined;
        } | undefined;
        entities?: {
            retentionDays?: number | undefined;
            enableRelationshipTracking?: boolean | undefined;
            maxEntityFacts?: number | undefined;
        } | undefined;
        search?: {
            defaultCount?: number | undefined;
            enableDeduplication?: boolean | undefined;
            maxSearchResults?: number | undefined;
            contextWindowSize?: number | undefined;
        } | undefined;
    } | undefined;
    mcp?: {
        servers?: Record<string, {
            type?: string | undefined;
            command?: string | undefined;
            args?: string[] | undefined;
            env?: Record<string, string> | undefined;
        }> | undefined;
    } | undefined;
}>;
export declare const SecretsSchema: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>;
export declare const TemplateSchema: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodObject<{
    content: z.ZodString;
    variables: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    content: string;
    variables?: string[] | undefined;
    examples?: string[] | undefined;
}, {
    content: string;
    variables?: string[] | undefined;
    examples?: string[] | undefined;
}>]>>;
export declare const CharacterSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    username: z.ZodOptional<z.ZodString>;
    system: z.ZodOptional<z.ZodString>;
    bio: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    topics: z.ZodArray<z.ZodString, "many">;
    adjectives: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    knowledge: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
        path: z.ZodString;
        shared: z.ZodOptional<z.ZodBoolean>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        shared?: boolean | undefined;
        description?: string | undefined;
    }, {
        path: string;
        shared?: boolean | undefined;
        description?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodEnum<["file", "url", "database"]>;
        content: z.ZodString;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        type: "file" | "url" | "database";
        content: string;
        metadata?: Record<string, any> | undefined;
    }, {
        type: "file" | "url" | "database";
        content: string;
        metadata?: Record<string, any> | undefined;
    }>]>, "many">>;
    plugins: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    settings: z.ZodOptional<z.ZodObject<{
        avatar: z.ZodOptional<z.ZodString>;
        colorScheme: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        visualStyle: z.ZodOptional<z.ZodString>;
        responseSpeed: z.ZodOptional<z.ZodEnum<["fast", "balanced", "thoughtful"]>>;
        elizaos: z.ZodOptional<z.ZodObject<{
            realtime: z.ZodOptional<z.ZodObject<{
                enableWebSocket: z.ZodOptional<z.ZodBoolean>;
                autoReconnect: z.ZodOptional<z.ZodBoolean>;
                heartbeatInterval: z.ZodOptional<z.ZodNumber>;
                maxReconnectAttempts: z.ZodOptional<z.ZodNumber>;
                logStreaming: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                enableWebSocket?: boolean | undefined;
                autoReconnect?: boolean | undefined;
                heartbeatInterval?: number | undefined;
                maxReconnectAttempts?: number | undefined;
                logStreaming?: boolean | undefined;
            }, {
                enableWebSocket?: boolean | undefined;
                autoReconnect?: boolean | undefined;
                heartbeatInterval?: number | undefined;
                maxReconnectAttempts?: number | undefined;
                logStreaming?: boolean | undefined;
            }>>;
            discord: z.ZodOptional<z.ZodObject<{
                requireMention: z.ZodOptional<z.ZodBoolean>;
                allowDirectMessages: z.ZodOptional<z.ZodBoolean>;
                ignoreBotMessages: z.ZodOptional<z.ZodBoolean>;
                ignoreSelfMessages: z.ZodOptional<z.ZodBoolean>;
                mentionPatterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                allowedChannels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                adminRoles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                responseCooldown: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                requireMention?: boolean | undefined;
                allowDirectMessages?: boolean | undefined;
                ignoreBotMessages?: boolean | undefined;
                ignoreSelfMessages?: boolean | undefined;
                mentionPatterns?: string[] | undefined;
                allowedChannels?: string[] | undefined;
                adminRoles?: string[] | undefined;
                responseCooldown?: number | undefined;
            }, {
                requireMention?: boolean | undefined;
                allowDirectMessages?: boolean | undefined;
                ignoreBotMessages?: boolean | undefined;
                ignoreSelfMessages?: boolean | undefined;
                mentionPatterns?: string[] | undefined;
                allowedChannels?: string[] | undefined;
                adminRoles?: string[] | undefined;
                responseCooldown?: number | undefined;
            }>>;
            accessControl: z.ZodOptional<z.ZodObject<{
                defaultRole: z.ZodOptional<z.ZodString>;
                adminRoles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                publicSettings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                restrictedSettings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                adminRoles?: string[] | undefined;
                defaultRole?: string | undefined;
                publicSettings?: string[] | undefined;
                restrictedSettings?: string[] | undefined;
            }, {
                adminRoles?: string[] | undefined;
                defaultRole?: string | undefined;
                publicSettings?: string[] | undefined;
                restrictedSettings?: string[] | undefined;
            }>>;
            encryption: z.ZodOptional<z.ZodObject<{
                autoEncryptSecrets: z.ZodOptional<z.ZodBoolean>;
                encryptionAlgorithm: z.ZodOptional<z.ZodString>;
                saltSource: z.ZodOptional<z.ZodString>;
                keyDerivation: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                autoEncryptSecrets?: boolean | undefined;
                encryptionAlgorithm?: string | undefined;
                saltSource?: string | undefined;
                keyDerivation?: string | undefined;
            }, {
                autoEncryptSecrets?: boolean | undefined;
                encryptionAlgorithm?: string | undefined;
                saltSource?: string | undefined;
                keyDerivation?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            realtime?: {
                enableWebSocket?: boolean | undefined;
                autoReconnect?: boolean | undefined;
                heartbeatInterval?: number | undefined;
                maxReconnectAttempts?: number | undefined;
                logStreaming?: boolean | undefined;
            } | undefined;
            discord?: {
                requireMention?: boolean | undefined;
                allowDirectMessages?: boolean | undefined;
                ignoreBotMessages?: boolean | undefined;
                ignoreSelfMessages?: boolean | undefined;
                mentionPatterns?: string[] | undefined;
                allowedChannels?: string[] | undefined;
                adminRoles?: string[] | undefined;
                responseCooldown?: number | undefined;
            } | undefined;
            accessControl?: {
                adminRoles?: string[] | undefined;
                defaultRole?: string | undefined;
                publicSettings?: string[] | undefined;
                restrictedSettings?: string[] | undefined;
            } | undefined;
            encryption?: {
                autoEncryptSecrets?: boolean | undefined;
                encryptionAlgorithm?: string | undefined;
                saltSource?: string | undefined;
                keyDerivation?: string | undefined;
            } | undefined;
        }, {
            realtime?: {
                enableWebSocket?: boolean | undefined;
                autoReconnect?: boolean | undefined;
                heartbeatInterval?: number | undefined;
                maxReconnectAttempts?: number | undefined;
                logStreaming?: boolean | undefined;
            } | undefined;
            discord?: {
                requireMention?: boolean | undefined;
                allowDirectMessages?: boolean | undefined;
                ignoreBotMessages?: boolean | undefined;
                ignoreSelfMessages?: boolean | undefined;
                mentionPatterns?: string[] | undefined;
                allowedChannels?: string[] | undefined;
                adminRoles?: string[] | undefined;
                responseCooldown?: number | undefined;
            } | undefined;
            accessControl?: {
                adminRoles?: string[] | undefined;
                defaultRole?: string | undefined;
                publicSettings?: string[] | undefined;
                restrictedSettings?: string[] | undefined;
            } | undefined;
            encryption?: {
                autoEncryptSecrets?: boolean | undefined;
                encryptionAlgorithm?: string | undefined;
                saltSource?: string | undefined;
                keyDerivation?: string | undefined;
            } | undefined;
        }>>;
        memory: z.ZodOptional<z.ZodObject<{
            facts: z.ZodOptional<z.ZodObject<{
                retentionDays: z.ZodOptional<z.ZodNumber>;
                maxFactsPerSearch: z.ZodOptional<z.ZodNumber>;
                embeddingModel: z.ZodOptional<z.ZodString>;
                similarityThreshold: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                retentionDays?: number | undefined;
                maxFactsPerSearch?: number | undefined;
                embeddingModel?: string | undefined;
                similarityThreshold?: number | undefined;
            }, {
                retentionDays?: number | undefined;
                maxFactsPerSearch?: number | undefined;
                embeddingModel?: string | undefined;
                similarityThreshold?: number | undefined;
            }>>;
            messages: z.ZodOptional<z.ZodObject<{
                retentionDays: z.ZodOptional<z.ZodNumber>;
                maxContextMessages: z.ZodOptional<z.ZodNumber>;
                enableEmbeddingSearch: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                retentionDays?: number | undefined;
                maxContextMessages?: number | undefined;
                enableEmbeddingSearch?: boolean | undefined;
            }, {
                retentionDays?: number | undefined;
                maxContextMessages?: number | undefined;
                enableEmbeddingSearch?: boolean | undefined;
            }>>;
            entities: z.ZodOptional<z.ZodObject<{
                retentionDays: z.ZodOptional<z.ZodNumber>;
                enableRelationshipTracking: z.ZodOptional<z.ZodBoolean>;
                maxEntityFacts: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                retentionDays?: number | undefined;
                enableRelationshipTracking?: boolean | undefined;
                maxEntityFacts?: number | undefined;
            }, {
                retentionDays?: number | undefined;
                enableRelationshipTracking?: boolean | undefined;
                maxEntityFacts?: number | undefined;
            }>>;
            search: z.ZodOptional<z.ZodObject<{
                defaultCount: z.ZodOptional<z.ZodNumber>;
                enableDeduplication: z.ZodOptional<z.ZodBoolean>;
                maxSearchResults: z.ZodOptional<z.ZodNumber>;
                contextWindowSize: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                defaultCount?: number | undefined;
                enableDeduplication?: boolean | undefined;
                maxSearchResults?: number | undefined;
                contextWindowSize?: number | undefined;
            }, {
                defaultCount?: number | undefined;
                enableDeduplication?: boolean | undefined;
                maxSearchResults?: number | undefined;
                contextWindowSize?: number | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            facts?: {
                retentionDays?: number | undefined;
                maxFactsPerSearch?: number | undefined;
                embeddingModel?: string | undefined;
                similarityThreshold?: number | undefined;
            } | undefined;
            messages?: {
                retentionDays?: number | undefined;
                maxContextMessages?: number | undefined;
                enableEmbeddingSearch?: boolean | undefined;
            } | undefined;
            entities?: {
                retentionDays?: number | undefined;
                enableRelationshipTracking?: boolean | undefined;
                maxEntityFacts?: number | undefined;
            } | undefined;
            search?: {
                defaultCount?: number | undefined;
                enableDeduplication?: boolean | undefined;
                maxSearchResults?: number | undefined;
                contextWindowSize?: number | undefined;
            } | undefined;
        }, {
            facts?: {
                retentionDays?: number | undefined;
                maxFactsPerSearch?: number | undefined;
                embeddingModel?: string | undefined;
                similarityThreshold?: number | undefined;
            } | undefined;
            messages?: {
                retentionDays?: number | undefined;
                maxContextMessages?: number | undefined;
                enableEmbeddingSearch?: boolean | undefined;
            } | undefined;
            entities?: {
                retentionDays?: number | undefined;
                enableRelationshipTracking?: boolean | undefined;
                maxEntityFacts?: number | undefined;
            } | undefined;
            search?: {
                defaultCount?: number | undefined;
                enableDeduplication?: boolean | undefined;
                maxSearchResults?: number | undefined;
                contextWindowSize?: number | undefined;
            } | undefined;
        }>>;
        mcp: z.ZodOptional<z.ZodObject<{
            servers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
                type: z.ZodOptional<z.ZodString>;
                command: z.ZodOptional<z.ZodString>;
                args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                type?: string | undefined;
                command?: string | undefined;
                args?: string[] | undefined;
                env?: Record<string, string> | undefined;
            }, {
                type?: string | undefined;
                command?: string | undefined;
                args?: string[] | undefined;
                env?: Record<string, string> | undefined;
            }>>>;
        }, "strip", z.ZodTypeAny, {
            servers?: Record<string, {
                type?: string | undefined;
                command?: string | undefined;
                args?: string[] | undefined;
                env?: Record<string, string> | undefined;
            }> | undefined;
        }, {
            servers?: Record<string, {
                type?: string | undefined;
                command?: string | undefined;
                args?: string[] | undefined;
                env?: Record<string, string> | undefined;
            }> | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        avatar?: string | undefined;
        colorScheme?: string[] | undefined;
        visualStyle?: string | undefined;
        responseSpeed?: "fast" | "balanced" | "thoughtful" | undefined;
        elizaos?: {
            realtime?: {
                enableWebSocket?: boolean | undefined;
                autoReconnect?: boolean | undefined;
                heartbeatInterval?: number | undefined;
                maxReconnectAttempts?: number | undefined;
                logStreaming?: boolean | undefined;
            } | undefined;
            discord?: {
                requireMention?: boolean | undefined;
                allowDirectMessages?: boolean | undefined;
                ignoreBotMessages?: boolean | undefined;
                ignoreSelfMessages?: boolean | undefined;
                mentionPatterns?: string[] | undefined;
                allowedChannels?: string[] | undefined;
                adminRoles?: string[] | undefined;
                responseCooldown?: number | undefined;
            } | undefined;
            accessControl?: {
                adminRoles?: string[] | undefined;
                defaultRole?: string | undefined;
                publicSettings?: string[] | undefined;
                restrictedSettings?: string[] | undefined;
            } | undefined;
            encryption?: {
                autoEncryptSecrets?: boolean | undefined;
                encryptionAlgorithm?: string | undefined;
                saltSource?: string | undefined;
                keyDerivation?: string | undefined;
            } | undefined;
        } | undefined;
        memory?: {
            facts?: {
                retentionDays?: number | undefined;
                maxFactsPerSearch?: number | undefined;
                embeddingModel?: string | undefined;
                similarityThreshold?: number | undefined;
            } | undefined;
            messages?: {
                retentionDays?: number | undefined;
                maxContextMessages?: number | undefined;
                enableEmbeddingSearch?: boolean | undefined;
            } | undefined;
            entities?: {
                retentionDays?: number | undefined;
                enableRelationshipTracking?: boolean | undefined;
                maxEntityFacts?: number | undefined;
            } | undefined;
            search?: {
                defaultCount?: number | undefined;
                enableDeduplication?: boolean | undefined;
                maxSearchResults?: number | undefined;
                contextWindowSize?: number | undefined;
            } | undefined;
        } | undefined;
        mcp?: {
            servers?: Record<string, {
                type?: string | undefined;
                command?: string | undefined;
                args?: string[] | undefined;
                env?: Record<string, string> | undefined;
            }> | undefined;
        } | undefined;
    }, {
        avatar?: string | undefined;
        colorScheme?: string[] | undefined;
        visualStyle?: string | undefined;
        responseSpeed?: "fast" | "balanced" | "thoughtful" | undefined;
        elizaos?: {
            realtime?: {
                enableWebSocket?: boolean | undefined;
                autoReconnect?: boolean | undefined;
                heartbeatInterval?: number | undefined;
                maxReconnectAttempts?: number | undefined;
                logStreaming?: boolean | undefined;
            } | undefined;
            discord?: {
                requireMention?: boolean | undefined;
                allowDirectMessages?: boolean | undefined;
                ignoreBotMessages?: boolean | undefined;
                ignoreSelfMessages?: boolean | undefined;
                mentionPatterns?: string[] | undefined;
                allowedChannels?: string[] | undefined;
                adminRoles?: string[] | undefined;
                responseCooldown?: number | undefined;
            } | undefined;
            accessControl?: {
                adminRoles?: string[] | undefined;
                defaultRole?: string | undefined;
                publicSettings?: string[] | undefined;
                restrictedSettings?: string[] | undefined;
            } | undefined;
            encryption?: {
                autoEncryptSecrets?: boolean | undefined;
                encryptionAlgorithm?: string | undefined;
                saltSource?: string | undefined;
                keyDerivation?: string | undefined;
            } | undefined;
        } | undefined;
        memory?: {
            facts?: {
                retentionDays?: number | undefined;
                maxFactsPerSearch?: number | undefined;
                embeddingModel?: string | undefined;
                similarityThreshold?: number | undefined;
            } | undefined;
            messages?: {
                retentionDays?: number | undefined;
                maxContextMessages?: number | undefined;
                enableEmbeddingSearch?: boolean | undefined;
            } | undefined;
            entities?: {
                retentionDays?: number | undefined;
                enableRelationshipTracking?: boolean | undefined;
                maxEntityFacts?: number | undefined;
            } | undefined;
            search?: {
                defaultCount?: number | undefined;
                enableDeduplication?: boolean | undefined;
                maxSearchResults?: number | undefined;
                contextWindowSize?: number | undefined;
            } | undefined;
        } | undefined;
        mcp?: {
            servers?: Record<string, {
                type?: string | undefined;
                command?: string | undefined;
                args?: string[] | undefined;
                env?: Record<string, string> | undefined;
            }> | undefined;
        } | undefined;
    }>>;
    secrets: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>>;
    style: z.ZodOptional<z.ZodObject<{
        all: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        chat: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        post: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        formal: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        casual: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        professional: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        friendly: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        all?: string[] | undefined;
        chat?: string[] | undefined;
        post?: string[] | undefined;
        formal?: string[] | undefined;
        casual?: string[] | undefined;
        professional?: string[] | undefined;
        friendly?: string[] | undefined;
    }, {
        all?: string[] | undefined;
        chat?: string[] | undefined;
        post?: string[] | undefined;
        formal?: string[] | undefined;
        casual?: string[] | undefined;
        professional?: string[] | undefined;
        friendly?: string[] | undefined;
    }>>;
    messageExamples: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        content: z.ZodObject<{
            text: z.ZodString;
            source: z.ZodOptional<z.ZodString>;
            attachments: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
            mentions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            actions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            providers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            text: string;
            source?: string | undefined;
            attachments?: any[] | undefined;
            mentions?: string[] | undefined;
            actions?: string[] | undefined;
            providers?: string[] | undefined;
        }, {
            text: string;
            source?: string | undefined;
            attachments?: any[] | undefined;
            mentions?: string[] | undefined;
            actions?: string[] | undefined;
            providers?: string[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        content: {
            text: string;
            source?: string | undefined;
            attachments?: any[] | undefined;
            mentions?: string[] | undefined;
            actions?: string[] | undefined;
            providers?: string[] | undefined;
        };
    }, {
        name: string;
        content: {
            text: string;
            source?: string | undefined;
            attachments?: any[] | undefined;
            mentions?: string[] | undefined;
            actions?: string[] | undefined;
            providers?: string[] | undefined;
        };
    }>, "many">, "many">>;
    postExamples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    templates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodObject<{
        content: z.ZodString;
        variables: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        content: string;
        variables?: string[] | undefined;
        examples?: string[] | undefined;
    }, {
        content: string;
        variables?: string[] | undefined;
        examples?: string[] | undefined;
    }>]>>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    bio: string | string[];
    topics: string[];
    plugins: string[];
    id?: string | undefined;
    username?: string | undefined;
    system?: string | undefined;
    adjectives?: string[] | undefined;
    knowledge?: (string | {
        path: string;
        shared?: boolean | undefined;
        description?: string | undefined;
    } | {
        type: "file" | "url" | "database";
        content: string;
        metadata?: Record<string, any> | undefined;
    })[] | undefined;
    settings?: {
        avatar?: string | undefined;
        colorScheme?: string[] | undefined;
        visualStyle?: string | undefined;
        responseSpeed?: "fast" | "balanced" | "thoughtful" | undefined;
        elizaos?: {
            realtime?: {
                enableWebSocket?: boolean | undefined;
                autoReconnect?: boolean | undefined;
                heartbeatInterval?: number | undefined;
                maxReconnectAttempts?: number | undefined;
                logStreaming?: boolean | undefined;
            } | undefined;
            discord?: {
                requireMention?: boolean | undefined;
                allowDirectMessages?: boolean | undefined;
                ignoreBotMessages?: boolean | undefined;
                ignoreSelfMessages?: boolean | undefined;
                mentionPatterns?: string[] | undefined;
                allowedChannels?: string[] | undefined;
                adminRoles?: string[] | undefined;
                responseCooldown?: number | undefined;
            } | undefined;
            accessControl?: {
                adminRoles?: string[] | undefined;
                defaultRole?: string | undefined;
                publicSettings?: string[] | undefined;
                restrictedSettings?: string[] | undefined;
            } | undefined;
            encryption?: {
                autoEncryptSecrets?: boolean | undefined;
                encryptionAlgorithm?: string | undefined;
                saltSource?: string | undefined;
                keyDerivation?: string | undefined;
            } | undefined;
        } | undefined;
        memory?: {
            facts?: {
                retentionDays?: number | undefined;
                maxFactsPerSearch?: number | undefined;
                embeddingModel?: string | undefined;
                similarityThreshold?: number | undefined;
            } | undefined;
            messages?: {
                retentionDays?: number | undefined;
                maxContextMessages?: number | undefined;
                enableEmbeddingSearch?: boolean | undefined;
            } | undefined;
            entities?: {
                retentionDays?: number | undefined;
                enableRelationshipTracking?: boolean | undefined;
                maxEntityFacts?: number | undefined;
            } | undefined;
            search?: {
                defaultCount?: number | undefined;
                enableDeduplication?: boolean | undefined;
                maxSearchResults?: number | undefined;
                contextWindowSize?: number | undefined;
            } | undefined;
        } | undefined;
        mcp?: {
            servers?: Record<string, {
                type?: string | undefined;
                command?: string | undefined;
                args?: string[] | undefined;
                env?: Record<string, string> | undefined;
            }> | undefined;
        } | undefined;
    } | undefined;
    secrets?: Record<string, string | number | boolean> | undefined;
    style?: {
        all?: string[] | undefined;
        chat?: string[] | undefined;
        post?: string[] | undefined;
        formal?: string[] | undefined;
        casual?: string[] | undefined;
        professional?: string[] | undefined;
        friendly?: string[] | undefined;
    } | undefined;
    messageExamples?: {
        name: string;
        content: {
            text: string;
            source?: string | undefined;
            attachments?: any[] | undefined;
            mentions?: string[] | undefined;
            actions?: string[] | undefined;
            providers?: string[] | undefined;
        };
    }[][] | undefined;
    postExamples?: string[] | undefined;
    templates?: Record<string, string | {
        content: string;
        variables?: string[] | undefined;
        examples?: string[] | undefined;
    }> | undefined;
}, {
    name: string;
    bio: string | string[];
    topics: string[];
    id?: string | undefined;
    username?: string | undefined;
    system?: string | undefined;
    adjectives?: string[] | undefined;
    knowledge?: (string | {
        path: string;
        shared?: boolean | undefined;
        description?: string | undefined;
    } | {
        type: "file" | "url" | "database";
        content: string;
        metadata?: Record<string, any> | undefined;
    })[] | undefined;
    plugins?: string[] | undefined;
    settings?: {
        avatar?: string | undefined;
        colorScheme?: string[] | undefined;
        visualStyle?: string | undefined;
        responseSpeed?: "fast" | "balanced" | "thoughtful" | undefined;
        elizaos?: {
            realtime?: {
                enableWebSocket?: boolean | undefined;
                autoReconnect?: boolean | undefined;
                heartbeatInterval?: number | undefined;
                maxReconnectAttempts?: number | undefined;
                logStreaming?: boolean | undefined;
            } | undefined;
            discord?: {
                requireMention?: boolean | undefined;
                allowDirectMessages?: boolean | undefined;
                ignoreBotMessages?: boolean | undefined;
                ignoreSelfMessages?: boolean | undefined;
                mentionPatterns?: string[] | undefined;
                allowedChannels?: string[] | undefined;
                adminRoles?: string[] | undefined;
                responseCooldown?: number | undefined;
            } | undefined;
            accessControl?: {
                adminRoles?: string[] | undefined;
                defaultRole?: string | undefined;
                publicSettings?: string[] | undefined;
                restrictedSettings?: string[] | undefined;
            } | undefined;
            encryption?: {
                autoEncryptSecrets?: boolean | undefined;
                encryptionAlgorithm?: string | undefined;
                saltSource?: string | undefined;
                keyDerivation?: string | undefined;
            } | undefined;
        } | undefined;
        memory?: {
            facts?: {
                retentionDays?: number | undefined;
                maxFactsPerSearch?: number | undefined;
                embeddingModel?: string | undefined;
                similarityThreshold?: number | undefined;
            } | undefined;
            messages?: {
                retentionDays?: number | undefined;
                maxContextMessages?: number | undefined;
                enableEmbeddingSearch?: boolean | undefined;
            } | undefined;
            entities?: {
                retentionDays?: number | undefined;
                enableRelationshipTracking?: boolean | undefined;
                maxEntityFacts?: number | undefined;
            } | undefined;
            search?: {
                defaultCount?: number | undefined;
                enableDeduplication?: boolean | undefined;
                maxSearchResults?: number | undefined;
                contextWindowSize?: number | undefined;
            } | undefined;
        } | undefined;
        mcp?: {
            servers?: Record<string, {
                type?: string | undefined;
                command?: string | undefined;
                args?: string[] | undefined;
                env?: Record<string, string> | undefined;
            }> | undefined;
        } | undefined;
    } | undefined;
    secrets?: Record<string, string | number | boolean> | undefined;
    style?: {
        all?: string[] | undefined;
        chat?: string[] | undefined;
        post?: string[] | undefined;
        formal?: string[] | undefined;
        casual?: string[] | undefined;
        professional?: string[] | undefined;
        friendly?: string[] | undefined;
    } | undefined;
    messageExamples?: {
        name: string;
        content: {
            text: string;
            source?: string | undefined;
            attachments?: any[] | undefined;
            mentions?: string[] | undefined;
            actions?: string[] | undefined;
            providers?: string[] | undefined;
        };
    }[][] | undefined;
    postExamples?: string[] | undefined;
    templates?: Record<string, string | {
        content: string;
        variables?: string[] | undefined;
        examples?: string[] | undefined;
    }> | undefined;
}>;
export type ValidatedCharacter = z.infer<typeof CharacterSchema>;
export type CharacterSettings = z.infer<typeof SettingsSchema>;
export type CharacterStyle = z.infer<typeof StyleSchema>;
export type CharacterSecrets = z.infer<typeof SecretsSchema>;
export declare const validateCharacter: (data: unknown) => ValidatedCharacter;
export declare const validateCharacterSafe: (data: unknown) => {
    success: boolean;
    data?: ValidatedCharacter;
    errors?: string[];
};
