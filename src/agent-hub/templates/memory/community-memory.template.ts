import { createMessageMemory, type Memory, type UUID } from "@elizaos/core";
import { randomUUID } from "crypto";

export type CommunityMemoryConfig = {
	enabled?: boolean;
	retentionDays?: number;
	maxEntries?: number;
	categories?: string[];
};

export type CommunityMemoryEntry = {
	id: string;
	type: "member" | "content" | "moderation" | "event" | "analytics";
	data: any;
	timestamp: string;
	tags: string[];
	priority: "low" | "medium" | "high" | "critical";
};

export type CommunityMemoryQuery = {
	type?: CommunityMemoryEntry["type"];
	tags?: string[];
	priority?: CommunityMemoryEntry["priority"];
	dateRange?: {
		start: string;
		end: string;
	};
	limit?: number;
};

export function buildCommunityMemoryHelpers(
	config: CommunityMemoryConfig = {},
) {
	const cfg = {
		enabled: config.enabled ?? true,
		retentionDays: config.retentionDays ?? 90,
		maxEntries: config.maxEntries ?? 10000,
		categories: config.categories ?? [
			"general",
			"moderation",
			"analytics",
			"events",
		],
	};

	// In-memory storage (in production, this would be persistent)
	const memoryStore = new Map<string, CommunityMemoryEntry>();

	return {
		// Store community memory
		store: (entry: Omit<CommunityMemoryEntry, "id" | "timestamp">): string => {
			if (!cfg.enabled) return "";

			const id = randomUUID();
			const timestamp = new Date().toISOString();

			const memoryEntry: CommunityMemoryEntry = {
				id,
				timestamp,
				...entry,
			};

			memoryStore.set(id, memoryEntry);

			// Cleanup old entries if we exceed max
			if (memoryStore.size > cfg.maxEntries) {
				// Use the built-in cleanup method
				const deletedCount = this.cleanup();
				if (deletedCount > 0) {
					console.log(`Cleaned up ${deletedCount} old memory entries`);
				}
			}

			return id;
		},

		// Retrieve community memory
		retrieve: (query: CommunityMemoryQuery = {}): CommunityMemoryEntry[] => {
			if (!cfg.enabled) return [];

			let results = Array.from(memoryStore.values());

			// Filter by type
			if (query.type) {
				results = results.filter((entry) => entry.type === query.type);
			}

			// Filter by tags
			if (query.tags && query.tags.length > 0) {
				results = results.filter((entry) =>
					query.tags!.some((tag) => entry.tags.includes(tag)),
				);
			}

			// Filter by priority
			if (query.priority) {
				results = results.filter((entry) => entry.priority === query.priority);
			}

			// Filter by date range
			if (query.dateRange) {
				const start = new Date(query.dateRange.start);
				const end = new Date(query.dateRange.end);
				results = results.filter((entry) => {
					const entryDate = new Date(entry.timestamp);
					return entryDate >= start && entryDate <= end;
				});
			}

			// Sort by timestamp (newest first)
			results.sort(
				(a, b) =>
					new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
			);

			// Apply limit
			if (query.limit) {
				results = results.slice(0, query.limit);
			}

			return results;
		},

		// Get memory by ID
		getById: (id: string): CommunityMemoryEntry | undefined => {
			if (!cfg.enabled) return undefined;
			return memoryStore.get(id);
		},

		// Update memory entry
		update: (id: string, updates: Partial<CommunityMemoryEntry>): boolean => {
			if (!cfg.enabled) return false;

			const entry = memoryStore.get(id);
			if (!entry) return false;

			const updatedEntry = { ...entry, ...updates };
			memoryStore.set(id, updatedEntry);
			return true;
		},

		// Delete memory entry
		delete: (id: string): boolean => {
			if (!cfg.enabled) return false;
			return memoryStore.delete(id);
		},

		// Search memory by text
		search: (
			searchTerm: string,
			query: CommunityMemoryQuery = {},
		): CommunityMemoryEntry[] => {
			if (!cfg.enabled) return [];

			const results = this.retrieve(query);

			return results.filter((entry) => {
				const searchableText = JSON.stringify(entry.data).toLowerCase();
				return searchableText.includes(searchTerm.toLowerCase());
			});
		},

		// Get memory statistics
		getStats: () => {
			if (!cfg.enabled) return null;

			const entries = Array.from(memoryStore.values());
			const now = new Date();
			const retentionDate = new Date(
				now.getTime() - cfg.retentionDays * 24 * 60 * 60 * 1000,
			);

			const totalEntries = entries.length;
			const entriesByType = entries.reduce(
				(acc, entry) => {
					acc[entry.type] = (acc[entry.type] || 0) + 1;
					return acc;
				},
				{} as Record<string, number>,
			);

			const entriesByPriority = entries.reduce(
				(acc, entry) => {
					acc[entry.priority] = (acc[entry.priority] || 0) + 1;
					return acc;
				},
				{} as Record<string, number>,
			);

			const recentEntries = entries.filter(
				(entry) => new Date(entry.timestamp) >= retentionDate,
			).length;

			return {
				total: totalEntries,
				byType: entriesByType,
				byPriority: entriesByPriority,
				recent: recentEntries,
				retentionDays: cfg.retentionDays,
				maxEntries: cfg.maxEntries,
			};
		},

		// Cleanup old entries
		cleanup: () => {
			if (!cfg.enabled) return 0;

			const now = new Date();
			const cutoffDate = new Date(
				now.getTime() - cfg.retentionDays * 24 * 60 * 60 * 1000,
			);

			let deletedCount = 0;
			memoryStore.forEach((entry, id) => {
				if (new Date(entry.timestamp) < cutoffDate) {
					memoryStore.delete(id);
					deletedCount++;
				}
			});

			return deletedCount;
		},

		// Export memory data
		export: (format: "json" | "csv" = "json"): string => {
			if (!cfg.enabled) return "";

			const entries = Array.from(memoryStore.values());

			if (format === "csv") {
				return exportToCSV(entries);
			} else {
				return JSON.stringify(entries, null, 2);
			}
		},

		// Import memory data
		import: (data: string, format: "json" | "csv" = "json"): number => {
			if (!cfg.enabled) return 0;

			try {
				let entries: CommunityMemoryEntry[];

				if (format === "csv") {
					entries = importFromCSV(data);
				} else {
					entries = JSON.parse(data);
				}

				let importedCount = 0;
				for (const entry of entries) {
					if (isValidMemoryEntry(entry)) {
						const id = randomUUID();
						memoryStore.set(id, { ...entry, id });
						importedCount++;
					}
				}

				return importedCount;
			} catch (error) {
				console.error("Failed to import memory data:", error);
				return 0;
			}
		},
	};
}

