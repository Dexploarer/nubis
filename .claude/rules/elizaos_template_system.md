---
trigger: always_on
description: Anytime the user asks to make templates or a template.
---

dynamic: true,
get: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
// Your custom logic here
return {
values: { customData: 'value' },
data: { customData: 'value' },
text: 'Custom data: value'
};
}
};

````

### 2. Add New Templates
Create additional template types for specialized use cases by following the existing pattern:

```typescript
export const customTemplate = `<task>Your custom task description.</task>

<providers>
{{providers}}
</providers>

<instructions>Your custom instructions here.</instructions>

<output>
Your custom output format here.
</output>`;
````

### 3. Plugin System Integration

Templates work with the plugin system where providers and actions can be added through plugins in [index.ts](mdc:packages/plugin-bootstrap/src/index.ts:38-47).

## 10. Critical Development Rules

### XML Response Format Requirements

- **ALL LLM responses must be contained within `<response></response>` XML blocks**
- **No text, thinking, or reasoning should appear before or after the XML block**
- **Responses must start immediately with `<response>` and end with `</response>`**

### Action Ordering Rules

- **Actions execute in the ORDER listed - sequence matters**
- **REPLY should come FIRST to acknowledge user requests**
- **Use IGNORE only when no response is needed (and use it alone)**

### Provider Selection Rules

- **Only include providers if needed for accurate responses**
- **Must include "ATTACHMENTS" if message mentions visual content**
- **Include "ENTITIES" for questions about specific people**
- **Include "RELATIONSHIPS" for questions about connections**
- **Include "FACTS" for factual information requests**
- **Include "WORLD" for environment context questions**
- **Never use "IGNORE" as a provider name**

### Code Block Formatting Rules

- **Always wrap code examples with ``` fenced code blocks**
- **Specify language if known (e.g., ```python)**
- **Only use fenced blocks for actual code**
- **Use single backticks (`) for inline code elements**
- **Never wrap non-code text in code blocks**

### Template Compilation Process

- **Double-brace placeholders ({{placeholder}}) are converted to triple-brace for non-HTML escaping**
- **State values populate template placeholders**
- **Random user name generation for placeholder values**

## 11. Best Practices

### 1. Template Structure

- Always include `<task>`, `<providers>`, `<instructions>`, and `<output>` sections
- Use clear, descriptive task descriptions
- Provide specific formatting requirements in output section

### 2. Provider Usage

- Only include providers that are actually needed
- Follow the provider selection rules strictly
- Test provider integration thoroughly

### 3. Character Development

- Create diverse bio arrays for natural variation
- Use topics and adjectives to add personality depth
- Provide comprehensive style guides for different contexts
- Include realistic message and post examples

### 4. Template Testing

- Test templates with various input scenarios
- Verify XML parsing works correctly
- Ensure provider data is properly formatted
- Test action ordering and execution

### 5. Performance Considerations

- Keep templates concise but comprehensive
- Avoid unnecessary provider calls
- Use efficient state composition
- Cache frequently used template data

This comprehensive guide covers all aspects of the ElizaOS Template System, from basic usage to advanced customization. Follow these patterns and best practices to build robust, engaging agent systems.
