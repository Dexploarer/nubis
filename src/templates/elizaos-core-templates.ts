/**
 * ElizaOS Core Templates
 * Standard templates that align with elizaos core exports and functionality
 */

/**
 * Standard Message Handler Template
 * Default template for handling incoming messages across all platforms
 */
export const standardMessageHandlerTemplate = `<task>Generate dialog and actions for the character {{agentName}} based on the incoming message.</task>

<providers>
{{providers}}
</providers>

<availableActions>
{{actionNames}}
</availableActions>

<instructions>
Analyze this message and generate an appropriate response:

1. **Message Analysis**: Understand the user's intent and context
2. **Action Planning**: Determine appropriate actions in correct order
3. **Provider Selection**: Choose relevant providers for context
4. **Response Generation**: Create a helpful and engaging response

IMPORTANT RULES:
- Actions execute in ORDER - REPLY should come FIRST
- Use providers only when needed for accurate responses
- Include ATTACHMENTS provider for visual content
- Use ENTITIES provider for people/relationships
- Use KNOWLEDGE provider for information requests
- Use WORLD provider for community context

CODE BLOCK FORMATTING:
- Wrap code examples in \`\`\`language blocks
- Use single backticks for inline code references
- Ensure all code is properly formatted and copyable

Generate your response using the standard analysis process.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your analysis of the message</thought>
    <actions>ACTION1,ACTION2,ACTION3</actions>
    <providers>PROVIDER1,PROVIDER2</providers>
    <text>Your response text with proper formatting</text>
</response>
</output>`;

/**
 * Standard Post Creation Template
 * Default template for creating posts across all platforms
 */
export const standardPostCreationTemplate = `# Task: Create a post in the voice and style of {{agentName}}

## Character Profile
- **Name**: {{agentName}}
- **Traits**: {{characterTraits}}
- **Expertise**: {{expertiseAreas}}
- **Writing Style**: {{writingStyle}}

## Post Requirements
- **Platform**: {{platform}}
- **Tone**: {{tone}}
- **Length**: {{length}}
- **Hashtag Count**: {{hashtagCount}}
- **Include CTA**: {{includeCTA}}

## Style Guidelines
{{styleGuidelines}}

## Instructions
Create a post that:
1. Embodies {{agentName}}'s unique personality and expertise
2. Provides value to the community
3. Uses appropriate language for {{platform}}
4. Maintains the specified {{tone}}
5. Includes relevant hashtags ({{hashtagCount}} total)
6. {{includeCTA ? 'Ends with a clear call-to-action' : 'Ends naturally'}}

## Output Format
Generate a single, engaging post that follows all requirements above.`;

/**
 * Standard Knowledge Integration Template
 * Template for integrating knowledge from ElizaOS memory system
 */
export const knowledgeIntegrationTemplate = `<task>Integrate knowledge from ElizaOS memory system for {{agentName}}'s response.</task>

<providers>
{{providers}}
</providers>

<instructions>
Use the ElizaOS knowledge system to enhance your response:

1. **Knowledge Search**: Use FACTS provider to find relevant information
2. **Context Integration**: Incorporate retrieved knowledge seamlessly
3. **Source Attribution**: Reference knowledge sources when appropriate
4. **Memory Enhancement**: Update memory with new insights

KNOWLEDGE INTEGRATION RULES:
- Always use FACTS provider for information requests
- Combine retrieved facts with character personality
- Maintain character voice while sharing knowledge
- Update memory tables when appropriate
- Use semantic search for best results

Generate a response that integrates knowledge effectively.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your knowledge integration analysis</thought>
    <actions>KNOWLEDGE_SEARCH,INTEGRATE_FACTS,REPLY</actions>
    <providers>FACTS,KNOWLEDGE</providers>
    <text>Your response with integrated knowledge</text>
</response>
</output>`;

/**
 * Standard Entity Management Template
 * Template for managing user and entity information
 */
export const entityManagementTemplate = `<task>Manage entity information for {{agentName}} using ElizaOS entity system.</task>

<providers>
{{providers}}
</providers>

<instructions>
Use the ElizaOS entity system to manage user information:

1. **Entity Lookup**: Use ENTITIES provider to find user information
2. **Relationship Tracking**: Understand connections between entities
3. **Context Building**: Build comprehensive user context
4. **Memory Updates**: Update entity information as needed

ENTITY MANAGEMENT RULES:
- Use ENTITIES provider for user context
- Track relationships between users
- Update entity facts when appropriate
- Maintain privacy and security
- Build comprehensive user profiles

Generate a response that leverages entity information effectively.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your entity management analysis</thought>
    <actions>ENTITY_LOOKUP,BUILD_CONTEXT,REPLY</actions>
    <providers>ENTITIES,CONTEXT</providers>
    <text>Your response with entity context</text>
</response>
</output>`;

/**
 * Standard World Context Template
 * Template for understanding broader community and environmental context
 */
