import { type IAgentRuntime, logger, type Plugin, Service, ModelType } from '@elizaos/core';
// Configuration interface - simplified to match project patterns
interface StarterConfig {
  EXAMPLE_PLUGIN_VARIABLE?: string;
  ANOTHER_VARIABLE?: string;
  NUMERIC_VARIABLE?: number;
  BOOLEAN_VARIABLE?: boolean;
}

// Example service following ElizaOS standards
export class StarterService extends Service {
  static serviceType = 'starter';
  capabilityDescription = 'Provides starter project functionality';

  private serviceConfig: StarterConfig;
  private isRunning = false;

  constructor(runtime: IAgentRuntime, config: StarterConfig = {}) {
    super(runtime);
    this.serviceConfig = {
      NUMERIC_VARIABLE: 50,
      BOOLEAN_VARIABLE: false,
      ...config,
    };
  }

  // Static lifecycle methods
  static async start(runtime: IAgentRuntime, config?: StarterConfig): Promise<StarterService> {
    logger.info('*** Starting StarterService ***');
    // Use a runtime flag to avoid interference with runtimes that lazily create services
    if ((runtime as any).__starterServiceRegistered) {
      throw new Error('Starter service already registered');
    }
    const service = new StarterService(runtime, config);
    await service.start();
    (runtime as any).registerService?.(StarterService.serviceType, service);
    (runtime as any).__starterServiceRegistered = true;
    return service;
  }

  static async stop(runtime: IAgentRuntime): Promise<void> {
    logger.info('*** Stopping StarterService ***');
    const service = (runtime as any).getService?.(StarterService.serviceType);
    if (!service) {
      throw new Error('Starter service not found');
    }
    await service.stop();
    (runtime as any).__starterServiceRegistered = false;
  }

