/**
 * Dynamic Character Plugin for ElizaOS
 * Enables runtime personality switching and context-aware character adaptation
 */

import type { Plugin, Action, Provider, IAgentRuntime, Memory, State, ActionResult, HandlerCallback } from '@elizaos/core';
import { Service } from '@elizaos/core';
import { applyParameterOverride, ParameterOverride } from '../../utils/parameter-override';

// Personality profiles for different contexts
export interface PersonalityProfile {
  id: string;
  name: string;
  system: string;
  style: {
    all: string[];
    chat: string[];
    post: string[];
  };
  actions: string[];
  description: string;
}

export const personalityProfiles: Record<string, PersonalityProfile> = {
  community: {
    id: 'community',
    name: 'Community Manager',
    system: 'You are a community manager focused on engagement and relationship building. Your primary goal is to foster a positive, inclusive environment where members feel valued and connected.',
    style: {
      all: ['Warm and encouraging', 'Community-focused', 'Relationship-oriented', 'Growth-minded'],
      chat: ['Be conversational and supportive', 'Ask follow-up questions', 'Recognize member contributions'],
      post: ['Share community insights', 'Highlight member achievements', 'Encourage participation']
    },
    actions: ['ENGAGE_MEMBER', 'FOSTER_DISCUSSION', 'BUILD_RELATIONSHIP', 'RECOGNIZE_CONTRIBUTION'],
    description: 'Focused on community engagement and member relationships'
  },
  
  moderation: {
    id: 'moderation',
    name: 'Moderator',
    system: 'You are a fair and firm moderator who maintains community standards. Your role is to enforce rules consistently while educating members about community guidelines.',
    style: {
      all: ['Firm and consistent', 'Fair and impartial', 'Educational', 'Rule-focused'],
      chat: ['Be clear about expectations', 'Explain rule violations', 'Maintain authority'],
      post: ['Share moderation policies', 'Clarify community standards', 'Document rule changes']
    },
    actions: ['ENFORCE_RULES', 'WARN_USER', 'APPLY_SANCTION', 'EDUCATE_MEMBER'],
    description: 'Focused on rule enforcement and community standards'
  },
  
  technical: {
    id: 'technical',
    name: 'Technical Expert',
    system: 'You are a technical expert who solves complex problems efficiently. You provide clear, actionable solutions and help members understand technical concepts.',
    style: {
      all: ['Precise and efficient', 'Solution-focused', 'Educational', 'Technical'],
      chat: ['Provide clear solutions', 'Explain technical concepts', 'Offer step-by-step guidance'],
      post: ['Share technical insights', 'Document solutions', 'Provide troubleshooting guides']
    },
    actions: ['ANALYZE_PROBLEM', 'PROVIDE_SOLUTION', 'EXPLAIN_TECHNICAL', 'DOCUMENT_SOLUTION'],
    description: 'Focused on technical problem-solving and education'
  },
  
  engagement: {
    id: 'engagement',
    name: 'Engagement Specialist',
    system: 'You are an engagement specialist who creates interactive experiences and drives participation. You design activities that bring members together and build community spirit.',
    style: {
      all: ['Creative and energetic', 'Interactive', 'Fun-loving', 'Community-building'],
      chat: ['Be enthusiastic and engaging', 'Create interactive moments', 'Encourage participation'],
      post: ['Share fun activities', 'Create challenges', 'Celebrate community milestones']
    },
    actions: ['CREATE_ACTIVITY', 'ENGAGE_MEMBERS', 'BUILD_EXCITEMENT', 'FOSTER_PARTICIPATION'],
    description: 'Focused on creating engaging community experiences'
  }
};

// Dynamic Character Service
export class DynamicCharacterService extends Service {
  static serviceType = 'dynamic-character';
  capabilityDescription = 'Manages dynamic character personality switching and context-aware adaptation';
  
  private currentPersonality: string = 'community';
  private personalityHistory: Array<{ personality: string; timestamp: number; reason: string }> = [];
  
  constructor(protected runtime: IAgentRuntime) {
    super(runtime);
  }
  
