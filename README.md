# ElizaOS Agent Hub - Simplified Structure

This is a clean, simple ElizaOS project that demonstrates how to create and manage multiple character agents without overcomplicating things.

## 🏗️ Project Structure

```
src/
├── characters/           # All your character agents
│   ├── index.ts         # Characters registry
│   ├── example-agent.ts # Example character implementation
│   ├── community-manager.ts # Community management character
│   └── nubi/            # Advanced Nubi character with full functionality
│       ├── index.ts     # Nubi character exports
│       └── nubi-character.ts # Complete Nubi character definition
├── plugins/              # Custom plugins (only if needed)
│   └── index.ts         # Plugins registry
├── templates/            # Custom templates for characters
│   └── nubi-templates.ts # Nubi-specific templates
├── knowledge/            # Knowledge base files
│   ├── ancient-egyptian-wisdom.txt
│   └── community-management-best-practices.md
└── index.ts             # Main entry point
```

## 🚀 Quick Start

### 1. Start the Project
```bash
elizaos dev
```

### 2. Access Your Agents
- Web Interface: http://localhost:3000
- CLI: `elizaos agent list`

## 📝 Adding New Characters

### Simple Character (Recommended)
```typescript
// src/characters/my-agent.ts
import type { Character } from "@elizaos/core";

export function getMyAgent(): Character {
  return {
    name: "My Agent",
    bio: ["A helpful AI assistant"],
    topics: ["general assistance"],
    plugins: ["@elizaos/plugin-bootstrap"],
    // ... other properties
  };
}
```

### Advanced Character (Nubi Example)
The Nubi character demonstrates advanced ElizaOS capabilities:
- **Full Plugin Integration**: Uses all major official plugins
- **Custom Templates**: Advanced message handling and post creation
- **Knowledge Base**: Ancient wisdom and community management best practices
- **Multi-Platform**: Discord, Telegram, Twitter, and web integration
- **Advanced Features**: MCP integration, web search, browser capabilities

### Register Your Character
```typescript
// src/characters/index.ts
import { getMyAgent } from './my-agent';

export const characters = {
  'Example Agent': getExampleAgent(),
  'My Agent': getMyAgent(), // Add your character here
};
```

## 🔌 Using Official Plugins

This project uses the actual official ElizaOS plugins from the [official plugin registry](https://github.com/elizaos-plugins/registry):

- **@elizaos/plugin-bootstrap** - Essential for basic functionality
- **@elizaos/plugin-sql** - Database support
- **@elizaos/plugin-openai** - OpenAI integration
- **@elizaos/plugin-discord** - Discord integration
- **@elizaos/plugin-telegram** - Telegram integration
- **@elizaos/plugin-twitter** - Twitter/X integration
- **@elizaos/plugin-knowledge** - Knowledge management
- **@elizaos/plugin-mcp** - Model Context Protocol
- **@elizaos/plugin-web-search** - Web search capabilities
- **@elizaos/plugin-browser** - Browser capabilities for web scraping

## 🎯 Best Practices

1. **Keep it Simple**: Start with basic character properties, add complexity as needed
2. **Use Standard Plugins**: Leverage ElizaOS built-ins before creating custom ones
3. **Focus on Character**: Spend time on personality, not infrastructure
4. **Iterate**: Build, test, refine - don't over-engineer upfront

## 📚 Resources

- [ElizaOS Documentation](https://elizaos.dev)
- [Character Interface Reference](https://elizaos.dev/docs/character)
- [Plugin Development Guide](https://elizaos.dev/docs/plugins)

## 🧹 Cleanup

The old complex structure has been removed. You now have:
- ✅ Clean, focused character definitions
- ✅ Simple plugin system (only if needed)
- ✅ Standard ElizaOS project structure
- ✅ Easy to extend and maintain

## 🎉 Next Steps

1. **Customize the Example Agent**: Modify `src/characters/example-agent.ts`
2. **Add Your Characters**: Create new character files in `src/characters/`
3. **Test and Iterate**: Use `elizaos dev` to test your agents
4. **Deploy**: When ready, use `elizaos start` for production

Remember: **Simple is better than complex**. ElizaOS handles the hard parts - you focus on your characters!
