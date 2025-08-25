import {
	type IAgentRuntime,
	logger,
	type Project,
	type ProjectAgent,
} from "@elizaos/core";
import { character } from "./character.ts";
import starterPlugin from "./plugin.ts";

// Tests will be added later
// import { ProjectStarterTestSuite } from './__tests__/e2e/project-starter.e2e';

// Export everything from the core module
export * from "./core";

const initCharacter = async ({ runtime }: { runtime: IAgentRuntime }) => {
	logger.info("Initializing NUBI character");
	logger.info({ name: character.name }, "Name:");

	// The SQL plugin will be initialized first as it's the first plugin in the character.ts plugins array
	// This ensures database connections are established before other services are initialized
	logger.info(
		"✅ SQL plugin should be initialized first based on plugins order in character.ts",
	);

	// Set environment variables from character secrets if they exist
	if (character.secrets) {
		logger.info("Setting environment variables from character secrets");
		// Use Object.entries with a fallback empty object to handle potential undefined
		Object.entries(character.secrets || {}).forEach(([key, value]) => {
			if (typeof value === "string" && !process.env[key]) {
				process.env[key] = value;
			}
		});
	}

	// Initialize core services
	try {
		const { AppService } = await import("./services/app-service");
		const appService = new AppService();
		await appService.initialize();
		logger.info("✅ Core services initialized successfully");
	} catch (error) {
		logger.error("❌ Failed to initialize core services:", error);
	}
};

export const projectAgent: ProjectAgent = {
	character,
	init: async (runtime: IAgentRuntime) => await initCharacter({ runtime }),
	// plugins: [starterPlugin], <-- Import custom plugins here
	tests: [], // Tests will be added later
};

const project: Project = {
	agents: [projectAgent],
};

export { character } from "./character.ts";

export default project;
