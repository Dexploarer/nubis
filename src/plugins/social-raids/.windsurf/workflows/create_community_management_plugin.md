---
description: Build a community management plugin (moderation, roles, engagement) with DB integration
auto_execution_mode: 3
---

# Create Community Management Plugin

Scaffold a plugin for moderation and engagement with optional database-backed records.

## Slash usage

- Invoke: `/create_community_management_plugin`
- Example: `/create_community_management_plugin plugin_name=community-management with_db=true`

## Parameters

- plugin_name (required): kebab-case plugin id (e.g., `community-management`)
- with_db (optional): `true|false` to enable DB storage (default: `true`)
- features (optional): comma-separated features: `moderation,roles,engagement` (default: `moderation,roles`)

## Steps

1. Scaffold plugin

- Create `src/plugins/${plugin_name}/index.ts`
- Define `configSchema` (zod): moderation thresholds, rate limits, DB URL key
- Export maps: `actions`, `providers`, `evaluators`, `services`

2. Services

- `ModerationService`: spam/toxicity checks, escalation policy, persistence if `with_db`
- `RolesService`: role-based access (RBAC) helpers, permission checks
- `EngagementService` (optional): points/leaderboard with rate limits

3. Actions (examples)

- `validateMention`: ensure format, resolve user/entity, return structured result
- `recordModerationAction`: persist moderation events with metadata
- `assignRole`: update role membership (guarded by permissions)

4. Providers (examples)

- `RecentMessagesProvider`: fetch filtered recent messages for context (cached)
- `LeaderboardProvider` (optional): compute top users (requires `with_db`)

5. Database integration (if `with_db=true`)

- Ensure `DATABASE_URL` is set (see `/.windsurf/workflows/database_setup.md`)
- Create migrations/tables: `moderation_events`, `roles`, `role_members`, `engagement_events`
- Use parameterized queries or an ORM; avoid interpolated SQL

6. Tests

- Unit tests for services and actions (success/error paths)
- Integration tests for DB-backed operations (transactional where possible)

7. Registration

- Import the plugin in `src/plugins/index.ts` and export it
- Feature-gate with env flags if needed (e.g., `ENABLE_COMMUNITY=true`)

## Turbo steps (safe to auto-run)

// turbo

1. Typecheck + build

```bash
bun run check && bun run build
```

## Quality gates

- Plugin compiles and exports a valid `configSchema`
- Services initialize/destroy cleanly; DB operations parameterized
- Tests pass for enabled features
- Actions/providers are wired into the plugin maps

## References

- `../workflows/database_setup.md`
- `../rules/elizaos_coding_standards.md`
- `../rules/security_protocols.md`
  Core internal references:
- `../rules/elizaos_development_workflow.md`
- `../rules/elizaos-architecture-patterns.md`
- `../rules/testing_standards.md`
- `../rules/elizaos_security_protocols.md`
- `../rules/elizaos_template-quick-reference.md`
- `../rules/elizaos_template_system.md`
- `../rules/elizaos_interface_system.md`
- `../rules/elizaos_memory_operational_rules.md`
- `../rules/elizaos_memory_quick_reference.md`
- `../knowledge/README.md`
