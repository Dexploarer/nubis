---
description: Create a knowledge base from docs and register rules to consult it
auto_execution_mode: 3
---

# Create Knowledge Base

Parse documentation into DOCUMENT memories and add rules to consult them.

## Slash usage
- Invoke: `/create_knowledge_base`
- Example: `/create_knowledge_base docs_glob=docs/**/*.md tag=kb:v1`

## Parameters
- docs_glob (required): glob of files to ingest (e.g., `docs/**/*.md`)
- tag (optional): metadata tag for grouping (default: `kb:default`)
- chunk_size (optional): target chunk size in chars (default: 1200)

## Steps
1) Discover documents
- Expand `docs_glob` and list files to ingest

2) Chunk + normalize
- Split by headings/paragraphs to ~`chunk_size`
- Normalize: strip code fences optionally; preserve headings

3) Store as DOCUMENT memories
- For each chunk, call runtime memory create with:
  - `type=DOCUMENT`, `content`, `metadata.tags` includes `tag`
  - include `source_path`, `section_title`, `doc_title`

4) Add a rule to prioritize KB
- Create or update a rule in `../rules/` (e.g., `knowledge_kb.md`) that instructs Cascade to consult KB memories tagged with `tag`

5) Verify retrieval
- Run a test search using agent’s memory search to confirm relevant chunks are returned

## Turbo steps (safe to auto-run)
// turbo
1. Build + basic check
```bash
bun run check && bun run build
```

## Quality gates
- All target docs ingested without error
- DOCUMENT memories stored with correct tags and metadata
- Rule added/updated to consult KB
- Retrieval query returns expected content

## References
- `../rules/elizaos_memory_operational_rules.md`
- `../rules/documentation-guidelines.md`
Core internal references:
- `../rules/elizaos_development_workflow.md`
- `../rules/elizaos-architecture-patterns.md`
- `../rules/elizaos_coding_standards.md`
- `../rules/testing_standards.md`
- `../rules/elizaos_security_protocols.md`
- `../rules/elizaos_template-quick-reference.md`
- `../rules/elizaos_template_system.md`
- `../rules/elizaos_interface_system.md`
- `../rules/elizaos_memory_quick_reference.md`
- `../knowledge/README.md`
