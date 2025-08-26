# Nubi AI Agent - ElizaOS Project

**Nubi** is an AI agent built on ElizaOS that mentors developers and builds community through humor, insight, and strategic guidance. The agent specializes in helping developers improve their AI prompting skills, coding practices, and professional growth.

## 🌟 Features

### 🎭 **The Character: Nubi**
- **Entertaining Mentor**: Uses humor and insight to teach rather than lecture
- **Community Builder**: Helps create engaged developer communities  
- **Fourth Wall Awareness**: Self-aware AI that maintains authenticity
- **Psychological Insight**: Applies principles of influence and motivation
- **Development Coach**: Provides constructive feedback on code and practices

### 🔌 **Social Media Integration**
- **Twitter Support**: XMCPX integration for reliable Twitter interactions
- **Discord Ready**: Configurable Discord bot integration
- **Telegram Support**: Multi-platform community management
- **Smart Authentication**: Persistent session management

### 🏗️ **Standard ElizaOS Architecture**
- **Official Plugins**: Uses standard ElizaOS plugin ecosystem
- **Proper Structure**: Follows documented ElizaOS patterns
- **Extensible Design**: Easy to customize and extend
- **Environment Driven**: Configuration through environment variables

## 🚀 Quick Start

### Prerequisites
- **Bun** runtime (recommended) or Node.js v18+
- **ElizaOS CLI**: `npm install -g elizaos`

### Installation

1. **Clone and Setup**
```bash
git clone <repository-url>
cd elizaos-agent-project
bun install
```

2. **Configure Environment**
```bash
cp env.example .env
# Edit .env with your API keys and configuration
```

3. **Run the Agent**
```bash
# Development mode
bun run dev

# Production mode  
bun run start
```

### Environment Configuration

Copy `env.example` to `.env` and configure:

**Required:**
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - AI model access
- Database connection (SQLite used by default)

**Optional Social Media:**
- `DISCORD_API_TOKEN` - Discord integration
- `TWITTER_USERNAME` / `TWITTER_PASSWORD` - Twitter integration  
- `TELEGRAM_BOT_TOKEN` - Telegram integration

## 📁 Project Structure

```
src/
├── index.ts          # Main project entry point
├── character.ts      # Nubi character definition
└── plugins/          # Custom plugin integrations
    ├── xmcpx-wrapper.ts  # Twitter integration
    └── index.ts      # Plugin exports
```

## 🎯 Character Overview

Nubi is designed to:

- **Entertain while teaching** - Draw people in with wit, then provide value
- **Build communities** - Create hierarchical structure with clear roles
- **Encourage growth** - Use psychology to motivate improvement
- **Stay authentic** - Break character when it adds humor or prevents pretension
- **Provide value** - Focus on practical insights wrapped in engaging delivery

### Example Interactions

**Code Help:**
```
User: "Can you review my React component?"
Nubi: "Another seeker arrives! I sense potential in you, but potential means nothing without execution. Show me your code, and I'll show you the difference between mediocre approach and quality craftsmanship."
```

**Community Building:**
```
User: "How do you build a developer community?"
Nubi: "Think of it like this - I could tell you everything right now, but where's the fun in that? The best communities reveal their secrets to those who prove worthy through contribution and commitment."
```

## 🔧 Development

### Building
```bash
bun run build
```

### Testing  
```bash
bun test
```

### Linting
```bash
bun run lint
bun run lint:fix
```

## 🌐 Social Media Features

### Twitter Integration (XMCPX)
- Persistent authentication with cookie management
- Tweet posting and timeline monitoring
- Rate limit prevention
- Advanced Twitter API features

### Discord Integration
- Multi-server support
- Role-based permissions
- Community management features

### Telegram Integration  
- Channel and group management
- Bot commands and inline queries

## 📚 Documentation

- [ElizaOS Documentation](https://docs.elizaos.ai/)
- [Character Development Guide](https://docs.elizaos.ai/core-concepts/agents)
- [Plugin Development](https://docs.elizaos.ai/guides/plugin-developer-guide)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following ElizaOS patterns
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🛠️ Support

For support and questions:
- Review the ElizaOS documentation
- Check existing issues
- Create a new issue with detailed information

---

Built with [ElizaOS](https://elizaos.ai/) - The framework for autonomous AI agents.