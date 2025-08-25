/**
 * Templates Index - ElizaOS Standard Structure
 *
 * This file exports all available templates for the ElizaOS project.
 * Templates are organized by category and provide standardized patterns
 * for various types of interactions and functionality.
 */
export * from './elizaos-core-templates';
export * from './runtime-integration-templates';
export * from './database-integration-templates';
export * from './platform-templates';
export * from './discord-templates';
export * from './discord-message-handler.template';
export * from './discord-service.template';
export * from './discord-integration.template';
export * from './use-case-templates';
export * from './nubi-templates';
export * from './template-utils';
export declare const templateCategories: {
    core: {
        messageHandler: string;
        postCreation: string;
        knowledgeIntegration: string;
        entityManagement: string;
        worldContext: string;
        databaseIntegration: string;
        platformIntegration: string;
        errorHandling: string;
        learningAdaptation: string;
    };
    runtime: {
        serviceIntegration: string;
        actionManagement: string;
        providerIntegration: string;
        memorySystem: string;
        modelManagement: string;
        eventSystem: string;
        databaseSystem: string;
        pluginManagement: string;
        stateManagement: string;
    };
    database: {
        adapterInterface: string;
        drizzleOrmIntegration: string;
        configuration: string;
        schemaTables: string;
        connectionManagement: string;
        pluginIntegration: string;
        embeddingDimension: string;
        transactionManagement: string;
        performanceOptimization: string;
        errorHandlingRecovery: string;
    };
    platforms: {
        discord: {
            messageHandler: string;
            service: string;
            integration: string;
            templates: string;
        };
        telegram: string;
        twitter: string;
        web: string;
        api: string;
        file: string;
        multi: string;
    };
    useCases: {
        communityManagement: string;
        contentCreation: string;
        dataAnalysis: string;
        problemSolving: string;
        learningEducation: string;
        creativeWriting: string;
        technicalSupport: string;
        strategicPlanning: string;
    };
    custom: {
        nubi: {
            messageHandler: string;
            postCreation: string;
        };
    };
};
export declare const getTemplate: (category: keyof typeof templateCategories, templateName: string) => null;
export declare const getAvailableTemplates: (category?: keyof typeof templateCategories) => {
    messageHandler: string;
    postCreation: string;
    knowledgeIntegration: string;
    entityManagement: string;
    worldContext: string;
    databaseIntegration: string;
    platformIntegration: string;
    errorHandling: string;
    learningAdaptation: string;
} | {
    serviceIntegration: string;
    actionManagement: string;
    providerIntegration: string;
    memorySystem: string;
    modelManagement: string;
    eventSystem: string;
    databaseSystem: string;
    pluginManagement: string;
    stateManagement: string;
} | {
    adapterInterface: string;
    drizzleOrmIntegration: string;
    configuration: string;
    schemaTables: string;
    connectionManagement: string;
    pluginIntegration: string;
    embeddingDimension: string;
    transactionManagement: string;
    performanceOptimization: string;
    errorHandlingRecovery: string;
} | {
    discord: {
        messageHandler: string;
        service: string;
        integration: string;
        templates: string;
    };
    telegram: string;
    twitter: string;
    web: string;
    api: string;
    file: string;
    multi: string;
} | {
    communityManagement: string;
    contentCreation: string;
    dataAnalysis: string;
    problemSolving: string;
    learningEducation: string;
    creativeWriting: string;
    technicalSupport: string;
    strategicPlanning: string;
} | {
    nubi: {
        messageHandler: string;
        postCreation: string;
    };
} | {
    core: {
        messageHandler: string;
        postCreation: string;
        knowledgeIntegration: string;
        entityManagement: string;
        worldContext: string;
        databaseIntegration: string;
        platformIntegration: string;
        errorHandling: string;
        learningAdaptation: string;
    };
    runtime: {
        serviceIntegration: string;
        actionManagement: string;
        providerIntegration: string;
        memorySystem: string;
        modelManagement: string;
        eventSystem: string;
        databaseSystem: string;
        pluginManagement: string;
        stateManagement: string;
    };
    database: {
        adapterInterface: string;
        drizzleOrmIntegration: string;
        configuration: string;
        schemaTables: string;
        connectionManagement: string;
        pluginIntegration: string;
        embeddingDimension: string;
        transactionManagement: string;
        performanceOptimization: string;
        errorHandlingRecovery: string;
    };
    platforms: {
        discord: {
            messageHandler: string;
            service: string;
            integration: string;
            templates: string;
        };
        telegram: string;
        twitter: string;
        web: string;
        api: string;
        file: string;
        multi: string;
    };
    useCases: {
        communityManagement: string;
        contentCreation: string;
        dataAnalysis: string;
        problemSolving: string;
        learningEducation: string;
        creativeWriting: string;
        technicalSupport: string;
        strategicPlanning: string;
    };
    custom: {
        nubi: {
            messageHandler: string;
            postCreation: string;
        };
    };
};
export declare const validateTemplate: (templateName: string) => boolean;
export declare const getTemplateStats: () => {
    total: number;
    byCategory: Record<string, number>;
};
export declare const searchTemplates: (query: string) => {
    category: string;
    template: string;
    name: string;
}[];
export declare const getRuntimeTemplate: (runtimeComponent: string) => string;
export declare const getCoreRuntimeTemplates: () => {
    serviceIntegration: string;
    actionManagement: string;
    providerIntegration: string;
    memorySystem: string;
    modelManagement: string;
    eventSystem: string;
    databaseSystem: string;
    pluginManagement: string;
    stateManagement: string;
};
export declare const getDatabaseTemplate: (databaseComponent: string) => string;
export declare const getDatabaseIntegrationTemplates: () => {
    adapterInterface: string;
    drizzleOrmIntegration: string;
    configuration: string;
    schemaTables: string;
    connectionManagement: string;
    pluginIntegration: string;
    embeddingDimension: string;
    transactionManagement: string;
    performanceOptimization: string;
    errorHandlingRecovery: string;
};
export default templateCategories;
