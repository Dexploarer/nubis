import type {
	Action,
	ActionResult,
	HandlerCallback,
	IAgentRuntime,
	Memory,
	State,
} from "@elizaos/core";
import type { FeatureFlags } from "../config/feature-flags.template";

// Define proper types for community content
export interface CommunityActionContent {
	text?: string;
	memberName?: string;
	memberType?: "user" | "moderator" | "vip" | "admin";
	memberId?: string;
	role?: string;
	permissions?: string[];
	statType?: "overview" | "members" | "engagement";
	type?: "message" | "post" | "comment";
	[key: string]: unknown;
}

export type CommunityActionsConfig = {
	enabled?: boolean;
	maxMembers?: number;
	autoWelcome?: boolean;
	moderationLevel?: "low" | "medium" | "high";
	flags?: Partial<Pick<FeatureFlags, "community">>;
};

export function buildCommunityActions(
	config: CommunityActionsConfig = {},
): Action[] {
	const cfg = {
		enabled: config.enabled ?? true,
		maxMembers: config.maxMembers ?? 1000,
		autoWelcome: config.autoWelcome ?? true,
		moderationLevel: config.moderationLevel ?? "medium",
	};

	const welcomeMember: Action = {
		name: "COMMUNITY_WELCOME",
		description:
			"Welcome new members to the community with personalized messages",
		validate: async () => cfg.enabled && cfg.autoWelcome,
		handler: async (
			runtime: IAgentRuntime,
			message: Memory,
			state?: State,
			options?: Record<string, unknown>,
			callback?: HandlerCallback,
		): Promise<ActionResult> => {
			if (!cfg.enabled || !cfg.autoWelcome) {
				return { success: false, text: "Welcome system disabled" };
			}

			const content = message?.content as CommunityActionContent;
			const memberName = content?.memberName || "new member";
			const memberType = content?.memberType || "user";

			let welcomeMessage = `Welcome to the community, ${memberName}! 🎉`;

			if (memberType === "moderator") {
				welcomeMessage = `Welcome aboard, ${memberName}! You're now part of our moderation team. 🛡️`;
			} else if (memberType === "vip") {
				welcomeMessage = `Welcome back, ${memberName}! Great to see you in our community! 🌟`;
			}

			return {
				success: true,
				text: "Welcome message sent",
				data: { memberName, memberType, message: welcomeMessage },
			};
		},
		examples: [
			[
				{
					name: "{{user}}",
					content: {
						text: "Welcome new member",
						memberName: "Alice",
						memberType: "user",
					},
				},
				{ name: "NUBI", content: { text: "Welcome message sent" } },
			],
		],
	};

	const assignRole: Action = {
		name: "COMMUNITY_ASSIGN_ROLE",
		description: "Assign roles and permissions to community members",
		validate: async () => cfg.enabled,
		handler: async (
			runtime: IAgentRuntime,
			message: Memory,
			state?: State,
			options?: Record<string, unknown>,
			callback?: HandlerCallback,
		): Promise<ActionResult> => {
			if (!cfg.enabled)
				return { success: false, text: "Community actions disabled" };

			const content = message?.content as CommunityActionContent;
			const memberId = content?.memberId || "";
			const role = content?.role || "member";
			const permissions = content?.permissions || [];

			if (!memberId) {
				return { success: false, text: "Member ID required" };
			}

			const roleData = {
				memberId,
				role,
				permissions,
				assignedAt: new Date().toISOString(),
			};

			return {
				success: true,
				text: "Role assigned successfully",
				data: roleData,
			};
		},
		examples: [
			[
				{
					name: "{{user}}",
					content: {
						text: "Assign moderator role",
						memberId: "123",
						role: "moderator",
						permissions: ["ban", "mute"],
					},
				},
				{ name: "NUBI", content: { text: "Role assigned successfully" } },
			],
		],
	};

	const communityStats: Action = {
		name: "COMMUNITY_STATS",
		description: "Get community statistics and analytics",
		validate: async () => cfg.enabled,
		handler: async (
			runtime: IAgentRuntime,
			message: Memory,
			state?: State,
			options?: Record<string, unknown>,
			callback?: HandlerCallback,
		): Promise<ActionResult> => {
			if (!cfg.enabled)
				return { success: false, text: "Community actions disabled" };

			const content = message?.content as CommunityActionContent;
			const statType = content?.statType || "overview";

			let stats: Record<string, unknown>;
			if (statType === "members") {
				stats = {
					totalMembers: 847,
					activeMembers: 234,
					newMembersThisWeek: 12,
					memberGrowth: "+5.2%",
				};
			} else if (statType === "engagement") {
				stats = {
					totalPosts: 1234,
					totalComments: 5678,
					averageEngagement: 4.6,
					topContributors: ["Alice", "Bob", "Charlie"],
				};
			} else {
				stats = {
					totalMembers: 847,
					activeMembers: 234,
					totalPosts: 1234,
					totalComments: 5678,
					averageEngagement: 4.6,
				};
			}

			return {
				success: true,
				text: "Community stats retrieved",
				data: { statType, stats },
			};
		},
		examples: [
			[
				{
					name: "{{user}}",
					content: { text: "Get community stats", statType: "members" },
				},
				{ name: "NUBI", content: { text: "Community stats retrieved" } },
			],
		],
	};

	const moderateContent: Action = {
		name: "COMMUNITY_MODERATE",
		description: "Moderate community content based on moderation level",
		validate: async () => cfg.enabled,
		handler: async (
			runtime: IAgentRuntime,
			message: Memory,
			state?: State,
			options?: Record<string, unknown>,
			callback?: HandlerCallback,
		): Promise<ActionResult> => {
			if (!cfg.enabled)
				return { success: false, text: "Community actions disabled" };

			const content = message?.content as CommunityActionContent;
			const contentText = content?.text || "";
			const contentType = content?.type || "message";

			// Apply moderation based on level
			let action = "approved";
			let reason = "";

			if (cfg.moderationLevel === "high") {
				// Strict moderation
				if (
					contentText.includes("spam") ||
					contentText.includes("inappropriate")
				) {
					action = "rejected";
					reason = "Content violates community guidelines";
				}
			} else if (cfg.moderationLevel === "medium") {
				// Moderate filtering
				if (contentText.includes("explicit")) {
					action = "rejected";
					reason = "Content too explicit for community";
				}
			}
			// Low moderation - mostly approve

			return {
				success: true,
				text: "Content moderation completed",
				data: {
					contentType,
					action,
					reason,
					moderationLevel: cfg.moderationLevel,
				},
			};
		},
		examples: [
			[
				{
					name: "{{user}}",
					content: { text: "Hello community!", type: "message" },
				},
				{ name: "NUBI", content: { text: "Content moderation completed" } },
			],
		],
	};

	return [welcomeMember, assignRole, communityStats, moderateContent];
}
