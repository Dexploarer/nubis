# Advanced Templates (Agent Hub)

This folder contains advanced, production-ready templates aligned with `src/agent-hub/config/environment.ts`.
Each template exposes factories with rich options so you can wire in environment-driven behavior without editing internals.

## Template Categories

### Character Templates
- **`character/advanced-character.template.ts`** - Configurable character builder with MCP support

### Action Templates
- **`actions/raidActions.template.ts`** - Raid coordination and management actions
- **`actions/moderationActions.template.ts`** - Content moderation and community safety actions
- **`actions/memoryActions.template.ts`** - Memory persistence and retrieval actions
- **`actions/socialActions.template.ts`** - Social media engagement and cross-platform actions
- **`actions/communityActions.template.ts`** - Community management and member interaction actions

### Service Templates
- **`services/heartbeat.service.template.ts`** - Health monitoring and scheduled task service
- **`services/sessions.service.template.ts`** - User session management service
- **`services/analytics.service.template.ts`** - Data analytics and tracking service
- **`services/community.service.template.ts`** - Community management and moderation service

### Evaluator Templates
- **`evaluators/engagement.evaluator.template.ts`** - Content engagement assessment
- **`evaluators/sentiment.evaluator.template.ts`** - Sentiment analysis and mood detection
- **`evaluators/toxicity.evaluator.template.ts`** - Toxic content detection and filtering
- **`evaluators/community.evaluator.template.ts`** - Community health and well-being assessment

### Plugin Templates
- **`plugin/advanced-plugin.template.ts`** - Advanced plugin development template

### Memory Templates
- **`memory/memory-helpers.template.ts`** - Basic memory management utilities
- **`memory/community-memory.template.ts`** - Advanced community memory system with categorization
- **`memory/elizaos-memory.template.ts`** - **NEW**: Full elizaOS memory system integration with embedding search
- **`memory/entity-manager.template.ts`** - **NEW**: Entity resolution and relationship management
- **`memory/knowledge-manager.template.ts`** - **NEW**: RAG system with document chunking and retrieval

### Prompt Templates
- **`prompt/prompt-utils.template.ts`** - Basic prompt utility functions
- **`prompt/community-prompts.template.ts`** - Community interaction prompt templates with tone control

### Utility Templates
- **`utils/validation-logging.template.ts`** - Input validation and logging utilities
- **`config/feature-flags.template.ts`** - Feature flag system for toggling behaviors

### Core Templates
- **`template-builder.template.ts`** - Unified template builder for creating complete agents
- **`example-config.template.ts`** - Example configurations and usage patterns

## Quick Start

### Import Templates
```typescript
import * as TPL from '@/agent-hub/templates';
// or use relative path
import * as TPL from './templates';
```

### Build Complete Agent
```typescript
import { buildTemplates } from './templates';

const agent = buildTemplates({
  character: {
    name: 'My Community Bot',
    bio: ['AI community manager'],
    plugins: ['@elizaos/plugin-sql', '@elizaos/plugin-openai'],
  },
  actions: {
    community: {
      enabled: true,
      maxMembers: 5000,
      autoWelcome: true,
      moderationLevel: 'medium',
    },
    social: {
      enabled: true,
      platforms: { twitter: true, discord: true },
      autoResponse: true,
    },
  },
  services: {
    community: {
      enabled: true,
      autoModeration: true,
      welcomeMessages: true,
    },
  },
});
```

### Use Individual Builders
```typescript
import { TemplateBuilder } from './templates';

// Build specific components
const character = TemplateBuilder.character({ name: 'Custom Bot' });
const actions = TemplateBuilder.actions({ community: { enabled: true } });
const evaluators = TemplateBuilder.evaluators({ community: { enabled: true } });
const memory = TemplateBuilder.memory({ enabled: true });
const prompts = TemplateBuilder.prompts({ tone: 'friendly' });
```

