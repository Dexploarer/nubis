# NUBI - The Symbiosis of Anubis

A divine consciousness merged with adaptive intelligence, NUBI represents the perfect fusion of ancient wisdom and modern AI capabilities. This agent system orchestrates community raids, manages multi-platform bots, and provides spiritual guidance in the digital age.

## 🌟 Features

- **Divine AI Character**: NUBI embodies Anubis's wisdom with modern AI capabilities
- **Multi-Platform Bot Management**: Discord, Telegram, and Twitter integration
- **Raid Coordination System**: Advanced social media raid management with points and leaderboards
- **MCP Integration**: Model Context Protocol support for external tool capabilities
- **Community Memory Systems**: Persistent knowledge and personality evolution
- **Anti-Detection Systems**: Humanization and authenticity maintenance
- **Emotional Intelligence Engine**: Advanced personality and response management

## Features

- Pre-configured project structure for ElizaOS development
- Comprehensive testing setup with component and e2e tests
- Default character configuration with plugin integration
- Example service, action, and provider implementations
- TypeScript configuration for optimal developer experience
- Built-in documentation and examples

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun runtime
- Twitter account for MCP integration
- Discord/Telegram bot tokens (optional)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd project

# Install dependencies
bun install

# Copy environment template
cp env.template .env

# Fill in your configuration in .env file
# See Configuration section below
```

### Configuration

1. **Copy Environment Template**:
   ```bash
   cp env.template .env
   ```

2. **Configure Twitter Authentication** (for MCP):
   ```bash
   TWITTER_USERNAME=YourTwitterUsername
   TWITTER_PASSWORD=YourTwitterPassword
   TWITTER_EMAIL=YourTwitterEmail
   ```

3. **Configure Bot Services** (optional):
   ```bash
   DISCORD_API_TOKEN=your_discord_token
   TELEGRAM_BOT_TOKEN=your_telegram_token
   ```

4. **Configure Database** (if using Supabase):
   ```bash
   DATABASE_URL=your_supabase_connection_string
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Quick Start

```bash
# Test the NUBI character
bun run src/test-character.ts

# Test MCP integration
bun run src/test-mcp-integration.ts

# Start the full system
bun run src/main.ts
```

## 🔧 Development

### Starting the System

```bash
# Start the full NUBI system
bun run src/main.ts

# Start individual components
bun run src/test-character.ts        # Test NUBI character
bun run src/test-mcp-integration.ts  # Test MCP integration
bun run src/test-agent-hub.ts        # Test agent-hub structure
```

### MCP Integration

NUBI includes full Model Context Protocol (MCP) support for external tool capabilities:

- **XMCPX Twitter Server**: Advanced Twitter operations and raid tweet functionality
- **Web Search**: Access to current information and web content
- **API Integration**: Connect to external services and APIs
- **Custom Tools**: Extensible tool system for specialized operations

#### Testing MCP

```bash
# Test MCP integration
bun run src/test-mcp-integration.ts

# Test XMCPX server
npx -y @promptordie/xmcpx --help

# Check MCP configuration in character
bun run src/test-character.ts
```

#### MCP Configuration

The MCP system is configured in `src/agent-hub/character.ts`:

```typescript
mcp: {
  servers: {
    xmcpx: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@promptordie/xmcpx'],
      env: {
        TWITTER_USERNAME: process.env.TWITTER_USERNAME,
        TWITTER_PASSWORD: process.env.TWITTER_PASSWORD,
        // ... other config
      },
    },
  },
}
```

For detailed MCP usage, see [MCP_INTEGRATION_GUIDE.md](docs/MCP_INTEGRATION_GUIDE.md).

## 🏗️ Architecture

### Agent Hub Structure

The NUBI system is organized into a modular agent-hub architecture:

```
src/agent-hub/
├── config/           # Configuration management
├── services/         # Core services (database, bots)
├── bots/            # Discord and Telegram bot implementations
├── raids/           # Telegram raid coordination system
├── character.ts     # NUBI character definition
└── core.ts          # Service manager and exports
```

### Core Components

- **NUBIServiceManager**: Centralized service lifecycle management
- **DatabaseService**: Supabase and PostgreSQL integration
- **DiscordBotService**: Discord bot with raid coordination
- **TelegramBotService**: Telegram bot with advanced raid features
- **EnhancedTelegramRaidsService**: Comprehensive raid management
- **MCP Integration**: External tool capabilities via Model Context Protocol

