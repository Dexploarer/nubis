# Discord Integration for NUBI Agent

## Overview

NUBI's Discord integration implements strict @ mention validation and Supabase MCP connectivity, ensuring the agent only responds when explicitly called upon while maintaining full database access capabilities.

## Key Features

### 🎯 **@ Mention Validation**
- **Channel Behavior**: Only responds in guild channels when @ mentioned
- **DM Behavior**: Responds naturally in direct messages (no @ required)
- **Bot Filtering**: Never responds to messages from other bots
- **Self-Filtering**: Never responds to own messages
- **Mention Patterns**: Recognizes multiple @ mention variations

### 🔌 **Supabase MCP Integration**
- **Database Connectivity**: Full access to community data through MCP
- **Real-time Queries**: Query community metrics, member data, and analytics
- **Secure Access**: Encrypted connections with role-based permissions
- **Performance**: Optimized database operations for Discord context

### 🌐 **Real-time Communication**
- **WebSocket Support**: Live messaging through ElizaOS Socket.IO
- **Auto-reconnection**: Robust connection management
- **Heartbeat Monitoring**: Connection health tracking
- **Log Streaming**: Real-time debugging and monitoring

## Configuration

### Environment Variables

```bash
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_GUILD_ID=your_guild_id

# Supabase MCP Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_URL=your_database_url
SUPABASE_DB_PASSWORD=your_database_password
SUPABASE_MCP_PORT=3001

# MCP Server Settings
DISABLE_HTTP_SERVER=false
PORT=3001
```

### Character Settings

The NUBI character configuration includes Discord-specific settings:

```typescript
settings: {
  elizaos: {
    discord: {
      requireMention: true,
      allowDirectMessages: true,
      ignoreBotMessages: true,
      ignoreSelfMessages: true,
      mentionPatterns: ["@nubi", "@nubi_guardian", "@NUBI", "@NUBI_GUARDIAN"],
      allowedChannels: ["GUILD_TEXT", "DM"],
      adminRoles: ["OWNER", "ADMIN", "MODERATOR"],
      responseCooldown: 5
    }
  }
}
```

## Message Flow

### 1. Message Reception
```
Discord Message → WebSocket → ElizaOS Router → MessageBusService
```

### 2. Validation Pipeline
```
Message → Bot Check → Self Check → Channel Type Check → @ Mention Validation
```

### 3. Response Generation
```
Valid Message → Context Analysis → Knowledge Retrieval → Response Generation → Discord Reply
```

## @ Mention Patterns

NUBI recognizes these @ mention variations:

- `@nubi` - Standard mention
- `@nubi_guardian` - Formal mention
- `@NUBI` - Capitalized mention
- `@NUBI_GUARDIAN` - Formal capitalized mention

## Channel Behavior

### Guild Channels (Servers)
- **Requirement**: Must include @ mention
- **Response**: Full NUBI personality and capabilities
- **Cooldown**: 5-second response cooldown
- **Permissions**: Role-based access control

### Direct Messages
- **Requirement**: No @ mention needed
- **Response**: Natural conversation flow
- **Cooldown**: No cooldown restrictions
- **Permissions**: Full access for trusted users

## Database Integration

### Available Operations
- **Community Metrics**: Member count, activity levels, engagement rates
- **User Analytics**: Individual participation, contribution patterns
- **Content Analysis**: Message sentiment, topic distribution
- **Performance Tracking**: Response times, satisfaction metrics

### Example Queries
```typescript
// Get community health metrics
await querySupabaseData(
  "SELECT * FROM community_metrics WHERE guild_id = $1",
  "community_metrics",
  { guildId: guild.id }
);

// Check member activity
await querySupabaseData(
  "SELECT * FROM member_activity WHERE user_id = $1",
  "member_activity",
  { userId: author.id }
);
```

## Error Handling

### Connection Issues
- **Automatic Reconnection**: Up to 5 attempts with exponential backoff
- **Fallback Mode**: Graceful degradation when MCP unavailable
- **Health Monitoring**: Continuous connection status tracking

### Validation Failures
- **Silent Ignore**: Invalid messages are ignored without response
- **Logging**: All validation failures are logged for debugging
- **Rate Limiting**: Prevents spam and abuse

## Security Features

### Authentication
- **Bot Token Security**: Encrypted storage and transmission
- **Role-based Access**: Different permissions for different user roles
- **Channel Restrictions**: Configurable channel access controls

### Data Protection
- **Encrypted Storage**: Sensitive data encrypted at rest
- **Secure Transmission**: All communications use encrypted channels
- **Access Logging**: Complete audit trail of all operations

## Monitoring and Debugging

### Real-time Logs
- **WebSocket Logs**: Live connection status and message flow
- **Validation Logs**: @ mention validation results
- **Database Logs**: MCP query performance and results

### Health Checks
- **Connection Status**: Discord and MCP connection health
- **Response Times**: Message processing performance metrics
- **Error Rates**: Validation and processing error tracking

## Best Practices

### For Developers
1. **Always validate @ mentions** before processing messages
2. **Use MCP connections** for database operations
3. **Implement proper error handling** for all operations
4. **Monitor connection health** continuously

### For Users
1. **Use @ mentions** in server channels to get NUBI's attention
2. **Send DMs** for private conversations
3. **Be specific** about database queries and community needs
4. **Respect response cooldowns** in busy channels

## Troubleshooting

### Common Issues

#### NUBI Not Responding
- Check if message includes @ mention
- Verify bot has proper permissions
- Check connection status

#### Database Connection Issues
- Verify Supabase credentials
- Check MCP server status
- Review network connectivity

#### Message Validation Errors
- Check message format and content
- Verify channel type and permissions
- Review bot configuration

### Debug Commands
```bash
# Check Discord service status
curl /discord/status

# Test message validation
curl -X POST /discord/validate -d '{"message": "@nubi test"}'

# Check MCP connections
curl /discord/mcp/status
```

## Future Enhancements

### Planned Features
- **Advanced Analytics**: Machine learning-powered insights
- **Custom Commands**: User-defined response patterns
- **Integration APIs**: Third-party service connections
- **Mobile Support**: Mobile-optimized interactions

### Extension Points
- **Plugin System**: Custom Discord functionality
- **Webhook Support**: External service integrations
- **Multi-language**: Internationalization support
- **Advanced Permissions**: Granular access controls

---

For technical support or feature requests, consult the ElizaOS documentation or contact the development team.

