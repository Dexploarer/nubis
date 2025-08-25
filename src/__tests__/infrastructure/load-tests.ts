#!/usr/bin/env tsx

/**
 * Load Testing Suite
 * Focuses on concurrent user testing, system scalability, and performance under load
 */

import { LoadTestingEngine, LoadTestConfig } from './advanced-testing-framework';
import { getEnhancedCommunityManager } from '../../characters/enhanced-community-manager';

/**
 * Main load testing function
 */
async function runLoadTests() {
  console.log('📈 Load Testing Suite');
  console.log('=' .repeat(50));
  
  try {
    // 1. Light Load Testing (5 concurrent users)
    console.log('\n🔍 Light Load Testing (5 concurrent users)...');
    
    const lightLoadConfig: LoadTestConfig = {
      concurrentUsers: 5,
      rampUpTime: 3, // seconds
      testDuration: 20, // seconds
      maxResponseTime: 1000, // milliseconds
      errorThreshold: 2 // percentage
    };
    
    const lightLoadEngine = new LoadTestingEngine(lightLoadConfig);
    
    // Simulate light load scenario
    const lightLoadResult = await lightLoadEngine.runLoadTest(async () => {
      // Simulate character interaction
      const character = getEnhancedCommunityManager();
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100)); // 100-300ms
      return { success: true, character: character.name };
    });
    
    console.log('  Light Load Results:');
    console.log(`    Total Requests: ${lightLoadResult.totalRequests}`);
    console.log(`    Success Rate: ${((lightLoadResult.successfulRequests / lightLoadResult.totalRequests) * 100).toFixed(2)}%`);
    console.log(`    Average Response Time: ${lightLoadResult.averageResponseTime.toFixed(2)}ms`);
    console.log(`    Throughput: ${lightLoadResult.throughput.toFixed(2)} req/s`);
    
    // 2. Medium Load Testing (15 concurrent users)
    console.log('\n🔍 Medium Load Testing (15 concurrent users)...');
    
    const mediumLoadConfig: LoadTestConfig = {
      concurrentUsers: 15,
      rampUpTime: 5, // seconds
      testDuration: 30, // seconds
      maxResponseTime: 1500, // milliseconds
      errorThreshold: 3 // percentage
    };
    
    const mediumLoadEngine = new LoadTestingEngine(mediumLoadConfig);
    
    // Simulate medium load scenario
    const mediumLoadResult = await mediumLoadEngine.runLoadTest(async () => {
      // Simulate more complex character interaction
      const character = getEnhancedCommunityManager();
      
      // Simulate multiple operations
      await Promise.all([
        new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 150)), // 150-450ms
        new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100)), // 100-300ms
        new Promise(resolve => setTimeout(resolve, Math.random() * 250 + 125))  // 125-375ms
      ]);
      
      return { success: true, character: character.name, operations: 3 };
    });
    
    console.log('  Medium Load Results:');
    console.log(`    Total Requests: ${mediumLoadResult.totalRequests}`);
    console.log(`    Success Rate: ${((mediumLoadResult.successfulRequests / mediumLoadResult.totalRequests) * 100).toFixed(2)}%`);
    console.log(`    Average Response Time: ${mediumLoadResult.averageResponseTime.toFixed(2)}ms`);
    console.log(`    Throughput: ${mediumLoadResult.throughput.toFixed(2)} req/s`);
    
    // 3. Heavy Load Testing (30 concurrent users)
    console.log('\n🔍 Heavy Load Testing (30 concurrent users)...');
    
    const heavyLoadConfig: LoadTestConfig = {
      concurrentUsers: 30,
      rampUpTime: 8, // seconds
      testDuration: 45, // seconds
      maxResponseTime: 2500, // milliseconds
      errorThreshold: 5 // percentage
    };
    
    const heavyLoadEngine = new LoadTestingEngine(heavyLoadConfig);
    
    // Simulate heavy load scenario
    const heavyLoadResult = await heavyLoadEngine.runLoadTest(async () => {
      // Simulate complex character interaction with external dependencies
      const character = getEnhancedCommunityManager();
      
      // Simulate database operations, API calls, and processing
      const operations = [
        new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 200)), // 200-600ms
        new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 150)), // 150-450ms
        new Promise(resolve => setTimeout(resolve, Math.random() * 350 + 175)), // 175-525ms
        new Promise(resolve => setTimeout(resolve, Math.random() * 250 + 125))  // 125-375ms
      ];
      
      await Promise.all(operations);
      
      return { success: true, character: character.name, operations: 4, complexity: 'high' };
    });
    
    console.log('  Heavy Load Results:');
    console.log(`    Total Requests: ${heavyLoadResult.totalRequests}`);
    console.log(`    Success Rate: ${((heavyLoadResult.successfulRequests / heavyLoadResult.totalRequests) * 100).toFixed(2)}%`);
    console.log(`    Average Response Time: ${heavyLoadResult.averageResponseTime.toFixed(2)}ms`);
    console.log(`    Throughput: ${heavyLoadResult.throughput.toFixed(2)} req/s`);
    
    // 4. Stress Testing (50 concurrent users)
    console.log('\n🔍 Stress Testing (50 concurrent users)...');
    
    const stressLoadConfig: LoadTestConfig = {
      concurrentUsers: 50,
      rampUpTime: 10, // seconds
      testDuration: 60, // seconds
      maxResponseTime: 5000, // milliseconds
      errorThreshold: 10 // percentage
    };
    
    const stressLoadEngine = new LoadTestingEngine(stressLoadConfig);
    
    // Simulate stress scenario
    const stressLoadResult = await stressLoadEngine.runLoadTest(async () => {
      // Simulate extremely complex character interaction
      const character = getEnhancedCommunityManager();
      
      // Simulate resource-intensive operations
      const operations = [
        new Promise(resolve => setTimeout(resolve, Math.random() * 600 + 300)), // 300-900ms
        new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 250)), // 250-750ms
        new Promise(resolve => setTimeout(resolve, Math.random() * 450 + 225)), // 225-675ms
        new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 200)), // 200-600ms
        new Promise(resolve => setTimeout(resolve, Math.random() * 350 + 175))  // 175-525ms
      ];
      
      await Promise.all(operations);
      
      // Simulate potential failures under stress
      if (Math.random() < 0.05) { // 5% failure rate under stress
        throw new Error('System overload - operation failed');
      }
      
      return { success: true, character: character.name, operations: 5, complexity: 'extreme' };
    });
    
    console.log('  Stress Load Results:');
    console.log(`    Total Requests: ${stressLoadResult.totalRequests}`);
    console.log(`    Success Rate: ${((stressLoadResult.successfulRequests / stressLoadResult.totalRequests) * 100).toFixed(2)}%`);
    console.log(`    Average Response Time: ${stressLoadResult.averageResponseTime.toFixed(2)}ms`);
    console.log(`    Throughput: ${stressLoadResult.throughput.toFixed(2)} req/s`);
    
    // 5. Spike Testing (sudden burst of users)
    console.log('\n🔍 Spike Testing (sudden burst of 100 users)...');
    
    const spikeLoadConfig: LoadTestConfig = {
      concurrentUsers: 100,
      rampUpTime: 2, // seconds - very fast ramp up
      testDuration: 20, // seconds - short duration
      maxResponseTime: 10000, // milliseconds - higher tolerance
      errorThreshold: 15 // percentage - higher error tolerance
    };
    
    const spikeLoadEngine = new LoadTestingEngine(spikeLoadConfig);
    
    // Simulate spike scenario
    const spikeLoadResult = await spikeLoadEngine.runLoadTest(async () => {
      // Simulate quick character interaction
      const character = getEnhancedCommunityManager();
      
      // Simulate fast operations
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100)); // 100-300ms
      
      return { success: true, character: character.name, operations: 1, complexity: 'fast' };
    });
    
    console.log('  Spike Load Results:');
    console.log(`    Total Requests: ${spikeLoadResult.totalRequests}`);
    console.log(`    Success Rate: ${((spikeLoadResult.successfulRequests / spikeLoadResult.totalRequests) * 100).toFixed(2)}%`);
    console.log(`    Average Response Time: ${spikeLoadResult.averageResponseTime.toFixed(2)}ms`);
    console.log(`    Throughput: ${spikeLoadResult.throughput.toFixed(2)} req/s`);
    
    // 6. Generate comprehensive load test report
    console.log('\n📊 COMPREHENSIVE LOAD TESTING REPORT');
    console.log('=' .repeat(60));
    
    const allResults = [lightLoadResult, mediumLoadResult, heavyLoadResult, stressLoadResult, spikeLoadResult];
    const testTypes = ['Light Load', 'Medium Load', 'Heavy Load', 'Stress Test', 'Spike Test'];
    
    console.log('Test Type           | Users | Requests | Success% | Avg RT | Throughput');
    console.log('-------------------|-------|----------|----------|---------|-----------');
    
    allResults.forEach((result, index) => {
      const successRate = ((result.successfulRequests / result.totalRequests) * 100).toFixed(1);
      const avgRT = result.averageResponseTime.toFixed(0);
      const throughput = result.throughput.toFixed(1);
      
      console.log(`${testTypes[index].padEnd(18)} | ${result.concurrentUsers.toString().padStart(5)} | ${result.totalRequests.toString().padStart(8)} | ${successRate.padStart(7)}% | ${avgRT.padStart(6)}ms | ${throughput.padStart(9)} req/s`);
    });
    
    // 7. Load testing analysis and recommendations
    console.log('\n💡 LOAD TESTING ANALYSIS & RECOMMENDATIONS');
    console.log('=' .repeat(60));
    
    // Analyze scalability
    const scalabilityAnalysis = analyzeScalability(allResults);
    console.log('\n📈 Scalability Analysis:');
    console.log(`  Linear Scaling: ${scalabilityAnalysis.linearScaling ? '✅' : '❌'}`);
    console.log(`  Performance Degradation: ${scalabilityAnalysis.performanceDegradation ? '⚠️' : '✅'}`);
    console.log(`  Bottleneck Threshold: ${scalabilityAnalysis.bottleneckThreshold} concurrent users`);
    
    // Analyze error patterns
    const errorAnalysis = analyzeErrorPatterns(allResults);
    console.log('\n❌ Error Pattern Analysis:');
    console.log(`  Error Rate Trend: ${errorAnalysis.trend}`);
    console.log(`  Critical Error Threshold: ${errorAnalysis.criticalThreshold}%`);
    console.log(`  Recovery Pattern: ${errorAnalysis.recoveryPattern}`);
    
    // Generate recommendations
    console.log('\n🚀 LOAD TESTING RECOMMENDATIONS');
    console.log('=' .repeat(60));
    
    const recommendations = generateLoadTestRecommendations(allResults, scalabilityAnalysis, errorAnalysis);
    
    if (recommendations.length === 0) {
      console.log('✅ System performs well under all load conditions - no specific recommendations');
    } else {
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    
    // 8. Performance targets and SLA recommendations
    console.log('\n🎯 PERFORMANCE TARGETS & SLA RECOMMENDATIONS');
    console.log('=' .repeat(60));
    
    const slaRecommendations = generateSLARecommendations(allResults);
    
    slaRecommendations.forEach((sla, index) => {
      console.log(`${index + 1}. ${sla.load} Load: ${sla.responseTime}ms response time, ${sla.errorRate}% error rate`);
    });
    
    console.log('\n🎉 Load Testing Suite completed successfully!');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ Load Testing Suite failed:', error);
    process.exit(1);
  }
}

