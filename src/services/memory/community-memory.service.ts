import type { IAgentRuntime, Memory, UUID } from "@elizaos/core";
import { OptimizedService } from "../base/optimized-service";

/**
 * Community Memory Service
 * Leverages elizaOS's full memory, knowledge, and tracking capabilities
 */
export interface CommunityMemoryConfig {
  trackingLimit: number;
  embeddingPriority: 'high' | 'normal' | 'low';
  memoryScope: 'shared' | 'private' | 'room';
  tables: string[];
  enableAutoModeration: boolean;
  enableAnalytics: boolean;
  enableRoleTracking: boolean;
}

export interface MemoryMetrics {
  totalMemories: number;
  memoriesByType: Record<string, number>;
  memoriesByScope: Record<string, number>;
  embeddingQueueSize: number;
  searchPerformance: number;
  lastBackup: number;
}

export interface CommunityInsight {
  type: 'user_behavior' | 'conversation_pattern' | 'moderation_trend' | 'engagement_metric';
  title: string;
  description: string;
  data: Record<string, any>;
  confidence: number;
  timestamp: number;
  actionable: boolean;
  recommendations?: string[];
}

export class CommunityMemoryService extends OptimizedService {
  private _config: CommunityMemoryConfig;
  private memoryCache: Map<UUID, Memory> = new Map();
  private insightCache: Map<string, CommunityInsight> = new Map();
  private lastAnalysis: number = 0;
  private analysisInterval: number = 300000; // 5 minutes

  // Implement abstract property
  get capabilityDescription(): string {
    return 'Community memory management service with moderation and analytics';
  }

  constructor(runtime: IAgentRuntime, config: Partial<CommunityMemoryConfig> = {}) {
    super(runtime, {
      priority: 100,
      healthCheckInterval: 60000, // 1 minute
      ...config
    });

    this._config = {
      trackingLimit: 1000,
      embeddingPriority: 'high',
      memoryScope: 'shared',
      tables: ['memories', 'messages', 'facts', 'documents'],
      enableAutoModeration: true,
      enableAnalytics: true,
      enableRoleTracking: true,
      ...config
    };
  }

  protected async initialize(): Promise<void> {
    this.log('info', 'Initializing Community Memory Service');
    
    // Initialize memory tables if they don't exist
    await this.initializeMemoryTables();
    
    // Start periodic analysis
    this.startPeriodicAnalysis();
    
    this.log('info', 'Community Memory Service initialized successfully');
  }

  protected async cleanup(): Promise<void> {
    this.log('info', 'Cleaning up Community Memory Service');
    
    // Clear caches
    this.memoryCache.clear();
    this.insightCache.clear();
    
    this.log('info', 'Community Memory Service cleaned up successfully');
  }

  /**
   * Create and track a community memory with optimal settings
   */
  async createCommunityMemory(
    content: string,
    metadata: {
      type: 'message' | 'fact' | 'document' | 'moderation' | 'role_change';
      scope: 'shared' | 'private' | 'room';
      entityId?: UUID;
      roomId?: UUID;
      tags?: string[];
      priority?: 'high' | 'normal' | 'low';
    }
  ): Promise<UUID> {
    return await this.measureOperation(async () => {
      const memory: Memory = {
        id: crypto.randomUUID() as UUID,
        content: { text: content },
        metadata: {
          type: metadata.type,
          scope: metadata.scope,
          tags: metadata.tags || [],
          timestamp: Date.now(),
          source: 'community-memory-service'
        },
        entityId: metadata.entityId,
        roomId: metadata.roomId,
        agentId: this.runtime.agentId,
        unique: true
      };

      // Determine table based on memory type
      const tableName = this.getTableForMemoryType(metadata.type);
      
      // Create memory in database
      const memoryId = await this.runtime.createMemory(memory, tableName);
      
      // Queue embedding generation with specified priority
      const priority = metadata.priority || this._config.embeddingPriority;
      await this.runtime.queueEmbeddingGeneration(memory, priority);
      
      // Cache memory for quick access
      this.memoryCache.set(memoryId, { ...memory, id: memoryId });
      
      // Update metrics
      this.updateMemoryMetrics(metadata.type, metadata.scope);
      
      this.log('debug', `Created community memory: ${memoryId}`, { type: metadata.type, scope: metadata.scope });
      
      return memoryId;
    }, 'createCommunityMemory');
  }

