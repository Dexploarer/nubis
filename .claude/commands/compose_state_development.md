---
description: Compose State Development
auto_execution_mode: 3
---

# Compose State Development (Concise Workflow)

A focused workflow for compose-state development. See the full reference for details.

- Full guide: `../rules/elizaos_development_workflow.md`

## Slash usage

- Invoke via: `/compose_state_development`
- Optional vars: `branch=feat/compose-auth` `quick=true`

## Inputs

- **branch** (optional): name for the working branch
- **quick** (optional boolean): skip nonessential steps

## Quick Steps

- Set up environment and feature branch
- Implement compose state changes with small commits
- Add/adjust tests covering flows
- Lint, typecheck, test
- Open PR with checklist

## Turbo steps (safe to auto-run)

// turbo

1. Type-check and lint

```bash
bun run check
```

// turbo 2. Build

```bash
bun run build
```

// turbo 3. Run unit tests

```bash
bun test
```

## Troubleshooting

- **State drift**: ensure test fixtures mirror new compose nodes and edges
- **Broken flows**: add integration tests for key transitions; verify guards/effects
- **Performance**: profile heavy composition paths; memoize or batch updates

## References

- `../rules/elizaos_development_workflow.md`
- `../rules/architecture_patterns.md`
- `../rules/elizaos_template_system.md`
  Core internal references:
- `../rules/elizaos_coding_standards.md`
- `../rules/elizaos-architecture-patterns.md`
- `../rules/testing_standards.md`
- `../rules/elizaos_security_protocols.md`
- `../rules/elizaos_template-quick-reference.md`
- `../rules/elizaos_interface_system.md`
- `../rules/elizaos_memory_operational_rules.md`
- `../rules/elizaos_memory_quick_reference.md`
- `../knowledge/README.md`
