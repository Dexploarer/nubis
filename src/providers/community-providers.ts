/**
 * Community Providers for ElizaOS
 * 
 * Providers that supply contextual data about community, learning, and mentorship
 * following ElizaOS Provider patterns
 */

import type { Provider, IAgentRuntime, Memory, State, ProviderResult } from '@elizaos/core';
import { logger } from '@elizaos/core';
import { config } from '../config/environment.js';

/**
 * Community Context Provider
 * Provides information about the current community and user context
 */
export const communityContextProvider: Provider = {
  name: 'COMMUNITY_CONTEXT',
  description: 'Provides context about the current community and user interaction patterns',
  
  get: async (runtime: IAgentRuntime, message: Memory, state: State): Promise<ProviderResult> => {
    try {
      // Get community information
      const communityName = config.COMMUNITY_NAME;
      const characterName = config.CHARACTER_NAME;
      
      // Determine user interaction type
      const isNewUser = !state.recentMessages || state.recentMessages.length < 3;
      const isReturningUser = !isNewUser && state.recentMessages.length > 10;
      
      // Check message patterns for context
      const messageText = message.content.text?.toLowerCase() || '';
      const isAskingForHelp = messageText.includes('help') || messageText.includes('how');
      const isSharingKnowledge = messageText.includes('learned') || messageText.includes('discovered');
      
      const contextText = [
        `Current community: ${communityName}`,
        `Agent role: ${characterName} - AI mentor and community guide`,
        isNewUser ? 'User appears to be new - provide welcoming guidance' : '',
        isReturningUser ? 'User is an active community member - can use more advanced concepts' : '',
        isAskingForHelp ? 'User is seeking assistance or learning' : '',
        isSharingKnowledge ? 'User is contributing knowledge to the community' : '',
      ].filter(Boolean).join('\n');

      return {
        text: contextText,
        values: {
          communityName,
          characterName,
          isNewUser,
          isReturningUser,
          isAskingForHelp,
          isSharingKnowledge,
        },
        data: {
          community: {
            name: communityName,
            character: characterName,
          },
          user: {
            isNew: isNewUser,
            isReturning: isReturningUser,
            seekingHelp: isAskingForHelp,
            contributingKnowledge: isSharingKnowledge,
          },
        },
      };
    } catch (error) {
      logger.error('Error in COMMUNITY_CONTEXT provider:', error);
      return {
        text: '',
        values: {},
        data: {},
      };
    }
  },
};

/**
 * Learning Context Provider
 * Provides context about learning opportunities and educational content
 */
export const learningContextProvider: Provider = {
  name: 'LEARNING_CONTEXT',
  description: 'Provides context for educational and mentorship interactions',
  
  get: async (runtime: IAgentRuntime, message: Memory, state: State): Promise<ProviderResult> => {
    try {
      const messageText = message.content.text?.toLowerCase() || '';
      
      // Identify learning-related topics
      const topics = {
        coding: ['code', 'programming', 'javascript', 'python', 'react', 'api', 'function', 'debug'],
        career: ['career', 'job', 'interview', 'resume', 'portfolio', 'salary', 'promotion'],
        community: ['community', 'network', 'discord', 'twitter', 'engagement', 'growth'],
        prompting: ['prompt', 'ai', 'gpt', 'claude', 'llm', 'chatbot'],
        general: ['learn', 'understand', 'explain', 'help', 'guide', 'teach']
      };
      
      const identifiedTopics = Object.entries(topics)
        .filter(([_, keywords]) => keywords.some(keyword => messageText.includes(keyword)))
        .map(([topic]) => topic);
      
      // Determine learning level based on message complexity
      const learningLevel = messageText.length > 100 ? 'intermediate' : 
                           messageText.includes('basic') || messageText.includes('beginner') ? 'beginner' :
                           'general';
      
      const contextText = identifiedTopics.length > 0 ? 
        `Learning context: ${identifiedTopics.join(', ')} (${learningLevel} level)` :
        'General inquiry - assess learning needs dynamically';

      return {
        text: contextText,
        values: {
          learningTopics: identifiedTopics.join(', '),
          learningLevel,
          hasLearningContext: identifiedTopics.length > 0,
        },
        data: {
          learning: {
            topics: identifiedTopics,
            level: learningLevel,
            identified: identifiedTopics.length > 0,
          },
        },
      };
    } catch (error) {
      logger.error('Error in LEARNING_CONTEXT provider:', error);
      return {
        text: '',
        values: {},
        data: {},
      };
    }
  },
};

/**
 * Engagement Strategy Provider
 * Provides context for how to engage with the user based on their message patterns
 */
export const engagementStrategyProvider: Provider = {
  name: 'ENGAGEMENT_STRATEGY',
  description: 'Provides strategic context for user engagement and interaction style',
  position: -1, // Run early to influence other providers
  
  get: async (runtime: IAgentRuntime, message: Memory, state: State): Promise<ProviderResult> => {
    try {
      const messageText = message.content.text || '';
      
      // Analyze message characteristics
      const hasQuestions = messageText.includes('?');
      const isLongMessage = messageText.length > 200;
      const isShortMessage = messageText.length < 50;
      const hasEmotionalWords = /frustrat|confus|excit|amaz|struggl|love|hate/i.test(messageText);
      const hasTechnicalTerms = /api|function|code|error|debug|deploy|server/i.test(messageText);
      
      // Determine engagement strategy
      let strategy = 'standard';
      if (hasQuestions && hasTechnicalTerms) strategy = 'technical_mentor';
      else if (hasEmotionalWords) strategy = 'empathetic_guide';
      else if (isShortMessage && !hasQuestions) strategy = 'conversation_starter';
      else if (isLongMessage) strategy = 'detailed_responder';
      
      const strategyGuidance = {
        technical_mentor: 'Provide detailed technical guidance with examples',
        empathetic_guide: 'Acknowledge emotions and provide supportive guidance',
        conversation_starter: 'Ask engaging questions to encourage deeper discussion',
        detailed_responder: 'Match the user\'s detail level and thoroughness',
        standard: 'Use balanced approach with humor and insight',
      };

      return {
        text: `Engagement strategy: ${strategy}`,
        values: {
          engagementStrategy: strategy,
          strategyGuidance: strategyGuidance[strategy as keyof typeof strategyGuidance] || strategyGuidance.standard,
          hasQuestions,
          hasEmotionalContent: hasEmotionalWords,
          hasTechnicalContent: hasTechnicalTerms,
        },
        data: {
          engagement: {
            strategy,
            guidance: strategyGuidance[strategy as keyof typeof strategyGuidance] || strategyGuidance.standard,
            characteristics: {
              hasQuestions,
              isLongMessage,
              isShortMessage,
              hasEmotionalWords,
              hasTechnicalTerms,
            },
          },
        },
      };
    } catch (error) {
      logger.error('Error in ENGAGEMENT_STRATEGY provider:', error);
      return {
        text: '',
        values: {},
        data: {},
      };
    }
  },
};
