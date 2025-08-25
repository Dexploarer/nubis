import type { Character } from "@elizaos/core";
import { ValidatedCharacter } from '../schemas/character.schema';
/**
 * Character Factory Options
 */
export interface CharacterFactoryOptions {
    /** Environment-specific overrides */
    environment?: 'development' | 'staging' | 'production';
    /** Default settings to apply */
    defaultSettings?: Partial<ValidatedCharacter['settings']>;
    /** Plugin availability check */
    validatePlugins?: boolean;
    /** Strict validation mode */
    strict?: boolean;
    /** Custom validation rules */
    customValidation?: (character: ValidatedCharacter) => Promise<boolean>;
}
/**
 * Character Validation Error
 */
export declare class CharacterValidationError extends Error {
    readonly originalError?: Error | undefined;
    readonly validationErrors?: string[] | undefined;
    constructor(message: string, originalError?: Error | undefined, validationErrors?: string[] | undefined);
}
/**
 * Character Factory
 * Creates and validates ElizaOS characters with comprehensive error handling
 */
export declare class CharacterFactory {
    private static readonly DEFAULT_SETTINGS;
    /**
     * Create a character with validation
     */
    static createCharacter(characterData: unknown, options?: CharacterFactoryOptions): Promise<ValidatedCharacter>;
    /**
     * Create a character safely (returns validation result instead of throwing)
     */
    static createCharacterSafe(characterData: unknown, options?: CharacterFactoryOptions): Promise<{
        success: boolean;
        character?: ValidatedCharacter;
        errors?: string[];
    }>;
    /**
     * Create a character from a template
     */
    static createFromTemplate(templateName: string, overrides?: Partial<ValidatedCharacter>, options?: CharacterFactoryOptions): Promise<ValidatedCharacter>;
    /**
     * Validate an existing character
     */
    static validateExistingCharacter(character: Character, options?: CharacterFactoryOptions): Promise<{
        isValid: boolean;
        errors?: string[];
        warnings?: string[];
    }>;
    /**
     * Apply factory options and defaults
     */
    private static applyFactoryOptions;
    /**
     * Apply environment-specific configurations
     */
    private static applyEnvironmentConfig;
    /**
     * Validate plugin dependencies
     */
    private static validatePluginDependencies;
    /**
     * Load a character template
     */
    private static loadTemplate;
    /**
     * Merge character data
     */
    private static mergeCharacterData;
    /**
     * Deep merge objects
     */
    private static deepMerge;
    /**
     * Get available templates
     */
    static getAvailableTemplates(): string[];
    /**
     * Get default settings
     */
    static getDefaultSettings(): typeof this.DEFAULT_SETTINGS;
}
export declare const characterFactory: typeof CharacterFactory;
export default CharacterFactory;
