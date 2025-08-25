/**
 * Matrix Testing System Tests
 * Following ElizaOS Bootstrap Testing Guide patterns
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { MatrixTestingRunner, defaultValidationRules } from '../matrix-testing-runner';
import { applyParameterOverride, applyParameterOverrides, generateMatrixCombinations } from '../../utils/parameter-override';
import { getEnhancedCommunityManager } from '../../characters/enhanced-community-manager';

// Mock data for testing
const mockBaseScenario = {
  character: {
    name: 'Test Character',
    system: 'You are a test character',
    style: {
      all: ['Test style'],
      chat: ['Test chat style'],
      post: ['Test post style']
    }
  },
  run: [
    {
      name: 'Test 1',
      input: 'Hello',
      expectedActions: ['REPLY'],
      expectedTone: 'friendly'
    },
    {
      name: 'Test 2',
      input: 'Help',
      expectedActions: ['REPLY', 'HELP'],
      expectedTone: 'helpful'
    }
  ]
};

const mockMatrix = [
  {
    parameter: 'character.personality',
    values: ['Friendly', 'Professional', 'Casual']
  },
  {
    parameter: 'character.response_style',
    values: ['Warm', 'Formal', 'Direct']
  }
];

describe('Parameter Override System', () => {
  describe('applyParameterOverride', () => {
    it('should apply single parameter override without mutating original', () => {
      const original = { character: { name: 'Original' } };
      const result = applyParameterOverride(original, 'character.name', 'Modified');
      
      expect(result.character.name).toBe('Modified');
      expect(original.character.name).toBe('Original'); // Original unchanged
    });

    it('should handle nested parameter paths', () => {
      const original = { character: { style: { all: ['Old style'] } } };
      const result = applyParameterOverride(original, 'character.style.all[0]', 'New style');
      
      expect(result.character.style.all[0]).toBe('New style');
      expect(original.character.style.all[0]).toBe('Old style');
    });

    it('should create missing nested paths', () => {
      const original = { character: { name: 'Test' } };
      const result = applyParameterOverride(original, 'character.style.all[0]', 'New style');
      
      expect(result.character.style?.all?.[0]).toBe('New style');
      expect(original.character.style).toBeUndefined();
    });
  });

  describe('applyParameterOverrides', () => {
    it('should apply multiple overrides', () => {
      const original = { character: { name: 'Original', age: 25 } };
      const overrides = [
        { path: 'character.name', value: 'Modified' },
        { path: 'character.age', value: 30 }
      ];
      
      const result = applyParameterOverrides(original, overrides);
      
      expect(result.character.name).toBe('Modified');
      expect(result.character.age).toBe(30);
      expect(original.character.name).toBe('Original');
      expect(original.character.age).toBe(25);
    });
  });

  describe('generateMatrixCombinations', () => {
    it('should generate all combinations correctly', () => {
      const combinations = generateMatrixCombinations(mockMatrix);
      
      // 3 personalities × 3 styles = 9 combinations
      expect(combinations).toHaveLength(9);
      
      // Check first combination
      expect(combinations[0]).toEqual([
        { path: 'character.personality', value: 'Friendly' },
        { path: 'character.response_style', value: 'Warm' }
      ]);
      
      // Check last combination
      expect(combinations[8]).toEqual([
        { path: 'character.personality', value: 'Casual' },
        { path: 'character.response_style', value: 'Direct' }
      ]);
    });

    it('should handle single parameter matrix', () => {
      const singleMatrix = [{ parameter: 'character.name', values: ['A', 'B'] }];
      const combinations = generateMatrixCombinations(singleMatrix);
      
      expect(combinations).toHaveLength(2);
      expect(combinations[0]).toEqual([{ path: 'character.name', value: 'A' }]);
      expect(combinations[1]).toEqual([{ path: 'character.name', value: 'B' }]);
    });
  });
});

describe('Matrix Testing Runner', () => {
  let runner: MatrixTestingRunner;

  beforeEach(() => {
    runner = new MatrixTestingRunner({
      baseScenario: mockBaseScenario,
      matrix: mockMatrix,
      runsPerCombination: 2,
      validationRules: defaultValidationRules
    });
  });

  describe('Configuration', () => {
    it('should initialize with correct configuration', () => {
      expect(runner).toBeDefined();
      // Note: We can't access private config directly, but we can test through public methods
    });
  });

  describe('Test Execution', () => {
    it('should run all matrix combinations', async () => {
      const results = await runner.runAllTests();
      
      // 9 combinations × 2 runs per combination × 2 tests per run = 36 total tests
      const totalTests = results.reduce((sum, r) => sum + r.totalTests, 0);
      expect(totalTests).toBe(36);
      
      // All combinations should be tested
      expect(results).toHaveLength(9);
    });

    it('should generate correct test scenarios', async () => {
      const results = await runner.runAllTests();
      
      // Check that each combination has the expected structure
      for (const result of results) {
        expect(result.combination).toBeDefined();
        expect(result.scenario).toBeDefined();
        expect(result.results).toBeDefined();
        expect(result.totalTests).toBe(4); // 2 runs × 2 tests
        expect(result.passedTests).toBeGreaterThanOrEqual(0);
        expect(result.passedTests).toBeLessThanOrEqual(4);
      }
    });
  });

  describe('Validation Rules', () => {
    it('should apply default validation rules', async () => {
      const results = await runner.runAllTests();
      
      // Check that validation was applied
      for (const result of results) {
        for (const testResult of result.results) {
          expect(testResult.errors).toBeDefined();
          expect(Array.isArray(testResult.errors)).toBe(true);
        }
      }
    });
  });
});

describe('Enhanced Community Manager Integration', () => {
  it('should load character without errors', () => {
    const character = getEnhancedCommunityManager();
    
    expect(character.name).toBe('Enhanced Community Manager');
    expect(character.username).toBe('enhanced-cm');
    expect(character.bio).toBeDefined();
    expect(character.topics).toBeDefined();
    expect(character.plugins).toContain('@elizaos/plugin-sql');
    expect(character.plugins).toContain('@elizaos/plugin-bootstrap');
  });

  it('should have valid matrix configuration', () => {
    const character = getEnhancedCommunityManager();
    const matrixConfig = character.matrixTestConfig;
    
    expect(matrixConfig).toBeDefined();
    expect(matrixConfig.matrix).toHaveLength(3);
    expect(matrixConfig.runsPerCombination).toBe(2);
    expect(matrixConfig.validationRules).toBeDefined();
  });

  it('should generate valid parameter combinations', () => {
    const character = getEnhancedCommunityManager();
    const matrixConfig = character.matrixTestConfig;
    
    const combinations = generateMatrixCombinations(matrixConfig.matrix);
    
    // 4 personalities × 4 styles × 4 approaches = 64 combinations
    expect(combinations).toHaveLength(64);
    
    // Check that all combinations have valid paths
    for (const combination of combinations) {
      for (const param of combination) {
        expect(param.path).toMatch(/^character\./);
        expect(param.value).toBeDefined();
      }
    }
  });
});

describe('Performance and Scalability', () => {
  it('should handle large matrix configurations efficiently', () => {
    const largeMatrix = [
      { parameter: 'character.personality', values: Array.from({ length: 10 }, (_, i) => `Personality${i}`) },
      { parameter: 'character.style', values: Array.from({ length: 10 }, (_, i) => `Style${i}`) },
      { parameter: 'character.mode', values: Array.from({ length: 10 }, (_, i) => `Mode${i}`) }
    ];
    
    const startTime = Date.now();
    const combinations = generateMatrixCombinations(largeMatrix);
    const endTime = Date.now();
    
    // Should generate 1000 combinations (10³)
    expect(combinations).toHaveLength(1000);
    
    // Should complete within reasonable time (less than 100ms)
    expect(endTime - startTime).toBeLessThan(100);
  });

  it('should handle deep nesting without stack overflow', () => {
    const deepNested = {
      character: {
        settings: {
          advanced: {
            features: {
              experimental: {
                alpha: {
                  beta: {
                    gamma: 'deep value'
                  }
                }
              }
            }
          }
        }
      }
    };
    
    const result = applyParameterOverride(
      deepNested,
      'character.settings.advanced.features.experimental.alpha.beta.gamma',
      'new deep value'
    );
    
    expect(result.character.settings.advanced.features.experimental.alpha.beta.gamma).toBe('new deep value');
    expect(deepNested.character.settings.advanced.features.experimental.alpha.beta.gamma).toBe('deep value');
  });
});

describe('Error Handling', () => {
  it('should handle invalid parameter paths gracefully', () => {
    const original = { character: { name: 'Test' } };
    
    // Should not throw on invalid paths
    expect(() => {
      applyParameterOverride(original, 'invalid.path', 'value');
    }).not.toThrow();
  });

  it('should handle empty matrix gracefully', () => {
    const emptyMatrix: Array<{ parameter: string; values: any[] }> = [];
    const combinations = generateMatrixCombinations(emptyMatrix);
    
    expect(combinations).toHaveLength(0);
  });

  it('should handle matrix with empty values gracefully', () => {
    const matrixWithEmptyValues = [
      { parameter: 'character.name', values: [] }
    ];
    
    const combinations = generateMatrixCombinations(matrixWithEmptyValues);
    expect(combinations).toHaveLength(0);
  });
});

describe('Integration with ElizaOS Patterns', () => {
  it('should follow ElizaOS service patterns', () => {
    // Test that our matrix testing system follows ElizaOS patterns
    const character = getEnhancedCommunityManager();
    
    // Should have required ElizaOS fields
    expect(character.name).toBeDefined();
    expect(character.bio).toBeDefined();
    expect(character.plugins).toBeDefined();
    
    // Should include required plugins
    expect(character.plugins).toContain('@elizaos/plugin-sql');
    expect(character.plugins).toContain('@elizaos/plugin-bootstrap');
  });

  it('should support dynamic character adaptation', () => {
    const character = getEnhancedCommunityManager();
    
    // Should have settings for dynamic behavior
    expect(character.settings).toBeDefined();
    expect(character.settings.enableAutoSwitching).toBe(true);
    expect(character.settings.personalitySwitchThreshold).toBe(0.7);
    expect(character.settings.defaultPersonality).toBe('community');
  });
});
