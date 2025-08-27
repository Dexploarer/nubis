---
description: Update a character's messageExamples array with validated samples
auto_execution_mode: 3
---

# Update Message Examples

Audit and enrich a character’s `messageExamples` to improve coverage and alignment.

## Slash usage

- Invoke: `/update_message_examples`
- Example: `/update_message_examples character=nubi strategy=diversify`

## Parameters

- character (required): character id or file stem (e.g., `nubi`)
- strategy (optional): `diversify | align | expand` (default: `diversify`)
- count (optional): number of new examples to add (default: 10)

## Steps

1. Audit current examples

- Load character JSON and analyze topics, styles, edge cases

2. Generate candidates

- Use your preferred LLM or heuristics to propose new examples
- Cover greetings, complex queries, errors, multi-turn follow-ups

3. Validate

- Enforce persona guidelines and response patterns
- Remove duplicates; ensure safe content; ensure formatting rules

4. Update

- Merge validated examples; persist back to character JSON
- Commit with a clear message

## Turbo steps (safe to auto-run)

// turbo

1. Typecheck + build

```bash
bun run check && bun run build
```

## Quality gates

- Examples are diverse, persona-aligned, and pass validation
- Character JSON remains valid and loads at runtime
- No secrets or PII in examples

## References

- `../rules/documentation-guidelines.md`
- `../rules/elizaos_template-quick-reference.md`

### Core internal references

- `../rules/elizaos_development_workflow.md`
- `../rules/elizaos_coding_standards.md`
- `../rules/elizaos-architecture-patterns.md`
- `../rules/testing_standards.md`
- `../rules/elizaos_security_protocols.md`
- `../rules/elizaos_template_system.md`
- `../rules/elizaos_interface_system.md`
- `../rules/elizaos_memory_operational_rules.md`
- `../rules/elizaos_memory_quick_reference.md`
- `../knowledge/README.md`
