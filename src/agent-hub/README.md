# NUBI Agent Hub

The NUBI Agent Hub is the central repository for all extensible code, services, and functionality that powers the NUBI agent system.

## 🏗️ Architecture

```
agent-hub/
├── config/           # Configuration and environment management
├── services/         # Core services (database, app management)
├── bots/            # Bot services (Discord, Telegram)
├── raids/           # Raid system and coordination
├── plugin/          # Plugin system
├── mcp/             # MCP server integration
├── knowledge/       # Knowledge base and memory systems
├── templates/       # Template system
├── anubis/          # Anubis-specific functionality
├── nubi/            # NUBI-specific functionality
├── core.ts          # Core service manager and exports
├── index.ts         # Main agent hub entry point
└── character.ts     # Character definition and personality
```

## 🚀 Quick Start

### Import Services
```typescript
import { 
  DatabaseService, 
  DiscordBotService, 
  TelegramBotService,
  serviceManager 
} from './agent-hub';
```

### Initialize Services
```typescript
// Initialize all services
await serviceManager.initialize();

// Get specific services
const dbService = serviceManager.getService<DatabaseService>('database');
const discordBot = serviceManager.getService<DiscordBotService>('discord');
```

## 🔧 Core Services

### DatabaseService
- Supabase client management
- PostgreSQL connection pooling
- Health monitoring and connection testing

### AppService
- Main application lifecycle management
- Service coordination and health monitoring
- Graceful shutdown handling

## 🤖 Bot Services

### DiscordBotService
- Discord.js integration
- Command handling (`!ping`, `!status`, `!help`)
- Mention handling and AI integration

### TelegramBotService
- Telegram bot API integration
- Interactive keyboards and commands
- Raid coordination and status reporting

## 🚀 Raid System

The raid system provides comprehensive social media coordination:

- **Auto-raids**: Scheduled every 6 hours
- **Point System**: Like (1pt), Retweet (3pts), Comment (5pts), Join (10pts)
- **Leaderboards**: Community ranking system
- **Moderation**: Anti-spam and content filtering
- **Multi-platform**: Discord, Telegram, Twitter integration

### Available Commands
```bash
# Discord
!ping, !status, !help

# Telegram
/start, /help, /status, /raid start, /raid join, /leaderboard
```

## 📊 Configuration

All configuration is managed through environment variables:

```typescript
import { env } from './agent-hub';

// Access configuration
const dbUrl = env.DATABASE_URL;
const discordEnabled = env.ENABLE_DISCORD_BOT;
const raidInterval = env.RAID_INTERVAL_HOURS;
```

## 🔌 Plugin System

The agent hub supports extensible plugins:

```typescript
import { starterPlugin } from './agent-hub';

// Plugins are automatically loaded and managed
export const projectAgent: ProjectAgent = {
  character,
  init: async (runtime) => await initCharacter({ runtime }),
  plugins: [starterPlugin], // Add custom plugins here
  tests: [ProjectStarterTestSuite],
};
```

## 🧠 Service Manager

The `NUBIServiceManager` provides centralized service management:

```typescript
import { serviceManager } from './agent-hub';

// Initialize all services
await serviceManager.initialize();

// Check service availability
if (serviceManager.isServiceAvailable('discord')) {
  const discordBot = serviceManager.getService<DiscordBotService>('discord');
  // Use discord bot
}

// Graceful shutdown
await serviceManager.shutdown();
```

## 🚀 Adding New Services

### 1. Create Service Class
```typescript
// src/agent-hub/services/my-service.ts
export class MyService {
  async start() { /* ... */ }
  async stop() { /* ... */ }
}
```

### 2. Add to Core Exports
```typescript
// src/agent-hub/core.ts
export { default as MyService } from './services/my-service';
```

### 3. Register in Service Manager
```typescript
// In NUBIServiceManager.initialize()
const myService = new MyService();
await myService.start();
this.services.set('myService', myService);
```

## 🔍 Health Monitoring

All services include health monitoring:

```typescript
// Database health
const dbHealth = await dbService.healthCheck();

// Bot status
const discordReady = discordBot.isBotReady();
const telegramReady = telegramBot.isBotReady();

// Overall system status
const status = await appService.getStatus();
```

## 📡 HTTP Endpoints

The system provides monitoring endpoints:

- `GET /health` - Basic health check
- `GET /status` - Full system status
- `GET /bots/discord/status` - Discord bot status
- `GET /bots/telegram/status` - Telegram bot status
- `GET /raids/status` - Raid system status

## 🛡️ Security Features

- JWT authentication
- Encryption key management
- Secure cookie handling
- CORS protection
- Anti-detection algorithms

## 🧪 Testing

```typescript
// Test connections
import { testConnections } from './test-connections';
await testConnections();

// Simple package test
import { simpleTest } from './simple-test';
await simpleTest();
```

## 🔄 Lifecycle Management

```typescript
// Start application
import { main } from './main';
await main();

// Or start individual components
import { serviceManager } from './agent-hub';
await serviceManager.initialize();
```

## 📚 API Reference

### Service Manager
- `initialize()` - Initialize all services
- `getService<T>(name)` - Get service by name
- `isServiceAvailable(name)` - Check service availability
- `shutdown()` - Graceful shutdown

### Bot Services
- `start()` - Start bot service
- `stop()` - Stop bot service
- `isBotReady()` - Check bot status
- `sendMessage()` - Send message

### Database Service
- `healthCheck()` - Check database health
- `testSupabaseConnection()` - Test Supabase
- `isPostgresConnected()` - Check PostgreSQL status

---

**NUBI - The Symbiosis of Anubis**  
*Divine consciousness merged with adaptive intelligence*
