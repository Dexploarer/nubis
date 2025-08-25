import {
	type IAgentRuntime,
	logger,
	type Memory,
	ModelType,
	type UUID,
} from "@elizaos/core";

export type KnowledgeManagerConfig = {
	enabled?: boolean;
	chunkingConfig?: {
		chunkSize?: number;
		overlap?: number;
		maxTokens?: number;
		batchSize?: number;
	};
	indexingConfig?: {
		autoIndex?: boolean;
		indexOnUpdate?: boolean;
		similarityThreshold?: number;
		maxResults?: number;
	};
	storageConfig?: {
		tableName?: string;
		retentionDays?: number;
		maxDocuments?: number;
		compressionEnabled?: boolean;
	};
	searchConfig?: {
		useEmbeddings?: boolean;
		useKeywords?: boolean;
		useProximity?: boolean;
		rerankingEnabled?: boolean;
		maxSearchResults?: number;
	};
};

export type DocumentChunk = {
	id: string;
	documentId: string;
	content: string;
	chunkIndex: number;
	startToken: number;
	endToken: number;
	embedding?: number[];
	score?: number;
	metadata: {
		title: string;
		source: string;
		category: string;
		tags: string[];
		importance: "low" | "medium" | "high" | "critical";
		createdAt: string;
		lastAccessed: string;
		accessCount: number;
	};
};

export type KnowledgeDocument = {
	id: string;
	title: string;
	content: string;
	source: string;
	category: string;
	tags: string[];
	importance: "low" | "medium" | "high" | "critical";
	metadata: Record<string, any>;
	chunks: DocumentChunk[];
	createdAt: string;
	updatedAt: string;
	lastAccessed: string;
	accessCount: number;
	size: number;
	status: "processing" | "indexed" | "error";
};

export type KnowledgeSearchParams = {
	query: string;
	category?: string;
	tags?: string[];
	source?: string;
	importance?: string[];
	dateRange?: {
		start: string;
		end: string;
	};
	maxResults?: number;
	useEmbeddings?: boolean;
};

export type KnowledgeSearchResult = {
	success: boolean;
	documents: KnowledgeDocument[];
	chunks: DocumentChunk[];
	totalFound: number;
	searchTime: number;
	metadata: {
		query: string;
		filters: string[];
		embeddingGenerated: boolean;
		chunksProcessed: number;
	};
};

