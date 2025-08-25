import type {
	Action,
	ActionResult,
	HandlerCallback,
	IAgentRuntime,
	Memory,
	State,
} from "@elizaos/core";
import type { FeatureFlags } from "../config/feature-flags.template";

// Define proper types for raid content
export interface RaidContent {
	text?: string;
	[key: string]: unknown;
}

export type RaidConfig = {
	enabled?: boolean;
	intervalHours?: number;
	maxConcurrent?: number;
	minParticipants?: number;
	points?: {
		like: number;
		retweet: number;
		comment: number;
		join: number;
	};
	flags?: Partial<Pick<FeatureFlags, "raids">>;
};

export function buildRaidActions(config: RaidConfig): Action[] {
	const safe = {
		enabled: config.enabled ?? config.flags?.raids ?? true,
		intervalHours: config.intervalHours ?? 6,
		maxConcurrent: config.maxConcurrent ?? 3,
		minParticipants: config.minParticipants ?? 5,
		points: {
			like: config.points?.like ?? 1,
			retweet: config.points?.retweet ?? 2,
			comment: config.points?.comment ?? 1,
			join: config.points?.join ?? 3,
		},
	};

	const scheduleRaid: Action = {
		name: "RAID_SCHEDULE",
		description: "Schedule a new raid window with constraints and goals",
		validate: async () => safe.enabled,
		handler: async (
			_runtime: IAgentRuntime,
			_message: Memory,
			_state?: State,
			_options?: Record<string, unknown>,
			_callback?: HandlerCallback,
		): Promise<ActionResult> => {
			if (!safe.enabled) return { success: false, text: "Raids disabled" };
			return {
				success: true,
				text: "Raid scheduled",
				data: { intervalHours: safe.intervalHours },
			};
		},
		examples: [
			[
				{
					name: "{{user}}",
					content: { text: "Schedule a raid in 2 hours for 30 minutes" },
				},
				{ name: "NUBI", content: { text: "Raid scheduled" } },
			],
		],
	};

	const startRaid: Action = {
		name: "RAID_START",
		description: "Start an immediate raid and broadcast to all participants",
		validate: async () => safe.enabled,
		handler: async (
			_runtime: IAgentRuntime,
			_message: Memory,
			_state?: State,
			_options?: Record<string, unknown>,
			_callback?: HandlerCallback,
		): Promise<ActionResult> => {
			if (!safe.enabled) return { success: false, text: "Raids disabled" };
			return {
				success: true,
				text: "Raid started",
				data: { minParticipants: safe.minParticipants },
			};
		},
		examples: [
			[
				{ name: "{{user}}", content: { text: "Start raid now for tweet XYZ" } },
				{ name: "NUBI", content: { text: "Raid started" } },
			],
		],
	};

	const assignPoints: Action = {
		name: "RAID_POINTS_ASSIGN",
		description: "Assign points to a user for raid participation",
		validate: async () => safe.enabled,
		handler: async (
			_runtime: IAgentRuntime,
			_message: Memory,
			_state?: State,
			_options?: Record<string, unknown>,
			_callback?: HandlerCallback,
		): Promise<ActionResult> => {
			return {
				success: true,
				text: "Points assigned",
				data: { points: safe.points },
			};
		},
		examples: [
			[
				{ name: "{{user}}", content: { text: "Assign 3 points for retweet" } },
				{ name: "NUBI", content: { text: "Points assigned" } },
			],
		],
	};

	return [scheduleRaid, startRaid, assignPoints];
}