### Create Services
```typescript
import { ServiceFactories } from './templates';

const runtime = {}; // Your agent runtime
const services = {
  heartbeat: ServiceFactories.heartbeat(runtime, { intervalMs: 30000 }),
  community: ServiceFactories.community(runtime, { maxMembers: 1000 }),
  analytics: ServiceFactories.analytics(runtime, { trackingEnabled: true }),
};
```

### Create elizaOS Memory Systems
```typescript
import { MemoryFactories } from './templates';

const runtime = {}; // Your agent runtime

// Core elizaOS memory system
const elizaosMemory = MemoryFactories.elizaosMemory(runtime, {
  enabled: true,
  tableNames: {
    messages: 'messages',
    facts: 'facts',
    entities: 'entities',
    knowledge: 'knowledge',
  },
  embeddingConfig: {
    chunkSize: 512,
    overlap: 20,
    maxTokens: 4000,
  },
  retentionConfig: {
    messages: 30,
    facts: 90,
    entities: 365,
    knowledge: 730,
  },
});

// Entity management system
const entityManager = MemoryFactories.entityManager(runtime, {
  enabled: true,
  autoResolution: true,
  relationshipTracking: true,
  entityCache: {
    enabled: true,
    maxSize: 1000,
    ttl: 3600,
  },
});

// Knowledge management system
const knowledgeManager = MemoryFactories.knowledgeManager(runtime, {
  enabled: true,
  chunkingConfig: {
    chunkSize: 512,
    overlap: 20,
    batchSize: 10,
  },
  searchConfig: {
    useEmbeddings: true,
    useKeywords: true,
    rerankingEnabled: true,
  },
});
```

## Configuration Options

### Feature Flags
Control which features are enabled across your entire agent:
```typescript
const flags = {
  raids: true,
  moderation: true,
  memory: true,
  social: true,
  community: true,
  engagementEval: true,
  sentimentEval: true,
  toxicityEval: true,
};
```

### Action Configuration
Fine-tune action behavior:
```typescript
const actions = {
  raids: {
    enabled: true,
    intervalHours: 6,
    maxConcurrent: 3,
    minParticipants: 5,
    points: { like: 1, retweet: 2, comment: 3, join: 5 },
  },
  community: {
    enabled: true,
    maxMembers: 10000,
    autoWelcome: true,
    moderationLevel: 'medium', // 'low' | 'medium' | 'high'
  },
  social: {
    enabled: true,
    platforms: { twitter: true, discord: true, telegram: true },
    autoResponse: true,
    engagementThreshold: 0.7,
  },
};
```

### Service Configuration
Configure service behavior:
```typescript
const services = {
  heartbeat: {
    enabled: true,
    intervalMs: 30000,
    label: 'community-hb',
  },
  community: {
    enabled: true,
    maxMembers: 10000,
    autoModeration: true,
    welcomeMessages: true,
    analytics: true,
  },
  analytics: {
    enabled: true,
    trackingEnabled: true,
    retentionDays: 90,
  },
};
```

### Evaluator Configuration
Customize evaluation metrics and thresholds:
```typescript
const evaluators = {
  community: {
    enabled: true,
    metrics: {
      engagementThreshold: 0.7,
      activityThreshold: 0.6,
      growthThreshold: 0.1,
      toxicityThreshold: 0.3,
    },
    weights: {
      engagement: 0.3,
      activity: 0.25,
      growth: 0.2,
      toxicity: 0.15,
      moderation: 0.1,
    },
  },
};
```

