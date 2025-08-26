# Windsurf Workflows

This directory contains concise, actionable workflows for use in the Windsurf IDE.

## Slash commands
- `/development` → `./development.md`
- `/compose_state_development` → `./compose_state_development.md`
- `/scaffold_plugin` → `./scaffold_plugin.md`
- `/scaffold_project` → `./scaffold_project.md`
- `/scaffold_agent` → `./scaffold_agent.md`
- `/new_plugin_action` → `./new_plugin_action.md`
- `/verify_project` → `./verify_project.md`
- `/add_character_preset` → `./add_character_preset.md`
- `/database_setup` → `./database_setup.md`
- `/socket_io_setup` → `./socket_io_setup.md`
- `/elizaos_development` → `./elizaos_development.md`
- `/new_provider` → `./new_provider.md`
- `/new_evaluator` → `./new_evaluator.md`
- `/new_service` → `./new_service.md`
- `/validate_compliance` → `./validate_compliance.md`
- `/deploy_elizaos_app` → `./deploy_elizaos_app.md`
- `/supabase_database` → `./supabase_database.md`
- `/supabase_edge_functions` → `./supabase_edge_functions.md`
- `/supabase_advisors` → `./supabase_advisors.md`
 - `/community_management` → `./community_management.md`
 - `/platform_setup` → `./platform_setup.md`
 - `/roles_and_permissions` → `./roles_and_permissions.md`
 - `/room_controls` → `./room_controls.md`
 - `/templates_audit` → `./templates_audit.md`
 - `/extend_memory_system` → `./extend_memory_system.md`
 - `/generate_character` → `./generate_character.md`
 - `/create_knowledge_base` → `./create_knowledge_base.md`
 - `/create_database_service` → `./create_database_service.md`
 - `/create_conversation_template` → `./create_conversation_template.md`
 - `/update_message_examples` → `./update_message_examples.md`
 - `/create_edge_function` → `./create_edge_function.md`
 - `/create_community_management_plugin` → `./create_community_management_plugin.md`

## How to pass inputs
- Append space-separated `key=value` pairs after the slash command.
- Examples:
  - `/scaffold_plugin id=my-analytics featureFlag=hasAnalytics`
  - `/scaffold_project projectName=awesome-agent packageName=@acme/awesome-agent withTwitter=true`
  - `/scaffold_agent name=orion makeDefault=true plugins=xmcpx,project personalityPreset=mentor`
  - `/new_plugin_action id=my-analytics kind=action name=analyzeMetrics similes=analyze,metrics`
  - `/verify_project port=3000`
  - `/database_setup url=postgres://user:pass@localhost:5432/db sslmode=prefer`
  - `/socket_io_setup port=3001 path=/socket.io corsOrigin=http://localhost:3000`
  - `/new_provider pluginId=social-raids name=LeaderboardProvider`
  - `/new_evaluator pluginId=social-raids name=SpamScoreEvaluator`
  - `/new_service pluginId=social-raids name=CampaignService`
  - `/validate_compliance scope=src`
  - `/deploy_elizaos_app target=docker`
  - `/extend_memory_system extension_type=type name=KNOWLEDGE_SNIPPET`
  - `/generate_character username=@example`
  - `/create_knowledge_base docs_glob=docs/**/*.md tag=kb:v1`
  - `/create_database_service service_name=DatabaseService orm=drizzle`
  - `/create_conversation_template template_name=myTemplate`
  - `/update_message_examples character=nubi strategy=diversify`
  - `/create_edge_function platform=vercel name=analytics-endpoint`
  - `/create_community_management_plugin plugin_name=community-management with_db=true`

## Files
- Development: `./development.md`
- Compose State Development: `./compose_state_development.md`
- Twitter Integration: `./twitter.md`
- Scaffold Plugin: `./scaffold_plugin.md`
- Scaffold Project: `./scaffold_project.md`
- Scaffold Agent: `./scaffold_agent.md`
- New Plugin Action: `./new_plugin_action.md`
- Verify Project: `./verify_project.md`
- Add Character Preset: `./add_character_preset.md`
- Database Setup: `./database_setup.md`
- Socket.IO Setup: `./socket_io_setup.md`
- ElizaOS Development: `./elizaos_development.md`
- New Provider: `./new_provider.md`
- New Evaluator: `./new_evaluator.md`
- New Service: `./new_service.md`
- Validate Compliance: `./validate_compliance.md`
- Deploy ElizaOS App: `./deploy_elizaos_app.md`
- Supabase Database: `./supabase_database.md`
- Supabase Edge Functions: `./supabase_edge_functions.md`
- Supabase Advisors: `./supabase_advisors.md`
 - Community Management: `./community_management.md`
 - Platform Setup: `./platform_setup.md`
 - Roles and Permissions: `./roles_and_permissions.md`
 - Room Controls: `./room_controls.md`
 - Templates Audit: `./templates_audit.md`
 - Extend Memory System: `./extend_memory_system.md`
 - Generate Character: `./generate_character.md`
 - Create Knowledge Base: `./create_knowledge_base.md`
 - Create Database Service: `./create_database_service.md`
 - Create Conversation Template: `./create_conversation_template.md`
 - Update Message Examples: `./update_message_examples.md`
 - Create Edge Function: `./create_edge_function.md`
 - Create Community Management Plugin: `./create_community_management_plugin.md`
- For the full, detailed guide see: `../rules/elizaos_development_workflow.md`

## References
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
