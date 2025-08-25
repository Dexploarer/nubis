/**
 * Dynamic Character Plugin for ElizaOS
 * Enables runtime personality switching and context-aware character adaptation
 */
import type { Plugin, Action, Provider, IAgentRuntime } from '@elizaos/core';
import { Service } from '@elizaos/core';
export interface PersonalityProfile {
    id: string;
    name: string;
    system: string;
    style: {
        all: string[];
        chat: string[];
        post: string[];
    };
    actions: string[];
    description: string;
}
export declare const personalityProfiles: Record<string, PersonalityProfile>;
export declare class DynamicCharacterService extends Service {
    protected runtime: IAgentRuntime;
    static serviceType: string;
    capabilityDescription: string;
    private currentPersonality;
    private personalityHistory;
    constructor(runtime: IAgentRuntime);
    /**
     * Log method for the service
     */
    private log;
    static start(runtime: IAgentRuntime): Promise<DynamicCharacterService>;
    static stop(runtime: IAgentRuntime): Promise<void>;
    private initialize;
    /**
     * Switch to a different personality
     */
    switchPersonality(personalityId: string, reason?: string): Promise<boolean>;
    /**
     * Get current personality
     */
    getCurrentPersonality(): string;
    /**
     * Get personality history
     */
    getPersonalityHistory(): Array<{
        personality: string;
        timestamp: number;
        reason: string;
    }>;
    /**
     * Analyze context and set appropriate personality
     */
    analyzeAndSetInitialPersonality(): Promise<void>;
    /**
     * Apply personality changes to the runtime character
     */
    private applyPersonalityToCharacter;
    stop(): Promise<void>;
}
export declare const switchPersonalityAction: Action;
export declare const contextAnalysisProvider: Provider;
export declare const dynamicCharacterPlugin: Plugin;
export default dynamicCharacterPlugin;
