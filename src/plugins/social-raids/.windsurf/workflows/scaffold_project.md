---
description: when creating a new project for elizaos
auto_execution_mode: 3
---

# Scaffold a New ElizaOS Project (Concise)

Use this when starting a new project with the same patterns used here.

## Slash usage

- Invoke via: `/scaffold_project`
- Provide variables in chat when prompted, e.g. `projectName=awesome-agent` `packageName=@acme/awesome-agent`

## Inputs

- **projectName** (required): repo/folder name, kebab-case (e.g., `awesome-agent`)
- **packageName** (optional): npm package name (e.g., `@acme/awesome-agent`)
- **withTwitter**/**withDiscord**/**withTelegram** (optional booleans): to preconfigure feature flags

## 1) Initialize project

- Create repo and baseline files: `package.json`, `tsconfig.json`, `tsconfig.build.json`, `tsup.config.ts`, `.gitignore`, `.env.template`
- Add scripts in `package.json` (align with this repo):
  - `dev`, `start`, `build`, `type-check`, `lint`, `biome`, `test`

## 2) Install dependencies

- Runtime: `@elizaos/core`, `@elizaos/plugin-bootstrap`, `@elizaos/plugin-sql`, `@elizaos/server`, `zod`, (integrations you need)
- Dev: `typescript`, `tsup`, `@biomejs/biome` (and linters you prefer)
- Run: `bun install` (or `npm install`)

## 3) Structure folders

- `src/actions/` — actions for your domain
- `src/plugins/` — custom plugins (`*-plugin.ts`)
- `src/characters/` — agents (characters)
- `src/config/` — env validation and feature flags
- `types/` — type shims if needed
- `.windsurf/` — rules, knowledge, workflows

## 4) Environment and config

- Copy `.env.template` → `.env`
- Required: set at least one AI key per `src/config/environment.ts` (`OPENAI_API_KEY` or `ANTHROPIC_API_KEY`)
- Use Zod validation like this repo: see `src/config/environment.ts`
- Expose feature flags in `features` (e.g., `hasDiscord`, `hasTwitter`)

## 5) Plugin registry

- Create `src/plugins/index.ts`:
  - Always include: `@elizaos/plugin-bootstrap`, `@elizaos/plugin-sql`
  - Add your custom project plugin (see next step)
  - Gate optional plugins with `features` (e.g., Twitter, Discord)

## 6) Project plugin

- Create `src/plugins/project-plugin.ts`:
  - Export a `Plugin` with `name`, `description`, `config`, `init`
  - Validate config with zod; set env defaults; log config
  - Register actions/providers/routes/events as needed
  - Add a GET route for basic status (e.g., `/api/project/status`)

## 7) Character (agent)

- Add a default character in `src/characters/` using `createCharacterFromTemplate(overrides)`
- Register in `src/characters/index.ts` and export as default
- Ensure `plugins` align with your registry in `src/plugins/index.ts`

## 8) Build + run

- `bun run type-check` and `bun run check`
- `bun run build` (tsup) to generate `dist/`
- `bun run dev` to start (or `npm run dev`)
- Verify:
  - `GET /api/project/status` returns your project info
  - Actions and providers are available (see `/api/project/actions` if implemented)

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

- **Missing AI provider**: ensure `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` present; see `src/config/environment.ts`
- **Feature flags not working**: confirm env is parsed and `features` reflects booleans
- **Routes unreachable**: verify server is running and paths match your plugin `routes[]`

## 9) Ship

- Add CI to lint/typecheck/build/test
- Tag and publish if packaging; or deploy your server (Docker optional)

## References

- Env validation & feature flags: `src/config/environment.ts`
- Plugin registry: `src/plugins/index.ts`
- Example project plugin: `src/plugins/project-plugin.ts`
- Character template and registry: `src/characters/template.ts`, `src/characters/index.ts`
- `../rules/elizaos_coding_standards.md`
- `../rules/elizaos-architecture-patterns.md`
- `../rules/testing_standards.md`

### Core internal references

- `../rules/elizaos_development_workflow.md`
- `../rules/elizaos_security_protocols.md`
- `../rules/elizaos_template-quick-reference.md`
- `../rules/elizaos_template_system.md`
- `../rules/elizaos_interface_system.md`
- `../rules/elizaos_memory_operational_rules.md`
- `../rules/elizaos_memory_quick_reference.md`
- `../knowledge/README.md`
