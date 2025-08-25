import type { Character } from "@elizaos/core";
/**
 * Enhanced Community Management Templates
 * Leveraging elizaOS's full memory, knowledge, and community control capabilities
 */
export interface CommunityManagementTemplate {
    id: string;
    label: string;
    description: string;
    template: Partial<Character>;
    memoryConfig: {
        trackingLimit: number;
        embeddingPriority: 'high' | 'normal' | 'low';
        scope: 'shared' | 'private' | 'room';
        tables: string[];
    };
    communityFeatures: {
        roleManagement: boolean;
        moderation: boolean;
        analytics: boolean;
        onboarding: boolean;
        guidelines: boolean;
    };
}
export declare const communityManagementTemplates: CommunityManagementTemplate[];
/**
 * Get a template by its ID
 */
export declare const getCommunityTemplate: (id: string) => CommunityManagementTemplate | undefined;
/**
 * Get all available community management templates
 */
export declare const getAllCommunityTemplates: () => CommunityManagementTemplate[];
/**
 * Get templates by feature requirements
 */
export declare const getTemplatesByFeatures: (features: Partial<{
    roleManagement: boolean;
    moderation: boolean;
    analytics: boolean;
    onboarding: boolean;
    guidelines: boolean;
}>) => CommunityManagementTemplate[];
export default communityManagementTemplates;
