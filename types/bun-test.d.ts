// Ambient types for Bun's test runner and utilities used in this project
// This avoids TS errors for `import { describe, it, expect } from "bun:test"`
// and `$` from "bun" when type-checking.

declare module "bun:test" {
  export const describe: (...args: any[]) => any;
  export const it: (...args: any[]) => any;
  export const test: (...args: any[]) => any;
  export const expect: any;
  export const beforeAll: (...args: any[]) => any;
  export const afterAll: (...args: any[]) => any;
  export const beforeEach: (...args: any[]) => any;
  export const afterEach: (...args: any[]) => any;
  export const mock: any;
}

declare module "bun" {
  export const $: any;
}
