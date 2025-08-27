import type { Character } from '@elizaos/core';
import { Nubi, Buni } from './characters';

export function getValidatedCharacters(): Character[] {
  return [Nubi, Buni];
}
