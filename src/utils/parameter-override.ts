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
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
}

/**
 * Parse a parameter path into segments
 * Supports nested paths like 'character.style.chat[0]'
 */
export function parseParameterPath(path: string): ParameterPath {
  const segments: string[] = [];
  let currentSegment = '';
  let isArray = false;
  let arrayIndex: number | undefined;
  
  for (let i = 0; i < path.length; i++) {
    const char = path[i];
    
    if (char === '.') {
      if (currentSegment) {
        segments.push(currentSegment);
        currentSegment = '';
      }
    } else if (char === '[') {
      if (currentSegment) {
        segments.push(currentSegment);
        currentSegment = '';
      }
      isArray = true;
    } else if (char === ']') {
      if (currentSegment) {
        arrayIndex = parseInt(currentSegment, 10);
        currentSegment = '';
      }
    } else {
      currentSegment += char;
    }
  }
  
  if (currentSegment) {
    segments.push(currentSegment);
  }
  
  return { segments, isArray, arrayIndex };
}

/**
 * Set a value at a specific path in an object
 */
export function setValueAtPath(obj: any, path: string, value: any): void {
  const { segments, isArray, arrayIndex } = parseParameterPath(path);
  let current = obj;
  
  // Navigate to the parent of the target property
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    
    if (!(segment in current)) {
      current[segment] = {};
    }
    
    current = current[segment];
  }
  
  const lastSegment = segments[segments.length - 1];
  
  if (isArray && arrayIndex !== undefined) {
    if (!Array.isArray(current[lastSegment])) {
      current[lastSegment] = [];
    }
    current[lastSegment][arrayIndex] = value;
  } else {
    current[lastSegment] = value;
  }
}

/**
 * Get a value at a specific path in an object
 */
export function getValueAtPath(obj: any, path: string): any {
  const { segments, isArray, arrayIndex } = parseParameterPath(path);
  let current = obj;
  
  // Navigate to the target property
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    
    if (!(segment in current)) {
      return undefined;
    }
    
    current = current[segment];
  }
  
  if (isArray && arrayIndex !== undefined) {
    return Array.isArray(current) ? current[arrayIndex] : undefined;
  }
  
  return current;
}

/**
 * Apply a single parameter override to a scenario/character
 */
export function applyParameterOverride(scenario: any, path: string, value: any): any {
  // Create a deep clone to avoid mutating the original
  const clonedScenario = deepClone(scenario);
  
  // Apply the single override
  setValueAtPath(clonedScenario, path, value);
  
  return clonedScenario;
}

/**
 * Apply multiple parameter overrides to a scenario/character
 */
export function applyParameterOverrides(scenario: any, overrides: ParameterOverride[]): any {
  // Create a deep clone to avoid mutating the original
  const clonedScenario = deepClone(scenario);
  
  // Apply each override
  for (const override of overrides) {
    setValueAtPath(clonedScenario, override.path, override.value);
  }
  
  return clonedScenario;
}

/**
 * Generate all combinations of matrix parameters
 */
export function generateMatrixCombinations(matrix: Array<{ parameter: string; values: any[] }>): ParameterOverride[][] {
  const combinations: ParameterOverride[][] = [];
  
  function generateCombinations(index: number, currentCombination: ParameterOverride[]) {
    if (index === matrix.length) {
      combinations.push([...currentCombination]);
      return;
    }
    
    const { parameter, values } = matrix[index];
    
    for (const value of values) {
      currentCombination.push({ path: parameter, value });
      generateCombinations(index + 1, currentCombination);
      currentCombination.pop();
    }
  }
  
  generateCombinations(0, []);
  return combinations;
}

/**
 * Apply matrix parameters to a base scenario
 */
export function applyMatrixToScenario(baseScenario: any, matrix: Array<{ parameter: string; values: any[] }>): any[] {
  const combinations = generateMatrixCombinations(matrix);
  const scenarios: any[] = [];
  
  for (const combination of combinations) {
    const scenario = applyParameterOverrides(baseScenario, combination);
    scenarios.push(scenario);
  }
  
  return scenarios;
}

/**
 * Validate that a parameter path exists in the scenario
 */
export function validateParameterPath(scenario: any, path: string): boolean {
  try {
    const value = getValueAtPath(scenario, path);
    return value !== undefined;
  } catch {
    return false;
  }
}

/**
 * Get all available parameter paths from a scenario (for discovery)
 */
export function getAvailableParameterPaths(obj: any, prefix = ''): string[] {
  const paths: string[] = [];
  
  if (obj === null || typeof obj !== 'object') {
    return paths;
  }
  
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const path = `${prefix}[${i}]`;
      paths.push(path);
      
      if (typeof obj[i] === 'object' && obj[i] !== null) {
        paths.push(...getAvailableParameterPaths(obj[i], path));
      }
    }
  } else {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const path = prefix ? `${prefix}.${key}` : key;
        paths.push(path);
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          paths.push(...getAvailableParameterPaths(obj[key], path));
        }
      }
    }
  }
  
  return paths;
}
