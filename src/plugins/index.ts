/**
 * Plugins Index - ElizaOS Standard Structure
 * 
 * This file exports all available plugins for the ElizaOS project.
 * Follows official ElizaOS plugin patterns and standards.
 */

import { features } from '../config/environment.js';
import { xmcpxPlugin } from './xmcpx-plugin.js';
import { projectPlugin } from './project-plugin.js';
import { socialRaidsPlugin } from './social-raids';

// Export custom plugins
export { xmcpxPlugin, projectPlugin, socialRaidsPlugin };

/**
 * Get plugins based on environment configuration
 * Returns array of Plugin objects and plugin names for ElizaOS
 */
export function getEnabledPlugins() {
  const plugins: any[] = [
    '@elizaos/plugin-bootstrap', // Always included - core functionality
    '@elizaos/plugin-sql',       // Database support
    projectPlugin,               // Always included - our main project functionality
    socialRaidsPlugin,           // Social raids coordination and community management
  ];
  
  // Add conditional plugins based on configuration
  if (features.hasTwitter) {
    plugins.push(xmcpxPlugin);
  }
  
  if (features.hasDiscord) {
    plugins.push('@elizaos/plugin-discord');
  }
  
  if (features.hasTelegram) {
    plugins.push('@elizaos/plugin-telegram');
  }
  
  return plugins;
}
