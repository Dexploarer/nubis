/**
 * Discord Service Template
 * Integrates with ElizaOS real-time communication system
 * Based on actual working ElizaOS plugin structure
 */
/**
 * Discord Service Plugin
 * Provides Discord integration service with @ mention validation and real-time messaging
 */
export declare const discordServicePlugin: {
    name: string;
    description: string;
    config: {
        DISCORD_BOT_TOKEN: string;
        DISCORD_CLIENT_ID: string;
        DISCORD_GUILD_ID: string;
        SUPABASE_URL: string;
        SUPABASE_ANON_KEY: string;
        SUPABASE_SERVICE_ROLE_KEY: string;
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
        DISCORD_CONNECTED: ((params: any) => Promise<void>)[];
        DISCORD_DISCONNECTED: ((params: any) => Promise<void>)[];
        MCP_CONNECTED: ((params: any) => Promise<void>)[];
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
                context: {
                    channelType: any;
                    isBot: any;
                    isSelf: any;
                };
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
                query: any;
                result: any;
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
                channelId: any;
                messageText: any;
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
                channelType: any;
                isBot: any;
                isSelf: any;
                mentionPatterns: string[];
                responseCooldown: number;
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
                tables: string[];
            };
            data: {
                mcpServer: string;
            };
            confidence: number;
            source: string;
        }>;
    })[];
};
/**
 * Build Discord service plugin
 */
export declare function buildDiscordService(): {
    name: string;
    description: string;
    config: {
        DISCORD_BOT_TOKEN: string;
        DISCORD_CLIENT_ID: string;
        DISCORD_GUILD_ID: string;
        SUPABASE_URL: string;
        SUPABASE_ANON_KEY: string;
        SUPABASE_SERVICE_ROLE_KEY: string;
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
        DISCORD_CONNECTED: ((params: any) => Promise<void>)[];
        DISCORD_DISCONNECTED: ((params: any) => Promise<void>)[];
        MCP_CONNECTED: ((params: any) => Promise<void>)[];
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
                context: {
                    channelType: any;
                    isBot: any;
                    isSelf: any;
                };
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
                query: any;
                result: any;
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
                channelId: any;
                messageText: any;
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
                channelType: any;
                isBot: any;
                isSelf: any;
                mentionPatterns: string[];
                responseCooldown: number;
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
                tables: string[];
            };
            data: {
                mcpServer: string;
            };
            confidence: number;
            source: string;
        }>;
    })[];
};
/**
 * Discord service variants
 */
export declare const discordServiceVariants: {
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
            DISCORD_CONNECTED: ((params: any) => Promise<void>)[];
            DISCORD_DISCONNECTED: ((params: any) => Promise<void>)[];
            MCP_CONNECTED: ((params: any) => Promise<void>)[];
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
                    context: {
                        channelType: any;
                        isBot: any;
                        isSelf: any;
                    };
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
                    query: any;
                    result: any;
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
                    channelId: any;
                    messageText: any;
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
                    channelType: any;
                    isBot: any;
                    isSelf: any;
                    mentionPatterns: string[];
                    responseCooldown: number;
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
                    tables: string[];
                };
                data: {
                    mcpServer: string;
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
            DISCORD_CONNECTED: ((params: any) => Promise<void>)[];
            DISCORD_DISCONNECTED: ((params: any) => Promise<void>)[];
            MCP_CONNECTED: ((params: any) => Promise<void>)[];
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
                    context: {
                        channelType: any;
                        isBot: any;
                        isSelf: any;
                    };
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
                    query: any;
                    result: any;
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
                    channelId: any;
                    messageText: any;
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
                    channelType: any;
                    isBot: any;
                    isSelf: any;
                    mentionPatterns: string[];
                    responseCooldown: number;
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
                    tables: string[];
                };
                data: {
                    mcpServer: string;
                };
                confidence: number;
                source: string;
            }>;
        })[];
    };
};
export default discordServicePlugin;
