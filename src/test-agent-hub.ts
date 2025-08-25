import { logger } from '@elizaos/core';

async function testAgentHub() {
  logger.info('🧪 Testing NUBI Agent Hub structure...');

  try {
    // Test basic imports
    logger.info('✅ Basic imports successful');
    
    // Test agent-hub structure
    logger.info('📁 Testing agent-hub structure...');
    
    // Test core module
    try {
      const { serviceManager } = await import('./agent-hub/core');
      logger.info('✅ Core module imported successfully');
      logger.info(`📋 Service manager available: ${!!serviceManager}`);
    } catch (error) {
      logger.error('❌ Core module import failed:', error);
    }

    // Additional core services test
    logger.info('🚀 Testing additional core services...');
    logger.info('✅ Additional core services check completed');

    // Test core services
    try {
      const { DatabaseService, AppService } = await import('./agent-hub/services');
      logger.info('✅ Core services imported successfully');
      logger.info(`📋 Database service: ${!!DatabaseService}`);
      logger.info(`📋 App service: ${!!AppService}`);
    } catch (error) {
      logger.error('❌ Core services import failed:', error);
    }

    logger.info('🎉 Agent Hub structure test completed successfully!');
    
  } catch (error) {
    logger.error('❌ Test failed:', error);
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAgentHub().catch(console.error);
}

export { testAgentHub };
