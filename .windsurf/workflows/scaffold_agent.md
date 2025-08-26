---
description: when creating a new agents for elizaos
auto_execution_mode: 3
---

# Scaffold a New Agent (Character) (Concise)

Create a new agent using the existing template and environment-driven config.

## Slash usage
- Invoke via: `/scaffold_agent`
- Provide variables in chat when prompted, e.g. `name=orion` `makeDefault=true` `plugins=xmcpx,project`

## Inputs
- __name__ (required): agent name (used for file `src/characters/<name>.ts`)
- __makeDefault__ (optional boolean): if true, export as default in `src/characters/index.ts`
- __plugins__ (optional, comma-separated): plugin ids to include (e.g., `xmcpx,project`)
- __personalityPreset__ (optional): e.g., `mentor`, `builder`, `researcher` (affects bio/style)

## 1) Create character file
- Path: `src/characters/<name>.ts`
- Start from the template: `createCharacterFromTemplate(overrides)` from `src/characters/template.ts`
- Example skeleton:
  - Set `name`, `bio`, `knowledge`, `messageExamples`, `postExamples`, `topics`, `style`, `adjectives`
  - Ensure `plugins` align with your registry in `src/plugins/index.ts`

## 2) Register in character index
- Edit `src/characters/index.ts`:
  - Export your new character (named and optional default)
  - Update `getCharacter(name)` to return it when requested

## 3) Environment configuration
- Update `.env` (from `.env.template`) as needed:
  - `CHARACTER_NAME` and other config in `src/config/environment.ts`
  - Any provider/service secrets (Discord, Twitter, etc.) if your agent relies on them

## 4) Plugins alignment
- Check `src/plugins/index.ts`:
  - Ensure any required plugins for the new agent are exported/registered
  - Gate optional integrations with `features` from `src/config/environment.ts`
- In your character, set `plugins` accordingly (e.g., "@elizaos/plugin-bootstrap", "@elizaos/plugin-sql", plus custom plugins)

## 5) Run and validate
- `bun run type-check` and `bun run check`
- `bun run dev`
- Verify your agent responds as expected
  - If you added routes via a plugin, hit them (e.g., `/api/<plugin>/status`)

## 6) Optional: Customize behavior
- Add domain actions/providers in `src/actions/*` and wire them into your project plugin
- Override `system` prompt in the character for tone/behavior

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
3. Run unit tests (if any)
```bash
bun test
```

## Troubleshooting
- __Character not loaded__: ensure `src/characters/index.ts` exports your character and `getCharacter` routes to it
- __Missing plugins__: confirm they are included in `src/plugins/index.ts` and gated by `features` as needed
- __Env errors__: check `src/config/environment.ts` validation and required keys

## References
- Character template: `src/characters/template.ts`
- Character registry: `src/characters/index.ts`
- Env + feature flags: `src/config/environment.ts`
- Plugin registry: `src/plugins/index.ts`

### Core internal references
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
- `../knowledge/README.md`
