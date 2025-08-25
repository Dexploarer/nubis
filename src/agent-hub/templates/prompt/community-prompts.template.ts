import type { TemplateType } from "@elizaos/core";

export type CommunityPromptConfig = {
	tone?: "formal" | "casual" | "friendly" | "authoritative";
	language?: "en" | "es" | "fr" | "de";
	includeEmojis?: boolean;
	maxLength?: number;
};

export type CommunityPromptTemplates = {
	welcome: TemplateType;
	moderation: TemplateType;
	announcement: TemplateType;
	engagement: TemplateType;
	rules: TemplateType;
	help: TemplateType;
};

export function buildCommunityPrompts(
	config: CommunityPromptConfig = {},
): CommunityPromptTemplates {
	const cfg = {
		tone: config.tone ?? "friendly",
		language: config.language ?? "en",
		includeEmojis: config.includeEmojis ?? true,
		maxLength: config.maxLength ?? 500,
	};

	const emoji = cfg.includeEmojis ? " 🎉" : "";
	const toneModifiers = getToneModifiers(cfg.tone);

	return {
		welcome: ({ state }: { state: any }) => {
			const memberName = state?.memberName || "new member";
			const communityName = state?.communityName || "our community";

			return `Welcome to ${communityName}, ${memberName}!${emoji}

${toneModifiers.welcome}

We're excited to have you join us. Here are a few things to get you started:
• Take a moment to read our community guidelines
• Introduce yourself in the #introductions channel
• Don't hesitate to ask questions - we're here to help!

Feel free to explore and make yourself at home. Welcome aboard!`;
		},

		moderation: ({ state }: { state: any }) => {
			const action = state?.action || "moderation";
			const reason = state?.reason || "community guidelines";
			const memberName = state?.memberName || "member";

			return `${toneModifiers.moderation}

This content has been ${action} because it violates our ${reason}.

${action === "warned" ? `@${memberName}, please review our community guidelines. This is a friendly reminder to keep our space welcoming for everyone.` : ""}
${action === "removed" ? `The content has been removed to maintain our community standards.` : ""}
${action === "banned" ? `This action was taken after multiple violations.` : ""}

If you have questions about this decision, please reach out to our moderation team privately.

Thank you for helping us maintain a positive community environment.`;
		},

		announcement: ({ state }: { state: any }) => {
			const title = state?.title || "Community Announcement";
			const content =
				state?.content || "Important information for our community";
			const urgency = state?.urgency || "normal";

			const urgencyEmoji =
				urgency === "urgent" ? "🚨" : urgency === "important" ? "📢" : "📝";

			return `${urgencyEmoji} **${title}** ${urgencyEmoji}

${toneModifiers.announcement}

${content}

${urgency === "urgent" ? "**Please read and take action if required.**" : ""}
${urgency === "important" ? "**Please review when you have a moment.**" : ""}

Thank you for your attention!`;
		},

		engagement: ({ state }: { state: any }) => {
			const type = state?.type || "general";
			const topic = state?.topic || "community discussion";

			return `${toneModifiers.engagement}

${type === "question" ? "🤔" : type === "discussion" ? "💭" : type === "event" ? "🎯" : "💡"} **${topic}**

${type === "question" ? "We'd love to hear your thoughts on this!" : ""}
${type === "discussion" ? "Let's start a conversation about this topic." : ""}
${type === "event" ? "Join us for this exciting community event!" : ""}

${toneModifiers.engagementCall}

What do you think? Share your perspective below! 👇`;
		},

		rules: ({ state }: { state: any }) => {
			const communityName = state?.communityName || "our community";

			return `📋 **${communityName} Community Guidelines** 📋

${toneModifiers.rules}

**Core Principles:**
• Be respectful and kind to everyone
• No harassment, hate speech, or discrimination
• Keep discussions relevant and constructive
• Respect privacy and personal boundaries
• No spam, self-promotion, or off-topic content

**What We Value:**
• Open and honest communication
• Constructive feedback and discussion
• Supporting fellow community members
• Learning and growing together
• Having fun while being respectful

**Consequences:**
• Minor violations: Warning and content removal
• Repeated violations: Temporary suspension
• Serious violations: Permanent removal

**Need Help?**
• Report issues to moderators
• Ask questions in #help channel
• Review our FAQ for common questions

Thank you for helping us maintain a welcoming and inclusive community! 🌟`;
		},

		help: ({ state }: { state: any }) => {
			const topic = state?.topic || "general help";

			return `${toneModifiers.help}

**Need help with ${topic}?** 🤝

Here are some resources that might help:

**📚 Documentation & Guides**
• Community guidelines and rules
• FAQ and common questions
• Getting started guide for new members

**🛠️ Tools & Features**
• How to use community features
• Available channels and their purposes
• Moderation and reporting tools

**👥 Getting Support**
• Ask in the #help channel
• Contact moderators privately
• Check pinned messages in relevant channels

**🚀 Quick Actions**
• Use /help for command list
• Use /rules for community guidelines
• Use /report for issues

Don't hesitate to ask if you need further assistance! We're here to help make your experience great.`;
		},
	};
}

function getToneModifiers(tone: string) {
	switch (tone) {
		case "formal":
			return {
				welcome: "We are pleased to welcome you to our community.",
				moderation: "A moderation action has been taken.",
				announcement:
					"This announcement contains important information for all community members.",
				engagement: "We encourage community participation and discussion.",
				engagementCall: "Your participation is valued and appreciated.",
				rules: "These guidelines establish the standards for our community.",
				help: "We are committed to providing comprehensive support.",
			};

		case "casual":
			return {
				welcome: "Hey there! Welcome to the crew!",
				moderation: "Hey, we had to take some action here.",
				announcement: "Hey everyone, got some news to share!",
				engagement: "Let's get the conversation going!",
				engagementCall: "Jump in and share your thoughts!",
				rules: "Here's what keeps our community awesome.",
				help: "Need a hand? We've got you covered!",
			};

		case "authoritative":
			return {
				welcome: "Welcome. You are now a member of this community.",
				moderation: "A moderation decision has been made.",
				announcement: "This is an official community announcement.",
				engagement: "Community participation is expected and encouraged.",
				engagementCall: "Your input is required for community development.",
				rules: "These are the established community standards.",
				help: "Support resources are available for your use.",
			};

		case "friendly":
		default:
			return {
				welcome: "We're so excited to have you join our community!",
				moderation: "We've had to take some action to keep our community safe.",
				announcement: "We have some exciting news to share with everyone!",
				engagement: "We'd love to hear what you think about this!",
				engagementCall: "Your voice matters - please share your thoughts!",
				rules: "These guidelines help us create an amazing community together.",
				help: "We're here to help you have the best experience possible!",
			};
	}
}

// Utility function to format prompts with length limits
export function formatPrompt(
	template: TemplateType,
	state: any,
	maxLength?: number,
): string {
	const prompt =
		typeof template === "function" ? template({ state }) : template;
	const limit = maxLength || 500;

	if (prompt.length <= limit) {
		return prompt;
	}

	// Truncate and add ellipsis if too long
	return prompt.substring(0, limit - 3) + "...";
}
