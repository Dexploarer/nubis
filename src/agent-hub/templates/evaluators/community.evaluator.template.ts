import type { Evaluator, IAgentRuntime, Memory, State } from "@elizaos/core";
import type { FeatureFlags } from "../config/feature-flags.template";

// Define proper types for community content and data
export interface CommunityContent {
	communityData?: CommunityData;
	[key: string]: unknown;
}

export interface CommunityData {
	totalMembers?: number;
	activeMembers?: number;
	totalPosts?: number;
	totalComments?: number;
	recentActivity?: number;
	newMembersThisWeek?: number;
	memberGrowth?: string;
	[key: string]: unknown;
}

export interface CommunityMetrics {
	engagement: number;
	activity: number;
	growth: number;
	toxicity: number;
	moderation: number;
	overall: number;
	health: "excellent" | "good" | "fair" | "poor" | "critical";
	recommendations: string[];
}

export type CommunityEvaluatorConfig = {
	enabled?: boolean;
	metrics?: {
		engagementThreshold?: number;
		activityThreshold?: number;
		growthThreshold?: number;
		toxicityThreshold?: number;
	};
	weights?: {
		engagement?: number;
		activity?: number;
		growth?: number;
		toxicity?: number;
		moderation?: number;
	};
	flags?: Partial<Pick<FeatureFlags, "community">>;
};

export function buildCommunityEvaluator(
	config: CommunityEvaluatorConfig = {},
): Evaluator {
	const cfg = {
		enabled: config.enabled ?? true,
		metrics: {
			engagementThreshold: config.metrics?.engagementThreshold ?? 0.7,
			activityThreshold: config.metrics?.activityThreshold ?? 0.6,
			growthThreshold: config.metrics?.growthThreshold ?? 0.1,
			toxicityThreshold: config.metrics?.toxicityThreshold ?? 0.3,
		},
		weights: {
			engagement: config.weights?.engagement ?? 0.3,
			activity: config.weights?.activity ?? 0.25,
			growth: config.weights?.growth ?? 0.2,
			toxicity: config.weights?.toxicity ?? 0.15,
			moderation: config.weights?.moderation ?? 0.1,
		},
	};

	const communityHealth: Evaluator = {
		name: "COMMUNITY_HEALTH",
		description:
			"Evaluate overall community health and provide recommendations",
		validate: async () => cfg.enabled,
		handler: async (
			runtime: IAgentRuntime,
			message: Memory,
			state?: State,
		): Promise<{
			success: boolean;
			text: string;
			data?: Record<string, unknown>;
		}> => {
			if (!cfg.enabled) {
				return {
					success: false,
					text: "Community evaluation disabled",
				};
			}

			try {
				// Extract community data from message or state
				const content = message?.content as CommunityContent;
				const communityData =
					content?.communityData || (state?.community as CommunityData) || {};

				// Calculate individual metrics
				const engagement = calculateEngagement(communityData);
				const activity = calculateActivity(communityData);
				const growth = calculateGrowth(communityData);
				const toxicity = calculateToxicity(communityData);
				const moderation = calculateModeration(communityData);

				// Calculate weighted overall score
				const overall =
					engagement * cfg.weights.engagement +
					activity * cfg.weights.activity +
					growth * cfg.weights.growth +
					toxicity * cfg.weights.toxicity +
					moderation * cfg.weights.moderation;

				// Determine health status
				const health = determineHealthStatus(overall);

				// Generate recommendations
				const recommendations = generateRecommendations({
					engagement,
					activity,
					growth,
					toxicity,
					moderation,
					thresholds: cfg.metrics,
				});

				const metrics: CommunityMetrics = {
					engagement,
					activity,
					growth,
					toxicity,
					moderation,
					overall,
					health,
					recommendations,
				};

				return {
					success: true,
					text: `Community health: ${health}`,
					data: { metrics, recommendations },
				};
			} catch (error) {
				return {
					success: false,
					text: `Evaluation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
				};
			}
		},
	};

	return communityHealth;
}

// Helper functions with proper typing
function calculateEngagement(data: CommunityData): number {
	const totalMembers = data.totalMembers || 1;
	const activeMembers = data.activeMembers || 0;
	const totalPosts = data.totalPosts || 0;
	const totalComments = data.totalComments || 0;

	const memberActivity = activeMembers / totalMembers;
	const contentEngagement =
		totalPosts + totalComments > 0
			? Math.min((totalPosts + totalComments) / totalMembers, 1)
			: 0;

	return (memberActivity + contentEngagement) / 2;
}

function calculateActivity(data: CommunityData): number {
	const totalMembers = data.totalMembers || 1;
	const totalPosts = data.totalPosts || 0;
	const totalComments = data.totalComments || 0;
	const recentActivity = data.recentActivity || 0;

	const postRate = totalPosts / totalMembers;
	const commentRate = totalComments / totalMembers;
	const recentRate = recentActivity / totalMembers;

	return Math.min((postRate + commentRate + recentRate) / 3, 1);
}

function calculateGrowth(data: CommunityData): number {
	const totalMembers = data.totalMembers || 1;
	const newMembersThisWeek = data.newMembersThisWeek || 0;
	const memberGrowth = data.memberGrowth || "0%";

	// Parse growth percentage
	const growthRate = parseFloat(memberGrowth.replace("%", "") || "0") / 100;
	const weeklyGrowth = newMembersThisWeek / totalMembers;

	return Math.min((growthRate + weeklyGrowth) / 2, 1);
}

function calculateToxicity(data: CommunityData): number {
	// This would typically come from content analysis
	// For now, return a placeholder value
	return 0.1;
}

function calculateModeration(data: CommunityData): number {
	// This would typically come from moderation logs
	// For now, return a placeholder value
	return 0.8;
}

function determineHealthStatus(score: number): CommunityMetrics["health"] {
	if (score >= 0.8) return "excellent";
	if (score >= 0.6) return "good";
	if (score >= 0.4) return "fair";
	if (score >= 0.2) return "poor";
	return "critical";
}

function generateRecommendations(metrics: {
	engagement: number;
	activity: number;
	growth: number;
	toxicity: number;
	moderation: number;
	thresholds: CommunityEvaluatorConfig["metrics"];
}): string[] {
	const recommendations: string[] = [];

	if (metrics.engagement < (metrics.thresholds?.engagementThreshold || 0.7)) {
		recommendations.push(
			"Increase member engagement through interactive content",
		);
	}

	if (metrics.activity < (metrics.thresholds?.activityThreshold || 0.6)) {
		recommendations.push("Encourage more posting and commenting");
	}

	if (metrics.growth < (metrics.thresholds?.growthThreshold || 0.1)) {
		recommendations.push("Implement member acquisition strategies");
	}

	if (metrics.toxicity > (metrics.thresholds?.toxicityThreshold || 0.3)) {
		recommendations.push("Strengthen content moderation");
	}

	if (metrics.moderation < 0.5) {
		recommendations.push("Improve moderation response times");
	}

	return recommendations.length > 0
		? recommendations
		: ["Community is performing well"];
}
