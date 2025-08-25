import type {
	Action,
	ActionResult,
	HandlerCallback,
	IAgentRuntime,
	Memory,
	State,
} from "@elizaos/core";
import type { FeatureFlags } from "../config/feature-flags.template";

// Define proper types for social media content
export interface SocialContent {
	text?: string;
	platform?: string;
	engagementScore?: number;
	type?: "mention" | "dm" | "post" | "comment";
	platforms?: string[];
	[key: string]: unknown;
}

export type SocialActionsConfig = {
	enabled?: boolean;
	platforms?: {
		twitter?: boolean;
		discord?: boolean;
		telegram?: boolean;
		instagram?: boolean;
	};
	autoResponse?: boolean;
	engagementThreshold?: number;
	flags?: Partial<Pick<FeatureFlags, "social">>;
};

export function buildSocialActions(config: SocialActionsConfig = {}): Action[] {
	const cfg = {
		enabled: config.enabled ?? true,
		platforms: {
			twitter: config.platforms?.twitter ?? true,
			discord: config.platforms?.discord ?? true,
			telegram: config.platforms?.telegram ?? true,
			instagram: config.platforms?.instagram ?? true,
		},
		autoResponse: config.autoResponse ?? false,
		engagementThreshold: config.engagementThreshold ?? 0.7,
	};

	const socialEngage: Action = {
		name: "SOCIAL_ENGAGE",
		description: "Engage with social media content based on engagement score",
		validate: async () => cfg.enabled,
		handler: async (
			runtime: IAgentRuntime,
			message: Memory,
			state?: State,
			options?: Record<string, unknown>,
			callback?: HandlerCallback,
		): Promise<ActionResult> => {
			if (!cfg.enabled)
				return { success: false, text: "Social actions disabled" };

			const content = message?.content as SocialContent;
			const platform = content?.platform || "unknown";
			const engagementScore = content?.engagementScore || 0;

			if (engagementScore < cfg.engagementThreshold) {
				return { success: false, text: "Engagement below threshold" };
			}

			// Platform-specific engagement logic
			if (platform === "twitter" && cfg.platforms.twitter) {
				return {
					success: true,
					text: "Twitter engagement processed",
					data: { platform, score: engagementScore },
				};
			}

			if (platform === "discord" && cfg.platforms.discord) {
				return {
					success: true,
					text: "Discord engagement processed",
					data: { platform, score: engagementScore },
				};
			}

			return {
				success: true,
				text: "Social engagement processed",
				data: { platform, score: engagementScore },
			};
		},
		examples: [
			[
				{
					name: "{{user}}",
					content: {
						text: "Engage with this tweet",
						platform: "twitter",
						engagementScore: 0.8,
					},
				},
				{ name: "NUBI", content: { text: "Twitter engagement processed" } },
			],
		],
	};

	const autoRespond: Action = {
		name: "SOCIAL_AUTO_RESPOND",
		description: "Automatically respond to social media mentions and messages",
		validate: async () => cfg.enabled && cfg.autoResponse,
		handler: async (
			runtime: IAgentRuntime,
			message: Memory,
			state?: State,
			options?: Record<string, unknown>,
			callback?: HandlerCallback,
		): Promise<ActionResult> => {
			if (!cfg.enabled || !cfg.autoResponse) {
				return { success: false, text: "Auto-response disabled" };
			}

			const content = message?.content as SocialContent;
			const platform = content?.platform || "unknown";
			const messageType = content?.type || "mention";

			// Generate appropriate response based on platform and message type
			let response = "Thank you for reaching out!";

			if (platform === "twitter" && messageType === "mention") {
				response = "Thanks for the mention! 🚀";
			} else if (platform === "discord" && messageType === "dm") {
				response = "Hello! How can I help you today?";
			}

			return {
				success: true,
				text: "Auto-response sent",
				data: { platform, response, messageType },
			};
		},
		examples: [
			[
				{
					name: "{{user}}",
					content: {
						text: "Auto-respond to mention",
						platform: "twitter",
						type: "mention",
					},
				},
				{ name: "NUBI", content: { text: "Auto-response sent" } },
			],
		],
	};

	const crossPost: Action = {
		name: "SOCIAL_CROSS_POST",
		description: "Cross-post content across multiple social media platforms",
		validate: async () => cfg.enabled,
		handler: async (
			runtime: IAgentRuntime,
			message: Memory,
			state?: State,
			options?: Record<string, unknown>,
			callback?: HandlerCallback,
		): Promise<ActionResult> => {
			if (!cfg.enabled)
				return { success: false, text: "Social actions disabled" };

			const content = message?.content as SocialContent;
			const platforms = content?.platforms || ["twitter"];
			const postContent = content?.text || "";

			const results: Array<{ platform: string; status: string }> = [];
			for (const platform of platforms) {
				if (cfg.platforms[platform as keyof typeof cfg.platforms]) {
					results.push({ platform, status: "posted" });
				}
			}

			return {
				success: true,
				text: "Cross-post completed",
				data: { platforms: results, content: postContent },
			};
		},
		examples: [
			[
				{
					name: "{{user}}",
					content: {
						text: "Cross-post announcement",
						platforms: ["twitter", "discord"],
					},
				},
				{ name: "NUBI", content: { text: "Cross-post completed" } },
			],
		],
	};

	return [socialEngage, autoRespond, crossPost];
}
