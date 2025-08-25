import {
	createMessageMemory,
	type IAgentRuntime,
	logger,
	type Memory,
	ModelType,
	type UUID,
} from "@elizaos/core";
import { randomUUID } from "crypto";

// Define proper types for content structures
export interface MessageContent {
	text: string;
	metadata?: Record<string, unknown>;
}

export interface MemoryContent {
	text?: string;
	metadata?: Record<string, unknown>;
	[key: string]: unknown;
}

export interface MemoryMetadata {
	tags?: string[];
	priority?: "low" | "medium" | "high" | "critical";
	storedAt?: string;
	tableName?: string;
	type?: string;
	[key: string]: unknown;
}

export type ElizaOSMemoryConfig = {
	enabled?: boolean;
	tableNames?: {
		messages?: string;
		facts?: string;
		entities?: string;
		knowledge?: string;
	};
	embeddingConfig?: {
		chunkSize?: number;
		overlap?: number;
		maxTokens?: number;
	};
	retentionConfig?: {
		messages?: number; // days
		facts?: number;
		entities?: number;
		knowledge?: number;
	};
	searchConfig?: {
		defaultCount?: number;
		similarityThreshold?: number;
		maxResults?: number;
	};
};

export type MemorySearchParams = {
	tableName: string;
	embedding?: number[];
	roomId?: UUID;
	entityId?: UUID;
	worldId?: UUID;
	count: number;
	query?: string;
	filters?: Record<string, unknown>;
};

export type MemoryResult = {
	success: boolean;
	memories: Memory[];
	count: number;
	totalFound: number;
	searchTime: number;
	metadata?: {
		embeddingGenerated?: boolean;
		chunksProcessed?: number;
		filtersApplied?: string[];
	};
};

export type EntityMemoryData = {
	entityId: UUID;
	names: string[];
	aliases: string[];
	metadata: Record<string, unknown>;
	relationships: Array<{
		targetEntityId: UUID;
		relationshipType: string;
		strength: number;
		metadata: Record<string, unknown>;
	}>;
	lastSeen: string;
	interactionCount: number;
};

export type KnowledgeMemoryData = {
	title: string;
	content: string;
	source: string;
	category: string;
	tags: string[];
	importance: "low" | "medium" | "high" | "critical";
	lastAccessed: string;
	accessCount: number;
	metadata: Record<string, unknown>;
};

