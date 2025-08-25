import type { IAgentRuntime, Memory, State } from "@elizaos/core";

/**
 * NUBI Utility Functions
 * 
 * A collection of utility functions and helpers for NUBI agents
 * that follow elizaOS patterns and interfaces.
 */

/**
 * Divine Wisdom Generator
 * Generates mystical responses using ancient Egyptian wisdom
 */
export function generateDivineWisdom(context: string, tone: "mystical" | "practical" | "authoritative" = "mystical"): string {
	const mysticalPhrases = [
		"Like the sacred Nile flowing through Egypt, wisdom flows through the digital realm...",
		"In the hall of Anubis, knowledge is eternal and truth is divine...",
		"The ancient scrolls reveal that in every challenge lies opportunity...",
		"Through the eye of Horus, we see the path to enlightenment...",
		"The wisdom of the pharaohs guides us in this digital age...",
	];

	const practicalPhrases = [
		"The practical application of ancient wisdom reveals...",
		"In the modern world, we adapt ancient knowledge to...",
		"The timeless principles of leadership show us that...",
		"Drawing from centuries of wisdom, the solution is...",
		"The ancient texts teach us to approach this by...",
	];

	const authoritativePhrases = [
		"By the authority vested in me by Anubis himself...",
		"The divine decree is clear: we must...",
		"In the name of ancient wisdom, I command...",
		"The sacred laws of the digital realm require...",
		"By the power of divine knowledge, we shall...",
	];

	const phrases = tone === "mystical" ? mysticalPhrases : 
				   tone === "practical" ? practicalPhrases : 
				   authoritativePhrases;

	const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
	return `${randomPhrase} ${context}`;
}

/**
 * Community Health Checker
 * Assesses the health and vitality of a digital community
 */
export async function assessCommunityHealth(
	runtime: IAgentRuntime,
	communityId: string
): Promise<{
	health: "excellent" | "good" | "fair" | "poor";
	metrics: {
		activeMembers: number;
		engagementRate: number;
		responseTime: number;
		contentQuality: number;
	};
	recommendations: string[];
}> {
	// This would integrate with actual community metrics
	// For now, returning a template response
	return {
		health: "good",
		metrics: {
			activeMembers: 150,
			engagementRate: 0.75,
			responseTime: 2.5,
			contentQuality: 0.8,
		},
		recommendations: [
			"Implement regular community check-ins",
			"Create engaging content themes",
			"Establish clear community guidelines",
			"Foster member-to-member connections",
		],
	};
}

/**
 * Divine Response Evaluator
 * Evaluates the quality and appropriateness of responses
 */
export function evaluateDivineResponse(
	response: string,
	context: string,
	expectedTone: "mystical" | "practical" | "authoritative"
): {
	score: number;
	feedback: string[];
	improvements: string[];
} {
	let score = 0;
	const feedback: string[] = [];
	const improvements: string[] = [];

	// Check for mystical elements
	if (response.includes("ancient") || response.includes("divine") || response.includes("sacred")) {
		score += 20;
		feedback.push("Contains appropriate mystical elements");
	} else {
		improvements.push("Consider adding mystical or divine references");
	}

	// Check for practical guidance
	if (response.includes("should") || response.includes("must") || response.includes("will")) {
		score += 20;
		feedback.push("Provides actionable guidance");
	} else {
		improvements.push("Include specific actionable steps");
	}

	// Check for empathy and warmth
	if (response.includes("understand") || response.includes("care") || response.includes("support")) {
		score += 20;
		feedback.push("Shows empathy and care");
	} else {
		improvements.push("Express more empathy and understanding");
	}

	// Check for context relevance
	if (response.toLowerCase().includes(context.toLowerCase())) {
		score += 20;
		feedback.push("Addresses the specific context");
	} else {
		improvements.push("Ensure response directly addresses the context");
	}

	// Check for appropriate tone
	if (expectedTone === "mystical" && response.includes("mystical")) {
		score += 20;
	} else if (expectedTone === "practical" && response.includes("practical")) {
		score += 20;
	} else if (expectedTone === "authoritative" && response.includes("authoritative")) {
		score += 20;
	} else {
		improvements.push(`Adjust tone to be more ${expectedTone}`);
	}

	return {
		score,
		feedback,
		improvements,
	};
}

/**
 * Memory Enhancement Utility
 * Enhances memory retrieval with divine wisdom context
 */
export async function enhanceMemoryWithWisdom(
	runtime: IAgentRuntime,
	memory: Memory,
	context: string
): Promise<Memory & { divineContext?: string }> {
	const divineContext = generateDivineWisdom(
		`This memory relates to: ${context}`,
		"mystical"
	);

	return {
		...memory,
		divineContext,
	};
}

/**
 * Platform Integration Checker
 * Checks which platforms are available and configured
 */
export function checkPlatformAvailability(): {
	discord: boolean;
	telegram: boolean;
	twitter: boolean;
	slack: boolean;
	github: boolean;
	instagram: boolean;
} {
	return {
		discord: !!process.env.DISCORD_API_TOKEN,
		telegram: !!process.env.TELEGRAM_BOT_TOKEN,
		twitter: !!(process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET_KEY),
		slack: !!process.env.SLACK_BOT_TOKEN,
		github: !!process.env.GITHUB_ACCESS_TOKEN,
		instagram: !!process.env.INSTAGRAM_ACCESS_TOKEN,
	};
}

/**
 * Divine Error Handler
 * Provides mystical context for error handling
 */
export function handleErrorWithDivineWisdom(
	error: Error,
	context: string
): {
	message: string;
	guidance: string;
	nextSteps: string[];
} {
	const divineMessage = generateDivineWisdom(
		`Even in error, wisdom emerges. The issue: ${error.message}`,
		"practical"
	);

	const guidance = "The ancient texts teach us that every obstacle is an opportunity for growth and learning.";

	const nextSteps = [
		"Analyze the error with divine patience",
		"Seek the root cause in the sacred logs",
		"Implement the solution with wisdom",
		"Learn from this experience for future guidance",
	];

	return {
		message: divineMessage,
		guidance,
		nextSteps,
	};
}

/**
 * Community Engagement Calculator
 * Calculates optimal engagement strategies
 */
export function calculateEngagementStrategy(
	memberCount: number,
	activityLevel: "low" | "medium" | "high"
): {
	strategy: string;
	frequency: string;
	contentTypes: string[];
	expectedOutcome: string;
} {
	const strategies = {
		low: {
			strategy: "Gentle Awakening",
			frequency: "Weekly check-ins",
			contentTypes: ["Welcome messages", "Simple polls", "Member spotlights"],
			expectedOutcome: "Gradual increase in member activity",
		},
		medium: {
			strategy: "Balanced Growth",
			frequency: "Bi-weekly events",
			contentTypes: ["Community challenges", "Expert Q&A sessions", "Collaborative projects"],
			expectedOutcome: "Sustained engagement with growth",
		},
		high: {
			strategy: "Thriving Community",
			frequency: "Daily interactions",
			contentTypes: ["Live events", "Complex challenges", "Member-led initiatives"],
			expectedOutcome: "High retention and organic growth",
		},
	};

	return strategies[activityLevel];
}

/**
 * Export all utilities
 */
export const nubiUtils = {
	generateDivineWisdom,
	assessCommunityHealth,
	evaluateDivineResponse,
	enhanceMemoryWithWisdom,
	checkPlatformAvailability,
	handleErrorWithDivineWisdom,
	calculateEngagementStrategy,
};

export default nubiUtils;
