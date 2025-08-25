import { getExampleAgent } from './example-agent';
import { getCommunityManager } from './community-manager';
import { nubiCharacter } from './nubi';
import { CharacterFactory } from '../factories/character.factory';
import { CharacterValidator } from '../testing/character.validator';

/**
 * Characters Index - ElizaOS Standard Structure with Validation
 * 
 * This file exports all available characters for the ElizaOS project.
 * Each character is validated using the new validation system.
 */

/**
 * Get all characters with validation
 */
export async function getValidatedCharacters() {
  const rawCharacters = {
    'Example Agent': getExampleAgent(),
    'Community Manager': getCommunityManager(),
    'Nubi': nubiCharacter,
  };

  const validatedCharacters: Record<string, any> = {};
  const validationResults: Record<string, any> = {};

  for (const [name, character] of Object.entries(rawCharacters)) {
    try {
      // Validate character using factory
      const validated = await CharacterFactory.createCharacter(character, {
        environment: process.env.NODE_ENV as 'development' | 'staging' | 'production' || 'development',
        validatePlugins: true,
      });

      validatedCharacters[name] = validated;
      
      // Run comprehensive validation
      const validation = await CharacterValidator.validateCharacter(validated, {
        comprehensive: true,
        validatePlugins: true,
        checkCommonIssues: true,
        validateSettings: true,
        testExamples: true,
        environment: process.env.NODE_ENV as 'development' | 'staging' | 'production' || 'development',
      });

      validationResults[name] = validation;

      // Log validation results
      if (!validation.isValid) {
        console.warn(`Character "${name}" validation issues:`, validation.errors);
        if (validation.warnings.length > 0) {
          console.warn(`Character "${name}" warnings:`, validation.warnings);
        }
      } else {
        console.info(`Character "${name}" validated successfully (Score: ${validation.score}/100)`);
      }

    } catch (error) {
      console.error(`Failed to validate character "${name}":`, error);
      
      // Fallback to raw character if validation fails
      validatedCharacters[name] = character;
      validationResults[name] = {
        isValid: false,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: [],
        suggestions: [],
        score: 0,
        details: {
          basicValidation: false,
          pluginValidation: false,
          settingsValidation: false,
          styleValidation: false,
          examplesValidation: false,
        },
      };
    }
  }

  return {
    characters: validatedCharacters,
    validation: validationResults,
  };
}

/**
 * Get a specific validated character
 */
export async function getValidatedCharacter(name: string) {
  const { characters, validation } = await getValidatedCharacters();
  
  if (!characters[name]) {
    throw new Error(`Character "${name}" not found`);
  }

  return {
    character: characters[name],
    validation: validation[name],
  };
}

/**
 * Get character validation summary
 */
export async function getCharacterValidationSummary() {
  const { validation } = await getValidatedCharacters();
  
  const summary: Record<string, string> = {};
  
  for (const [name, result] of Object.entries(validation)) {
    summary[name] = CharacterValidator.getValidationSummary(result);
  }
  
  return summary;
}

/**
 * Legacy exports for backward compatibility
 */
export const characters = {
  'Example Agent': getExampleAgent(),
  'Community Manager': getCommunityManager(),
  'Nubi': nubiCharacter,
};

export { getExampleAgent } from './example-agent';
export { getCommunityManager } from './community-manager';
export { nubiCharacter } from './nubi';

export default characters;
