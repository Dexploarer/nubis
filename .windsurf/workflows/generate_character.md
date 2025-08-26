---
description: Generate and register a new ElizaOS character sheet
auto_execution_mode: 3
---

# Generate Character

Create a new character JSON and register it in the project.

## Slash usage
- Invoke: `/generate_character`
- Example: `/generate_character username=@example`

## Parameters
- username (required): handle or identifier to seed the character
- model (optional): LLM/model to use for generation (default: project default)
- output_path (optional): directory to write file (default: `src/characters`)
- register (optional): `true|false` add export/registration (default: `true`)

## Steps
1) Check environment
- Ensure the selected model API key is available in `.env`

2) Run generator
- Use your generator script or CLI (example):
```bash
bun run generate-character --username "$username" --out "$output_path"
```
- Expected output: `<output_path>/<username>.character.json`

3) Integrate character
- Copy/ensure file in `src/characters/`
- Register in `src/characters/index.ts` (export) and any runtime config if required

4) Validate structure
- Confirm required fields: `id`, `name`, `system`, templates, topics, plugins

## Turbo steps (safe to auto-run)
// turbo
1. Verify file presence (non-destructive)
```bash
[ -n "$username" ] && ls -1 "src/characters" | grep -E "${username}.*\.character\.json" || true
```

## Quality gates
- Character JSON exists in `src/characters/`
- JSON validates against expected character schema
- Character is exported/registered

## References
- `../rules/elizaos_template-quick-reference.md`
- `../rules/elizaos_coding_standards.md`