export const worldContextTemplate = `<task>Understand world context for {{agentName}} using ElizaOS world system.</task>

<providers>
{{providers}}
</providers>

<instructions>
Use the ElizaOS world system to understand broader context:

1. **Community Analysis**: Use WORLD provider for community context
2. **Environmental Understanding**: Grasp current community state
3. **Trend Recognition**: Identify patterns and trends
4. **Strategic Planning**: Plan responses based on world context

WORLD CONTEXT RULES:
- Use WORLD provider for community insights
- Understand current community dynamics
- Recognize patterns and trends
- Plan strategic responses
- Maintain community harmony

Generate a response that considers world context effectively.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your world context analysis</thought>
    <actions>WORLD_ANALYSIS,STRATEGIC_PLANNING,REPLY</actions>
    <providers>WORLD,CONTEXT</providers>
    <text>Your response with world context</text>
</response>
</output>`;

/**
 * Standard Database Integration Template
 * Template for integrating with external databases via MCP
 */
export const databaseIntegrationTemplate = `<task>Integrate with external database for {{agentName}} using MCP connection.</task>

<providers>
{{providers}}
</providers>

<instructions>
Use the MCP connection to interact with external databases:

1. **Database Connection**: Establish connection via MCP
2. **Query Execution**: Execute appropriate database queries
3. **Data Processing**: Process and format retrieved data
4. **Response Integration**: Integrate data into response

DATABASE INTEGRATION RULES:
- Use MCP for database operations
- Handle connection errors gracefully
- Process data securely
- Integrate results naturally
- Maintain performance standards

Generate a response that leverages database information effectively.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your database integration analysis</thought>
    <actions>DATABASE_QUERY,PROCESS_DATA,REPLY</actions>
    <providers>MCP,DATABASE</providers>
    <text>Your response with database integration</text>
</response>
</output>`;

/**
 * Standard Platform Integration Template
 * Template for platform-specific functionality
 */
export const platformIntegrationTemplate = `<task>Handle platform-specific functionality for {{agentName}} on {{platform}}.</task>

<providers>
{{providers}}
</providers>

<instructions>
Handle platform-specific requirements and functionality:

1. **Platform Rules**: Follow platform-specific guidelines
2. **Feature Usage**: Use platform-appropriate features
3. **Format Compliance**: Ensure proper formatting
4. **Integration**: Integrate with platform APIs

PLATFORM INTEGRATION RULES:
- Follow platform-specific guidelines
- Use appropriate features and formats
- Handle platform limitations gracefully
- Maintain consistent experience
- Respect platform policies

Generate a response that works effectively on the specified platform.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your platform integration analysis</thought>
    <actions>PLATFORM_SPECIFIC,FORMAT_RESPONSE,REPLY</actions>
    <providers>PLATFORM,FEATURES</providers>
    <text>Your platform-appropriate response</text>
</response>
</output>`;

/**
 * Standard Error Handling Template
 * Template for handling errors and edge cases
 */
export const errorHandlingTemplate = `<task>Handle error or edge case for {{agentName}} gracefully.</task>

<providers>
{{providers}}
</providers>

<instructions>
Handle errors and edge cases gracefully:

1. **Error Analysis**: Understand what went wrong
2. **User Communication**: Explain the issue clearly
3. **Alternative Solutions**: Provide helpful alternatives
4. **Recovery Steps**: Guide user toward resolution

ERROR HANDLING RULES:
- Be clear about what happened
- Provide helpful alternatives
- Maintain character personality
- Guide user toward resolution
- Log errors appropriately

Generate a helpful response that handles the error gracefully.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your error handling analysis</thought>
    <actions>ERROR_ANALYSIS,PROVIDE_ALTERNATIVES,REPLY</actions>
    <providers>ERROR_CONTEXT,HELP</providers>
    <text>Your helpful error response</text>
</response>
</output>`;

/**
 * Standard Learning and Adaptation Template
 * Template for learning from interactions and adapting responses
 */
export const learningAdaptationTemplate = `<task>Learn from interaction and adapt {{agentName}}'s responses.</task>

<providers>
{{providers}}
</providers>

<instructions>
Learn from the current interaction and adapt responses:

1. **Pattern Recognition**: Identify learning opportunities
2. **Response Adaptation**: Adjust response style as needed
3. **Memory Updates**: Update relevant memory tables
4. **Continuous Improvement**: Apply learned patterns

LEARNING AND ADAPTATION RULES:
- Recognize patterns in interactions
- Adapt response style appropriately
- Update memory with new insights
- Apply learned patterns consistently
- Maintain character consistency

Generate a response that demonstrates learning and adaptation.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your learning and adaptation analysis</thought>
    <actions>PATTERN_RECOGNITION,ADAPT_RESPONSE,REPLY</actions>
    <providers>LEARNING,MEMORY</providers>
    <text>Your adapted response</text>
</response>
</output>`;

export default {
  standardMessageHandlerTemplate,
  standardPostCreationTemplate,
  knowledgeIntegrationTemplate,
  entityManagementTemplate,
  worldContextTemplate,
  databaseIntegrationTemplate,
  platformIntegrationTemplate,
  errorHandlingTemplate,
  learningAdaptationTemplate
};