// Helper functions
function exportToCSV(entries: CommunityMemoryEntry[]): string {
	if (entries.length === 0) return "";

	const headers = ["id", "type", "timestamp", "priority", "tags", "data"];
	const csvRows = [headers.join(",")];

	for (const entry of entries) {
		const row = [
			entry.id,
			entry.type,
			entry.timestamp,
			entry.priority,
			entry.tags.join(";"),
			JSON.stringify(entry.data).replace(/"/g, '""'),
		];
		csvRows.push(row.join(","));
	}

	return csvRows.join("\n");
}

function importFromCSV(csvData: string): CommunityMemoryEntry[] {
	const lines = csvData.trim().split("\n");
	if (lines.length < 2) return [];

	const headers = lines[0].split(",");
	const entries: CommunityMemoryEntry[] = [];

	for (let i = 1; i < lines.length; i++) {
		const values = lines[i].split(",");
		if (values.length !== headers.length) continue;

		try {
			const entry: CommunityMemoryEntry = {
				id: values[0] || randomUUID(),
				type: (values[1] as CommunityMemoryEntry["type"]) || "member",
				timestamp: values[2] || new Date().toISOString(),
				priority: (values[3] as CommunityMemoryEntry["priority"]) || "medium",
				tags: values[4] ? values[4].split(";") : [],
				data: values[5] ? JSON.parse(values[5]) : {},
			};

			if (isValidMemoryEntry(entry)) {
				entries.push(entry);
			}
		} catch (error) {
			console.warn("Skipping invalid CSV row:", lines[i]);
		}
	}

	return entries;
}

function isValidMemoryEntry(entry: any): entry is CommunityMemoryEntry {
	return (
		entry &&
		typeof entry.type === "string" &&
		["member", "content", "moderation", "event", "analytics"].includes(
			entry.type,
		) &&
		typeof entry.timestamp === "string" &&
		Array.isArray(entry.tags) &&
		typeof entry.priority === "string" &&
		["low", "medium", "high", "critical"].includes(entry.priority) &&
		typeof entry.data === "object"
	);
}

// Convenience functions for common memory operations
export const communityMemory = {
	// Member-related memory
	storeMember: (
		memberData: any,
		tags: string[] = [],
		priority: CommunityMemoryEntry["priority"] = "medium",
	) => {
		return buildCommunityMemoryHelpers().store({
			type: "member",
			data: memberData,
			tags,
			priority,
		});
	},

	// Content-related memory
	storeContent: (
		contentData: any,
		tags: string[] = [],
		priority: CommunityMemoryEntry["priority"] = "medium",
	) => {
		return buildCommunityMemoryHelpers().store({
			type: "content",
			data: contentData,
			tags,
			priority,
		});
	},

	// Moderation-related memory
	storeModeration: (
		moderationData: any,
		tags: string[] = [],
		priority: CommunityMemoryEntry["priority"] = "high",
	) => {
		return buildCommunityMemoryHelpers().store({
			type: "moderation",
			data: moderationData,
			tags,
			priority,
		});
	},

	// Event-related memory
	storeEvent: (
		eventData: any,
		tags: string[] = [],
		priority: CommunityMemoryEntry["priority"] = "medium",
	) => {
		return buildCommunityMemoryHelpers().store({
			type: "event",
			data: eventData,
			tags,
			priority,
		});
	},

	// Analytics-related memory
	storeAnalytics: (
		analyticsData: any,
		tags: string[] = [],
		priority: CommunityMemoryEntry["priority"] = "low",
	) => {
		return buildCommunityMemoryHelpers().store({
			type: "analytics",
			data: analyticsData,
			tags,
			priority,
		});
	},
};
