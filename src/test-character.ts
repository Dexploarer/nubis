import { character } from './agent-hub/character';

console.log('✅ NUBI Character loaded successfully!');
console.log('Name:', character.name);
console.log('Bio:', character.bio.slice(0, 3));
console.log('Topics:', character.topics?.slice(0, 3) || []);
console.log('Plugins count:', character.plugins?.length || 0);
console.log('System prompt length:', character.system?.length || 0);
