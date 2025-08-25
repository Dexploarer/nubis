import { type IAgentRuntime, logger, Service } from "@elizaos/core";
import { randomUUID } from "crypto";

export type SessionRecord = {
	id: string;
	userId: string;
	createdAt: string;
	lastSeenAt: string;
	expiresAt: string;
};

export type SessionsConfig = {
	defaultTimeoutMs?: number;
	autoRenew?: boolean;
	cleanupIntervalMs?: number;
	maxIdleMs?: number;
	hooks?: {
		onStart?: (service: SessionsService) => void | Promise<void>;
		onStop?: (service: SessionsService) => void | Promise<void>;
		onCreate?: (
			rec: SessionRecord,
			service: SessionsService,
		) => void | Promise<void>;
		onTouch?: (
			rec: SessionRecord,
			service: SessionsService,
		) => void | Promise<void>;
		onRemove?: (id: string, service: SessionsService) => void | Promise<void>;
		onPrune?: (
			removed: SessionRecord[],
			service: SessionsService,
		) => void | Promise<void>;
	};
};

export class SessionsService extends Service {
	static serviceType = "sessions" as const;
	capabilityDescription =
		"In-memory session tracking with auto-renewal and pruning hooks";
	private sessions = new Map<string, SessionRecord>();
	private cleanup?: ReturnType<typeof setInterval>;
	private cfg: {
		defaultTimeoutMs: number;
		autoRenew: boolean;
		cleanupIntervalMs: number;
		maxIdleMs: number;
		hooks?: SessionsConfig["hooks"];
	};

	constructor(runtime?: IAgentRuntime, cfg: SessionsConfig = {}) {
		super(runtime);
		this.cfg = {
			defaultTimeoutMs: cfg.defaultTimeoutMs ?? 3_600_000,
			autoRenew: cfg.autoRenew ?? true,
			cleanupIntervalMs: cfg.cleanupIntervalMs ?? 300_000,
			maxIdleMs: cfg.maxIdleMs ?? 1_800_000,
		};
		this.cfg.hooks = cfg.hooks;
	}

	async start(): Promise<void> {
		this.cleanup = setInterval(() => this.prune(), this.cfg.cleanupIntervalMs);
		logger.info("[sessions] started");
		await this.cfg.hooks?.onStart?.(this);
	}

	async stop(): Promise<void> {
		if (this.cleanup) clearInterval(this.cleanup);
		logger.info("[sessions] stopped");
		await this.cfg.hooks?.onStop?.(this);
	}

	create(userId: string): SessionRecord {
		const now = Date.now();
		const id = randomUUID();
		const rec: SessionRecord = {
			id,
			userId,
			createdAt: new Date(now).toISOString(),
			lastSeenAt: new Date(now).toISOString(),
			expiresAt: new Date(now + this.cfg.defaultTimeoutMs).toISOString(),
		};
		this.sessions.set(id, rec);
		void this.cfg.hooks?.onCreate?.(rec, this);
		return rec;
	}

	touch(id: string): SessionRecord | undefined {
		const rec = this.sessions.get(id);
		if (!rec) return undefined;
		const now = Date.now();
		rec.lastSeenAt = new Date(now).toISOString();
		if (this.cfg.autoRenew)
			rec.expiresAt = new Date(now + this.cfg.defaultTimeoutMs).toISOString();
		void this.cfg.hooks?.onTouch?.(rec, this);
		return rec;
	}

	get(id: string) {
		return this.sessions.get(id);
	}
	all() {
		return Array.from(this.sessions.values());
	}
	remove(id: string) {
		if (this.sessions.has(id)) {
			this.sessions.delete(id);
			void this.cfg.hooks?.onRemove?.(id, this);
		}
	}

	private prune() {
		const now = Date.now();
		const removed: SessionRecord[] = [];
		this.sessions.forEach((rec, id) => {
			const idleMs = now - new Date(rec.lastSeenAt).getTime();
			const expired = now > new Date(rec.expiresAt).getTime();
			if (expired || idleMs > this.cfg.maxIdleMs) {
				this.sessions.delete(id);
				removed.push(rec);
			}
		});
		if (removed.length) void this.cfg.hooks?.onPrune?.(removed, this);
	}
}