/**
 * Analyze system scalability based on load test results
 */
function analyzeScalability(results: any[]) {
  let linearScaling = true;
  let performanceDegradation = false;
  let bottleneckThreshold = 0;
  
  for (let i = 1; i < results.length; i++) {
    const prev = results[i - 1];
    const curr = results[i];
    
    // Check if response time increases linearly with user count
    const userRatio = curr.concurrentUsers / prev.concurrentUsers;
    const responseTimeRatio = curr.averageResponseTime / prev.averageResponseTime;
    
    if (responseTimeRatio > userRatio * 1.5) {
      linearScaling = false;
      performanceDegradation = true;
      bottleneckThreshold = prev.concurrentUsers;
      break;
    }
  }
  
  return {
    linearScaling,
    performanceDegradation,
    bottleneckThreshold
  };
}

/**
 * Analyze error patterns across load tests
 */
function analyzeErrorPatterns(results: any[]) {
  const errorRates = results.map(r => r.errorRate);
  const trend = errorRates[errorRates.length - 1] > errorRates[0] ? 'Increasing' : 'Stable';
  const criticalThreshold = Math.max(...errorRates);
  const recoveryPattern = errorRates[errorRates.length - 1] < errorRates[errorRates.length - 2] ? 'Recovering' : 'Degrading';
  
  return {
    trend,
    criticalThreshold,
    recoveryPattern
  };
}

