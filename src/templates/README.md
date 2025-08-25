# ElizaOS Templates

This directory contains comprehensive templates for the ElizaOS project, providing standardized patterns for various types of interactions and functionality.

## Template Structure

All templates follow a consistent structure with the following sections:

- **`<task>`**: Clear description of what the template should accomplish
- **`<providers>`**: Available data providers and context sources
- **`<instructions>`**: Step-by-step instructions for using the template
- **`<output>`**: Expected output format and structure

## Template Categories

### 1. Core Templates (`elizaos-core-templates.ts`)

Standard templates that align with elizaos core exports and functionality:

- **`standardMessageHandlerTemplate`**: Default template for handling incoming messages
- **`standardPostCreationTemplate`**: Default template for creating posts
- **`knowledgeIntegrationTemplate`**: Template for integrating knowledge from ElizaOS memory system
- **`entityManagementTemplate`**: Template for managing user and entity information
- **`worldContextTemplate`**: Template for understanding broader community context
- **`databaseIntegrationTemplate`**: Template for integrating with external databases via MCP
- **`platformIntegrationTemplate`**: Template for platform-specific functionality
- **`errorHandlingTemplate`**: Template for handling errors and edge cases
- **`learningAdaptationTemplate`**: Template for learning from interactions and adapting responses

### 2. Platform Templates (`platform-templates.ts`)

Templates for different platforms that elizaos supports:

- **`discordPlatformTemplate`**: Discord-specific functionality and behavior
- **`telegramPlatformTemplate`**: Telegram-specific functionality and behavior
- **`twitterPlatformTemplate`**: Twitter/X-specific functionality and behavior
- **`webPlatformTemplate`**: Web-based interactions and browser functionality
- **`apiIntegrationTemplate`**: Integration with external APIs and services
- **`fileManagementTemplate`**: File operations and storage
- **`multiPlatformTemplate`**: Functionality across multiple platforms

### 3. Use Case Templates (`use-case-templates.ts`)

Templates for specific use cases and scenarios:

- **`communityManagementTemplate`**: Community management tasks and interactions
- **`contentCreationTemplate`**: Creating various types of content
- **`dataAnalysisTemplate`**: Analyzing data and providing insights
- **`problemSolvingTemplate`**: Solving problems and providing solutions
- **`learningEducationTemplate`**: Educational interactions and knowledge sharing
- **`creativeWritingTemplate`**: Creative writing and storytelling
- **`technicalSupportTemplate`**: Technical support and assistance
- **`strategicPlanningTemplate`**: Strategic planning and long-term thinking

### 4. Custom Templates (`nubi-templates.ts`)

Custom templates for specific characters:

- **`customMessageHandlerTemplate`**: Advanced message handling for Nubi character
- **`customPostCreationTemplate`**: Custom post creation for Nubi character

## Usage Examples

### Basic Template Usage

```typescript
import { standardMessageHandlerTemplate } from './elizaos-core-templates';
import { renderTemplate } from './template-utils';

// Render a template with variables
const renderedTemplate = renderTemplate(standardMessageHandlerTemplate, {
  agentName: 'MyAgent',
  providers: 'FACTS,ENTITIES,KNOWLEDGE',
  actionNames: 'REPLY,ANALYZE,PROVIDE_GUIDANCE'
});

console.log(renderedTemplate);
```

### Template Customization

```typescript
import { customizeTemplate } from './template-utils';

const customizedTemplate = customizeTemplate(
  standardMessageHandlerTemplate,
  {
    agentName: 'CustomAgent',
    platform: 'discord'
  },
  'Additional custom instructions for this specific use case'
);
```

### Template Validation

```typescript
import { validateTemplate } from './template-utils';

const validation = validateTemplate(myTemplate);
if (validation.isValid) {
  console.log('Template is valid');
} else {
  console.log('Template errors:', validation.errors);
  console.log('Template warnings:', validation.warnings);
}
```

### Creating Templates from Characters

```typescript
import { createTemplateFromCharacter } from './template-utils';
import { getExampleAgent } from '../characters/example-agent';

const character = getExampleAgent();
const messageTemplate = createTemplateFromCharacter(character, 'messageHandler');
```

## Template Variables

Templates use the following standard variables:

- **`{{agentName}}`**: The name of the agent/character
- **`{{agentUsername}}`**: The username of the agent/character
- **`{{characterTraits}}`**: Character personality traits
- **`{{expertiseAreas}}`**: Areas of expertise
- **`{{writingStyle}}`**: Writing style guidelines
- **`{{platform}}`**: Target platform (discord, telegram, twitter, etc.)
- **`{{tone}}`**: Desired tone (friendly, professional, etc.)
- **`{{length}}`**: Content length requirements
- **`{{hashtagCount}}`**: Number of hashtags to include
- **`{{includeCTA}}`**: Whether to include call-to-action
- **`{{styleGuidelines}}`**: Style guidelines and rules
- **`{{providers}}`**: Available data providers
- **`{{actionNames}}`**: Available actions

## Template Best Practices

1. **Consistency**: Use consistent structure across all templates
2. **Clarity**: Provide clear, step-by-step instructions
3. **Flexibility**: Use variables to make templates reusable
4. **Validation**: Always validate templates before use
5. **Documentation**: Document any custom templates or modifications
6. **Testing**: Test templates with various inputs and scenarios

## Template Quality Scoring

The template system includes a quality scoring mechanism that evaluates templates based on:

- **Completeness**: Presence of required sections
- **Clarity**: Instruction clarity and detail
- **Structure**: XML formatting and organization
- **Variable Usage**: Appropriate use of template variables

## Adding New Templates

To add a new template:

1. Create the template in the appropriate category file
2. Follow the standard template structure
3. Add the template to the exports in the category file
4. Update the `templateCategories` in `index.ts`
5. Add any necessary utility functions to `template-utils.ts`
6. Document the template in this README

## Template Utilities

The `template-utils.ts` file provides helper functions for:

- **Template Rendering**: Replacing variables with actual values
- **Template Validation**: Checking template completeness and structure
- **Template Customization**: Modifying existing templates
- **Template Merging**: Combining multiple templates
- **Variable Extraction**: Finding all variables in a template
- **Character-Based Templates**: Generating templates from character definitions
- **Quality Scoring**: Evaluating template quality

## Integration with ElizaOS

These templates are designed to work seamlessly with the ElizaOS core system:

- **Character Integration**: Templates automatically integrate with character definitions
- **Platform Support**: Platform-specific templates handle platform requirements
- **Memory System**: Templates can leverage ElizaOS memory and knowledge systems
- **MCP Integration**: Templates support MCP connections for external services
- **Provider System**: Templates work with ElizaOS data providers

## Support and Maintenance

For questions about templates or to report issues:

1. Check the template documentation and examples
2. Review the template utilities for common operations
3. Validate templates using the built-in validation functions
4. Test templates with various scenarios and inputs
5. Update templates as ElizaOS evolves and new features are added

## Version Compatibility

These templates are designed for ElizaOS version 0.25.6+ and may require updates for compatibility with newer versions. Always check the ElizaOS documentation for the latest template requirements and best practices.
