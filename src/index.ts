import { logger, type Project, type ProjectAgent } from '@elizaos/core';
import { character } from './character.ts';
import { ProjectStarterTestSuite } from './__tests__/e2e/project-starter.e2e';

  export const projectAgent: ProjectAgent = {
  character,

  // plugins: [starterPlugin], <-- Import custom plugins here
  tests: [ProjectStarterTestSuite], // Export tests from ProjectAgent
};

const project: Project = {
  agents: [projectAgent],
};

export { character } from './character.ts';

export default project;
