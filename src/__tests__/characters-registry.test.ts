import { describe, it, expect } from 'bun:test';
import { Nubi, Buni } from '../characters/index';
import type { Character } from '@elizaos/core';

describe('characters registry', () => {
  it('exports Nubi and Buni characters', () => {
    expect(Nubi).toBeDefined();
    expect(Buni).toBeDefined();
  });

  it('characters have required name/username fields', () => {
    const n: Character = Nubi;
    const b: Character = Buni;
    expect(typeof n.name).toBe('string');
    expect(typeof n.username).toBe('string');
    expect(typeof b.name).toBe('string');
    expect(typeof b.username).toBe('string');
  });
});
