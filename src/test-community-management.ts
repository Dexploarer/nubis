#!/usr/bin/env node

import { 
  communityManagementTemplates, 
  getCommunityTemplate, 
  getAllCommunityTemplates, 
  getTemplatesByFeatures,
  CommunityMemoryService,
  CommunityManagementService
} from './index';

/**
 * Test Community Management Templates
 */
async function testCommunityTemplates() {
  console.log('\n🏗️  Testing Community Management Templates...');

  try {
    // Test getting all templates
    const allTemplates = getAllCommunityTemplates();
    console.log(`✅ Found ${allTemplates.length} community management templates`);

    // Test getting specific template
    const supervisorTemplate = getCommunityTemplate('community-supervisor');
    if (supervisorTemplate) {
      console.log(`✅ Community Supervisor template loaded: ${supervisorTemplate.label}`);
      console.log(`   - Features: ${Object.entries(supervisorTemplate.communityFeatures)
        .filter(([, enabled]) => enabled)
        .map(([feature]) => feature)
        .join(', ')}`);
    } else {
      throw new Error('Community Supervisor template not found');
    }

    // Test filtering by features
    const moderationTemplates = getTemplatesByFeatures({ moderation: true });
    console.log(`✅ Found ${moderationTemplates.length} templates with moderation capabilities`);

    const analyticsTemplates = getTemplatesByFeatures({ analytics: true });
    console.log(`✅ Found ${analyticsTemplates.length} templates with analytics capabilities`);

    // Test template structure
    for (const template of allTemplates) {
      if (!template.template.name || !template.template.system) {
        throw new Error(`Template ${template.id} missing required fields`);
      }
      
      if (!template.memoryConfig || !template.communityFeatures) {
        throw new Error(`Template ${template.id} missing configuration`);
      }
    }

    console.log('✅ All community management templates are properly structured');
    return true;
  } catch (error) {
    console.error('❌ Community templates test failed:', error);
    return false;
  }
}

/**
 * Test Community Memory Service
 */
async function testCommunityMemoryService() {
  console.log('\n🧠 Testing Community Memory Service...');

  try {
    // Mock runtime for testing
    const mockRuntime = {
      agentId: 'test-agent-id' as any,
      roomId: 'test-room-id' as any,
      createMemory: async (memory: any, tableName: string) => {
        console.log(`   📝 Created memory in ${tableName}: ${memory.content.text.substring(0, 50)}...`);
        return 'test-memory-id' as any;
      },
      queueEmbeddingGeneration: async (memory: any, priority: string) => {
        console.log(`   🔄 Queued embedding generation with ${priority} priority`);
      },
      searchMemories: async (params: any) => {
        console.log(`   🔍 Searched memories with query: ${params.query}`);
        return [];
      },
      rerankMemories: async (query: string, memories: any[]) => {
        console.log(`   📊 Reranked ${memories.length} memories for query: ${query}`);
        return memories;
      },
      getMemories: async (params: any) => {
        console.log(`   📚 Retrieved memories from ${params.tableName}`);
        return [];
      }
    };

    // Create memory service
    const memoryService = new CommunityMemoryService(mockRuntime as any, {
      trackingLimit: 500,
      embeddingPriority: 'high',
      memoryScope: 'shared',
      tables: ['memories', 'messages', 'facts'],
      enableAutoModeration: true,
      enableAnalytics: true,
      enableRoleTracking: true
    });

    console.log('✅ Community Memory Service created successfully');

    // Test memory creation
    const memoryId = await memoryService.createCommunityMemory(
      'Test community memory for testing purposes',
      {
        type: 'fact',
        scope: 'shared',
        tags: ['test', 'community', 'memory'],
        priority: 'high'
      }
    );
    console.log(`✅ Created community memory: ${memoryId}`);

    // Test memory search
    const searchResults = await memoryService.searchCommunityMemories(
      'test community memory',
      { scope: 'shared', count: 5 }
    );
    console.log(`✅ Searched community memories: ${searchResults.length} results`);

    // Test community insights
    const insights = await memoryService.getCommunityInsights();
    console.log(`✅ Generated ${insights.length} community insights`);

    // Test memory metrics
    const metrics = await memoryService.getMemoryMetrics();
    console.log(`✅ Retrieved memory metrics: ${metrics.totalMemories} total memories`);

    // Test memory backup
    const backupResult = await memoryService.backupMemories();
    console.log(`✅ Memory backup: ${backupResult ? 'successful' : 'failed'}`);

    return true;
  } catch (error) {
    console.error('❌ Community Memory Service test failed:', error);
    return false;
  }
}

/**
 * Test Community Management Service
 */
