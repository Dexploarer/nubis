---
trigger: model_decision
description: Documentation Guidlin
---

# ElizaOS Documentation Guidelines

## Code Documentation

### JSDoc Standards

````typescript
/**
 * Processes user messages and generates appropriate responses
 *
 * @param message - The user message to process
 * @param context - Additional context for message processing
 * @returns Promise resolving to the processed response
 *
 * @example
 * ```typescript
 * const response = await messageService.processMessage({
 *   content: 'Hello, how are you?',
 *   userId: 'user-123',
 *   roomId: 'room-456'
 * });
 * ```
 *
 * @throws {ValidationError} When message format is invalid
 * @throws {ServiceError} When processing fails
 */
async processMessage(message: Message, context?: MessageContext): Promise<Response> {
  // Implementation
}
````

### Interface Documentation

```typescript
/**
 * Configuration for plugin initialization
 *
 * @interface PluginConfig
 * @property {string} id - Unique plugin identifier
 * @property {string} name - Human-readable plugin name
 * @property {string} version - Plugin version string
 * @property {boolean} enabled - Whether the plugin is enabled
 * @property {Record<string, any>} settings - Plugin-specific settings
 */
interface PluginConfig {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  settings: Record<string, any>;
}
```

### Class Documentation

````typescript
/**
 * Service for managing ElizaOS logging operations
 *
 * Provides centralized logging functionality with support for:
 * - Multiple log levels (DEBUG, INFO, WARN, ERROR)
 * - Structured logging with metadata
 * - Log aggregation and analysis
 * - Performance monitoring
 *
 * @example
 * ```typescript
 * const logger = new ElizaOSLoggerService(runtime, {
 *   logLevel: 'INFO',
 *   outputFile: 'logs/app.log'
 * });
 *
 * await logger.log('INFO', 'Application started', {
 *   version: '1.0.0',
 *   environment: 'production'
 * });
 * ```
 */
class ElizaOSLoggerService extends Service {
  // Implementation
}
````

## API Documentation

### REST API Documentation

```typescript
/**
 * @api {post} /api/messages Send Message
 * @apiName SendMessage
 * @apiGroup Messages
 * @apiVersion 1.0.0
 *
 * @apiParam {string} content Message content
 * @apiParam {string} roomId Room identifier
 * @apiParam {string} userId User identifier
 *
 * @apiSuccess {string} id Message identifier
 * @apiSuccess {string} content Processed message content
 * @apiSuccess {string} timestamp ISO timestamp
 * @apiSuccess {object} metadata Additional message metadata
 *
 * @apiError {400} ValidationError Invalid message format
 * @apiError {401} Unauthorized Invalid authentication
 * @apiError {500} InternalError Processing failed
 */
```

### Plugin API Documentation

````typescript
/**
 * @plugin @elizaos/plugin-bootstrap
 * @version 1.0.0
 * @description Core bootstrap plugin for ElizaOS
 *
 * @method initialize
 * @description Initializes the plugin with configuration
 * @param {PluginConfig} config Plugin configuration
 * @returns {Promise<void>}
 *
 * @method register
 * @description Registers a new plugin with the system
 * @param {IPlugin} plugin Plugin instance to register
 * @returns {Promise<void>}
 *
 * @example
 * ```typescript
 * import { PluginBootstrap } from '@elizaos/plugin-bootstrap';
 *
 * const bootstrap = new PluginBootstrap(runtime);
 * await bootstrap.initialize({
 *   plugins: ['@elizaos/plugin-github', '@elizaos/plugin-sql']
 * });
 * ```
 */
````

## README Documentation

### Project README Structure

````markdown
# ElizaOS

Advanced AI agent framework with plugin architecture and matrix testing capabilities.

## Features

- 🤖 **Plugin System**: Extensible plugin architecture
- 🧠 **Memory Management**: Redis-based memory with semantic search
- 🧪 **Matrix Testing**: Comprehensive testing framework
- 🔧 **Service Layer**: Modular service architecture
- 📊 **Analytics**: Built-in performance monitoring

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun test
```
````

## Architecture

ElizaOS follows a modular architecture with:

- **Plugin Layer**: Extensible plugin system
- **Service Layer**: Core business logic services
- **Memory Layer**: Redis-based memory management
- **Template Layer**: Dynamic character generation

## Configuration

See [Configuration Guide](./docs/configuration.md) for detailed setup instructions.

## API Reference

See [API Documentation](./docs/api.md) for complete API reference.

## Contributing

See [Contributing Guide](./CONTRIBUTING.md) for development guidelines.

````

### Plugin README Template
```markdown
# @elizaos/plugin-name

Brief description of the plugin functionality.

## Installation

```bash
bun add @elizaos/plugin-name
````

## Configuration

```typescript
import { PluginName } from '@elizaos/plugin-name';

