import type { Action, Evaluator, Plugin, Service } from "@elizaos/core";

export type AdvancedPluginOptions = {
	name?: string;
	description?: string;
	actions?: Action[];
	services?: Array<typeof Service>;
	evaluators?: Evaluator[];
};

export function buildAdvancedPlugin(opts: AdvancedPluginOptions = {}): Plugin {
	return {
		name: opts.name ?? "advanced-plugin",
		description:
			opts.description ?? "Aggregates actions, services, and evaluators",
		actions: opts.actions ?? [],
		services: opts.services ?? [],
		evaluators: opts.evaluators ?? [],
	};
}
