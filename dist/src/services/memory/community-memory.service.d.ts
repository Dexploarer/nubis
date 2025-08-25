import type { IAgentRuntime, Memory, UUID } from "@elizaos/core";
import { OptimizedService } from "../base/optimized-service";
/**
 * Community Memory Service
 * Leverages elizaOS's full memory, knowledge, and tracking capabilities
 */
export interface CommunityMemoryConfig {
    trackingLimit: number;
    embeddingPriority: 'high' | 'normal' | 'low';
    memoryScope: 'shared' | 'private' | 'room';
    tables: string[];
    enableAutoModeration: boolean;
    enableAnalytics: boolean;
    enableRoleTracking: boolean;
}
export interface MemoryMetrics {
    totalMemories: number;
    memoriesByType: Record<string, number>;
    memoriesByScope: Record<string, number>;
    embeddingQueueSize: number;
    searchPerformance: number;
    lastBackup: number;
}
export interface CommunityInsight {
    type: 'user_behavior' | 'conversation_pattern' | 'moderation_trend' | 'engagement_metric';
    title: string;
    description: string;
    data: Record<string, any>;
    confidence: number;
    timestamp: number;
    actionable: boolean;
    recommendations?: string[];
}
export declare class CommunityMemoryService extends OptimizedService {
    private _config;
    private memoryCache;
    private insightCache;
    private lastAnalysis;
    private analysisInterval;
    get capabilityDescription(): string;
    constructor(runtime: IAgentRuntime, config?: Partial<CommunityMemoryConfig>);
    protected initialize(): Promise<void>;
    protected cleanup(): Promise<void>;
    /**
     * Create and track a community memory with optimal settings
     */
    createCommunityMemory(content: string, metadata: {
        type: 'message' | 'fact' | 'document' | 'moderation' | 'role_change';
        scope: 'shared' | 'private' | 'room';
        entityId?: UUID;
        roomId?: UUID;
        tags?: string[];
        priority?: 'high' | 'normal' | 'low';
    }): Promise<UUID>;
    /**
     * Search community memories with semantic understanding
     */
    searchCommunityMemories(query: string, options?: {
        scope?: 'shared' | 'private' | 'room';
        type?: string;
        roomId?: UUID;
        entityId?: UUID;
        count?: number;
        threshold?: number;
    }): Promise<Memory[]>;
    /**
     * Get comprehensive community insights
     */
    getCommunityInsights(roomId?: UUID, timeframe?: number): Promise<CommunityInsight[]>;
    /**
     * Track role changes and permissions
     */
    trackRoleChange(userId: UUID, oldRole: string, newRole: string, roomId: UUID, reason?: string): Promise<void>;
    /**
     * Get memory metrics and performance data
     */
    getMemoryMetrics(): Promise<MemoryMetrics>;
    /**
     * Backup community memories
     */
    backupMemories(): Promise<boolean>;
    /**
     * Private helper methods
     */
    private initializeMemoryTables;
    private startPeriodicAnalysis;
    private getTableForMemoryType;
    private generateEmbedding;
    private updateMemoryMetrics;
    private analyzeUserBehavior;
    private analyzeConversationPatterns;
    private analyzeModerationTrends;
    private analyzeEngagementMetrics;
}
export interface CommunityManagementTemplate {
    id: string;
    name: string;
    description: string;
    features: string[];
    config: Partial<CommunityMemoryConfig>;
}
export interface CommunityManagementConfig {
    enabled: boolean;
    features: string[];
    config: Partial<CommunityMemoryConfig>;
}
export interface CommunityMember {
    id: string;
    name: string;
    role: string;
    joinDate: number;
    lastActive: number;
}
export interface ModerationAction {
    id: string;
    type: 'warn' | 'mute' | 'ban' | 'delete';
    targetId: string;
    reason: string;
    moderatorId: string;
    timestamp: number;
}
export interface CommunityGuideline {
    id: string;
    title: string;
    description: string;
    category: string;
    severity: 'low' | 'medium' | 'high';
}
export interface CommunityHealthMetrics {
    totalMembers: number;
    activeMembers: number;
    totalMessages: number;
    moderationActions: number;
    healthScore: number;
    lastUpdated: number;
}
export default CommunityMemoryService;
