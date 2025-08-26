---
description: Supabase Edge Functions Rules (Deno runtime) for NUBI
---

# Edge Functions Rules (NUBI)

Hardening and operational guidance for Deno-based Supabase Edge Functions.

## Project & Env
- One function per folder with clear slug (e.g., `webhook-processor`).
- Required env (server-only secrets): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Feature flags: `EDGE_FUNCTIONS_ENABLED=true` in `.env`.
- Per-function URLs exported (e.g., `WEBHOOK_PROCESSOR_URL`).

## Security
- Never log secrets; scrub tokens from logs.
- Validate and sanitize all inputs (Zod or manual guards).
- Auth: require Bearer JWT when needed; prefer anon for public pings only.
- Idempotency: support `Idempotency-Key` header for webhook handlers.
- CORS: explicit allowlist; return `OPTIONS` early.

## Reliability
- Retry with backoff for transient DB/API errors.
- Timeouts: keep handlers fast; offload long tasks to queues.
- Structured logs (JSON) with request IDs; keep PII out of logs.

## Database Usage
- Use service role only server-side; use Postgres RPC for privileged writes where possible.
- Keep Deno function logic small; validate payloads and call RPC/table ops.

## Performance
- Cold start: precompute simple structures; avoid heavy dynamic imports.
- Batch writes, use `upsert` for idempotency.

## Deployment
- Version functions; changelog entries for each deploy.
- Promote via staging → production; smoke-test endpoints with canned payloads.

## Example Template
```ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return ok();
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const payload = await req.json().catch(() => ({}));
    // TODO: validate payload
    return json(200, { ok: true });
  } catch (e) {
    return json(500, { error: e?.message || "unknown" });
  }
});

function ok() { return new Response("ok", { headers: cors("*") }); }
function json(status: number, data: unknown) { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...cors("*") } }); }
function cors(origin: string) { return { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization, Idempotency-Key" }; }
```
