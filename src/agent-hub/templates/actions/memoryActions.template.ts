import {
	type Action,
	type ActionResult,
	createMessageMemory,
	type HandlerCallback,
	type IAgentRuntime,
	type Memory,
	type State,
	type UUID,
} from "@elizaos/core";
import { randomUUID } from "crypto";
import type { FeatureFlags } from "../config/feature-flags.template";

// Define proper types for memory content
export interface MemoryActionContent {
	text?: string;
	[key: string]: unknown;
}

export type MemoryActionsConfig = {
	roomId?: string;
	enabled?: boolean;
	flags?: Partial<Pick<FeatureFlags, "memory">>;
};

export function buildMemoryActions(config: MemoryActionsConfig = {}): Action[] {
	const cfg = {
		enabled: config.enabled ?? config.flags?.memory ?? true,
		roomId: config.roomId ?? "default-room",
	};

	const remember: Action = {
		name: "MEMORY_REMEMBER",
		description: "Persist a short message into memory for the active room",
		validate: async (
			_runtime: IAgentRuntime,
			_message: Memory,
			_state?: State,
		) => cfg.enabled,
		handler: async (
			_runtime: IAgentRuntime,
			message: Memory,
			_state?: State,
			_options?: Record<string, unknown>,
			_callback?: HandlerCallback,
		): Promise<ActionResult> => {
			if (!cfg.enabled) return { success: false, text: "Memory disabled" };
			const text = (message?.content as MemoryActionContent)?.text || "";
			const roomId = (message?.roomId ?? cfg.roomId) as unknown as UUID;
			if (!roomId)
				return { success: false, text: "No roomId available to store memory" };
			const mem = createMessageMemory({
				id: randomUUID() as unknown as `${string}-${string}-${string}-${string}-${string}`,
				roomId,
				entityId: message.entityId as UUID,
				agentId: (message.agentId ?? _runtime.agentId) as UUID,
				content: { text },
			});
			return { success: true, text: "Stored", data: { memory: mem } };
		},
		examples: [
			[
				{
					name: "{{user}}",
					content: { text: "Remember: our launch is Friday" },
				},
				{ name: "NUBI", content: { text: "Stored" } },
			],
		],
	};

	return [remember];
}