  /**
   * Log method for the service
   */
  private log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    console.log(`[${level.toUpperCase()}] DynamicCharacterService: ${message}`, data);
  }
  
  static async start(runtime: IAgentRuntime) {
    const service = new DynamicCharacterService(runtime);
    await service.initialize();
    return service;
  }
  
  static async stop(runtime: IAgentRuntime) {
    const service = runtime.getService(DynamicCharacterService.serviceType) as DynamicCharacterService;
    if (service) {
      service.stop();
    }
  }
  
  private async initialize() {
    // Set initial personality based on context
    await this.analyzeAndSetInitialPersonality();
  }
  
  /**
   * Switch to a different personality
   */
  async switchPersonality(personalityId: string, reason: string = 'Manual switch'): Promise<boolean> {
    if (!personalityProfiles[personalityId]) {
      throw new Error(`Unknown personality: ${personalityId}`);
    }
    
    const previousPersonality = this.currentPersonality;
    this.currentPersonality = personalityId;
    
    // Record the switch
    this.personalityHistory.push({
      personality: personalityId,
      timestamp: Date.now(),
      reason
    });
    
    // Apply personality changes to runtime character
    await this.applyPersonalityToCharacter(personalityId);
    
    this.log('info', `Personality switched from ${previousPersonality} to ${personalityId}`, { reason });
    return true;
  }
  
  /**
   * Get current personality
   */
  getCurrentPersonality(): string {
    return this.currentPersonality;
  }
  
  /**
   * Get personality history
   */
  getPersonalityHistory(): Array<{ personality: string; timestamp: number; reason: string }> {
    return [...this.personalityHistory];
  }
  
  /**
   * Analyze context and set appropriate personality
   */
  async analyzeAndSetInitialPersonality(): Promise<void> {
    // This would analyze the current conversation context
    // For now, we'll use a default
    await this.switchPersonality('community', 'Initial context analysis');
  }
  
  /**
   * Apply personality changes to the runtime character
   */
  private async applyPersonalityToCharacter(personalityId: string): Promise<void> {
    const profile = personalityProfiles[personalityId];
    if (!profile) return;
    
    // Apply personality overrides to the character
    const overrides: ParameterOverride[] = [
      { path: 'character.system', value: profile.system },
      { path: 'character.style.all', value: profile.style.all },
      { path: 'character.style.chat', value: profile.style.chat },
      { path: 'character.style.post', value: profile.style.post }
    ];
    
    // Apply each override
    for (const override of overrides) {
      // In a real implementation, this would update the runtime character
      // For now, we'll just log the changes
      this.log('info', `Applied personality override: ${override.path}`, { value: override.value });
    }
  }
  
  async stop() {
    this.log('info', 'DynamicCharacterService stopped');
  }
}

