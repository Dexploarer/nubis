---
description: Manage roles and permissions (OWNER, ADMIN, NONE)
---

# Roles and Permissions

Role management is powered by `@elizaos/plugin-bootstrap` (UPDATE_ROLE action) and core role types.

## Role model
- Roles: OWNER, ADMIN, NONE
- Stored per server/world in metadata (lookups via runtime world state)

## Usage (natural language)
- Assign admin: "Make @user an admin here"
- Revoke admin: "Remove admin from @user"
- Transfer ownership: "Set @user as owner" (requires current OWNER)
- Query: "Who are the admins in this server?"

## Validation rules (summary)
- Users cannot change their own role
- OWNER can assign any role
- ADMIN cannot assign OWNER
- NONE cannot assign roles

## Verify
1) In your community channel, issue: "Make @user an admin"
2) Bot responds with success or permission error
3) Attempt a restricted action as ADMIN to confirm guardrails

## Notes
- Keep moderation actions auditable via your platform logs
- Combine with room controls for effective moderation

## References
- `../rules/elizaos_interface_system.md`
- `../rules/elizaos_template-quick-reference.md`

### Core internal references
- `../rules/elizaos_development_workflow.md`
- `../rules/elizaos_coding_standards.md`
- `../rules/elizaos-architecture-patterns.md`
- `../rules/testing_standards.md`
- `../rules/elizaos_security_protocols.md`
- `../rules/elizaos_template_system.md`
- `../rules/elizaos_memory_operational_rules.md`
- `../rules/elizaos_memory_quick_reference.md`
- `../knowledge/README.md`
