/**
 * Template Utilities
 * Helper functions for working with ElizaOS templates
 */

import type { Character } from "@elizaos/core";

/**
 * Template Variable Interface
 * Defines the structure of variables that can be used in templates
 */
export interface TemplateVariables {
  agentName: string;
  agentUsername?: string;
  characterTraits?: string[];
  expertiseAreas?: string[];
  writingStyle?: string;
  platform?: string;
  tone?: string;
  length?: string;
  hashtagCount?: number;
  includeCTA?: boolean;
  styleGuidelines?: string[];
  providers?: string[];
  actionNames?: string[];
  [key: string]: any; // Allow additional custom variables
}

/**
 * Template Context Interface
 * Provides context for template rendering
 */
export interface TemplateContext {
  character: Character;
  platform: string;
  user?: {
    name: string;
    id: string;
    roles?: string[];
  };
  channel?: {
    id: string;
    type: string;
    permissions?: string[];
  };
  message?: {
    content: string;
    type: string;
    attachments?: any[];
  };
  [key: string]: any; // Allow additional context
}

/**
 * Render Template
 * Replaces template variables with actual values
 */
export function renderTemplate(
  template: string,
  variables: TemplateVariables,
  context?: TemplateContext
): string {
  let rendered = template;
  
  // Replace basic variables
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    if (typeof value === 'string') {
      rendered = rendered.replace(new RegExp(placeholder, 'g'), value);
    } else if (Array.isArray(value)) {
      rendered = rendered.replace(new RegExp(placeholder, 'g'), value.join(', '));
    } else if (typeof value === 'boolean') {
      rendered = rendered.replace(new RegExp(placeholder, 'g'), value.toString());
    } else if (typeof value === 'number') {
      rendered = rendered.replace(new RegExp(placeholder, 'g'), value.toString());
    }
  });
  
  // Replace context-based variables
  if (context) {
    if (context.character) {
      rendered = rendered.replace(/{{characterTraits}}/g, 
        context.character.adjectives?.join(', ') || 'helpful, knowledgeable');
      rendered = rendered.replace(/{{expertiseAreas}}/g, 
        context.character.topics?.join(', ') || 'general assistance');
      rendered = rendered.replace(/{{writingStyle}}/g, 
        context.character.style?.all?.join(', ') || 'clear and helpful');
    }
    
    if (context.platform) {
      rendered = rendered.replace(/{{platform}}/g, context.platform);
    }
    
    if (context.user) {
      rendered = rendered.replace(/{{userName}}/g, context.user.name);
      rendered = rendered.replace(/{{userId}}/g, context.user.id);
    }
  }
  
  return rendered;
}

/**
 * Validate Template
 * Checks if a template is valid and complete
 */
export function validateTemplate(template: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for required sections
  const requiredSections = ['<task>', '<instructions>', '<output>'];
  requiredSections.forEach(section => {
    if (!template.includes(section)) {
      errors.push(`Missing required section: ${section}`);
    }
  });
  
  // Check for template variables
  const variableMatches = template.match(/\{\{(\w+)\}\}/g);
  if (variableMatches) {
    warnings.push(`Template contains variables: ${variableMatches.join(', ')}`);
  }
  
  // Check for XML formatting
  if (template.includes('<response>') && !template.includes('</response>')) {
    errors.push('Missing closing </response> tag');
  }
  
  // Check for action formatting
  if (template.includes('<actions>') && !template.includes('</actions>')) {
    errors.push('Missing closing </actions> tag');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Customize Template
 * Allows customization of existing templates
 */
export function customizeTemplate(
  baseTemplate: string,
  customizations: Partial<TemplateVariables>,
  additionalInstructions?: string
): string {
  let customized = baseTemplate;
  
  // Apply customizations
  Object.entries(customizations).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    if (customized.includes(placeholder)) {
      customized = customized.replace(new RegExp(placeholder, 'g'), 
        typeof value === 'string' ? value : JSON.stringify(value));
    }
  });
  
  // Add additional instructions if provided
  if (additionalInstructions) {
    const instructionsMatch = customized.match(/(<instructions>.*?)(<\/instructions>)/s);
    if (instructionsMatch) {
      const [fullMatch, start, end] = instructionsMatch;
      const additionalSection = `\n\n## Additional Instructions\n${additionalInstructions}\n`;
      customized = customized.replace(fullMatch, start + additionalSection + end);
    }
  }
  
  return customized;
}

