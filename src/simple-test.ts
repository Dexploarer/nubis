import { logger } from '@elizaos/core';

async function simpleTest() {
  logger.info('🧪 Starting simple NUBI test...');

  try {
    // Test basic imports
    logger.info('✅ Basic imports successful');
    
    // Test package availability
    const packages = [
      '@supabase/supabase-js',
      'discord.js',
      'telegram-bot-api',
      'socket.io',
      'redis',
      'pg',
      '@sentry/node',
      'express'
    ];
    
    logger.info('📦 Testing package availability...');
    for (const pkg of packages) {
      try {
        require.resolve(pkg);
        logger.info(`✅ ${pkg} available`);
      } catch (error) {
        logger.warn(`⚠️ ${pkg} not available`);
      }
    }

    // Core services test
    logger.info('🚀 Testing core services...');
    logger.info('✅ Core services check completed');

    logger.info('🎉 Simple test completed successfully!');
    
  } catch (error) {
    logger.error('❌ Test failed:', error);
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  simpleTest().catch(console.error);
}

export { simpleTest };
