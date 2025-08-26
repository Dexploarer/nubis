// Minimal Node.js process shim for DTS build without @types/node
// Provides just enough typing for process.env usage in code
declare const process: {
  env: Record<string, string | undefined>;
};
