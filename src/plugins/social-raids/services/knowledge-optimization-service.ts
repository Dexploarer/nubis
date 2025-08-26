/**
 * Knowledge Optimization Service
 * Enhances ElizaOS Knowledge Plugin usage with community-specific content management
 */
import type { IAgentRuntime } from '@elizaos/core';
import { Service, ServiceType, elizaLogger } from '@elizaos/core';
import * as fs from 'fs/promises';
import * as path from 'path';

interface KnowledgeDocument {
  id: string;
  path: string;
  title: string;
  content: string;
  metadata: {
    category: string;
    tags: string[];
    priority: number;
    lastUpdated: Date;
    size: number;
    relevanceScore: number;
  };
}

interface KnowledgeCategory {
  name: string;
  description: string;
  documents: KnowledgeDocument[];
  importance: number;
}

export class KnowledgeOptimizationService extends Service {
  static serviceType = 'KNOWLEDGE_OPTIMIZATION_SERVICE';

  capabilityDescription = 'Optimizes ElizaOS Knowledge Plugin usage and manages community-specific documentation';

  public name: string = KnowledgeOptimizationService.serviceType;
  private knowledgeCache = new Map<string, KnowledgeDocument>();
  private categories: KnowledgeCategory[] = [];
  private lastOptimization = 0;
  private readonly OPTIMIZATION_INTERVAL = 60000 * 30; // 30 minutes
  
  constructor(runtime: IAgentRuntime) {
    super(runtime);
  }

  // Static lifecycle helpers to satisfy core service loader patterns
  static async start(runtime: IAgentRuntime): Promise<KnowledgeOptimizationService> {
    elizaLogger.info('Starting Knowledge Optimization Service');
    const service = new KnowledgeOptimizationService(runtime);
    await service.initialize();
    return service;
  }

  static async stop(runtime: IAgentRuntime): Promise<void> {
    try {
      const existing = (runtime as any)?.getService?.(KnowledgeOptimizationService.serviceType);
      if (existing && typeof existing.stop === 'function') {
        await (existing as KnowledgeOptimizationService).stop();
      }
    } finally {
      elizaLogger.info('Knowledge Optimization Service stopped');
    }
  }

  async initialize(): Promise<void> {
    elizaLogger.info('Initializing Knowledge Optimization Service');

    try {
      // Scan and index all knowledge documents
      await this.scanKnowledgeBase();
      
      // Optimize document structure for ElizaOS
      await this.optimizeKnowledgeStructure();
      
      // Set up periodic optimization
      this.setupPeriodicOptimization();

      elizaLogger.success('Knowledge Optimization Service initialized successfully');
    } catch (error) {
      elizaLogger.error('Failed to initialize Knowledge Optimization Service:', error);
      throw error;
    }
  }

  private async scanKnowledgeBase(): Promise<void> {
    const knowledgeDirs = [
      '/root/project/docs/knowledge',
      '/root/project/docs',
      '/root/project/README.md',
      '/root/project/CLAUDE.md',
      '/root/project/CHARACTER_RESTRUCTURE_SUMMARY.md'
    ];

    elizaLogger.info('Scanning knowledge base directories');

    for (const dirPath of knowledgeDirs) {
      try {
        await this.scanDirectory(dirPath);
      } catch (error) {
        elizaLogger.warn(`Failed to scan directory ${dirPath}:`, error);
      }
    }

    elizaLogger.info(`Indexed ${this.knowledgeCache.size} knowledge documents`);
  }

