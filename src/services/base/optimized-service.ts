import type { IAgentRuntime, Metadata } from '@elizaos/core';
import { Service } from '@elizaos/core';

export abstract class OptimizedService extends Service {
  protected _config: Metadata = {} as Metadata;
  public config: Metadata = {} as Metadata;

  constructor(runtime: IAgentRuntime, config: Metadata = {}) {
    super(runtime, config);
    this._config = config;
    this.config = config;
  }
}
