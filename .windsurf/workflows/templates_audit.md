---
description: Audit and update local docs/workflows against upstream ElizaOS templates
auto_execution_mode: 3
---

# Templates Audit Workflow

This workflow helps you verify that our local rules, knowledge, and workflows reflect the current upstream ElizaOS templates (message, character, and action templates).

## What this covers
- Message templates (shouldRespond, messageHandler, postCreation, imageDescription, booleanFooter)
- Action-specific templates (replyTemplate, imageGenerationTemplate)
- Character agent templates (discord/telegram/slack/twitter/github/instagram, none)
- Base character (Eliza)
- Built-in actions list and Action interface shape

## Upstream reference paths
- `packages/core/src/prompts.ts`
- `packages/plugin-bootstrap/src/actions/reply.ts`
- `packages/plugin-bootstrap/src/actions/imageGeneration.ts`
- `packages/plugin-bootstrap/src/actions/index.ts` (action exports)
- `packages/plugin-bootstrap/src/actions/components.ts` (Action interface)
- `packages/client/src/config/agent-templates.ts`
- `packages/cli/src/characters/eliza.ts`

## Steps
1. Collect upstream facts
   - Open the files listed in Upstream reference paths and confirm:
     - Template names, XML output formats, and provider/action rules
     - Agent template IDs and descriptions
     - Built-in actions list and Action interface fields

2. Compare with local knowledge
   - Open `./.windsurf/knowledge/eliza_templates_complete_list.md`
   - Confirm every template and action from upstream appears here
   - Confirm links back to authoritative rules

3. Update knowledge if needed
   - If anything is missing or outdated, edit:
     - `./.windsurf/knowledge/eliza_templates_complete_list.md`
     - Optionally add a short note to `./.windsurf/knowledge/template_system.md` pointing to the complete list

4. Rules quick-reference (if writable)
   - If `../rules/` is writable, ensure `elizaos_template-quick-reference.md` includes:
     - imageGenerationTemplate
     - booleanFooter
     - Built-in actions list
     - Action interface structure summary
   - If not writable, keep the knowledge page updated as the source of truth for the list

5. Workflows index
   - Ensure this workflow is listed in `./.windsurf/workflows/README.md` under slash commands and files

6. Commit
   - Commit changes with a clear message, e.g.: `docs: sync templates list with upstream`

## Handy commands (read-only)
- Search for template names:
  ```bash
  grep -R "shouldRespondTemplate\|messageHandlerTemplate\|postCreationTemplate\|imageDescriptionTemplate\|booleanFooter" -n packages/core/src
  ```
- Search for action templates and index:
  ```bash
  grep -R "replyTemplate\|imageGenerationTemplate" -n packages/plugin-bootstrap/src/actions
  grep -R "export const .*Action\|export \{ .* as .* \}" -n packages/plugin-bootstrap/src/actions
  ```
- Search for character templates and base character:
  ```bash
  grep -R "agentTemplates\|getElizaCharacter" -n packages/client/src packages/cli/src
  ```

## Success criteria
- Knowledge page `eliza_templates_complete_list.md` matches upstream accurately
- Workflows README lists `/templates_audit`
- Optional: Rules quick-reference includes new entries if allowed

## References

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