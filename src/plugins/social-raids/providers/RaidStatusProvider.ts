import { Provider, IAgentRuntime, Memory, State, elizaLogger } from "@elizaos/core";

export const RaidStatusProvider: Provider = {
  get: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<string> => {
    try {
      const raidCoordinatorUrl = runtime.getSetting("RAID_COORDINATOR_URL");
      if (!raidCoordinatorUrl) {
        return "";
      }

      const response = await fetch(raidCoordinatorUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'get_status',
          userId: message.userId 
        })
      });

      const result = await response.json();
      
      if (result.success && result.raid) {
        const raid = result.raid;
        const timeRemaining = calculateTimeRemaining(raid.created_at);
        
        return `Active Raid: ${raid.status} | Target: ${raid.target_url} | ` +
               `Participants: ${raid.participant_count} | Engagements: ${raid.total_engagements} | ` +
               `Points: ${raid.points_distributed} | Time: ${timeRemaining}`;
      }
      
      return "No active raids currently running.";
      
    } catch (error) {
      elizaLogger.error("RaidStatusProvider error:", error);
      return "";
    }
  }
};

function calculateTimeRemaining(startTime: string): string {
  const start = new Date(startTime);
  const now = new Date();
  const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000 / 60);
  const remaining = Math.max(60 - elapsed, 0);
  return remaining > 0 ? `${remaining} min left` : 'Completed';
}
