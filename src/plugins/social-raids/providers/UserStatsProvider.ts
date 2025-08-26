import { Provider, IAgentRuntime, Memory, State, elizaLogger } from "@elizaos/core";
import { createClient } from "@supabase/supabase-js";

export const UserStatsProvider: Provider = {
  get: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<string> => {
    try {
      const userId = message.userId;
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
