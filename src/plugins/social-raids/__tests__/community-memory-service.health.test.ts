import { describe, it, expect } from 'bun:test';
import { CommunityMemoryService } from '../services/community-memory-service';

const fakeRuntime: any = {
  getSetting: () => undefined,
  agentId: 'agent-1',
  createMemory: async () => {},
  getMemories: async () => [],
};

describe('CommunityMemoryService.health', () => {
  it('reports health with no-op supabase', () => {
    const svc = new CommunityMemoryService(fakeRuntime as any);
    const h = svc.health();
    expect(typeof h.supabaseEnabled).toBe('boolean');
    expect(typeof h.memoryCacheSize).toBe('number');
    expect(typeof h.personalityCacheSize).toBe('number');
  });
});
