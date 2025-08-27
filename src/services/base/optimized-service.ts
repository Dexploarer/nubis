import type { IAgentRuntime, Metadata } from '@elizaos/core';
import { Service } from '@elizaos/core';

export abstract class OptimizedService extends Service {
  constructor(runtime: IAgentRuntime, config: Metadata = {}) {
    super(runtime, config);
  }
}
