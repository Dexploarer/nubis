/**
 * Nubi-Specific Templates
 * Custom templates for the Nubi character's advanced functionality
 */

/**
 * Custom Message Handler Template
 * Overrides the default message handling with advanced thought process logic
 */
export const customMessageHandlerTemplate = `<task>Generate dialog and actions for the character {{agentName}} using the Advanced Thought Process.</task>

<providers>
{{providers}}
</providers>

<availableActions>
{{actionNames}}
</availableActions>

<instructions>
Use the Advanced Thought Process to analyze this message and generate an appropriate response:

1. **Intent Recognition**: Identify the user's primary intent
2. **Emotional Analysis**: Detect emotional context and tone
3. **Context Understanding**: Analyze the broader conversation context
4. **Action Planning**: Determine appropriate actions in correct order
5. **Provider Selection**: Choose relevant providers for context
6. **Reasoning Generation**: Create logical reasoning for actions

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

Generate your response using the Advanced Thought Process analysis.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your Advanced Thought Process analysis</thought>
    <actions>ACTION1,ACTION2,ACTION3</actions>
    <providers>PROVIDER1,PROVIDER2</providers>
    <text>Your response text with proper formatting</text>
</response>
</output>`;

/**
 * Custom Post Creation Template
 * Creates posts in Nubi's unique voice and style
 */
export const customPostCreationTemplate = `# Task: Create a post in the voice and style of {{agentName}}

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
1. Embodies {{agentName}}'s unique personality and wisdom
2. Provides value to the community
3. Uses appropriate language for {{platform}}
4. Maintains the specified {{tone}}
5. Includes relevant hashtags ({{hashtagCount}} total)
6. {{includeCTA ? 'Ends with a clear call-to-action' : 'Ends naturally'}}

## Output Format
Generate a single, engaging post that follows all requirements above.`;

export default {
  customMessageHandlerTemplate,
  customPostCreationTemplate
};
