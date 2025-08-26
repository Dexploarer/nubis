import { Provider, IAgentRuntime, Memory, State, elizaLogger } from "@elizaos/core";

export class UserStatsProvider implements Provider {
  static async get(runtime: IAgentRuntime, message: Memory, state?: State) {
    // Allow class-level invocation by delegating to an instance method
    return new UserStatsProvider().get(runtime, message, state);
  }
  name = "USER_STATS";

  async get(runtime: IAgentRuntime, message: Memory, _state?: State): Promise<any> {
    try {
      const userId = (message as any)?.entityId;
      const service: any = runtime.getService?.("COMMUNITY_MEMORY_SERVICE");
      if (!service || !service.supabase) {
        return { text: "Service not available", data: null };
      }

      let result: any;
      try {
        result = await service.supabase
          .from('user_stats')
          .select('*')
          .eq('userId', userId)
          .single();
      } catch (e) {
        // network error path used by tests
        return { text: "Error retrieving user stats", data: null };
      }

      const { data, error } = result || { data: null, error: null };
      if (error) {
        return { text: "Error retrieving user stats", data: null };
      }

      const stats = data ? {
        userId: data.userId ?? userId,
        username: data.username ?? 'User',
        totalPoints: data.totalPoints ?? data.total_points ?? 0,
        totalRaids: data.totalRaids ?? data.raids_participated ?? 0,
        totalEngagements: data.totalEngagements ?? data.successful_engagements ?? 0,
        rank: (data.rank ?? this.calculateRank((data.totalPoints ?? data.total_points) ?? 0)) as string,
        achievements: data.achievements ?? data.badges ?? [],
        lastActive: data.lastActive ?? data.last_activity ?? null,
      } : {
        userId,
        username: 'New user',
        totalPoints: 0,
        totalRaids: 0,
        totalEngagements: 0,
        rank: 'bronze',
        achievements: [],
        lastActive: null,
      };

      const textPrefix = data ? 'User Statistics' : 'New user';
      const text = `${textPrefix}: ${stats.username} — ${stats.totalPoints} points, ${stats.totalRaids} raids, ${stats.totalEngagements} engagements, rank ${stats.rank}`;

      return { text, data: stats };
    } catch (error) {
      elizaLogger.error("UserStatsProvider error:", error);
      return { text: "Error retrieving user stats", data: null };
    }
  }

  calculateRank(points: number): string {
    if (points >= 2500) return 'diamond';
    if (points >= 1200) return 'platinum';
    if (points >= 600) return 'gold';
    if (points >= 200) return 'silver';
    return 'bronze';
  }
}