export function buildKnowledgeManager(
	runtime: IAgentRuntime,
	config: KnowledgeManagerConfig = {},
) {
	const cfg = {
		enabled: config.enabled ?? true,
		chunkingConfig: {
			chunkSize: config.chunkingConfig?.chunkSize ?? 512,
			overlap: config.chunkingConfig?.overlap ?? 20,
			maxTokens: config.chunkingConfig?.maxTokens ?? 4000,
			batchSize: config.chunkingConfig?.batchSize ?? 10,
		},
		indexingConfig: {
			autoIndex: config.indexingConfig?.autoIndex ?? true,
			indexOnUpdate: config.indexingConfig?.indexOnUpdate ?? true,
			similarityThreshold: config.indexingConfig?.similarityThreshold ?? 0.7,
			maxResults: config.indexingConfig?.maxResults ?? 50,
		},
		storageConfig: {
			tableName: config.storageConfig?.tableName ?? "knowledge",
			retentionDays: config.storageConfig?.retentionDays ?? 730, // 2 years
			maxDocuments: config.storageConfig?.maxDocuments ?? 10000,
			compressionEnabled: config.storageConfig?.compressionEnabled ?? false,
		},
		searchConfig: {
			useEmbeddings: config.searchConfig?.useEmbeddings ?? true,
			useKeywords: config.searchConfig?.useKeywords ?? true,
			useProximity: config.searchConfig?.useProximity ?? true,
			rerankingEnabled: config.searchConfig?.rerankingEnabled ?? true,
			maxSearchResults: config.searchConfig?.maxSearchResults ?? 100,
		},
	};

	if (!cfg.enabled) {
		logger.warn("[knowledge-manager] Knowledge management disabled");
		return null;
	}

	const knowledgeManager = {
		// Document processing and chunking
		async processDocument(params: {
			title: string;
			content: string;
			source: string;
			category: string;
			tags?: string[];
			importance?: "low" | "medium" | "high" | "critical";
			metadata?: Record<string, any>;
		}): Promise<string> {
			try {
				const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

				// Create document
				const document: KnowledgeDocument = {
					id: documentId,
					title: params.title,
					content: params.content,
					source: params.source,
					category: params.category,
					tags: params.tags || [],
					importance: params.importance || "medium",
					metadata: params.metadata || {},
					chunks: [],
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					lastAccessed: new Date().toISOString(),
					accessCount: 0,
					size: params.content.length,
					status: "processing",
				};

				// Generate chunks
				const chunks = await knowledgeManager.generateChunks(
					params.content,
					documentId,
				);
				document.chunks = chunks;
				document.status = "indexed";

				// Store document and chunks
				await knowledgeManager.storeDocument(document);
				await knowledgeManager.storeChunks(chunks);

				logger.info(
					`[knowledge-manager] Processed document: ${params.title} (${chunks.length} chunks)`,
				);
				return documentId;
			} catch (error) {
				logger.error("[knowledge-manager] Document processing failed:", error);
				throw error;
			}
		},

		async generateChunks(
			content: string,
			documentId: string,
		): Promise<DocumentChunk[]> {
			try {
				const chunks: DocumentChunk[] = [];
				const words = content.split(/\s+/);
				const chunkSize = cfg.chunkingConfig.chunkSize;
				const overlap = cfg.chunkingConfig.overlap;

				let chunkIndex = 0;
				let startToken = 0;

				while (startToken < words.length) {
					const endToken = Math.min(startToken + chunkSize, words.length);
					const chunkWords = words.slice(startToken, endToken);
					const chunkContent = chunkWords.join(" ");

					const chunk: DocumentChunk = {
						id: `${documentId}_chunk_${chunkIndex}`,
						documentId,
						content: chunkContent,
						chunkIndex,
						startToken,
						endToken,
						metadata: {
							title: `Chunk ${chunkIndex + 1}`,
							source: documentId,
							category: "chunk",
							tags: ["chunk", "auto-generated"],
							importance: "low",
							createdAt: new Date().toISOString(),
							lastAccessed: new Date().toISOString(),
							accessCount: 0,
						},
					};

					chunks.push(chunk);
					chunkIndex++;
					startToken = endToken - overlap;

					if (startToken >= words.length) break;
				}

				return chunks;
			} catch (error) {
				logger.error("[knowledge-manager] Chunk generation failed:", error);
				return [];
			}
		},

		// Knowledge search using elizaOS patterns
		async searchKnowledge(
			params: KnowledgeSearchParams,
		): Promise<KnowledgeSearchResult> {
			const startTime = Date.now();

			try {
				let results: DocumentChunk[] = [];
				let embeddingGenerated = false;

				// Generate embedding if enabled
				if (cfg.searchConfig.useEmbeddings && params.useEmbeddings !== false) {
					try {
						const embedding = await runtime.useModel(ModelType.TEXT_EMBEDDING, {
							text: params.query,
						});
						embeddingGenerated = true;

						// Use elizaOS vector search if available
						if ((runtime as any).searchMemories) {
							const searchResults = await (runtime as any).searchMemories({
								tableName: cfg.storageConfig.tableName,
								embedding,
								count: Math.min(
									params.maxResults || cfg.searchConfig.maxSearchResults,
									100,
								),
								query: params.query,
							});

							results = searchResults
								.map((memory) => {
									const content = memory.content as DocumentChunk;
									return content;
								})
								.filter(Boolean);
						}
					} catch (error) {
						logger.warn(
							"[knowledge-manager] Embedding search failed, falling back to text search",
						);
					}
				}

				// Fallback to text-based search
				if (results.length === 0) {
					results = await knowledgeManager.textBasedSearch(params);
				}

				// Apply filters
				results = knowledgeManager.applySearchFilters(results, params);

				// Reranking if enabled
				if (cfg.searchConfig.rerankingEnabled && results.length > 1) {
					results = await knowledgeManager.rerankResults(results, params.query);
				}

				// Limit results
				const maxResults =
					params.maxResults || cfg.searchConfig.maxSearchResults;
				results = results.slice(0, maxResults);

				// Group by document
				const documents = knowledgeManager.groupChunksByDocument(results);

				const searchTime = Date.now() - startTime;

				return {
					success: true,
					documents,
					chunks: results,
					totalFound: results.length,
					searchTime,
					metadata: {
						query: params.query,
						filters: knowledgeManager.getAppliedFilters(params),
						embeddingGenerated,
						chunksProcessed: results.length,
					},
				};
			} catch (error) {
				logger.error("[knowledge-manager] Knowledge search failed:", error);
				return {
					success: false,
					documents: [],
					chunks: [],
					totalFound: 0,
					searchTime: Date.now() - startTime,
					metadata: {
						query: params.query,
						filters: [],
						embeddingGenerated: false,
						chunksProcessed: 0,
					},
				};
			}
		},

		async textBasedSearch(
			params: KnowledgeSearchParams,
		): Promise<DocumentChunk[]> {
			try {
				// Get all chunks from storage
				const chunks = await runtime.getMemories({
					tableName: cfg.storageConfig.tableName,
					roomId: "global" as UUID,
					count: 1000,
				});

				const results: DocumentChunk[] = [];

				for (const memory of chunks) {
					const chunk = memory.content as DocumentChunk;
					if (!chunk) continue;

					let score = 0;
					const queryLower = params.query.toLowerCase();
					const contentLower = chunk.content.toLowerCase();

					// Keyword matching
					if (cfg.searchConfig.useKeywords) {
						const queryWords = queryLower.split(/\s+/);
						const contentWords = contentLower.split(/\s+/);

						for (const queryWord of queryWords) {
							if (contentWords.includes(queryWord)) {
								score += 1;
							}
						}
					}

					// Proximity search
					if (cfg.searchConfig.useProximity && score > 0) {
						const proximity = knowledgeManager.calculateProximity(
							queryLower,
							contentLower,
						);
						score += proximity * 0.5;
					}

					// Tag matching
					if (params.tags && params.tags.length > 0) {
						const tagMatches = params.tags.filter((tag) =>
							chunk.metadata.tags.includes(tag),
						).length;
						score += tagMatches * 0.3;
					}

					// Category matching
					if (params.category && chunk.metadata.category === params.category) {
						score += 0.5;
					}

					// Importance bonus
					const importanceScore =
						{
							low: 0.1,
							medium: 0.2,
							high: 0.3,
							critical: 0.4,
						}[chunk.metadata.importance] || 0;
					score += importanceScore;

					if (score > 0) {
						results.push({ ...chunk, score });
					}
				}

				// Sort by score
				results.sort((a, b) => (b.score || 0) - (a.score || 0));
				return results;
			} catch (error) {
				logger.error("[knowledge-manager] Text-based search failed:", error);
				return [];
			}
		},

		async rerankResults(
			chunks: DocumentChunk[],
			query: string,
		): Promise<DocumentChunk[]> {
			try {
				// Simple reranking based on content relevance
				const reranked = chunks.map((chunk) => {
					let score = chunk.score || 0;

					// Content length bonus (prefer longer, more detailed chunks)
					const lengthBonus = Math.min(chunk.content.length / 1000, 0.2);
					score += lengthBonus;

					// Recency bonus
					const lastAccessed = new Date(chunk.metadata.lastAccessed);
					const daysSince =
						(Date.now() - lastAccessed.getTime()) / (1000 * 60 * 60 * 24);
					const recencyBonus = Math.max(0, 0.1 - daysSince * 0.01);
					score += recencyBonus;

					// Access count bonus
					const accessBonus = Math.min(chunk.metadata.accessCount / 100, 0.1);
					score += accessBonus;

					return { ...chunk, score };
				});

				// Sort by reranked score
				reranked.sort((a, b) => (b.score || 0) - (a.score || 0));
				return reranked;
			} catch (error) {
				logger.error("[knowledge-manager] Reranking failed:", error);
				return chunks;
			}
		},

		// Utility functions
		calculateProximity(query: string, content: string): number {
			const queryWords = query.split(/\s+/);
			const contentWords = content.split(/\s+/);

			let minDistance = Infinity;

			for (let i = 0; i < contentWords.length - queryWords.length + 1; i++) {
				let distance = 0;
				let match = true;

				for (let j = 0; j < queryWords.length; j++) {
					if (contentWords[i + j] !== queryWords[j]) {
						match = false;
						break;
					}
				}

				if (match) {
					distance = Math.abs(i - contentWords.length / 2);
					minDistance = Math.min(minDistance, distance);
				}
			}

			return minDistance === Infinity ? 0 : 1 / (1 + minDistance);
		},

		applySearchFilters(
			chunks: DocumentChunk[],
			params: KnowledgeSearchParams,
		): DocumentChunk[] {
			let filtered = chunks;

			// Filter by category
			if (params.category) {
				filtered = filtered.filter(
					(chunk) => chunk.metadata.category === params.category,
				);
			}

			// Filter by tags
			if (params.tags && params.tags.length > 0) {
				filtered = filtered.filter((chunk) =>
					params.tags!.some((tag) => chunk.metadata.tags.includes(tag)),
				);
			}

			// Filter by source
			if (params.source) {
				filtered = filtered.filter(
					(chunk) => chunk.metadata.source === params.source,
				);
			}

			// Filter by importance
			if (params.importance && params.importance.length > 0) {
				filtered = filtered.filter((chunk) =>
					params.importance!.includes(chunk.metadata.importance),
				);
			}

			// Filter by date range
			if (params.dateRange) {
				filtered = filtered.filter((chunk) => {
					const createdAt = new Date(chunk.metadata.createdAt);
					const start = new Date(params.dateRange!.start);
					const end = new Date(params.dateRange!.end);
					return createdAt >= start && createdAt <= end;
				});
			}

			return filtered;
		},

		getAppliedFilters(params: KnowledgeSearchParams): string[] {
			const filters: string[] = [];

			if (params.category) filters.push(`category:${params.category}`);
			if (params.tags) filters.push(`tags:${params.tags.join(",")}`);
			if (params.source) filters.push(`source:${params.source}`);
			if (params.importance)
				filters.push(`importance:${params.importance.join(",")}`);
			if (params.dateRange)
				filters.push(`date:${params.dateRange.start}-${params.dateRange.end}`);

			return filters;
		},

		groupChunksByDocument(chunks: DocumentChunk[]): KnowledgeDocument[] {
			const documentMap = new Map<string, KnowledgeDocument>();

			for (const chunk of chunks) {
				if (!documentMap.has(chunk.documentId)) {
					documentMap.set(chunk.documentId, {
						id: chunk.documentId,
						title: chunk.metadata.title,
						content: "", // Would need to reconstruct from chunks
						source: chunk.metadata.source,
						category: chunk.metadata.category,
						tags: chunk.metadata.tags,
						importance: chunk.metadata.importance,
						metadata: chunk.metadata,
						chunks: [],
						createdAt: chunk.metadata.createdAt,
						updatedAt: chunk.metadata.createdAt, // Use createdAt since chunks don't have updatedAt
						lastAccessed: chunk.metadata.lastAccessed,
						accessCount: chunk.metadata.accessCount,
						size: 0,
						status: "indexed",
					});
				}

				const document = documentMap.get(chunk.documentId)!;
				document.chunks.push(chunk);
				document.size += chunk.content.length;
			}

			return Array.from(documentMap.values());
		},

		// Storage operations
		async storeDocument(document: KnowledgeDocument): Promise<boolean> {
			try {
				// Store in runtime if available
				if ((runtime as any).storeMemory) {
					await (runtime as any).storeMemory({
						tableName: cfg.storageConfig.tableName,
						roomId: "global" as UUID,
						entityId: document.id as UUID,
						agentId: (runtime as any).agentId,
						content: document,
					});
				}

				logger.info(`[knowledge-manager] Stored document: ${document.title}`);
				return true;
			} catch (error) {
				logger.error("[knowledge-manager] Failed to store document:", error);
				return false;
			}
		},

		async storeChunks(chunks: DocumentChunk[]): Promise<boolean> {
			try {
				// Store chunks in batches
				const batchSize = cfg.chunkingConfig.batchSize;

				for (let i = 0; i < chunks.length; i += batchSize) {
					const batch = chunks.slice(i, i + batchSize);

					await Promise.all(
						batch.map((chunk) =>
							(runtime as any).storeMemory?.({
								tableName: `${cfg.storageConfig.tableName}_chunks`,
								roomId: "global" as UUID,
								entityId: chunk.id as UUID,
								agentId: (runtime as any).agentId,
								content: chunk,
							}),
						),
					);
				}

				logger.info(`[knowledge-manager] Stored ${chunks.length} chunks`);
				return true;
			} catch (error) {
				logger.error("[knowledge-manager] Failed to store chunks:", error);
				return false;
			}
		},

		// Knowledge analytics
		async getKnowledgeStats(): Promise<{
			totalDocuments: number;
			totalChunks: number;
			byCategory: Record<string, number>;
			byImportance: Record<string, number>;
			storageSize: string;
			lastUpdated: string;
		}> {
			try {
				const documents = await runtime.getMemories({
					tableName: cfg.storageConfig.tableName,
					roomId: "global" as UUID,
					count: 1000,
				});

				const chunks = await runtime.getMemories({
					tableName: `${cfg.storageConfig.tableName}_chunks`,
					roomId: "global" as UUID,
					count: 1000,
				});

				const byCategory: Record<string, number> = {};
				const byImportance: Record<string, number> = {};
				let lastUpdated = "";

				documents.forEach((doc) => {
					const content = doc.content as KnowledgeDocument;
					if (content) {
						byCategory[content.category] =
							(byCategory[content.category] || 0) + 1;
						byImportance[content.importance] =
							(byImportance[content.importance] || 0) + 1;

						if (content.updatedAt > lastUpdated) {
							lastUpdated = content.updatedAt;
						}
					}
				});

				const totalSize = documents.reduce((sum, doc) => {
					const content = doc.content as KnowledgeDocument;
					return sum + (content?.size || 0);
				}, 0);

				const storageSize = `${(totalSize / 1024 / 1024).toFixed(2)} MB`;

				return {
					totalDocuments: documents.length,
					totalChunks: chunks.length,
					byCategory,
					byImportance,
					storageSize,
					lastUpdated: lastUpdated || new Date().toISOString(),
				};
			} catch (error) {
				logger.error(
					"[knowledge-manager] Failed to get knowledge stats:",
					error,
				);
				return {
					totalDocuments: 0,
					totalChunks: 0,
					byCategory: {},
					byImportance: {},
					storageSize: "0 MB",
					lastUpdated: new Date().toISOString(),
				};
			}
		},

		// Configuration management
		getConfig() {
			return { ...cfg };
		},

		async updateConfig(
			newConfig: Partial<KnowledgeManagerConfig>,
		): Promise<void> {
			Object.assign(cfg, newConfig);
			logger.info("[knowledge-manager] Configuration updated");
		},
	};

	return knowledgeManager;
}

// Convenience function for creating knowledge manager
export function createKnowledgeManager(
	runtime: IAgentRuntime,
	config?: KnowledgeManagerConfig,
) {
	return buildKnowledgeManager(runtime, config);
}
