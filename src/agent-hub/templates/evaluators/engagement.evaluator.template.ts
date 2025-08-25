import type {
	ActionResult,
	Evaluator,
	IAgentRuntime,
	Memory,
	State,
} from "@elizaos/core";
import type { FeatureFlags } from "../config/feature-flags.template";

// Define proper types for engagement content
export interface EngagementContent {
	text?: string;
	[key: string]: unknown;
}

export type EngagementConfig = {
	weights?: { callToAction?: number; hashtags?: number; length?: number };
	idealLength?: { min: number; max: number };
	flags?: Partial<Pick<FeatureFlags, "engagementEval">>;
};

export function buildEngagementEvaluator(
	cfg: EngagementConfig = {},
): Evaluator {
	const weights = {
		callToAction: 0.4,
		hashtags: 0.3,
		length: 0.3,
		...(cfg.weights ?? {}),
	};
	const ideal = cfg.idealLength ?? { min: 80, max: 220 };

	return {
		name: "engagement",
		description: "Scores content for likely engagement (CTA, hashtags, length)",
		examples: [],
		validate: async () => cfg.flags?.engagementEval ?? true,
		handler: async (
			_runtime: IAgentRuntime,
			message: Memory,
			_state?: State,
		): Promise<ActionResult> => {
			const content = message?.content as EngagementContent;
			const text =
				typeof content === "string" ? content : (content?.text ?? "");
			const hasCTA = /(join|follow|retweet|share|reply|comment|like)\b/i.test(
				text,
			)
				? 1
				: 0;
			const hashtagCount = (text.match(/#[\w-]+/g) ?? []).length;
			const hashScore = Math.min(1, hashtagCount / 3);
			const lenScore =
				text.length < ideal.min ? 0 : text.length > ideal.max ? 0.6 : 1;
			const score =
				hasCTA * weights.callToAction +
				hashScore * weights.hashtags +
				lenScore * weights.length;
			const final = Math.max(0, Math.min(1, score));
			return {
				success: true,
				text: `Engagement score: ${final.toFixed(2)}`,
				data: { score: final },
			};
		},
	};
}
