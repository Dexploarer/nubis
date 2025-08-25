import type { IAgentRuntime, Memory, State } from "@elizaos/core";
/**
 * Nubi Community Plugin
 * Comprehensive community management plugin with advanced features integration
 */
/**
 * Community Wisdom Action
 * Shares ancient wisdom relevant to community situations
 */
export declare const communityWisdomAction: {
    name: string;
    similes: string[];
    description: string;
    validate: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<boolean>;
    handler: (runtime: IAgentRuntime, message: Memory, state?: State, options?: any, callback?: (response: any) => Promise<void>, responses?: Memory[]) => Promise<{
        text: string;
        success: boolean;
        data?: any;
        error?: Error;
        values?: Record<string, any>;
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
    metadata: {
        category: string;
        priority: number;
        requiresAuth: boolean;
        platform: string[];
        tags: string[];
    };
    restrictions: {
        maxPerHour: number;
        maxPerDay: number;
        cooldown: number;
        userLevel: string;
    };
};
/**
 * Conflict Resolution Action
 * Helps resolve community conflicts using ancient wisdom
 */
export declare const conflictResolutionAction: {
    name: string;
    similes: string[];
    description: string;
    validate: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<boolean>;
    handler: (runtime: IAgentRuntime, message: Memory, state?: State, options?: any, callback?: (response: any) => Promise<void>, responses?: Memory[]) => Promise<{
        text: string;
        success: boolean;
        data?: any;
        error?: Error;
        values?: Record<string, any>;
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
    metadata: {
        category: string;
        priority: number;
        requiresAuth: boolean;
        platform: string[];
        tags: string[];
    };
    restrictions: {
        maxPerHour: number;
        maxPerDay: number;
        cooldown: number;
        userLevel: string;
    };
};
/**
 * Ancient Wisdom Provider
 * Provides ancient wisdom and philosophical insights
 */
export declare const ancientWisdomProvider: {
    name: string;
    description: string;
    get: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<{
        text: string;
        values: Record<string, any>;
        data: any;
        confidence?: number;
        source?: string;
        timestamp?: Date;
    }>;
    capabilities: {
        realTime: boolean;
        historical: boolean;
        predictive: boolean;
        contextual: boolean;
    };
    dataTypes: string[];
};
/**
 * Community Health Provider
 * Provides insights into community health and metrics
 */
export declare const communityHealthProvider: {
    name: string;
    description: string;
    get: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<{
        text: string;
        values: Record<string, any>;
        data: any;
        confidence?: number;
        source?: string;
        timestamp?: Date;
    }>;
    capabilities: {
        realTime: boolean;
        historical: boolean;
        predictive: boolean;
        contextual: boolean;
    };
    dataTypes: string[];
};
/**
 * Wisdom Management Service
 * Manages ancient wisdom database and distribution
 */
export declare class WisdomService {
    protected runtime: IAgentRuntime;
    static serviceType: string;
    capabilityDescription: string;
    private startTime;
    private wisdomRequests;
    private averageResponseTime;
    private wisdomDatabase;
    constructor(runtime: IAgentRuntime);
    static start(runtime: IAgentRuntime): Promise<WisdomService>;
    static stop(runtime: IAgentRuntime): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    getStatus(): Promise<{
        status: "running" | "stopped" | "error";
        uptime: number;
        metrics: Record<string, any>;
    }>;
    getConfig(): Promise<Record<string, any>>;
    updateConfig(config: Record<string, any>): Promise<void>;
    requestWisdom(context: string, category: string): Promise<string>;
    private initializeWisdomDatabase;
}
/**
 * Nubi Community Plugin
 * Main plugin that brings together all Nubi functionality
 */
export declare const nubiCommunityPlugin: {
    name: string;
    description: string;
    config: {
        WISDOM_DB_KEY: string | undefined;
        ANCIENT_TEXTS_ACCESS: string | undefined;
        COMMUNITY_METRICS_TOKEN: string | undefined;
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
        MESSAGE_RECEIVED: ((params: any) => Promise<void>)[];
        WORLD_CONNECTED: ((params: any) => Promise<void>)[];
    };
    services: (typeof WisdomService)[];
    actions: {
        name: string;
        similes: string[];
        description: string;
        validate: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<boolean>;
        handler: (runtime: IAgentRuntime, message: Memory, state?: State, options?: any, callback?: (response: any) => Promise<void>, responses?: Memory[]) => Promise<{
            text: string;
            success: boolean;
            data?: any;
            error?: Error;
            values?: Record<string, any>;
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
        metadata: {
            category: string;
            priority: number;
            requiresAuth: boolean;
            platform: string[];
            tags: string[];
        };
        restrictions: {
            maxPerHour: number;
            maxPerDay: number;
            cooldown: number;
            userLevel: string;
        };
    }[];
    providers: {
        name: string;
        description: string;
        get: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<{
            text: string;
            values: Record<string, any>;
            data: any;
            confidence?: number;
            source?: string;
            timestamp?: Date;
        }>;
        capabilities: {
            realTime: boolean;
            historical: boolean;
            predictive: boolean;
            contextual: boolean;
        };
        dataTypes: string[];
    }[];
};
export default nubiCommunityPlugin;