/**
 * Merge Templates
 * Combines multiple templates into one
 */
export function mergeTemplates(
  templates: string[],
  separator: string = '\n\n---\n\n'
): string {
  return templates.join(separator);
}

/**
 * Extract Template Variables
 * Extracts all variables used in a template
 */
export function extractTemplateVariables(template: string): string[] {
  const variableMatches = template.match(/\{\{(\w+)\}\}/g);
  if (!variableMatches) return [];
  
  return [...new Set(variableMatches.map(match => 
    match.replace(/\{\{|\}\}/g, '')
  ))];
}

/**
 * Create Template from Character
 * Generates a basic template based on character properties
 */
export function createTemplateFromCharacter(
  character: Character,
  templateType: 'messageHandler' | 'postCreation' | 'general'
): string {
  const baseTemplate = templateType === 'messageHandler' 
    ? `# Task: Handle message for ${character.name}

## Character Profile
- **Name**: {{agentName}}
- **Bio**: ${character.bio?.join(', ') || 'Helpful assistant'}
- **Topics**: ${character.topics?.join(', ') || 'general assistance'}

## Instructions
${character.style?.all?.map(style => `- ${style}`).join('\n') || '- Be helpful and friendly'}

## Output
Generate a response that follows the character's style and expertise.`

    : templateType === 'postCreation'
    ? `# Task: Create post for ${character.name}

## Character Profile
- **Name**: {{agentName}}
- **Style**: ${character.style?.post?.join(', ') || 'engaging and informative'}

## Post Requirements
- **Platform**: {{platform}}
- **Tone**: {{tone}}
- **Length**: {{length}}

## Instructions
Create a post that embodies ${character.name}'s personality and provides value to the community.`

    : `# Task: General task for ${character.name}

## Character Profile
- **Name**: {{agentName}}
- **Expertise**: ${character.topics?.join(', ') || 'general assistance'}

## Instructions
Complete the task according to ${character.name}'s expertise and style.`;

  return baseTemplate;
}

/**
 * Template Quality Score
 * Provides a quality score for templates based on various factors
 */
export function getTemplateQualityScore(template: string): {
  score: number;
  factors: { factor: string; score: number; maxScore: number }[];
} {
  const factors = [
    { factor: 'Completeness', score: 0, maxScore: 25 },
    { factor: 'Clarity', score: 0, maxScore: 25 },
    { factor: 'Structure', score: 0, maxScore: 25 },
    { factor: 'Variable Usage', score: 0, maxScore: 25 }
  ];
  
  // Completeness score
  const requiredSections = ['<task>', '<instructions>', '<output>'];
  const completenessScore = requiredSections.reduce((score, section) => 
    score + (template.includes(section) ? 8.33 : 0), 0);
  factors[0].score = Math.min(completenessScore, 25);
  
  // Clarity score (based on instruction length and formatting)
  const instructionMatch = template.match(/<instructions>(.*?)<\/instructions>/s);
  if (instructionMatch) {
    const instructions = instructionMatch[1];
    const clarityScore = Math.min(instructions.length / 10, 25);
    factors[1].score = clarityScore;
  }
  
  // Structure score (based on XML formatting)
  const xmlTags = template.match(/<[^>]+>/g) || [];
  const structureScore = Math.min(xmlTags.length * 2, 25);
  factors[2].score = structureScore;
  
  // Variable usage score
  const variables = extractTemplateVariables(template);
  const variableScore = Math.min(variables.length * 5, 25);
  factors[3].score = variableScore;
  
  const totalScore = factors.reduce((sum, factor) => sum + factor.score, 0);
  
  return {
    score: totalScore,
    factors
  };
}

export default {
  renderTemplate,
  validateTemplate,
  customizeTemplate,
  mergeTemplates,
  extractTemplateVariables,
  createTemplateFromCharacter,
  getTemplateQualityScore
};
