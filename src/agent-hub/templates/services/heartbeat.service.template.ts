import {
	type EventPayload,
	type EventType,
	type IAgentRuntime,
	logger,
	Service,
} from "@elizaos/core";

export type HeartbeatConfig = {
	intervalMs?: number;
	label?: string;
	hooks?: {
		onStart?: (service: HeartbeatService) => void | Promise<void>;
		onStop?: (service: HeartbeatService) => void | Promise<void>;
		onTick?: (service: HeartbeatService) => void | Promise<void>;
	};
};

export class HeartbeatService extends Service {
	static serviceType = "heartbeat" as const;
	capabilityDescription =
		"Periodic heartbeat for health checks and simple scheduled ticks";
	private timer?: ReturnType<typeof setInterval>;
	private cfg: {
		intervalMs: number;
		label: string;
		hooks?: HeartbeatConfig["hooks"];
	};

	constructor(runtime?: IAgentRuntime, cfg: HeartbeatConfig = {}) {
		super(runtime);
		this.cfg = {
			intervalMs: cfg.intervalMs ?? 10_000,
			label: cfg.label ?? "hb",
		};
		this.cfg.hooks = cfg.hooks;
	}

	async start(): Promise<void> {
		logger.info(`[heartbeat] start interval=${this.cfg.intervalMs}ms`);
		await this.cfg.hooks?.onStart?.(this);
		this.timer = setInterval(async () => {
			logger.debug(`[heartbeat] ${this.cfg.label}`);
			await this.cfg.hooks?.onTick?.(this);
		}, this.cfg.intervalMs);
	}

	async stop(): Promise<void> {
		if (this.timer) clearInterval(this.timer);
		logger.info("[heartbeat] stopped");
		await this.cfg.hooks?.onStop?.(this);
	}

	async onEvent(type: EventType, _payload: EventPayload): Promise<void> {
		logger.trace(`[heartbeat] event: ${String(type)}`);
	}
}

// Factory usage via defineService is not required in this codebase.
