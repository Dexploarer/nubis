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

    // Test bot services
    logger.info('🤖 Testing bot services...');
    
    try {
      await app.initialize();
      logger.info('✅ Application initialized successfully');
      
      // Get status
      const status = await app.getStatus();
      console.log('Application Status:', JSON.stringify(status, null, 2));
      
      // Wait a bit for bots to connect
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check bot status
      const discordReady = app.getDiscordBot()?.isBotReady?.() ?? false;
      const telegramReady = app.getTelegramBot()?.isBotReady?.() ?? false;
      
      console.log('Bot Status:', {
        discord: discordReady ? '🟢 Ready' : '🔴 Not Ready',
        telegram: telegramReady ? '🟢 Ready' : '🔴 Not Ready'
      });
      
      if (discordReady && telegramReady) {
        logger.info('✅ All bot services are ready');
      } else {
        logger.warn('⚠️ Some bot services are not ready');
      }
      
    } catch (error) {
      logger.error('❌ Application initialization failed:', error);
    }

    // Test telegram raids integration
    logger.info('🚀 Testing Telegram raids integration...');
    try {
      const raidsService = app.getTelegramRaids();
      if (raidsService) {
        logger.info('✅ Telegram raids service available');
      } else {
        logger.warn('⚠️ Telegram raids service not available');
      }
    } catch (error) {
      logger.error('❌ Telegram raids test failed:', error);
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