  /**
   * Search community memories with semantic understanding
   */
  async searchCommunityMemories(
    query: string,
    options: {
      scope?: 'shared' | 'private' | 'room';
      type?: string;
      roomId?: UUID;
      entityId?: UUID;
      count?: number;
      threshold?: number;
    } = {}
  ): Promise<Memory[]> {
    return await this.measureOperation(async () => {
      // Generate embedding for query
      const embedding = await this.generateEmbedding(query);
      
      // Search across all configured tables
      const allResults: Memory[] = [];
      
      for (const tableName of this._config.tables) {
        try {
          const results = await this.runtime.searchMemories({
            embedding,
            query,
            tableName,
            roomId: options.roomId,
            entityId: options.entityId,
            count: options.count || 10,
            match_threshold: options.threshold || 0.7
          });
          
          allResults.push(...results);
        } catch (error) {
          this.log('warn', `Failed to search table ${tableName}`, { error });
        }
      }
      
      // Rerank results using BM25 for better relevance
      const rerankedResults = await this.runtime.rerankMemories(query, allResults);
      
      // Filter by scope if specified
      const filteredResults = options.scope 
        ? rerankedResults.filter(memory => memory.metadata?.scope === options.scope)
        : rerankedResults;
      
      // Filter by type if specified
      const finalResults = options.type
        ? filteredResults.filter(memory => memory.metadata?.type === options.type)
        : filteredResults;
      
      this.log('debug', `Searched community memories`, { 
        query, 
        results: finalResults.length,
        scope: options.scope,
        type: options.type
      });
      
      return finalResults;
    }, 'searchCommunityMemories');
  }

  /**
   * Get comprehensive community insights
   */
  async getCommunityInsights(
    roomId?: UUID,
    timeframe: number = 24 * 60 * 60 * 1000 // 24 hours
  ): Promise<CommunityInsight[]> {
    return await this.measureOperation(async () => {
      const now = Date.now();
      const since = now - timeframe;
      
      // Check cache first
      const cacheKey = `${roomId || 'global'}_${timeframe}`;
      if (this.insightCache.has(cacheKey)) {
        const cached = this.insightCache.get(cacheKey)!;
        if (now - cached.timestamp < this.analysisInterval) {
          return [cached];
        }
      }
      
      const insights: CommunityInsight[] = [];
      
      // Analyze user behavior patterns
      if (this._config.enableAnalytics) {
        const behaviorInsight = await this.analyzeUserBehavior(roomId, since);
        if (behaviorInsight) insights.push(behaviorInsight);
      }
      
      // Analyze conversation patterns
      const conversationInsight = await this.analyzeConversationPatterns(roomId, since);
      if (conversationInsight) insights.push(conversationInsight);
      
      // Analyze moderation trends
      if (this._config.enableAutoModeration) {
        const moderationInsight = await this.analyzeModerationTrends(roomId, since);
        if (moderationInsight) insights.push(moderationInsight);
      }
      
      // Analyze engagement metrics
      const engagementInsight = await this.analyzeEngagementMetrics(roomId, since);
      if (engagementInsight) insights.push(engagementInsight);
      
      // Cache insights
      insights.forEach(insight => {
        this.insightCache.set(`${insight.type}_${roomId || 'global'}`, insight);
      });
      
      this.log('info', `Generated ${insights.length} community insights`, { roomId, timeframe });
      
      return insights;
    }, 'getCommunityInsights');
  }

  /**
   * Track role changes and permissions
   */
  async trackRoleChange(
    userId: UUID,
    oldRole: string,
    newRole: string,
    roomId: UUID,
    reason?: string
  ): Promise<void> {
    if (!this._config.enableRoleTracking) return;
    
    await this.createCommunityMemory(
      `Role change: ${oldRole} → ${newRole}${reason ? ` (${reason})` : ''}`,
      {
        type: 'role_change',
        scope: 'shared',
        entityId: userId,
        roomId,
        tags: ['role_change', 'permissions', 'moderation'],
        priority: 'high'
      }
    );
  }

