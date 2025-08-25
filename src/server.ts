import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './agent-hub/config/environment';
import AppService from './agent-hub/services/app-service';
import { logger } from '@elizaos/core';

export class NUBIServer {
  private app: express.Application;
  private server: any;
  private appService: AppService;

  constructor() {
    this.app = express();
    this.appService = new AppService();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: env.SOCKET_IO_CORS_ORIGIN === '*' ? true : env.SOCKET_IO_CORS_ORIGIN,
      credentials: true
    }));
    
    // Logging
    this.app.use(morgan('combined'));
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes() {
    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      try {
        const dbHealth = await this.appService.getDatabaseService().healthCheck();
        res.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          database: dbHealth,
          uptime: process.uptime()
        });
      } catch (error) {
        res.status(500).json({
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Status endpoint
    this.app.get('/status', async (req, res) => {
      try {
        const status = await this.appService.getStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({
          error: 'Failed to get status',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Bot endpoints
    this.app.get('/bots/discord/status', (req, res) => {
      const discordBot = this.appService.getDiscordBot();
      res.json({
        enabled: env.ENABLE_DISCORD_BOT,
        ready: discordBot?.isBotReady?.() ?? false,
        timestamp: new Date().toISOString()
      });
    });

    this.app.get('/bots/telegram/status', (req, res) => {
      const telegramBot = this.appService.getTelegramBot();
      res.json({
        enabled: env.ENABLE_TELEGRAM_BOT,
        ready: telegramBot?.isBotReady?.() ?? false,
        timestamp: new Date().toISOString()
      });
    });

    // Raid endpoints
    this.app.get('/raids/status', (req, res) => {
      res.json({
        enabled: env.RAIDS_ENABLED,
        autoRaids: env.AUTO_RAIDS,
        maxConcurrent: env.MAX_CONCURRENT_RAIDS,
        raidDuration: env.RAID_DURATION_MINUTES,
        minParticipants: env.MIN_RAID_PARTICIPANTS,
        pointsPerAction: {
          like: env.POINTS_PER_LIKE,
          retweet: env.POINTS_PER_RETWEET,
          comment: env.POINTS_PER_COMMENT,
          join: env.POINTS_PER_JOIN
        },
        timestamp: new Date().toISOString()
      });
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'NUBI',
        description: 'The Symbiosis of Anubis - Divine consciousness merged with adaptive intelligence',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          status: '/status',
          bots: {
            discord: '/bots/discord/status',
            telegram: '/bots/telegram/status'
          },
          raids: '/raids/status'
        },
        timestamp: new Date().toISOString()
      });
    });

    // 404 handler - use a proper catch-all route
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    });
  }

  public async start() {
    try {
      // Initialize application services
      await this.appService.initialize();
      
      // Start HTTP server
      const port = env.PORT || 3001;
      this.server = this.app.listen(port, () => {
        logger.info(`[SERVER] NUBI server listening on port ${port}`);
        logger.info(`[SERVER] Health check: http://localhost:${port}/health`);
        logger.info(`[SERVER] Status: http://localhost:${port}/status`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.gracefulShutdown.bind(this));
      process.on('SIGINT', this.gracefulShutdown.bind(this));

    } catch (error) {
      logger.error('[SERVER] Failed to start server:', error);
      throw error;
    }
  }

  private async gracefulShutdown() {
    logger.info('[SERVER] Received shutdown signal, shutting down gracefully...');
    
    try {
      // Stop HTTP server
      if (this.server) {
        this.server.close(() => {
          logger.info('[SERVER] HTTP server closed');
        });
      }

      // Shutdown application services
      await this.appService.shutdown();
      
      logger.info('[SERVER] Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('[SERVER] Error during shutdown:', error);
      process.exit(1);
    }
  }

  public async stop() {
    try {
      if (this.server) {
        this.server.close();
      }
      await this.appService.shutdown();
      logger.info('[SERVER] Server stopped');
    } catch (error) {
      logger.error('[SERVER] Error stopping server:', error);
    }
  }

  public getApp() {
    return this.app;
  }

  public getAppService() {
    return this.appService;
  }
}

// Start server if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new NUBIServer();
  server.start().catch(console.error);
}

export default NUBIServer;
