import {
  elizaLogger,
  type Provider,
  type IAgentRuntime,
  type Memory,
  type State,
} from '@elizaos/core';

export class CommunityMemoryProvider implements Provider {
  static async get(runtime: IAgentRuntime, message: Memory, state?: State) {
    // Allow class-level invocation by delegating to an instance method
    return new CommunityMemoryProvider().get(runtime, message, state);
  }
  name = 'COMMUNITY_MEMORY';

  async get(runtime: IAgentRuntime, message: Memory, _state?: State): Promise<any> {
    try {
      const userId = (message as any)?.entityId ?? 'unknown-user';
      const service: any = runtime.getService?.('COMMUNITY_MEMORY_SERVICE');
      if (!service?.supabase) {
        return { text: 'Service not available', data: { personality: null, memoryFragments: [] } };
      }

      // Fetch personality profile
      const personalityRes = await service.supabase
        .from('user_personality')
        .select('*')
        .eq('userId', userId)
        .single();

      const personality = personalityRes?.data || null;

      // Fetch memory fragments
      const fragmentsRes = await service.supabase
        .from('memory_fragments')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false })
        .limit(1000);

      const memoryFragments = Array.isArray(fragmentsRes?.data) ? fragmentsRes.data : [];

      const analysis = personality
        ? this.analyzePersonality({
            traits: personality.traits ?? [],
            engagementStyle: personality.engagementStyle ?? personality.style ?? 'neutral',
          })
        : null;

      const processed = this.processMemoryFragments(memoryFragments);

      const text = personality
        ? `Community Memory: ${analysis?.summary || 'Profile available'}; Fragments: ${processed.totalFragments}`
        : 'No personality data available';

      return {
        text,
        data: {
          personality,
          analysis,
          memoryFragments,
          processed,
        },
      };
    } catch (error) {
      elizaLogger.error('CommunityMemoryProvider error:', error);
      return {
        text: 'Error retrieving community memory',
        data: { personality: null, memoryFragments: [] },
      };
    }
  }

  analyzePersonality(personality: { traits: string[]; engagementStyle: string }): {
    traitCount: number;
    isLeader: boolean;
    isSupportive: boolean;
    summary: string;
  } {
    const traits = Array.isArray(personality.traits) ? personality.traits : [];
    const style = String(personality.engagementStyle || '').toLowerCase();
    const traitCount = traits.length;
    const isLeader = traits.map((t) => String(t).toLowerCase()).includes('leader');
    const isSupportive = style === 'supportive';
    const summary = `Traits: ${traitCount}; leader=${isLeader}; supportive=${isSupportive}`;
    return { traitCount, isLeader, isSupportive, summary };
  }

  processMemoryFragments(
    fragments: Array<{ id: string; content: string; category?: string; weight?: number }>,
  ): { totalFragments: number; averageWeight: number; categories: string[] } {
    const totalFragments = fragments.length;
    if (totalFragments === 0) return { totalFragments: 0, averageWeight: 0, categories: [] };
    const weights = fragments.map((f) => Number(f.weight ?? 0));
    const averageWeight = weights.reduce((a, b) => a + b, 0) / totalFragments;
    const categories = Array.from(
      new Set(fragments.map((f) => String(f.category || '').trim()).filter(Boolean)),
    );
    return { totalFragments, averageWeight, categories };
  }
}
// End of CommunityMemoryProvider
