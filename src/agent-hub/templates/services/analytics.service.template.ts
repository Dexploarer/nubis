import { type IAgentRuntime, logger, Service } from "@elizaos/core";

export type AnalyticsEvent = {
	type: string;
	payload?: Record<string, unknown>;
	at: string;
};
export type AnalyticsConfig = {
	enabled?: boolean;
	sampleRate?: number;
	hooks?: {
		onStart?: (service: AnalyticsService) => void | Promise<void>;
		onStop?: (service: AnalyticsService) => void | Promise<void>;
		onCapture?: (
			event: AnalyticsEvent,
			service: AnalyticsService,
		) => void | Promise<void>;
		onFlush?: (
			events: AnalyticsEvent[],
			service: AnalyticsService,
		) => void | Promise<void>;
	};
};

export class AnalyticsService extends Service {
	static serviceType = "analytics" as const;
	capabilityDescription =
		"Lightweight in-memory analytics buffer with hooks for capture/flush";
	private cfg: {
		enabled: boolean;
		sampleRate: number;
		hooks?: AnalyticsConfig["hooks"];
	};
	private events: AnalyticsEvent[] = [];

	constructor(runtime?: IAgentRuntime, cfg: AnalyticsConfig = {}) {
		super(runtime);
		this.cfg = {
			enabled: cfg.enabled ?? true,
			sampleRate: cfg.sampleRate ?? 1.0,
			hooks: cfg.hooks,
		};
	}

	async start(): Promise<void> {
		logger.info("[analytics] started");
		await this.cfg.hooks?.onStart?.(this);
	}

	async stop(): Promise<void> {
		logger.info("[analytics] stopped");
		await this.cfg.hooks?.onStop?.(this);
	}

	capture(type: string, payload?: Record<string, unknown>) {
		if (!this.cfg.enabled) return;
		if (Math.random() > this.cfg.sampleRate) return;
		const event: AnalyticsEvent = {
			type,
			payload,
			at: new Date().toISOString(),
		};
		this.events.push(event);
		void this.cfg.hooks?.onCapture?.(event, this);
	}

	flush(): AnalyticsEvent[] {
		const out = [...this.events];
		this.events = [];
		void this.cfg.hooks?.onFlush?.(out, this);
		return out;
	}
}
