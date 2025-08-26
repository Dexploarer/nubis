import { Provider, IAgentRuntime, Memory, State, elizaLogger } from "@elizaos/core";
<<<<<<< HEAD

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
=======
import { createClient } from "@supabase/supabase-js";

export const UserStatsProvider: Provider = {
  name: "USER_STATS",
  get: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<any> => {
    try {
      const userId = message.entityId;
      if (!userId) return "";

      const supabaseUrl = runtime.getSetting("SUPABASE_URL");
      const supabaseServiceKey = runtime.getSetting("SUPABASE_SERVICE_ROLE_KEY");
      
      if (!supabaseUrl || !supabaseServiceKey) return "";
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Try multiple user identification methods
      let userData = null;
      
      // First try by ElizaOS user ID
      const { data: elizaUser, error: elizaError } = await supabase
        .from('users')
        .select('username, total_points, raids_participated, successful_engagements, streak, rank, badges, last_activity')
        .eq('id', userId)
        .single();

      if (!elizaError && elizaUser) {
        userData = elizaUser;
      } else {
        // Try by username from message context
        const username = message.content.source;
        if (username) {
          const { data: usernameUser, error: usernameError } = await supabase
            .from('users')
            .select('username, total_points, raids_participated, successful_engagements, streak, rank, badges, last_activity')
            .eq('username', username)
            .single();
          
          if (!usernameError && usernameUser) {
            userData = usernameUser;
          }
        }
      }

      if (!userData) {
        return "No raid stats found for this user yet.";
      }

      const badges = userData.badges?.length ? ` | Badges: ${userData.badges.join(' ')}` : '';
      const streak = userData.streak ? ` | ${userData.streak}-day streak` : '';
      
      return `${userData.username || 'User'}: ${userData.total_points || 0} points, ` +
             `${userData.raids_participated || 0} raids, ${userData.successful_engagements || 0} engagements, ` +
             `rank #${userData.rank || 'Unranked'}${streak}${badges}`;
             
    } catch (error) {
      elizaLogger.error("UserStatsProvider error:", error);
      return "";
    }
  }
};
>>>>>>> fdc97d12f583e42cb328455d4cd828b34ac4f757
