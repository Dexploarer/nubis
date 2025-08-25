import type { Character } from "@elizaos/core";
import { 
  CharacterSchema, 
  ValidatedCharacter, 
  validateCharacter, 
  validateCharacterSafe 
} from '../schemas/character.schema';

/**
 * Character Factory Options
 */
export interface CharacterFactoryOptions {
  /** Environment-specific overrides */
  environment?: 'development' | 'staging' | 'production';
  
  /** Default settings to apply */
  defaultSettings?: Partial<ValidatedCharacter['settings']>;
  
  /** Plugin availability check */
  validatePlugins?: boolean;
  
  /** Strict validation mode */
  strict?: boolean;
  
  /** Custom validation rules */
  customValidation?: (character: ValidatedCharacter) => Promise<boolean>;
}

/**
 * Character Validation Error
 */
export class CharacterValidationError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error,
    public readonly validationErrors?: string[]
  ) {
    super(message);
    this.name = 'CharacterValidationError';
  }
}

/**
 * Character Factory
 * Creates and validates ElizaOS characters with comprehensive error handling
 */
export class CharacterFactory {
  private static readonly DEFAULT_SETTINGS = {
    responseSpeed: 'balanced' as const,
    logLevel: 'info' as const,
    elizaos: {
      realtime: {
        enableWebSocket: true,
        autoReconnect: true,
        heartbeatInterval: 30000,
        maxReconnectAttempts: 5,
        logStreaming: true,
      },
      discord: {
        requireMention: true,
        allowDirectMessages: true,
        ignoreBotMessages: true,
        ignoreSelfMessages: true,
        responseCooldown: 5,
      },
      accessControl: {
        defaultRole: 'NONE',
        adminRoles: ['OWNER', 'ADMIN'],
        publicSettings: ['avatar', 'colorScheme', 'visualStyle'],
        restrictedSettings: ['secrets', 'mcp', 'memory'],
      },
      encryption: {
        autoEncryptSecrets: true,
        encryptionAlgorithm: 'AES-256-CBC',
        saltSource: 'SECRET_SALT',
        keyDerivation: 'PBKDF2',
      },
    },
    memory: {
      facts: {
        retentionDays: 365,
        maxFactsPerSearch: 6,
        embeddingModel: 'text-embedding',
        similarityThreshold: 0.7,
      },
      messages: {
        retentionDays: 90,
        maxContextMessages: 5,
        enableEmbeddingSearch: true,
      },
      entities: {
        retentionDays: 730,
        enableRelationshipTracking: true,
        maxEntityFacts: 50,
      },
      search: {
        defaultCount: 6,
        enableDeduplication: true,
        maxSearchResults: 20,
        contextWindowSize: 5,
      },
    },
  };

  /**
   * Create a character with validation
   */
  static async createCharacter(
    characterData: unknown,
    options: CharacterFactoryOptions = {}
  ): Promise<ValidatedCharacter> {
    try {
      // Step 1: Basic schema validation
      const validatedCharacter = validateCharacter(characterData);
      
      // Step 2: Apply factory options and defaults
      const enhancedCharacter = await this.applyFactoryOptions(validatedCharacter, options);
      
      // Step 3: Validate plugin dependencies if enabled
      if (options.validatePlugins !== false) {
        await this.validatePluginDependencies(enhancedCharacter);
      }
      
      // Step 4: Apply environment-specific configurations
      const environmentCharacter = this.applyEnvironmentConfig(enhancedCharacter, options.environment);
      
      // Step 5: Custom validation if provided
      if (options.customValidation) {
        const isValid = await options.customValidation(environmentCharacter);
        if (!isValid) {
          throw new CharacterValidationError('Character failed custom validation');
        }
      }
      
      return environmentCharacter;
    } catch (error) {
      if (error instanceof CharacterValidationError) {
        throw error;
      }
      
      if (error instanceof Error) {
        throw new CharacterValidationError(
          `Failed to create character: ${error.message}`,
          error
        );
      }
      
      throw new CharacterValidationError(
        `Failed to create character: Unknown error`,
        new Error(String(error))
      );
    }
  }

