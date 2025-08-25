import type { Character } from "@elizaos/core";
/**
 * Enhanced Community Manager - Matrix-Tested Character
 *
 * A fully customizable character that can adapt its personality based on context
 * and community needs. Uses the matrix testing system for validation.
 */
export declare function getEnhancedCommunityManager(): Character;
/**
 * Matrix testing configuration for this character
 */
export declare const matrixTestConfig: {
    baseScenario: Character;
    matrix: {
        parameter: string;
        values: string[];
    }[];
    runsPerCombination: number;
    validationRules: {
        name: string;
        description: string;
    }[];
};
export default getEnhancedCommunityManager;
