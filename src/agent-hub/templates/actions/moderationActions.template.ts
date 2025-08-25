import type {
	Action,
	ActionResult,
	HandlerCallback,
	IAgentRuntime,
	Memory,
	State,
} from "@elizaos/core";

// Define proper types for moderation content
export interface ModerationContent {
	text?: string;
	[key: string]: unknown;
}

export type ModerationConfig = {
	profanityList?: string[];
	blockWords?: string[];
	maxCapsRatio?: number; // fraction of caps-letters allowed
};

export function buildModerationActions(
	config: ModerationConfig = {},
): Action[] {
	const cfg = {
		profanityList: config.profanityList ?? ["badword1", "badword2"],
		blockWords: config.blockWords ?? ["spam"],
		maxCapsRatio: config.maxCapsRatio ?? 0.7,
	};

	const analyze: Action = {
		name: "MODERATION_ANALYZE",
		description: "Analyze text for policy violations and spam",
		validate: async () => true,
		handler: async (
			_runtime: IAgentRuntime,
			message: Memory,
			_state?: State,
			_options?: Record<string, unknown>,
			_callback?: HandlerCallback,
		): Promise<ActionResult> => {
			const text = (message?.content as ModerationContent)?.text || "";
			const capsRatio = text.length
				? text.replace(/[^A-Z]/g, "").length / text.length
				: 0;
			const hits = [
				...cfg.profanityList.filter((w) => text.toLowerCase().includes(w)),
				...cfg.blockWords.filter((w) => text.toLowerCase().includes(w)),
			];
			const flagged = hits.length > 0 || capsRatio > cfg.maxCapsRatio;
			return {
				success: true,
				text: flagged ? "Spam detected" : "OK",
				data: { flagged, hits, capsRatio },
			};
		},
		examples: [
			[
				{ name: "{{user}}", content: { text: "Check: THIS is SPAM!" } },
				{ name: "NUBI", content: { text: "Spam detected" } },
			],
		],
	};

	return [analyze];
}
