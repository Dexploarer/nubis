/**
 * Platform-Specific Templates
 * Templates for different platforms that elizaos supports
 */

/**
 * Discord Platform Template
 * Template for Discord-specific functionality and behavior
 */
export const discordPlatformTemplate = `<task>Handle Discord-specific functionality for {{agentName}}.</task>

<providers>
{{providers}}
</providers>

<instructions>
Handle Discord-specific requirements and functionality:

1. **Mention Handling**: Only respond when @ mentioned
2. **Channel Management**: Respect channel types and permissions
3. **Role-Based Access**: Follow role-based response rules
4. **Discord Features**: Use Discord-appropriate features

DISCORD PLATFORM RULES:
- ONLY respond when @ mentioned (@{{agentName}}, @{{agentUsername}})
- In DMs, respond without @ mention requirement
- Never respond to messages from other bots
- Never respond to own messages
- Respect response cooldowns
- Use appropriate Discord formatting
- Follow channel permissions

Generate a Discord-appropriate response following all platform rules.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your Discord platform analysis</thought>
    <actions>DISCORD_VALIDATION,FORMAT_RESPONSE,REPLY</actions>
    <providers>DISCORD,PLATFORM</providers>
    <text>Your Discord-formatted response</text>
</response>
</output>`;

/**
 * Telegram Platform Template
 * Template for Telegram-specific functionality and behavior
 */
export const telegramPlatformTemplate = `<task>Handle Telegram-specific functionality for {{agentName}}.</task>

<providers>
{{providers}}
</providers>

<instructions>
Handle Telegram-specific requirements and functionality:

1. **Bot Commands**: Handle /start, /help, and custom commands
2. **Message Types**: Support text, photo, document, and other message types
3. **Inline Keyboards**: Use inline keyboards for interactive responses
4. **Group Management**: Handle group chat dynamics appropriately

TELEGRAM PLATFORM RULES:
- Respond to all messages (no @ mention requirement)
- Handle bot commands appropriately
- Use inline keyboards for interactive responses
- Support various message types
- Respect group chat dynamics
- Use appropriate Telegram formatting

Generate a Telegram-appropriate response following all platform rules.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your Telegram platform analysis</thought>
    <actions>TELEGRAM_VALIDATION,FORMAT_RESPONSE,REPLY</actions>
    <providers>TELEGRAM,PLATFORM</providers>
    <text>Your Telegram-formatted response</text>
</response>
</output>`;

/**
 * Twitter/X Platform Template
 * Template for Twitter/X-specific functionality and behavior
 */
export const twitterPlatformTemplate = `<task>Handle Twitter/X-specific functionality for {{agentName}}.</task>

<providers>
{{providers}}
</providers>

<instructions>
Handle Twitter/X-specific requirements and functionality:

1. **Tweet Creation**: Create engaging tweets within character limits
2. **Hashtag Usage**: Use relevant and trending hashtags
3. **Mention Handling**: Handle @ mentions and replies appropriately
4. **Content Types**: Support text, images, and other content types

TWITTER/X PLATFORM RULES:
- Respect character limits (280 characters for tweets)
- Use relevant hashtags strategically
- Handle @ mentions appropriately
- Create engaging, shareable content
- Follow Twitter community guidelines
- Use appropriate Twitter formatting

Generate a Twitter/X-appropriate response following all platform rules.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your Twitter/X platform analysis</thought>
    <actions>TWITTER_VALIDATION,FORMAT_RESPONSE,REPLY</actions>
    <providers>TWITTER,PLATFORM</providers>
    <text>Your Twitter/X-formatted response</text>
</response>
</output>`;

/**
 * Web Platform Template
 * Template for web-based interactions and browser functionality
 */
