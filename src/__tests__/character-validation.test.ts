import { describe, it, expect } from 'bun:test';
import { validateCharacter, REQUIRED_PLUGINS } from '../characters/validation';
import { Nubi, Buni } from '../characters';

describe('character validation', () => {
  it('validates REQUIRED_PLUGINS prefix and essential fields for Nubi/Buni', () => {
    const n = validateCharacter(Nubi);
    const b = validateCharacter(Buni);
    expect(n.valid).toBeTrue();
    expect(b.valid).toBeTrue();
  });

  it('fails when REQUIRED_PLUGINS order is wrong', () => {
    const ch = {
      name: 'X',
      username: 'x',
      plugins: [REQUIRED_PLUGINS[1], REQUIRED_PLUGINS[0]],
    };
    const r = validateCharacter(ch);
    expect(r.valid).toBeFalse();
    expect(r.errors.length).toBeGreaterThan(0);
  });
});
