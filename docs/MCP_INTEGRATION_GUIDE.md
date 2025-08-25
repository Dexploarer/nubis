# MCP Integration Guide for NUBI Agent System

## Overview

This guide covers the integration of Model Context Protocol (MCP) with the NUBI agent system, specifically focusing on the XMCPX Twitter MCP server integration.

## What is MCP?

Model Context Protocol (MCP) allows your NUBI agent to use external tools and services. Think of it as giving NUBI abilities like web search, file access, or API connections.

## MCP Integration Status

✅ **MCP Plugin**: `@elizaos/plugin-mcp` installed and configured  
✅ **XMCPX Server**: Twitter MCP server integrated  
✅ **Character Configuration**: NUBI character updated with MCP capabilities  
✅ **Environment Variables**: All necessary MCP configs added to env.template  

## XMCPX Twitter MCP Server

### Features Available

The XMCPX server provides NUBI with comprehensive Twitter capabilities:

- **Tweet Management**: Post, search, like, retweet, quote tweet
- **User Operations**: Follow, unfollow, get profiles, search users  
- **Timeline Access**: Home timeline, user timelines, search results
- **Advanced Features**: Thread posting, media uploads, DMs
- **Grok Integration**: Chat with Twitter's Grok AI
- **Health Monitoring**: Built-in health checks and status monitoring
- **Raid Tweet Tool**: Specialized tool for posting viral raid tweets

### MCP Tools Available

NUBI can now use these MCP tools:

1. **`post_raid_tweet`** - Post viral tweets with NUBI community hashtags
2. **`tweet_compose`** - Compose engaging tweets under 280 chars
3. **`thread_plan`** - Plan educational threads (3-8 tweets)
4. **`reply_helpful`** - Draft constructive replies
5. **`profile_summary`** - Analyze profiles and suggest tweet ideas
6. **`raid_viral`** - Generate viral raid tweets with community hashtags

### Configuration

The XMCPX server is configured in the NUBI character settings:

```typescript
mcp: {
  servers: {
    xmcpx: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@promptordie/xmcpx'],
      env: {
        // Twitter authentication credentials
        TWITTER_USERNAME: process.env.TWITTER_USERNAME || '',
        TWITTER_PASSWORD: process.env.TWITTER_PASSWORD || '',
        TWITTER_EMAIL: process.env.TWITTER_EMAIL || '',
        // Optional: Cookie-based authentication
        TWITTER_COOKIES: process.env.TWITTER_COOKIES || '',
        // MCP server configuration
        DISABLE_HTTP_SERVER: 'false',
        PORT: process.env.XMCPX_PORT || '3000',
        // Rate limiting and session management
        MAX_REQUESTS_PER_MINUTE: process.env.MAX_REQUESTS_PER_MINUTE || '50',
        SESSION_TIMEOUT_MINUTES: process.env.SESSION_TIMEOUT_MINUTES || '1440',
      },
    },
  },
}
```

## Environment Variables

### Required MCP Variables

```bash
# MCP Configuration
ENABLE_MCP=true
MCP_LOG_LEVEL=info
MCP_CONNECTION_TIMEOUT=30000
MCP_MAX_RETRIES=3

# XMCPX Twitter MCP Server Configuration
XMCPX_PORT=3000
DISABLE_HTTP_SERVER=false
MAX_REQUESTS_PER_MINUTE=50
SESSION_TIMEOUT_MINUTES=1440
TWITTER_COOKIES=""
XMCPX_HEALTH_CHECK_ENABLED=true
XMCPX_AUTO_RECONNECT=true
XMCPX_RATE_LIMIT_BUFFER=0.8
```

### Twitter Authentication

```bash
# Twitter Configuration
TWITTER_USERNAME=YourTwitterUsername
TWITTER_PASSWORD=YourTwitterPassword
TWITTER_EMAIL=YourTwitterEmail
TWITTER_COOKIES="" # Optional: Add cookies for persistent auth
```

## Usage Examples

### Raid Tweet Example

NUBI can now post raid tweets using the MCP system:

```
User: "Post a raid tweet about our community"
NUBI: *uses post_raid_tweet MCP tool to create and post viral content*
```

### Web Search Example

With additional MCP servers, NUBI can search the web:

```
User: "Search for the latest AI news"
NUBI: *uses web search MCP tool to find current information*
```

## Testing MCP Integration

### 1. Verify MCP Plugin Installation

```bash
bun run src/test-character.ts
```

### 2. Test XMCPX Server Connection

```bash
# Check if XMCPX can be installed and run
npx -y @promptordie/xmcpx --help
```

### 3. Test MCP Tools

Start your agent and ask NUBI to use MCP tools:

```
User: "What MCP tools do you have available?"
NUBI: *lists available MCP tools and capabilities*
```

## Troubleshooting

### Common Issues

1. **Server not connecting**: Check that the command/URL is correct
2. **Tools not available**: Ensure `@elizaos/plugin-mcp` is in your plugins array
3. **Permission errors**: For STDIO servers, ensure the command can be executed
4. **Authentication failures**: Verify Twitter credentials are correct

### Debug Steps

1. Check MCP plugin is loaded in character configuration
2. Verify environment variables are set correctly
3. Test XMCPX server independently
4. Check MCP server logs for connection issues

## Adding More MCP Servers

You can easily add more MCP servers to NUBI's capabilities:

```typescript
// Example: Adding Firecrawl for web search
firecrawl: {
  type: 'stdio',
  command: 'npx',
  args: ['-y', 'firecrawl-mcp'],
  env: {
    FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY || '',
  },
},
```

## Security Considerations

- **Authentication**: Twitter credentials are stored in environment variables
- **Rate Limiting**: XMCPX includes built-in rate limiting
- **Session Management**: Secure session handling with automatic reconnection
- **API Access**: Limited to configured MCP servers only

## Next Steps

1. **Test MCP Integration**: Verify all tools are working correctly
2. **Configure Twitter Auth**: Set up proper Twitter authentication
3. **Add More Servers**: Integrate additional MCP servers as needed
4. **Custom Tools**: Develop custom MCP tools for NUBI-specific needs

## Resources

- [ElizaOS MCP Setup Guide](https://docs.elizaos.ai/guides/mcp-setup-guide)
- [XMCPX GitHub Repository](https://github.com/Dexploarer/xmcpx)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)

---

*This guide is part of the NUBI Agent System documentation. For more information, see the main README.md file.*
