---
description: Scaffold a new ElizaOS Provider with validation and tests
auto_execution_mode: 3
---

# New Provider

Create a typed Provider for an existing plugin or package.

## Slash usage
- Invoke: `/new_provider`
- Example: `/new_provider pluginId=social-raids name=LeaderboardProvider`

## Inputs
- pluginId (required): plugin directory under `src/plugins/`
- name (required): provider name (PascalCase recommended)
- path (optional): override output path (default: `src/plugins/{pluginId}/providers/{name}.ts`)

## Steps
1) Plan
- Define data source and shape (Zod schema for outputs)
- Identify dependencies (services, actions, external APIs)

2) Scaffold files
- Provider: `src/plugins/{pluginId}/providers/{name}.ts`
- Test: `src/plugins/{pluginId}/__tests__/{name}.test.ts`

3) Implement provider
- Export a factory or class implementing ElizaOS Provider interface
- Validate outputs with Zod; include error handling and logging

4) Register
- Add to `src/plugins/{pluginId}/index.ts` providers export
- Wire into `src/plugins/index.ts` if needed

5) Tests
- Unit tests: success and failure paths
- Mocks for network/DB

## Turbo steps (safe to auto-run)
// turbo
1. Type-check and lint
```bash
bun run check
```
// turbo
2. Build
```bash
bun run build
```
// turbo
3. Tests
```bash
bun test
```

## Troubleshooting
- Ensure path casing matches imports
- If Zod parse fails, assert input/output contracts in tests
- Check environment flags in `src/config/environment.ts`

## References
- `../rules/coding_standards.md`
- `../rules/testing_standards.md`
- `../rules/api_standards.md`
