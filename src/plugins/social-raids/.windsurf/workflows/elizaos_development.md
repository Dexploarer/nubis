---
description: Comprehensive ElizaOS development workflow (plan-first, TDD, architecture checks)
auto_execution_mode: 3
---

# ElizaOS Development (Plan-first)

A disciplined workflow for features/bugfixes/refactors aligned with ElizaOS principles.

## Slash usage
- Invoke: `/elizaos_development`
- Example: `/elizaos_development task_type=feature component_type=plugin`

## Parameters
- task_type (optional): feature | bugfix | refactor | enhancement (default: feature)
- component_type (optional): action | provider | evaluator | service | plugin | character

## Steps
1) Analyze requirement
- Identify scope and success criteria
- Draft a lightweight PRD (problem, goals, acceptance tests)

2) Research codebase
- Search for related files/patterns
- Note constraints (no circular deps, core import boundaries)

3) Design solution
- Outline file paths, names, modules, APIs
- Decide tests (unit/integration/e2e) and data fixtures

4) Implement
- Code to completion (no stubs). Add logging and error handling.
- Validate env & features via `src/config/environment.ts`

5) Tests
- Write and run tests. Iterate until green.

6) Commit & docs
- Conventional commits; update README/knowledge/rules if needed

### Note: Template Overrides and Matrix Testing
- Prefer runtime parameter overrides and matrix testing for "template switching" of character configurations.
- Avoid creating multiple character config files for variations; instead, use matrix parameters like `character.llm.model`, `character.temperature`, etc.
- This reduces duplication and keeps scenarios maintainable and consistent.

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
3. Unit tests
```bash
bun test
```

## Quality gates
- TypeScript compiles; lint passes
- Tests pass (cover success and failure)
- No circular deps; adheres to `@elizaos/*` module boundaries

## References
- `../knowledge/architecture_patterns.md`
- `../knowledge/coding_standards.md`
- `../knowledge/documentation-guidelines.md`
- `../knowledge/template_system.md`
- `../knowledge/memory_system.md`
- `../knowledge/performance_guidelines.md`
- `../knowledge/quick_references.md`
- `../rules/elizaos_development_workflow.md`
- `../rules/elizaos_coding_standards.md`
- `../rules/elizaos-architecture-patterns.md`
- `../rules/testing_standards.md`
- `../rules/elizaos_security_protocols.md`
- `../rules/elizaos_template-quick-reference.md`
- `../rules/elizaos_template_system.md`
- `../rules/elizaos_interface_system.md`
- `../rules/elizaos_memory_operational_rules.md`
- `../rules/elizaos_memory_quick_reference.md`
