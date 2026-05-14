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
  MessageCode,
  MessageParams,
  MessageFormatter,
} from './types'

export { DEFAULT_TEMPLATES } from './messages'

export { validateLength } from './validators/length'
export {
  hasUppercase,
  hasLowercase,
  hasDigit,
  hasSymbol,
  validateCharacterTypes,
} from './validators/character-types'
export { validateRepetition } from './validators/repetition'
export { validateSequential } from './validators/sequential'
export { validateKeyboardPattern } from './validators/keyboard-pattern'
export { validateCommonPassword } from './validators/common-password'
export { validatePersonalInfo } from './validators/personal-info'

import type {
  ValidationResult,
  ValidatorOptions,
  StrengthScore,
  StrengthLabel,
  ValidatorCheck,
  CheckId,
} from './types'
import { validateLength } from './validators/length'
import { validateCharacterTypes } from './validators/character-types'
import { validateRepetition } from './validators/repetition'
import { validateSequential } from './validators/sequential'
import { validateKeyboardPattern } from './validators/keyboard-pattern'
import { validateCommonPassword } from './validators/common-password'
import { validatePersonalInfo } from './validators/personal-info'

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
 * **With a known-common password**
 * ```typescript
 * const result = validatePassword('password')
 * console.log(result.valid)      // false (commonPassword check rejected it)
 * console.log(result.score)      // 4
 * console.log(result.strength)   // 'very-strong'
 * console.log(result.feedback.warning)
 * // "Password is too common. Please choose a more unique password."
 * console.log(result.feedback.suggestions)
 * // ["Password is too common. Please choose a more unique password."]
 * console.log(result.checks)
 * // { length: true, characterTypes: true, repetition: true, sequential: true,
 * //   keyboardPattern: true, commonPassword: false, personalInfo: true }
 * // ↑ 6 of 7 checks pass, so score is 4 ("very-strong") even though valid is false.
 * // Always use `valid` (or `result.checks`) for acceptance decisions, not `strength`.
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
 * **Scoring:**
 * - `score` = `Math.min(4, Math.floor((passedChecks / 7) * 5))` — purely a
 *   passed-check ratio.
 * - `strength` is the human label for that score (`very-weak` … `very-strong`).
 * - Because scoring is ratio-based, a password that fails *only* the
 *   common-password (or personal-info, or sequential, etc.) check still passes
 *   6 of 7 checks and lands on `score: 4 / strength: 'very-strong'` while
 *   `valid` is `false`. Use `valid` (or inspect `result.checks`) for
 *   acceptance decisions; use `strength` for UX cues like progress bars.
 *
 * **Performance:**
 * - All validators run in O(n) time or better
 * - Typical validation: < 1ms for passwords up to 128 characters
 * - Bloom filter for common passwords: O(1) lookup
 *
 * **Security:**
 * - All checks are case-insensitive where applicable
 * - No password data is logged or stored
 * - Runs purely in-process — no network calls, the password never leaves the
 *   caller's runtime
 * - This is a *strength* validator, not a password-comparison primitive. The
 *   validators use early-return `includes()`/loops and are not constant-time,
 *   but timing is not a relevant attack surface here: the patterns being
 *   checked (length, character types, common-password list, keyboard layouts)
 *   are all public — there's no secret to leak via timing. When you compare
 *   a password against a stored hash, use a library like Argon2/bcrypt that
 *   provides constant-time verification — that's a separate concern from
 *   strength validation.
 */
/** Frozen empty array shared across success-path callers to avoid the
 * per-call `suggestions: []` allocation when no validator fails. */
const EMPTY_SUGGESTIONS: readonly string[] = Object.freeze([])

/** Total number of validators run by `validatePassword`. Compile-time constant. */
const TOTAL_CHECKS: number = 7

export function validatePassword(
  password: string,
  options: ValidatorOptions = {}
): ValidationResult {
  // Run all 7 validators. Captured into individual locals (not an intermediate
  // record) so we can read `.passed` and `.message` once each without going
  // through Object.values/Object.keys iterations.
  const lengthResult: ValidatorCheck = validateLength(password, options)
  const charTypesResult: ValidatorCheck = validateCharacterTypes(password, options)
  const repetitionResult: ValidatorCheck = validateRepetition(password, options)
  const sequentialResult: ValidatorCheck = validateSequential(password, options)
  const commonPasswordResult: ValidatorCheck = validateCommonPassword(password, options)
  const personalInfoResult: ValidatorCheck = validatePersonalInfo(password, options)
  const keyboardPatternResult: ValidatorCheck = validateKeyboardPattern(password, options)

  // Build `checks` and `passedChecks` in a single pass. Lazy-allocate
  // `suggestions` only when a validator actually fails — most calls in
  // practice produce all-passing results and pay no allocation cost.
  const checks: Record<CheckId, boolean> = {
    length: lengthResult.passed,
    characterTypes: charTypesResult.passed,
    repetition: repetitionResult.passed,
    sequential: sequentialResult.passed,
    keyboardPattern: keyboardPatternResult.passed,
    commonPassword: commonPasswordResult.passed,
    personalInfo: personalInfoResult.passed,
  }

  let passedChecks: number = 0
  let suggestions: string[] | undefined
  let firstSuggestion: string | undefined

  /**
   * Accumulate a validator's pass/fail outcome. Increments `passedChecks` on
   * success; otherwise lazy-allocates `suggestions` (so the success-path call
   * pays no array allocation) and records the first message for `feedback.warning`.
   */
  const record = (result: ValidatorCheck): void => {
    if (result.passed) {
      passedChecks++
      return
    }
    /* v8 ignore next */
    if (result.message === undefined) return
    if (suggestions === undefined) {
      suggestions = [result.message]
      firstSuggestion = result.message
    } else {
      suggestions.push(result.message)
    }
  }

  record(lengthResult)
  record(charTypesResult)
  record(repetitionResult)
  record(sequentialResult)
  record(commonPasswordResult)
  record(personalInfoResult)
  record(keyboardPatternResult)

  const score: StrengthScore = Math.min(
    4,
    Math.floor((passedChecks / TOTAL_CHECKS) * 5)
  ) as StrengthScore

  return {
    valid: passedChecks === TOTAL_CHECKS,
    score,
    /* v8 ignore next */
    strength: STRENGTH_LABELS[score] ?? 'very-weak',
    feedback: {
      ...(firstSuggestion !== undefined && { warning: firstSuggestion }),
      suggestions: suggestions ?? EMPTY_SUGGESTIONS,
    },
    checks,
  }
}
