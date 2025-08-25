/**
 * Matrix Testing Runner for Character Scenarios
 * Executes all parameter combinations and validates results
 */

import { applyMatrixToScenario, ParameterOverride } from '../utils/parameter-override';

export interface MatrixTestResult {
  combination: ParameterOverride[];
  scenario: any;
  results: TestResult[];
  passed: boolean;
  totalTests: number;
  passedTests: number;
}

export interface TestResult {
  testName: string;
  input: string;
  expectedActions: string[];
  expectedTone?: string;
  expectedApproach?: string;
  expectedStyle?: string;
  expectedExpertise?: string;
  actualResponse?: string;
  passed: boolean;
  errors: string[];
}

export interface MatrixTestConfig {
  baseScenario: any;
  matrix: Array<{ parameter: string; values: any[] }>;
  runsPerCombination: number;
  validationRules: ValidationRule[];
}

export interface ValidationRule {
  name: string;
  condition: (result: TestResult, scenario: any) => boolean;
  errorMessage: string;
}

/**
 * Matrix Testing Runner
 */
export class MatrixTestingRunner {
  private config: MatrixTestConfig;
  private results: MatrixTestResult[] = [];

  constructor(config: MatrixTestConfig) {
    this.config = config;
  }

  /**
   * Run all matrix combinations
   */
  async runAllTests(): Promise<MatrixTestResult[]> {
    console.log(`🚀 Starting matrix testing with ${this.config.matrix.length} parameters`);
    
    // Generate all parameter combinations
    const scenarios = applyMatrixToScenario(this.config.baseScenario, this.config.matrix);
    console.log(`📊 Generated ${scenarios.length} test scenarios`);
    
    // Run tests for each combination
    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      console.log(`\n🔍 Testing combination ${i + 1}/${scenarios.length}`);
      
      const result = await this.runScenarioTests(scenario, i);
      this.results.push(result);
      
      // Log progress
      const progress = ((i + 1) / scenarios.length * 100).toFixed(1);
      console.log(`✅ Combination ${i + 1} completed: ${result.passedTests}/${result.totalTests} tests passed`);
    }
    
    // Generate summary report
    this.generateSummaryReport();
    
