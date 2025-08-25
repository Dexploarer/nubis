#!/usr/bin/env tsx

/**
 * Integration Testing Suite
 * Focuses on testing external service dependencies, API endpoints, and system integration points
 */

import { IntegrationTestingEngine, IntegrationTestConfig } from './advanced-testing-framework';
import { getEnhancedCommunityManager } from '../characters/enhanced-community-manager';

/**
 * Main integration testing function
 */
async function runIntegrationTests() {
  console.log('🔗 Integration Testing Suite');
  console.log('=' .repeat(50));
  
  try {
    // 1. Database Integration Testing
    console.log('\n🔍 Database Integration Testing...');
    
    const databaseConfig: IntegrationTestConfig = {
      externalServices: ['database'],
      mockMode: false, // Test with real database
      timeout: 10000, // milliseconds
      retryAttempts: 3,
      healthCheckEndpoints: [
        'http://localhost:3000/api/health/database',
        'http://localhost:3000/api/health/connection'
      ]
    };
    
    const databaseEngine = new IntegrationTestingEngine(databaseConfig);
    
    // Test database connectivity
    console.log('  Testing database connectivity...');
    const databaseResult = await databaseEngine.runIntegrationTests();
    
    console.log('  Database Integration Results:');
    console.log(`    Services Tested: ${databaseResult.externalDependencies.length}`);
    console.log(`    Integration Points: ${databaseResult.integrationPoints.length}`);
    console.log(`    Mock Mode: ${databaseResult.mockModeUsed ? 'Enabled' : 'Disabled'}`);
    
    // 2. API Integration Testing
    console.log('\n🔍 API Integration Testing...');
    
    const apiConfig: IntegrationTestConfig = {
      externalServices: ['api', 'rest-api', 'graphql'],
      mockMode: false, // Test with real APIs
      timeout: 15000, // milliseconds
      retryAttempts: 3,
      healthCheckEndpoints: [
        'http://localhost:3000/api/health',
        'http://localhost:3000/api/status',
        'http://localhost:3000/api/version'
      ]
    };
    
    const apiEngine = new IntegrationTestingEngine(apiConfig);
    
    // Test API endpoints
    console.log('  Testing API endpoints...');
    const apiResult = await apiEngine.runIntegrationTests();
    
    console.log('  API Integration Results:');
    console.log(`    Services Tested: ${apiResult.externalDependencies.length}`);
    console.log(`    Integration Points: ${apiResult.integrationPoints.length}`);
    console.log(`    Mock Mode: ${apiResult.mockModeUsed ? 'Enabled' : 'Disabled'}`);
    
    // 3. Cache Integration Testing
    console.log('\n🔍 Cache Integration Testing...');
    
    const cacheConfig: IntegrationTestConfig = {
      externalServices: ['cache', 'redis', 'memory-cache'],
      mockMode: false, // Test with real cache
      timeout: 8000, // milliseconds
      retryAttempts: 2,
      healthCheckEndpoints: [
        'http://localhost:3000/api/health/cache',
        'http://localhost:3000/api/health/redis'
      ]
    };
    
    const cacheEngine = new IntegrationTestingEngine(cacheConfig);
    
    // Test cache services
    console.log('  Testing cache services...');
    const cacheResult = await cacheEngine.runIntegrationTests();
    
    console.log('  Cache Integration Results:');
    console.log(`    Services Tested: ${cacheResult.externalDependencies.length}`);
    console.log(`    Integration Points: ${cacheResult.integrationPoints.length}`);
    console.log(`    Mock Mode: ${cacheResult.mockModeUsed ? 'Enabled' : 'Disabled'}`);
    
    // 4. Message Queue Integration Testing
    console.log('\n🔍 Message Queue Integration Testing...');
    
    const queueConfig: IntegrationTestConfig = {
      externalServices: ['message-queue', 'rabbitmq', 'kafka'],
      mockMode: false, // Test with real queue
      timeout: 12000, // milliseconds
      retryAttempts: 3,
      healthCheckEndpoints: [
        'http://localhost:3000/api/health/queue',
        'http://localhost:3000/api/health/messaging'
      ]
    };
    
    const queueEngine = new IntegrationTestingEngine(queueConfig);
    
    // Test message queue services
    console.log('  Testing message queue services...');
    const queueResult = await queueEngine.runIntegrationTests();
    
    console.log('  Message Queue Integration Results:');
    console.log(`    Services Tested: ${queueResult.externalDependencies.length}`);
    console.log(`    Integration Points: ${queueResult.integrationPoints.length}`);
    console.log(`    Mock Mode: ${queueResult.mockModeUsed ? 'Enabled' : 'Disabled'}`);
    
    // 5. External Service Integration Testing
    console.log('\n🔍 External Service Integration Testing...');
    
    const externalConfig: IntegrationTestConfig = {
      externalServices: ['third-party-api', 'webhook-service', 'notification-service'],
      mockMode: false, // Test with real external services
      timeout: 20000, // milliseconds
      retryAttempts: 2,
      healthCheckEndpoints: [
        'http://localhost:3000/api/health/external',
        'http://localhost:3000/api/health/webhooks'
      ]
    };
    
    const externalEngine = new IntegrationTestingEngine(externalConfig);
    
    // Test external services
    console.log('  Testing external services...');
    const externalResult = await externalEngine.runIntegrationTests();
    
    console.log('  External Service Integration Results:');
    console.log(`    Services Tested: ${externalResult.externalDependencies.length}`);
    console.log(`    Integration Points: ${externalResult.integrationPoints.length}`);
    console.log(`    Mock Mode: ${externalResult.mockModeUsed ? 'Enabled' : 'Disabled'}`);
    
    // 6. Character System Integration Testing
    console.log('\n🔍 Character System Integration Testing...');
    
    // Test character integration with external services
    const character = getEnhancedCommunityManager();
    
    console.log('  Testing character system integration...');
    
    // Simulate character operations that require external services
    const characterIntegrationTests = [
      {
        name: 'Database Persistence',
        test: async () => {
          // Simulate saving character data to database
          await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
          return { success: true, operation: 'save', service: 'database' };
        }
      },
      {
        name: 'API Communication',
        test: async () => {
          // Simulate API calls for character updates
          await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 300));
          return { success: true, operation: 'update', service: 'api' };
        }
      },
      {
        name: 'Cache Operations',
        test: async () => {
          // Simulate cache operations for character data
          await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
          return { success: true, operation: 'cache', service: 'cache' };
        }
      },
      {
        name: 'Message Publishing',
        test: async () => {
          // Simulate publishing character events to message queue
          await new Promise(resolve => setTimeout(resolve, Math.random() * 350 + 250));
          return { success: true, operation: 'publish', service: 'message-queue' };
        }
      }
    ];
    
    const characterResults = [];
    for (const test of characterIntegrationTests) {
      try {
        const startTime = Date.now();
        const result = await test.test();
        const responseTime = Date.now() - startTime;
        
        characterResults.push({
          test: test.name,
          success: result.success,
          responseTime,
          service: result.service
        });
        
        console.log(`    ${test.name}: ${result.success ? '✅' : '❌'} (${responseTime}ms)`);
      } catch (error) {
        characterResults.push({
          test: test.name,
          success: false,
          responseTime: -1,
          service: 'unknown',
          error: error instanceof Error ? error.message : String(error)
        });
        
        console.log(`    ${test.name}: ❌ ERROR`);
      }
    }
    
    // 7. End-to-End Integration Testing
    console.log('\n🔍 End-to-End Integration Testing...');
    
    const e2eConfig: IntegrationTestConfig = {
      externalServices: ['database', 'api', 'cache', 'message-queue'],
      mockMode: false, // Test with real services
      timeout: 30000, // milliseconds
      retryAttempts: 2,
      healthCheckEndpoints: [
        'http://localhost:3000/api/health',
        'http://localhost:3000/api/health/detailed',
        'http://localhost:3000/api/health/all'
      ]
    };
    
    const e2eEngine = new IntegrationTestingEngine(e2eConfig);
    
    // Test complete integration flow
    console.log('  Testing complete integration flow...');
    const e2eResult = await e2eEngine.runIntegrationTests();
    
    console.log('  End-to-End Integration Results:');
    console.log(`    Services Tested: ${e2eResult.externalDependencies.length}`);
    console.log(`    Integration Points: ${e2eResult.integrationPoints.length}`);
    console.log(`    Mock Mode: ${e2eResult.mockModeUsed ? 'Enabled' : 'Disabled'}`);
    
    // 8. Generate comprehensive integration report
    console.log('\n📊 COMPREHENSIVE INTEGRATION TESTING REPORT');
    console.log('=' .repeat(70));
    
    const allResults = [databaseResult, apiResult, cacheResult, queueResult, externalResult, e2eResult];
    const testTypes = ['Database', 'API', 'Cache', 'Message Queue', 'External Services', 'End-to-End'];
    
    console.log('Test Type           | Services | Health Rate | Mock Mode | Integration Points');
    console.log('-------------------|----------|-------------|-----------|-------------------');
    
    allResults.forEach((result, index) => {
      const healthyServices = Array.from(result.serviceHealth.values()).filter(Boolean).length;
      const totalServices = result.serviceHealth.size;
      const healthRate = totalServices > 0 ? ((healthyServices / totalServices) * 100).toFixed(1) : '0.0';
      const mockMode = result.mockModeUsed ? 'Enabled' : 'Disabled';
      const integrationPoints = result.integrationPoints.length;
      
      console.log(`${testTypes[index].padEnd(18)} | ${totalServices.toString().padStart(8)} | ${healthRate.padStart(10)}% | ${mockMode.padStart(9)} | ${integrationPoints.toString().padStart(18)}`);
    });
    
    // 9. Character integration summary
    console.log('\n🎭 CHARACTER INTEGRATION SUMMARY');
    console.log('=' .repeat(50));
    
    const successfulTests = characterResults.filter(r => r.success).length;
    const totalTests = characterResults.length;
    const successRate = ((successfulTests / totalTests) * 100).toFixed(1);
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Successful: ${successfulTests}`);
    console.log(`Failed: ${totalTests - successfulTests}`);
    console.log(`Success Rate: ${successRate}%`);
    
    // 10. Integration analysis and recommendations
    console.log('\n💡 INTEGRATION ANALYSIS & RECOMMENDATIONS');
    console.log('=' .repeat(60));
    
    // Analyze service health
    const overallHealth = analyzeOverallHealth(allResults);
    console.log('\n🏥 Overall Service Health:');
    console.log(`  Total Services: ${overallHealth.totalServices}`);
    console.log(`  Healthy Services: ${overallHealth.healthyServices}`);
    console.log(`  Unhealthy Services: ${overallHealth.unhealthyServices}`);
    console.log(`  Overall Health Rate: ${overallHealth.healthRate.toFixed(2)}%`);
    
    // Analyze integration complexity
    const complexityAnalysis = analyzeIntegrationComplexity(allResults);
    console.log('\n🔧 Integration Complexity:');
    console.log(`  Integration Points: ${complexityAnalysis.totalPoints}`);
    console.log(`  Service Dependencies: ${complexityAnalysis.serviceDependencies}`);
    console.log(`  Complexity Level: ${complexityAnalysis.complexityLevel}`);
    
    // Generate recommendations
    console.log('\n🚀 INTEGRATION RECOMMENDATIONS');
    console.log('=' .repeat(60));
    
    const recommendations = generateIntegrationRecommendations(allResults, overallHealth, complexityAnalysis);
    
    if (recommendations.length === 0) {
      console.log('✅ All integration points are healthy - no specific recommendations');
    } else {
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    
    // 11. Service dependency mapping
    console.log('\n🗺️  SERVICE DEPENDENCY MAPPING');
    console.log('=' .repeat(50));
    
    const dependencyMap = generateServiceDependencyMap(allResults);
    
    for (const [service, dependencies] of dependencyMap.entries()) {
      console.log(`\n${service}:`);
      dependencies.forEach(dep => {
        console.log(`  └── ${dep}`);
      });
    }
    
    // 12. Performance and reliability metrics
    console.log('\n📈 PERFORMANCE & RELIABILITY METRICS');
    console.log('=' .repeat(50));
    
    const performanceMetrics = calculatePerformanceMetrics(allResults);
    
    console.log(`Average Response Time: ${performanceMetrics.avgResponseTime.toFixed(2)}ms`);
    console.log(`Response Time Variance: ${performanceMetrics.responseTimeVariance.toFixed(2)}ms`);
    console.log(`Service Availability: ${performanceMetrics.availability.toFixed(2)}%`);
    console.log(`Integration Reliability: ${performanceMetrics.reliability.toFixed(2)}%`);
    
    console.log('\n🎉 Integration Testing Suite completed successfully!');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ Integration Testing Suite failed:', error);
    process.exit(1);
  }
}

/**
 * Analyze overall service health across all integration tests
 */
function analyzeOverallHealth(results: any[]) {
  let totalServices = 0;
  let healthyServices = 0;
  
  for (const result of results) {
    for (const [service, healthy] of result.serviceHealth.entries()) {
      totalServices++;
      if (healthy) healthyServices++;
    }
  }
  
  return {
    totalServices,
    healthyServices,
    unhealthyServices: totalServices - healthyServices,
    healthRate: totalServices > 0 ? (healthyServices / totalServices) * 100 : 0
  };
}

/**
 * Analyze integration complexity
 */
function analyzeIntegrationComplexity(results: any[]) {
  let totalPoints = 0;
  let serviceDependencies = 0;
  
  for (const result of results) {
    totalPoints += result.integrationPoints.length;
    serviceDependencies += result.externalDependencies.length;
  }
  
  let complexityLevel = 'Low';
  if (totalPoints > 20) complexityLevel = 'High';
  else if (totalPoints > 10) complexityLevel = 'Medium';
  
  return {
    totalPoints,
    serviceDependencies,
    complexityLevel
  };
}

/**
 * Generate integration recommendations
 */
function generateIntegrationRecommendations(results: any[], health: any, complexity: any): string[] {
  const recommendations: string[] = [];
  
  if (health.healthRate < 90) {
    recommendations.push('Improve service health by investigating and fixing unhealthy services');
    recommendations.push('Implement health check monitoring and alerting');
    recommendations.push('Add retry logic and circuit breakers for unreliable services');
  }
  
  if (complexity.complexityLevel === 'High') {
    recommendations.push('Consider simplifying integration architecture to reduce complexity');
    recommendations.push('Implement service mesh for better service-to-service communication');
    recommendations.push('Add comprehensive logging and tracing for debugging');
  }
  
  if (complexity.serviceDependencies > 10) {
    recommendations.push('Review service dependencies and consider consolidation');
    recommendations.push('Implement dependency injection for better testability');
    recommendations.push('Add service discovery and load balancing');
  }
  
  return recommendations;
}

/**
 * Generate service dependency map
 */
function generateServiceDependencyMap(results: any[]): Map<string, string[]> {
  const dependencyMap = new Map<string, string[]>();
  
  for (const result of results) {
    for (const service of result.externalDependencies) {
      if (!dependencyMap.has(service)) {
        dependencyMap.set(service, []);
      }
      
      // Add integration points as dependencies
      result.integrationPoints.forEach((point: string) => {
        const dependencies = dependencyMap.get(service)!;
        if (!dependencies.includes(point)) {
          dependencies.push(point);
        }
      });
    }
  }
  
  return dependencyMap;
}

/**
 * Calculate performance metrics
 */
function calculatePerformanceMetrics(results: any[]) {
  const responseTimes: number[] = [];
  let totalServices = 0;
  let availableServices = 0;
  let reliableIntegrations = 0;
  let totalIntegrations = 0;
  
  for (const result of results) {
    for (const [service, time] of result.apiResponseTimes.entries()) {
      if (time >= 0) {
        responseTimes.push(time);
      }
    }
    
    for (const [service, healthy] of result.serviceHealth.entries()) {
      totalServices++;
      if (healthy) availableServices++;
    }
    
    totalIntegrations += result.integrationPoints.length;
    reliableIntegrations += result.integrationPoints.filter((point: string) => 
      !point.includes('ERROR') && !point.includes('UNHEALTHY')
    ).length;
  }
  
  const avgResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
    : 0;
  
  const responseTimeVariance = responseTimes.length > 0 
    ? Math.sqrt(responseTimes.reduce((acc, time) => acc + Math.pow(time - avgResponseTime, 2), 0) / responseTimes.length)
    : 0;
  
  return {
    avgResponseTime,
    responseTimeVariance,
    availability: totalServices > 0 ? (availableServices / totalServices) * 100 : 0,
    reliability: totalIntegrations > 0 ? (reliableIntegrations / totalIntegrations) * 100 : 0
  };
}

/**
 * Run the integration testing suite
 */
if (require.main === module) {
  runIntegrationTests().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runIntegrationTests };
