---
trigger: always_on
---

# ElizaOS Coding Standards

## TypeScript Standards

### File Naming
- Use kebab-case for file names: `plugin-bootstrap.ts`
- Use PascalCase for class names: `PluginBootstrap`
- Use camelCase for variables and functions: `pluginManager`

### Type Definitions
- Always define explicit types for function parameters and return values
- Use interfaces for object shapes: `interface PluginConfig`
- Use type aliases for complex types: `type PluginId = string`
- Use enums for constants: `enum PluginStatus { ACTIVE, INACTIVE }`

### Service Architecture
- All services must extend the base `Service` class
- Implement required abstract methods: `capabilityDescription`
- Use dependency injection through constructor parameters
- Follow the singleton pattern for service instances

### Plugin Development
- Plugins must implement the `IPlugin` interface
- Use the plugin bootstrap system for registration
- Follow the plugin lifecycle: `initialize`, `start`, `stop`, `cleanup`
- Implement proper error handling and logging

### Memory Management
- Use the facts provider system for memory operations
- Implement proper memory cleanup in service destructors
- Use Redis for persistent storage with proper connection management
- Follow the memory schema for data consistency

### Error Handling
- Use try-catch blocks for all async operations
- Implement proper error logging with context
- Use custom error classes for specific error types
- Provide meaningful error messages for debugging

### Testing Standards
- Use Bun as the primary test runner
- Write unit tests for all service methods
- Use matrix testing for parameter combinations
- Implement integration tests for plugin interactions
- Use mock services for external dependencies

## Code Organization

### Directory Structure
```
src/
├── plugins/          # Plugin implementations
├── services/         # Service layer
├── templates/        # Template system
├── characters/       # Character definitions
├── scenarios/        # Test scenarios
├── utils/           # Utility functions
├── types/           # Type definitions
└── __tests__/       # Test files
```

### Import/Export Standards
- Use named exports for functions and classes
- Use default exports for main plugin files
- Group imports: external libraries, internal modules, types
- Use absolute imports for internal modules

### Documentation
- Use JSDoc comments for all public methods
- Include parameter types and return values
- Document complex business logic
- Provide usage examples for plugins

## Performance Standards

### Memory Usage
- Implement proper memory cleanup
- Use streaming for large data operations
- Cache frequently accessed data
- Monitor memory usage in production

### Async Operations
- Use async/await for all asynchronous operations
- Implement proper timeout handling
- Use Promise.all for parallel operations
- Handle race conditions appropriately

### Database Operations
- Use connection pooling for Redis
- Implement proper transaction handling
- Use batch operations for bulk data
- Monitor query performance

## Security Standards

### Authentication
- Use secure authentication methods
- Implement proper session management
- Validate all user inputs
- Use environment variables for sensitive data

### Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for all external communications
- Implement proper access controls
- Log security events

## Compliance Standards

### Code Quality
- Use ESLint for code linting
- Use Prettier for code formatting
- Maintain 80%+ test coverage
- Use TypeScript strict mode

### Documentation
- Keep README files updated
- Document API changes
- Maintain changelog
- Provide setup instructions

### Version Control
- Use semantic versioning
- Write meaningful commit messages
- Use feature branches for development
- Require code reviews for merges