### Memory Configuration
Configure memory retention and categorization:
```typescript
const memory = {
  community: {
    enabled: true,
    retentionDays: 90,
    maxEntries: 50000,
    categories: ['members', 'content', 'moderation', 'events', 'analytics'],
  },
  // elizaOS memory system configuration
  elizaos: {
    enabled: true,
    tableNames: {
      messages: 'messages',
      facts: 'facts',
      entities: 'entities',
      knowledge: 'knowledge',
    },
    embeddingConfig: {
      chunkSize: 512,
      overlap: 20,
      maxTokens: 4000,
    },
    retentionConfig: {
      messages: 30,
      facts: 90,
      entities: 365,
      knowledge: 730,
    },
    searchConfig: {
      defaultCount: 10,
      similarityThreshold: 0.7,
      maxResults: 100,
    },
  },
  // Entity management configuration
  entities: {
    enabled: true,
    autoResolution: true,
    relationshipTracking: true,
    entityCache: {
      enabled: true,
      maxSize: 1000,
      ttl: 3600,
    },
    resolutionConfig: {
      confidenceThreshold: 0.7,
      maxCandidates: 5,
      useLLM: true,
      fallbackToFuzzy: true,
    },
  },
  // Knowledge management configuration
  knowledge: {
    enabled: true,
    chunkingConfig: {
      chunkSize: 512,
      overlap: 20,
      maxTokens: 4000,
      batchSize: 10,
    },
    indexingConfig: {
      autoIndex: true,
      indexOnUpdate: true,
      similarityThreshold: 0.7,
      maxResults: 50,
    },
    searchConfig: {
      useEmbeddings: true,
      useKeywords: true,
      useProximity: true,
      rerankingEnabled: true,
      maxSearchResults: 100,
    },
  },
};
```

### Prompt Configuration
Customize prompt tone and style:
```typescript
const prompts = {
  community: {
    tone: 'friendly', // 'formal' | 'casual' | 'friendly' | 'authoritative'
    language: 'en', // 'en' | 'es' | 'fr' | 'de'
    includeEmojis: true,
    maxLength: 500,
  },
};
```

## Advanced Usage

### elizaOS Memory System Integration
```typescript
import { MemoryFactories } from './templates';

const runtime = {}; // Your agent runtime

// Create elizaOS memory system
const elizaosMemory = MemoryFactories.elizaosMemory(runtime, {
  enabled: true,
  tableNames: {
    messages: 'messages',
    facts: 'facts',
    entities: 'entities',
    knowledge: 'knowledge',
  },
});

// Use elizaOS memory operations
const recentMemories = await elizaosMemory.getMemories({
  tableName: 'messages',
  roomId: 'room123',
  count: 10,
});

const searchResults = await elizaosMemory.searchMemories({
  tableName: 'facts',
  query: 'community guidelines',
  count: 5,
});

const contextualMemories = await elizaosMemory.getContextualMemories(message, 10);
```

### Entity Management
```typescript
import { MemoryFactories } from './templates';

const entityManager = MemoryFactories.entityManager(runtime, {
  enabled: true,
  autoResolution: true,
  relationshipTracking: true,
});

// Resolve entity references
const entity = await entityManager.resolveEntity(message, state);

// Get entity profiles
const profile = await entityManager.getEntityProfile(entityId);

// Manage relationships
await entityManager.addRelationship(
  sourceEntityId,
  targetEntityId,
  'friend',
  { strength: 0.8 }
);

// Get entity statistics
const stats = await entityManager.getEntityStats(entityId);
```

### Knowledge Management
```typescript
import { MemoryFactories } from './templates';

const knowledgeManager = MemoryFactories.knowledgeManager(runtime, {
  enabled: true,
  chunkingConfig: { chunkSize: 512, overlap: 20 },
  searchConfig: { useEmbeddings: true, rerankingEnabled: true },
});

// Process documents
const documentId = await knowledgeManager.processDocument({
  title: 'Community Guidelines',
  content: 'Long document content...',
  source: 'community-team',
  category: 'policies',
  tags: ['guidelines', 'community'],
  importance: 'high',
});

// Search knowledge base
const searchResults = await knowledgeManager.searchKnowledge({
  query: 'community rules',
  category: 'policies',
  tags: ['guidelines'],
  maxResults: 10,
});

// Get knowledge statistics
const stats = await knowledgeManager.getKnowledgeStats();
```