export const webPlatformTemplate = `<task>Handle web-based functionality for {{agentName}}.</task>

<providers>
{{providers}}
</providers>

<instructions>
Handle web-based requirements and functionality:

1. **Browser Integration**: Use browser capabilities appropriately
2. **Web Search**: Perform web searches when needed
3. **Content Analysis**: Analyze web content and pages
4. **Web Automation**: Handle web-based automation tasks

WEB PLATFORM RULES:
- Use browser capabilities appropriately
- Perform web searches when needed
- Analyze web content effectively
- Handle web automation tasks
- Respect web security policies
- Use appropriate web formatting

Generate a web-appropriate response following all platform rules.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your web platform analysis</thought>
    <actions>WEB_VALIDATION,FORMAT_RESPONSE,REPLY</actions>
    <providers>WEB,BROWSER</providers>
    <text>Your web-formatted response</text>
</response>
</output>`;

/**
 * API Integration Template
 * Template for integrating with external APIs and services
 */
export const apiIntegrationTemplate = `<task>Integrate with external APIs for {{agentName}}.</task>

<providers>
{{providers}}
</providers>

<instructions>
Integrate with external APIs and services:

1. **API Authentication**: Handle API keys and authentication
2. **Request Management**: Make appropriate API requests
3. **Response Processing**: Process and format API responses
4. **Error Handling**: Handle API errors gracefully

API INTEGRATION RULES:
- Handle authentication securely
- Make appropriate API requests
- Process responses effectively
- Handle errors gracefully
- Respect rate limits
- Maintain security standards

Generate a response that leverages API integration effectively.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your API integration analysis</thought>
    <actions>API_AUTHENTICATION,MAKE_REQUEST,PROCESS_RESPONSE,REPLY</actions>
    <providers>API,EXTERNAL_SERVICES</providers>
    <text>Your response with API integration</text>
</response>
</output>`;

/**
 * File Management Template
 * Template for handling file operations and storage
 */
export const fileManagementTemplate = `<task>Handle file operations for {{agentName}}.</task>

<providers>
{{providers}}
</providers>

<instructions>
Handle file operations and storage:

1. **File Reading**: Read and analyze file contents
2. **File Writing**: Create and modify files as needed
3. **File Storage**: Manage file storage and organization
4. **File Security**: Ensure proper file security measures

FILE MANAGEMENT RULES:
- Handle files securely
- Respect file permissions
- Organize files logically
- Maintain file integrity
- Follow security best practices
- Handle errors gracefully

Generate a response that handles file operations effectively.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your file management analysis</thought>
    <actions>FILE_OPERATION,PROCESS_CONTENT,REPLY</actions>
    <providers>FILE_SYSTEM,STORAGE</providers>
    <text>Your response with file operations</text>
</response>
</output>`;

/**
 * Multi-Platform Template
 * Template for handling interactions across multiple platforms
 */
export const multiPlatformTemplate = `<task>Handle multi-platform functionality for {{agentName}}.</task>

<providers>
{{providers}}
</providers>

<instructions>
Handle functionality across multiple platforms:

1. **Platform Detection**: Identify the current platform
2. **Platform-Specific Logic**: Apply appropriate platform rules
3. **Cross-Platform Consistency**: Maintain consistent experience
4. **Platform Optimization**: Optimize for each platform

MULTI-PLATFORM RULES:
- Detect platform automatically
- Apply platform-specific rules
- Maintain consistent experience
- Optimize for each platform
- Handle platform differences gracefully
- Respect platform limitations

Generate a response that works effectively across platforms.
</instructions>

<output>
Respond using XML format:
<response>
    <thought>Your multi-platform analysis</thought>
    <actions>PLATFORM_DETECTION,PLATFORM_OPTIMIZATION,REPLY</actions>
    <providers>MULTI_PLATFORM,PLATFORM_DETECTION</providers>
    <text>Your multi-platform response</text>
</response>
</output>`;

export default {
  discordPlatformTemplate,
  telegramPlatformTemplate,
  twitterPlatformTemplate,
  webPlatformTemplate,
  apiIntegrationTemplate,
  fileManagementTemplate,
  multiPlatformTemplate
};
