# Template System (Index)

Authoritative sources under `../rules/`:

- System overview: `../rules/elizaos_template_system.mdc`
- Operational rules: `../rules/elizaos_template_operational_rules.mdc`
- Quick reference: `../rules/elizaos_template-quick-reference.mdc`

## Recommended Standard: Runtime Overrides + Matrix Testing

- Prefer runtime parameter overrides and matrix testing for "template switching" of character configurations.
- Keep one base scenario/character template; vary via parameter paths (e.g., `character.llm.model`, `character.temperature`, `run[0].input]`).
- Avoid duplicating multiple character configuration files for variations.

Example matrix snippet:

```yaml
matrix:
  - parameter: 'character.llm.model'
    values: ['gpt-4', 'claude-3']
  - parameter: 'character.temperature'
    values: [0.1, 0.5, 0.9]
```

See also:

- `./architecture_patterns.md` → Template Override and Matrix Testing Patterns
- `../workflows/elizaos_development.md` → Development guidance note