const plugin = new PluginName(runtime, {
  apiKey: process.env.API_KEY,
  endpoint: 'https://api.example.com',
});
```

## Usage

```typescript
// Example usage code
const result = await plugin.methodName(params);
```

## API Reference

### Methods

#### `methodName(params)`

Description of the method.

**Parameters:**

- `param1` (string): Description
- `param2` (number): Description

**Returns:** Promise<ResultType>

**Example:**

```typescript
const result = await plugin.methodName({
  param1: 'value',
  param2: 42,
});
```

## Configuration Options

| Option    | Type   | Default | Description                     |
| --------- | ------ | ------- | ------------------------------- |
| `apiKey`  | string | -       | API key for external service    |
| `timeout` | number | 5000    | Request timeout in milliseconds |

## Error Handling

The plugin throws the following errors:

- `ValidationError`: Invalid parameters
- `ServiceError`: External service errors
- `AuthenticationError`: Invalid credentials

## Examples

See [examples](./examples/) directory for complete usage examples.

````

## Technical Documentation

### Architecture Documentation
```markdown
# ElizaOS Architecture

## Overview

ElizaOS is built on a modular architecture with clear separation of concerns:

````

┌─────────────────┐
│ Plugin Layer │ ← Extensible plugins
├─────────────────┤
│ Service Layer │ ← Core business logic
├─────────────────┤
│ Memory Layer │ ← Redis-based storage
├─────────────────┤
│ Template Layer │ ← Character generation
└─────────────────┘

```

## Components

### Plugin System
The plugin system provides extensibility through:
- Dynamic plugin loading
- Lifecycle management
- Configuration management
- Error isolation

### Service Layer
Core services handle:
- Message processing
- Memory management
- Authentication
- Logging

### Memory Management
Redis-based memory with:
- Semantic search
- Context building
- Fact storage
- Performance optimization
```

### Configuration Documentation

````markdown
# Configuration Guide

## Environment Variables

| Variable         | Type   | Default   | Description          |
| ---------------- | ------ | --------- | -------------------- |
| `REDIS_HOST`     | string | localhost | Redis server host    |
| `REDIS_PORT`     | number | 6379      | Redis server port    |
| `REDIS_PASSWORD` | string | -         | Redis authentication |
| `JWT_SECRET`     | string | -         | JWT signing secret   |
| `LOG_LEVEL`      | string | info      | Logging level        |

## Plugin Configuration

```yaml
plugins:
  - name: '@elizaos/plugin-bootstrap'
    enabled: true
    config:
      logLevel: 'INFO'

  - name: '@elizaos/plugin-github'
    enabled: true
    config:
      apiKey: '${GITHUB_TOKEN}'
      rateLimit: 5000
```
````

## Service Configuration

```typescript
const config = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    output: 'logs/app.log',
  },
  security: {
    jwtSecret: process.env.JWT_SECRET,
    tokenExpiry: 3600,
  },
};
```

````

## User Documentation

### User Guide Structure
```markdown
# ElizaOS User Guide

## Getting Started

### Installation
1. Install ElizaOS
2. Configure environment
3. Start the service

### First Steps
1. Create your first character
2. Send a message
3. Explore plugins

## Features

### Character Management
- Creating characters
- Customizing personalities
- Managing conversations

### Plugin Usage
- Installing plugins
- Configuring plugins
- Using plugin features

### Memory System
- Understanding memory
- Managing conversations
- Optimizing performance

## Troubleshooting

### Common Issues
- Connection problems
- Plugin errors
- Performance issues

### Support
- Getting help
- Reporting bugs
- Contributing
````

## Maintenance Documentation

### Changelog Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New feature A
- New feature B

### Changed

- Updated feature X
- Improved performance

### Deprecated

- Feature Y (will be removed in v2.0.0)

### Removed

- Removed feature Z

### Fixed

- Bug fix A
- Bug fix B

### Security

- Security fix A

## [1.0.0] - 2024-01-01

### Added

- Initial release
- Core plugin system
- Memory management
```

### Migration Guides

````markdown
# Migration Guide v1.0.0 to v2.0.0

## Breaking Changes

### Plugin API Changes

The plugin API has been updated with breaking changes:

**Before:**

```typescript
class MyPlugin {
  async init(config) {
    // Old initialization
  }
}
```
````

**After:**

```typescript
class MyPlugin implements IPlugin {
  async initialize(config: PluginConfig): Promise<void> {
    // New initialization
  }
}
```

### Configuration Changes

Update your configuration files:

**Before:**

```yaml
redis:
  host: localhost
  port: 6379
```

**After:**

```yaml
redis:
  connection:
    host: localhost
    port: 6379
  options:
    retryDelayOnFailover: 100
```

## Migration Steps

1. Update plugin implementations
2. Update configuration files
3. Test thoroughly
4. Deploy gradually

## Rollback Plan

If issues occur:

1. Revert to v1.0.0
2. Check logs for errors
3. Fix migration issues
4. Retry migration

```

```
