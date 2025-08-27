import { runPerformanceSuite } from './performance-tests';
import { runLoadSuite } from './load-tests';
import { runIntegrationSuite } from './integration-tests';
import { collectCoverageHints } from './coverage-tests';

export async function runElizaOSTests() {
  const [perf, load, integ, cov] = await Promise.all([
    runPerformanceSuite(),
    runLoadSuite(),
    runIntegrationSuite(),
    collectCoverageHints(),
  ]);
  return { perf, load, integ, cov };
}
