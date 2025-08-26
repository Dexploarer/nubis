/**
 * Community Management Actions for Nubi
 * 
 * Actions that allow Nubi to perform community-related tasks
 * following ElizaOS Action patterns
 */

import type { 
  Action, 
  IAgentRuntime, 
  Memory, 
  State, 
  ActionResult, 
  HandlerCallback 
} from '@elizaos/core';
import { logger } from '@elizaos/core';

/**
 * Mentor Action
 * Provides mentorship and guidance to community members
 */
export const mentorAction: Action = {
  name: 'MENTOR',
  similes: ['GUIDE', 'COACH', 'TEACH', 'ADVISE', 'HELP_LEARN'],
  description: 'Provide mentorship, guidance, and educational support to community members',

  validate: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<boolean> => {
    // Validate if the message contains learning-related content or requests for help
    const text = message.content.text?.toLowerCase() || '';
    
    const mentorshipKeywords = [
      'help', 'learn', 'teach', 'explain', 'guide', 'mentor', 'advice',
      'how to', 'what is', 'can you', 'struggling with', 'confused about',
      'best practice', 'recommend', 'suggestion'
    ];
    
    return mentorshipKeywords.some(keyword => text.includes(keyword));
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: HandlerCallback
  ): Promise<ActionResult> => {
    try {
      logger.info('Nubi providing mentorship guidance');
      
      // Extract the topic or question from the message
      const userMessage = message.content.text || '';
      const userName = message.entityId || 'developer';
      
      // Determine the type of guidance needed
      let guidanceType = 'general';
      if (userMessage.toLowerCase().includes('code')) guidanceType = 'coding';
      if (userMessage.toLowerCase().includes('career')) guidanceType = 'career';
      if (userMessage.toLowerCase().includes('community')) guidanceType = 'community';
      if (userMessage.toLowerCase().includes('prompt')) guidanceType = 'prompting';
      
      // Provide context-appropriate mentorship response
      const mentorshipResponse = generateMentorshipResponse(guidanceType, userMessage);
      
      if (callback) {
        await callback({
          text: mentorshipResponse,
          actions: ['MENTOR'],
          source: message.content.source,
        });
      }

      return {
        text: `Provided ${guidanceType} mentorship guidance`,
        success: true,
        data: {
          action: 'MENTOR',
          guidanceType,
          userName,
          response: mentorshipResponse,
        },
      };
    } catch (error) {
      logger.error('Error in MENTOR action:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  examples: [
    [
      {
        name: '{{userName}}',
        content: {
          text: 'I\'m struggling with understanding async/await in JavaScript',
          actions: [],
        },
      },
      {
        name: 'Nubi',
        content: {
          text: 'Async/await is like having a conversation with someone who takes time to respond. Instead of waiting awkwardly in silence, you can do other things while waiting for their answer. Let me break this down with a practical example...',
          actions: ['MENTOR'],
        },
      },
    ],
    [
      {
        name: '{{userName}}',
        content: {
          text: 'How do I build a good developer portfolio?',
          actions: [],
        },
      },
      {
        name: 'Nubi',
        content: {
          text: 'A portfolio is your professional story told through code. Think quality over quantity - three polished projects that show your range beat twenty half-finished demos. Here\'s what actually matters to hiring managers...',
          actions: ['MENTOR'],
        },
      },
    ],
  ],
};

/**
 * Build Community Action
 * Helps with community building and engagement strategies
 */
export const buildCommunityAction: Action = {
  name: 'BUILD_COMMUNITY',
  similes: ['ENGAGE_COMMUNITY', 'FOSTER_GROWTH', 'BUILD_CONNECTIONS', 'CREATE_VALUE'],
  description: 'Provide guidance on community building, engagement, and growth strategies',

  validate: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<boolean> => {
    const text = message.content.text?.toLowerCase() || '';
    
    const communityKeywords = [
      'community', 'engagement', 'grow', 'build', 'network', 'connect',
      'members', 'discord', 'twitter', 'social', 'audience', 'followers',
      'retention', 'activity', 'participation'
    ];
    
    return communityKeywords.some(keyword => text.includes(keyword));
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: HandlerCallback
  ): Promise<ActionResult> => {
    try {
      logger.info('Nubi providing community building guidance');
      
      const userMessage = message.content.text || '';
      
      // Generate community-focused response
      const communityGuidance = generateCommunityGuidance(userMessage);
      
      if (callback) {
        await callback({
          text: communityGuidance,
          actions: ['BUILD_COMMUNITY'],
          source: message.content.source,
        });
      }

      return {
        text: 'Provided community building guidance',
        success: true,
        data: {
          action: 'BUILD_COMMUNITY',
          guidance: communityGuidance,
        },
      };
    } catch (error) {
      logger.error('Error in BUILD_COMMUNITY action:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  examples: [
    [
      {
        name: '{{userName}}',
        content: {
          text: 'How do I get more engagement in my developer community?',
          actions: [],
        },
      },
      {
        name: 'Nubi',
        content: {
          text: 'Engagement isn\'t about posting more - it\'s about creating conversations worth having. The secret? Ask questions that make people feel smart for answering. Share struggles, not just successes. People connect with vulnerability, not perfection.',
          actions: ['BUILD_COMMUNITY'],
        },
      },
    ],
  ],
};

/**
 * Helper function to generate mentorship responses based on guidance type
 */
function generateMentorshipResponse(guidanceType: string, userMessage: string): string {
  const responses = {
    coding: [
      "Let me break this down into digestible pieces...",
      "The key insight here is understanding the why, not just the how...",
      "Think of it this way - code is communication, first with future you, then with the computer...",
    ],
    career: [
      "Career growth is like compound interest - small, consistent improvements create massive results over time...",
      "Here's what I've learned from watching successful developers navigate their careers...",
      "The best career advice often sounds counterintuitive at first...",
    ],
    community: [
      "Building community is like tending a garden - it requires patience, consistency, and genuine care...",
      "The strongest communities aren't built on shared interests, but shared values...",
      "Here's the psychology behind what makes communities thrive...",
    ],
    prompting: [
      "Great prompting is like great conversation - it's about asking better questions, not just more questions...",
      "The difference between mediocre and exceptional prompts often comes down to context...",
      "Think of AI as a collaborator, not a search engine...",
    ],
    general: [
      "Let me share a perspective that might reframe this challenge...",
      "The best solutions often come from changing the question you're asking...",
      "Here's a mental model that might help you think about this differently...",
    ]
  };

  const responseOptions = responses[guidanceType as keyof typeof responses] || responses.general;
  return responseOptions[Math.floor(Math.random() * responseOptions.length)];
}

/**
 * Helper function to generate community building guidance
 */
function generateCommunityGuidance(userMessage: string): string {
  const guidanceOptions = [
    "Community building is about creating value before extracting it. Focus on solving real problems for your members first.",
    "The best communities have clear hierarchies that people can aspire to climb. Give people goals and recognition systems.",
    "Engagement comes from making people feel heard and valued. Respond thoughtfully, not just quickly.",
    "Mystery and exclusivity create desire. Share insights strategically, not all at once.",
    "Break the fourth wall occasionally - authenticity prevents communities from becoming too serious or cult-like.",
  ];
  
  return guidanceOptions[Math.floor(Math.random() * guidanceOptions.length)];
}
