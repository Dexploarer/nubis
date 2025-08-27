export interface CharacterValidationIssue {
  code: string;
  message: string;
  path?: string[];
}

export interface CharacterValidationResult {
  valid: boolean;
  issues: CharacterValidationIssue[];
  score?: number;
}

export const COMMON_ISSUES = {
  MISSING_NAME: 'MISSING_NAME',
  MISSING_USERNAME: 'MISSING_USERNAME',
};

export function validateBasicCharacterShape(_ch: any): CharacterValidationResult {
  return { valid: true, issues: [] };
}
