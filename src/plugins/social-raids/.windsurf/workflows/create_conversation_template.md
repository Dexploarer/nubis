---
description: Design and register a new conversation template for ElizaOS
auto_execution_mode: 3
---

# Create Conversation Template

Design placeholders, implement the template export, and integrate it with your agent.

## Slash usage

- Invoke: `/create_conversation_template`
- Example: `/create_conversation_template template_name=myTemplate`

## Parameters

- template_name (required): identifier (kebab/camel) for the template
- path (optional): output TS file path (default: `src/characters/template.ts`)

## Steps

1. Design placeholders

- Decide required placeholders (`{{providers}}`, `{{instructions}}`, etc.)
- Define output format and XML/code block requirements

2. Implement template

- Create the file at `path` and export a named constant string
- Follow formatting rules: fenced code blocks for examples; inline code for identifiers

3. Integrate

- Import and register template with character(s) or template registry
- Add references in `src/characters/index.ts` if applicable

4. Tests

- Validate that compilation and template rendering succeed with sample state

## Turbo steps (safe to auto-run)

// turbo

1. Typecheck + build

```bash
bun run check && bun run build
```

## Quality gates

- Template compiles and renders with sample state
- Placeholders match provider outputs
- Character(s) updated to use the new template if intended

## References

- `../rules/elizaos_template_system.md`
- `../rules/elizaos_template-quick-reference.md`

### Core internal references

- `../rules/elizaos_development_workflow.md`
- `../rules/elizaos-architecture-patterns.md`
- `../rules/elizaos_coding_standards.md`
- `../rules/testing_standards.md`
- `../rules/elizaos_security_protocols.md`
- `../rules/elizaos_interface_system.md`
- `../rules/elizaos_memory_operational_rules.md`
- `../rules/elizaos_memory_quick_reference.md`
- `../knowledge/README.md`
