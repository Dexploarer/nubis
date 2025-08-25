/**
 * Characters Index - ElizaOS Standard Structure with Validation
 *
 * This file exports all available characters for the ElizaOS project.
 * Each character is validated using the new validation system.
 */
/**
 * Get all characters with validation
 */
export declare function getValidatedCharacters(): Promise<{
    characters: Record<string, any>;
    validation: Record<string, any>;
}>;
/**
 * Get a specific validated character
 */
export declare function getValidatedCharacter(name: string): Promise<{
    character: any;
    validation: any;
}>;
/**
 * Get character validation summary
 */
export declare function getCharacterValidationSummary(): Promise<Record<string, string>>;
/**
 * Legacy exports for backward compatibility
 */
export declare const characters: {
    'Example Agent': import("@elizaos/core").Character;
    'Community Manager': import("@elizaos/core").Character;
    Nubi: import("@elizaos/core").Character;
};
export { getExampleAgent } from './example-agent';
export { getCommunityManager } from './community-manager';
export { nubiCharacter } from './nubi';
export default characters;
