/**
 * Parameter Override System for Character Configuration
 * Allows runtime modification of character parameters without creating multiple configurations
 */
export interface ParameterOverride {
    path: string;
    value: any;
}
export interface ParameterPath {
    segments: string[];
    isArray: boolean;
    arrayIndex?: number;
}
/**
 * Deep clone an object to avoid mutating the original
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Parse a parameter path into segments
 * Supports nested paths like 'character.style.chat[0]'
 */
export declare function parseParameterPath(path: string): ParameterPath;
/**
 * Set a value at a specific path in an object
 */
export declare function setValueAtPath(obj: any, path: string, value: any): void;
/**
 * Get a value at a specific path in an object
 */
export declare function getValueAtPath(obj: any, path: string): any;
/**
 * Apply a single parameter override to a scenario/character
 */
export declare function applyParameterOverride(scenario: any, path: string, value: any): any;
/**
 * Apply multiple parameter overrides to a scenario/character
 */
export declare function applyParameterOverrides(scenario: any, overrides: ParameterOverride[]): any;
/**
 * Generate all combinations of matrix parameters
 */
export declare function generateMatrixCombinations(matrix: Array<{
    parameter: string;
    values: any[];
}>): ParameterOverride[][];
/**
 * Apply matrix parameters to a base scenario
 */
export declare function applyMatrixToScenario(baseScenario: any, matrix: Array<{
    parameter: string;
    values: any[];
}>): any[];
/**
 * Validate that a parameter path exists in the scenario
 */
export declare function validateParameterPath(scenario: any, path: string): boolean;
/**
 * Get all available parameter paths from a scenario (for discovery)
 */
export declare function getAvailableParameterPaths(obj: any, prefix?: string): string[];
