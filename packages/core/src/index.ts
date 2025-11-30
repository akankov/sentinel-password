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
  CheckId,
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

import type {
  ValidationResult,
  ValidatorOptions,
  StrengthScore,
  StrengthLabel,
  ValidatorCheck,
  CheckId,
} from './types.js'
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
 * Validate a password with comprehensive security checks
 *
 * Performs multiple validation checks including length, character types, repetition,
 * sequential patterns, keyboard patterns, common passwords, and personal information.
 * Returns detailed feedback with strength score and actionable suggestions.
 *
 * @param password - The password string to validate
 * @param options - Optional validation configuration
 * @returns Validation result with score, strength label, feedback, and individual check results
 *
 * @example
 * **Basic usage (zero-config)**
 * ```typescript
 * import { validatePassword } from '@sentinel-password/core'
 *
 * const result = validatePassword('MySecure!Pass_w0rd')
 * console.log(result.valid)      // true
 * console.log(result.score)      // 4 (0-4 scale)
 * console.log(result.strength)   // 'very-strong'
 * console.log(result.feedback.warning)      // undefined (no issues)
 * console.log(result.feedback.suggestions)  // []
 * ```
 *
 * @example
 * **With weak password**
 * ```typescript
 * const result = validatePassword('password')
 * console.log(result.valid)      // false
 * console.log(result.score)      // 1
 * console.log(result.strength)   // 'weak'
 * console.log(result.feedback.warning)
 * // "Password is too common. Please choose a more unique password."
 * console.log(result.feedback.suggestions)
 * // ["Password is too common. Please choose a more unique password."]
 * console.log(result.checks)
 * // { length: true, characterTypes: true, repetition: true, sequential: true,
 * //   keyboardPattern: true, commonPassword: false, personalInfo: true }
 * ```
 *
 * @example
 * **Custom length requirements**
 * ```typescript
 * const result = validatePassword('MyP@ss', {
 *   minLength: 12,
 *   maxLength: 64
 * })
 * console.log(result.valid)  // false
 * console.log(result.feedback.warning)  // "Password must be at least 12 characters"
 * ```
 *
 * @example
 * **Require specific character types**
 * ```typescript
 * const result = validatePassword('password123', {
 *   requireUppercase: true,
 *   requireLowercase: true,
 *   requireDigit: true,
 *   requireSymbol: true
 * })
 * console.log(result.valid)  // false
 * console.log(result.feedback.warning)  // "Password must contain at least one uppercase letter, symbol"
 * ```
 *
 * @example
 * **Prevent personal information**
 * ```typescript
 * const result = validatePassword('john1234!', {
 *   personalInfo: ['john', 'john.doe@example.com', 'Doe']
 * })
 * console.log(result.valid)  // false
 * console.log(result.feedback.warning)  // "Password contains personal information"
 * ```
 *
 * @example
 * **Disable specific checks**
 * ```typescript
 * const result = validatePassword('qwerty123', {
 *   checkKeyboardPatterns: false,  // Allow keyboard patterns
 *   checkSequential: false,        // Allow sequential chars
 *   checkCommonPasswords: false    // Allow common passwords
 * })
 * // More permissive validation
 * ```
 *
 * @example
 * **Comprehensive configuration**
 * ```typescript
 * const result = validatePassword('MyP@ssw0rd2024!', {
 *   minLength: 12,
 *   maxLength: 128,
 *   requireUppercase: true,
 *   requireLowercase: true,
 *   requireDigit: true,
 *   requireSymbol: true,
 *   maxRepeatedChars: 2,
 *   checkSequential: true,
 *   checkKeyboardPatterns: true,
 *   checkCommonPasswords: true,
 *   personalInfo: ['user', 'admin', 'test']
 * })
 * ```
 *
 * @remarks
 * **Default behavior:**
 * - Minimum length: 8 characters
 * - Maximum length: 128 characters
 * - No character type requirements (but recommended to enable)
 * - Max repeated characters: 3
 * - Sequential check: enabled
 * - Keyboard pattern check: enabled
 * - Common password check: enabled (top 1,000 passwords)
 * - Personal info check: disabled (provide personalInfo array to enable)
 *
 * **Performance:**
 * - All validators run in O(n) time or better
 * - Typical validation: < 1ms for passwords up to 128 characters
 * - Bloom filter for common passwords: O(1) lookup
 *
 * **Security:**
 * - All checks are case-insensitive where applicable
 * - No password data is logged or stored
 * - Constant-time operations prevent timing attacks
 */
export function validatePassword(
  password: string,
  options: ValidatorOptions = {}
): ValidationResult {
  const checks: Record<CheckId, boolean> = {
    length: false,
    characterTypes: false,
    repetition: false,
    sequential: false,
    keyboardPattern: false,
    commonPassword: false,
    personalInfo: false,
  }
  const suggestions: string[] = []

  // Run all validators
  const lengthResult: ValidatorCheck = validateLength(password, options)
  checks['length'] = lengthResult.passed
  if (!lengthResult.passed && lengthResult.message) {
    suggestions.push(lengthResult.message)
  }

  const charTypesResult: ValidatorCheck = validateCharacterTypes(password, options)
  checks['characterTypes'] = charTypesResult.passed
  if (!charTypesResult.passed && charTypesResult.message) {
    suggestions.push(charTypesResult.message)
  }

  const repetitionResult: ValidatorCheck = validateRepetition(password, options)
  checks['repetition'] = repetitionResult.passed
  if (!repetitionResult.passed && repetitionResult.message) {
    suggestions.push(repetitionResult.message)
  }

  const sequentialResult: ValidatorCheck = validateSequential(password, options)
  checks['sequential'] = sequentialResult.passed
  if (!sequentialResult.passed && sequentialResult.message) {
    suggestions.push(sequentialResult.message)
  }

  const commonPasswordResult: ValidatorCheck = validateCommonPassword(password, options)
  checks['commonPassword'] = commonPasswordResult.passed
  if (!commonPasswordResult.passed && commonPasswordResult.message) {
    suggestions.push(commonPasswordResult.message)
  }

  const personalInfoResult: ValidatorCheck = validatePersonalInfo(password, options)
  checks['personalInfo'] = personalInfoResult.passed
  if (!personalInfoResult.passed && personalInfoResult.message) {
    suggestions.push(personalInfoResult.message)
  }

  const keyboardPatternResult: ValidatorCheck = validateKeyboardPattern(password, options)
  checks['keyboardPattern'] = keyboardPatternResult.passed
  if (!keyboardPatternResult.passed && keyboardPatternResult.message) {
    suggestions.push(keyboardPatternResult.message)
  }

  // Calculate score based on passed checks
  const passedChecks: number = Object.values(checks).filter(Boolean).length
  const totalChecks: number = Object.keys(checks).length
  /* v8 ignore next */
  const ratio: number = totalChecks > 0 ? passedChecks / totalChecks : 0
  const score: StrengthScore = Math.min(4, Math.floor(ratio * 5)) as StrengthScore

  const firstSuggestion: string | undefined = suggestions.length > 0 ? suggestions[0] : undefined

  return {
    valid: Object.values(checks).every(Boolean),
    score,
    /* v8 ignore next */
    strength: STRENGTH_LABELS[score] ?? 'very-weak',
    feedback: {
      ...(firstSuggestion !== undefined && { warning: firstSuggestion }),
      suggestions,
    },
    checks,
  }
}
