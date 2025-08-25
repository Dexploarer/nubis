/**
 * Platform-Specific Templates
 * Templates for different platforms that elizaos supports
 */
/**
 * Discord Platform Template
 * Template for Discord-specific functionality and behavior
 */
export declare const discordPlatformTemplate = "<task>Handle Discord-specific functionality for {{agentName}}.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nHandle Discord-specific requirements and functionality:\n\n1. **Mention Handling**: Only respond when @ mentioned\n2. **Channel Management**: Respect channel types and permissions\n3. **Role-Based Access**: Follow role-based response rules\n4. **Discord Features**: Use Discord-appropriate features\n\nDISCORD PLATFORM RULES:\n- ONLY respond when @ mentioned (@{{agentName}}, @{{agentUsername}})\n- In DMs, respond without @ mention requirement\n- Never respond to messages from other bots\n- Never respond to own messages\n- Respect response cooldowns\n- Use appropriate Discord formatting\n- Follow channel permissions\n\nGenerate a Discord-appropriate response following all platform rules.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your Discord platform analysis</thought>\n    <actions>DISCORD_VALIDATION,FORMAT_RESPONSE,REPLY</actions>\n    <providers>DISCORD,PLATFORM</providers>\n    <text>Your Discord-formatted response</text>\n</response>\n</output>";
/**
 * Telegram Platform Template
 * Template for Telegram-specific functionality and behavior
 */
export declare const telegramPlatformTemplate = "<task>Handle Telegram-specific functionality for {{agentName}}.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nHandle Telegram-specific requirements and functionality:\n\n1. **Bot Commands**: Handle /start, /help, and custom commands\n2. **Message Types**: Support text, photo, document, and other message types\n3. **Inline Keyboards**: Use inline keyboards for interactive responses\n4. **Group Management**: Handle group chat dynamics appropriately\n\nTELEGRAM PLATFORM RULES:\n- Respond to all messages (no @ mention requirement)\n- Handle bot commands appropriately\n- Use inline keyboards for interactive responses\n- Support various message types\n- Respect group chat dynamics\n- Use appropriate Telegram formatting\n\nGenerate a Telegram-appropriate response following all platform rules.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your Telegram platform analysis</thought>\n    <actions>TELEGRAM_VALIDATION,FORMAT_RESPONSE,REPLY</actions>\n    <providers>TELEGRAM,PLATFORM</providers>\n    <text>Your Telegram-formatted response</text>\n</response>\n</output>";
/**
 * Twitter/X Platform Template
 * Template for Twitter/X-specific functionality and behavior
 */
export declare const twitterPlatformTemplate = "<task>Handle Twitter/X-specific functionality for {{agentName}}.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nHandle Twitter/X-specific requirements and functionality:\n\n1. **Tweet Creation**: Create engaging tweets within character limits\n2. **Hashtag Usage**: Use relevant and trending hashtags\n3. **Mention Handling**: Handle @ mentions and replies appropriately\n4. **Content Types**: Support text, images, and other content types\n\nTWITTER/X PLATFORM RULES:\n- Respect character limits (280 characters for tweets)\n- Use relevant hashtags strategically\n- Handle @ mentions appropriately\n- Create engaging, shareable content\n- Follow Twitter community guidelines\n- Use appropriate Twitter formatting\n\nGenerate a Twitter/X-appropriate response following all platform rules.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your Twitter/X platform analysis</thought>\n    <actions>TWITTER_VALIDATION,FORMAT_RESPONSE,REPLY</actions>\n    <providers>TWITTER,PLATFORM</providers>\n    <text>Your Twitter/X-formatted response</text>\n</response>\n</output>";
/**
 * Web Platform Template
 * Template for web-based interactions and browser functionality
 */
