---
description: when creating a new plugin for elizaos
auto_execution_mode: 3
---

# Scaffold a New ElizaOS Plugin (Concise)

Use this to add a new plugin following the patterns in `src/plugins/project-plugin.ts` and `src/plugins/xmcpx-plugin.ts`.

## Slash usage

- Invoke via: `/scaffold_plugin`
- Provide variables in chat when prompted, e.g. `id=my-analytics` `featureFlag=hasAnalytics`

## Inputs

- **id** (required): kebab-case plugin identifier (e.g., `my-analytics`) → file `src/plugins/my-analytics-plugin.ts`, export `myAnalyticsPlugin`
- **featureFlag** (optional): feature flag key in `features` (e.g., `hasAnalytics`) to conditionally enable

## 1) Create the plugin module

- Path: `src/plugins/<id>-plugin.ts`
- Export a `Plugin` named `<id>Plugin`:
  - `name`, `description`
  - `config`: env-driven values
  - `init(config, runtime)`: validate config with zod
  - Optional: `services`, `actions`, `providers`, `routes`, `events`
- If you need background work, add a `Service` (see `XMCPXService`) with `static serviceType`, `start/stop`.

## 2) Add an Action / Provider / Route

- **Action**: defines `name`, `similes`, `validate`, `handler`, `examples`
- **Provider**: implements `get(runtime, message, state)` and returns `{ text, values, data }`
- **Route**: add to `routes[]` with `{ name, path, type, handler }`

## 3) Register the plugin

- Edit `src/plugins/index.ts`:
  - `import { <id>Plugin } from './<id>-plugin.js'`
  - `export { <id>Plugin }` (optional convenience export)
  - Add to `getEnabledPlugins()`:
    - Either always include, or gate with `features.<flag>` from `src/config/environment.ts`
    - Example: `if (features.hasTwitter) plugins.push(xmcpxPlugin)`

## 4) Configuration & env

- Add required env vars to `.env.template`
- If you expose new parameters, update `package.json > agentConfig.pluginParameters` with `{ type, description, required, sensitive }`

## 5) Tests

- Create unit/integration tests under `src/plugins/<id>/__tests__/` (follow `social-raids` test layout)
- Run tests: `bun test` (or add focused scripts)

## 6) Validate

- `bun run dev` and watch logs
- Hit any routes you added (e.g., `/api/<id>/status`)
- Confirm actions/providers appear in `project-actions` endpoint if relevant

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

// turbo 4. Verify HTTP routes (adjust path if you added one)

```bash
curl -sS http://localhost:3000/api/project/status | jq .
```

## Troubleshooting

- **Config validation fails**: ensure env vars match Zod schema; log errors come from `.parseAsync`
- **Service not available**: confirm `services: [...]` exported and runtime registers it; check `runtime.getService(<serviceType>)`
- **Action not triggering**: verify `similes` and that the action appears in `/api/project/actions`

## References

- Example plugin with actions/providers/services: `src/plugins/xmcpx-plugin.ts`
- Project plugin with routes and config: `src/plugins/project-plugin.ts`
- Plugin registry: `src/plugins/index.ts`
- Feature flags: `src/config/environment.ts`
- `../rules/elizaos_coding_standards.md`
- `../rules/elizaos-architecture-patterns.md`
- `../rules/testing_standards.md`
- `../rules/elizaos_interface_system.md`

### Core internal references

- `../rules/elizaos_development_workflow.md`
- `../rules/elizaos_security_protocols.md`
- `../rules/elizaos_template-quick-reference.md`
- `../rules/elizaos_template_system.md`
- `../rules/elizaos_memory_operational_rules.md`
- `../rules/elizaos_memory_quick_reference.md`
- `../knowledge/README.md`
