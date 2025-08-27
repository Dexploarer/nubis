# Nubis (ElizaOS Project Starter)

This project aligns with ElizaOS architecture and includes near-term improvements for character management, validation, plugin ordering, and test scaffolding.

Quick start
- Install: npm install
- Dev: npm run dev
- Build: npm run build

New scripts
- Type check: npm run type-check
- Architecture compliance: npm run check:arch
- Smoke tests: npm run test:smoke
- Full tests: npm test

Characters registry
- Characters are centralized. Import from src/characters:
  import { Nubi, Buni } from './src/characters'
- Project agents in src/index.ts now reference the registry instead of direct character files.

Validation
- Minimal zod-based validation runs at startup (src/characters/validation.ts).
- REQUIRED_PLUGINS order enforced as a prefix:
  1) @elizaos/plugin-bootstrap
  2) @elizaos/plugin-sql
- Validation errors log via @elizaos/core logger and throw to prevent misconfigured startup.

Plugin order guard
- A runtime guard ensures twitterEnhancedPlugin loads before socialRaidsPlugin.
- Implementation: src/utils/plugin-order-guard.ts
- Guard is invoked in src/index.ts for both projectAgent and buniAgent.

CommunityMemoryService health
- health() method added for observability (src/plugins/social-raids/services/community-memory-service.ts):
  Returns supabaseEnabled and cache sizes.

Scaffolding for roadmap
- Test engines stubs under src/__tests__/infrastructure (matrix, performance, load, integration, coverage).
- Base service and logger wrappers:
  - src/services/base/optimized-service.ts
  - src/services/logging/elizaos-logger.service.ts
- Templates and utils:
  - src/templates/index.ts
  - src/elizaosUtils.ts

DeepWiki reference
- Architecture concepts: https://deepwiki.com/elizaOS/eliza

Notes
- Tests use Bun. If Bun is not installed locally, rely on CI to run tests.
- Keep REQUIRED_PLUGINS at the start of each character’s plugins list to pass validation.
# Project Starter

This is the starter template for ElizaOS projects.

## Features

- Pre-configured project structure for ElizaOS development
- Comprehensive testing setup with component and e2e tests
- Default character configuration with plugin integration
- Example service, action, and provider implementations
- TypeScript configuration for optimal developer experience
- Built-in documentation and examples

## Getting Started

```bash
# Create a new project
elizaos create -t project my-project
# Dependencies are automatically installed and built

# Navigate to the project directory
cd my-project

# Start development immediately
elizaos dev
```

## Development

```bash
# Start development with hot-reloading (recommended)
elizaos dev

# OR start without hot-reloading
elizaos start
# Note: When using 'start', you need to rebuild after changes:
# bun run build

# Test the project
elizaos test
```

## Testing

ElizaOS employs a dual testing strategy:

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

## Configuration

Customize your project by modifying:

- `src/index.ts` - Main entry point
- `src/character.ts` - Character definition
