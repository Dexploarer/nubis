/**
 * Template Utilities
 * Helper functions for working with ElizaOS templates
 */
import type { Character } from "@elizaos/core";
/**
 * Template Variable Interface
 * Defines the structure of variables that can be used in templates
 */
export interface TemplateVariables {
    agentName: string;
    agentUsername?: string;
    characterTraits?: string[];
    expertiseAreas?: string[];
    writingStyle?: string;
    platform?: string;
    tone?: string;
    length?: string;
    hashtagCount?: number;
    includeCTA?: boolean;
    styleGuidelines?: string[];
    providers?: string[];
    actionNames?: string[];
    [key: string]: any;
}
/**
 * Template Context Interface
 * Provides context for template rendering
 */
export interface TemplateContext {
    character: Character;
    platform: string;
    user?: {
        name: string;
        id: string;
        roles?: string[];
    };
    channel?: {
        id: string;
        type: string;
        permissions?: string[];
    };
    message?: {
        content: string;
        type: string;
        attachments?: any[];
    };
    [key: string]: any;
}
/**
 * Render Template
 * Replaces template variables with actual values
 */
export declare function renderTemplate(template: string, variables: TemplateVariables, context?: TemplateContext): string;
/**
 * Validate Template
 * Checks if a template is valid and complete
 */
export declare function validateTemplate(template: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * Customize Template
 * Allows customization of existing templates
 */
export declare function customizeTemplate(baseTemplate: string, customizations: Partial<TemplateVariables>, additionalInstructions?: string): string;
/**
 * Merge Templates
 * Combines multiple templates into one
 */
export declare function mergeTemplates(templates: string[], separator?: string): string;
/**
 * Extract Template Variables
 * Extracts all variables used in a template
 */
export declare function extractTemplateVariables(template: string): string[];
/**
 * Create Template from Character
 * Generates a basic template based on character properties
 */
export declare function createTemplateFromCharacter(character: Character, templateType: 'messageHandler' | 'postCreation' | 'general'): string;
/**
 * Template Quality Score
 * Provides a quality score for templates based on various factors
 */
export declare function getTemplateQualityScore(template: string): {
    score: number;
    factors: {
        factor: string;
        score: number;
        maxScore: number;
    }[];
};
declare const _default: {
    renderTemplate: typeof renderTemplate;
    validateTemplate: typeof validateTemplate;
    customizeTemplate: typeof customizeTemplate;
    mergeTemplates: typeof mergeTemplates;
    extractTemplateVariables: typeof extractTemplateVariables;
    createTemplateFromCharacter: typeof createTemplateFromCharacter;
    getTemplateQualityScore: typeof getTemplateQualityScore;
};
export default _default;
