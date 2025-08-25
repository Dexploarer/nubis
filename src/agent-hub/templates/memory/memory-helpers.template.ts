import { createMessageMemory, type Memory, type UUID } from "@elizaos/core";
import { randomUUID } from "crypto";

export type MemoryCreateOptions = {
	roomId: UUID;
	entityId: UUID;
	agentId?: UUID;
	text: string;
	metadata?: Record<string, unknown>;
};

export function createTextMemory(opts: MemoryCreateOptions): Memory {
	return createMessageMemory({
		id: randomUUID() as unknown as `${string}-${string}-${string}-${string}-${string}`,
		roomId: opts.roomId,
		entityId: opts.entityId,
		agentId: opts.agentId,
		content: { text: opts.text, ...(opts.metadata ?? {}) },
	});
}

export function batchMemories(
	roomId: UUID,
	entityId: UUID,
	texts: string[],
	agentId?: UUID,
): Memory[] {
	return texts.map((text) =>
		createTextMemory({ roomId, entityId, agentId, text }),
	);
}
