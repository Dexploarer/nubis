---
description: Create and deploy a generic Edge Function (Vercel/Cloudflare) and integrate it with ElizaOS
auto_execution_mode: 3
---

# Create Edge Function

Scaffold a serverless function, deploy it, and add a provider/action to call it from ElizaOS.

## Slash usage
- Invoke: `/create_edge_function`
- Examples:
  - `/create_edge_function platform=vercel name=analytics-endpoint`
  - `/create_edge_function platform=cloudflare name=security-filter`

## Parameters
- platform (required): `vercel | cloudflare`
- name (required): function slug/name (kebab-case recommended)
- route (optional): public route/path (default depends on platform)
- entrypoint (optional): file path (default: `index.ts`)

## Steps
1) Scaffold
- Create minimal function handler (`index.ts`) that echoes payload and returns 200
- Add CORS and structured JSON responses

2) Deploy
- Vercel: `vercel deploy` or CI; set env vars in project settings
- Cloudflare: `wrangler deploy` with `wrangler.toml`

3) Configure environment
- Record deployed URL in `.env` (e.g., `ANALYTICS_ENDPOINT_URL`)
- Add any required auth keys/tokens as env vars

4) Integrate with ElizaOS
- Create a Provider or Action that calls the function
- Use fetch with correct headers (Authorization if required)
- Parse and validate the JSON response

5) Tests
- Add a simple call test (mock network for unit tests)
- Optionally add an integration test hitting the live URL (guarded by env flag)

## Turbo steps (safe to auto-run)
// turbo
1. Typecheck + build
```bash
bun run check && bun run build
```

## Quality gates
- Function responds 2xx with correct JSON schema
- URL present in `.env` and consumed by the provider/action
- Tests pass locally (unit) and optionally integration

## References
- Vercel Functions: https://vercel.com/docs/functions
- Cloudflare Workers: https://developers.cloudflare.com/workers/
- `../knowledge/edge_functions_rules.md`
- `../knowledge/supabase_rules.md`
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