    return this.results;
  }

  /**
   * Run tests for a single scenario
   */
  private async runScenarioTests(scenario: any, combinationIndex: number): Promise<MatrixTestResult> {
    const combination = this.extractCombinationFromScenario(scenario, combinationIndex);
    const results: TestResult[] = [];
    
    // Run each test multiple times as specified
    for (let run = 0; run < this.config.runsPerCombination; run++) {
      for (const test of scenario.run) {
        const testResult = await this.runSingleTest(test, scenario);
        results.push(testResult);
      }
    }
    
    // Calculate test statistics
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const passed = passedTests === totalTests;
    
    return {
      combination,
      scenario,
      results,
      passed,
      totalTests,
      passedTests
    };
  }

  /**
   * Run a single test
   */
  private async runSingleTest(test: any, scenario: any): Promise<TestResult> {
    const result: TestResult = {
      testName: test.name,
      input: test.input,
      expectedActions: test.expectedActions || [],
      expectedTone: test.expectedTone,
      expectedApproach: test.expectedApproach,
      expectedStyle: test.expectedStyle,
      expectedExpertise: test.expectedExpertise,
      passed: false,
      errors: []
    };
    
    try {
      // Simulate the test execution (in a real implementation, this would call the actual agent)
      const response = await this.simulateAgentResponse(test.input, scenario);
      result.actualResponse = response;
      
      // Apply validation rules
      result.passed = this.validateTestResult(result, scenario);
      
    } catch (error) {
      result.errors.push(`Test execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return result;
  }

  /**
   * Simulate agent response (placeholder for actual agent integration)
   */
  private async simulateAgentResponse(input: string, scenario: any): Promise<string> {
    // This is a placeholder - in a real implementation, you would:
    // 1. Create an agent instance with the scenario configuration
    // 2. Send the input to the agent
    // 3. Get the actual response
    
    const character = scenario.character;
    const personality = character.name;
    const style = character.style?.all?.[0] || 'professional';
    
    // Simulate different response styles based on character configuration
    if (style.includes('warm')) {
      return `Hi there! As a ${personality}, I'd be happy to help you with that. Let me provide some warm and friendly guidance...`;
    } else if (style.includes('formal')) {
      return `Greetings. As a ${personality}, I shall provide you with comprehensive assistance in this matter.`;
    } else if (style.includes('direct')) {
      return `As a ${personality}, here's what you need to know: [direct response]`;
    } else {
      return `As a ${personality}, I can help you with that. Let me provide some guidance...`;
    }
  }

  /**
   * Validate test result against expected criteria
   */
  private validateTestResult(result: TestResult, scenario: any): boolean {
    let passed = true;
    
    // Apply custom validation rules
    for (const rule of this.config.validationRules) {
      if (!rule.condition(result, scenario)) {
        result.errors.push(rule.errorMessage);
        passed = false;
      }
    }
    
    // Basic validation checks
    if (result.expectedActions.length > 0) {
      // Check if response mentions expected actions (simplified validation)
      const responseLower = result.actualResponse?.toLowerCase() || '';
      for (const action of result.expectedActions) {
        if (!responseLower.includes(action.toLowerCase().replace(/_/g, ' '))) {
          result.errors.push(`Expected action '${action}' not found in response`);
          passed = false;
        }
      }
    }
    
    return passed;
  }

  /**
   * Extract the parameter combination that generated this scenario
   */
  private extractCombinationFromScenario(scenario: any, combinationIndex: number): ParameterOverride[] {
    // This is a simplified extraction - in practice, you'd track which parameters were applied
    const combination: ParameterOverride[] = [];
    
    // Extract personality
    if (scenario.character?.name) {
      combination.push({
        path: 'character.personality',
        value: scenario.character.name
      });
    }
    
    // Extract response style
    if (scenario.character?.style?.all?.[0]) {
      combination.push({
        path: 'character.response_style',
        value: scenario.character.style.all[0]
      });
    }
    
    return combination;
  }

  /**
   * Generate summary report
   */
  private generateSummaryReport(): void {
    console.log('\n📋 MATRIX TESTING SUMMARY');
    console.log('=' .repeat(50));
    
    const totalCombinations = this.results.length;
    const passedCombinations = this.results.filter(r => r.passed).length;
    const totalTests = this.results.reduce((sum, r) => sum + r.totalTests, 0);
    const passedTests = this.results.reduce((sum, r) => sum + r.passedTests, 0);
    
    console.log(`Total Combinations: ${totalCombinations}`);
    console.log(`Passed Combinations: ${passedCombinations}`);
    console.log(`Failed Combinations: ${totalCombinations - passedCombinations}`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed Tests: ${passedTests}`);
    console.log(`Success Rate: ${((passedCombinations / totalCombinations) * 100).toFixed(1)}%`);
    
    // Show failed combinations
    const failedResults = this.results.filter(r => !r.passed);
    if (failedResults.length > 0) {
      console.log('\n❌ FAILED COMBINATIONS:');
      for (const result of failedResults) {
        console.log(`\n  ${result.combination.map(c => `${c.path}=${c.value}`).join(', ')}`);
        console.log(`  Tests: ${result.passedTests}/${result.totalTests} passed`);
        
        // Show specific test failures
        const failedTests = result.results.filter(t => !t.passed);
        for (const test of failedTests.slice(0, 3)) { // Show first 3 failures
          console.log(`    - ${test.testName}: ${test.errors.join(', ')}`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(50));
  }

  /**
   * Export results to JSON
   */
  exportResults(): string {
    return JSON.stringify({
      summary: {
        totalCombinations: this.results.length,
        passedCombinations: this.results.filter(r => r.passed).length,
        totalTests: this.results.reduce((sum, r) => sum + r.totalTests, 0),
        passedTests: this.results.reduce((sum, r) => sum + r.passedTests, 0)
      },
      results: this.results
    }, null, 2);
  }
}

/**
 * Predefined validation rules
 */
export const defaultValidationRules: ValidationRule[] = [
  {
    name: 'personality_consistency',
    condition: (result, scenario) => {
      const personality = scenario.character?.name;
      const response = result.actualResponse || '';
      return response.includes(personality) || response.includes(personality?.split(' ')[0]);
    },
    errorMessage: 'Response does not maintain character personality'
  },
  {
    name: 'style_consistency',
    condition: (result, scenario) => {
      const style = scenario.character?.style?.all?.[0];
      if (!style) return true;
      
      const response = result.actualResponse || '';
      if (style.includes('warm') && !response.includes('Hi') && !response.includes('happy')) return false;
      if (style.includes('formal') && !response.includes('Greetings')) return false;
      if (style.includes('direct') && response.includes('Let me provide some guidance')) return false;
      
      return true;
    },
    errorMessage: 'Response does not match expected style'
  },
  {
    name: 'action_appropriateness',
    condition: (result, scenario) => {
      // Basic check that response is appropriate for the character type
      const response = result.actualResponse || '';
      return response.length > 20 && response.includes('help');
    },
    errorMessage: 'Response is not appropriate for the character type'
  }
];
