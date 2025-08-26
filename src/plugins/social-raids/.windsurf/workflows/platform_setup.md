---
description: Platform setup for Discord, Telegram, Twitter/X
---

# Platform Setup

Configure platform credentials and verify plugins are enabled.

## 1) Add credentials to .env

- Discord
  - DISCORD_APPLICATION_ID=
  - DISCORD_API_TOKEN=
- Telegram
  - TELEGRAM_BOT_TOKEN=
- Twitter/X (credentials auth with cookies persistence)
  - TWITTER_USERNAME=
  - TWITTER_PASSWORD=
  - TWITTER_EMAIL=
  - TWITTER_COOKIES=[] # leave empty; will be auto-populated after first login

See `env.example` for full context.

## 2) Verify flags and plugins

- Feature flags derive from `src/config/environment.ts`:
  - `features.hasDiscord` → DISCORD_API_TOKEN
  - `features.hasTelegram` → TELEGRAM_BOT_TOKEN
  - `features.hasTwitter` → TWITTER_USERNAME + TWITTER_PASSWORD
- Plugins are composed in `src/plugins/index.ts`:
  - Always: `@elizaos/plugin-bootstrap`, `@elizaos/plugin-sql`, `projectPlugin`, `socialRaidsPlugin`
  - Conditional: `@elizaos/plugin-discord`, `@elizaos/plugin-telegram`, `xmcpxPlugin`

## 3) Run and validate

- Start: `bun run dev` (or `npm run dev`)
- Watch logs on boot:
  - Look for lines indicating which platform plugins were registered
- Send a test message in the target platform to confirm connectivity

## 4) Troubleshooting

- Missing plugin? Re-check the env var and restart the process
- Twitter auth loops? Ensure USERNAME/EMAIL/PASSWORD are correct; cookies will persist after first success
- Discord bot not responsive? Verify the bot is invited to the server and has correct intents/permissions

## References

- `../rules/security_protocols.md`
- `../rules/elizaos_interface_system.md`
- `../rules/twitter.mdc`

### Core internal references

- `../rules/elizaos_development_workflow.md`
- `../rules/elizaos_coding_standards.md`
- `../rules/elizaos-architecture-patterns.md`
- `../rules/testing_standards.md`
- `../rules/elizaos_security_protocols.md`
- `../rules/elizaos_template-quick-reference.md`
- `../rules/elizaos_template_system.md`
- `../rules/elizaos_memory_operational_rules.md`
- `../rules/elizaos_memory_quick_reference.md`
- `../knowledge/README.md`
