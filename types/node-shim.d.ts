// Minimal Node.js process shim for DTS build without @types/node
// Extend this as needed to satisfy type-checks in environments without @types/node
declare const process: {
  env: Record<string, string | undefined>;
  cwd: () => string;
  argv: string[];
  exit: (code?: number) => never;
  on: (event: string, listener: (...args: any[]) => void) => void;
  stdin: any;
  stdout: any;
  memoryUsage: () => {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external?: number;
    arrayBuffers?: number;
  };
  cpuUsage: (previousValue?: { user: number; system: number }) => { user: number; system: number };
};
