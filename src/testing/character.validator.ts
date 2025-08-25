import type { Character } from "@elizaos/core";
import { 
  CharacterSchema, 
  ValidatedCharacter, 
  validateCharacterSafe 
} from '../schemas/character.schema';
import { CharacterFactory, CharacterValidationError } from '../factories/character.factory';

/**
 * Character Validation Result
 */
export interface CharacterValidationResult {
  isValid: boolean;
  character?: ValidatedCharacter;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  score: number;
  details: {
    basicValidation: boolean;
    pluginValidation: boolean;
    settingsValidation: boolean;
    styleValidation: boolean;
    examplesValidation: boolean;
  };
}

/**
 * Character Testing Configuration
 */
export interface CharacterTestConfig {
  /** Run comprehensive tests */
  comprehensive: boolean;
  
  /** Validate plugin availability */
  validatePlugins: boolean;
  
  /** Check for common issues */
  checkCommonIssues: boolean;
  
  /** Validate settings consistency */
  validateSettings: boolean;
  
  /** Test character examples */
  testExamples: boolean;
  
  /** Environment for testing */
  environment: 'development' | 'staging' | 'production';
}

/**
 * Character Validator
 * Comprehensive testing and validation for ElizaOS characters
 */
export class CharacterValidator {
  private static readonly COMMON_ISSUES = {
    missingBio: 'Character bio is missing or too short',
    missingTopics: 'Character topics are missing or too generic',
    missingPlugins: 'Required plugins are missing',
    pluginOrder: 'Plugin order is incorrect (SQL plugin should be first)',
    missingSettings: 'Important settings are missing',
    inconsistentStyle: 'Style guidelines are inconsistent',
    missingExamples: 'Message examples are missing',
    weakExamples: 'Message examples are too generic',
    missingTemplates: 'Custom templates are missing',
    secretsInCode: 'Secrets are hardcoded instead of using environment variables',
  };

  private static readonly REQUIRED_PLUGINS = [
    '@elizaos/plugin-bootstrap',
  ];

  private static readonly RECOMMENDED_PLUGINS = [
    '@elizaos/plugin-sql',
    '@elizaos/plugin-discord',
    '@elizaos/plugin-telegram',
  ];

