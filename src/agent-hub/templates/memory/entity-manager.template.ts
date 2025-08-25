import {
	type IAgentRuntime,
	logger,
	type Memory,
	type ModelType,
	type UUID,
} from "@elizaos/core";

export type EntityManagerConfig = {
	enabled?: boolean;
	autoResolution?: boolean;
	relationshipTracking?: boolean;
	entityCache?: {
		enabled?: boolean;
		maxSize?: number;
		ttl?: number; // seconds
	};
	resolutionConfig?: {
		confidenceThreshold?: number;
		maxCandidates?: number;
		useLLM?: boolean;
		fallbackToFuzzy?: boolean;
	};
};

export type EntityReference = {
	entityId: UUID;
	confidence: number;
	resolutionType:
		| "EXACT_MATCH"
		| "USERNAME_MATCH"
		| "NAME_MATCH"
		| "RELATIONSHIP_MATCH"
		| "AMBIGUOUS"
		| "UNKNOWN";
	matches: Array<{
		field: string;
		value: string;
		score: number;
	}>;
	metadata?: Record<string, any>;
};

export type EntityRelationship = {
	sourceEntityId: UUID;
	targetEntityId: UUID;
	relationshipType: string;
	strength: number;
	bidirectional: boolean;
	metadata: Record<string, any>;
	lastInteraction: string;
	interactionCount: number;
};

export type EntityProfile = {
	entityId: UUID;
	primaryName: string;
	aliases: string[];
	usernames: string[];
	metadata: Record<string, any>;
	relationships: EntityRelationship[];
	lastSeen: string;
	interactionCount: number;
	trustScore: number;
	tags: string[];
	permissions: string[];
};

