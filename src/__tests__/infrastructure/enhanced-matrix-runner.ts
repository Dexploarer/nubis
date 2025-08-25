/**
 * Enhanced Matrix Testing Runner
 * Integrates with advanced testing framework for comprehensive testing
 */

import { MatrixTestingRunner, MatrixTestResult, TestResult } from './matrix-testing-runner';
import { 
  AdvancedTestingOrchestrator, 
  LoadTestConfig, 
  IntegrationTestConfig,
  AdvancedTestResult 
} from './advanced-testing-framework';
import { applyParameterOverride } from '../../utils/parameter-override';

export interface EnhancedMatrixTestConfig {
  baseScenario: any;
  matrix: Array<{ parameter: string; values: any[] }>;
  runsPerCombination: number;
  validationRules: any[];
  loadTestConfig: LoadTestConfig;
  integrationTestConfig: IntegrationTestConfig;
  enablePerformanceTesting: boolean;
  enableLoadTesting: boolean;
  enableIntegrationTesting: boolean;
  enableCoverageAnalysis: boolean;
}

export interface EnhancedMatrixTestResult {
  matrixResults: MatrixTestResult[];
  advancedResults: AdvancedTestResult[];
  summary: {
    totalCombinations: number;
    passedCombinations: number;
    failedCombinations: number;
    successRate: number;
    performanceMetrics: any;
    loadTestMetrics: any;
    integrationMetrics: any;
    coverageMetrics: any;
  };
}

/**
 * Enhanced Matrix Testing Runner with Advanced Testing Capabilities
 */
export class EnhancedMatrixTestingRunner {
  private config: EnhancedMatrixTestConfig;
  private matrixRunner: MatrixTestingRunner;
  private advancedOrchestrator: AdvancedTestingOrchestrator;
  private results: EnhancedMatrixTestResult;

  constructor(config: EnhancedMatrixTestConfig) {
    this.config = config;
    this.matrixRunner = new MatrixTestingRunner({
      baseScenario: config.baseScenario,
      matrix: config.matrix,
      runsPerCombination: config.runsPerCombination,
      validationRules: config.validationRules
    });
    
    this.advancedOrchestrator = new AdvancedTestingOrchestrator(
      config.loadTestConfig,
      config.integrationTestConfig
    );
  }

  /**
   * Run comprehensive matrix testing with advanced testing capabilities
   */
  async runEnhancedMatrixTests(): Promise<EnhancedMatrixTestResult> {
    console.log('🚀 Starting Enhanced Matrix Testing Suite');
    console.log('=' .repeat(60));
    
    // 1. Run standard matrix tests
    console.log('\n📊 Phase 1: Matrix Testing');
    const matrixResults = await this.matrixRunner.runAllTests();
    
    // 2. Run advanced testing on selected scenarios
    console.log('\n🔬 Phase 2: Advanced Testing');
    const advancedResults = await this.runAdvancedTestsOnScenarios();
    
    // 3. Generate comprehensive results
    this.results = {
      matrixResults,
      advancedResults,
      summary: this.generateEnhancedSummary(matrixResults, advancedResults)
    };
    
    // 4. Display comprehensive report
    this.displayEnhancedReport();
    
    return this.results;
  }