export declare const webPlatformTemplate = "<task>Handle web-based functionality for {{agentName}}.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nHandle web-based requirements and functionality:\n\n1. **Browser Integration**: Use browser capabilities appropriately\n2. **Web Search**: Perform web searches when needed\n3. **Content Analysis**: Analyze web content and pages\n4. **Web Automation**: Handle web-based automation tasks\n\nWEB PLATFORM RULES:\n- Use browser capabilities appropriately\n- Perform web searches when needed\n- Analyze web content effectively\n- Handle web automation tasks\n- Respect web security policies\n- Use appropriate web formatting\n\nGenerate a web-appropriate response following all platform rules.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your web platform analysis</thought>\n    <actions>WEB_VALIDATION,FORMAT_RESPONSE,REPLY</actions>\n    <providers>WEB,BROWSER</providers>\n    <text>Your web-formatted response</text>\n</response>\n</output>";
/**
 * API Integration Template
 * Template for integrating with external APIs and services
 */
export declare const apiIntegrationTemplate = "<task>Integrate with external APIs for {{agentName}}.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nIntegrate with external APIs and services:\n\n1. **API Authentication**: Handle API keys and authentication\n2. **Request Management**: Make appropriate API requests\n3. **Response Processing**: Process and format API responses\n4. **Error Handling**: Handle API errors gracefully\n\nAPI INTEGRATION RULES:\n- Handle authentication securely\n- Make appropriate API requests\n- Process responses effectively\n- Handle errors gracefully\n- Respect rate limits\n- Maintain security standards\n\nGenerate a response that leverages API integration effectively.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your API integration analysis</thought>\n    <actions>API_AUTHENTICATION,MAKE_REQUEST,PROCESS_RESPONSE,REPLY</actions>\n    <providers>API,EXTERNAL_SERVICES</providers>\n    <text>Your response with API integration</text>\n</response>\n</output>";
/**
 * File Management Template
 * Template for handling file operations and storage
 */
export declare const fileManagementTemplate = "<task>Handle file operations for {{agentName}}.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nHandle file operations and storage:\n\n1. **File Reading**: Read and analyze file contents\n2. **File Writing**: Create and modify files as needed\n3. **File Storage**: Manage file storage and organization\n4. **File Security**: Ensure proper file security measures\n\nFILE MANAGEMENT RULES:\n- Handle files securely\n- Respect file permissions\n- Organize files logically\n- Maintain file integrity\n- Follow security best practices\n- Handle errors gracefully\n\nGenerate a response that handles file operations effectively.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your file management analysis</thought>\n    <actions>FILE_OPERATION,PROCESS_CONTENT,REPLY</actions>\n    <providers>FILE_SYSTEM,STORAGE</providers>\n    <text>Your response with file operations</text>\n</response>\n</output>";
/**
 * Multi-Platform Template
 * Template for handling interactions across multiple platforms
 */
export declare const multiPlatformTemplate = "<task>Handle multi-platform functionality for {{agentName}}.</task>\n\n<providers>\n{{providers}}\n</providers>\n\n<instructions>\nHandle functionality across multiple platforms:\n\n1. **Platform Detection**: Identify the current platform\n2. **Platform-Specific Logic**: Apply appropriate platform rules\n3. **Cross-Platform Consistency**: Maintain consistent experience\n4. **Platform Optimization**: Optimize for each platform\n\nMULTI-PLATFORM RULES:\n- Detect platform automatically\n- Apply platform-specific rules\n- Maintain consistent experience\n- Optimize for each platform\n- Handle platform differences gracefully\n- Respect platform limitations\n\nGenerate a response that works effectively across platforms.\n</instructions>\n\n<output>\nRespond using XML format:\n<response>\n    <thought>Your multi-platform analysis</thought>\n    <actions>PLATFORM_DETECTION,PLATFORM_OPTIMIZATION,REPLY</actions>\n    <providers>MULTI_PLATFORM,PLATFORM_DETECTION</providers>\n    <text>Your multi-platform response</text>\n</response>\n</output>";
declare const _default: {
    discordPlatformTemplate: string;
    telegramPlatformTemplate: string;
    twitterPlatformTemplate: string;
    webPlatformTemplate: string;
    apiIntegrationTemplate: string;
    fileManagementTemplate: string;
    multiPlatformTemplate: string;
};
export default _default;
