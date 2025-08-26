---
description: Room controls (mute, unmute, follow, unfollow)
---

# Room Controls

These actions come from `@elizaos/plugin-bootstrap` and are available out of the box when the plugin is enabled in `src/plugins/index.ts`.

## Actions

- MUTE_ROOM: Agent ignores messages unless explicitly mentioned
- UNMUTE_ROOM: Resume normal participation
- FOLLOW_ROOM: Agent eagerly participates without explicit mentions
- UNFOLLOW_ROOM: Agent stops eager participation

## Usage (natural language)

- "Mute this channel" / "Be quiet in here"
- "Unmute this room"
- "Follow this thread and contribute proactively"
- "Stop following this conversation"

## Behavior notes

- When muted, agent will only respond if mentioned by name/handle
- Decisions use yes/no templates internally; moderation intent must be clear

## Verify

1. Say: "Mute this channel"
2. Confirm subsequent messages are ignored
3. Mention the bot explicitly and confirm it can still reply
4. Say: "Unmute this room" to restore normal behavior

## References

- `../rules/elizaos_template-quick-reference.md`

### Core internal references

- `../rules/elizaos_development_workflow.md`
- `../rules/elizaos_coding_standards.md`
- `../rules/elizaos-architecture-patterns.md`
- `../rules/testing_standards.md`
- `../rules/elizaos_security_protocols.md`
- `../rules/elizaos_template_system.md`
- `../rules/elizaos_interface_system.md`
- `../rules/elizaos_memory_operational_rules.md`
- `../rules/elizaos_memory_quick_reference.md`
- `../knowledge/README.md`
