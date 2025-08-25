import { getExampleAgent } from './example-agent';
import { getCommunityManager } from './community-manager';
import { nubiCharacter } from './nubi';

/**
 * Characters Index - ElizaOS Standard Structure
 * 
 * This file exports all available characters for the ElizaOS project.
 * Each character should be a simple, focused implementation.
 */

export const characters = {
  'Example Agent': getExampleAgent(),
  'Community Manager': getCommunityManager(),
  'Nubi': nubiCharacter,
  // Add more characters here as you create them
  // 'My Custom Agent': getMyCustomAgent(),
  // 'Tech Support': getTechSupport(),
};

export { getExampleAgent } from './example-agent';

export default characters;