export function buildEntityManager(
	runtime: IAgentRuntime,
	config: EntityManagerConfig = {},
) {
	const cfg = {
		enabled: config.enabled ?? true,
		autoResolution: config.autoResolution ?? true,
		relationshipTracking: config.relationshipTracking ?? true,
		entityCache: {
			enabled: config.entityCache?.enabled ?? true,
			maxSize: config.entityCache?.maxSize ?? 1000,
			ttl: config.entityCache?.ttl ?? 3600, // 1 hour
		},
		resolutionConfig: {
			confidenceThreshold: config.resolutionConfig?.confidenceThreshold ?? 0.7,
			maxCandidates: config.resolutionConfig?.maxCandidates ?? 5,
			useLLM: config.resolutionConfig?.useLLM ?? true,
			fallbackToFuzzy: config.resolutionConfig?.fallbackToFuzzy ?? true,
		},
	};

	if (!cfg.enabled) {
		logger.warn("[entity-manager] Entity management disabled");
		return null;
	}

	// In-memory entity cache
	const entityCache = new Map<
		string,
		{ entity: EntityProfile; timestamp: number }
	>();

	const entityManager = {
		// Entity resolution using elizaOS patterns
		async resolveEntity(
			message: Memory,
			state?: Record<string, unknown>,
			context?: string,
		): Promise<EntityReference | null> {
			try {
				if (!cfg.autoResolution) {
					return null;
				}

				// Extract potential entity references from message content
				const content = message.content as any;
				const text = content?.text || "";

				if (!text) {
					return null;
				}

				// Check cache first
				const cacheKey = `resolve:${text}:${message.roomId}`;
				const cached = entityCache.get(cacheKey);
				if (
					cached &&
					Date.now() - cached.timestamp < cfg.entityCache.ttl * 1000
				) {
					logger.debug("[entity-manager] Using cached entity resolution");
					return {
						entityId: cached.entity.entityId,
						confidence: 0.9,
						resolutionType: "EXACT_MATCH",
						matches: [
							{ field: "name", value: cached.entity.primaryName, score: 0.9 },
						],
					};
				}

				// Use elizaOS entity resolution if available
				if (cfg.resolutionConfig.useLLM && (runtime as any).findEntityByName) {
					try {
						const entity = await (runtime as any).findEntityByName(
							runtime,
							message,
							state,
						);
						if (entity) {
							const reference: EntityReference = {
								entityId: entity.id,
								confidence: 0.8,
								resolutionType: "EXACT_MATCH",
								matches: [{ field: "id", value: entity.id, score: 0.8 }],
								metadata: { source: "elizaos-runtime" },
							};

							// Cache the result
							if (cfg.entityCache.enabled) {
								entityManager.cacheEntity(entity.id, entity);
								entityCache.set(cacheKey, {
									entity: entityManager.entityToProfile(entity),
									timestamp: Date.now(),
								});
							}

							return reference;
						}
					} catch (error) {
						logger.warn(
							"[entity-manager] ElizaOS entity resolution failed, falling back to local search",
						);
					}
				}

				// Fallback to local entity search
				return await entityManager.localEntitySearch(text, message.roomId);
			} catch (error) {
				logger.error("[entity-manager] Entity resolution failed:", error);
				return null;
			}
		},

		// Local entity search as fallback
		async localEntitySearch(
			query: string,
			roomId: UUID,
		): Promise<EntityReference | null> {
			try {
				// Search for entities in the room
				const entities = await runtime.getMemories({
					tableName: "entities",
					roomId,
					count: 100,
				});

				let bestMatch: EntityReference | null = null;
				let bestScore = 0;

				for (const entity of entities) {
					const content = entity.content as any;
					const names = content?.names || [];
					const usernames = content?.usernames || [];
					const aliases = content?.aliases || [];

					// Calculate match score
					const nameScore = entityManager.calculateStringSimilarity(
						query,
						names,
					);
					const usernameScore = entityManager.calculateStringSimilarity(
						query,
						usernames,
					);
					const aliasScore = entityManager.calculateStringSimilarity(
						query,
						aliases,
					);

					const maxScore = Math.max(nameScore, usernameScore, aliasScore);

					if (
						maxScore > bestScore &&
						maxScore >= cfg.resolutionConfig.confidenceThreshold
					) {
						bestScore = maxScore;
						bestMatch = {
							entityId: entity.entityId,
							confidence: maxScore,
							resolutionType:
								maxScore > 0.9
									? "EXACT_MATCH"
									: maxScore > 0.7
										? "NAME_MATCH"
										: maxScore > 0.5
											? "USERNAME_MATCH"
											: "AMBIGUOUS",
							matches: [
								{ field: "name", value: names[0] || "", score: nameScore },
								{
									field: "username",
									value: usernames[0] || "",
									score: usernameScore,
								},
								{ field: "alias", value: aliases[0] || "", score: aliasScore },
							].filter((match) => match.score > 0),
						};
					}
				}

				return bestMatch;
			} catch (error) {
				logger.error("[entity-manager] Local entity search failed:", error);
				return null;
			}
		},

		// Entity profile management
		async getEntityProfile(entityId: UUID): Promise<EntityProfile | null> {
			try {
				// Check cache first
				if (cfg.entityCache.enabled) {
					const cached = entityCache.get(entityId);
					if (
						cached &&
						Date.now() - cached.timestamp < cfg.entityCache.ttl * 1000
					) {
						return cached.entity;
					}
				}

				// Get entity from runtime
				const entity = await (runtime as any).getEntityDetails?.(entityId);
				if (!entity) {
					return null;
				}

				const profile = entityManager.entityToProfile(entity);

				// Cache the profile
				if (cfg.entityCache.enabled) {
					entityManager.cacheEntity(entityId, profile);
				}

				return profile;
			} catch (error) {
				logger.error("[entity-manager] Failed to get entity profile:", error);
				return null;
			}
		},

		async updateEntityProfile(
			entityId: UUID,
			updates: Partial<EntityProfile>,
		): Promise<boolean> {
			try {
				// Update in runtime if available
				if ((runtime as any).updateEntity) {
					await (runtime as any).updateEntity(entityId, updates);
				}

				// Update cache
				if (cfg.entityCache.enabled) {
					const cached = entityCache.get(entityId);
					if (cached) {
						const updated = { ...cached.entity, ...updates };
						entityCache.set(entityId, {
							entity: updated,
							timestamp: Date.now(),
						});
					}
				}

				logger.info(`[entity-manager] Updated entity profile for ${entityId}`);
				return true;
			} catch (error) {
				logger.error(
					"[entity-manager] Failed to update entity profile:",
					error,
				);
				return false;
			}
		},

		// Relationship management
		async addRelationship(
			sourceEntityId: UUID,
			targetEntityId: UUID,
			relationshipType: string,
			metadata: Record<string, any> = {},
		): Promise<boolean> {
			try {
				if (!cfg.relationshipTracking) {
					return false;
				}

				const relationship: EntityRelationship = {
					sourceEntityId,
					targetEntityId,
					relationshipType,
					strength: 1.0,
					bidirectional: false,
					metadata,
					lastInteraction: new Date().toISOString(),
					interactionCount: 1,
				};

				// Store relationship in runtime
				if ((runtime as any).storeMemory) {
					await (runtime as any).storeMemory({
						tableName: "relationships",
						roomId: "global" as UUID,
						entityId: sourceEntityId,
						agentId: (runtime as any).agentId,
						content: relationship,
					});
				}

				// Update cache
				entityManager.updateEntityRelationships(sourceEntityId, relationship);

				logger.info(
					`[entity-manager] Added relationship: ${sourceEntityId} -> ${targetEntityId} (${relationshipType})`,
				);
				return true;
			} catch (error) {
				logger.error("[entity-manager] Failed to add relationship:", error);
				return false;
			}
		},

		async getEntityRelationships(
			entityId: UUID,
			relationshipType?: string,
		): Promise<EntityRelationship[]> {
			try {
				const relationships = await runtime.getMemories({
					tableName: "relationships",
					roomId: "global" as UUID,
					count: 100,
				});

				let filtered = relationships
					.filter((rel) => {
						const content = rel.content as EntityRelationship;
						return (
							content.sourceEntityId === entityId ||
							content.targetEntityId === entityId
						);
					})
					.map((rel) => rel.content as EntityRelationship);

				if (relationshipType) {
					filtered = filtered.filter(
						(rel) => rel.relationshipType === relationshipType,
					);
				}

				return filtered;
			} catch (error) {
				logger.error(
					"[entity-manager] Failed to get entity relationships:",
					error,
				);
				return [];
			}
		},

		// Entity analytics
		async getEntityStats(entityId: UUID): Promise<{
			totalInteractions: number;
			relationshipCount: number;
			trustScore: number;
			lastActivity: string;
			activityTrend: "increasing" | "stable" | "decreasing";
		}> {
			try {
				const profile = await entityManager.getEntityProfile(entityId);
				if (!profile) {
					return {
						totalInteractions: 0,
						relationshipCount: 0,
						trustScore: 0,
						lastActivity: "",
						activityTrend: "stable",
					};
				}

				const relationships =
					await entityManager.getEntityRelationships(entityId);
				const lastActivity = profile.lastSeen;

				// Calculate activity trend (simplified)
				const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
				const recentActivity = new Date(lastActivity) > oneWeekAgo;
				const activityTrend: "increasing" | "stable" | "decreasing" =
					recentActivity ? "increasing" : "stable";

				return {
					totalInteractions: profile.interactionCount,
					relationshipCount: relationships.length,
					trustScore: profile.trustScore,
					lastActivity,
					activityTrend,
				};
			} catch (error) {
				logger.error("[entity-manager] Failed to get entity stats:", error);
				return {
					totalInteractions: 0,
					relationshipCount: 0,
					trustScore: 0,
					lastActivity: "",
					activityTrend: "stable",
				};
			}
		},

		// Utility functions
		calculateStringSimilarity(query: string, candidates: string[]): number {
			if (!candidates.length) return 0;

			const queryLower = query.toLowerCase();
			let bestScore = 0;

			for (const candidate of candidates) {
				const candidateLower = candidate.toLowerCase();

				// Exact match
				if (queryLower === candidateLower) {
					return 1.0;
				}

				// Contains match
				if (
					candidateLower.includes(queryLower) ||
					queryLower.includes(candidateLower)
				) {
					const score =
						Math.min(queryLower.length, candidateLower.length) /
						Math.max(queryLower.length, candidateLower.length);
					bestScore = Math.max(bestScore, score * 0.8);
				}

				// Fuzzy match using simple character overlap
				const queryChars = new Set(queryLower.split(""));
				const candidateChars = new Set(candidateLower.split(""));
				const intersection = new Set(
					Array.from(queryChars).filter((x) => candidateChars.has(x)),
				);
				const union = new Set(
					Array.from(queryChars).concat(Array.from(candidateChars)),
				);

				if (union.size > 0) {
					const jaccard = intersection.size / union.size;
					bestScore = Math.max(bestScore, jaccard * 0.6);
				}
			}

			return bestScore;
		},

		entityToProfile(entity: Record<string, unknown>): EntityProfile {
			return {
				entityId:
					entity.id as `${string}-${string}-${string}-${string}-${string}`,
				primaryName: (entity.names as string[])?.[0] || "Unknown",
				aliases: (entity.names as string[])?.slice(1) || [],
				usernames: (entity.usernames as string[]) || [],
				metadata: (entity.metadata as Record<string, unknown>) || {},
				relationships: (entity.relationships as EntityRelationship[]) || [],
				lastSeen: (entity.lastSeen as string) || new Date().toISOString(),
				interactionCount: (entity.interactionCount as number) || 0,
				trustScore: (entity.trustScore as number) || 0.5,
				tags: (entity.tags as string[]) || [],
				permissions: (entity.permissions as string[]) || [],
			};
		},

		cacheEntity(entityId: UUID, entity: EntityProfile): void {
			if (!cfg.entityCache.enabled) return;

			// Implement LRU cache eviction
			if (entityCache.size >= cfg.entityCache.maxSize) {
				const oldestKey = entityCache.keys().next().value;
				entityCache.delete(oldestKey);
			}

			entityCache.set(entityId, { entity, timestamp: Date.now() });
		},

		updateEntityRelationships(
			entityId: UUID,
			relationship: EntityRelationship,
		): void {
			if (!cfg.entityCache.enabled) return;

			const cached = entityCache.get(entityId);
			if (cached) {
				cached.entity.relationships.push(relationship);
				cached.timestamp = Date.now();
			}
		},

		// Configuration management
		getConfig() {
			return { ...cfg };
		},

		async updateConfig(newConfig: Partial<EntityManagerConfig>): Promise<void> {
			Object.assign(cfg, newConfig);
			logger.info("[entity-manager] Configuration updated");
		},

		// Cache management
		clearCache(): void {
			entityCache.clear();
			logger.info("[entity-manager] Cache cleared");
		},

		getCacheStats(): {
			size: number;
			maxSize: number;
			hitRate: number;
		} {
			// Simplified cache stats
			return {
				size: entityCache.size,
				maxSize: cfg.entityCache.maxSize,
				hitRate: 0.8, // Placeholder
			};
		},
	};

	return entityManager;
}

// Convenience function for creating entity manager
export function createEntityManager(
	runtime: IAgentRuntime,
	config?: EntityManagerConfig,
) {
	return buildEntityManager(runtime, config);
}
