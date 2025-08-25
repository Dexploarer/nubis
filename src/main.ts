import { logger } from '@elizaos/core';
import { projectAgent, serviceManager } from './agent-hub';

async function main() {
  logger.info('🚀 Starting NUBI - The Symbiosis of Anubis');
  
  try {
    // Initialize the project agent first to ensure SQL plugin is initialized
    // IMPORTANT: This ensures the SQL plugin is initialized before any other services
    // as it's listed first in the plugins array in character.ts
    if (projectAgent && projectAgent.init) {
      await projectAgent.init({} as any);
      logger.info('✅ NUBI agent initialized successfully');
    } else {
      logger.error('❌ Project agent or init method is undefined');
      throw new Error('Failed to initialize project agent');
    }
    
    // Initialize the service manager after plugins are loaded
    await serviceManager.initialize();
    logger.info('✅ NUBI services initialized successfully');
    
    // Start the HTTP server
    const { NUBIServer } = await import('./server');
    const server = new NUBIServer();
    await server.start();
    
  } catch (error) {
    logger.error('❌ Failed to start NUBI:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

// Start the application
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };
