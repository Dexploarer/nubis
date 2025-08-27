import { describe, it, expect } from 'bun:test';
import project, { projectAgent, buniAgent } from '../../index';

describe('basic runtime smoke', () => {
  it('exports project and agents', () => {
    expect(project).toBeDefined();
    expect(Array.isArray(project.agents)).toBeTrue();
    expect(projectAgent).toBeDefined();
    expect(buniAgent).toBeDefined();
    expect(Array.isArray(projectAgent.plugins)).toBeTrue();
    expect(Array.isArray(buniAgent.plugins)).toBeTrue();
  });
});
