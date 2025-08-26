---
description: Scaffold a new Action/Provider/Route with Zod validation and tests
auto_execution_mode: 3
---

# New Plugin Action/Provider/Route

Create an Action, Provider, or Route inside an existing plugin with input validation and example tests.

## Slash usage
- Invoke: `/new_plugin_action`
- Example: `/new_plugin_action id=my-analytics kind=action name=analyze-metrics similes=analyze,metrics`

## Inputs
- id (required): plugin id (file: `src/plugins/<id>-plugin.ts`)
- kind (required): `action` | `provider` | `route`
- name (required): exported symbol name (e.g., `analyzeMetricsAction`)
- similes (optional, action): comma-separated synonyms to trigger the action
- schema (optional): JSON-ish fields to validate with Zod (e.g., `start:string end:string verbose:boolean`)
- routePath (required for route): e.g., `/api/<id>/status`
- routeMethod (optional): `GET` | `POST` (default: `GET`)

## Steps
1) Open plugin: `src/plugins/<id>-plugin.ts`
2) Add Zod schema
```ts
import { z } from "zod";

const Payload = z.object({
  // add fields, e.g.:
  // start: z.string().datetime().optional(),
  // end: z.string().datetime().optional(),
  // verbose: z.boolean().default(false),
});
```
3) Action (if kind=action)
```ts
import type { Action } from "@elizaos/core";

export const analyzeMetricsAction: Action = {
  name: "analyzeMetrics",
  similes: ["analyze", "metrics"],
  validate: async (runtime, message) => {
    const input = message.content?.text ? JSON.parse(message.content.text) : {};
    return Payload.parse(input);
  },
  handler: async (runtime, message, state, ctx) => {
    const data = ctx.validation as z.infer<typeof Payload>;
    // ... do work, return ok
    return { success: true, data };
  },
  examples: [
    {
      content: { text: JSON.stringify({ verbose: true }) },
      result: { success: true },
    },
  ],
};
```
4) Provider (if kind=provider)
```ts
import type { Provider } from "@elizaos/core";

export const analyticsProvider: Provider = {
  get: async (runtime, message, state) => {
    // Validate inputs if present
    const input = message.content?.text ? JSON.parse(message.content.text) : {};
    const parsed = Payload.safeParse(input);
    if (!parsed.success) return { text: "Invalid input", values: {}, data: null };
    // return values/data for templating
    return { text: "ok", values: { count: 1 }, data: { ok: true } };
  },
};
```
5) Route (if kind=route)
```ts
import type { RouteDefinition } from "@elizaos/server";

export const routes: RouteDefinition[] = [
  {
    name: "status",
    path: "/api/my-analytics/status",
    type: "GET",
    handler: async (req, res) => {
      res.json({ ok: true });
    },
  },
];
```
6) Register in plugin export
- Ensure `actions`, `providers`, or `routes` include the new item, e.g. `actions: [analyzeMetricsAction]`.

7) Tests: `src/plugins/<id>/__tests__/`
```ts
import { describe, it, expect } from "bun:test";
import { analyzeMetricsAction } from "../../<id>-plugin";

describe("analyzeMetricsAction", () => {
  it("validates and runs", async () => {
    const message = { content: { text: JSON.stringify({ verbose: true }) } } as any;
    const valid = await analyzeMetricsAction.validate?.({} as any, message);
    expect(valid).toBeTruthy();
  });
});
```

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
3. Run unit tests
```bash
bun test
```

## References
- Zod intro: https://zod.dev/
- Server routes (example type): `@elizaos/server` RouteDefinition