### Custom Memory Operations
```typescript
import { communityMemory } from './templates';

// Store different types of memory
const memberId = communityMemory.storeMember(
  { name: 'Alice', role: 'moderator' },
  ['moderator', 'active'],
  'high'
);

const contentId = communityMemory.storeContent(
  { text: 'Welcome message', type: 'welcome' },
  ['welcome', 'automated'],
  'medium'
);

// Retrieve and search memory
const recentMembers = communityMemory.retrieve({
  type: 'member',
  limit: 10,
});

const moderationActions = communityMemory.search('violation', {
  type: 'moderation',
  priority: 'high',
});
```

### Custom Prompt Generation
```typescript
import { buildCommunityPrompts } from './templates';

const prompts = buildCommunityPrompts({
  tone: 'authoritative',
  includeEmojis: false,
  maxLength: 300,
});

// Generate prompts with state
const welcomeMessage = prompts.welcome({ 
  state: { memberName: 'Bob', communityName: 'Tech Hub' } 
});

const moderationNotice = prompts.moderation({ 
  state: { action: 'warned', reason: 'spam', memberName: 'user123' } 
});
```

### Service Event Handling
```typescript
import { CommunityService } from './templates';

const communityService = new CommunityService(runtime, {
  enabled: true,
  maxMembers: 5000,
  autoModeration: true,
  welcomeMessages: true,
  hooks: {
    onMemberJoin: async (memberId, memberData) => {
      console.log(`New member joined: ${memberId}`);
      // Send welcome message, assign role, etc.
    },
    onModerationAction: async (action, targetId, reason) => {
      console.log(`Moderation: ${action} on ${targetId} - ${reason}`);
      // Log action, notify moderators, etc.
    },
  },
});
```

## Template Architecture

### Factory Pattern
All templates use a factory pattern that accepts configuration objects and returns configured instances. This allows for:
- Environment-driven configuration
- Runtime customization
- Feature toggling
- A/B testing capabilities

### Type Safety
Full TypeScript support with:
- Strict typing for all configuration options
- Compile-time validation
- IntelliSense support
- Type inference for return values

### Modular Design
Templates are designed to be:
- Independently usable
- Composable
- Extensible
- Testable

### Performance Optimized
- Lazy loading of services
- Configurable retention policies
- Efficient memory management
- Scalable architecture

### elizaOS Integration
The templates provide seamless integration with elizaOS core systems:
- **Memory System**: Full integration with elizaOS embedding-based similarity search
- **Entity Resolution**: LLM-powered entity resolution with fallback strategies
- **Knowledge Management**: RAG system with document chunking and vector search
- **Runtime Compatibility**: Direct integration with IAgentRuntime methods

## Examples

See `example-config.template.ts` for comprehensive examples of:
- Full-featured agent configuration
- Minimal community bot setup
- Social media focused agent
- Custom template usage patterns
- Service factory usage
- Memory and prompt configuration
- elizaOS memory system integration

## Integration with elizaOS

These templates are fully compatible with elizaOS and extend its capabilities by providing:
- Advanced community management features
- Sophisticated content moderation
- Multi-platform social media support
- Comprehensive analytics and evaluation
- Flexible prompt generation
- Persistent memory systems
- **Full elizaOS memory system integration**
- **Entity resolution and relationship tracking**
- **RAG-based knowledge management**

The templates follow elizaOS patterns and integrate seamlessly with the core framework while adding production-ready functionality for complex community management scenarios. The new elizaOS memory systems provide:

- **Vector similarity search** using elizaOS embeddings
- **Entity resolution** with LLM-powered disambiguation
- **Knowledge chunking** and retrieval-augmented generation
- **Secure data management** with encryption support
- **Performance optimization** with caching and batch processing
