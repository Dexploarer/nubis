/**
 * Discord Message Handler Template
 * Implements @ mention validation and Supabase MCP integration
 * Based on actual working ElizaOS plugin structure
 */
/**
 * Discord Message Handler Plugin
 * Handles Discord message processing with @ mention validation and database integration
 */
export declare const discordMessageHandlerPlugin: {
    name: string;
    description: string;
    config: {
        DISCORD_BOT_TOKEN: string;
        DISCORD_CLIENT_ID: string;
        SUPABASE_URL: string;
        SUPABASE_ANON_KEY: string;
    };
    init(config: Record<string, string>): Promise<void>;
    models: {};
    routes: {
        name: string;
        path: string;
        type: string;
        handler: (req: any, res: any) => Promise<void>;
    }[];
    events: {
        DISCORD_MESSAGE_RECEIVED: ((params: any) => Promise<void>)[];
        DISCORD_MENTION_VALIDATED: ((params: any) => Promise<void>)[];
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
                shouldRespond: boolean;
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
                action: string;
            };
        }>;
    })[];
    providers: ({
        name: string;
        description: string;
        get: (runtime: any, message: any, state?: any) => Promise<{
            text: string;
            values: {
                channelType: any;
                isBot: any;
                isSelf: any;
                mentionPatterns: string[];
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
                capabilities: string[];
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
    })[];
};
/**
 * Build Discord message handler plugin
 */
export declare function buildDiscordMessageHandler(): {
    name: string;
    description: string;
    config: {
        DISCORD_BOT_TOKEN: string;
        DISCORD_CLIENT_ID: string;
        SUPABASE_URL: string;
        SUPABASE_ANON_KEY: string;
    };
    init(config: Record<string, string>): Promise<void>;
    models: {};
    routes: {
        name: string;
        path: string;
        type: string;
        handler: (req: any, res: any) => Promise<void>;
    }[];
    events: {
        DISCORD_MESSAGE_RECEIVED: ((params: any) => Promise<void>)[];
        DISCORD_MENTION_VALIDATED: ((params: any) => Promise<void>)[];
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
                shouldRespond: boolean;
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
                action: string;
            };
        }>;
    })[];
    providers: ({
        name: string;
        description: string;
        get: (runtime: any, message: any, state?: any) => Promise<{
            text: string;
            values: {
                channelType: any;
                isBot: any;
                isSelf: any;
                mentionPatterns: string[];
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
                capabilities: string[];
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
    })[];
};
/**
 * Discord message handler variants
 */
export declare const discordMessageHandlerVariants: {
    strict: {
        description: string;
        name: string;
        config: {
            DISCORD_BOT_TOKEN: string;
            DISCORD_CLIENT_ID: string;
            SUPABASE_URL: string;
            SUPABASE_ANON_KEY: string;
        };
        init(config: Record<string, string>): Promise<void>;
        models: {};
        routes: {
            name: string;
            path: string;
            type: string;
            handler: (req: any, res: any) => Promise<void>;
        }[];
        events: {
            DISCORD_MESSAGE_RECEIVED: ((params: any) => Promise<void>)[];
            DISCORD_MENTION_VALIDATED: ((params: any) => Promise<void>)[];
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
                    shouldRespond: boolean;
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
                    action: string;
                };
            }>;
        })[];
        providers: ({
            name: string;
            description: string;
            get: (runtime: any, message: any, state?: any) => Promise<{
                text: string;
                values: {
                    channelType: any;
                    isBot: any;
                    isSelf: any;
                    mentionPatterns: string[];
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
                    capabilities: string[];
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
        })[];
    };
    flexible: {
        description: string;
        name: string;
        config: {
            DISCORD_BOT_TOKEN: string;
            DISCORD_CLIENT_ID: string;
            SUPABASE_URL: string;
            SUPABASE_ANON_KEY: string;
        };
        init(config: Record<string, string>): Promise<void>;
        models: {};
        routes: {
            name: string;
            path: string;
            type: string;
            handler: (req: any, res: any) => Promise<void>;
        }[];
        events: {
            DISCORD_MESSAGE_RECEIVED: ((params: any) => Promise<void>)[];
            DISCORD_MENTION_VALIDATED: ((params: any) => Promise<void>)[];
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
                    shouldRespond: boolean;
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
                    action: string;
                };
            }>;
        })[];
        providers: ({
            name: string;
            description: string;
            get: (runtime: any, message: any, state?: any) => Promise<{
                text: string;
                values: {
                    channelType: any;
                    isBot: any;
                    isSelf: any;
                    mentionPatterns: string[];
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
                    capabilities: string[];
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
        })[];
    };
};
export default discordMessageHandlerPlugin;
