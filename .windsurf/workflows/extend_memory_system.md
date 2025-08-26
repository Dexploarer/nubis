---
description: Extend the ElizaOS memory system with custom types or adapters
auto_execution_mode: 3
---

# Extend Memory System

Create a custom memory type or a database adapter and integrate it into the runtime.

## Slash usage
- Invoke: `/extend_memory_system`
- Examples:
  - `/extend_memory_system extension_type=type name=KNOWLEDGE_SNIPPET`
  - `/extend_memory_system extension_type=adapter name=RedisKVAdapter`

## Parameters
- extension_type (optional): `type | adapter` (default: `type`)
- name (optional): identifier for the new type/adapter (default varies)
- table (optional): storage table/collection name (default: `memories`)

## Steps
1) Design extension
- Review rules: `.windsurf/rules/elizaos_memory_operational_rules.md`, `.windsurf/rules/elizaos_memory_quick_reference.md`
- Decide scope: new Memory `type` or a storage `adapter`

2) Implement custom type (only if `extension_type=type`)
- Extend metadata and add enum entry in your types module (e.g., `MemoryType.KNOWLEDGE_SNIPPET`)
- Add factory helpers and validation
- Ensure embeddings are generated and stored

3) Implement adapter (only if `extension_type=adapter`)
- Create class implementing your `IDatabaseAdapter` interface
- Methods: `getMemories`, `searchMemories`, `createMemory`, `updateMemory`, `deleteMemory`
- Implement: embedding persistence/search, deduplication, transactions

4) Integrate extension
- Register type/adapter in runtime configuration
- Update services/providers to use the new type/adapter

5) Tests
- Unit tests for CRUD + search
- Concurrency/error handling tests

## Turbo steps (safe to auto-run)
// turbo
1. Quick type & build check
```bash
bun run check && bun run build
```

## Quality gates
- All CRUD + search operations succeed for the new type/adapter
- No direct DB calls; use runtime memory APIs
- Typecheck/build pass and tests green

## References
- `../rules/elizaos_memory_operational_rules.md`
- `../rules/elizaos_memory_quick_reference.md`
- `../rules/architecture_patterns.md`
