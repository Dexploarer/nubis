import { Provider, IAgentRuntime, Memory, State, elizaLogger } from "@elizaos/core";
import { CommunityMemoryService } from "../services/CommunityMemoryService";

export const CommunityMemoryProvider: Provider = {
  name: "COMMUNITY_MEMORY",
  get: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<any> => {
    try {
      const userId = message.userId;
      if (!userId) return "";

      const memoryService = runtime.getService<CommunityMemoryService>("COMMUNITY_MEMORY_SERVICE");
      if (!memoryService) return "";

      // Get user's personality profile and recent interactions
      const profile = await memoryService.getPersonalityProfile(userId);
      const recentMemories = await memoryService.getUserMemories(userId, 10);
      
      // Build context string
      let contextInfo = `User personality: ${profile.engagementStyle}, `;
      contextInfo += `reliability: ${(profile.reliabilityScore * 100).toFixed(0)}%, `;
      contextInfo += `activity: ${profile.activityLevel}, `;
      contextInfo += `contribution: ${profile.communityContribution}`;
      
      if (profile.traits.length > 0) {
        contextInfo += `, traits: ${profile.traits.join(", ")}`;
      }
      
      // Add recent interaction context
      if (recentMemories.length > 0) {
        const recentTypes = recentMemories.map(m => m.type);
        const uniqueTypes = [...new Set(recentTypes)];
        contextInfo += `. Recent activities: ${uniqueTypes.slice(0, 3).join(", ")}`;
      }
      
      // Add leadership potential if significant
      if (profile.leadershipPotential > 0.6) {
        contextInfo += `. High leadership potential (${(profile.leadershipPotential * 100).toFixed(0)}%)`;
      }
      
      return contextInfo;
      
    } catch (error) {
      elizaLogger.error("CommunityMemoryProvider error:", error);
      return "";
    }
  }
};