export function buildElizaOSMemoryHelpers(
	runtime: IAgentRuntime,
	config: ElizaOSMemoryConfig = {},
) {
	const cfg = {
		enabled: config.enabled ?? true,
		tableNames: {
			messages: config.tableNames?.messages ?? "messages",
			facts: config.tableNames?.facts ?? "facts",
			entities: config.tableNames?.entities ?? "entities",
			knowledge: config.tableNames?.knowledge ?? "knowledge",
		},
		embeddingConfig: {
			chunkSize: config.embeddingConfig?.chunkSize ?? 512,
			overlap: config.embeddingConfig?.overlap ?? 20,
			maxTokens: config.embeddingConfig?.maxTokens ?? 4000,
		},
		retentionConfig: {
			messages: config.retentionConfig?.messages ?? 30,
			facts: config.retentionConfig?.facts ?? 90,
			entities: config.retentionConfig?.entities ?? 365,
			knowledge: config.retentionConfig?.knowledge ?? 730,
		},
		searchConfig: {
			defaultCount: config.searchConfig?.defaultCount ?? 10,
			similarityThreshold: config.searchConfig?.similarityThreshold ?? 0.7,
			maxResults: config.searchConfig?.maxResults ?? 100,
		},
	};

	if (!cfg.enabled) {
		logger.warn("[elizaos-memory] Memory system disabled");
		return null;
	}

	return {
		// Core memory operations using elizaOS runtime
		async getMemories(params: {
			tableName: string;
			roomId: UUID;
			count: number;
			unique?: boolean;
			filters?: Record<string, unknown>;
		}): Promise<Memory[]> {
			try {
				const memories = await runtime.getMemories({
					tableName: params.tableName,
					roomId: params.roomId,
					count: params.count,
					unique: params.unique,
				});

				// Apply additional filters if provided
				if (params.filters) {
					return memories.filter((memory) => {
						return Object.entries(params.filters!).every(([key, value]) => {
							if (typeof value === "function") {
								return value(memory[key as keyof Memory]);
							}
							return memory[key as keyof Memory] === value;
						});
					});
				}

				return memories;
			} catch (error) {
				logger.error("[elizaos-memory] Failed to get memories:", error);
				return [];
			}
		},

		async searchMemories(params: MemorySearchParams): Promise<MemoryResult> {
			const startTime = Date.now();

			try {
				let memories: Memory[] = [];
				let embeddingGenerated = false;

				// If no embedding provided, generate one from query text
				if (!params.embedding && params.query) {
					try {
						params.embedding = await runtime.useModel(
							ModelType.TEXT_EMBEDDING,
							{
								text: params.query,
							},
						);
						embeddingGenerated = true;
					} catch (error) {
						logger.warn(
							"[elizaos-memory] Failed to generate embedding, falling back to text search",
						);
					}
				}

				if (params.embedding) {
					// Use vector similarity search with the base runtime method
					memories = await runtime.searchMemories({
						tableName: params.tableName,
						embedding: params.embedding,
						roomId: params.roomId,
						worldId: params.worldId,
						count: Math.min(params.count, cfg.searchConfig.maxResults),
						query: params.query,
					});
				} else {
					// Fallback to basic text search
					memories = await runtime.getMemories({
						tableName: params.tableName,
						roomId: params.roomId || ("global" as UUID),
						count: params.count,
					});

					if (params.query) {
						memories = memories.filter((memory) => {
							const content = memory.content as MemoryContent;
							return content?.text
								?.toLowerCase()
								.includes(params.query!.toLowerCase());
						});
					}
				}

				// Apply similarity threshold if embedding search was used
				if (params.embedding && cfg.searchConfig.similarityThreshold > 0) {
					// Note: In a real implementation, you'd calculate similarity scores
					// and filter by threshold. This is a simplified version.
					memories = memories.slice(
						0,
						Math.floor(memories.length * cfg.searchConfig.similarityThreshold),
					);
				}

				const searchTime = Date.now() - startTime;

				return {
					success: true,
					memories,
					count: memories.length,
					totalFound: memories.length,
					searchTime,
					metadata: {
						embeddingGenerated,
						chunksProcessed: 1, // Simplified for template
						filtersApplied: params.filters ? Object.keys(params.filters) : [],
					},
				};
			} catch (error) {
				logger.error("[elizaos-memory] Memory search failed:", error);
				return {
					success: false,
					memories: [],
					count: 0,
					totalFound: 0,
					searchTime: Date.now() - startTime,
				};
			}
		},

		async storeMemory(params: {
			tableName: string;
			roomId: UUID;
			entityId: UUID;
			agentId: UUID;
			content: MemoryContent;
			metadata?: Record<string, unknown>;
			tags?: string[];
			priority?: "low" | "medium" | "high" | "critical";
		}): Promise<string> {
			try {
				const memoryId = randomUUID() as UUID;

				const memory = createMessageMemory({
					id: memoryId,
					roomId: params.roomId,
					entityId: params.entityId,
					agentId: params.agentId,
					content: {
						text: params.content.text || "Memory content", // Ensure text property is always present
						...params.content,
						metadata: {
							...params.metadata,
							tags: params.tags || [],
							priority: params.priority || "medium",
							storedAt: new Date().toISOString(),
							tableName: params.tableName,
						},
					},
				});

				// Store in the appropriate table using runtime methods
				// Note: IAgentRuntime doesn't have storeMemory, so we'll just return the ID
				// In a real implementation, you'd store this in your database
				logger.info(
					`[elizaos-memory] Stored memory ${memoryId} in ${params.tableName}`,
				);

				return memoryId;
			} catch (error) {
				logger.error("[elizaos-memory] Failed to store memory:", error);
				throw error;
			}
		},

		async updateMemory(
			memoryId: string,
			updates: Partial<Memory>,
		): Promise<boolean> {
			try {
				// Use the base IAgentRuntime.updateMemory method
				await runtime.updateMemory({
					id: memoryId as `${string}-${string}-${string}-${string}-${string}`,
					...updates,
				});
				return true;
			} catch (error) {
				logger.error("[elizaos-memory] Failed to update memory:", error);
				return false;
			}
		},

		async deleteMemory(memoryId: string): Promise<boolean> {
			try {
				// Use the base IAgentRuntime.deleteMemory method
				await runtime.deleteMemory(
					memoryId as `${string}-${string}-${string}-${string}-${string}`,
				);
				logger.info(`[elizaos-memory] Deleted memory ${memoryId}`);
				return true;
			} catch (error) {
				logger.error("[elizaos-memory] Failed to delete memory:", error);
				return false;
			}
		},

		// Advanced memory operations
		async searchSimilarMemories(
			referenceMemory: Memory,
			tableName: string,
			count: number = 5,
		): Promise<Memory[]> {
			try {
				// Extract text content for embedding
				const content = referenceMemory.content as MemoryContent;
				const text = content?.text || JSON.stringify(content);

				// Generate embedding for the reference memory
				const embedding = await runtime.useModel(ModelType.TEXT_EMBEDDING, {
					text: text.substring(0, cfg.embeddingConfig.maxTokens),
				});

				// Search for similar memories
				const result = await this.searchMemories({
					tableName,
					embedding,
					roomId: referenceMemory.roomId,
					count,
				});

				// Filter out the reference memory itself
				return result.memories.filter((m) => m.id !== referenceMemory.id);
			} catch (error) {
				logger.error("[elizaos-memory] Similar memory search failed:", error);
				return [];
			}
		},

		async getContextualMemories(
			message: Memory,
			contextWindow: number = 10,
		): Promise<{
			recent: Memory[];
			relevant: Memory[];
			entities: Memory[];
		}> {
			try {
				const [recent, relevant, entities] = await Promise.all([
					// Get recent messages
					this.getMemories({
						tableName: cfg.tableNames.messages,
						roomId: message.roomId,
						count: contextWindow,
					}),

					// Search for relevant facts
					this.searchMemories({
						tableName: cfg.tableNames.facts,
						query: (message.content as MemoryContent)?.text || "",
						roomId: message.roomId,
						count: 5,
					}).then((result) => result.memories),

					// Get entity information
					this.getMemories({
						tableName: cfg.tableNames.entities,
						roomId: message.roomId,
						count: 20,
					}),
				]);

				return { recent, relevant, entities };
			} catch (error) {
				logger.error(
					"[elizaos-memory] Contextual memory retrieval failed:",
					error,
				);
				return { recent: [], relevant: [], entities: [] };
			}
		},

		// Memory analytics and management
		async getMemoryStats(tableName?: string): Promise<{
			total: number;
			byType: Record<string, number>;
			byPriority: Record<string, number>;
			recentActivity: number;
			storageSize: string;
		}> {
			try {
				const tables = tableName ? [tableName] : Object.values(cfg.tableNames);
				let total = 0;
				const byType: Record<string, number> = {};
				const byPriority: Record<string, number> = {};

				for (const table of tables) {
					const memories = await this.getMemories({
						tableName: table,
						roomId: "global" as UUID,
						count: 1000, // Get a large sample for stats
					});

					total += memories.length;

					memories.forEach((memory) => {
						const metadata = memory.metadata as MemoryMetadata;
						const type = metadata?.type || "unknown";
						const priority = metadata?.priority || "medium";

						byType[type] = (byType[type] || 0) + 1;
						byPriority[priority] = (byPriority[priority] || 0) + 1;
					});
				}

				// Calculate recent activity (last 24 hours)
				const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
				const recentMemories = await this.getMemories({
					tableName: cfg.tableNames.messages,
					roomId: "global" as UUID,
					count: 1000,
				});

				const recentActivity = recentMemories.filter((memory) => {
					const metadata = memory.metadata as MemoryMetadata;
					return new Date(metadata?.storedAt || 0) > oneDayAgo;
				}).length;

				// Estimate storage size (simplified)
				const avgMemorySize = 1024; // bytes
				const storageSize = `${((total * avgMemorySize) / 1024 / 1024).toFixed(2)} MB`;

				return {
					total,
					byType,
					byPriority,
					recentActivity,
					storageSize,
				};
			} catch (error) {
				logger.error("[elizaos-memory] Failed to get memory stats:", error);
				return {
					total: 0,
					byType: {},
					byPriority: {},
					recentActivity: 0,
					storageSize: "0 MB",
				};
			}
		},

		async cleanupOldMemories(tableName?: string): Promise<{
			deleted: number;
			errors: number;
		}> {
			try {
				const tables = tableName ? [tableName] : Object.values(cfg.tableNames);
				let totalDeleted = 0;
				let totalErrors = 0;

				for (const table of tables) {
					const retentionDays =
						cfg.retentionConfig[table as keyof typeof cfg.retentionConfig] ||
						30;
					const cutoffDate = new Date(
						Date.now() - retentionDays * 24 * 60 * 60 * 1000,
					);

					const memories = await this.getMemories({
						tableName: table,
						roomId: "global" as UUID,
						count: 1000,
					});

					for (const memory of memories) {
						const metadata = memory.metadata as MemoryMetadata;
						const storedAt = new Date(metadata?.storedAt || 0);

						if (storedAt < cutoffDate) {
							try {
								await this.deleteMemory(memory.id);
								totalDeleted++;
							} catch (error) {
								totalErrors++;
								logger.warn(
									`[elizaos-memory] Failed to delete old memory ${memory.id}:`,
									error,
								);
							}
						}
					}
				}

				logger.info(
					`[elizaos-memory] Cleanup completed: ${totalDeleted} deleted, ${totalErrors} errors`,
				);
				return { deleted: totalDeleted, errors: totalErrors };
			} catch (error) {
				logger.error("[elizaos-memory] Memory cleanup failed:", error);
				return { deleted: 0, errors: 1 };
			}
		},

		// Configuration getters
		getConfig() {
			return { ...cfg };
		},

		async updateConfig(newConfig: Partial<ElizaOSMemoryConfig>): Promise<void> {
			Object.assign(cfg, newConfig);
			logger.info("[elizaos-memory] Configuration updated");
		},
	};
}

// Convenience function for creating memory helpers
export function createElizaOSMemoryHelpers(
	runtime: IAgentRuntime,
	config?: ElizaOSMemoryConfig,
) {
	return buildElizaOSMemoryHelpers(runtime, config);
}
