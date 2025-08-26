---
description: Generate a character from curated presets (mentor/builder/researcher)
auto_execution_mode: 3
---

# Add Character from Preset

Create a character using curated presets and register it in the index.

## Slash usage
- Invoke: `/add_character_preset`
- Example: `/add_character_preset name=orion preset=mentor makeDefault=true plugins=xmcpx,project`

## Inputs
- name (required): character id (file: `src/characters/<name>.ts`)
- preset (required): `mentor` | `builder` | `researcher`
- plugins (optional): comma-separated plugin ids (e.g., `xmcpx,project`)
- makeDefault (optional boolean): export as default from `src/characters/index.ts`

## Steps
1) Create file `src/characters/<name>.ts`
- Use `createCharacterFromTemplate(overrides)` from `src/characters/template.ts`
- Preset suggestions:
  - mentor: supportive tone, teaching examples, curated `knowledge`
  - builder: action-oriented, concise tips, `postExamples` for changelogs
  - researcher: thorough, citations style, `topics` tuned to analysis

2) Register in `src/characters/index.ts`
- Export named character and set as default if `makeDefault=true`
- Ensure `getCharacter(name)` returns it

3) Align plugins
- Match with `src/plugins/index.ts` and gate optional integrations via `features` in `src/config/environment.ts`

// turbo
4) Validate
```bash
bun run check && bun run build && bun test
```

## Troubleshooting
- Character not loading → ensure index exports and `getCharacter()` mapping
- Env errors → verify `src/config/environment.ts` keys
- Missing plugins → ensure plugin registry is aligned

## References
- Character template: `src/characters/template.ts`
- Character registry: `src/characters/index.ts`
