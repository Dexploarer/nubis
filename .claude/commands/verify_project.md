---
description: Quick health checks (env validation, open ports, endpoints)
auto_execution_mode: 3
---

# Verify Project Health

Run quick checks to ensure the project is configured and running correctly.

## Slash usage
- Invoke: `/verify_project`
- Example: `/verify_project port=3000`

## Inputs
- port (optional): server port to check (default: 3000)
- baseUrl (optional): base URL (default: http://localhost)

## Checks
1) Env validation
- Ensure `.env` exists and keys are set (AI keys, DB, etc.)
- Source of truth: `src/config/environment.ts` (Zod schema + `features` flags)

// turbo
2) Type-check & build
```bash
bun run check && bun run build
```

// turbo
3) Is server listening?
```bash
ss -tuln | grep :${port:-3000} || true
```

// turbo
4) Basic endpoint probe
```bash
curl -sS ${baseUrl:-http://localhost}:${port:-3000}/api/project/status | jq . || true
```

5) Plugins visibility
- Check `src/plugins/index.ts` → confirm expected plugins and feature-flag gates
- If routes were added, probe them: `curl -sS ${baseUrl}:${port}/api/<plugin>/status`

6) Logs & errors
- Review server logs for validation errors and missing env keys

## Troubleshooting
- Missing AI provider → set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- Route 404 → ensure plugin `routes[]` includes the correct path
- Port not listening → verify dev server started and port not in use

## References
- Env & features: `src/config/environment.ts`
- `../rules/elizaos_development_workflow.md`
- `../rules/elizaos_coding_standards.md`
- `../rules/elizaos-architecture-patterns.md`

### Core internal references
- `../rules/testing_standards.md`
- `../rules/elizaos_security_protocols.md`
- `../rules/elizaos_template-quick-reference.md`
- `../rules/elizaos_template_system.md`
- `../rules/elizaos_interface_system.md`
- `../rules/elizaos_memory_operational_rules.md`
- `../rules/elizaos_memory_quick_reference.md`
- `../knowledge/README.md`
