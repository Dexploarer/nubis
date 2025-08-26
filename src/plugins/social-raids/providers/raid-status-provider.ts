import type { Provider, IAgentRuntime, Memory, State} from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";

export class RaidStatusProvider implements Provider {
  static async get(runtime: IAgentRuntime, message: Memory, state?: State) {
    // Allow class-level invocation by delegating to an instance method
    return new RaidStatusProvider().get(runtime, message, state);
  }
  name = "RAID_STATUS";

  async get(runtime: IAgentRuntime, _message: Memory, _state?: State): Promise<any> {
    try {
      // Acquire supabase via runtime service (tests provide this mock)
      const service: any = runtime.getService?.("COMMUNITY_MEMORY_SERVICE");
      if (!service?.supabase) {
        return { text: "Service not available", data: null };
      }

      const { data, error } = await service.supabase
        .from('raids')
        .select('*')
        .eq('status', 'active')
        .single();

      if (error) {
        return { text: "Error retrieving raid status", data: null };
      }

      if (!data) {
        return { text: "No active raid found", data: null };
      }

      const startedAt = new Date((data.startedAt ?? data.started_at ?? data.created_at) || Date.now());
      const durationMinutes = Number(data.durationMinutes ?? data.duration_minutes ?? 60);
      const remaining = this.calculateRemainingTime({ startedAt, durationMinutes });

      const text = `Raid Status: ${data.status || 'active'} | Target: ${data.targetUrl || data.target_url || 'n/a'} | ` +
        `Participants: ${data.totalParticipants ?? data.participant_count ?? 0} | ` +
        `Engagements: ${data.totalEngagements ?? data.total_engagements ?? 0} | ` +
        `Points: ${data.totalPoints ?? data.points_distributed ?? 0} | Time: ${remaining}`;

      return { text, data };
    } catch (error) {
      elizaLogger.error("RaidStatusProvider error:", error);
      return { text: "Error retrieving raid status", data: null };
    }
  }

  calculateRemainingTime(raidData: { startedAt: Date; durationMinutes: number }): string {
    const end = new Date(raidData.startedAt.getTime() + raidData.durationMinutes * 60 * 1000);
    const remainingMs = end.getTime() - Date.now();
    const remainingMin = Math.ceil(remainingMs / 60000);
    return remainingMin > 0 ? `${remainingMin} min left` : 'Completed';
  }
}
