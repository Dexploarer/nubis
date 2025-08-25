/**
 * Templates Index - ElizaOS Standard Structure
 * 
 * This file exports all available templates for the ElizaOS project.
 * Templates are organized by category and provide standardized patterns
 * for various types of interactions and functionality.
 */

// Core ElizaOS Templates
export * from './elizaos-core-templates';

// Runtime Integration Templates (Core Runtime Components)
export * from './runtime-integration-templates';

// Database Integration Templates (Complete Database Layer)
export * from './database-integration-templates';

// Platform-Specific Templates
export * from './platform-templates';

// Use Case Templates
export * from './use-case-templates';

// Nubi-Specific Templates (Custom)
export * from './nubi-templates';

// Template Utilities
export * from './template-utils';

// Template Categories for Easy Access
export const templateCategories = {
  // Core functionality templates
  core: {
    messageHandler: 'standardMessageHandlerTemplate',
    postCreation: 'standardPostCreationTemplate',
    knowledgeIntegration: 'knowledgeIntegrationTemplate',
    entityManagement: 'entityManagementTemplate',
    worldContext: 'worldContextTemplate',
    databaseIntegration: 'databaseIntegrationTemplate',
    platformIntegration: 'platformIntegrationTemplate',
    errorHandling: 'errorHandlingTemplate',
    learningAdaptation: 'learningAdaptationTemplate'
  },
  
  // Runtime integration templates (Core Runtime Components)
  runtime: {
    serviceIntegration: 'runtimeServiceIntegrationTemplate',
    actionManagement: 'runtimeActionManagementTemplate',
    providerIntegration: 'runtimeProviderIntegrationTemplate',
    memorySystem: 'runtimeMemorySystemTemplate',
    modelManagement: 'runtimeModelManagementTemplate',
    eventSystem: 'runtimeEventSystemTemplate',
    databaseSystem: 'runtimeDatabaseIntegrationTemplate',
    pluginManagement: 'runtimePluginManagementTemplate',
    stateManagement: 'runtimeStateManagementTemplate'
  },
  
  // Database integration templates (Complete Database Layer)
  database: {
    adapterInterface: 'databaseAdapterInterfaceTemplate',
    drizzleOrmIntegration: 'drizzleOrmIntegrationTemplate',
    configuration: 'databaseConfigurationTemplate',
    schemaTables: 'databaseSchemaTablesTemplate',
    connectionManagement: 'databaseConnectionManagementTemplate',
    pluginIntegration: 'databasePluginIntegrationTemplate',
    embeddingDimension: 'databaseEmbeddingDimensionTemplate',
    transactionManagement: 'databaseTransactionManagementTemplate',
    performanceOptimization: 'databasePerformanceOptimizationTemplate',
    errorHandlingRecovery: 'databaseErrorHandlingRecoveryTemplate'
  },
  
  // Platform-specific templates
  platforms: {
    discord: 'discordPlatformTemplate',
    telegram: 'telegramPlatformTemplate',
    twitter: 'twitterPlatformTemplate',
    web: 'webPlatformTemplate',
    api: 'apiIntegrationTemplate',
    file: 'fileManagementTemplate',
    multi: 'multiPlatformTemplate'
  },
  
  // Use case templates
  useCases: {
    communityManagement: 'communityManagementTemplate',
    contentCreation: 'contentCreationTemplate',
    dataAnalysis: 'dataAnalysisTemplate',
    problemSolving: 'problemSolvingTemplate',
    learningEducation: 'learningEducationTemplate',
    creativeWriting: 'creativeWritingTemplate',
    technicalSupport: 'technicalSupportTemplate',
    strategicPlanning: 'strategicPlanningTemplate'
  },
  
  // Custom character templates
  custom: {
    nubi: {
      messageHandler: 'customMessageHandlerTemplate',
      postCreation: 'customPostCreationTemplate'
    }
  }
};

// Template Selection Helper Functions
export const getTemplate = (category: keyof typeof templateCategories, templateName: string) => {
  const categoryTemplates = templateCategories[category];
  if (categoryTemplates && templateName in categoryTemplates) {
    return categoryTemplates[templateName as keyof typeof categoryTemplates];
  }
  return null;
};

export const getAvailableTemplates = (category?: keyof typeof templateCategories) => {
  if (category) {
    return templateCategories[category];
  }
  return templateCategories;
};

export const validateTemplate = (templateName: string) => {
  for (const category of Object.values(templateCategories)) {
    if (typeof category === 'object' && templateName in category) {
      return true;
    }
  }
  return false;
};

// Template Statistics
export const getTemplateStats = () => {
  const stats = {
    total: 0,
    byCategory: {} as Record<string, number>
  };
  
  Object.entries(templateCategories).forEach(([category, templates]) => {
    if (typeof templates === 'object') {
      const count = Object.keys(templates).length;
      stats.byCategory[category] = count;
      stats.total += count;
    }
  });
  
  return stats;
};

// Template Search
export const searchTemplates = (query: string) => {
  const results: Array<{ category: string; template: string; name: string }> = [];
  
  Object.entries(templateCategories).forEach(([category, templates]) => {
    if (typeof templates === 'object') {
      Object.entries(templates).forEach(([name, template]) => {
        if (name.toLowerCase().includes(query.toLowerCase()) || 
            template.toLowerCase().includes(query.toLowerCase())) {
          results.push({ category, template, name });
        }
      });
    }
  });
  
  return results;
};

// Runtime-specific template helpers
export const getRuntimeTemplate = (runtimeComponent: string) => {
  return templateCategories.runtime[runtimeComponent as keyof typeof templateCategories.runtime];
};

export const getCoreRuntimeTemplates = () => {
  return templateCategories.runtime;
};

// Database-specific template helpers
export const getDatabaseTemplate = (databaseComponent: string) => {
  return templateCategories.database[databaseComponent as keyof typeof templateCategories.database];
};

export const getDatabaseIntegrationTemplates = () => {
  return templateCategories.database;
};

// Default export for the main templates object
export default templateCategories;
