---
description: Supabase Edge Functions workflow (deploy, verify, observe) tailored to NUBI
auto_execution_mode: 3
---

# Supabase Edge Functions (NUBI)

Manage, verify, and observe your Edge Functions for project `nfnmoqepgjyutcbbaqjg`.

Known slugs (current/expected):

- webhook-processor (ACTIVE)
- analytics-engine (ACTIVE)
- raid-coordinator (planned)
- security-filter (planned)
- task-queue (planned)
- personality-evolution (planned)

## Slash usage

- Invoke: `/supabase_edge_functions`
- Examples:
  - `/supabase_edge_functions action=list`
  - `/supabase_edge_functions action=invoke slug=webhook-processor`
  - `/supabase_edge_functions action=logs slug=analytics-engine`
  - `/supabase_edge_functions action=deploy slug=raid-coordinator`

## Parameters

- action (required): list | invoke | logs | deploy | url
- slug (optional): function slug when action needs it
- payload (optional): JSON string for invoke

## 1) Env and URLs

- Ensure `.env` contains:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
  - `EDGE_FUNCTIONS_ENABLED=true`
  - Web URLs (examples):
    - `WEBHOOK_PROCESSOR_URL`, `ANALYTICS_ENGINE_URL`, `RAID_COORDINATOR_URL`, `SECURITY_FILTER_URL`, `TASK_QUEUE_URL`, `PERSONALITY_EVOLUTION_URL`

## 2) Common tasks

- List functions (uses MCP internally): shows status and version
- View logs (uses MCP `get_logs` with service = edge-function)
- Deploy/update function:
  - Provide entrypoint and file contents or use your repo path
  - MCP `deploy_edge_function` uploads new version
- Invoke function (dev/test):
  - For public or JWT-optional functions, send payload with anon key
  - For protected, include Bearer token as required by your policy

## 3) Example cURL invocations (safe)

- Anon token call (no secrets):

```bash
curl -sS -X POST "$WEBHOOK_PROCESSOR_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "x-platform: telegram" \
  -d '{"eventType":"ping","userId":"test","content":"/ping"}' | jq .
```

- Service role call (server-side only, for admin routes):

```bash
# Do NOT use in client contexts. For server/CI verification only.
curl -sS -X POST "$ANALYTICS_ENGINE_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -d '{"mode":"health"}' | jq .
```

## 4) Function template (Deno)

```ts
// index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: cors('*') });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const body = await req.json().catch(() => ({}));
    return json(200, { ok: true, input: body });
  } catch (e) {
    return json(500, { error: e?.message || 'unknown' });
  }
});

function cors(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function json(status: number, data: unknown) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors('*') },
  });
}
```

## 5) Turbo checks (safe to auto-run)

// turbo

1. Verify Edge env URLs are present (not values)

```bash
set -o allexport; source ./.env 2>/dev/null || true; set +o allexport;
for v in EDGE_FUNCTIONS_ENABLED WEBHOOK_PROCESSOR_URL ANALYTICS_ENGINE_URL RAID_COORDINATOR_URL SECURITY_FILTER_URL TASK_QUEUE_URL PERSONALITY_EVOLUTION_URL; do
  if [ -n "${!v}" ]; then echo "${v}=SET"; else echo "${v}=MISSING"; fi; done
```

## Quality gates

- Required Supabase environment variables present
- For deploy: function upload succeeds; version updated
- For invoke: 2xx response with expected payload echo or health response
- Logs retrieval works without errors

## 6) Notes

- JWT verification: set per-function if required by auth model
- Use idempotency keys for webhook handlers
- Log sparingly; prefer structured logs; avoid secret values in logs

## References

- `../knowledge/edge_functions_rules.md`
- `../knowledge/supabase_rules.md`

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
