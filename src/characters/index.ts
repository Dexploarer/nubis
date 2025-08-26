import { character } from './nubi.js';

export { character as nubi } from './nubi.js';
export { createCharacterFromTemplate } from './template.js';

// Export default character (can be changed based on environment)
export { character as defaultCharacter } from './nubi.js';

// Helper to get character by name
export function getCharacter(name?: string) {
  switch (name?.toLowerCase()) {
    case 'nubi':
      return character;
    default:
      return character;
  }
}
