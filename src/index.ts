// Character System
export { CharacterFactory, characterFactory } from './factories/character.factory';
export { CharacterValidator, characterValidator } from './__tests__/infrastructure/character.validator';
export { getValidatedCharacters, getValidatedCharacter, getCharacterValidationSummary } from './characters';

// Service Architecture
export { ServiceBuilder, ServiceRegistryBuilder, ServiceBuilderUtils } from './builders/service.builder';
export { OptimizedService } from './services/base/optimized-service';

// Schemas
export * from './schemas/character.schema';

// Community Management System
export { 
  communityManagementTemplates, 
  getCommunityTemplate, 
  getAllCommunityTemplates, 
  getTemplatesByFeatures 
} from './templates/community-management.templates';
export { CommunityMemoryService } from './services/memory/community-memory.service';
export { CommunityManagementService } from './services/community/community-management.service';

// Export all character types
export type { 
  CommunityManagementTemplate,
  CommunityMemoryConfig,
  CommunityManagementConfig,
  CommunityMember,
  ModerationAction,
  CommunityGuideline,
  CommunityHealthMetrics,
  MemoryMetrics,
  CommunityInsight
} from './services/memory/community-memory.service';

// Legacy exports for backward compatibility
export { characters } from './characters';
export { getExampleAgent } from './characters/example-agent';
export { getCommunityManager } from './characters/community-manager';
export { nubiCharacter } from './characters/nubi';

export { agentUtils } from './plugins/agent-utils';

// Import classes for utility functions (moved here to resolve circular dependency)
import { CharacterFactory } from './factories/character.factory';
import { CharacterValidator } from './__tests__/infrastructure/character.validator';
import { ServiceBuilderUtils } from './builders/service.builder';
import { CommunityMemoryService } from './services/memory/community-memory.service';
import { CommunityManagementService } from './services/community/community-management.service';
import { getExampleAgent } from './characters/example-agent';

// Export default character for tests
export const character = () => getExampleAgent();

export const elizaosUtils = {
  // Character utilities
  createCharacter: CharacterFactory.createCharacter,
  createCharacterSafe: CharacterFactory.createCharacterSafe,
  createFromTemplate: CharacterFactory.createFromTemplate,
  validateExistingCharacter: CharacterFactory.validateExistingCharacter,
  getAvailableTemplates: CharacterFactory.getAvailableTemplates,
  getDefaultSettings: CharacterFactory.getDefaultSettings,
  
  // Validation utilities
  validateCharacter: CharacterValidator.validateCharacter,
  getValidationSummary: CharacterValidator.getValidationSummary,
  validateCharacters: CharacterValidator.validateCharacters,
  
  // Service utilities
  createService: ServiceBuilderUtils.create,
  createHighPriorityService: ServiceBuilderUtils.createHighPriority,
  createLowPriorityService: ServiceBuilderUtils.createLowPriority,
  
  // Community management utilities
  createCommunityMemoryService: (runtime: any, config?: any) => new CommunityMemoryService(runtime, config),
  createCommunityManagementService: (runtime: any, config?: any) => new CommunityManagementService(runtime, config),
  
  // Template utilities
  getCommunityTemplates: () => import('./templates/community-management.templates').then(m => m.getAllCommunityTemplates()),
  getCommunityTemplate: (id: string) => import('./templates/community-management.templates').then(m => m.getCommunityTemplate(id)),
  
  // Memory utilities
  createMemory: async (runtime: any, content: string, metadata: any) => {
    const memoryService = new CommunityMemoryService(runtime);
    return await memoryService.createCommunityMemory(content, metadata);
  },
  
  searchMemories: async (runtime: any, query: string, options?: any) => {
    const memoryService = new CommunityMemoryService(runtime);
    return await memoryService.searchCommunityMemories(query, options);
  },
  
  getCommunityInsights: async (runtime: any, roomId?: any, timeframe?: number) => {
    const memoryService = new CommunityMemoryService(runtime);
    return await memoryService.getCommunityInsights(roomId, timeframe);
  }
};

export default elizaosUtils;
