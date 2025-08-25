import {
	createLogger,
	logger,
	stringToUuid,
	validateUuid,
} from "@elizaos/core";

export function makeLogger(name: string) {
	return createLogger({ name });
}

export const coreLogger = logger;

export function toUuidOrThrow(input: string) {
	const id = stringToUuid(input);
	if (!validateUuid(id)) throw new Error("Invalid UUID");
	return id;
}
