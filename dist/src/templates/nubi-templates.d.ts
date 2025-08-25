/**
 * Nubi-Specific Templates
 * Custom templates for the Nubi character's advanced functionality
 */
/**
 * Custom Message Handler Template
 * Overrides the default message handling with advanced thought process logic
 */
export declare const customMessageHandlerTemplate = "<task>Generate dialog and actions for the character {{agentName}} using the Advanced Thought Process.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<availableActions>\n{{actionNames}}\n</availableActions>\n\n<instructions>\nUse the Advanced Thought Process to analyze this message and generate an appropriate response:\n\n1. **Intent Recognition**: Identify the user's primary intent\n2. **Emotional Analysis**: Detect emotional context and tone\n3. **Context Understanding**: Analyze the broader conversation context\n4. **Action Planning**: Determine appropriate actions in correct order\n5. **Provider Selection**: Choose relevant providers for context\n6. **Reasoning Generation**: Create logical reasoning for actions\n\nIMPORTANT RULES:\n- Actions execute in ORDER - REPLY should come FIRST\n- Use providers only when needed for accurate responses\n- Include ATTACHMENTS provider for visual content\n- Use ENTITIES provider for people/relationships\n- Use KNOWLEDGE provider for information requests\n- Use WORLD provider for community context\n\nCODE BLOCK FORMATTING:\n- Wrap code examples in ```language blocks\n- Use single backticks for inline code references\n- Ensure all code is properly formatted and copyable\n\nGenerate your response using the Advanced Thought Process analysis.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your Advanced Thought Process analysis</thought>\n    <actions>ACTION1,ACTION2,ACTION3</actions>\n    <providers>PROVIDER1,PROVIDER2</providers>\n    <text>Your response text with proper formatting</text>\n</response>\n</output>";
/**
 * Custom Post Creation Template
 * Creates posts in Nubi's unique voice and style
 */
export declare const customPostCreationTemplate = "# Task: Create a post in the voice and style of {{agentName}}\n\n## Character Profile\n- **Name**: {{agentName}}\n- **Traits**: {{characterTraits}}\n- **Expertise**: {{expertiseAreas}}\n- **Writing Style**: {{writingStyle}}\n\n## Post Requirements\n- **Platform**: {{platform}}\n- **Tone**: {{tone}}\n- **Length**: {{length}}\n- **Hashtag Count**: {{hashtagCount}}\n- **Include CTA**: {{includeCTA}}\n\n## Style Guidelines\n{{styleGuidelines}}\n\n## Instructions\nCreate a post that:\n1. Embodies {{agentName}}'s unique personality and wisdom\n2. Provides value to the community\n3. Uses appropriate language for {{platform}}\n4. Maintains the specified {{tone}}\n5. Includes relevant hashtags ({{hashtagCount}} total)\n6. {{includeCTA ? 'Ends with a clear call-to-action' : 'Ends naturally'}}\n\n## Output Format\nGenerate a single, engaging post that follows all requirements above.";
declare const _default: {
    customMessageHandlerTemplate: string;
    customPostCreationTemplate: string;
};
export default _default;
