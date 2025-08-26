# Community Management (Overview)

This page summarizes out-of-the-box community features and where they live in this repo.

## Components in this repo
- Plugins wiring: `src/plugins/index.ts` (includes `@elizaos/plugin-bootstrap`, `@elizaos/plugin-sql`, and conditional platform plugins)
- Feature flags: `src/config/environment.ts` (derives `features.hasDiscord|hasTelegram|hasTwitter` from `.env`)
- Character setup: `src/characters/nubi.ts` (includes platform plugins conditionally)
- Community helper actions: `src/actions/community-actions.ts` (`MENTOR`, `BUILD_COMMUNITY`)
- Environment template: `env.example` (platform and feature keys)
- Extended guide: `docs/COMMUNITY_MANAGEMENT_SYSTEM.md`

## Platform integrations
- Discord: enable with `DISCORD_API_TOKEN` (+ app id). Plugin auto-loads
- Telegram: enable with `TELEGRAM_BOT_TOKEN`
- Twitter/X: credentials-based auth with cookie persistence (`TWITTER_USERNAME`, `TWITTER_PASSWORD`, `TWITTER_EMAIL`, `TWITTER_COOKIES=[]`)

## Core community actions (bootstrap)
- Roles: `UPDATE_ROLE` (OWNER/ADMIN/NONE model)
- Room controls: `MUTE_ROOM`, `UNMUTE_ROOM`, `FOLLOW_ROOM`, `UNFOLLOW_ROOM`
- Messaging/utilities: `SEND_MESSAGE`, `UPDATE_SETTINGS`, `UPDATE_ENTITY`

## How to use (prompts)
- Roles: "Make @user an admin", "Remove admin from @user"
- Mute: "Mute this channel"; Unmute: "Unmute this room"
- Follow: "Start following this thread"; Unfollow: "Stop following this conversation"

## Verification checklist
- Boot logs show platform plugins registered
- In-channel prompts trigger appropriate action confirmations
- Muted rooms only respond to explicit mentions

## References
- `src/plugins/index.ts`
- `src/config/environment.ts`
- `src/characters/nubi.ts`
- `src/actions/community-actions.ts`
- `env.example`
- `docs/COMMUNITY_MANAGEMENT_SYSTEM.md`
