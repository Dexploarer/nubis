/* Feature flags for toggling behaviors across actions, evaluators, and services */

export type FeatureFlags = {
	// Top-level shortcuts (convenient single-flag access)
	raids?: boolean;
	moderation?: boolean;
	memory?: boolean;
	social?: boolean;
	community?: boolean;
	engagementEval?: boolean;
	sentimentEval?: boolean;
	toxicityEval?: boolean;
	heartbeatService?: boolean;
	sessionsService?: boolean;
	analyticsService?: boolean;

	// Grouped flags (optional, mirrors top-level)
	actions?: {
		raids?: boolean;
		moderation?: boolean;
		memory?: boolean;
		social?: boolean;
		community?: boolean;
	};
	evaluators?: {
		engagement?: boolean;
		sentiment?: boolean;
		toxicity?: boolean;
	};
	services?: {
		heartbeat?: boolean;
		sessions?: boolean;
		analytics?: boolean;
	};
};

export function resolveFlag(
	flags: FeatureFlags | undefined,
	key: keyof FeatureFlags,
	group?: "actions" | "evaluators" | "services",
	groupKey?: string,
	defaultValue: boolean = true,
): boolean {
	if (!flags) return defaultValue;
	const top = flags[key];
	if (typeof top === "boolean") return top;
	if (group && groupKey) {
		const g = flags[group] as Record<string, boolean> | undefined;
		if (g && typeof g[groupKey] === "boolean") return g[groupKey];
	}
	return defaultValue;
}
