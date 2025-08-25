#!/usr/bin/env tsx

/**
 * Matrix Testing Demo Runner
 * Demonstrates the matrix testing system with the Enhanced Community Manager character
 */

import { MatrixTestingRunner, defaultValidationRules } from './matrix-testing-runner';
import { getEnhancedCommunityManager, matrixTestConfig } from '../../characters/enhanced-community-manager';
import { applyMatrixToScenario } from '../../utils/parameter-override';

/**
 * Main test runner function
 */
async function runMatrixTests() {
  console.log('🚀 Enhanced Community Manager - Matrix Testing Demo');
  console.log('=' .repeat(60));
  
  try {
    // 1. Load the base character
    const baseCharacter = getEnhancedCommunityManager();
    console.log('✅ Base character loaded:', baseCharacter.name);
    
    // 2. Show matrix configuration
    console.log('\n📊 Matrix Configuration:');
    console.log(`Parameters: ${matrixTestConfig.matrix.length}`);
    console.log(`Runs per combination: ${matrixTestConfig.runsPerCombination}`);
    
    let totalCombinations = 1;
    for (const param of matrixTestConfig.matrix) {
      console.log(`  - ${param.parameter}: ${param.values.length} values`);
      totalCombinations *= param.values.length;
    }
    console.log(`Total combinations: ${totalCombinations}`);
    
    // 3. Generate all parameter combinations
    console.log('\n🔧 Generating parameter combinations...');
    const scenarios = applyMatrixToScenario(baseCharacter, matrixTestConfig.matrix);
    console.log(`✅ Generated ${scenarios.length} test scenarios`);
    
    // 4. Show sample scenarios
    console.log('\n📋 Sample Scenarios:');
    for (let i = 0; i < Math.min(3, scenarios.length); i++) {
      const scenario = scenarios[i];
      console.log(`\n  Scenario ${i + 1}:`);
      console.log(`    Name: ${scenario.name}`);
      console.log(`    System: ${scenario.system?.substring(0, 100)}...`);
      console.log(`    Style: ${scenario.style?.all?.[0] || 'Not set'}`);
    }
    
    // 5. Run matrix testing
    console.log('\n🧪 Running Matrix Tests...');
    const runner = new MatrixTestingRunner({
      baseScenario: baseCharacter,
      matrix: matrixTestConfig.matrix,
      runsPerCombination: matrixTestConfig.runsPerCombination,
      validationRules: defaultValidationRules
    });
    
    const results = await runner.runAllTests();
    
    // 6. Export results
    const resultsJson = runner.exportResults();
    console.log('\n💾 Test Results:');
    console.log(resultsJson);
    
    // 7. Show detailed analysis
    console.log('\n📈 Detailed Analysis:');
    showDetailedAnalysis(results);
    
    console.log('\n🎉 Matrix testing completed successfully!');
    
  } catch (error) {
    console.error('❌ Matrix testing failed:', error);
    process.exit(1);
  }
}

/**
 * Show detailed analysis of test results
 */
function showDetailedAnalysis(results: any[]) {
  // Personality success rates
  const personalityStats = new Map<string, { total: number; passed: number }>();
  
  for (const result of results) {
    const personality = result.combination.find((c: any) => c.path === 'character.personality')?.value || 'Unknown';
    const stats = personalityStats.get(personality) || { total: 0, passed: 0 };
    stats.total++;
    if (result.passed) stats.passed++;
    personalityStats.set(personality, stats);
  }
  
  console.log('\n  Personality Performance:');
  for (const [personality, stats] of personalityStats) {
    const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
    console.log(`    ${personality}: ${stats.passed}/${stats.total} (${successRate}%)`);
  }
  
  // Style success rates
  const styleStats = new Map<string, { total: number; passed: number }>();
  
  for (const result of results) {
    const style = result.combination.find((c: any) => c.path === 'character.response_style')?.value || 'Unknown';
    const stats = styleStats.get(style) || { total: 0, passed: 0 };
    stats.total++;
    if (result.passed) stats.passed++;
    styleStats.set(style, stats);
  }
  
  console.log('\n  Response Style Performance:');
  for (const [style, stats] of styleStats) {
    const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
    console.log(`    ${style}: ${stats.passed}/${stats.total} (${successRate}%)`);
  }
  
  // Test case success rates
  const testCaseStats = new Map<string, { total: number; passed: number }>();
  
  for (const result of results) {
    for (const testResult of result.results) {
      const testName = testResult.testName;
      const stats = testCaseStats.get(testName) || { total: 0, passed: 0 };
      stats.total++;
      if (testResult.passed) stats.passed++;
      testCaseStats.set(testName, stats);
    }
  }
  
  console.log('\n  Test Case Performance:');
  for (const [testName, stats] of testCaseStats) {
    const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
    console.log(`    ${testName}: ${stats.passed}/${stats.total} (${successRate}%)`);
  }
}

/**
 * Demo parameter override functionality
 */
function demonstrateParameterOverrides() {
  console.log('\n🔧 Parameter Override Demo:');
  
  const baseCharacter = getEnhancedCommunityManager();
  
  // Show original values
  console.log('  Original character name:', baseCharacter.name);
  console.log('  Original system prompt length:', baseCharacter.system?.length || 0);
  
  // Apply overrides
  const { applyParameterOverride } = require('../../utils/parameter-override');
  
  const modifiedCharacter = applyParameterOverride(
    baseCharacter,
    'character.name',
    'Super Enhanced Community Manager'
  );
  
  console.log('  Modified character name:', modifiedCharacter.name);
  console.log('  Original unchanged:', baseCharacter.name);
  
  // Apply multiple overrides
  const { applyParameterOverrides } = require('../../utils/parameter-override');
  
  const multiModifiedCharacter = applyParameterOverrides(baseCharacter, [
    { path: 'character.name', value: 'Ultra Enhanced CM' },
    { path: 'character.style.all[0]', value: 'Super adaptive and context-aware' },
    { path: 'character.settings.expertise', value: 'ultimate_community_management' }
  ]);
  
  console.log('  Multi-modified character name:', multiModifiedCharacter.name);
  console.log('  Multi-modified style:', multiModifiedCharacter.style?.all?.[0]);
  console.log('  Multi-modified expertise:', multiModifiedCharacter.settings?.expertise);
}

/**
 * Run the demo
 */
// Run the demo if this file is executed directly
if (import.meta.main) {
  runMatrixTests().catch((error) => {
    console.error('❌ Matrix testing failed:', error);
    process.exit(1);
  });
}

export { runMatrixTests, demonstrateParameterOverrides };
