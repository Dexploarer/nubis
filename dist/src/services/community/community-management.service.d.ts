import type { IAgentRuntime, UUID } from "@elizaos/core";
import { OptimizedService } from "../base/optimized-service";
/**
 * Community Management Service
 * Integrates with elizaOS's native role management and community control
 */
export interface CommunityManagementConfig {
    enableRoleManagement: boolean;
    enableAutoModeration: boolean;
    enableCommunityAnalytics: boolean;
    enableOnboarding: boolean;
    enableGuidelines: boolean;
    moderationThresholds: {
        warningThreshold: number;
        timeoutThreshold: number;
        banThreshold: number;
    };
    roleHierarchy: {
        OWNER: number;
        ADMIN: number;
        MODERATOR: number;
        MEMBER: number;
        GUEST: number;
    };
}
export interface CommunityMember {
    userId: UUID;
    username: string;
    role: string;
    joinDate: number;
    lastActive: number;
    messageCount: number;
    moderationHistory: ModerationAction[];
    reputation: number;
}
export interface ModerationAction {
    id: string;
    type: 'warning' | 'timeout' | 'mute' | 'kick' | 'ban';
    reason: string;
    moderatorId: UUID;
    timestamp: number;
    duration?: number;
    evidence?: string[];
    appealable: boolean;
    status: 'active' | 'expired' | 'appealed' | 'overturned';
}
export interface CommunityGuideline {
    id: string;
    title: string;
    description: string;
    category: 'behavior' | 'content' | 'interaction' | 'technical';
    severity: 'low' | 'medium' | 'high' | 'critical';
    examples: string[];
    consequences: string[];
    lastUpdated: number;
    version: number;
}
export interface CommunityHealthMetrics {
    totalMembers: number;
    activeMembers: number;
    moderationActions: number;
    conflictResolutions: number;
    engagementScore: number;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    recommendations: string[];
}
export declare class CommunityManagementService extends OptimizedService {
    private communityConfig;
    private memoryService;
    private members;
    private guidelines;
    private moderationActions;
    private healthCheckInterval;
    private roomId;
    capabilityDescription: string;
    readonly serviceMetadata: {
        name: string;
        version: string;
        description: string;
        capabilities: string[];
        dependencies: string[];
        configSchema: {
            enableRoleManagement: string;
            enableAutoModeration: string;
            enableCommunityAnalytics: string;
            enableOnboarding: string;
            enableGuidelines: string;
        };
    };
    constructor(runtime: IAgentRuntime, config?: Partial<CommunityManagementConfig>);
    /**
     * Register this service with the elizaOS runtime
     * @returns Promise that resolves when registration is complete
     * @throws Error if registration fails
     */
    registerWithRuntime(): Promise<void>;
    /**
     * Discover existing CommunityManagementService from runtime
     * @param runtime - The elizaOS runtime instance
     * @returns Promise that resolves to the discovered service or null
     */
    static discoverFromRuntime(runtime: IAgentRuntime): Promise<CommunityManagementService | null>;
    /**
     * Validate configuration parameters
     */
    private validateConfig;
    protected initialize(): Promise<void>;
    protected cleanup(): Promise<void>;
    protected performCustomHealthChecks(): Promise<Array<{
        name: string;
        status: 'pass' | 'fail' | 'warn';
        message: string;
        duration: number;
    }>>;
    /**
     * Role Management
     */
    /**
     * Assign a role to a user
     * @param userId - The user ID to assign the role to
     * @param newRole - The new role to assign
     * @param assignedBy - The user ID of who is assigning the role
     * @param reason - Optional reason for the role assignment
     * @returns Promise that resolves to true if successful
     * @throws Error with code 'ROLE_MANAGEMENT_DISABLED' if role management is disabled
     * @throws Error with code 'INSUFFICIENT_PERMISSIONS' if assigner lacks permissions
     */
    assignRole(userId: UUID, newRole: string, assignedBy: UUID, reason?: string): Promise<boolean>;
    /**
     * Remove a user's role (sets to GUEST)
     * @param userId - The user ID to remove the role from
     * @param removedBy - The user ID of who is removing the role
     * @param reason - Reason for removing the role
     * @returns Promise that resolves to true if successful
     * @throws Error with code 'ROLE_MANAGEMENT_DISABLED' if role management is disabled
     * @throws Error with code 'MEMBER_NOT_FOUND' if user doesn't exist
     */
    removeRole(userId: UUID, removedBy: UUID, reason: string): Promise<boolean>;
    /**
     * Moderation Actions
     */
    /**
     * Moderate a user with specified action
     * @param userId - The user ID to moderate
     * @param action - The type of moderation action
     * @param reason - Reason for the moderation
     * @param moderatorId - The user ID of the moderator
     * @param duration - Optional duration for timeouts/mutes
     * @param evidence - Optional evidence for the moderation
     * @returns Promise that resolves to the moderation action
     * @throws Error with code 'AUTO_MODERATION_DISABLED' if moderation is disabled
     * @throws Error with code 'MEMBER_NOT_FOUND' if user doesn't exist
     */
    moderateUser(userId: UUID, action: 'warning' | 'timeout' | 'mute' | 'kick' | 'ban', reason: string, moderatorId: UUID, duration?: number, evidence?: string[]): Promise<ModerationAction>;
    /**
     * Appeal a moderation action
     * @param actionId - The ID of the moderation action to appeal
     * @param userId - The user ID filing the appeal
     * @param appealReason - Reason for the appeal
     * @returns Promise that resolves to true if successful
     * @throws Error with code 'MODERATION_ACTION_NOT_FOUND' if action doesn't exist
     * @throws Error with code 'ACTION_NOT_APPEALABLE' if action cannot be appealed
     * @throws Error with code 'ACTION_NOT_ACTIVE' if action is not active
     */
    appealModerationAction(actionId: string, userId: UUID, appealReason: string): Promise<boolean>;
    /**
     * Community Guidelines
     */
    /**
     * Add a new community guideline
     * @param guideline - The guideline data to add
     * @returns Promise that resolves to the new guideline ID
     * @throws Error with code 'GUIDELINES_DISABLED' if guidelines are disabled
     */
    addGuideline(guideline: Omit<CommunityGuideline, 'id' | 'lastUpdated' | 'version'>): Promise<string>;
    /**
     * Update an existing community guideline
     * @param id - The ID of the guideline to update
     * @param updates - The updates to apply
     * @param updatedBy - The user ID making the update
     * @returns Promise that resolves to true if successful
     * @throws Error with code 'GUIDELINE_NOT_FOUND' if guideline doesn't exist
     */
    updateGuideline(id: string, updates: Partial<Omit<CommunityGuideline, 'id' | 'version'>>, updatedBy: UUID): Promise<boolean>;
    /**
     * Community Analytics
     */
    /**
     * Get community health metrics and status
     * @returns Promise that resolves to community health information
     */
    getCommunityHealth(): Promise<CommunityHealthMetrics>;
    /**
     * Get analytics for a specific member
     * @param userId - The user ID to get analytics for
     * @returns Promise that resolves to member analytics or null if not found
     */
    getMemberAnalytics(userId: UUID): Promise<Partial<CommunityMember> | null>;
    /**
     * Onboarding
     */
    /**
     * Onboard a new community member
     * @param userId - The user ID for the new member
     * @param username - The username for the new member
     * @param welcomeMessage - Optional welcome message
     * @returns Promise that resolves to the new member data
     * @throws Error with code 'ONBOARDING_DISABLED' if onboarding is disabled
     * @throws Error with code 'MEMBER_ALREADY_EXISTS' if user already exists
     */
    onboardNewMember(userId: UUID, username: string, welcomeMessage?: string): Promise<CommunityMember>;
    /**
     * Private helper methods
     */
    private initializeGuidelines;
    private loadCommunityData;
    private startHealthMonitoring;
    private canAssignRole;
    private checkModerationEscalation;
    private getReputationPenalty;
    private logModerationAction;
    /**
     * Event System for Community Actions
     */
    private emitCommunityEvent;
    /**
     * Performance Monitoring
     */
    private trackPerformance;
    /**
     * Enhanced measureOperation with performance tracking
     */
    protected measureOperation<T>(operation: () => Promise<T>, operationName: string): Promise<T>;
}
export default CommunityManagementService;