/**
 * Generate load testing recommendations
 */
function generateLoadTestRecommendations(results: any[], scalability: any, errors: any): string[] {
  const recommendations: string[] = [];
  
  if (!scalability.linearScaling) {
    recommendations.push('Implement horizontal scaling to handle increased load linearly');
    recommendations.push('Add load balancing to distribute requests evenly');
    recommendations.push('Optimize database queries and add connection pooling');
  }
  
  if (scalability.performanceDegradation) {
    recommendations.push(`System shows performance degradation at ${scalability.bottleneckThreshold} users - investigate bottlenecks`);
    recommendations.push('Implement caching strategies to reduce response times');
    recommendations.push('Consider microservices architecture for better scalability');
  }
  
  if (errors.criticalThreshold > 5) {
    recommendations.push('Error rate exceeds 5% under load - implement circuit breakers and retry logic');
    recommendations.push('Add monitoring and alerting for error thresholds');
    recommendations.push('Implement graceful degradation for high-load scenarios');
  }
  
  return recommendations;
}

/**
 * Generate SLA recommendations based on load test results
 */
function generateSLARecommendations(results: any[]) {
  const slaRecommendations = [];
  
  // Find optimal load for each SLA tier
  for (const result of results) {
    if (result.errorRate <= 1 && result.averageResponseTime <= 1000) {
      slaRecommendations.push({
        load: `${result.concurrentUsers} concurrent users`,
        responseTime: '1000ms',
        errorRate: '1%'
      });
    } else if (result.errorRate <= 3 && result.averageResponseTime <= 2000) {
      slaRecommendations.push({
        load: `${result.concurrentUsers} concurrent users`,
        responseTime: '2000ms',
        errorRate: '3%'
      });
    } else if (result.errorRate <= 5 && result.averageResponseTime <= 5000) {
      slaRecommendations.push({
        load: `${result.concurrentUsers} concurrent users`,
        responseTime: '5000ms',
        errorRate: '5%'
      });
    }
  }
  
  return slaRecommendations;
}

/**
 * Run the load testing suite
 */
if (require.main === module) {
  runLoadTests().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runLoadTests };
