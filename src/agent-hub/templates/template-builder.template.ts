import type {
	Action,
	Character,
	Evaluator,
	IAgentRuntime,
	Service,
} from "@elizaos/core";
import {
	buildCommunityActions,
	type CommunityActionsConfig,
} from "./actions/communityActions.template";
import {
	buildMemoryActions,
	type MemoryActionsConfig,
} from "./actions/memoryActions.template";
import {
	buildModerationActions,
	type ModerationConfig,
} from "./actions/moderationActions.template";
import {
	buildRaidActions,
	type RaidConfig,
} from "./actions/raidActions.template";
import {
	buildSocialActions,
	type SocialActionsConfig,
} from "./actions/socialActions.template";
// Import template builders
import {
	type AdvancedCharacterOptions,
	buildAdvancedCharacter,
} from "./character/advanced-character.template";
import type { FeatureFlags } from "./config/feature-flags.template";
import {
	buildCommunityEvaluator,
	type CommunityEvaluatorConfig,
} from "./evaluators/community.evaluator.template";
import {
	buildCommunityMemoryHelpers,
	type CommunityMemoryConfig,
} from "./memory/community-memory.template";
import {
	buildCommunityPrompts,
	type CommunityPromptConfig,
} from "./prompt/community-prompts.template";

// Define proper types for template configuration
export interface TemplateBuilderConfig {
	character?: AdvancedCharacterOptions;
	actions?: {
		raids?: RaidConfig;
		moderation?: ModerationConfig;
		memory?: MemoryActionsConfig;
		social?: SocialActionsConfig;
		community?: CommunityActionsConfig;
	};
	evaluators?: {
		community?: CommunityEvaluatorConfig;
	};
	services?: {
		heartbeat?: Record<string, unknown>;
		sessions?: Record<string, unknown>;
		analytics?: Record<string, unknown>;
	};
	memory?: {
		community?: CommunityMemoryConfig;
	};
	prompts?: {
		community?: CommunityPromptConfig;
	};
	settings?: Record<string, unknown>;
	flags?: Partial<FeatureFlags>;
}

export interface BuiltTemplates {
	character: Character;
	actions: Action[];
	evaluators: Evaluator[];
	services: Service[];
	memory: ReturnType<typeof buildCommunityMemoryHelpers>;
	prompts: ReturnType<typeof buildCommunityPrompts>;
	// elizaOS memory systems
	elizaosMemory?: Record<string, unknown>;
	entityManager?: Record<string, unknown>;
	knowledgeManager?: Record<string, unknown>;
}

export function buildTemplates(
	config: TemplateBuilderConfig = {},
): BuiltTemplates {
	const cfg = config;

	// Build character
	const character = buildAdvancedCharacter({
		name: cfg.character?.name,
		bio: cfg.character?.bio,
		topics: cfg.character?.topics,
		system: cfg.character?.system,
		style: cfg.character?.style,
		plugins: cfg.character?.plugins,
		settings: cfg.character?.settings,
		secrets: cfg.character?.secrets,
	});

	// Build actions
	const actions: Action[] = [
		...buildRaidActions(cfg.actions?.raids || {}),
		...buildModerationActions(cfg.actions?.moderation || {}),
		...buildMemoryActions(cfg.actions?.memory || {}),
		...buildSocialActions(cfg.actions?.social || {}),
		...buildCommunityActions(cfg.actions?.community || {}),
	];

	// Build evaluators
	const evaluators: Evaluator[] = [
		buildCommunityEvaluator(cfg.evaluators?.community || {}),
	];

	// Build services
	const services: Service[] = [];

	// Note: Services need to be instantiated with runtime, so we'll provide factory functions
	// instead of direct instances

	// Build memory helpers
	const memory = buildCommunityMemoryHelpers(cfg.memory?.community || {});

	// Build prompt templates
	const prompts = buildCommunityPrompts(cfg.prompts?.community || {});

	return {
		character,
		actions,
		evaluators,
		services,
		memory,
		prompts,
	};
}

// Convenience function for building specific template components
export const TemplateBuilder = {
	// Build character only
	character: (config?: TemplateBuilderConfig["character"]) =>
		buildAdvancedCharacter(config),

	// Build actions only
	actions: (config?: TemplateBuilderConfig["actions"]) => [
		...buildRaidActions(config?.raids || {}),
		...buildModerationActions(config?.moderation || {}),
		...buildMemoryActions(config?.memory || {}),
		...buildSocialActions(config?.social || {}),
		...buildCommunityActions(config?.community || {}),
	],

	// Build specific action types
	raidActions: (config?: TemplateBuilderConfig["actions"]["raids"]) =>
		buildRaidActions(config || {}),

	moderationActions: (
		config?: TemplateBuilderConfig["actions"]["moderation"],
	) => buildModerationActions(config || {}),

	memoryActions: (config?: TemplateBuilderConfig["actions"]["memory"]) =>
		buildMemoryActions(config || {}),

	socialActions: (config?: TemplateBuilderConfig["actions"]["social"]) =>
		buildSocialActions(config || {}),

	communityActions: (config?: TemplateBuilderConfig["actions"]["community"]) =>
		buildCommunityActions(config || {}),

	// Build evaluators
	evaluators: (config?: TemplateBuilderConfig["evaluators"]) => [
		buildCommunityEvaluator(config?.community || {}),
	],

	// Build memory helpers
	memory: (config?: TemplateBuilderConfig["memory"]) =>
		buildCommunityMemoryHelpers(config?.community || {}),

	// Build prompt templates
	prompts: (config?: TemplateBuilderConfig["prompts"]) =>
		buildCommunityPrompts(config?.community || {}),

	// Build services (factory functions)
	services: {
		heartbeat: async (
			runtime: IAgentRuntime,
			config?: Record<string, unknown>,
		) => {
			const { HeartbeatService } = await import(
				"./services/heartbeat.service.template"
			);
			return new HeartbeatService(runtime, config);
		},

		sessions: async (
			runtime: IAgentRuntime,
			config?: Record<string, unknown>,
		) => {
			const { SessionsService } = await import(
				"./services/sessions.service.template"
			);
			return new SessionsService(runtime, config);
		},

		analytics: async (
			runtime: IAgentRuntime,
			config?: Record<string, unknown>,
		) => {
			const { AnalyticsService } = await import(
				"./services/analytics.service.template"
			);
			return new AnalyticsService(runtime, config);
		},

		community: async (
			runtime: IAgentRuntime,
			config?: Record<string, unknown>,
		) => {
			const { CommunityService } = await import(
				"./services/community.service.template"
			);
			return new CommunityService(runtime, config);
		},

		elizaosMemory: async (
			runtime: IAgentRuntime,
			config?: Record<string, unknown>,
		) => {
			const { buildElizaOSMemoryHelpers } = await import(
				"./memory/elizaos-memory.template"
			);
			return buildElizaOSMemoryHelpers(runtime, config);
		},

		entityManager: async (
			runtime: IAgentRuntime,
			config?: Record<string, unknown>,
		) => {
			const { buildEntityManager } = await import(
				"./memory/entity-manager.template"
			);
			return buildEntityManager(runtime, config);
		},

		knowledgeManager: async (
			runtime: IAgentRuntime,
			config?: Record<string, unknown>,
		) => {
			const { buildKnowledgeManager } = await import(
				"./memory/knowledge-manager.template"
			);
			return buildKnowledgeManager(runtime, config);
		},
	},
};
