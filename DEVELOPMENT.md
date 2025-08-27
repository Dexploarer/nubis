# Development Guide

This document covers development patterns and best practices for this ElizaOS project.

## Project Structure

```
src/
├── index.ts              # Main project entry point
├── characters/           # Character definitions
│   ├── nubi.ts          # Primary character implementation
│   ├── template.ts      # Template for creating new characters
│   └── index.ts         # Character exports
├── config/              # Configuration management
│   └── environment.ts   # Environment variables and settings
└── plugins/             # Custom plugin implementations
    ├── xmcpx-wrapper.ts # Twitter integration plugin
    └── index.ts         # Plugin exports
```

## Character Development

### Adding New Characters

1. Create a new character file in `src/characters/`
2. Export it from `src/characters/index.ts`
3. Update the `getCharacter()` function to include the new character

### Character Configuration

Characters can be configured through environment variables:

- `CHARACTER_NAME`: Name of the character
- `COMMUNITY_NAME`: Name of the community the character serves

### Using the Template

The `createCharacterFromTemplate()` function provides a base character that can be customized:

```typescript
import { createCharacterFromTemplate } from './characters/template.js';

const myCharacter = createCharacterFromTemplate({
  name: 'CustomBot',
  bio: ['Custom bio here'],
  // ... other overrides
});
```

## Plugin Development

### Custom Plugins

Follow ElizaOS plugin patterns:

1. Create plugin file in `src/plugins/`
2. Export from `src/plugins/index.ts`
3. Add to enabled plugins list based on configuration

### Environment-Based Plugin Loading

Plugins are conditionally loaded based on available configuration:

- Discord: Requires `DISCORD_API_TOKEN`
- Twitter: Requires `TWITTER_USERNAME` and `TWITTER_PASSWORD`
- Telegram: Requires `TELEGRAM_BOT_TOKEN`

## Environment Configuration

### Required Variables

```bash
# AI Provider (at least one required)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### Optional Variables

```bash
# Character Configuration
CHARACTER_NAME=Nubi
COMMUNITY_NAME=Developer Community

# Social Media Integration
DISCORD_API_TOKEN=your_discord_token
TWITTER_USERNAME=your_twitter_username
TWITTER_PASSWORD=your_twitter_password
TELEGRAM_BOT_TOKEN=your_telegram_token

# Database
DATABASE_URL=sqlite://./data/agent.db
```

## Development Workflow

1. **Setup**: Copy `env.example` to `.env` and configure
2. **Development**: Run `bun run dev` for development mode
3. **Testing**: Run `bun test` for tests
4. **Building**: Run `bun run build` to compile
5. **Production**: Run `bun run start` for production

## Best Practices

### Character Design

- Keep personality consistent but adaptable
- Provide diverse message examples
- Include relevant knowledge areas
- Make bio and lore engaging but professional

### Configuration

- Use environment variables for all runtime configuration
- Provide sensible defaults
- Validate required configuration on startup

### Plugin Development

- Follow ElizaOS plugin interfaces
- Handle errors gracefully
- Provide clear logging
- Make plugins conditionally loadable

## Extending the Project

### Adding Social Media Platforms

1. Add configuration for the platform in `environment.ts`
2. Create or import the appropriate ElizaOS plugin
3. Update `getEnabledPlugins()` to conditionally include it
4. Add to the character's `plugins` array if needed

### Adding New Features

1. Keep changes within ElizaOS patterns
2. Add environment configuration if needed
3. Update documentation
4. Test thoroughly with different configurations

## Troubleshooting

### Common Issues

**Character not loading**: Check that the character is properly exported from `characters/index.ts`

**Plugin not working**: Verify required environment variables are set

**Build errors**: Ensure all imports use proper file extensions (`.js` not `.ts`)

**Runtime errors**: Check that all required dependencies are installed and environment is properly configured
