/**
 * ElizaOS Core Templates
 * Standard templates that align with elizaos core exports and functionality
 */
/**
 * Standard Message Handler Template
 * Default template for handling incoming messages across all platforms
 */
export declare const standardMessageHandlerTemplate = "<task>Generate dialog and actions for the character {{agentName}} based on the incoming message.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<availableActions>\n{{actionNames}}\n</availableActions>\n\n<instructions>\nAnalyze this message and generate an appropriate response:\n\n1. **Message Analysis**: Understand the user's intent and context\n2. **Action Planning**: Determine appropriate actions in correct order\n3. **Provider Selection**: Choose relevant providers for context\n4. **Response Generation**: Create a helpful and engaging response\n\nIMPORTANT RULES:\n- Actions execute in ORDER - REPLY should come FIRST\n- Use providers only when needed for accurate responses\n- Include ATTACHMENTS provider for visual content\n- Use ENTITIES provider for people/relationships\n- Use KNOWLEDGE provider for information requests\n- Use WORLD provider for community context\n\nCODE BLOCK FORMATTING:\n- Wrap code examples in ```language blocks\n- Use single backticks for inline code references\n- Ensure all code is properly formatted and copyable\n\nGenerate your response using the standard analysis process.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your analysis of the message</thought>\n    <actions>ACTION1,ACTION2,ACTION3</actions>\n    <providers>PROVIDER1,PROVIDER2</providers>\n    <text>Your response text with proper formatting</text>\n</response>\n</output>";
/**
 * Standard Post Creation Template
 * Default template for creating posts across all platforms
 */
export declare const standardPostCreationTemplate = "# Task: Create a post in the voice and style of {{agentName}}\n\n## Character Profile\n- **Name**: {{agentName}}\n- **Traits**: {{characterTraits}}\n- **Expertise**: {{expertiseAreas}}\n- **Writing Style**: {{writingStyle}}\n\n## Post Requirements\n- **Platform**: {{platform}}\n- **Tone**: {{tone}}\n- **Length**: {{length}}\n- **Hashtag Count**: {{hashtagCount}}\n- **Include CTA**: {{includeCTA}}\n\n## Style Guidelines\n{{styleGuidelines}}\n\n## Instructions\nCreate a post that:\n1. Embodies {{agentName}}'s unique personality and expertise\n2. Provides value to the community\n3. Uses appropriate language for {{platform}}\n4. Maintains the specified {{tone}}\n5. Includes relevant hashtags ({{hashtagCount}} total)\n6. {{includeCTA ? 'Ends with a clear call-to-action' : 'Ends naturally'}}\n\n## Output Format\nGenerate a single, engaging post that follows all requirements above.";
/**
 * Standard Knowledge Integration Template
 * Template for integrating knowledge from ElizaOS memory system
 */
export declare const knowledgeIntegrationTemplate = "<task>Integrate knowledge from ElizaOS memory system for {{agentName}}'s response.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nUse the ElizaOS knowledge system to enhance your response:\n\n1. **Knowledge Search**: Use FACTS provider to find relevant information\n2. **Context Integration**: Incorporate retrieved knowledge seamlessly\n3. **Source Attribution**: Reference knowledge sources when appropriate\n4. **Memory Enhancement**: Update memory with new insights\n\nKNOWLEDGE INTEGRATION RULES:\n- Always use FACTS provider for information requests\n- Combine retrieved facts with character personality\n- Maintain character voice while sharing knowledge\n- Update memory tables when appropriate\n- Use semantic search for best results\n\nGenerate a response that integrates knowledge effectively.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your knowledge integration analysis</thought>\n    <actions>KNOWLEDGE_SEARCH,INTEGRATE_FACTS,REPLY</actions>\n    <providers>FACTS,KNOWLEDGE</providers>\n    <text>Your response with integrated knowledge</text>\n</response>\n</output>";
/**
 * Standard Entity Management Template
 * Template for managing user and entity information
 */
export declare const entityManagementTemplate = "<task>Manage entity information for {{agentName}} using ElizaOS entity system.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nUse the ElizaOS entity system to manage user information:\n\n1. **Entity Lookup**: Use ENTITIES provider to find user information\n2. **Relationship Tracking**: Understand connections between entities\n3. **Context Building**: Build comprehensive user context\n4. **Memory Updates**: Update entity information as needed\n\nENTITY MANAGEMENT RULES:\n- Use ENTITIES provider for user context\n- Track relationships between users\n- Update entity facts when appropriate\n- Maintain privacy and security\n- Build comprehensive user profiles\n\nGenerate a response that leverages entity information effectively.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your entity management analysis</thought>\n    <actions>ENTITY_LOOKUP,BUILD_CONTEXT,REPLY</actions>\n    <providers>ENTITIES,CONTEXT</providers>\n    <text>Your response with entity context</text>\n</response>\n</output>";
/**
 * Standard World Context Template
 * Template for understanding broader community and environmental context
 */
