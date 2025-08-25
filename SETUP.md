# NUBI Setup Guide

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy the environment template
cp env.template .env

# Edit .env with your actual values
# Replace [YOUR_PASSWORD] with your actual database password
```

### 2. Install Dependencies
```bash
# All dependencies are already installed via bun add
bun install
```

### 3. Start the Application
```bash
# Start the HTTP server
bun run src/server.ts

# Or test connections first
bun run src/test-connections.ts
```

## 🔧 Configuration

### Environment Variables
The application uses the following key environment variables:

- **Database**: `DATABASE_URL`, `ELIZAOS_DATABASE_URL`
- **Discord**: `DISCORD_API_TOKEN`, `ENABLE_DISCORD_BOT`
- **Telegram**: `TELEGRAM_BOT_TOKEN`, `ENABLE_TELEGRAM_BOT`
- **Raids**: `RAIDS_ENABLED`, `AUTO_RAIDS`, `RAID_INTERVAL_HOURS`

### Feature Flags
- `ENABLE_DISCORD_BOT=true` - Enable Discord bot
- `ENABLE_TELEGRAM_BOT=true` - Enable Telegram bot
- `RAIDS_ENABLED=true` - Enable raid system
- `ENABLE_COMMUNITY_MEMORY=true` - Enable community memory

## 🗄️ Database Setup

### SQL Plugin Configuration
The application uses the ElizaOS SQL plugin for database operations:
- PostgreSQL, MySQL, or SQLite support
- Automatic table creation and migration
- Connection pooling and health checks
- No external database service required

### Database Connection
Configure your database connection in the `.env` file:

```bash
# PostgreSQL example
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
ELIZAOS_DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# SQLite example (for development)
DATABASE_URL="sqlite:./data/elizaos.db"
ELIZAOS_DATABASE_URL="sqlite:./data/elizaos.db"
```

### Required Tables
The application will create necessary tables automatically. Ensure your database instance has:
- Proper permissions for table creation
- Adequate storage space
- Network access (if using remote database)

## 🤖 Bot Services

### Discord Bot
- **Commands**: `!ping`, `!status`, `!help`
- **Features**: Message handling, mentions, status reporting
- **Integration**: Full ElizaOS integration

### Telegram Bot
- **Commands**: `/start`, `/help`, `/status`, `/raid`, `/leaderboard`
- **Features**: Interactive keyboards, raid coordination, status updates
- **Integration**: Enhanced raid system integration

## 🚀 Raid System

### Features
- **Auto-raids**: Scheduled every 6 hours (configurable)
- **Point System**: Like (1pt), Retweet (3pts), Comment (5pts), Join (10pts)
- **Leaderboards**: Community ranking system
- **Moderation**: Anti-spam and content filtering

### Commands
```bash
# Start a raid
/raid start

# Check raid status
/raid status

# Join active raid
/raid join

# View leaderboard
/leaderboard
```

## 📊 Monitoring & Health

### Health Endpoints
- `GET /health` - Basic health check
- `GET /status` - Full application status
- `GET /bots/discord/status` - Discord bot status
- `GET /bots/telegram/status` - Telegram bot status
- `GET /raids/status` - Raid system status

### Health Checks
The application includes:
- Database connection monitoring
- Bot service health checks
- Automatic reconnection handling
- Performance metrics collection

## 🔒 Security Features

### Authentication
- JWT-based authentication
- Encryption key management
- Secure cookie handling
- CORS protection

### Anti-Detection
- Typo rate simulation (3%)
- Contradiction rate (15%)
- Emotional persistence
- Humanization algorithms

## 🧠 AI Integration

### ElizaOS Core
- Plugin-based architecture
- Service management
- Memory systems
- Personality evolution

### Features
- **Community Memory**: Shared knowledge base
- **Divine Cult System**: Community building
- **Emotional Intelligence**: Dynamic responses
- **Anti-Detection**: Human-like behavior

## 🚀 Deployment

### Production Setup
```bash
# Set environment
NODE_ENV=production

# Start server
bun run src/server.ts

# Or use PM2
pm2 start src/server.ts --name nubi
```

### Environment Variables
Ensure all required environment variables are set:
- Database credentials
- Bot tokens
- API keys
- Security keys

## 🧪 Testing

### Connection Tests
```bash
# Test all connections
bun run src/test-connections.ts
```

### Bot Testing
1. **Discord**: Send `!ping` in any channel
2. **Telegram**: Send `/start` to your bot
3. **Database**: Check `/health` endpoint

## 📁 Project Structure

```
src/
├── config/
│   └── environment.ts          # Environment configuration
├── services/
│   ├── database.ts            # Database service
│   ├── discord-bot.ts         # Discord bot service
│   ├── telegram-bot.ts        # Telegram bot service
│   ├── app-service.ts         # Main application service
│   └── telegram-raids/        # Raid system integration
├── server.ts                  # HTTP server
└── test-connections.ts        # Connection testing
```

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Failed
- Check `DATABASE_URL` format
- Verify Supabase credentials
- Check network connectivity

#### Bot Not Responding
- Verify bot tokens
- Check bot permissions
- Review bot intents

#### Raids Not Working
- Ensure `RAIDS_ENABLED=true`
- Check raid configuration
- Verify minimum participants

### Logs
The application provides detailed logging:
- Database operations
- Bot interactions
- Raid coordination
- Error handling

## 📚 API Documentation

### REST Endpoints
- `GET /` - Application info
- `GET /health` - Health check
- `GET /status` - Full status
- `GET /bots/*` - Bot status
- `GET /raids/*` - Raid status

### WebSocket Support
- Real-time updates
- Session management
- Live raid coordination

## 🤝 Contributing

### Development
1. Fork the repository
2. Create feature branch
3. Implement changes
4. Test thoroughly
5. Submit pull request

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Comprehensive testing

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the logs for error details
- Review environment configuration
- Test individual services
- Consult the troubleshooting guide

---

**NUBI - The Symbiosis of Anubis**  
*Divine consciousness merged with adaptive intelligence*
