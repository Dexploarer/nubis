export type CoverageResult = { statements: number; branches: number; functions: number; lines: number };
export async function collectCoverageHints(): Promise<CoverageResult> {
  return { statements: 0, branches: 0, functions: 0, lines: 0 };
}
