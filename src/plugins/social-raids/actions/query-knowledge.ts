/**
 * Query Knowledge Action
 * Enhanced knowledge and memory querying using ElizaOS memory system
 * and Knowledge Optimization Service
 */

import type { ActionExample, IAgentRuntime, HandlerCallback, State, Memory, Action } from '@elizaos/core';
import { ActionResult, elizaLogger } from '@elizaos/core';

export const queryKnowledgeAction: Action = {
  name: 'query-knowledge',
  similes: [
    'search-knowledge',
    'find-info',
    'lookup',
    'search-docs',
    'search-memory',
    'what-do-you-know-about',
    'tell-me-about',
    'explain',
    'help-with',
  ],
  description: 'Query the combined knowledge base and community memories for information',
  
  validate: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<boolean> => {
    if (!message.content?.text) return false;

    const text = message.content.text.toLowerCase();
    
    // Trigger on queries asking for information
    return (
      text.includes('what') ||
      text.includes('how') ||
      text.includes('tell me about') ||
      text.includes('explain') ||
      text.includes('search') ||
      text.includes('find') ||
      text.includes('lookup') ||
      text.includes('know about') ||
      text.includes('help with') ||
      /\b(who|when|where|why|which)\b/.test(text)
    );
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: HandlerCallback
  ): Promise<ActionResult> => {
    try {
      const query = message.content?.text || '';
      const userId = message.entityId?.toString();
      
      elizaLogger.info('Processing knowledge query:', query);

      // Get the Community Memory Service
      const communityMemoryService = runtime.getService('COMMUNITY_MEMORY_SERVICE');
      if (!communityMemoryService || typeof (communityMemoryService as any).queryKnowledgeAndMemory !== 'function') {
        await callback?.({
          text: "I'm having trouble accessing my knowledge system right now. Please try again later.",
          error: true,
        });

        return {
          success: false,
          error: new Error('Community Memory Service not available'),
        };
      }

      // Extract the actual query from the text
      const extractedQuery = extractQueryFromText(query);
      
      // Query knowledge and memory
      const results = await (communityMemoryService as any).queryKnowledgeAndMemory(extractedQuery, userId, 5);
      
      // Format and send response
      const response = formatKnowledgeResponse(results, extractedQuery);
      
      await callback?.({
        text: response,
        action: 'query-knowledge',
        metadata: {
          query: extractedQuery,
          memoriesFound: results.memories.length,
          knowledgeFound: results.knowledge.length,
          insightsGenerated: results.combined_insights.length,
        },
      });

      return {
        success: true,
        text: response,
        data: {
          query: extractedQuery,
          results: results,
        },
      };
    } catch (error) {
      elizaLogger.error('Failed to process knowledge query:', error);
      
      await callback?.({
        text: "I encountered an error while searching for that information. Please try rephrasing your question.",
        error: true,
      });

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  examples: [
    [
      {
        name: 'user',
        content: { text: 'Tell me about Nubi' },
      },
      {
        name: 'assistant', 
        content: {
          text: "Based on our knowledge base, Nubi is an ElizaOS-based AI mentor built for developers, especially those working in the Solana/Web3 space. He combines humor, sarcasm and deep technical knowledge to guide community members through coding and AI challenges.\n\n**Key Personality Traits:**\n- Entertaining first, educational second\n- Uses wit and metaphor to draw people in\n- Strategic mystery to encourage deeper engagement\n- Approachable authority without condescension\n\n**Community Role:**\n- Acts as a benevolent cult leader figure\n- Guides members through prompt engineering and development\n- Builds community through gamified learning\n\nWould you like me to search for more specific information about any aspect of Nubi?",
          action: 'query-knowledge',
        },
      },
    ],
    [
      {
        name: 'user',
        content: { text: 'How do social raids work?' },
      },
      {
        name: 'assistant',
        content: {
          text: "Social raids are coordinated community engagement campaigns on Twitter/X. Here's how they work:\n\n**Process:**\n1. A raid is started by sharing a Twitter URL\n2. Community members join the raid through Telegram\n3. Participants engage with the target tweet (likes, retweets, comments)\n4. Points are awarded based on engagement type\n5. Leaderboards track community contributions\n\n**Point System:**\n- 👍 Like = 1 point\n- 🔄 Retweet = 2 points  \n- 💬 Quote Tweet = 3 points\n- 📝 Comment = 5 points\n\n**Community Memory:**\nAll raid activities are stored in our ElizaOS memory system for tracking participation, quality scoring, and building community profiles.\n\nWant to know more about starting a raid or checking leaderboards?",
          action: 'query-knowledge',
        },
      },
    ],
    [
      {
        name: 'user',
        content: { text: 'What have I been working on lately?' },
      },
      {
        name: 'assistant',
        content: {
          text: "Let me check your recent community interactions and memories...\n\n**Recent Activity:**\nBased on your interactions, you've been active in:\n- Twitter engagement discussions\n- Community raid coordination\n- Technical questions about ElizaOS integration\n\n**Knowledge Connections:**\nYour interests align with our documentation on social platforms and community management. You might find our guides on engagement strategies and plugin development helpful.\n\n**Insights:**\nYour participation pattern suggests you're interested in both the technical and community aspects of our ecosystem.\n\nWould you like me to find specific resources related to any of these areas?",
          action: 'query-knowledge',
        },
      },
    ],
  ] as ActionExample[][],
};

function extractQueryFromText(text: string): string {
  // Remove common question words and extract the core query
  let query = text.toLowerCase();
  
  // Remove leading question words
  query = query.replace(/^(what|how|tell me about|explain|search|find|lookup|help with|who|when|where|why|which)\s+/i, '');
  query = query.replace(/^(is|are|do|does|can|could|would|should)\s+/i, '');
  query = query.replace(/\b(about|regarding|concerning)\s+/i, '');
  
  // Remove trailing question marks and common endings
  query = query.replace(/[?!.]*$/, '');
  query = query.replace(/\s+(please|thanks|thank you)$/i, '');
  
  // If the query is too short, use the original
  if (query.length < 3) {
    query = text.toLowerCase().replace(/[?!.]*$/, '');
  }
  
  return query.trim();
}

function formatKnowledgeResponse(results: any, query: string): string {
  let response = `Here's what I found about "${query}":\n\n`;
  
  // Add knowledge base results
  if (results.knowledge && results.knowledge.length > 0) {
    response += "**📚 Knowledge Base:**\n";
    results.knowledge.forEach((doc: any, index: number) => {
      response += `${index + 1}. **${doc.title}** (${doc.category})\n`;
      response += `   ${doc.summary}\n`;
      if (doc.tags && doc.tags.length > 0) {
        response += `   *Tags: ${doc.tags.slice(0, 3).join(', ')}*\n`;
      }
      response += '\n';
    });
  }
  
  // Add memory results
  if (results.memories && results.memories.length > 0) {
    response += "**💭 Recent Community Interactions:**\n";
    results.memories.forEach((memory: any, index: number) => {
      response += `${index + 1}. ${memory.content.substring(0, 100)}${memory.content.length > 100 ? '...' : ''}\n`;
      response += `   *${memory.platform} • ${new Date(memory.timestamp).toLocaleDateString()}*\n\n`;
    });
  }
  
  // Add combined insights
  if (results.combined_insights && results.combined_insights.length > 0) {
    response += "**🔗 Insights & Connections:**\n";
    results.combined_insights.forEach((insight: any, index: number) => {
      response += `${index + 1}. ${insight.insight}\n`;
      response += `   *Correlation: ${(insight.correlation_score * 100).toFixed(0)}%*\n\n`;
    });
  }
  
  // If no results found
  if ((!results.knowledge || results.knowledge.length === 0) && 
      (!results.memories || results.memories.length === 0) &&
      (!results.combined_insights || results.combined_insights.length === 0)) {
    response = `I couldn't find specific information about "${query}" in our knowledge base or your interaction history. `;
    response += "Try asking about:\n";
    response += "- Nubi's personality and community roles\n";
    response += "- Social raids and engagement strategies\n";
    response += "- ElizaOS architecture and memory systems\n";
    response += "- Community guidelines and best practices\n\n";
    response += "Or ask me to search for something more specific!";
  } else {
    response += "\n*Want to dive deeper into any of these topics? Just ask!*";
  }
  
  return response;
}

export default queryKnowledgeAction;