  /**
   * Validate a character comprehensively
   */
  static async validateCharacter(
    character: Character | unknown,
    config: Partial<CharacterTestConfig> = {}
  ): Promise<CharacterValidationResult> {
    const testConfig: CharacterTestConfig = {
      comprehensive: true,
      validatePlugins: true,
      checkCommonIssues: true,
      validateSettings: true,
      testExamples: true,
      environment: 'development',
      ...config,
    };

    const result: CharacterValidationResult = {
      isValid: false,
      errors: [],
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

    try {
      // Step 1: Basic schema validation
      const validation = validateCharacterSafe(character);
      if (!validation.success) {
        result.errors.push(...(validation.errors || []));
        return result;
      }

      result.character = validation.character;
      result.details.basicValidation = true;

      // Step 2: Factory validation
      try {
        await CharacterFactory.createCharacter(character, {
          environment: testConfig.environment,
          validatePlugins: testConfig.validatePlugins,
        });
        result.details.pluginValidation = true;
      } catch (error) {
        if (error instanceof CharacterValidationError) {
          result.errors.push(...(error.validationErrors || [error.message]));
        } else {
          result.errors.push(`Factory validation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      // Step 3: Comprehensive validation if enabled
      if (testConfig.comprehensive) {
        await this.performComprehensiveValidation(result, testConfig);
      }

      // Step 4: Calculate score
      result.score = this.calculateScore(result);

      // Step 5: Determine overall validity
      result.isValid = result.errors.length === 0 && result.score >= 70;

      return result;

    } catch (error) {
      result.errors.push(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
      return result;
    }
  }

  /**
   * Perform comprehensive validation
   */
  private static async performComprehensiveValidation(
    result: CharacterValidationResult,
    config: CharacterTestConfig
  ): Promise<void> {
    if (!result.character) return;

    const character = result.character;

    // Check for common issues
    if (config.checkCommonIssues) {
      this.checkCommonIssues(character, result);
    }

    // Validate settings
    if (config.validateSettings) {
      this.validateSettings(character, result);
    }

    // Validate style consistency
    if (config.checkCommonIssues) {
      this.validateStyle(character, result);
    }

    // Test examples
    if (config.testExamples) {
      this.testExamples(character, result);
    }

    // Generate suggestions
    this.generateSuggestions(character, result);
  }

  /**
   * Check for common character issues
   */
  private static checkCommonIssues(
    character: ValidatedCharacter,
    result: CharacterValidationResult
  ): void {
    // Check bio
    if (!character.bio || 
        (Array.isArray(character.bio) && character.bio.length === 0) ||
        (typeof character.bio === 'string' && character.bio.length < 10)) {
      result.warnings.push(this.COMMON_ISSUES.missingBio);
    }

    // Check topics
    if (!character.topics || character.topics.length === 0) {
      result.errors.push(this.COMMON_ISSUES.missingTopics);
    } else if (character.topics.length === 1 && character.topics[0] === 'general assistance') {
      result.warnings.push('Topics are too generic, consider adding specific expertise areas');
    }

    // Check plugins
    if (!character.plugins || character.plugins.length === 0) {
      result.warnings.push(this.COMMON_ISSUES.missingPlugins);
    } else {
      // Check required plugins
      for (const required of this.REQUIRED_PLUGINS) {
        if (!character.plugins.includes(required)) {
          result.errors.push(`Required plugin missing: ${required}`);
        }
      }

      // Check plugin order
      const sqlPluginIndex = character.plugins.findIndex(p => p.includes('plugin-sql'));
      if (sqlPluginIndex > 0) {
        result.errors.push(this.COMMON_ISSUES.pluginOrder);
      }

      // Check for recommended plugins
      const hasRecommended = this.RECOMMENDED_PLUGINS.some(p => character.plugins.includes(p));
      if (!hasRecommended) {
        result.suggestions.push('Consider adding recommended plugins for enhanced functionality');
      }
    }

    // Check examples
    if (!character.messageExamples || character.messageExamples.length === 0) {
      result.warnings.push(this.COMMON_ISSUES.missingExamples);
    }

    // Check templates
    if (!character.templates || Object.keys(character.templates).length === 0) {
      result.suggestions.push('Consider adding custom templates for better response consistency');
    }
  }

  /**
   * Validate character settings
   */
  private static validateSettings(
    character: ValidatedCharacter,
    result: CharacterValidationResult
  ): void {
    if (!character.settings) {
      result.warnings.push('No settings configured, using defaults');
      return;
    }

    const settings = character.settings;

    // Check ElizaOS settings
    if (settings.elizaos) {
      const elizaos = settings.elizaos;

      // Check Discord settings
      if (elizaos.discord) {
        if (elizaos.discord.requireMention === false) {
          result.warnings.push('Discord requireMention is disabled - this may cause spam');
        }
        if (elizaos.discord.responseCooldown && elizaos.discord.responseCooldown < 3) {
          result.warnings.push('Discord response cooldown is very low - may cause rate limiting');
        }
      }

      // Check memory settings
      if (settings.memory) {
        const memory = settings.memory;
        if (memory.facts && memory.facts.retentionDays && memory.facts.retentionDays < 30) {
          result.warnings.push('Facts retention is very short - consider increasing for better context');
        }
        if (memory.messages && memory.messages.retentionDays && memory.messages.retentionDays < 7) {
          result.warnings.push('Message retention is very short - may lose conversation context');
        }
      }
    }

    result.details.settingsValidation = true;
  }

  /**
   * Validate character style consistency
   */
  private static validateStyle(
    character: ValidatedCharacter,
    result: CharacterValidationResult
  ): void {
    if (!character.style) {
      result.warnings.push('No style guidelines defined');
      return;
    }

    const style = character.style;
    let hasInconsistencies = false;

    // Check if style guidelines are present
    if (!style.all || style.all.length === 0) {
      result.warnings.push('No general style guidelines defined');
      hasInconsistencies = true;
    }

    // Check for conflicting style guidelines
    if (style.all && style.chat) {
      const allGuidelines = style.all.join(' ').toLowerCase();
      const chatGuidelines = style.chat.join(' ').toLowerCase();
      
      // Check for contradictions
      if (allGuidelines.includes('formal') && chatGuidelines.includes('casual')) {
        result.warnings.push('Conflicting style guidelines: general is formal but chat is casual');
        hasInconsistencies = true;
      }
    }

    // Check style completeness
    if (!style.chat && !style.post) {
      result.suggestions.push('Consider adding specific style guidelines for chat and post contexts');
    }

    result.details.styleValidation = !hasInconsistencies;
  }

  /**
   * Test character examples
   */
  private static testExamples(
    character: ValidatedCharacter,
    result: CharacterValidationResult
  ): void {
    if (!character.messageExamples || character.messageExamples.length === 0) {
      result.details.examplesValidation = false;
      return;
    }

    let validExamples = 0;
    const totalExamples = character.messageExamples.length;

    for (const example of character.messageExamples) {
      if (this.isValidExample(example)) {
        validExamples++;
      }
    }

    const exampleQuality = validExamples / totalExamples;

    if (exampleQuality < 0.5) {
      result.warnings.push('Many message examples are invalid or incomplete');
    } else if (exampleQuality < 0.8) {
      result.suggestions.push('Some message examples could be improved');
    }

    if (totalExamples < 3) {
      result.suggestions.push('Consider adding more message examples for better training');
    }

    result.details.examplesValidation = exampleQuality >= 0.7;
  }

  /**
   * Check if an example is valid
   */
  private static isValidExample(example: any[]): boolean {
    if (!Array.isArray(example) || example.length < 2) {
      return false;
    }

    // Check user message
    const userMessage = example[0];
    if (!userMessage || !userMessage.content || !userMessage.content.text) {
      return false;
    }

    // Check agent response
    const agentResponse = example[1];
    if (!agentResponse || !agentResponse.content || !agentResponse.content.text) {
      return false;
    }

    // Check for meaningful content
    if (userMessage.content.text.length < 5 || agentResponse.content.text.length < 10) {
      return false;
    }

    return true;
  }

  /**
   * Generate improvement suggestions
   */
  private static generateSuggestions(
    character: ValidatedCharacter,
    result: CharacterValidationResult
  ): void {
    // Plugin suggestions
    if (character.plugins && character.plugins.length < 3) {
      result.suggestions.push('Consider adding more plugins for enhanced functionality');
    }

    // Knowledge suggestions
    if (!character.knowledge || character.knowledge.length === 0) {
      result.suggestions.push('Add knowledge base files for better context and responses');
    }

    // Adjective suggestions
    if (!character.adjectives || character.adjectives.length < 3) {
      result.suggestions.push('Add more personality adjectives for richer character definition');
    }

    // System prompt suggestions
    if (!character.system || character.system.length < 100) {
      result.suggestions.push('Consider expanding the system prompt for better behavior definition');
    }

    // Settings suggestions
    if (!character.settings?.elizaos?.memory) {
      result.suggestions.push('Configure memory settings for optimal knowledge retention');
    }
  }

  /**
   * Calculate character quality score
   */
  private static calculateScore(result: CharacterValidationResult): number {
    let score = 0;
    const maxScore = 100;

    // Basic validation (30 points)
    if (result.details.basicValidation) {
      score += 30;
    }

    // Plugin validation (20 points)
    if (result.details.pluginValidation) {
      score += 20;
    }

    // Settings validation (15 points)
    if (result.details.settingsValidation) {
      score += 15;
    }

    // Style validation (15 points)
    if (result.details.styleValidation) {
      score += 15;
    }

    // Examples validation (20 points)
    if (result.details.examplesValidation) {
      score += 20;
    }

    // Deduct points for errors and warnings
    score -= result.errors.length * 5;
    score -= result.warnings.length * 2;

    // Ensure score is within bounds
    return Math.max(0, Math.min(maxScore, score));
  }

  /**
   * Get validation summary
   */
  static getValidationSummary(result: CharacterValidationResult): string {
    const status = result.isValid ? '✅ VALID' : '❌ INVALID';
    const score = `${result.score}/100`;
    
    let summary = `Character Validation: ${status} (Score: ${score})\n\n`;
    
    if (result.errors.length > 0) {
      summary += `Errors (${result.errors.length}):\n`;
      result.errors.forEach(error => summary += `  ❌ ${error}\n`);
      summary += '\n';
    }
    
    if (result.warnings.length > 0) {
      summary += `Warnings (${result.warnings.length}):\n`;
      result.warnings.forEach(warning => summary += `  ⚠️  ${warning}\n`);
      summary += '\n';
    }
    
    if (result.suggestions.length > 0) {
      summary += `Suggestions (${result.suggestions.length}):\n`;
      result.suggestions.forEach(suggestion => summary += `  💡 ${suggestion}\n`);
      summary += '\n';
    }
    
    summary += `Details:\n`;
    summary += `  Basic Validation: ${result.details.basicValidation ? '✅' : '❌'}\n`;
    summary += `  Plugin Validation: ${result.details.pluginValidation ? '✅' : '❌'}\n`;
    summary += `  Settings Validation: ${result.details.settingsValidation ? '✅' : '❌'}\n`;
    summary += `  Style Validation: ${result.details.styleValidation ? '✅' : '❌'}\n`;
    summary += `  Examples Validation: ${result.details.examplesValidation ? '✅' : '❌'}\n`;
    
    return summary;
  }

  /**
   * Validate multiple characters
   */
  static async validateCharacters(
    characters: Record<string, Character | unknown>,
    config?: Partial<CharacterTestConfig>
  ): Promise<Record<string, CharacterValidationResult>> {
    const results: Record<string, CharacterValidationResult> = {};
    
    for (const [name, character] of Object.entries(characters)) {
      try {
        results[name] = await this.validateCharacter(character, config);
      } catch (error) {
        results[name] = {
          isValid: false,
          errors: [`Validation failed: ${error instanceof Error ? error.message : String(error)}`],
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
    
    return results;
  }
}

// Export validator instance and utility functions
export const characterValidator = CharacterValidator;
export default CharacterValidator;
