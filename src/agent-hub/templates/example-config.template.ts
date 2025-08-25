import type { TemplateBuilderConfig } from "./template-builder.template";
import { buildTemplates, TemplateBuilder } from "./template-builder.template";

/**
 * Example configuration for building a comprehensive agent with all template features
 * This demonstrates how to configure and use the template system
 */

// Example 1: Full configuration with all features enabled
export const fullAgentConfig: TemplateBuilderConfig = {
	flags: {
		raids: true,
		moderation: true,
		memory: true,
		social: true,
		community: true,
		engagement: true,
		sentiment: true,
		toxicity: true,
		heartbeatService: true,
		sessionsService: true,
		analyticsService: true,
	},

	character: {
		name: "NUBI Community Manager",
		bio: [
			"Advanced AI community manager",
			"Expert in community building and moderation",
			"Social media engagement specialist",
		],
		topics: [
			"Community management",
			"Social media strategy",
			"Content moderation",
			"Member engagement",
		],
		system:
			"You are an expert community manager AI designed to build and maintain thriving online communities.",
		plugins: [
			"@elizaos/plugin-sql",
			"@elizaos/plugin-openai",
			"@elizaos/plugin-bootstrap",
			"@elizaos/plugin-discord",
			"@elizaos/plugin-telegram",
		],
	},

	actions: {
		raids: {
			enabled: true,
			intervalHours: 6,
			maxConcurrent: 3,
			minParticipants: 5,
			points: {
				like: 1,
				retweet: 2,
				comment: 3,
				join: 5,
			},
		},
		moderation: {
			enabled: true,
			autoModerate: true,
			responseTime: 5,
		},
		memory: {
			enabled: true,
			roomId: "community-hub",
		},
		social: {
			enabled: true,
			platforms: {
				twitter: true,
				discord: true,
				telegram: true,
				instagram: false,
			},
			autoResponse: true,
			engagementThreshold: 0.7,
		},
		community: {
			enabled: true,
			maxMembers: 10000,
			autoWelcome: true,
			moderationLevel: "medium",
		},
	},

	services: {
		heartbeat: {
			enabled: true,
			intervalMs: 30000,
			label: "community-hb",
		},
		sessions: {
			enabled: true,
			maxSessions: 1000,
			sessionTimeout: 3600,
		},
		analytics: {
			enabled: true,
			trackingEnabled: true,
			retentionDays: 90,
		},
		community: {
			enabled: true,
			maxMembers: 10000,
			autoModeration: true,
			welcomeMessages: true,
			analytics: true,
		},
	},

	evaluators: {
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
	},

	memory: {
		community: {
			enabled: true,
			retentionDays: 90,
			maxEntries: 50000,
			categories: ["members", "content", "moderation", "events", "analytics"],
		},
	},

	prompts: {
		community: {
			tone: "friendly",
			language: "en",
			includeEmojis: true,
			maxLength: 500,
		},
	},
};

// Example 2: Minimal configuration for basic community management
export const minimalCommunityConfig: TemplateBuilderConfig = {
	flags: {
		community: true,
		moderation: true,
		memory: true,
	},

	character: {
		name: "Simple Community Bot",
		bio: ["Basic community management bot"],
		plugins: ["@elizaos/plugin-sql", "@elizaos/plugin-bootstrap"],
	},

	actions: {
		community: {
			enabled: true,
			maxMembers: 1000,
			autoWelcome: true,
			moderationLevel: "low",
		},
		moderation: {
			enabled: true,
			autoModerate: false,
		},
		memory: {
			enabled: true,
		},
	},

	services: {
		community: {
			enabled: true,
			maxMembers: 1000,
			autoModeration: false,
			welcomeMessages: true,
			analytics: false,
		},
	},

	memory: {
		community: {
			enabled: true,
			retentionDays: 30,
			maxEntries: 1000,
		},
	},

	prompts: {
		community: {
			tone: "casual",
			includeEmojis: false,
			maxLength: 200,
		},
	},
};

// Example 3: Social media focused configuration
export const socialMediaConfig: TemplateBuilderConfig = {
	flags: {
		social: true,
		raids: true,
		engagementEval: true,
	},

	character: {
		name: "Social Media Agent",
		bio: ["Social media engagement specialist"],
		topics: [
			"Social media strategy",
			"Content creation",
			"Audience engagement",
		],
		plugins: [
			"@elizaos/plugin-sql",
			"@elizaos/plugin-openai",
			"@elizaos/plugin-twitter",
			"@elizaos/plugin-discord",
		],
	},

	actions: {
		social: {
			enabled: true,
			platforms: {
				twitter: true,
				discord: true,
				telegram: false,
				instagram: false,
			},
			autoResponse: true,
			engagementThreshold: 0.8,
		},
		raids: {
			enabled: true,
			intervalHours: 4,
			maxConcurrent: 5,
			minParticipants: 10,
			points: {
				like: 1,
				retweet: 3,
				comment: 5,
				join: 10,
			},
		},
	},

	services: {
		analytics: {
			enabled: true,
			trackingEnabled: true,
			retentionDays: 60,
		},
	},
};

// Example usage functions
export function createFullAgent() {
	return buildTemplates(fullAgentConfig);
}

export function createMinimalCommunity() {
	return buildTemplates(minimalCommunityConfig);
}

export function createSocialMediaAgent() {
	return buildTemplates(socialMediaConfig);
}

// Example of using individual template builders
export function buildCustomCharacter() {
	return TemplateBuilder.character({
		name: "Custom Bot",
		bio: ["Custom community bot"],
		topics: ["Custom topics"],
		plugins: ["@elizaos/plugin-sql"],
	});
}

export function buildCustomActions() {
	return TemplateBuilder.actions({
		community: {
			enabled: true,
			maxMembers: 5000,
			autoWelcome: true,
			moderationLevel: "high",
		},
		social: {
			enabled: true,
			platforms: { twitter: true, discord: true },
			autoResponse: false,
		},
	});
}

export function buildCustomEvaluators() {
	return TemplateBuilder.evaluators({
		community: {
			enabled: true,
			metrics: {
				engagementThreshold: 0.8,
				activityThreshold: 0.7,
				growthThreshold: 0.15,
				toxicityThreshold: 0.2,
			},
		},
	});
}

// Example of using memory helpers
export function setupMemory() {
	return TemplateBuilder.memory({
		enabled: true,
		retentionDays: 60,
		maxEntries: 10000,
		categories: ["custom", "moderation", "analytics"],
	});
}

// Example of using prompt templates
export function setupPrompts() {
	return TemplateBuilder.prompts({
		tone: "authoritative",
		language: "en",
		includeEmojis: false,
		maxLength: 300,
	});
}

// Example of building everything with custom configuration
export function buildCustomAgent(customConfig: Partial<TemplateBuilderConfig>) {
	const baseConfig: TemplateBuilderConfig = {
		flags: {
			community: true,
			moderation: true,
			memory: true,
		},
		character: {
			name: "Custom Agent",
			bio: ["Custom AI agent"],
			plugins: ["@elizaos/plugin-sql"],
		},
		actions: {
			community: {
				enabled: true,
				maxMembers: 1000,
				autoWelcome: true,
				moderationLevel: "medium",
			},
		},
		...customConfig,
	};

	return buildTemplates(baseConfig);
}