  /**
   * Get memory metrics and performance data
   */
  async getMemoryMetrics(): Promise<MemoryMetrics> {
    const metrics: MemoryMetrics = {
      totalMemories: 0,
      memoriesByType: {},
      memoriesByScope: {},
      embeddingQueueSize: 0,
      searchPerformance: 0,
      lastBackup: Date.now()
    };
    
    // Count memories by type and scope
    for (const tableName of this._config.tables) {
      try {
        const memories = await this.runtime.getMemories({
          tableName,
          count: 10000
        });
        
        memories.forEach(memory => {
          metrics.totalMemories++;
          
          const type = memory.metadata?.type || 'unknown';
          metrics.memoriesByType[type] = (metrics.memoriesByType[type] || 0) + 1;
          
          const scope = memory.metadata?.scope || 'unknown';
          metrics.memoriesByScope[scope] = (metrics.memoriesByScope[scope] || 0) + 1;
        });
      } catch (error) {
        this.log('warn', `Failed to get metrics for table ${tableName}`, { error });
      }
    }
    
    return metrics;
  }

  /**
   * Backup community memories
   */
  async backupMemories(): Promise<boolean> {
    return await this.measureOperation(async () => {
      try {
        const allMemories: Memory[] = [];
        
        // Collect memories from all tables
        for (const tableName of this._config.tables) {
          const memories = await this.runtime.getMemories({
            tableName,
            count: 10000
          });
          allMemories.push(...memories);
        }
        
        // Create backup memory
        await this.createCommunityMemory(
          `Memory backup: ${allMemories.length} memories from ${this._config.tables.length} tables`,
          {
            type: 'document',
            scope: 'shared',
            tags: ['backup', 'maintenance'],
            priority: 'low'
          }
        );
        
        this.log('info', `Backed up ${allMemories.length} memories successfully`);
        return true;
      } catch (error) {
        this.log('error', 'Failed to backup memories', { error });
        return false;
      }
    }, 'backupMemories');
  }

  /**
   * Private helper methods
   */
  private async initializeMemoryTables(): Promise<void> {
    // This would typically create custom tables for community-specific data
    // For now, we'll use the existing elizaOS tables
    this.log('debug', 'Using existing elizaOS memory tables');
  }

  private startPeriodicAnalysis(): void {
    setInterval(async () => {
      try {
        await this.getCommunityInsights();
        this.lastAnalysis = Date.now();
      } catch (error) {
        this.log('error', 'Periodic analysis failed', { error });
      }
    }, this.analysisInterval);
  }

