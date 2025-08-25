// Main ElizaOS Project Entry Point
// Exports all upgraded architecture components

// Core character system
export { 
  characters,
  getValidatedCharacters,
  getValidatedCharacter,
  getCharacterValidationSummary,
} from './characters';

// Character factory and validation
export { 
  CharacterFactory,
  CharacterValidationError,
  characterFactory,
} from './factories/character.factory';

export {
  CharacterValidator,
  characterValidator,
} from './testing/character.validator';

// Service architecture
export {
  ServiceBuilder,
  ServiceRegistryBuilder,
  ServiceBuilderUtils,
  type ServiceDefinition,
  type ServiceConfig,
  type ServiceLifecycle,
  type ServiceDependency,
} from './builders/service.builder';

export {
  OptimizedService,
  type ServiceMetrics,
  type ServiceHealth,
  type OptimizedServiceConfig,
} from './services/base/optimized-service';

// Schema validation
export {
  CharacterSchema,
  SettingsSchema,
  StyleSchema,
  SecretsSchema,
  TemplateSchema,
  validateCharacter,
  validateCharacterSafe,
  type ValidatedCharacter,
  type CharacterSettings,
  type CharacterStyle,
  type CharacterSecrets,
} from './schemas/character.schema';

// Legacy plugin exports (for backward compatibility)
export { agentUtils } from './plugins/agent-utils';

// Import classes for utility functions
import { CharacterFactory } from './factories/character.factory';
import { CharacterValidator } from './testing/character.validator';
import { ServiceBuilderUtils } from './builders/service.builder';

// Utility functions
export const elizaosUtils = {
  // Character utilities
  createCharacter: CharacterFactory.createCharacter,
  createCharacterSafe: CharacterFactory.createCharacterSafe,
  createFromTemplate: CharacterFactory.createFromTemplate,
  validateCharacter: CharacterValidator.validateCharacter,
  validateCharacters: CharacterValidator.validateCharacters,
  
  // Service utilities
  createService: ServiceBuilderUtils.create,
  createHighPriorityService: ServiceBuilderUtils.createHighPriority,
  createLowPriorityService: ServiceBuilderUtils.createLowPriority,
  
  // Validation utilities
  getValidationSummary: CharacterValidator.getValidationSummary,
  
  // Factory utilities
  getAvailableTemplates: CharacterFactory.getAvailableTemplates,
  getDefaultSettings: CharacterFactory.getDefaultSettings,
};

// Default export for convenience
export default elizaosUtils;
