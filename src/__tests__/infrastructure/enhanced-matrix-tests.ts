#!/usr/bin/env tsx

/**
 * Enhanced Matrix Testing Demo
 * Demonstrates comprehensive testing capabilities including:
 * - Matrix testing with parameter combinations
 * - Performance testing with metrics
 * - Load testing with concurrent users
 * - Integration testing with external services
 * - Coverage analysis and reporting
 */

import { 
  createEnhancedMatrixRunner,
  defaultLoadTestConfig,
  defaultIntegrationTestConfig
} from './enhanced-matrix-runner';
import { getEnhancedCommunityManager, matrixTestConfig } from '../../characters/enhanced-community-manager';
import { defaultValidationRules } from './matrix-testing-runner';

/**
 * Main enhanced matrix testing function
 */
async function runEnhancedMatrixTests() {
  console.log('🚀 Enhanced Matrix Testing Suite - Comprehensive Demo');
  console.log('=' .repeat(80));
  
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
    
    // 3. Configure advanced testing
    console.log('\n🔬 Advanced Testing Configuration:');
    
    // Customize load test configuration
    const customLoadTestConfig = {
      ...defaultLoadTestConfig,
      concurrentUsers: 15, // Increase concurrent users
      testDuration: 45, // Longer test duration
      maxResponseTime: 1500, // Stricter response time
      errorThreshold: 3 // Lower error threshold
    };
    
    // Customize integration test configuration
    const customIntegrationTestConfig = {
      ...defaultIntegrationTestConfig,
      externalServices: ['database', 'api', 'cache', 'message-queue'],
      mockMode: false, // Test with real services
      timeout: 15000, // Longer timeout
      healthCheckEndpoints: [
        'http://localhost:3000/health',
        'http://localhost:3000/api/status',
        'http://localhost:3000/api/health/detailed'
      ]
    };
    
    console.log('Load Testing Config:');
    console.log(`  Concurrent Users: ${customLoadTestConfig.concurrentUsers}`);
    console.log(`  Test Duration: ${customLoadTestConfig.testDuration}s`);
    console.log(`  Max Response Time: ${customLoadTestConfig.maxResponseTime}ms`);
    console.log(`  Error Threshold: ${customLoadTestConfig.errorThreshold}%`);
    
    console.log('\nIntegration Testing Config:');
    console.log(`  External Services: ${customIntegrationTestConfig.externalServices.join(', ')}`);
    console.log(`  Mock Mode: ${customIntegrationTestConfig.mockMode ? 'Disabled' : 'Enabled'}`);
    console.log(`  Timeout: ${customIntegrationTestConfig.timeout}ms`);
    console.log(`  Health Endpoints: ${customIntegrationTestConfig.healthCheckEndpoints.length}`);
    
    // 4. Create enhanced matrix runner
    console.log('\n🔧 Creating Enhanced Matrix Testing Runner...');
    const enhancedRunner = createEnhancedMatrixRunner(
      baseCharacter,
      matrixTestConfig.matrix,
      matrixTestConfig.runsPerCombination,
      defaultValidationRules,
      customLoadTestConfig,
      customIntegrationTestConfig,
      true // Enable all advanced testing
    );
    
    // 5. Run comprehensive testing suite
    console.log('\n🧪 Running Enhanced Matrix Testing Suite...');
    const startTime = Date.now();
    
    const results = await enhancedRunner.runEnhancedMatrixTests();
    
    const totalTime = Date.now() - startTime;
    console.log(`\n⏱️  Total testing time: ${(totalTime / 1000).toFixed(2)}s`);
    
    // 6. Generate detailed reports
    console.log('\n📋 Generating Detailed Reports...');
    
    // Performance analysis
    const performanceReport = enhancedRunner.generatePerformanceAnalysis();
    console.log('\n' + performanceReport);
    
    // Load test analysis
    const loadTestReport = enhancedRunner.generateLoadTestAnalysis();
    console.log('\n' + loadTestReport);
    
    // Integration analysis
    const integrationReport = enhancedRunner.generateIntegrationAnalysis();
    console.log('\n' + integrationReport);
    
    // Coverage analysis
    const coverageReport = enhancedRunner.generateCoverageAnalysis();
    console.log('\n' + coverageReport);
    
    // 7. Export comprehensive results
    const resultsJson = enhancedRunner.exportEnhancedResults();
    
    // Save results to file
    const fs = require('fs');
    const path = require('path');
    
    // Ensure results directory exists
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    // Save comprehensive results
    const resultsPath = path.join(resultsDir, `enhanced-matrix-results-${Date.now()}.json`);
    fs.writeFileSync(resultsPath, resultsJson);
    console.log(`\n💾 Results saved to: ${resultsPath}`);
    
    // 8. Generate summary statistics
    console.log('\n📊 SUMMARY STATISTICS');
    console.log('=' .repeat(50));
    
    const summary = results.summary;
    console.log(`Matrix Testing: ${summary.passedCombinations}/${summary.totalCombinations} combinations passed`);
    console.log(`Success Rate: ${summary.successRate.toFixed(2)}%`);
    
    if (summary.performanceMetrics) {
      const perf = summary.performanceMetrics;
      console.log(`\nPerformance: ${perf.executionTime.toFixed(2)}ms avg execution time`);
      console.log(`Memory Usage: ${(perf.memoryUsage / 1024 / 1024).toFixed(2)}MB avg`);
      console.log(`CPU Usage: ${perf.cpuUsage.toFixed(2)}s avg`);
    }
    
    if (summary.loadTestMetrics) {
      const load = summary.loadTestMetrics;
      console.log(`\nLoad Testing: ${load.throughput.toFixed(2)} req/s throughput`);
      console.log(`Response Time: ${load.averageResponseTime.toFixed(2)}ms avg`);
      console.log(`Error Rate: ${load.errorRate.toFixed(2)}%`);
    }
    
    if (summary.integrationMetrics) {
      const integration = summary.integrationMetrics;
      const healthyServices = Array.from(integration.serviceHealth.values()).filter(Boolean).length;
      const totalServices = integration.serviceHealth.size;
      console.log(`\nIntegration: ${healthyServices}/${totalServices} services healthy`);
      console.log(`Health Rate: ${((healthyServices / totalServices) * 100).toFixed(2)}%`);
    }
    
    if (summary.coverageMetrics) {
      const coverage = summary.coverageMetrics;
      console.log(`\nCoverage: ${coverage.coveragePercentage.toFixed(2)}% test coverage`);
      console.log(`Test Paths: ${coverage.testPaths.length} paths covered`);
      console.log(`Parameter Combinations: ${coverage.parameterCombinations} combinations`);
    }
    
    // 9. Quality assessment
    console.log('\n🎯 QUALITY ASSESSMENT');
    console.log('=' .repeat(50));
    
    let qualityScore = 0;
    let totalCriteria = 0;
    
    // Matrix testing quality
    if (summary.successRate >= 90) qualityScore += 25;
    else if (summary.successRate >= 80) qualityScore += 20;
    else if (summary.successRate >= 70) qualityScore += 15;
    totalCriteria += 25;
    
    // Performance quality
    if (summary.performanceMetrics) {
      if (summary.performanceMetrics.executionTime <= 1000) qualityScore += 20;
      else if (summary.performanceMetrics.executionTime <= 2000) qualityScore += 15;
      else if (summary.performanceMetrics.executionTime <= 3000) qualityScore += 10;
      totalCriteria += 20;
    }
    
    // Load testing quality
    if (summary.loadTestMetrics) {
      if (summary.loadTestMetrics.errorRate <= 1) qualityScore += 20;
      else if (summary.loadTestMetrics.errorRate <= 3) qualityScore += 15;
      else if (summary.loadTestMetrics.errorRate <= 5) qualityScore += 10;
      totalCriteria += 20;
    }
    
    // Integration quality
    if (summary.integrationMetrics) {
      const healthyServices = Array.from(summary.integrationMetrics.serviceHealth.values()).filter(Boolean).length;
      const totalServices = summary.integrationMetrics.serviceHealth.size;
      const healthRate = (healthyServices / totalServices) * 100;
      
      if (healthRate >= 95) qualityScore += 15;
      else if (healthRate >= 90) qualityScore += 12;
      else if (healthRate >= 80) qualityScore += 8;
      totalCriteria += 15;
    }
    
    // Coverage quality
    if (summary.coverageMetrics) {
      if (summary.coverageMetrics.coveragePercentage >= 90) qualityScore += 20;
      else if (summary.coverageMetrics.coveragePercentage >= 80) qualityScore += 15;
      else if (summary.coverageMetrics.coveragePercentage >= 70) qualityScore += 10;
      totalCriteria += 20;
    }
    
    const overallQuality = totalCriteria > 0 ? (qualityScore / totalCriteria) * 100 : 0;
    
    console.log(`Overall Quality Score: ${overallQuality.toFixed(1)}%`);
    
    if (overallQuality >= 90) {
      console.log('🟢 EXCELLENT - All quality gates passed!');
    } else if (overallQuality >= 80) {
      console.log('🟡 GOOD - Minor improvements needed');
    } else if (overallQuality >= 70) {
      console.log('🟠 FAIR - Several areas need attention');
    } else {
      console.log('🔴 POOR - Significant improvements required');
    }
    
    // 10. Recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('=' .repeat(50));
    
    const recommendations: string[] = [];
    
    if (summary.successRate < 90) {
      recommendations.push('Improve matrix testing success rate by reviewing failed combinations');
    }
    
    if (summary.performanceMetrics && summary.performanceMetrics.executionTime > 2000) {
      recommendations.push('Optimize performance to reduce execution time below 2 seconds');
    }
    
    if (summary.loadTestMetrics && summary.loadTestMetrics.errorRate > 3) {
      recommendations.push('Investigate and fix load testing errors to reduce error rate below 3%');
    }
    
    if (summary.integrationMetrics) {
      const healthyServices = Array.from(summary.integrationMetrics.serviceHealth.values()).filter(Boolean).length;
      const totalServices = summary.integrationMetrics.serviceHealth.size;
      const healthRate = (healthyServices / totalServices) * 100;
      
      if (healthRate < 90) {
        recommendations.push('Improve external service health and reliability');
      }
    }
    
    if (summary.coverageMetrics && summary.coverageMetrics.coveragePercentage < 80) {
      recommendations.push('Increase test coverage by adding more test scenarios and paths');
    }
    
    if (recommendations.length === 0) {
      console.log('✅ All quality targets met - no specific recommendations');
    } else {
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    
    console.log('\n🎉 Enhanced Matrix Testing Suite completed successfully!');
    console.log('=' .repeat(80));
    
    return results;
    
  } catch (error) {
    console.error('❌ Enhanced Matrix Testing Suite failed:', error);
    process.exit(1);
  }
}

/**
 * Run the enhanced matrix testing suite
 */
if (require.main === module) {
  runEnhancedMatrixTests().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runEnhancedMatrixTests };