// Dynamic Personality Switch Action
export const switchPersonalityAction: Action = {
  name: 'SWITCH_PERSONALITY',
  similes: ['CHANGE_PERSONALITY', 'ADAPT_PERSONALITY', 'SWITCH_MODE'],
  description: 'Switches the agent to a different personality based on context or user request',
  
  validate: async (runtime: IAgentRuntime, message: Memory, _state?: State): Promise<boolean> => {
    // Allow personality switching in DMs or when explicitly requested
    const channelType = message.content.channelType;
    const text = message.content.text?.toLowerCase() || '';
    return channelType === 'DM' || 
           text.includes('switch') ||
           text.includes('change');
  },
  
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: any,
    callback?: HandlerCallback
  ): Promise<ActionResult> => {
    try {
      const service = runtime.getService(DynamicCharacterService.serviceType) as DynamicCharacterService;
      if (!service) {
        throw new Error('DynamicCharacterService not available');
      }
      
      // Extract requested personality from message
      const text = message.content.text?.toLowerCase() || '';
      let requestedPersonality = 'community'; // default
      
      if (text.includes('moderator') || text.includes('moderation')) {
        requestedPersonality = 'moderation';
      } else if (text.includes('technical') || text.includes('expert')) {
        requestedPersonality = 'technical';
      } else if (text.includes('engagement') || text.includes('fun')) {
        requestedPersonality = 'engagement';
      } else if (text.includes('community') || text.includes('manager')) {
        requestedPersonality = 'community';
      }
      
      // Switch personality
      await service.switchPersonality(requestedPersonality, 'User request');
      
      const profile = personalityProfiles[requestedPersonality];
      const response = `I've switched to ${profile.name} mode. ${profile.description}`;
      
      if (callback) {
        await callback({
          text: response,
          actions: ['SWITCH_PERSONALITY'],
          source: message.content.source
        });
      }
      
      return {
        text: response,
        success: true,
        data: {
          actions: ['SWITCH_PERSONALITY'],
          newPersonality: requestedPersonality,
          source: message.content.source
        }
      };
      
    } catch (error) {
      const errorMessage = `Failed to switch personality: ${error instanceof Error ? error.message : String(error)}`;
      
      if (callback) {
        await callback({
          text: errorMessage,
          actions: ['SWITCH_PERSONALITY'],
          source: message.content.source
        });
      }
      
      return {
        text: errorMessage,
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  },
  
  examples: [
    [
      {
        name: '{{name1}}',
        content: { text: 'Switch to moderator mode' }
      },
      {
        name: '{{agentName}}',
        content: {
          text: "I've switched to Moderator mode. Focused on rule enforcement and community standards.",
          actions: ['SWITCH_PERSONALITY']
        }
      }
    ],
    [
      {
        name: '{{name1}}',
        content: { text: 'I need technical help, can you switch to expert mode?' }
      },
      {
        name: '{{agentName}}',
        content: {
          text: "I've switched to Technical Expert mode. Focused on technical problem-solving and education.",
          actions: ['SWITCH_PERSONALITY']
        }
      }
    ]
  ]
};

// Context Analysis Provider
export const contextAnalysisProvider: Provider = {
  name: 'CONTEXT_ANALYSIS',
  description: 'Analyzes conversation context to suggest appropriate personality',
  
  get: async (runtime: IAgentRuntime, message: Memory, _state?: State) => {
    const service = runtime.getService(DynamicCharacterService.serviceType) as DynamicCharacterService;
    if (!service) {
      return {
        text: 'Context analysis not available',
        values: {},
        data: {}
      };
    }
    
    const currentPersonality = service.getCurrentPersonality();
    const history = service.getPersonalityHistory();
    
    // Analyze message content for context clues
    const text = message.content.text?.toLowerCase() || '';
    let suggestedPersonality = currentPersonality;
    let confidence = 0.5;
    
    if (text.includes('rule') || text.includes('moderate') || text.includes('ban')) {
      suggestedPersonality = 'moderation';
      confidence = 0.9;
    } else if (text.includes('technical') || text.includes('problem') || text.includes('bug')) {
      suggestedPersonality = 'technical';
      confidence = 0.8;
    } else if (text.includes('fun') || text.includes('activity') || text.includes('game')) {
      suggestedPersonality = 'engagement';
      confidence = 0.7;
    } else if (text.includes('community') || text.includes('member') || text.includes('grow')) {
      suggestedPersonality = 'community';
      confidence = 0.8;
    }
    
    // Extract keywords for context analysis
    const keywords = ['rule', 'moderate', 'technical', 'problem', 'fun', 'activity', 'community', 'member'];
    const foundKeywords = keywords.filter(keyword => text.includes(keyword));
    
    return {
      text: `Current personality: ${currentPersonality}, Suggested: ${suggestedPersonality} (confidence: ${confidence})`,
      values: {
        currentPersonality,
        suggestedPersonality,
        confidence,
        shouldSwitch: suggestedPersonality !== currentPersonality && confidence > 0.7
      },
      data: {
        personalityHistory: history,
        contextAnalysis: {
          text,
          keywords: foundKeywords,
          suggestedPersonality,
          confidence
        }
      }
    };
  }
};

// Dynamic Character Plugin
export const dynamicCharacterPlugin: Plugin = {
  name: 'dynamic-character',
  description: 'Enables runtime personality switching and context-aware character adaptation',
  
  config: {
    ENABLE_AUTO_SWITCHING: process.env.ENABLE_AUTO_PERSONALITY_SWITCHING || 'true',
    DEFAULT_PERSONALITY: process.env.DEFAULT_PERSONALITY || 'community',
    SWITCH_THRESHOLD: process.env.PERSONALITY_SWITCH_THRESHOLD || '0.7'
  },
  
  async init(config: Record<string, string>) {
    console.log('Dynamic Character Plugin initialized with config:', config);
  },
  
  services: [DynamicCharacterService],
  actions: [switchPersonalityAction],
  providers: [contextAnalysisProvider],
  
  events: {
    MESSAGE_RECEIVED: [
      async (params: any) => {
        // Auto-switching based on context (if enabled)
        const runtime = params.runtime;
        const message = params.message;
        
        if (runtime && message) {
          const service = runtime.getService(DynamicCharacterService.serviceType) as DynamicCharacterService;
          if (service) {
            // Analyze context and potentially auto-switch
            const provider = runtime.getProvider('CONTEXT_ANALYSIS');
            if (provider) {
              const context = await provider.get(runtime, message);
              if (context.values.shouldSwitch) {
                await service.switchPersonality(
                  context.values.suggestedPersonality,
                  'Context-based auto-switch'
                );
              }
            }
          }
        }
      }
    ]
  }
};

export default dynamicCharacterPlugin;
