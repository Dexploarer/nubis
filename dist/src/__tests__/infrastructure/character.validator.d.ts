import type { Character } from '@elizaos/core';
/**
 * Character Validation Result
 */
export interface CharacterValidationResult {
    isValid: boolean;
    character?: ValidatedCharacter;
    errors: string[];
    warnings: string[];
    suggestions: string[];
    score: number;
    details: {
        basicValidation: boolean;
        pluginValidation: boolean;
        settingsValidation: boolean;
        styleValidation: boolean;
        examplesValidation: boolean;
    };
}
/**
 * Character Testing Configuration
 */
export interface CharacterTestConfig {
    /** Run comprehensive tests */
    comprehensive: boolean;
    /** Validate plugin availability */
    validatePlugins: boolean;
    /** Check for common issues */
    checkCommonIssues: boolean;
    /** Validate settings consistency */
    validateSettings: boolean;
    /** Test character examples */
    testExamples: boolean;
    /** Environment for testing */
    environment: 'development' | 'staging' | 'production';
}
/**
 * Character Validator
 * Comprehensive testing and validation for ElizaOS characters
 */
export declare class CharacterValidator {
    private static readonly COMMON_ISSUES;
    private static readonly REQUIRED_PLUGINS;
    private static readonly RECOMMENDED_PLUGINS;
    /**
     * Validate a character comprehensively
     */
    static validateCharacter(character: Character | unknown, config?: Partial<CharacterTestConfig>): Promise<CharacterValidationResult>;
    /**
     * Perform comprehensive validation
     */
    private static performComprehensiveValidation;
    /**
     * Check for common character issues
     */
    private static checkCommonIssues;
    /**
     * Validate character settings
     */
    private static validateSettings;
    /**
     * Validate character style consistency
     */
    private static validateStyle;
    /**
     * Test character examples
     */
    private static testExamples;
    /**
     * Check if an example is valid
     */
    private static isValidExample;
    /**
     * Generate improvement suggestions
     */
    private static generateSuggestions;
    /**
     * Calculate character quality score
     */
    private static calculateScore;
    /**
     * Get validation summary
     */
    static getValidationSummary(result: CharacterValidationResult): string;
    /**
     * Validate multiple characters
     */
    static validateCharacters(characters: Record<string, Character | unknown>, config?: Partial<CharacterTestConfig>): Promise<Record<string, CharacterValidationResult>>;
}
export declare const characterValidator: typeof CharacterValidator;
export default CharacterValidator;
