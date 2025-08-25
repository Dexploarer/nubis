#!/usr/bin/env node
/**
 * Test Community Management Templates
 */
declare function testCommunityTemplates(): Promise<boolean>;
/**
 * Test Community Memory Service
 */
declare function testCommunityMemoryService(): Promise<boolean>;
/**
 * Test Community Management Service
 */
declare function testCommunityManagementService(): Promise<boolean>;
/**
 * Test Template Integration
 */
declare function testTemplateIntegration(): Promise<boolean>;
/**
 * Run all tests
 */
declare function runAllTests(): Promise<boolean>;
export { testCommunityTemplates, testCommunityMemoryService, testCommunityManagementService, testTemplateIntegration, runAllTests };
