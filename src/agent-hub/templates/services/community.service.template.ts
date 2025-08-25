import {
	type EventPayload,
	type EventType,
	type IAgentRuntime,
	logger,
	Service,
} from "@elizaos/core";

// Define proper types for community data
export interface CommunityMemberData {
	id: string;
	name?: string;
	email?: string;
	role?: string;
	joinedAt?: string;
	status?: "active" | "inactive" | "banned";
	[key: string]: unknown;
}

export interface CommunityContentData {
	id: string;
	type: "post" | "comment" | "message";
	content: string;
	authorId: string;
	timestamp: string;
	[key: string]: unknown;
}

export interface CommunityEventPayload {
	memberId: string;
	memberData?: CommunityMemberData;
	contentId?: string;
	contentData?: CommunityContentData;
	[key: string]: unknown;
}

export type CommunityServiceConfig = {
	enabled?: boolean;
	maxMembers?: number;
	autoModeration?: boolean;
	welcomeMessages?: boolean;
	analytics?: boolean;
	hooks?: {
		onMemberJoin?: (
			memberId: string,
			memberData: CommunityMemberData,
		) => void | Promise<void>;
		onMemberLeave?: (memberId: string) => void | Promise<void>;
		onContentPosted?: (
			contentId: string,
			contentData: CommunityContentData,
		) => void | Promise<void>;
		onModerationAction?: (
			action: string,
			targetId: string,
			reason: string,
		) => void | Promise<void>;
	};
};

export class CommunityService extends Service {
	static serviceType = "community" as const;
	capabilityDescription =
		"Community management service for member tracking, moderation, and analytics";

	private cfg: CommunityServiceConfig;
	private members: Map<string, CommunityMemberData> = new Map();
	private content: Map<string, CommunityContentData> = new Map();
	private moderationLog: Array<{
		action: string;
		targetId: string;
		reason: string;
		timestamp: string;
	}> = [];

	constructor(runtime?: IAgentRuntime, cfg: CommunityServiceConfig = {}) {
		super(runtime);
		this.cfg = {
			enabled: cfg.enabled ?? true,
			maxMembers: cfg.maxMembers ?? 1000,
			autoModeration: cfg.autoModeration ?? true,
			welcomeMessages: cfg.welcomeMessages ?? true,
			analytics: cfg.analytics ?? true,
			hooks: cfg.hooks,
		};
	}

	async start(): Promise<void> {
		if (!this.cfg.enabled) {
			logger.info("[community] service disabled");
			return;
		}

		logger.info("[community] starting community service");
		logger.info(`[community] max members: ${this.cfg.maxMembers}`);
		logger.info(`[community] auto moderation: ${this.cfg.autoModeration}`);
		logger.info(`[community] welcome messages: ${this.cfg.welcomeMessages}`);
		logger.info(`[community] analytics: ${this.cfg.analytics}`);
	}

	async stop(): Promise<void> {
		logger.info("[community] stopping community service");
		this.members.clear();
		this.content.clear();
		this.moderationLog = [];
	}

	async onEvent(type: EventType, payload: EventPayload): Promise<void> {
		if (!this.cfg.enabled) return;

		logger.trace(`[community] event: ${String(type)}`);

		// Handle community-related events based on event type string
		const eventType = String(type);

		if (eventType.includes("MEMBER_JOIN") || eventType.includes("JOIN")) {
			await this.handleMemberJoin({
				memberId:
					(payload as any)?.memberId || (payload as any)?.id || "unknown",
				memberData:
					(payload as any)?.memberData || (payload as any)?.data || {},
			});
		} else if (
			eventType.includes("MEMBER_LEAVE") ||
			eventType.includes("LEAVE")
		) {
			await this.handleMemberLeave({
				memberId:
					(payload as any)?.memberId || (payload as any)?.id || "unknown",
			});
		} else if (
			eventType.includes("CONTENT_POSTED") ||
			eventType.includes("POST")
		) {
			await this.handleContentPosted({
				contentId:
					(payload as any)?.contentId || (payload as any)?.id || "unknown",
				contentData:
					(payload as any)?.contentData || (payload as any)?.data || {},
			});
		}
	}

	private async handleMemberJoin(payload: {
		memberId: string;
		memberData: CommunityMemberData;
	}): Promise<void> {
		const { memberId, memberData } = payload;

		if (this.members.size >= this.cfg.maxMembers!) {
			logger.warn(`[community] member limit reached, cannot add ${memberId}`);
			return;
		}

		this.members.set(memberId, {
			...memberData,
			joinedAt: new Date().toISOString(),
			status: "active",
		});

		logger.info(`[community] member joined: ${memberId}`);

		if (this.cfg.welcomeMessages) {
			await this.cfg.hooks?.onMemberJoin?.(memberId, memberData);
		}
	}

	private async handleMemberLeave(payload: {
		memberId: string;
	}): Promise<void> {
		const { memberId } = payload;

		if (this.members.has(memberId)) {
			this.members.delete(memberId);
			logger.info(`[community] member left: ${memberId}`);

			if (this.cfg.hooks?.onMemberLeave) {
				await this.cfg.hooks.onMemberLeave(memberId);
			}
		}
	}

	private async handleContentPosted(payload: {
		contentId: string;
		contentData: CommunityContentData;
	}): Promise<void> {
		const { contentId, contentData } = payload;

		this.content.set(contentId, {
			...contentData,
			timestamp: new Date().toISOString(),
		});

		logger.info(
			`[community] content posted: ${contentId} by ${contentData.authorId}`,
		);

		if (this.cfg.autoModeration) {
			await this.moderateContent(contentId, contentData);
		}

		if (this.cfg.hooks?.onContentPosted) {
			await this.cfg.hooks.onContentPosted(contentId, contentData);
		}
	}

	private async moderateContent(
		contentId: string,
		contentData: CommunityContentData,
	): Promise<void> {
		// Simple content moderation logic
		const text = contentData.content.toLowerCase();
		const flagged = text.includes("spam") || text.includes("inappropriate");

		if (flagged) {
			this.moderationLog.push({
				action: "flag",
				targetId: contentId,
				reason: "Content flagged as inappropriate",
				timestamp: new Date().toISOString(),
			});

			logger.warn(`[community] content flagged: ${contentId}`);

			if (this.cfg.hooks?.onModerationAction) {
				await this.cfg.hooks.onModerationAction(
					"flag",
					contentId,
					"Content flagged as inappropriate",
				);
			}
		}
	}

	// Public methods for external access
	getMember(memberId: string): CommunityMemberData | undefined {
		return this.members.get(memberId);
	}

	getContent(contentId: string): CommunityContentData | undefined {
		return this.content.get(contentId);
	}

	getAnalytics(): Record<string, unknown> {
		return {
			totalMembers: this.members.size,
			totalContent: this.content.size,
			moderationActions: this.moderationLog.length,
			activeMembers: Array.from(this.members.values()).filter(
				(m) => m.status === "active",
			).length,
		};
	}
}
