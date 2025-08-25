#!/usr/bin/env node

/**
 * Test Script for ElizaOS Architecture Upgrades
 * Validates that all new components are working correctly
 */

import { 
  CharacterFactory,
  CharacterValidator,
  ServiceBuilder,
  ServiceBuilderUtils,
  validateCharacter,
  getValidatedCharacters,
  getCharacterValidationSummary,
} from './index';

/**
 * Test Character Factory
 */
async function testCharacterFactory() {
  console.log('\n🧪 Testing Character Factory...');
  
  try {
    // Test creating a character from template
    const basicCharacter = await CharacterFactory.createFromTemplate('basic', {
      name: 'Test Agent',
      bio: ['A test agent for validation'],
      topics: ['testing', 'validation'],
    });
    
    console.log('✅ Created character from template:', basicCharacter.name);
    
    // Test validation
    const validation = await CharacterValidator.validateCharacter(basicCharacter);
    console.log('✅ Character validation score:', validation.score);
    
    return true;
  } catch (error) {
    console.error('❌ Character factory test failed:', error);
    return false;
  }
}

/**
 * Test Service Builder
 */
async function testServiceBuilder() {
  console.log('\n🔧 Testing Service Builder...');
  
  try {
    // Test basic service creation
    const service = ServiceBuilderUtils.create('TestService', 'test-service')
      .withConfig({
        timeout: 5000,
        retries: 2,
        logLevel: 'debug',
      })
      .withLifecycle({
        autoStart: true,
        gracefulShutdown: true,
      })
      .dependsOn({
        name: 'DatabaseService',
        required: true,
      })
      .factory(async (runtime, config) => {
        return {
          name: 'TestService',
          config,
          start: async () => console.log('TestService started'),
          stop: async () => console.log('TestService stopped'),
        };
      })
      .build();
    
    console.log('✅ Service builder created service:', service.name);
    console.log('✅ Service config:', service.config);
    console.log('✅ Service dependencies:', service.dependencies.length);
    
    return true;
  } catch (error) {
    console.error('❌ Service builder test failed:', error);
    return false;
  }
}

/**
 * Test Character Validation
 */
async function testCharacterValidation() {
  console.log('\n✅ Testing Character Validation...');
  
  try {
    // Test schema validation
    const testCharacter = {
      name: 'Validation Test Agent',
      bio: ['A test agent for validation testing'],
      topics: ['validation', 'testing'],
      plugins: ['@elizaos/plugin-bootstrap'],
    };
    
    const validated = validateCharacter(testCharacter);
    console.log('✅ Schema validation passed:', validated.name);
    
    // Test comprehensive validation
    const validation = await CharacterValidator.validateCharacter(testCharacter, {
      comprehensive: true,
      validatePlugins: true,
      checkCommonIssues: true,
      validateSettings: true,
      testExamples: true,
    });
    
    console.log('✅ Comprehensive validation score:', validation.score);
    console.log('✅ Validation details:', validation.details);
    
    if (validation.warnings.length > 0) {
      console.log('⚠️  Warnings:', validation.warnings);
    }
    
    if (validation.suggestions.length > 0) {
      console.log('💡 Suggestions:', validation.suggestions);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Character validation test failed:', error);
    return false;
  }
}

/**
 * Test Existing Characters
 */
async function testExistingCharacters() {
  console.log('\n🤖 Testing Existing Characters...');
  
  try {
    // Test getting validated characters
    const { characters, validation } = await getValidatedCharacters();
    
    console.log('✅ Retrieved validated characters:', Object.keys(characters));
    
    // Test validation summary
    const summary = await getCharacterValidationSummary();
    
    for (const [name, result] of Object.entries(summary)) {
      console.log(`\n📊 ${name} Validation Summary:`);
      console.log(result);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Existing characters test failed:', error);
    return false;
  }
}

/**
 * Test Service Registry Builder
 */
async function testServiceRegistryBuilder() {
  console.log('\n📋 Testing Service Registry Builder...');
  
  try {
    const { ServiceRegistryBuilder } = await import('./builders/service.builder');
    
    const registry = new ServiceBuilder()
      .name('TestService1')
      .type('test-service')
      .priority(100)
      .factory(async (runtime, config) => ({ name: 'TestService1' }))
      .build();
    
    const registryBuilder = new ServiceBuilder()
      .name('TestService2')
      .type('test-service')
      .priority(50)
      .factory(async (runtime, config) => ({ name: 'TestService2' }))
      .build();
    
    const serviceRegistry = new ServiceRegistryBuilder()
      .addService(registry)
      .addService(registryBuilder)
      .build();
    
    console.log('✅ Service registry created with services:', serviceRegistry.length);
    
    // Test validation
    const validation = new ServiceRegistryBuilder().validate();
    console.log('✅ Service registry validation passed');
    
    return true;
  } catch (error) {
    console.error('❌ Service registry builder test failed:', error);
    return false;
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 Starting ElizaOS Architecture Upgrade Tests...\n');
  
  const tests = [
    { name: 'Character Factory', fn: testCharacterFactory },
    { name: 'Service Builder', fn: testServiceBuilder },
    { name: 'Character Validation', fn: testCharacterValidation },
    { name: 'Existing Characters', fn: testExistingCharacters },
    { name: 'Service Registry Builder', fn: testServiceRegistryBuilder },
  ];
  
  const results: Array<{ name: string; passed: boolean }> = [];
  
  for (const test of tests) {
    try {
      const passed = await test.fn();
      results.push({ name: test.name, passed });
    } catch (error) {
      console.error(`❌ Test "${test.name}" crashed:`, error);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  for (const result of results) {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
  }
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Architecture upgrades are working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('💥 Test runner crashed:', error);
    process.exit(1);
  });
}

export {
  testCharacterFactory,
  testServiceBuilder,
  testCharacterValidation,
  testExistingCharacters,
  testServiceRegistryBuilder,
  runAllTests,
};
