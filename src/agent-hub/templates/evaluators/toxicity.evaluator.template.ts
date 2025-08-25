import type {
	ActionResult,
	Evaluator,
	IAgentRuntime,
	Memory,
	State,
} from "@elizaos/core";
import type { FeatureFlags } from "../config/feature-flags.template";

// Define proper types for toxicity content
export interface ToxicityContent {
	text?: string;
	[key: string]: unknown;
}

export type ToxicityConfig = {
	terms?: string[];
	threshold?: number;
	flags?: Partial<Pick<FeatureFlags, "toxicityEval">>;
};

export function buildToxicityEvaluator(cfg: ToxicityConfig = {}): Evaluator {
	const terms = cfg.terms ?? ["idiot", "stupid", "kill", "trash"];
	const threshold = cfg.threshold ?? 0.2;

	return {
		name: "toxicity",
		description: "Flags toxic content using heuristic term matches",
		examples: [],
		validate: async () => cfg.flags?.toxicityEval ?? true,
		handler: async (
			_runtime: IAgentRuntime,
			message: Memory,
			_state?: State,
		): Promise<ActionResult> => {
			const content = message?.content as ToxicityContent;
			const text =
				typeof content === "string" ? content : (content?.text ?? "");
			const matches = terms.filter((t) => text.toLowerCase().includes(t));
			const ratio = Math.min(1, matches.length / 3);
			const score = ratio;
			const flagged = score >= threshold;
			return {
				success: true,
				text: flagged ? "Toxic content detected" : "Content appears safe",
				data: { score, flagged },
			};
		},
	};
}
