import { elizaLogger } from '@elizaos/core';

export class ElizaOSLoggerService {
  info(msg: string, ...args: any[]) {
    elizaLogger.info(msg, ...args);
  }
  warn(msg: string, ...args: any[]) {
    elizaLogger.warn(msg, ...args);
  }
  error(msg: string, ...args: any[]) {
    elizaLogger.error(msg, ...args);
  }
  debug(msg: string, ...args: any[]) {
    elizaLogger.debug(msg, ...args);
  }
  success(msg: string, ...args: any[]) {
    (elizaLogger as any).success?.(msg, ...args);
  }
}
