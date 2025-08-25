/**
 * Main Entry Point - ElizaOS Standard Structure
 * 
 * This is the main entry point for your ElizaOS project.
 * It follows the standard ElizaOS pattern for character management.
 */

import { characters } from './characters';

// Export all characters for ElizaOS to discover
export { characters };

// Export individual character getters
export { getExampleAgent } from './characters/example-agent';
export { getCommunityManager } from './characters/community-manager';
export { nubiCharacter } from './characters/nubi';

// Default export for the main characters object
export default characters;
