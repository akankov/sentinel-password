/**
 * @sentinel-password/core
 * Zero-dependency TypeScript password validation library
 */

export type {
  StrengthScore,
  StrengthLabel,
  ValidationResult,
  ValidatorOptions,
  ValidatorCheck,
  Validator,
} from './types.js'

export { validateLength } from './validators/length.js'
export {
  hasUppercase,
  hasLowercase,
  hasDigit,
  hasSymbol,
  validateCharacterTypes,
} from './validators/character-types.js'
export { validateRepetition } from './validators/repetition.js'
export { validateSequential } from './validators/sequential.js'
export { validateKeyboardPattern } from './validators/keyboard-pattern.js'
export { validateCommonPassword } from './validators/common-password.js'
export { validatePersonalInfo } from './validators/personal-info.js'

import type { ValidationResult, ValidatorOptions, StrengthScore, StrengthLabel } from './types.js'
import { validateLength } from './validators/length.js'
import { validateCharacterTypes } from './validators/character-types.js'
import { validateRepetition } from './validators/repetition.js'
import { validateSequential } from './validators/sequential.js'
import { validateKeyboardPattern } from './validators/keyboard-pattern.js'
import { validateCommonPassword } from './validators/common-password.js'
import { validatePersonalInfo } from './validators/personal-info.js'

const STRENGTH_LABELS: readonly StrengthLabel[] = [
  'very-weak',
  'weak',
  'medium',
  'strong',
  'very-strong',
] as const

/**
 * Validate a password with comprehensive checks
 *
 * @param password - The password to validate
 * @param options - Validation options
 * @returns Validation result with score, strength, and feedback
 *
 * @example
 * ```typescript
 * import { validatePassword } from '@sentinel-password/core'
 *
 * const result = validatePassword('MySecurePassword135!')
 * console.log(result.valid) // true
 * console.log(result.strength) // 'strong'
 * ```
 */
export function validatePassword(
  password: string,
  options: ValidatorOptions = {}
): ValidationResult {
  const checks: Record<string, boolean> = {}
  const suggestions: string[] = []

  // Run all validators
  const lengthResult = validateLength(password, options)
  checks['length'] = lengthResult.passed
  if (!lengthResult.passed && lengthResult.message) {
    suggestions.push(lengthResult.message)
  }

  const charTypesResult = validateCharacterTypes(password, options)
  checks['characterTypes'] = charTypesResult.passed
  if (!charTypesResult.passed && charTypesResult.message) {
    suggestions.push(charTypesResult.message)
  }

  const repetitionResult = validateRepetition(password, options)
  checks['repetition'] = repetitionResult.passed
  if (!repetitionResult.passed && repetitionResult.message) {
    suggestions.push(repetitionResult.message)
  }

  const sequentialResult = validateSequential(password, options)
  checks['sequential'] = sequentialResult.passed
  if (!sequentialResult.passed && sequentialResult.message) {
    suggestions.push(sequentialResult.message)
  }

  const commonPasswordResult = validateCommonPassword(password, options)
  checks['commonPassword'] = commonPasswordResult.passed
  if (!commonPasswordResult.passed && commonPasswordResult.message) {
    suggestions.push(commonPasswordResult.message)
  }

  const personalInfoResult = validatePersonalInfo(password, options)
  checks['personalInfo'] = personalInfoResult.passed
  if (!personalInfoResult.passed && personalInfoResult.message) {
    suggestions.push(personalInfoResult.message)
  }

  const keyboardPatternResult = validateKeyboardPattern(password, options)
  checks['keyboardPattern'] = keyboardPatternResult.passed
  if (!keyboardPatternResult.passed && keyboardPatternResult.message) {
    suggestions.push(keyboardPatternResult.message)
  }

  // Calculate score based on passed checks
  const passedChecks = Object.values(checks).filter(Boolean).length
  const totalChecks = Object.keys(checks).length
  const ratio = totalChecks > 0 ? passedChecks / totalChecks : 0
  const score = Math.min(4, Math.floor(ratio * 5)) as StrengthScore

  const firstSuggestion = suggestions.length > 0 ? suggestions[0] : undefined

  return {
    valid: Object.values(checks).every(Boolean),
    score,
    strength: STRENGTH_LABELS[score] ?? 'very-weak',
    feedback: {
      ...(firstSuggestion !== undefined && { warning: firstSuggestion }),
      suggestions,
    },
    checks,
  }
}
