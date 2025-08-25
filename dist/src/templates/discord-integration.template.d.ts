/**
 * Discord Integration Template
 * Complete Discord bot setup with ElizaOS integration
 * Based on actual working ElizaOS plugin structure
 */
/**
 * Discord Integration Plugin
 * Complete Discord bot integration with ElizaOS real-time communication and MCP connectivity
 */
export declare const discordIntegrationPlugin: {
    name: string;
    description: string;
    config: {
        DISCORD_BOT_TOKEN: string;
        DISCORD_CLIENT_ID: string;
        DISCORD_GUILD_ID: string;
        SUPABASE_URL: string;
        SUPABASE_ANON_KEY: string;
        SUPABASE_SERVICE_ROLE_KEY: string;
        SUPABASE_MCP_PORT: string;
    };
    init(config: Record<string, string>): Promise<void>;
    models: {};
    routes: {
        name: string;
        path: string;
        type: string;
        handler: (req: any, res: any) => Promise<any>;
    }[];
    events: {
        DISCORD_MESSAGE_RECEIVED: ((params: any) => Promise<void>)[];
        DISCORD_MENTION_VALIDATED: ((params: any) => Promise<void>)[];
        DISCORD_RESPONSE_SENT: ((params: any) => Promise<void>)[];
        MCP_SERVER_CONNECTED: ((params: any) => Promise<void>)[];
    };
    services: never[];
    actions: ({
        name: string;
        similes: string[];
        description: string;
        validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
        handler: (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => Promise<{
            text: string;
            success: boolean;
            data: {
                action: string;
                reason: string;
                response?: undefined;
            };
        } | {
            text: string;
            success: boolean;
            data: {
                action: string;
                response: string;
                reason?: undefined;
            };
        }>;
    } | {
        name: string;
        similes: string[];
        description: string;
        validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
        handler: (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => Promise<{
            text: string;
            success: boolean;
            data: {
                isValid: boolean;
                reason: string;
            };
        }>;
    } | {
        name: string;
        similes: string[];
        description: string;
        validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
        handler: (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => Promise<{
            text: string;
            success: boolean;
            error: Error;
            data?: undefined;
        } | {
            text: string;
            success: boolean;
            data: {
                response: any;
                channelId: any;
                replyToMessageId: any;
            };
            error?: undefined;
        }>;
    } | {
        name: string;
        similes: string[];
        description: string;
        validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
        handler: (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => Promise<{
            text: string;
            success: boolean;
            error: Error;
            data?: undefined;
        } | {
            text: string;
            success: boolean;
            data: {
                operation: any;
                table: any;
                query: any;
                data: any;
                success: boolean;
            };
            error?: undefined;
        }>;
    })[];
    providers: ({
        name: string;
        description: string;
        get: (runtime: any, message: any, state?: any) => Promise<{
            text: string;
            values: {
                platform: string;
                mentionPatterns: string[];
                channelTypes: string[];
                validationRules: {
                    requireMention: boolean;
                    allowDirectMessages: boolean;
                    ignoreBotMessages: boolean;
                    ignoreSelfMessages: boolean;
                };
            };
            data: {
                platform: string;
            };
            confidence: number;
            source: string;
        }>;
    } | {
        name: string;
        description: string;
        get: (runtime: any, message: any, state?: any) => Promise<{
            text: string;
            values: {
                connected: boolean;
                serverId: string;
                port: string;
                capabilities: string[];
                tables: string[];
            };
            data: {
                mcpServer: string;
            };
            confidence: number;
            source: string;
        }>;
    } | {
        name: string;
        description: string;
        get: (runtime: any, message: any, state?: any) => Promise<{
            text: string;
            values: {
                hasMention: boolean;
                mentionPatterns: string[];
                channelType: any;
                validationRules: {
                    requireMention: boolean;
                    allowDirectMessages: boolean;
                    ignoreBotMessages: boolean;
                    ignoreSelfMessages: boolean;
                };
            };
            data: {
                validation: {
                    hasMention: boolean;
                    patterns: string[];
                };
            };
            confidence: number;
            source: string;
        }>;
    } | {
        name: string;
        description: string;
        get: (runtime: any, message: any, state?: any) => Promise<{
            text: string;
            values: {
                canGenerate: boolean;
                responseType: string;
                style: string;
            };
            data: {
                responseGeneration: {
                    canGenerate: boolean;
                };
            };
            confidence: number;
            source: string;
        }>;
    })[];
};
/**
 * Build Discord integration plugin
 */
export declare function buildDiscordIntegration(): {
    name: string;
    description: string;
    config: {
        DISCORD_BOT_TOKEN: string;
        DISCORD_CLIENT_ID: string;
        DISCORD_GUILD_ID: string;
        SUPABASE_URL: string;
        SUPABASE_ANON_KEY: string;
        SUPABASE_SERVICE_ROLE_KEY: string;
        SUPABASE_MCP_PORT: string;
    };
    init(config: Record<string, string>): Promise<void>;
    models: {};
    routes: {
        name: string;
        path: string;
        type: string;
        handler: (req: any, res: any) => Promise<any>;
    }[];
    events: {
        DISCORD_MESSAGE_RECEIVED: ((params: any) => Promise<void>)[];
        DISCORD_MENTION_VALIDATED: ((params: any) => Promise<void>)[];
        DISCORD_RESPONSE_SENT: ((params: any) => Promise<void>)[];
        MCP_SERVER_CONNECTED: ((params: any) => Promise<void>)[];
    };
    services: never[];
    actions: ({
        name: string;
        similes: string[];
        description: string;
        validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
        handler: (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => Promise<{
            text: string;
            success: boolean;
            data: {
                action: string;
                reason: string;
                response?: undefined;
            };
        } | {
            text: string;
            success: boolean;
            data: {
                action: string;
                response: string;
                reason?: undefined;
            };
        }>;
    } | {
        name: string;
        similes: string[];
        description: string;
        validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
        handler: (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => Promise<{
            text: string;
            success: boolean;
            data: {
                isValid: boolean;
                reason: string;
            };
        }>;
    } | {
        name: string;
        similes: string[];
        description: string;
        validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
        handler: (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => Promise<{
            text: string;
            success: boolean;
            error: Error;
            data?: undefined;
        } | {
            text: string;
            success: boolean;
            data: {
                response: any;
                channelId: any;
                replyToMessageId: any;
            };
            error?: undefined;
        }>;
    } | {
        name: string;
        similes: string[];
        description: string;
        validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
        handler: (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => Promise<{
            text: string;
            success: boolean;
            error: Error;
            data?: undefined;
        } | {
            text: string;
            success: boolean;
            data: {
                operation: any;
                table: any;
                query: any;
                data: any;
                success: boolean;
            };
            error?: undefined;
        }>;
    })[];
    providers: ({
        name: string;
        description: string;
        get: (runtime: any, message: any, state?: any) => Promise<{
            text: string;
            values: {
                platform: string;
                mentionPatterns: string[];
                channelTypes: string[];
                validationRules: {
                    requireMention: boolean;
                    allowDirectMessages: boolean;
                    ignoreBotMessages: boolean;
                    ignoreSelfMessages: boolean;
                };
            };
            data: {
                platform: string;
            };
            confidence: number;
            source: string;
        }>;
    } | {
        name: string;
        description: string;
        get: (runtime: any, message: any, state?: any) => Promise<{
            text: string;
            values: {
                connected: boolean;
                serverId: string;
                port: string;
                capabilities: string[];
                tables: string[];
            };
            data: {
                mcpServer: string;
            };
            confidence: number;
            source: string;
        }>;
    } | {
        name: string;
        description: string;
        get: (runtime: any, message: any, state?: any) => Promise<{
            text: string;
            values: {
                hasMention: boolean;
                mentionPatterns: string[];
                channelType: any;
                validationRules: {
                    requireMention: boolean;
                    allowDirectMessages: boolean;
                    ignoreBotMessages: boolean;
                    ignoreSelfMessages: boolean;
                };
            };
            data: {
                validation: {
                    hasMention: boolean;
                    patterns: string[];
                };
            };
            confidence: number;
            source: string;
        }>;
    } | {
        name: string;
        description: string;
        get: (runtime: any, message: any, state?: any) => Promise<{
            text: string;
            values: {
                canGenerate: boolean;
                responseType: string;
                style: string;
            };
            data: {
                responseGeneration: {
                    canGenerate: boolean;
                };
            };
            confidence: number;
            source: string;
        }>;
    })[];
};
/**
 * Discord integration variants
 */
export declare const discordIntegrationVariants: {
    strict: {
        description: string;
        name: string;
        config: {
            DISCORD_BOT_TOKEN: string;
            DISCORD_CLIENT_ID: string;
            DISCORD_GUILD_ID: string;
            SUPABASE_URL: string;
            SUPABASE_ANON_KEY: string;
            SUPABASE_SERVICE_ROLE_KEY: string;
            SUPABASE_MCP_PORT: string;
        };
        init(config: Record<string, string>): Promise<void>;
        models: {};
        routes: {
            name: string;
            path: string;
            type: string;
            handler: (req: any, res: any) => Promise<any>;
        }[];
        events: {
            DISCORD_MESSAGE_RECEIVED: ((params: any) => Promise<void>)[];
            DISCORD_MENTION_VALIDATED: ((params: any) => Promise<void>)[];
            DISCORD_RESPONSE_SENT: ((params: any) => Promise<void>)[];
            MCP_SERVER_CONNECTED: ((params: any) => Promise<void>)[];
        };
        services: never[];
        actions: ({
            name: string;
            similes: string[];
            description: string;
            validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
            handler: (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => Promise<{
                text: string;
                success: boolean;
                data: {
                    action: string;
                    reason: string;
                    response?: undefined;
                };
            } | {
                text: string;
                success: boolean;
                data: {
                    action: string;
                    response: string;
                    reason?: undefined;
                };
            }>;
        } | {
            name: string;
            similes: string[];
            description: string;
            validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
            handler: (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => Promise<{
                text: string;
                success: boolean;
                data: {
                    isValid: boolean;
                    reason: string;
                };
            }>;
        } | {
            name: string;
            similes: string[];
            description: string;
            validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
            handler: (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => Promise<{
                text: string;
                success: boolean;
                error: Error;
                data?: undefined;
            } | {
                text: string;
                success: boolean;
                data: {
                    response: any;
                    channelId: any;
                    replyToMessageId: any;
                };
                error?: undefined;
            }>;
        } | {
            name: string;
            similes: string[];
            description: string;
            validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
            handler: (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => Promise<{
                text: string;
                success: boolean;
                error: Error;
                data?: undefined;
            } | {
                text: string;
                success: boolean;
                data: {
                    operation: any;
                    table: any;
                    query: any;
                    data: any;
                    success: boolean;
                };
                error?: undefined;
            }>;
        })[];
        providers: ({
            name: string;
            description: string;
            get: (runtime: any, message: any, state?: any) => Promise<{
                text: string;
                values: {
                    platform: string;
                    mentionPatterns: string[];
                    channelTypes: string[];
                    validationRules: {
                        requireMention: boolean;
                        allowDirectMessages: boolean;
                        ignoreBotMessages: boolean;
                        ignoreSelfMessages: boolean;
                    };
                };
                data: {
                    platform: string;
                };
                confidence: number;
                source: string;
            }>;
        } | {
            name: string;
            description: string;
            get: (runtime: any, message: any, state?: any) => Promise<{
                text: string;
                values: {
                    connected: boolean;
                    serverId: string;
                    port: string;
                    capabilities: string[];
                    tables: string[];
                };
                data: {
                    mcpServer: string;
                };
                confidence: number;
                source: string;
            }>;
        } | {
            name: string;
            description: string;
            get: (runtime: any, message: any, state?: any) => Promise<{
                text: string;
                values: {
                    hasMention: boolean;
                    mentionPatterns: string[];
                    channelType: any;
                    validationRules: {
                        requireMention: boolean;
                        allowDirectMessages: boolean;
                        ignoreBotMessages: boolean;
                        ignoreSelfMessages: boolean;
                    };
                };
                data: {
                    validation: {
                        hasMention: boolean;
                        patterns: string[];
                    };
                };
                confidence: number;
                source: string;
            }>;
        } | {
            name: string;
            description: string;
            get: (runtime: any, message: any, state?: any) => Promise<{
                text: string;
                values: {
                    canGenerate: boolean;
                    responseType: string;
                    style: string;
                };
                data: {
                    responseGeneration: {
                        canGenerate: boolean;
                    };
                };
                confidence: number;
                source: string;
            }>;
        })[];
    };
    flexible: {
        description: string;
        name: string;
        config: {
            DISCORD_BOT_TOKEN: string;
            DISCORD_CLIENT_ID: string;
            DISCORD_GUILD_ID: string;
            SUPABASE_URL: string;
            SUPABASE_ANON_KEY: string;
            SUPABASE_SERVICE_ROLE_KEY: string;
            SUPABASE_MCP_PORT: string;
        };
        init(config: Record<string, string>): Promise<void>;
        models: {};
        routes: {
            name: string;
            path: string;
            type: string;
            handler: (req: any, res: any) => Promise<any>;
        }[];
        events: {
            DISCORD_MESSAGE_RECEIVED: ((params: any) => Promise<void>)[];
            DISCORD_MENTION_VALIDATED: ((params: any) => Promise<void>)[];
            DISCORD_RESPONSE_SENT: ((params: any) => Promise<void>)[];
            MCP_SERVER_CONNECTED: ((params: any) => Promise<void>)[];
        };
        services: never[];
        actions: ({
            name: string;
            similes: string[];
            description: string;
            validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
            handler: (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => Promise<{
                text: string;
                success: boolean;
                data: {
                    action: string;
                    reason: string;
                    response?: undefined;
                };
            } | {
                text: string;
                success: boolean;
                data: {
                    action: string;
                    response: string;
                    reason?: undefined;
                };
            }>;
        } | {
            name: string;
            similes: string[];
            description: string;
            validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
            handler: (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => Promise<{
                text: string;
                success: boolean;
                data: {
                    isValid: boolean;
                    reason: string;
                };
            }>;
        } | {
            name: string;
            similes: string[];
            description: string;
            validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
            handler: (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => Promise<{
                text: string;
                success: boolean;
                error: Error;
                data?: undefined;
            } | {
                text: string;
                success: boolean;
                data: {
                    response: any;
                    channelId: any;
                    replyToMessageId: any;
                };
                error?: undefined;
            }>;
        } | {
            name: string;
            similes: string[];
            description: string;
            validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
            handler: (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => Promise<{
                text: string;
                success: boolean;
                error: Error;
                data?: undefined;
            } | {
                text: string;
                success: boolean;
                data: {
                    operation: any;
                    table: any;
                    query: any;
                    data: any;
                    success: boolean;
                };
                error?: undefined;
            }>;
        })[];
        providers: ({
            name: string;
            description: string;
            get: (runtime: any, message: any, state?: any) => Promise<{
                text: string;
                values: {
                    platform: string;
                    mentionPatterns: string[];
                    channelTypes: string[];
                    validationRules: {
                        requireMention: boolean;
                        allowDirectMessages: boolean;
                        ignoreBotMessages: boolean;
                        ignoreSelfMessages: boolean;
                    };
                };
                data: {
                    platform: string;
                };
                confidence: number;
                source: string;
            }>;
        } | {
            name: string;
            description: string;
            get: (runtime: any, message: any, state?: any) => Promise<{
                text: string;
                values: {
                    connected: boolean;
                    serverId: string;
                    port: string;
                    capabilities: string[];
                    tables: string[];
                };
                data: {
                    mcpServer: string;
                };
                confidence: number;
                source: string;
            }>;
        } | {
            name: string;
            description: string;
            get: (runtime: any, message: any, state?: any) => Promise<{
                text: string;
                values: {
                    hasMention: boolean;
                    mentionPatterns: string[];
                    channelType: any;
                    validationRules: {
                        requireMention: boolean;
                        allowDirectMessages: boolean;
                        ignoreBotMessages: boolean;
                        ignoreSelfMessages: boolean;
                    };
                };
                data: {
                    validation: {
                        hasMention: boolean;
                        patterns: string[];
                    };
                };
                confidence: number;
                source: string;
            }>;
        } | {
            name: string;
            description: string;
            get: (runtime: any, message: any, state?: any) => Promise<{
                text: string;
                values: {
                    canGenerate: boolean;
                    responseType: string;
                    style: string;
                };
                data: {
                    responseGeneration: {
                        canGenerate: boolean;
                    };
                };
                confidence: number;
                source: string;
            }>;
        })[];
    };
    community: {
        description: string;
        name: string;
        config: {
            DISCORD_BOT_TOKEN: string;
            DISCORD_CLIENT_ID: string;
            DISCORD_GUILD_ID: string;
            SUPABASE_URL: string;
            SUPABASE_ANON_KEY: string;
            SUPABASE_SERVICE_ROLE_KEY: string;
            SUPABASE_MCP_PORT: string;
        };
        init(config: Record<string, string>): Promise<void>;
        models: {};
        routes: {
            name: string;
            path: string;
            type: string;
            handler: (req: any, res: any) => Promise<any>;
        }[];
        events: {
            DISCORD_MESSAGE_RECEIVED: ((params: any) => Promise<void>)[];
            DISCORD_MENTION_VALIDATED: ((params: any) => Promise<void>)[];
            DISCORD_RESPONSE_SENT: ((params: any) => Promise<void>)[];
            MCP_SERVER_CONNECTED: ((params: any) => Promise<void>)[];
        };
        services: never[];
        actions: ({
            name: string;
            similes: string[];
            description: string;
            validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
            handler: (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => Promise<{
                text: string;
                success: boolean;
                data: {
                    action: string;
                    reason: string;
                    response?: undefined;
                };
            } | {
                text: string;
                success: boolean;
                data: {
                    action: string;
                    response: string;
                    reason?: undefined;
                };
            }>;
        } | {
            name: string;
            similes: string[];
            description: string;
            validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
            handler: (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => Promise<{
                text: string;
                success: boolean;
                data: {
                    isValid: boolean;
                    reason: string;
                };
            }>;
        } | {
            name: string;
            similes: string[];
            description: string;
            validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
            handler: (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => Promise<{
                text: string;
                success: boolean;
                error: Error;
                data?: undefined;
            } | {
                text: string;
                success: boolean;
                data: {
                    response: any;
                    channelId: any;
                    replyToMessageId: any;
                };
                error?: undefined;
            }>;
        } | {
            name: string;
            similes: string[];
            description: string;
            validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
            handler: (runtime: any, message: any, state?: any, options?: any, callback?: any, responses?: any) => Promise<{
                text: string;
                success: boolean;
                error: Error;
                data?: undefined;
            } | {
                text: string;
                success: boolean;
                data: {
                    operation: any;
                    table: any;
                    query: any;
                    data: any;
                    success: boolean;
                };
                error?: undefined;
            }>;
        })[];
        providers: ({
            name: string;
            description: string;
            get: (runtime: any, message: any, state?: any) => Promise<{
                text: string;
                values: {
                    platform: string;
                    mentionPatterns: string[];
                    channelTypes: string[];
                    validationRules: {
                        requireMention: boolean;
                        allowDirectMessages: boolean;
                        ignoreBotMessages: boolean;
                        ignoreSelfMessages: boolean;
                    };
                };
                data: {
                    platform: string;
                };
                confidence: number;
                source: string;
            }>;
        } | {
            name: string;
            description: string;
            get: (runtime: any, message: any, state?: any) => Promise<{
                text: string;
                values: {
                    connected: boolean;
                    serverId: string;
                    port: string;
                    capabilities: string[];
                    tables: string[];
                };
                data: {
                    mcpServer: string;
                };
                confidence: number;
                source: string;
            }>;
        } | {
            name: string;
            description: string;
            get: (runtime: any, message: any, state?: any) => Promise<{
                text: string;
                values: {
                    hasMention: boolean;
                    mentionPatterns: string[];
                    channelType: any;
                    validationRules: {
                        requireMention: boolean;
                        allowDirectMessages: boolean;
                        ignoreBotMessages: boolean;
                        ignoreSelfMessages: boolean;
                    };
                };
                data: {
                    validation: {
                        hasMention: boolean;
                        patterns: string[];
                    };
                };
                confidence: number;
                source: string;
            }>;
        } | {
            name: string;
            description: string;
            get: (runtime: any, message: any, state?: any) => Promise<{
                text: string;
                values: {
                    canGenerate: boolean;
                    responseType: string;
                    style: string;
                };
                data: {
                    responseGeneration: {
                        canGenerate: boolean;
                    };
                };
                confidence: number;
                source: string;
            }>;
        })[];
    };
};
export default discordIntegrationPlugin;
