#!/usr/bin/env bun

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

interface MatrixParam {
  parameter: string;
  values: any[];
}

interface MatrixFile {
  matrix: MatrixParam[];
}

function cartesianProduct<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>((acc, curr) => {
    const res: T[][] = [];
    for (const a of acc) {
      for (const c of curr) {
        res.push([...a, c]);
      }
    }
    return res;
  }, [[]]);
}

function buildAssignments(params: MatrixParam[], combo: any[]): Record<string, any> {
  const out: Record<string, any> = {};
  params.forEach((p, i) => {
    out[p.parameter] = combo[i];
  });
  return out;
}

async function main() {
  const file = process.argv[2] || 'docs/matrix-examples/nubi-matrix.yaml';
  const abs = path.resolve(process.cwd(), file);
  if (!fs.existsSync(abs)) {
    console.error(`Matrix file not found: ${abs}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(abs, 'utf8');
  const parsed = yaml.load(raw) as MatrixFile;
  if (!parsed || !Array.isArray(parsed.matrix)) {
    console.error('Invalid matrix file: missing matrix array');
    process.exit(1);
  }

  const params = parsed.matrix;
  const valuesArrays = params.map(p => p.values);
  const combos = cartesianProduct(valuesArrays);

  console.log(`# Matrix plan for ${path.relative(process.cwd(), abs)}`);
  console.log(`parameters: ${params.length}`);
  console.log(`combinations: ${combos.length}`);
  console.log('---');

  combos.forEach((combo, idx) => {
    const assignment = buildAssignments(params, combo);
    console.log(JSON.stringify({ idx, assignment }));
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