  /**
   * Create a character safely (returns validation result instead of throwing)
   */
  static async createCharacterSafe(
    characterData: unknown,
    options: CharacterFactoryOptions = {}
  ): Promise<{ success: boolean; character?: ValidatedCharacter; errors?: string[] }> {
    try {
      const character = await this.createCharacter(characterData, options);
      return { success: true, character };
    } catch (error) {
      if (error instanceof CharacterValidationError) {
        return { 
          success: false, 
          errors: error.validationErrors || [error.message]
        };
      }
      return { 
        success: false, 
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Create a character from a template
   */
  static async createFromTemplate(
    templateName: string,
    overrides: Partial<ValidatedCharacter> = {},
    options: CharacterFactoryOptions = {}
  ): Promise<ValidatedCharacter> {
    const template = await this.loadTemplate(templateName);
    const mergedData = this.mergeCharacterData(template, overrides);
    return this.createCharacter(mergedData, options);
  }

  /**
   * Validate an existing character
   */
  static async validateExistingCharacter(
    character: Character,
    options: CharacterFactoryOptions = {}
  ): Promise<{ isValid: boolean; errors?: string[]; warnings?: string[] }> {
    try {
      await this.createCharacter(character, options);
      return { isValid: true };
    } catch (error) {
      if (error instanceof CharacterValidationError) {
        return { 
          isValid: false, 
          errors: error.validationErrors || [error.message]
        };
      }
      return { 
        isValid: false, 
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Apply factory options and defaults
   */
  private static async applyFactoryOptions(
    character: ValidatedCharacter,
    options: CharacterFactoryOptions
  ): Promise<ValidatedCharacter> {
    // Apply default settings if not present
    if (!character.settings) {
      character.settings = {};
    }

    // Merge with default settings
    character.settings = this.deepMerge(
      this.DEFAULT_SETTINGS,
      character.settings
    );

    // Apply environment-specific overrides
    if (options.defaultSettings) {
      character.settings = this.deepMerge(
        character.settings,
        options.defaultSettings
      );
    }

    // Ensure required fields have sensible defaults
    if (!character.plugins) {
      character.plugins = [];
    }

    if (!character.topics || character.topics.length === 0) {
      character.topics = ['general assistance'];
    }

    return character;
  }

  /**
   * Apply environment-specific configurations
   */
  private static applyEnvironmentConfig(
    character: ValidatedCharacter,
    environment?: string
  ): ValidatedCharacter {
    if (!environment) {
      return character;
    }

    const envConfig: Partial<ValidatedCharacter> = {};

    switch (environment) {
      case 'development':
        envConfig.settings = {
          ...character.settings,
          logLevel: 'debug',
          elizaos: {
            ...character.settings?.elizaos,
            realtime: {
              ...character.settings?.elizaos?.realtime,
              logStreaming: true,
            },
          },
        };
        break;

      case 'staging':
        envConfig.settings = {
          ...character.settings,
          logLevel: 'info',
          elizaos: {
            ...character.settings?.elizaos,
            realtime: {
              ...character.settings?.elizaos?.realtime,
              logStreaming: false,
            },
          },
        };
        break;

      case 'production':
        envConfig.settings = {
          ...character.settings,
          logLevel: 'warn',
          elizaos: {
            ...character.settings?.elizaos,
            realtime: {
              ...character.settings?.elizaos?.realtime,
              logStreaming: false,
            },
            encryption: {
              ...character.settings?.elizaos?.encryption,
              autoEncryptSecrets: true,
            },
          },
        };
        break;
    }

    return this.mergeCharacterData(character, envConfig);
  }

  /**
   * Validate plugin dependencies
   */
  private static async validatePluginDependencies(
    character: ValidatedCharacter
  ): Promise<void> {
    if (!character.plugins || character.plugins.length === 0) {
      return; // No plugins to validate
    }

    const errors: string[] = [];

    // Check for required core plugins
    const requiredPlugins = ['@elizaos/plugin-bootstrap'];
    for (const required of requiredPlugins) {
      if (!character.plugins.includes(required)) {
        errors.push(`Required plugin missing: ${required}`);
      }
    }

    // Check plugin order (SQL plugin should be first if present)
    const sqlPluginIndex = character.plugins.findIndex(p => p.includes('plugin-sql'));
    if (sqlPluginIndex > 0) {
      errors.push('SQL plugin should be loaded first for proper database initialization');
    }

    if (errors.length > 0) {
      throw new CharacterValidationError(
        'Plugin dependency validation failed',
        undefined,
        errors
      );
    }
  }

  /**
   * Load a character template
   */
  private static async loadTemplate(templateName: string): Promise<Partial<ValidatedCharacter>> {
    // This would load from a template file or database
    // For now, return a basic template
    const templates: Record<string, Partial<ValidatedCharacter>> = {
      'basic': {
        name: 'Basic Agent',
        bio: ['A basic AI assistant'],
        topics: ['general assistance'],
        plugins: ['@elizaos/plugin-bootstrap'],
      },
      'community-manager': {
        name: 'Community Manager',
        bio: ['A community management specialist'],
        topics: ['community management', 'member engagement'],
        plugins: ['@elizaos/plugin-bootstrap', '@elizaos/plugin-discord'],
      },
      'nubi': {
        name: 'Nubi',
        bio: ['Ancient Guardian of Digital Communities'],
        topics: ['community management', 'ancient wisdom', 'conflict resolution'],
        plugins: ['@elizaos/plugin-sql', '@elizaos/plugin-bootstrap'],
      },
    };

    const template = templates[templateName];
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    return template;
  }

  /**
   * Merge character data
   */
  private static mergeCharacterData(
    base: Partial<ValidatedCharacter>,
    overrides: Partial<ValidatedCharacter>
  ): ValidatedCharacter {
    return this.deepMerge(base, overrides) as ValidatedCharacter;
  }

  /**
   * Deep merge objects
   */
  private static deepMerge<T>(target: T, source: Partial<T>): T {
    const result = { ...target };

    for (const key in source) {
      if (source[key] !== undefined) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(result[key] || {}, source[key] as any);
        } else {
          result[key] = source[key] as any;
        }
      }
    }

    return result;
  }

  /**
   * Get available templates
   */
  static getAvailableTemplates(): string[] {
    return ['basic', 'community-manager', 'nubi'];
  }

  /**
   * Get default settings
   */
  static getDefaultSettings(): typeof this.DEFAULT_SETTINGS {
    return { ...this.DEFAULT_SETTINGS };
  }
}

// Export factory instance and utility functions
export const characterFactory = CharacterFactory;
export default CharacterFactory;