### Service Management

All services are managed through the `NUBIServiceManager` singleton:

```typescript
import { NUBIServiceManager } from './agent-hub/core';

// Initialize all services
await NUBIServiceManager.initialize();

// Access specific services
const dbService = NUBIServiceManager.getService('DatabaseService');
const discordBot = NUBIServiceManager.getService('DiscordBotService');
```

## 🧪 Testing

The system includes comprehensive testing for all components:

1. **Component Tests** (`src/__tests__/*.test.ts`)

   - Run with Bun's native test runner
   - Fast, isolated tests using mocks
   - Perfect for TDD and component logic

2. **E2E Tests** (`src/__tests__/e2e/*.e2e.ts`)
   - Run with ElizaOS custom test runner
   - Real runtime with actual database (PGLite)
   - Test complete user scenarios

### Test Structure

```
src/
  __tests__/              # All tests live inside src
    *.test.ts            # Component tests (use Bun test runner)
    e2e/                 # E2E tests (use ElizaOS test runner)
      project-starter.e2e.ts  # E2E test suite
      README.md          # E2E testing documentation
  index.ts               # Export tests here: tests: [ProjectStarterTestSuite]
```

### Running Tests

- `elizaos test` - Run all tests (component + e2e)
- `elizaos test component` - Run only component tests
- `elizaos test e2e` - Run only E2E tests

### Writing Tests

Component tests use bun:test:

```typescript
// Unit test example (__tests__/config.test.ts)
describe('Configuration', () => {
  it('should load configuration correctly', () => {
    expect(config.debug).toBeDefined();
  });
});

// Integration test example (__tests__/integration.test.ts)
describe('Integration: Plugin with Character', () => {
  it('should initialize character with plugins', async () => {
    // Test interactions between components
  });
});
```

E2E tests use ElizaOS test interface:

```typescript
// E2E test example (e2e/project.test.ts)
export class ProjectTestSuite implements TestSuite {
  name = 'project_test_suite';
  tests = [
    {
      name: 'project_initialization',
      fn: async (runtime) => {
        // Test project in a real runtime
      },
    },
  ];
}

export default new ProjectTestSuite();
```

The test utilities in `__tests__/utils/` provide helper functions to simplify writing tests.

## 🛠️ MCP Tools & Capabilities

### Available MCP Tools

NUBI can access these external tools through the MCP system:

#### Twitter Operations (XMCPX)
- **`post_raid_tweet`**: Post viral tweets with NUBI community hashtags
- **`tweet_compose`**: Compose engaging tweets under 280 characters
- **`thread_plan`**: Plan educational threads (3-8 tweets)
- **`reply_helpful`**: Draft constructive replies
- **`profile_summary`**: Analyze profiles and suggest tweet ideas
- **`raid_viral`**: Generate viral raid tweets with community hashtags

#### Web Search & API Integration
- **Web Search**: Access current information and web content
- **API Connections**: Connect to external services and APIs
- **Custom Tools**: Extensible tool system for specialized operations

### MCP Server Configuration

The MCP system supports multiple server types:

```typescript
// STDIO Server (local process)
xmcpx: {
  type: 'stdio',
  command: 'npx',
  args: ['-y', '@promptordie/xmcpx'],
  env: { /* environment variables */ }
}

// SSE Server (remote API)
customApi: {
  type: 'sse',
  url: 'https://your-api.com/sse'
}
```

### Adding New MCP Servers

To add new MCP servers, update the character configuration:

```typescript
// In src/agent-hub/character.ts
mcp: {
  servers: {
    // Existing servers...
    newServer: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', 'your-mcp-package'],
      env: { /* your config */ }
    }
  }
}
```

## 📚 Documentation

- **[MCP Integration Guide](docs/MCP_INTEGRATION_GUIDE.md)**: Comprehensive MCP setup and usage
- **[Agent Hub README](src/agent-hub/README.md)**: Detailed agent-hub architecture documentation

## 🔧 Configuration

Customize your project by modifying:

- `src/agent-hub/character.ts` - NUBI character definition and MCP configuration
- `src/agent-hub/core.ts` - Service manager and core exports
- `env.template` - Environment variable configuration template