  private async scanDirectory(dirPath: string): Promise<void> {
    try {
      const stat = await fs.stat(dirPath);
      
      if (stat.isFile() && this.isDocumentFile(dirPath)) {
        await this.indexDocument(dirPath);
      } else if (stat.isDirectory()) {
        const entries = await fs.readdir(dirPath);
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry);
          await this.scanDirectory(fullPath);
        }
      }
    } catch (error) {
      elizaLogger.debug(`Skipping ${dirPath}: ${error.message}`);
    }
  }

  private isDocumentFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ['.md', '.txt', '.json'].includes(ext);
  }

  private async indexDocument(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const stats = await fs.stat(filePath);
      const fileName = path.basename(filePath);
      
      const document: KnowledgeDocument = {
        id: this.generateDocumentId(filePath),
        path: filePath,
        title: this.extractTitle(content, fileName),
        content: content,
        metadata: {
          category: this.categorizeDocument(filePath, content),
          tags: this.extractTags(content),
          priority: this.calculatePriority(filePath, content),
          lastUpdated: stats.mtime,
          size: stats.size,
          relevanceScore: this.calculateRelevanceScore(filePath, content),
        },
      };

      this.knowledgeCache.set(document.id, document);
      elizaLogger.debug(`Indexed document: ${document.title} (${document.metadata.category})`);
    } catch (error) {
      elizaLogger.warn(`Failed to index document ${filePath}:`, error);
    }
  }

  private generateDocumentId(filePath: string): string {
    return Buffer.from(filePath).toString('base64').substring(0, 16);
  }

  private extractTitle(content: string, fileName: string): string {
    // Try to extract title from markdown header
    const headerMatch = content.match(/^#\s+(.+)$/m);
    if (headerMatch) {
      return headerMatch[1].trim();
    }
    
    // Fallback to filename without extension
    return path.basename(fileName, path.extname(fileName))
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private categorizeDocument(filePath: string, content: string): string {
    const pathLower = filePath.toLowerCase();
    const contentLower = content.toLowerCase();

    // Category mapping based on path and content analysis
    if (pathLower.includes('knowledge')) return 'knowledge-base';
    if (pathLower.includes('community')) return 'community';
    if (pathLower.includes('character') || contentLower.includes('nubi') || contentLower.includes('anubis')) return 'character-lore';
    if (pathLower.includes('architecture') || contentLower.includes('elizaos')) return 'technical-architecture';
    if (pathLower.includes('memory') || contentLower.includes('memory system')) return 'memory-system';
    if (pathLower.includes('plugin') || contentLower.includes('plugin')) return 'plugins';
    if (pathLower.includes('raid') || contentLower.includes('social raids')) return 'social-raids';
    if (pathLower.includes('twitter') || contentLower.includes('telegram')) return 'social-platforms';
    if (pathLower.includes('supabase') || contentLower.includes('database')) return 'database';
    if (pathLower.includes('test') || contentLower.includes('testing')) return 'testing';
    
    return 'general';
  }

  private extractTags(content: string): string[] {
    const tags = new Set<string>();
    
    // Common technical tags
    const techMatches = content.match(/\b(elizaos|nubi|anubis|solana|web3|ai|agent|plugin|memory|knowledge|community|raid|twitter|telegram|supabase|database)\b/gi);
    if (techMatches) {
      techMatches.forEach(match => tags.add(match.toLowerCase()));
    }
    
    // Extract hashtags if present
    const hashtagMatches = content.match(/#\w+/g);
    if (hashtagMatches) {
      hashtagMatches.forEach(tag => tags.add(tag.substring(1).toLowerCase()));
    }

    return Array.from(tags).slice(0, 10); // Limit to 10 tags
  }

  private calculatePriority(filePath: string, content: string): number {
    let priority = 5; // Base priority
    
    // High priority documents
    if (filePath.includes('CLAUDE.md') || filePath.includes('README.md')) priority = 10;
    if (filePath.includes('character') || filePath.includes('nubi')) priority = 9;
    if (filePath.includes('knowledge')) priority = 8;
    if (filePath.includes('community')) priority = 7;
    if (filePath.includes('architecture')) priority = 6;
    
    // Adjust based on content size (longer documents may be more comprehensive)
    if (content.length > 10000) priority += 1;
    if (content.length > 50000) priority += 1;
    
    return Math.min(priority, 10);
  }

  private calculateRelevanceScore(filePath: string, content: string): number {
    let score = 0.5; // Base relevance
    
    const contentLower = content.toLowerCase();
    
    // Core concepts boost relevance
    if (contentLower.includes('nubi') || contentLower.includes('anubis')) score += 0.3;
    if (contentLower.includes('elizaos') || contentLower.includes('memory system')) score += 0.2;
    if (contentLower.includes('community') || contentLower.includes('interaction')) score += 0.2;
    if (contentLower.includes('social raids') || contentLower.includes('engagement')) score += 0.15;
    if (contentLower.includes('solana') || contentLower.includes('web3')) score += 0.1;
    
    // Recency boost (newer files are more relevant)
    if (filePath.includes('2025')) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  private async optimizeKnowledgeStructure(): Promise<void> {
    elizaLogger.info('Optimizing knowledge structure for ElizaOS');
    
    // Group documents by category
    this.categories = this.groupDocumentsByCategory();
    
    // Generate knowledge optimization report
    await this.generateOptimizationReport();
    
    // Create enhanced document summaries for the Knowledge Plugin
    await this.createEnhancedSummaries();
    
    elizaLogger.info('Knowledge structure optimization completed');
  }

  private groupDocumentsByCategory(): KnowledgeCategory[] {
    const categoryMap = new Map<string, KnowledgeDocument[]>();
    
    // Group documents by category
    for (const doc of this.knowledgeCache.values()) {
      const category = doc.metadata.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(doc);
    }
    
    // Create category objects with importance scores
    const categories: KnowledgeCategory[] = [];
    for (const [categoryName, documents] of categoryMap) {
      const avgPriority = documents.reduce((sum, doc) => sum + doc.metadata.priority, 0) / documents.length;
      
      categories.push({
        name: categoryName,
        description: this.getCategoryDescription(categoryName),
        documents: documents.sort((a, b) => b.metadata.priority - a.metadata.priority),
        importance: avgPriority,
      });
    }
    
    return categories.sort((a, b) => b.importance - a.importance);
  }

  private getCategoryDescription(categoryName: string): string {
    const descriptions: Record<string, string> = {
      'character-lore': 'Nubi\'s personality, backstory, and character development',
      'community': 'Community guidelines, interactions, and management strategies',
      'knowledge-base': 'Core knowledge base documents and reference materials',
      'technical-architecture': 'ElizaOS architecture, plugins, and system design',
      'memory-system': 'Memory management, storage, and optimization',
      'social-raids': 'Social raid coordination, engagement, and community building',
      'social-platforms': 'Twitter, Telegram, and other platform integrations',
      'plugins': 'Plugin development, configuration, and usage',
      'database': 'Database schema, migrations, and data management',
      'testing': 'Test suites, quality assurance, and validation',
      'general': 'General documentation and miscellaneous content',
    };
    
    return descriptions[categoryName] || 'Uncategorized documentation';
  }

  private async generateOptimizationReport(): Promise<void> {
    const reportPath = '/root/project/docs/KNOWLEDGE_OPTIMIZATION_REPORT.md';
    
    let report = '# Knowledge Optimization Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `Total Documents: ${this.knowledgeCache.size}\n\n`;
    
    report += '## Category Breakdown\n\n';
    for (const category of this.categories) {
      report += `### ${category.name} (Importance: ${category.importance.toFixed(1)})\n`;
      report += `${category.description}\n\n`;
      report += `**Documents (${category.documents.length}):**\n`;
      
      for (const doc of category.documents.slice(0, 5)) { // Show top 5 per category
        report += `- **${doc.title}** (Priority: ${doc.metadata.priority}, Relevance: ${doc.metadata.relevanceScore.toFixed(2)})\n`;
        report += `  - Path: \`${doc.path}\`\n`;
        report += `  - Tags: ${doc.metadata.tags.join(', ')}\n`;
        report += `  - Size: ${this.formatBytes(doc.metadata.size)}\n`;
      }
      
      if (category.documents.length > 5) {
        report += `- ... and ${category.documents.length - 5} more documents\n`;
      }
      
      report += '\n';
    }
    
    report += '## Recommendations\n\n';
    report += this.generateRecommendations();
    
    try {
      await fs.writeFile(reportPath, report);
      elizaLogger.info(`Knowledge optimization report saved to ${reportPath}`);
    } catch (error) {
      elizaLogger.warn('Failed to save optimization report:', error);
    }
  }

  private generateRecommendations(): string {
    let recommendations = '';
    
    // Analyze knowledge gaps and provide recommendations
    const categories = this.categories.map(c => c.name);
    const priorities = this.categories.map(c => c.importance);
    const maxPriority = Math.max(...priorities);
    
    if (!categories.includes('character-lore')) {
      recommendations += '- **Character Development Gap**: Consider adding more character lore documentation\n';
    }
    
    if (!categories.includes('community')) {
      recommendations += '- **Community Gap**: Add community interaction guidelines and management docs\n';
    }
    
    // Check for low-priority categories that need attention
    for (const category of this.categories) {
      if (category.importance < maxPriority * 0.6) {
        recommendations += `- **Low Priority Category**: "${category.name}" may need more attention or better content\n`;
      }
    }
    
    // ElizaOS-specific recommendations
    recommendations += '\n**ElizaOS Knowledge Plugin Optimization:**\n';
    recommendations += '- Documents are automatically indexed by the Knowledge Plugin\n';
    recommendations += '- High-priority documents will be more likely to be retrieved in queries\n';
    recommendations += '- Consider breaking large documents into smaller, focused sections\n';
    recommendations += '- Use clear headings and structured content for better retrieval\n';
    
    return recommendations;
  }

  private async createEnhancedSummaries(): Promise<void> {
    elizaLogger.info('Creating enhanced document summaries for Knowledge Plugin');
    
    const summariesPath = '/root/project/docs/KNOWLEDGE_SUMMARIES.md';
    let summaries = '# Enhanced Knowledge Summaries\n\n';
    summaries += 'Auto-generated summaries for ElizaOS Knowledge Plugin optimization\n\n';
    
    for (const category of this.categories) {
      summaries += `## ${category.name.toUpperCase().replace(/-/g, ' ')}\n`;
      summaries += `${category.description}\n\n`;
      
      for (const doc of category.documents) {
        summaries += `### ${doc.title}\n`;
        summaries += `**Category:** ${doc.metadata.category} | **Priority:** ${doc.metadata.priority} | **Relevance:** ${doc.metadata.relevanceScore.toFixed(2)}\n\n`;
        
        // Create a summary of the first few paragraphs
        const summary = this.createDocumentSummary(doc.content);
        summaries += `${summary}\n\n`;
        summaries += `**Tags:** ${doc.metadata.tags.join(', ')}\n`;
        summaries += `**Source:** \`${doc.path}\`\n\n`;
        summaries += '---\n\n';
      }
    }
    
    try {
      await fs.writeFile(summariesPath, summaries);
      elizaLogger.info(`Enhanced summaries saved to ${summariesPath}`);
    } catch (error) {
      elizaLogger.warn('Failed to save enhanced summaries:', error);
    }
  }

  private createDocumentSummary(content: string): string {
    // Remove markdown formatting for cleaner summary
    const cleanContent = content
      .replace(/^#+\s+/gm, '') // Remove markdown headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove code formatting
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Remove links
    
    // Get first few sentences
    const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const summary = sentences.slice(0, 3).join('. ').trim();
    
    return summary.length > 300 ? summary.substring(0, 297) + '...' : summary;
  }

  private setupPeriodicOptimization(): void {
    setInterval(() => {
      this.performPeriodicOptimization();
    }, this.OPTIMIZATION_INTERVAL);
  }

  private async performPeriodicOptimization(): Promise<void> {
    const now = Date.now();
    if (now - this.lastOptimization < this.OPTIMIZATION_INTERVAL) return;
    
    elizaLogger.debug('Performing periodic knowledge optimization');
    
    try {
      // Re-scan for new documents
      await this.scanKnowledgeBase();
      
      // Update optimization if significant changes
      const currentSize = this.knowledgeCache.size;
      if (currentSize !== this.categories.reduce((sum, cat) => sum + cat.documents.length, 0)) {
        await this.optimizeKnowledgeStructure();
      }
      
      this.lastOptimization = now;
      elizaLogger.debug('Periodic knowledge optimization completed');
    } catch (error) {
      elizaLogger.warn('Periodic optimization failed:', error);
    }
  }

  // Public API methods for other services
  public async getDocumentsByCategory(category: string): Promise<KnowledgeDocument[]> {
    const categoryObj = this.categories.find(c => c.name === category);
    return categoryObj ? categoryObj.documents : [];
  }

  public async searchDocuments(query: string): Promise<KnowledgeDocument[]> {
    const queryLower = query.toLowerCase();
    const results: { document: KnowledgeDocument; score: number }[] = [];
    
    for (const doc of this.knowledgeCache.values()) {
      let score = 0;
      
      // Title match (highest priority)
      if (doc.title.toLowerCase().includes(queryLower)) score += 0.4;
      
      // Tags match
      if (doc.metadata.tags.some(tag => tag.includes(queryLower))) score += 0.3;
      
      // Content match
      if (doc.content.toLowerCase().includes(queryLower)) score += 0.2;
      
      // Category match
      if (doc.metadata.category.toLowerCase().includes(queryLower)) score += 0.1;
      
      // Apply relevance multiplier
      score *= doc.metadata.relevanceScore;
      
      if (score > 0) {
        results.push({ document: doc, score });
      }
    }
    
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(r => r.document);
  }

  public async getHighPriorityDocuments(): Promise<KnowledgeDocument[]> {
    return Array.from(this.knowledgeCache.values())
      .filter(doc => doc.metadata.priority >= 8)
      .sort((a, b) => b.metadata.priority - a.metadata.priority);
  }

  public getKnowledgeStats(): { totalDocuments: number; categories: number; avgPriority: number } {
    const docs = Array.from(this.knowledgeCache.values());
    const avgPriority = docs.reduce((sum, doc) => sum + doc.metadata.priority, 0) / docs.length;
    
    return {
      totalDocuments: docs.length,
      categories: this.categories.length,
      avgPriority: parseFloat(avgPriority.toFixed(2)),
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async stop(): Promise<void> {
    elizaLogger.info('Knowledge Optimization Service stopped');
  }
}

// Ensure the class constructor reports the expected static identifier when accessed as `.name`
Object.defineProperty(KnowledgeOptimizationService, 'name', { value: KnowledgeOptimizationService.serviceType });