  /**
   * Run advanced testing on representative scenarios
   */
  private async runAdvancedTestsOnScenarios(): Promise<AdvancedTestResult[]> {
    const advancedResults: AdvancedTestResult[] = [];
    
    // Select representative scenarios for advanced testing
    const scenarios = applyParameterOverride(this.config.baseScenario, this.config.matrix);
    const testScenarios = this.selectTestScenarios(scenarios);
    
    console.log(`🔍 Selected ${testScenarios.length} scenarios for advanced testing`);
    
    for (const scenario of testScenarios) {
      try {
        const result = await this.advancedOrchestrator.runAdvancedTestSuite(
          () => this.simulateScenarioExecution(scenario),
          scenario.name || 'Unnamed Scenario'
        );
        
        advancedResults.push(result);
        
        // Log progress
        const index = testScenarios.indexOf(scenario) + 1;
        console.log(`  ✅ Advanced test ${index}/${testScenarios.length} completed`);
        
      } catch (error) {
        console.error(`  ❌ Advanced test failed for scenario: ${scenario.name}`);
        console.error(`     Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return advancedResults;
  }

  /**
   * Select representative scenarios for advanced testing
   */
  private selectTestScenarios(scenarios: any[]): any[] {
    if (scenarios.length <= 3) {
      return scenarios; // Test all if 3 or fewer
    }
    
    // Select diverse scenarios for testing
    const selected: any[] = [];
    
    // Always include first scenario
    selected.push(scenarios[0]);
    
    // Include middle scenario
    const middleIndex = Math.floor(scenarios.length / 2);
    selected.push(scenarios[middleIndex]);
    
    // Include last scenario
    selected.push(scenarios[scenarios.length - 1]);
    
    // Add random scenarios if we have capacity
    const remainingCapacity = Math.min(3, scenarios.length - 3);
    const remainingScenarios = scenarios.filter((_, index) => 
      index !== 0 && index !== middleIndex && index !== scenarios.length - 1
    );
    
    for (let i = 0; i < remainingCapacity; i++) {
      const randomIndex = Math.floor(Math.random() * remainingScenarios.length);
      selected.push(remainingScenarios[randomIndex]);
      remainingScenarios.splice(randomIndex, 1);
    }
    
    return selected;
  }

  /**
   * Simulate scenario execution for testing purposes
   */
  private async simulateScenarioExecution(scenario: any): Promise<any> {
    // Simulate the time it would take to execute the scenario
    const executionTime = Math.random() * 1000 + 500; // 500-1500ms
    
    // Simulate API calls
    const apiCalls = Math.floor(Math.random() * 5) + 1;
    
    // Simulate external service interactions
    const externalServices = Math.floor(Math.random() * 3);
    
    // Simulate token usage
    const tokens = Math.floor(Math.random() * 1000) + 100;
    
    // Wait for simulated execution time
    await new Promise(resolve => setTimeout(resolve, executionTime));
    
    // Return simulated results
    return {
      scenario: scenario.name,
      executionTime,
      apiCalls,
      externalServices,
      tokens,
      success: Math.random() > 0.1 // 90% success rate
    };
  }

  /**
   * Generate enhanced summary with all metrics
   */
  private generateEnhancedSummary(
    matrixResults: MatrixTestResult[], 
    advancedResults: AdvancedTestResult[]
  ) {
    const totalCombinations = matrixResults.length;
    const passedCombinations = matrixResults.filter(r => r.passed).length;
    const failedCombinations = totalCombinations - passedCombinations;
    const successRate = (passedCombinations / totalCombinations) * 100;
    
    // Performance metrics
    const performanceMetrics = advancedResults.length > 0 
      ? this.advancedOrchestrator['performanceEngine'].getAverageMetrics()
      : null;
    
    // Load test metrics
    const loadTestMetrics = advancedResults.length > 0 
      ? advancedResults[0].loadTestResults
      : null;
    
    // Integration metrics
    const integrationMetrics = advancedResults.length > 0 
      ? advancedResults[0].integrationResults
      : null;
    
    // Coverage metrics
    const coverageMetrics = advancedResults.length > 0 
      ? advancedResults[0].coverage
      : null;
    
    return {
      totalCombinations,
      passedCombinations,
      failedCombinations,
      successRate,
      performanceMetrics,
      loadTestMetrics,
      integrationMetrics,
      coverageMetrics
    };
  }

  /**
   * Display comprehensive testing report
   */
  private displayEnhancedReport(): void {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 ENHANCED MATRIX TESTING COMPREHENSIVE REPORT');
    console.log('='.repeat(80));
    
    // Matrix testing summary
    console.log('\n📊 MATRIX TESTING SUMMARY');
    console.log(`Total Combinations: ${this.results.summary.totalCombinations}`);
    console.log(`Passed: ${this.results.summary.passedCombinations}`);
    console.log(`Failed: ${this.results.summary.failedCombinations}`);
    console.log(`Success Rate: ${this.results.summary.successRate.toFixed(2)}%`);
    
    // Advanced testing summary
    if (this.results.advancedResults.length > 0) {
      console.log('\n🔬 ADVANCED TESTING SUMMARY');
      console.log(`Scenarios Tested: ${this.results.advancedResults.length}`);
      
      const successfulAdvanced = this.results.advancedResults.filter(r => r.success).length;
      console.log(`Successful: ${successfulAdvanced}`);
      console.log(`Failed: ${this.results.advancedResults.length - successfulAdvanced}`);
      
      // Performance summary
      if (this.results.summary.performanceMetrics) {
        const perf = this.results.summary.performanceMetrics;
        console.log(`\n⚡ PERFORMANCE METRICS`);
        console.log(`Average Execution Time: ${perf.executionTime.toFixed(2)}ms`);
        console.log(`Average Memory Usage: ${(perf.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
        console.log(`Average CPU Usage: ${perf.cpuUsage.toFixed(2)}s`);
      }
      
      // Load test summary
      if (this.results.summary.loadTestMetrics) {
        const load = this.results.summary.loadTestMetrics;
        console.log(`\n📈 LOAD TEST METRICS`);
        console.log(`Concurrent Users: ${load.concurrentUsers}`);
        console.log(`Throughput: ${load.throughput.toFixed(2)} req/s`);
        console.log(`Average Response Time: ${load.averageResponseTime.toFixed(2)}ms`);
        console.log(`Error Rate: ${load.errorRate.toFixed(2)}%`);
      }
      
      // Integration summary
      if (this.results.summary.integrationMetrics) {
        const integration = this.results.summary.integrationMetrics;
        const healthyServices = Array.from(integration.serviceHealth.values()).filter(Boolean).length;
        const totalServices = integration.serviceHealth.size;
        console.log(`\n🔗 INTEGRATION METRICS`);
        console.log(`Services Tested: ${totalServices}`);
        console.log(`Healthy Services: ${healthyServices}`);
        console.log(`Health Rate: ${((healthyServices / totalServices) * 100).toFixed(2)}%`);
      }
      
      // Coverage summary
      if (this.results.summary.coverageMetrics) {
        const coverage = this.results.summary.coverageMetrics;
        console.log(`\n📊 COVERAGE METRICS`);
        console.log(`Test Paths: ${coverage.testPaths.length}`);
        console.log(`Coverage Percentage: ${coverage.coveragePercentage.toFixed(2)}%`);
        console.log(`Parameter Combinations: ${coverage.parameterCombinations}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
  }

  /**
   * Export comprehensive results
   */
  exportEnhancedResults(): string {
    return JSON.stringify(this.results, null, 2);
  }

  /**
   * Generate detailed performance analysis
   */
  generatePerformanceAnalysis(): string {
    if (!this.results.summary.performanceMetrics) {
      return 'No performance data available';
    }
    
    return this.advancedOrchestrator['performanceEngine'].generatePerformanceReport();
  }

  /**
   * Generate load testing analysis
   */
  generateLoadTestAnalysis(): string {
    if (!this.results.summary.loadTestMetrics) {
      return 'No load test data available';
    }
    
    return this.advancedOrchestrator['loadTestEngine'].generateLoadTestReport();
  }

  /**
   * Generate integration testing analysis
   */
  generateIntegrationAnalysis(): string {
    if (!this.results.summary.integrationMetrics) {
      return 'No integration test data available';
    }
    
    return this.advancedOrchestrator['integrationEngine'].generateIntegrationReport();
  }

  /**
   * Generate coverage analysis
   */
  generateCoverageAnalysis(): string {
    if (!this.results.summary.coverageMetrics) {
      return 'No coverage data available';
    }
    
    return this.advancedOrchestrator['coverageEngine'].generateCoverageReport();
  }
}

/**
 * Default configurations for advanced testing
 */
export const defaultLoadTestConfig: LoadTestConfig = {
  concurrentUsers: 10,
  rampUpTime: 5, // seconds
  testDuration: 30, // seconds
  maxResponseTime: 2000, // milliseconds
  errorThreshold: 5 // percentage
};

export const defaultIntegrationTestConfig: IntegrationTestConfig = {
  externalServices: ['database', 'api', 'cache'],
  mockMode: true, // Start with mock mode for safety
  timeout: 10000, // milliseconds
  retryAttempts: 3,
  healthCheckEndpoints: [
    'http://localhost:3000/health',
    'http://localhost:3000/api/status'
  ]
};

/**
 * Factory function to create enhanced matrix testing runner
 */
export function createEnhancedMatrixRunner(
  baseScenario: any,
  matrix: Array<{ parameter: string; values: any[] }>,
  runsPerCombination: number = 2,
  validationRules: any[] = [],
  loadTestConfig: LoadTestConfig = defaultLoadTestConfig,
  integrationTestConfig: IntegrationTestConfig = defaultIntegrationTestConfig,
  enableAdvancedTesting: boolean = true
): EnhancedMatrixTestingRunner {
  
  const config: EnhancedMatrixTestConfig = {
    baseScenario,
    matrix,
    runsPerCombination,
    validationRules,
    loadTestConfig,
    integrationTestConfig,
    enablePerformanceTesting: enableAdvancedTesting,
    enableLoadTesting: enableAdvancedTesting,
    enableIntegrationTesting: enableAdvancedTesting,
    enableCoverageAnalysis: enableAdvancedTesting
  };
  
  return new EnhancedMatrixTestingRunner(config);
}
