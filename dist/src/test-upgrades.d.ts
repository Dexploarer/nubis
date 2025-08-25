#!/usr/bin/env node
/**
 * Test Script for ElizaOS Architecture Upgrades
 * Validates that all new components are working correctly
 */
/**
 * Test Character Factory
 */
declare function testCharacterFactory(): Promise<boolean>;
/**
 * Test Service Builder
 */
declare function testServiceBuilder(): Promise<boolean>;
/**
 * Test Character Validation
 */
declare function testCharacterValidation(): Promise<boolean>;
/**
 * Test Existing Characters
 */
declare function testExistingCharacters(): Promise<boolean>;
/**
 * Test Service Registry Builder
 */
declare function testServiceRegistryBuilder(): Promise<boolean>;
/**
 * Main test runner
 */
declare function runAllTests(): Promise<void>;
export { testCharacterFactory, testServiceBuilder, testCharacterValidation, testExistingCharacters, testServiceRegistryBuilder, runAllTests, };
