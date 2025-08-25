import AppService from './agent-hub/services/app-service';
import { logger } from '@elizaos/core';

async function testConnections() {
  logger.info('🧪 Starting NUBI connection tests...');

  try {
    const app = new AppService();
    
    // Test database connections
    logger.info('📊 Testing database connections...');
    const dbService = app.getDatabaseService();
    const dbHealth = await dbService.healthCheck();
    
    console.log('Database Health:', JSON.stringify(dbHealth, null, 2));
    
    if (dbHealth.overall) {
      logger.info('✅ Database connections successful');
    } else {
      logger.warn('⚠️ Some database connections failed');
    }

    // Test application services
    logger.info('🚀 Testing application services...');
    
    try {
      await app.initialize();
      logger.info('✅ Application initialized successfully');
      
      // Get status
      const status = await app.getStatus();
      console.log('Application Status:', JSON.stringify(status, null, 2));
      
    } catch (error) {
      logger.error('❌ Application initialization failed:', error);
    }

    // Cleanup
    await app.shutdown();
    logger.info('🧹 Cleanup completed');

  } catch (error) {
    logger.error('❌ Test failed:', error);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testConnections().catch(console.error);
}

export { testConnections };
