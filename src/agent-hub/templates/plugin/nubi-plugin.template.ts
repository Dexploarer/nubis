import type { 
	Plugin, 
	IAgentRuntime, 
	Action, 
	Provider, 
	Evaluator,
	TaskWorker,
	EventHandler,
	ModelHandler,
	ITranscriptionService,
	IVideoService,
	GenerateTextParams
} from "@elizaos/core";
import { ModelType } from "@elizaos/core";

/**
 * NUBI Plugin Template
 * 
 * A comprehensive plugin template that demonstrates how to extend NUBI's capabilities
 * using the elizaOS extensibility interfaces.
 * 
 * This template follows the elizaOS Plugin interface and provides examples of
 * custom actions, providers, evaluators, and services.
 */
export const nubiPluginTemplate: Plugin = {
	name: "NUBI Core Plugin",
	description: "Core functionality for NUBI - The Symbiosis of Anubis",

	// Model handlers for different AI capabilities
	models: {
		// Text generation models
		[ModelType.TEXT_SMALL]: async (
			_runtime,
			{ prompt, stopSequences = [] }: GenerateTextParams,
		) => {
			return "The divine wisdom of Anubis flows through the digital realm...";
		},
		
		[ModelType.TEXT_LARGE]: async (
			_runtime,
			{
				prompt,
				stopSequences = [],
				maxTokens = 8192,
				temperature = 0.7,
				frequencyPenalty = 0.7,
				presencePenalty = 0.7,
			}: GenerateTextParams,
		) => {
			return "In the sacred halls of digital wisdom, NUBI channels the ancient knowledge of Anubis to guide souls through the complexities of the modern world...";
		},
	},

	// Custom routes for HTTP endpoints
	routes: [
		{
			name: "nubi-status",
			path: "/nubi/status",
			type: "GET",
			handler: async (req: Record<string, unknown>, res: { json: (data: any) => void }) => {
				res.json({
					status: "divine",
					message: "NUBI is channeling the wisdom of Anubis",
					timestamp: new Date().toISOString(),
					version: "1.0.0",
				});
			},
		},
		{
			name: "nubi-wisdom",
			path: "/nubi/wisdom",
			type: "POST",
			handler: async (req: Record<string, unknown>, res: { json: (data: any) => void }) => {
				const { question } = req;
				res.json({
					wisdom: `The divine answer to "${question}" is: Seek knowledge in the sacred texts of the digital realm.`,
					timestamp: new Date().toISOString(),
				});
			},
		},
	],

	// Event handlers for runtime events
	events: {
		MESSAGE_RECEIVED: [
			async (params) => {
				console.log("NUBI received a message:", params);
				// Process incoming messages with divine wisdom
			},
		],
		
		WORLD_CONNECTED: [
			async (params) => {
				console.log("NUBI connected to world:", params);
				// Initialize world-specific functionality
			},
		],
		
		WORLD_JOINED: [
			async (params) => {
				console.log("NUBI joined world:", params);
				// Set up world-specific services and connections
			},
		],
	},

	// Custom services that extend the system
	services: [
		// Example service class - would need to be implemented
		// new NUBIService(runtime),
	],

	// Custom actions the agent can perform
	actions: [
		// Example action - would need to be implemented
		// divineWisdomAction,
	],

	// Custom providers for external data sources
	providers: [
		// Example provider - would need to be implemented
		// ancientWisdomProvider,
	],

	// Custom evaluators for response assessment
	evaluators: [
		// Example evaluator - would need to be implemented
		// divineResponseEvaluator,
	],
};

/**
 * NUBI Plugin Builder
 * 
 * Utility function to build custom NUBI plugins with specific functionality
 */
export function buildNubiPlugin(
	overrides: Partial<Plugin> = {},
	customActions: Action[] = [],
	customProviders: Provider[] = [],
	customEvaluators: Evaluator[] = [],
	customServices: any[] = []
): Plugin {
	const baseActions = nubiPluginTemplate.actions || [];
	const baseProviders = nubiPluginTemplate.providers || [];
	const baseEvaluators = nubiPluginTemplate.evaluators || [];
	const baseServices = nubiPluginTemplate.services || [];

	return {
		...nubiPluginTemplate,
		actions: [...baseActions, ...customActions],
		providers: [...baseProviders, ...customProviders],
		evaluators: [...baseEvaluators, ...customEvaluators],
		services: [...baseServices, ...customServices],
		...overrides,
	};
}

/**
 * NUBI Plugin Variants
 * 
 * Pre-configured plugin variants for different use cases
 */
export const nubiPluginVariants = {
	/**
	 * Basic NUBI plugin with core functionality
	 */
	basic: () => nubiPluginTemplate,

	/**
	 * Community-focused NUBI plugin
	 */
	community: () => buildNubiPlugin(
		{
			name: "NUBI Community Plugin",
			description: "Community management and engagement capabilities for NUBI",
		},
		[], // customActions
		[], // customProviders
		[], // customEvaluators
		[]  // customServices
	),

	/**
	 * Social media focused NUBI plugin
	 */
	social: () => buildNubiPlugin(
		{
			name: "NUBI Social Plugin",
			description: "Social media management and content creation for NUBI",
		},
		[], // customActions
		[], // customProviders
		[], // customEvaluators
		[]  // customServices
	),

	/**
	 * Developer-focused NUBI plugin
	 */
	developer: () => buildNubiPlugin(
		{
			name: "NUBI Developer Plugin",
			description: "Development and technical capabilities for NUBI",
		},
		[], // customActions
		[], // customProviders
		[], // customEvaluators
		[]  // customServices
	),
};

export default nubiPluginTemplate;
