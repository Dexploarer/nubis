export type MatrixParameter = { key: string; values: any[] };
export type MatrixTestConfig = { base: Record<string, any>; matrix: MatrixParameter[]; runsPerCombination?: number };

export function* generateMatrix(_config: MatrixTestConfig): Generator<Record<string, any>> {
  yield {};
}
