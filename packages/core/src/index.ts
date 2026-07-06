/**
 * @sentinel-password/core
 * Zero-dependency TypeScript password validation library
 */

export type {
  StrengthScore,
  StrengthLabel,
  ValidationResult,
  ValidationFailure,
  ValidatorOptions,
  ValidatorCheck,
  Validator,
  CustomValidator,
  CustomValidatorCheck,
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
  ValidationFailure,
  ValidatorOptions,
  StrengthScore,
  StrengthLabel,
  ValidatorCheck,
  CustomValidatorCheck,
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
 * **Register custom validators**
 * ```typescript
 * const result = validatePassword('hunter2-Corp!', {
 *   customValidators: {
 *     noCompanyName: (pw) =>
 *       pw.toLowerCase().includes('corp')
 *         ? { passed: false, message: 'Password must not contain the company name' }
 *         : { passed: true },
 *   },
 * })
 * console.log(result.checks.noCompanyName) // false
 * console.log(result.valid)                // false
 * console.log(result.failures.at(-1)?.code) // 'custom.noCompanyName'
 * // Custom checks join the score denominator (7 built-ins + N custom).
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
 * - `score` = `Math.min(4, Math.floor((passedChecks / totalChecks) * 5))` —
 *   purely a passed-check ratio. `totalChecks` is 7 for the built-ins plus
 *   one per registered custom validator.
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

/** Frozen empty array shared by the all-passing path (no per-call allocation). */
const EMPTY_FAILURES: readonly ValidationFailure[] = Object.freeze([])

/** Number of built-in validators run by `validatePassword`. Compile-time constant. */
const TOTAL_BUILTIN_CHECKS: number = 7

/**
 * Built-in check names. Custom validators may not register under these — a
 * collision would overwrite the built-in entry in `result.checks`, so
 * colliding names are skipped (documented on `ValidatorOptions.customValidators`).
 */
const BUILTIN_CHECK_IDS: ReadonlySet<string> = new Set<string>([
  'length',
  'characterTypes',
  'repetition',
  'sequential',
  'keyboardPattern',
  'commonPassword',
  'personalInfo',
])

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
  const checks: Record<CheckId, boolean> & Record<string, boolean> = {
    length: lengthResult.passed,
    characterTypes: charTypesResult.passed,
    repetition: repetitionResult.passed,
    sequential: sequentialResult.passed,
    keyboardPattern: keyboardPatternResult.passed,
    commonPassword: commonPasswordResult.passed,
    personalInfo: personalInfoResult.passed,
  }

  let passedChecks: number = 0
  let failures: ValidationFailure[] | undefined

  /**
   * Accumulate a validator's pass/fail outcome. Increments `passedChecks` on
   * success; otherwise lazy-allocates `failures` (so the all-passing path pays
   * no array allocation) with the stable code/params. The discriminated
   * `ValidatorCheck` guarantees message/code/params are present once `passed` is
   * `false`, so no presence guard is needed. `feedback` is derived from
   * `failures` below — a single source of truth for warning/suggestions.
   */
  const record = (check: CheckId, result: ValidatorCheck): void => {
    if (result.passed) {
      passedChecks++
      return
    }
    const failure: ValidationFailure = {
      check,
      code: result.code,
      params: result.params,
      message: result.message,
    }
    if (failures === undefined) {
      failures = [failure]
    } else {
      failures.push(failure)
    }
  }

  record('length', lengthResult)
  record('characterTypes', charTypesResult)
  record('repetition', repetitionResult)
  record('sequential', sequentialResult)
  record('commonPassword', commonPasswordResult)
  record('personalInfo', personalInfoResult)
  record('keyboardPattern', keyboardPatternResult)

  // Run consumer-registered custom validators after the built-ins. Each one
  // adds a slot to `checks`, counts toward `valid` and the score denominator,
  // and contributes its failure message to the suggestions. `validatePassword`
  // must never throw, so a throwing or malformed custom validator is treated
  // as a failed check rather than propagated.
  let totalChecks: number = TOTAL_BUILTIN_CHECKS
  if (options.customValidators !== undefined) {
    for (const [name, customValidator] of Object.entries(options.customValidators)) {
      if (BUILTIN_CHECK_IDS.has(name)) {
        continue // reserved: would overwrite a built-in entry in `checks`
      }
      totalChecks++

      let customResult: CustomValidatorCheck
      try {
        customResult = customValidator(password, options)
      } catch {
        customResult = { passed: false, message: `Custom check "${name}" threw an error` }
      }

      // Anything other than a literal `true` (including a malformed return)
      // counts as failed — fail closed, mirroring the never-silently-safe
      // posture of the built-ins.
      const customPassed: boolean = customResult?.passed === true
      checks[name] = customPassed
      if (customPassed) {
        passedChecks++
        continue
      }

      const failure: ValidationFailure = {
        check: name,
        code: typeof customResult?.code === 'string' ? customResult.code : `custom.${name}`,
        params: customResult?.params ?? {},
        message:
          typeof customResult?.message === 'string'
            ? customResult.message
            : `Custom check "${name}" failed`,
      }
      if (failures === undefined) {
        failures = [failure]
      } else {
        failures.push(failure)
      }
    }
  }

  const score: StrengthScore = Math.min(
    4,
    Math.floor((passedChecks / totalChecks) * 5)
  ) as StrengthScore

  const suggestions: readonly string[] = failures
    ? failures.map((failure) => failure.message)
    : EMPTY_SUGGESTIONS
  const firstSuggestion: string | undefined = failures?.[0]?.message

  return {
    valid: passedChecks === totalChecks,
    score,
    /* v8 ignore next */
    strength: STRENGTH_LABELS[score] ?? 'very-weak',
    feedback: {
      ...(firstSuggestion !== undefined && { warning: firstSuggestion }),
      suggestions,
    },
    checks,
    failures: failures ?? EMPTY_FAILURES,
  }
}
