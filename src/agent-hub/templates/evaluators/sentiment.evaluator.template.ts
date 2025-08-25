import type {
	ActionResult,
	Evaluator,
	IAgentRuntime,
	Memory,
	State,
} from "@elizaos/core";
import type { FeatureFlags } from "../config/feature-flags.template";

// Define proper types for sentiment content
export interface SentimentContent {
	text?: string;
	[key: string]: unknown;
}

export type SentimentConfig = {
	positiveWords?: string[];
	negativeWords?: string[];
	flags?: Partial<Pick<FeatureFlags, "sentimentEval">>;
};

export function buildSentimentEvaluator(cfg: SentimentConfig = {}): Evaluator {
	const pos = cfg.positiveWords ?? ["great", "good", "amazing", "win", "love"];
	const neg = cfg.negativeWords ?? ["bad", "terrible", "hate", "loss", "awful"];

	return {
		name: "sentiment",
		description: "Naive lexical sentiment scorer (0..1)",
		examples: [],
		validate: async () => cfg.flags?.sentimentEval ?? true,
		handler: async (
			_runtime: IAgentRuntime,
			message: Memory,
			_state?: State,
		): Promise<ActionResult> => {
			const content = message?.content as SentimentContent;
			const text =
				typeof content === "string" ? content : (content?.text ?? "");
			const w = text.toLowerCase();
			let s = 0;
			for (const p of pos) if (w.includes(p)) s += 1;
			for (const n of neg) if (w.includes(n)) s -= 1;
			const score = 0.5 + Math.max(-3, Math.min(3, s)) / 6; // map [-3,3] to [0,1]
			return {
				success: true,
				text: `Sentiment score: ${score.toFixed(2)}`,
				data: { score },
			};
		},
	};
}