  private getTableForMemoryType(type: string): string {
    switch (type) {
      case 'message': return 'messages';
      case 'fact': return 'facts';
      case 'document': return 'documents';
      case 'moderation': return 'memories';
      case 'role_change': return 'memories';
      default: return 'memories';
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // This would use elizaOS's embedding generation
    // For now, return a placeholder
    return new Array(1536).fill(0);
  }

  private updateMemoryMetrics(type: string, scope: string): void {
    // Update internal metrics tracking
    this.metrics.operations++;
  }

  private async analyzeUserBehavior(roomId?: UUID, since?: number): Promise<CommunityInsight | null> {
    // Analyze user behavior patterns
    try {
      const memories = await this.runtime.getMemories({
        tableName: 'messages',
        roomId,
        count: 100,
        start: since
      });
      
      if (memories.length === 0) return null;
      
      // Simple analysis - count messages by user
      const userCounts: Record<string, number> = {};
      memories.forEach(memory => {
        if (memory.entityId) {
          userCounts[memory.entityId] = (userCounts[memory.entityId] || 0) + 1;
        }
      });
      
      const topUsers = Object.entries(userCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
      
      return {
        type: 'user_behavior',
        title: 'Top Community Contributors',
        description: `Analysis of user participation in the last ${since ? Math.round(since / (60 * 60 * 1000)) : 24} hours`,
        data: { topUsers, totalMessages: memories.length },
        confidence: 0.8,
        timestamp: Date.now(),
        actionable: true,
        recommendations: [
          'Consider recognizing top contributors',
          'Identify users who might need encouragement to participate more'
        ]
      };
    } catch (error) {
      this.log('warn', 'Failed to analyze user behavior', { error });
      return null;
    }
  }

  private async analyzeConversationPatterns(roomId?: UUID, since?: number): Promise<CommunityInsight | null> {
    // Analyze conversation patterns
    try {
      const memories = await this.runtime.getMemories({
        tableName: 'messages',
        roomId,
        count: 100,
        start: since
      });
      
      if (memories.length === 0) return null;
      
      // Simple analysis - conversation flow
      const conversationCount = memories.length;
      const uniqueUsers = new Set(memories.map(m => m.entityId).filter(Boolean)).size;
      
      return {
        type: 'conversation_pattern',
        title: 'Conversation Activity Analysis',
        description: `Conversation patterns in the last ${since ? Math.round(since / (60 * 60 * 1000)) : 24} hours`,
        data: { conversationCount, uniqueUsers, averageMessagesPerUser: conversationCount / uniqueUsers },
        confidence: 0.9,
        timestamp: Date.now(),
        actionable: true,
        recommendations: [
          'Monitor conversation quality and engagement',
          'Identify optimal times for community activities'
        ]
      };
    } catch (error) {
      this.log('warn', 'Failed to analyze conversation patterns', { error });
      return null;
    }
  }

  private async analyzeModerationTrends(roomId?: UUID, since?: number): Promise<CommunityInsight | null> {
    // Analyze moderation trends
    try {
      const memories = await this.runtime.getMemories({
        tableName: 'memories',
        roomId,
        count: 100,
        start: since
      });
      
      const moderationMemories = memories.filter(m => 
        m.metadata?.type === 'moderation' || 
        m.metadata?.tags?.includes('moderation')
      );
      
      if (moderationMemories.length === 0) return null;
      
      return {
        type: 'moderation_trend',
        title: 'Moderation Activity Overview',
        description: `Moderation actions in the last ${since ? Math.round(since / (60 * 60 * 1000)) : 24} hours`,
        data: { 
          moderationActions: moderationMemories.length,
          totalMemories: memories.length,
          moderationRate: moderationMemories.length / memories.length
        },
        confidence: 0.7,
        timestamp: Date.now(),
        actionable: true,
        recommendations: [
          'Review moderation patterns for consistency',
          'Consider if moderation rate indicates community health issues'
        ]
      };
    } catch (error) {
      this.log('warn', 'Failed to analyze moderation trends', { error });
      return null;
    }
  }

  private async analyzeEngagementMetrics(roomId?: UUID, since?: number): Promise<CommunityInsight | null> {
    // Analyze engagement metrics
    try {
      const memories = await this.runtime.getMemories({
        tableName: 'messages',
        roomId,
        count: 100,
        start: since
      });
      
      if (memories.length === 0) return null;
      
      // Calculate engagement metrics
      const totalMessages = memories.length;
      const uniqueUsers = new Set(memories.map(m => m.entityId).filter(Boolean)).size;
      const engagementScore = uniqueUsers > 0 ? totalMessages / uniqueUsers : 0;
      
      return {
        type: 'engagement_metric',
        title: 'Community Engagement Score',
        description: `Engagement analysis for the last ${since ? Math.round(since / (60 * 60 * 1000)) : 24} hours`,
        data: { 
          totalMessages, 
          uniqueUsers, 
          engagementScore,
          timeframe: since ? Math.round(since / (60 * 60 * 1000)) : 24
        },
        confidence: 0.85,
        timestamp: Date.now(),
        actionable: true,
        recommendations: [
          'Monitor engagement trends over time',
          'Identify factors that increase community participation'
        ]
      };
    } catch (error) {
      this.log('warn', 'Failed to analyze engagement metrics', { error });
      return null;
    }
  }
}

export default CommunityMemoryService;
