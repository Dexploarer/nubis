---
description: Build, test, package, and deploy an ElizaOS application
auto_execution_mode: 3
---

# Deploy ElizaOS App

Guided deployment flow. Choose your target platform after build/test.

## Slash usage

- Invoke: `/deploy_elizaos_app`
- Example: `/deploy_elizaos_app target=docker`

## Parameters

- target (optional): docker | flyio | render | bare-metal (default: docker)
- port (optional): runtime port (default: 3000)

## Steps

1. Pre-flight

- Ensure `.env` configured (API keys, DB, feature flags)
- Verify `src/config/environment.ts` reads expected flags

2. Quality gates

```bash
bun run check && bun run build && bun test
```

3. Packaging (choose target)

- docker: create `Dockerfile`, build `docker build -t elizaos-app .`
- flyio/render: generate config; deploy via CLI
- bare-metal: `node dist/index.js` or `bun run start`

4. Post-deploy

- Health probe `/healthz` if available
- Monitor logs and error tracking

## Turbo steps (safe to auto-run)

// turbo

1. Check, build, test

```bash
bun run check && bun run build && bun test
```

## Quality gates

- Pre-flight env validated; no missing critical variables
- Check/build/test all pass
- Selected packaging step completes successfully (image built or config generated)
- App reachable and health probe passes

## Troubleshooting

- Missing bun? Install bun or run `npm run` equivalents
- Node version mismatch: ensure Node 18+
- Failing tests: run `bun test --watch` and fix before deploying

## References

- `../knowledge/coding_standards.md`
- `../knowledge/documentation-guidelines.md`
- `../knowledge/architecture_patterns.md`
- `../knowledge/performance_guidelines.md`

Core internal references:

- `../rules/elizaos_development_workflow.md`
- `../rules/elizaos-architecture-patterns.md`
- `../rules/elizaos_coding_standards.md`
- `../rules/testing_standards.md`
- `../rules/elizaos_security_protocols.md`
- `../rules/elizaos_template-quick-reference.md`
- `../rules/elizaos_template_system.md`
- `../rules/elizaos_interface_system.md`
- `../rules/elizaos_memory_operational_rules.md`
- `../rules/elizaos_memory_quick_reference.md`
- `../knowledge/README.md`
