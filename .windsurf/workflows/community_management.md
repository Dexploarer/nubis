---
description: End-to-end community management (enable, operate, test)
---

# Community Management

Use this to enable and operate community features across Discord, Telegram, and Twitter/X.

## Prereqs
- Ensure `@elizaos/plugin-bootstrap` is enabled
  - Verified in `src/plugins/index.ts` and `src/characters/nubi.ts`
- Configure at least one model provider in `.env` (e.g. `OPENAI_API_KEY`)

## 1) Enable platforms
- See `/platform_setup` for keys. Minimal:
  - Discord: `DISCORD_API_TOKEN`
  - Telegram: `TELEGRAM_BOT_TOKEN`
  - Twitter/X: `TWITTER_USERNAME`, `TWITTER_PASSWORD`, `TWITTER_EMAIL` (cookies auto-managed)

## 2) Start the agent
- Dev: `bun run dev` or `npm run dev`
- Prod: `bun run start` or `npm start`

## 3) Out-of-the-box controls
- Roles and permissions → `/roles_and_permissions`
- Room controls (mute/follow) → `/room_controls`
- Built-in actions list: `../rules/elizaos_template-quick-reference.md` (FOLLOW_ROOM, MUTE_ROOM, UNFOLLOW_ROOM, UNMUTE_ROOM, UPDATE_ROLE, SEND_MESSAGE, etc.)

## 4) How to use (chat prompts)
- Assign role: “Make @user an admin for this server”
- Revoke role: “Remove admin from @user”
- Mute room: “Mute this channel for now”
- Unmute room: “Unmute this room”
- Follow room: “Start following this thread and chime in when helpful”
- Unfollow room: “Stop following this conversation”

Tip: Actions are decided by templates in `@elizaos/plugin-bootstrap` and executed automatically.

## 5) Nubi’s community helpers
- Custom actions: `src/actions/community-actions.ts`
  - `MENTOR` for guidance/mentorship
  - `BUILD_COMMUNITY` for engagement strategy

## 6) Validate behavior
- Confirm `@elizaos/plugin-bootstrap` is present in logs on boot
- In a channel, send the prompts above and verify the agent’s action messages
- For Twitter/X, run a dry test first (no posting) by not enabling any auto-post setting

## 7) Troubleshooting
- No responses? Verify model key in `.env`
- Platform not responding? Recheck tokens in `.env` and that the plugin is enabled in `src/plugins/index.ts`
- Role updates failing? Ensure you have adequate permissions (OWNER/ADMIN)

## References
- `../rules/elizaos_template-quick-reference.md`
- `../rules/elizaos_interface_system.md`
- `../knowledge/community_management.md`

### Core internal references
- `../rules/elizaos_development_workflow.md`
- `../rules/elizaos_coding_standards.md`
- `../rules/elizaos-architecture-patterns.md`
- `../rules/testing_standards.md`
- `../rules/elizaos_security_protocols.md`
- `../rules/elizaos_template_system.md`
- `../rules/elizaos_memory_operational_rules.md`
- `../rules/elizaos_memory_quick_reference.md`
- `../knowledge/README.md`
