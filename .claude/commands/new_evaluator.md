---
description: Scaffold a new ElizaOS Evaluator with fixtures and tests
auto_execution_mode: 3
---

# New Evaluator

Add an Evaluator to score or classify data/actions.

## Slash usage

- Invoke: `/new_evaluator`
- Example: `/new_evaluator pluginId=social-raids name=SpamScoreEvaluator`

## Inputs

- pluginId (required): plugin directory under `src/plugins/`
- name (required): evaluator name (PascalCase)
- path (optional): override output path (default: `src/plugins/{pluginId}/evaluators/{name}.ts`)

## Steps

1. Design

- Define evaluation criteria and output range/schema
- Determine feature inputs and dependencies

2. Scaffold files

- Evaluator: `src/plugins/{pluginId}/evaluators/{name}.ts`
- Test: `src/plugins/{pluginId}/__tests__/{name}.test.ts`
- Fixtures: `src/plugins/{pluginId}/__tests__/fixtures/{name}.json` (optional)

3. Implement

- Pure functions when possible for determinism
- Include threshold constants and rationale

4. Register

- Export from plugin `index.ts`

5. Tests

- Cover edge cases and boundary thresholds

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

- Avoid side effects; mock external calls
- Keep thresholds configurable if needed via env

## References

- `../rules/testing_standards.md`
- `../rules/coding_standards.md`
- `../rules/architecture_patterns.md`

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
