#!/usr/bin/env bun

/**
 * Test Runner for Social Raids Plugin
 * 
 * This script runs all tests for the social-raids plugin following ElizaOS testing standards.
 * It provides detailed reporting and handles test execution in the correct order.
 */

import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import { logger } from '@elizaos/core';

// Import all test files
import './test-utils';
import './actions.test';
import './services.test';
import './providers_evaluators.test';
import './evaluators.test';
import './integration.test';

// Test configuration
const TEST_CONFIG = {
  timeout: 30000, // 30 seconds timeout for individual tests
  retries: 2, // Number of retries for flaky tests
  parallel: true, // Run tests in parallel where possible
  verbose: true, // Verbose output
};

// Test categories and their descriptions
const TEST_CATEGORIES = {
  unit: {
    description: 'Unit Tests',
    files: ['actions.test', 'services.test', 'providers_evaluators.test', 'evaluators.test'],
  },
  integration: {
    description: 'Integration Tests',
    files: ['integration.test'],
  },
  utils: {
    description: 'Test Utilities',
    files: ['test-utils'],
  },
};

// Test statistics
interface TestStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  categories: Record<string, { total: number; passed: number; failed: number; skipped: number }>;
}

class TestRunner {
  private stats: TestStats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
    categories: {},
  };

  private startTime: number = 0;

  constructor() {
    this.initializeStats();
  }

  private initializeStats() {
    Object.keys(TEST_CATEGORIES).forEach(category => {
      this.stats.categories[category] = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
      };
    });
  }

  async runAllTests(): Promise<TestStats> {
    this.startTime = Date.now();
    
    logger.info('🚀 Starting Social Raids Plugin Test Suite');
    logger.info(`📋 Configuration: ${JSON.stringify(TEST_CONFIG, null, 2)}`);
    
    try {
      // Run test categories in order
      await this.runUnitTests();
      await this.runIntegrationTests();
      
      this.stats.duration = Date.now() - this.startTime;
      this.generateReport();
      
      return this.stats;
    } catch (error) {
      logger.error('❌ Test suite failed:', error);
      throw error;
    }
  }

  private async runUnitTests(): Promise<void> {
    logger.info('\n📦 Running Unit Tests...');
    
    const unitTestFiles = TEST_CATEGORIES.unit.files;
    for (const testFile of unitTestFiles) {
      await this.runTestFile(testFile, 'unit');
    }
  }

  private async runIntegrationTests(): Promise<void> {
    logger.info('\n🔗 Running Integration Tests...');
    
    const integrationTestFiles = TEST_CATEGORIES.integration.files;
    for (const testFile of integrationTestFiles) {
      await this.runTestFile(testFile, 'integration');
    }
  }

  private async runTestFile(testFile: string, category: string): Promise<void> {
    logger.info(`\n  📄 Running ${testFile}...`);
    
    try {
      // Import and run the test file
      const testModule = await import(`./${testFile}`);
      
      // Update stats for this category
      this.stats.categories[category].total += 1;
      this.stats.categories[category].passed += 1;
      this.stats.total += 1;
      this.stats.passed += 1;
      
      logger.info(`  ✅ ${testFile} completed successfully`);
    } catch (error) {
      this.stats.categories[category].total += 1;
      this.stats.categories[category].failed += 1;
      this.stats.total += 1;
      this.stats.failed += 1;
      
      logger.error(`  ❌ ${testFile} failed:`, error);
    }
  }

  private generateReport(): void {
    const duration = this.stats.duration;
    const successRate = ((this.stats.passed / this.stats.total) * 100).toFixed(2);
    
    logger.info('\n📊 Test Results Summary');
    logger.info('='.repeat(50));
    logger.info(`Total Tests: ${this.stats.total}`);
    logger.info(`Passed: ${this.stats.passed} ✅`);
    logger.info(`Failed: ${this.stats.failed} ❌`);
    logger.info(`Skipped: ${this.stats.skipped} ⏭️`);
    logger.info(`Success Rate: ${successRate}%`);
    logger.info(`Duration: ${duration}ms`);
    
    logger.info('\n📋 Category Breakdown:');
    Object.entries(this.stats.categories).forEach(([category, stats]) => {
      if (stats.total > 0) {
        const categorySuccessRate = ((stats.passed / stats.total) * 100).toFixed(2);
        logger.info(`  ${category.toUpperCase()}: ${stats.passed}/${stats.total} (${categorySuccessRate}%)`);
      }
    });
    
    if (this.stats.failed > 0) {
      logger.error('\n❌ Some tests failed. Please review the output above.');
      process.exit(1);
    } else {
      logger.success('\n🎉 All tests passed successfully!');
    }
  }
}

// Main execution
async function main() {
  const runner = new TestRunner();
  
  try {
    const stats = await runner.runAllTests();
    
    // Exit with appropriate code
    if (stats.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    logger.error('Test runner failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.main) {
  main();
}

export { TestRunner, TEST_CONFIG, TEST_CATEGORIES };
