# Discord Integration Guide

NUBI's Discord integration implements strict @ mention validation and SQL plugin connectivity, ensuring the agent only responds when explicitly called upon while maintaining full database access capabilities.

## Features

- **@ Mention Validation**: Only responds when explicitly mentioned
- **Database Integration**: Uses ElizaOS SQL plugin for data operations
- **Community Management**: Advanced moderation and engagement tools
- **Real-time Communication**: WebSocket-based message handling
- **Role-based Access**: Discord role integration with community roles

## Configuration

### Environment Variables

```bash
# Discord Configuration
DISCORD_API_TOKEN=your_discord_bot_token
ENABLE_DISCORD_BOT=true
DISCORD_APPLICATION_ID=your_application_id
```

### Bot Permissions

Ensure your Discord bot has the following permissions:

- Send Messages
- Read Message History
- Use Slash Commands
- Manage Roles (for community management)
- Kick Members (for moderation)
- Ban Members (for severe violations)

## SQL Plugin Configuration

The Discord integration uses the ElizaOS SQL plugin for database operations:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
ELIZAOS_DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

### Database Tables

The following tables are automatically created:

- `messages` - Discord message history
- `users` - Discord user information
- `roles` - Community role assignments
- `moderation_actions` - Moderation history
- `community_guidelines` - Community rules
