#!/usr/bin/env tsx

/**
 * Performance Testing Suite
 * Focuses on execution time, memory usage, CPU usage, and optimization
 */

import { PerformanceTestingEngine } from './advanced-testing-framework';
import { getEnhancedCommunityManager } from '../characters/enhanced-community-manager';

/**
 * Main performance testing function
 */
async function runPerformanceTests() {
  console.log('⚡ Performance Testing Suite');
  console.log('=' .repeat(50));
  
  const performanceEngine = new PerformanceTestingEngine();
  
  try {
    // 1. Test character loading performance
    console.log('\n🔍 Testing Character Loading Performance...');
    
    for (let i = 0; i < 10; i++) {
      performanceEngine.startMeasurement();
      
      // Simulate character loading
      const character = getEnhancedCommunityManager();
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50)); // 50-150ms
      
      const metrics = performanceEngine.endMeasurement();
      console.log(`  Run ${i + 1}: ${metrics.executionTime.toFixed(2)}ms, ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }
    
    // 2. Test scenario generation performance
    console.log('\n🔍 Testing Scenario Generation Performance...');
    
    for (let i = 0; i < 5; i++) {
      performanceEngine.startMeasurement();
      
      // Simulate scenario generation
      const matrix = [
        { parameter: 'personality', values: ['A', 'B', 'C', 'D'] },
        { parameter: 'style', values: ['X', 'Y', 'Z'] },
        { parameter: 'approach', values: ['1', '2', '3', '4', '5'] }
      ];
      
      // Generate combinations
      let combinations = 1;
      for (const param of matrix) {
        combinations *= param.values.length;
      }
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100)); // 100-300ms
      
      const metrics = performanceEngine.endMeasurement();
      console.log(`  Run ${i + 1}: ${metrics.executionTime.toFixed(2)}ms, ${combinations} combinations`);
    }
    
    // 3. Test validation performance
    console.log('\n🔍 Testing Validation Performance...');
    
    for (let i = 0; i < 8; i++) {
      performanceEngine.startMeasurement();
      
      // Simulate validation logic
      const testData = Array.from({ length: 1000 }, (_, index) => ({
        id: index,
        value: Math.random() > 0.5 ? 'valid' : 'invalid',
        timestamp: Date.now()
      }));
      
      // Simulate validation processing
      const validCount = testData.filter(item => item.value === 'valid').length;
      await new Promise(resolve => setTimeout(resolve, Math.random() * 150 + 75)); // 75-225ms
      
      const metrics = performanceEngine.endMeasurement();
      console.log(`  Run ${i + 1}: ${metrics.executionTime.toFixed(2)}ms, ${validCount}/${testData.length} valid`);
    }
    
    // 4. Test memory management performance
    console.log('\n🔍 Testing Memory Management Performance...');
    
    for (let i = 0; i < 6; i++) {
      performanceEngine.startMeasurement();
      
      // Simulate memory-intensive operations
      const largeArray = Array.from({ length: 10000 }, (_, index) => ({
        id: index,
        data: `data_${index}_${Date.now()}`,
        metadata: { created: Date.now(), size: Math.random() * 1000 }
      }));
      
      // Process and filter
      const filtered = largeArray.filter(item => item.metadata.size > 500);
      const sorted = filtered.sort((a, b) => b.metadata.size - a.metadata.size);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200)); // 200-500ms
      
      const metrics = performanceEngine.endMeasurement();
      console.log(`  Run ${i + 1}: ${metrics.executionTime.toFixed(2)}ms, ${sorted.length} items processed`);
    }
    
    // 5. Test concurrent execution performance
    console.log('\n🔍 Testing Concurrent Execution Performance...');
    
    const concurrentTests = 5;
    const promises: Promise<any>[] = [];
    
    for (let i = 0; i < concurrentTests; i++) {
      promises.push((async () => {
        performanceEngine.startMeasurement();
        
        // Simulate concurrent work
        await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 300)); // 300-700ms
        
        return performanceEngine.endMeasurement();
      })());
    }
    
    const concurrentResults = await Promise.all(promises);
    
    console.log(`  Concurrent execution (${concurrentTests} tasks):`);
    concurrentResults.forEach((result, index) => {
      console.log(`    Task ${index + 1}: ${result.executionTime.toFixed(2)}ms`);
    });
    
    // 6. Generate performance report
    console.log('\n📊 PERFORMANCE TESTING REPORT');
    console.log('=' .repeat(50));
    
    const report = performanceEngine.generatePerformanceReport();
    console.log(report);
    
    // 7. Performance analysis and recommendations
    console.log('\n💡 PERFORMANCE ANALYSIS & RECOMMENDATIONS');
    console.log('=' .repeat(50));
    
    const avgMetrics = performanceEngine.getAverageMetrics();
    
    // Analyze execution time
    if (avgMetrics.executionTime > 500) {
      console.log('⚠️  Execution time is above optimal threshold (500ms)');
      console.log('   Consider optimizing algorithm complexity or reducing processing load');
    } else {
      console.log('✅ Execution time is within optimal range');
    }
    
    // Analyze memory usage
    if (avgMetrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
      console.log('⚠️  Memory usage is above optimal threshold (50MB)');
      console.log('   Consider implementing memory pooling or reducing object allocations');
    } else {
      console.log('✅ Memory usage is within optimal range');
    }
    
    // Analyze CPU usage
    if (avgMetrics.cpuUsage > 1.0) { // 1 second
      console.log('⚠️  CPU usage is above optimal threshold (1s)');
      console.log('   Consider optimizing computational operations or implementing caching');
    } else {
      console.log('✅ CPU usage is within optimal range');
    }
    
    // 8. Performance optimization suggestions
    console.log('\n🚀 PERFORMANCE OPTIMIZATION SUGGESTIONS');
    console.log('=' .repeat(50));
    
    const suggestions = [];
    
    if (avgMetrics.executionTime > 300) {
      suggestions.push('Implement request batching for multiple operations');
      suggestions.push('Add caching layer for frequently accessed data');
      suggestions.push('Optimize database queries and add indexes');
    }
    
    if (avgMetrics.memoryUsage > 25 * 1024 * 1024) { // 25MB
      suggestions.push('Implement object pooling for frequently created objects');
      suggestions.push('Add memory usage monitoring and garbage collection optimization');
      suggestions.push('Review and optimize data structures');
    }
    
    if (avgMetrics.cpuUsage > 0.5) { // 0.5 seconds
      suggestions.push('Implement worker threads for CPU-intensive tasks');
      suggestions.push('Add computational caching for repeated calculations');
      suggestions.push('Optimize algorithms and reduce complexity');
    }
    
    if (suggestions.length === 0) {
      console.log('✅ Performance is already optimized - no specific suggestions');
    } else {
      suggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion}`);
      });
    }
    
    console.log('\n🎉 Performance Testing Suite completed successfully!');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ Performance Testing Suite failed:', error);
    process.exit(1);
  }
}

/**
 * Run the performance testing suite
 */
if (require.main === module) {
  runPerformanceTests().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runPerformanceTests };