export declare const worldContextTemplate = "<task>Understand world context for {{agentName}} using ElizaOS world system.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nUse the ElizaOS world system to understand broader context:\n\n1. **Community Analysis**: Use WORLD provider for community context\n2. **Environmental Understanding**: Grasp current community state\n3. **Trend Recognition**: Identify patterns and trends\n4. **Strategic Planning**: Plan responses based on world context\n\nWORLD CONTEXT RULES:\n- Use WORLD provider for community insights\n- Understand current community dynamics\n- Recognize patterns and trends\n- Plan strategic responses\n- Maintain community harmony\n\nGenerate a response that considers world context effectively.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your world context analysis</thought>\n    <actions>WORLD_ANALYSIS,STRATEGIC_PLANNING,REPLY</actions>\n    <providers>WORLD,CONTEXT</providers>\n    <text>Your response with world context</text>\n</response>\n</output>";
/**
 * Standard Database Integration Template
 * Template for integrating with external databases via MCP
 */
export declare const databaseIntegrationTemplate = "<task>Integrate with external database for {{agentName}} using MCP connection.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nUse the MCP connection to interact with external databases:\n\n1. **Database Connection**: Establish connection via MCP\n2. **Query Execution**: Execute appropriate database queries\n3. **Data Processing**: Process and format retrieved data\n4. **Response Integration**: Integrate data into response\n\nDATABASE INTEGRATION RULES:\n- Use MCP for database operations\n- Handle connection errors gracefully\n- Process data securely\n- Integrate results naturally\n- Maintain performance standards\n\nGenerate a response that leverages database information effectively.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your database integration analysis</thought>\n    <actions>DATABASE_QUERY,PROCESS_DATA,REPLY</actions>\n    <providers>MCP,DATABASE</providers>\n    <text>Your response with database integration</text>\n</response>\n</output>";
/**
 * Standard Platform Integration Template
 * Template for platform-specific functionality
 */
export declare const platformIntegrationTemplate = "<task>Handle platform-specific functionality for {{agentName}} on {{platform}}.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nHandle platform-specific requirements and functionality:\n\n1. **Platform Rules**: Follow platform-specific guidelines\n2. **Feature Usage**: Use platform-appropriate features\n3. **Format Compliance**: Ensure proper formatting\n4. **Integration**: Integrate with platform APIs\n\nPLATFORM INTEGRATION RULES:\n- Follow platform-specific guidelines\n- Use appropriate features and formats\n- Handle platform limitations gracefully\n- Maintain consistent experience\n- Respect platform policies\n\nGenerate a response that works effectively on the specified platform.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your platform integration analysis</thought>\n    <actions>PLATFORM_SPECIFIC,FORMAT_RESPONSE,REPLY</actions>\n    <providers>PLATFORM,FEATURES</providers>\n    <text>Your platform-appropriate response</text>\n</response>\n</output>";
/**
 * Standard Error Handling Template
 * Template for handling errors and edge cases
 */
export declare const errorHandlingTemplate = "<task>Handle error or edge case for {{agentName}} gracefully.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nHandle errors and edge cases gracefully:\n\n1. **Error Analysis**: Understand what went wrong\n2. **User Communication**: Explain the issue clearly\n3. **Alternative Solutions**: Provide helpful alternatives\n4. **Recovery Steps**: Guide user toward resolution\n\nERROR HANDLING RULES:\n- Be clear about what happened\n- Provide helpful alternatives\n- Maintain character personality\n- Guide user toward resolution\n- Log errors appropriately\n\nGenerate a helpful response that handles the error gracefully.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your error handling analysis</thought>\n    <actions>ERROR_ANALYSIS,PROVIDE_ALTERNATIVES,REPLY</actions>\n    <providers>ERROR_CONTEXT,HELP</providers>\n    <text>Your helpful error response</text>\n</response>\n</output>";
/**
 * Standard Learning and Adaptation Template
 * Template for learning from interactions and adapting responses
 */
export declare const learningAdaptationTemplate = "<task>Learn from interaction and adapt {{agentName}}'s responses.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nLearn from the current interaction and adapt responses:\n\n1. **Pattern Recognition**: Identify learning opportunities\n2. **Response Adaptation**: Adjust response style as needed\n3. **Memory Updates**: Update relevant memory tables\n4. **Continuous Improvement**: Apply learned patterns\n\nLEARNING AND ADAPTATION RULES:\n- Recognize patterns in interactions\n- Adapt response style appropriately\n- Update memory with new insights\n- Apply learned patterns consistently\n- Maintain character consistency\n\nGenerate a response that demonstrates learning and adaptation.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your learning and adaptation analysis</thought>\n    <actions>PATTERN_RECOGNITION,ADAPT_RESPONSE,REPLY</actions>\n    <providers>LEARNING,MEMORY</providers>\n    <text>Your adapted response</text>\n</response>\n</output>";
declare const _default: {
    standardMessageHandlerTemplate: string;
    standardPostCreationTemplate: string;
    knowledgeIntegrationTemplate: string;
    entityManagementTemplate: string;
    worldContextTemplate: string;
    databaseIntegrationTemplate: string;
    platformIntegrationTemplate: string;
    errorHandlingTemplate: string;
    learningAdaptationTemplate: string;
};
export default _default;
