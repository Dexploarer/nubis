# ElizaOS Templates: Complete List (Upstream Reference)

This page summarizes all core message, character, and action templates that ship with ElizaOS by default, based on upstream source references. Use this to align local configuration, docs, and workflows.

Note: For authoritative rules, see `../rules/elizaos_template_system.md` and `../rules/elizaos_template-quick-reference.md`.

## Message Templates

- **shouldRespondTemplate** — Decide RESPOND | IGNORE | STOP
  - Upstream: `packages/core/src/prompts.ts`
- **messageHandlerTemplate** — Generate dialog and an ordered list of actions; provider selection rules
  - Upstream: `packages/core/src/prompts.ts`
- **postCreationTemplate** — Create social posts in the agent voice
  - Upstream: `packages/core/src/prompts.ts`
- **imageDescriptionTemplate** — Multi-level image analysis (title, description, detailed text)
  - Upstream: `packages/core/src/prompts.ts`
- **booleanFooter** — Constraint hint: respond strictly YES or NO (used as a footer)
  - Upstream: `packages/core/src/prompts.ts`

## Action-Specific Templates

- **replyTemplate** — Character dialog reply XML
  - Upstream: `packages/plugin-bootstrap/src/actions/reply.ts`
- **imageGenerationTemplate** — Prompt for IMAGE model generation
  - Upstream: `packages/plugin-bootstrap/src/actions/imageGeneration.ts`

## Character Templates (Agent Presets)

- **none** — Blank starter
- **discord-bot** — Discord server assistant
- **telegram-bot** — Telegram channels/groups assistant
- **slack-bot** — Slack workspace assistant
- **twitter-agent** — Twitter/X engagement agent
- **github-bot** — GitHub repository assistant
- **instagram-agent** — Instagram content manager
  - Upstream: `packages/client/src/config/agent-templates.ts`

## Base Character

- **Eliza** — Default versatile AI assistant with full configuration
  - Upstream: `packages/cli/src/characters/eliza.ts`

## Actions: Interface and Built-ins

- **Action interface** includes: `name`, `description`, `validate()`, `handler()`, `examples`
  - Upstream reference: `packages/plugin-bootstrap/src/actions/components.ts` (interface shape)
- **Built-in actions** (names only):
  - REPLY
  - GENERATE_IMAGE
  - CHOICE
  - FOLLOW_ROOM
  - IGNORE
  - MUTE_ROOM
  - NONE
  - UPDATE_ROLE
  - SEND_MESSAGE
  - UPDATE_SETTINGS
  - UNFOLLOW_ROOM
  - UNMUTE_ROOM
  - UPDATE_ENTITY
  - Upstream index: `packages/plugin-bootstrap/src/actions/index.ts`

## Setup and Configuration Notes

- Templates use XML output blocks, e.g. `<response>...</response>` with strict “no pre/post text” rule.
- Templates support `{{placeholders}}` populated from state/providers; double braces are converted to triple braces for non-escaped rendering.
- Provider selection is critical for accuracy and performance (ATTACHMENTS, ENTITIES, RELATIONSHIPS, FACTS, WORLD).
- Character JSON/objects support: `name`, `system`, `bio`, `topics`, `adjectives`, `messageExamples`, `postExamples`, `style`, `plugins`, `settings`.
- Plugin discovery is filtered by available environment variables (API keys) in upstream `getElizaCharacter()`.

## How to use this list locally

- Reference these templates in custom actions via `runtime.character.templates?.<name> || defaultTemplate`.
- Keep local knowledge and workflows aligned with upstream changes by running the `/templates_audit` workflow.

Last updated: 2025-08-26