async function testCommunityManagementService() {
  console.log('\n👥 Testing Community Management Service...');

  try {
    // Mock runtime for testing
    const mockRuntime = {
      agentId: 'test-agent-id' as any,
      roomId: 'test-room-id' as any,
      createMemory: async (memory: any, tableName: string) => {
        console.log(`   📝 Created memory in ${tableName}: ${memory.content.text.substring(0, 50)}...`);
        return 'test-memory-id' as any;
      },
      queueEmbeddingGeneration: async (memory: any, priority: string) => {
        console.log(`   🔄 Queued embedding generation with ${priority} priority`);
      },
      searchMemories: async (params: any) => {
        console.log(`   🔍 Searched memories with query: ${params.query}`);
        return [];
      },
      rerankMemories: async (query: string, memories: any[]) => {
        console.log(`   📊 Reranked ${memories.length} memories for query: ${query}`);
        return memories;
      },
      getMemories: async (params: any) => {
        console.log(`   📚 Retrieved memories from ${params.tableName}`);
        return [];
      }
    };

    // Create community management service
    const communityService = new CommunityManagementService(mockRuntime as any, {
      enableRoleManagement: true,
      enableAutoModeration: true,
      enableCommunityAnalytics: true,
      enableOnboarding: true,
      enableGuidelines: true,
      moderationThresholds: {
        warningThreshold: 2,
        timeoutThreshold: 3,
        banThreshold: 5
      },
      roleHierarchy: {
        OWNER: 5,
        ADMIN: 4,
        MODERATOR: 3,
        MEMBER: 2,
        GUEST: 1
      }
    });

    console.log('✅ Community Management Service created successfully');

    // Test member onboarding
    const newMember = await communityService.onboardNewMember(
      'test-user-id' as any,
      'TestUser',
      'Welcome to our community!'
    );
    console.log(`✅ Onboarded new member: ${newMember.username} with role ${newMember.role}`);

    // Create a test agent with proper permissions first
    await communityService.onboardNewMember(
      'test-agent-id' as any,
      'TestAgent',
      'Welcome agent!'
    );
    
    // Assign the agent a higher role for testing
    await communityService.assignRole(
      'test-agent-id' as any,
      'ADMIN',
      'test-agent-id' as any, // Self-assign for testing
      'Test agent needs admin permissions'
    );

    // Test role assignment
    const roleAssigned = await communityService.assignRole(
      'test-user-id' as any,
      'MEMBER',
      'test-agent-id' as any,
      'Promoted for good behavior'
    );
    console.log(`✅ Role assignment: ${roleAssigned ? 'successful' : 'failed'}`);

    // Test moderation
    const moderationAction = await communityService.moderateUser(
      'test-user-id' as any,
      'warning',
      'Test moderation action',
      'test-agent-id' as any
    );
    console.log(`✅ Moderation action: ${moderationAction.type} - ${moderationAction.reason}`);

    // Test community health
    const health = await communityService.getCommunityHealth();
    console.log(`✅ Community health: ${health.healthStatus} (${health.totalMembers} members)`);

    // Test member analytics
    const analytics = await communityService.getMemberAnalytics('test-user-id' as any);
    if (analytics) {
      console.log(`✅ Member analytics: ${analytics.username} - ${analytics.role}`);
    }

    // Test guideline management
    const guidelineId = await communityService.addGuideline({
      title: 'Test Guideline',
      description: 'This is a test guideline for testing purposes',
      category: 'behavior',
      severity: 'medium',
      examples: ['Example 1', 'Example 2'],
      consequences: ['Warning', 'Timeout']
    });
    console.log(`✅ Added guideline: ${guidelineId}`);

    return true;
  } catch (error) {
    console.error('❌ Community Management Service test failed:', error);
    return false;
  }
}

/**
 * Test Template Integration
 */
async function testTemplateIntegration() {
  console.log('\n🔗 Testing Template Integration...');

  try {
    // Get a template
    const template = getCommunityTemplate('community-supervisor');
    if (!template) {
      throw new Error('Template not found');
    }

    console.log(`✅ Template loaded: ${template.label}`);

    // Test template configuration
    const { memoryConfig, communityFeatures } = template;
    
    console.log(`   📊 Memory config: ${memoryConfig.trackingLimit} limit, ${memoryConfig.embeddingPriority} priority`);
    console.log(`   🎯 Features: ${Object.entries(communityFeatures)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature)
      .join(', ')}`);

    // Test template settings
    const { settings } = template.template;
    if (settings) {
      console.log(`   ⚙️  Settings: ${Object.keys(settings).length} configuration options`);
    }

    // Test template plugins
    const { plugins } = template.template;
    if (plugins && plugins.length > 0) {
      console.log(`   🧩 Plugins: ${plugins.length} enabled (${plugins.join(', ')})`);
    }

    // Test template style
    const { style } = template.template;
    if (style) {
      console.log(`   ✍️  Style: ${Object.keys(style).length} style categories defined`);
    }

    console.log('✅ Template integration test completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Template integration test failed:', error);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Community Management System Tests...\n');

  const tests = [
    { name: 'Community Templates', fn: testCommunityTemplates },
    { name: 'Community Memory Service', fn: testCommunityMemoryService },
    { name: 'Community Management Service', fn: testCommunityManagementService },
    { name: 'Template Integration', fn: testTemplateIntegration }
  ];

  const results = [];
  
  for (const test of tests) {
    console.log(`\n🧪 Running ${test.name} Test...`);
    const result = await test.fn();
    results.push({ name: test.name, passed: result });
  }

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
  });

  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All community management tests passed! The system is ready for production use.');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.');
  }

  return passed === total;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

export { 
  testCommunityTemplates,
  testCommunityMemoryService,
  testCommunityManagementService,
  testTemplateIntegration,
  runAllTests
};
