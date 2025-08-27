---
description: Scaffold a new ElizaOS Service with lifecycle and tests
auto_execution_mode: 3
---

# New Service

Implement a Service that encapsulates stateful logic or integrations.

## Slash usage

- Invoke: `/new_service`
- Example: `/new_service pluginId=social-raids name=CampaignService`

## Inputs

- pluginId (required): plugin directory under `src/plugins/`
- name (required): service name (PascalCase)
- path (optional): override output path (default: `src/plugins/{pluginId}/services/{name}.ts`)

## Steps

1. Design

- Define responsibilities, lifecycle (init/start/stop), dependencies
- Public API surface and events

2. Scaffold files

- Service: `src/plugins/{pluginId}/services/{name}.ts`
- Test: `src/plugins/{pluginId}/__tests__/{name}.test.ts`

3. Implement lifecycle

- Provide `start()` and `stop()` as needed
- Inject dependencies; avoid global singletons

4. Register and wire

- Export from plugin `index.ts`
- Add to runtime bootstrap if needed

5. Tests

- Unit tests with fakes/mocks; verify lifecycle and error paths

## Turbo steps (safe to auto-run)

// turbo

1. Type-check

```bash
bun run check
```

// turbo 2. Build

```bash
bun run build
```

// turbo 3. Tests

```bash
bun test
```

## Troubleshooting

- Ensure clean resource shutdown in tests to prevent hangs
- Validate env flags/URLs in `src/config/environment.ts`

## References

- `../rules/architecture_patterns.md`
- `../rules/coding_standards.md`
- `../rules/testing_standards.md`

### Core internal references

- `../rules/elizaos_development_workflow.md`
- `../rules/elizaos_coding_standards.md`
- `../rules/elizaos-architecture-patterns.md`
- `../rules/elizaos_security_protocols.md`
- `../rules/elizaos_template-quick-reference.md`
- `../rules/elizaos_template_system.md`
- `../rules/elizaos_interface_system.md`
- `../rules/elizaos_memory_operational_rules.md`
- `../rules/elizaos_memory_quick_reference.md`
- `../knowledge/README.md`