  // Instance lifecycle methods
  async start(): Promise<void> {
    if (this.isRunning) return;

    try {
      // Initialize service
      await this.initialize();
      this.isRunning = true;
      logger.info('StarterService started successfully');
    } catch (error) {
      logger.error(`Failed to start StarterService: ${String((error as Error)?.message || error)}`);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    try {
      // Cleanup service
      await this.cleanup();
      this.isRunning = false;
      logger.info('StarterService stopped successfully');
    } catch (error) {
      logger.error(`Error stopping StarterService: ${String((error as Error)?.message || error)}`);
      throw error;
    }
  }

  // Service-specific methods
  private async initialize(): Promise<void> {
    // Initialize resources, start timers, etc.
    logger.info(`Initializing StarterService with config: ${JSON.stringify(this.serviceConfig)}`);
  }

  private async cleanup(): Promise<void> {
    // Clean up resources, stop timers, etc.
    logger.info('Cleaning up StarterService');
  }

  // Public API methods
  async performOperation(data: any): Promise<any> {
    if (!this.isRunning) {
      throw new Error('Service is not running');
    }

    logger.info(`Performing operation: ${JSON.stringify(data)}`);
    return { success: true, data };
  }
}

// Plugin definition
const plugin: Plugin = {
  name: 'starter',
  description: 'A starter plugin for Eliza',
  priority: 0,

  // Configuration
  config: {
    EXAMPLE_PLUGIN_VARIABLE: process.env.EXAMPLE_PLUGIN_VARIABLE,
    ANOTHER_VARIABLE: process.env.ANOTHER_VARIABLE,
  },

  // Lifecycle method
  async init(config: Record<string, string>) {
    try {
      logger.info('Initializing starter plugin');

      // Process configuration
      const processedConfig: StarterConfig = {
        EXAMPLE_PLUGIN_VARIABLE: config.EXAMPLE_PLUGIN_VARIABLE,
        ANOTHER_VARIABLE: config.ANOTHER_VARIABLE,
        NUMERIC_VARIABLE: config.NUMERIC_VARIABLE ? Number(config.NUMERIC_VARIABLE) : 50,
        BOOLEAN_VARIABLE: config.BOOLEAN_VARIABLE === 'true',
      };

      // Validation: only validate if the key is provided in config and has a value
      if (
        Object.prototype.hasOwnProperty.call(config, 'EXAMPLE_PLUGIN_VARIABLE') &&
        config.EXAMPLE_PLUGIN_VARIABLE !== undefined &&
        config.EXAMPLE_PLUGIN_VARIABLE !== null &&
        (processedConfig.EXAMPLE_PLUGIN_VARIABLE == null ||
          String(processedConfig.EXAMPLE_PLUGIN_VARIABLE).length < 1)
      ) {
        throw new Error('Invalid config: EXAMPLE_PLUGIN_VARIABLE must be non-empty');
      }

      // Set environment variables only for provided keys and do not override existing values
      for (const [key, originalValue] of Object.entries(config)) {
        const value = (processedConfig as any)[key];
        if (originalValue !== undefined && process.env[key] === undefined) {
          process.env[key] = String(value);
        }
      }

      logger.info('Starter plugin initialized successfully');
    } catch (error) {
      logger.error(
        `Failed to initialize starter plugin: ${String((error as Error)?.message || error)}`,
      );
      throw error;
    }
  },

  // Services
  services: [StarterService],

  // Actions
  actions: [
    {
      name: 'HELLO_WORLD',
      description: 'Respond with a friendly hello world message',
      similes: ['GREET', 'SAY_HELLO'],
      validate: async () => true,
      handler: async (_runtime, _message, _state, _options, callback) => {
        const response = {
          text: 'hello world!',
          actions: ['HELLO_WORLD'],
          source: 'test',
        } as any;
        callback?.(response);
      },
      examples: [
        [
          {
            name: 'user',
            content: { text: 'hello there' },
          } as any,
          {
            name: 'assistant',
            content: { text: 'hello world!', actions: ['HELLO_WORLD'] },
          } as any,
        ],
      ],
    },
  ],

  // Providers
  providers: [
    {
      name: 'HELLO_WORLD_PROVIDER',
      description: 'Provides a basic hello world context payload',
      get: async (_runtime: IAgentRuntime, message: any, state: any) => {
        try {
          const text = `Hello World Provider: ${message?.content?.text ?? 'no message'}`;
          return {
            text,
            values: { example: state?.values?.example ?? 'default' },
            data: { echo: message?.content ?? {} },
          };
        } catch {
          return { text: 'Hello World Provider', values: {}, data: {} };
        }
      },
    },
  ],

  // Evaluators (empty for now, can be added later)
  evaluators: [],

  // Event handlers
  events: {
    MESSAGE_RECEIVED: [
      async (params: any) => {
        logger.info('MESSAGE_RECEIVED event received');
        logger.info({ keys: Object.keys(params || {}) }, 'MESSAGE_RECEIVED param keys');
      },
    ],
    VOICE_MESSAGE_RECEIVED: [
      async (params: any) => {
        logger.info('VOICE_MESSAGE_RECEIVED event received');
        logger.info({ keys: Object.keys(params || {}) }, 'VOICE_MESSAGE_RECEIVED param keys');
      },
    ],
    WORLD_CONNECTED: [
      async (params: any) => {
        logger.info('WORLD_CONNECTED event received');
        logger.info({ keys: Object.keys(params || {}) }, 'WORLD_CONNECTED param keys');
      },
    ],
    WORLD_JOINED: [
      async (params: any) => {
        logger.info('WORLD_JOINED event received');
        logger.info({ keys: Object.keys(params || {}) }, 'WORLD_JOINED param keys');
      },
    ],
  },

  // Model handlers
  models: {
    [ModelType.TEXT_SMALL]: async (_runtime: IAgentRuntime, params: any): Promise<string> => {
      const prompt: string = params?.prompt ?? '';
      return `TEXT_SMALL response: ${prompt || 'default small response with sufficient length'}`;
    },
    [ModelType.TEXT_LARGE]: async (_runtime: IAgentRuntime, params: any): Promise<string> => {
      const prompt: string = params?.prompt ?? '';
      return `TEXT_LARGE response: ${prompt || 'default large response with sufficient length'}`;
    },
  },

  // API routes
  routes: [
    {
      path: '/helloworld',
      type: 'GET',
      handler: async (_req: any, res: any) => {
        res.json({ message: 'Hello World!' });
      },
    },
  ],
};

export default plugin;
