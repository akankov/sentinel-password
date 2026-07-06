/**
 * Core type definitions for password validation
 */

/** Strength score from 0 (very weak) to 4 (very strong) */
export type StrengthScore = 0 | 1 | 2 | 3 | 4

/** Human-readable strength label */
export type StrengthLabel = 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong'

/**
 * Stable identifiers for validator messages.
 *
 * These codes are part of the public API contract and will never change
 * within a major version. Use them as translation keys with the `messages`
 * or `formatMessage` options instead of relying on the English string in
 * `ValidatorCheck.message`, which is a default rendering — not a key.
 */
export type MessageCode =
  | 'length.tooShort'
  | 'length.tooLong'
  | 'characterTypes.missing'
  | 'repetition.tooMany'
  | 'sequential.found'
  | 'keyboardPattern.found'
  | 'commonPassword.found'
  | 'personalInfo.found'

/**
 * Interpolation values supplied by validators alongside a `MessageCode`.
 */
export type MessageParams = Readonly<Record<string, string | number>>

/**
 * Custom message formatter. Receives the stable `code`, validator-supplied
 * `params`, and the default English rendering. Return value replaces
 * `ValidatorCheck.message`. Use this to integrate i18n libraries like
 * react-intl, i18next, lingui, or FormatJS.
 */
export type MessageFormatter = (
  code: MessageCode,
  params: MessageParams,
  defaultMessage: string
) => string

/**
 * Individual validator check result. A discriminated union on `passed`: the
 * failure branch guarantees `message`, `code`, and `params` are present, so
 * consumers can read them after a `passed === false` narrow without
 * optional-chaining or non-null assertions.
 */
export type ValidatorCheck =
  | { passed: true }
  | {
      passed: false
      /** Default rendering of the message (English unless overridden via options) */
      message: string
      /** Stable, locale-independent identifier for the failure */
      code: MessageCode
      /** Interpolation values for the message template */
      params: MessageParams
    }

/**
 * Identifiers for individual validation checks
 */
export type CheckId =
  | 'length'
  | 'characterTypes'
  | 'repetition'
  | 'sequential'
  | 'keyboardPattern'
  | 'commonPassword'
  | 'personalInfo'

/**
 * Check result returned by a consumer-supplied custom validator. Looser than
 * the internal {@link ValidatorCheck}: `message` is optional (a default is
 * synthesized from the validator's name) and `code` is a free-form string
 * (the built-in {@link MessageCode} union is closed). Built-in `Validator`
 * functions are structurally assignable to {@link CustomValidator}, so they
 * can be re-registered under a custom name too.
 */
export interface CustomValidatorCheck {
  /** Whether the check passed. Anything other than `true` counts as failed. */
  passed: boolean
  /** Rendered failure message. Defaults to `Custom check "<name>" failed`. */
  message?: string
  /**
   * Stable identifier surfaced on {@link ValidationFailure.code}. Defaults to
   * `custom.<name>`. Custom messages are NOT routed through the `messages` /
   * `formatMessage` i18n options — the validator receives the options object
   * and renders its own message.
   */
  code?: string
  /** Interpolation values surfaced on the failure. Defaults to `{}`. */
  params?: MessageParams
}

/**
 * A consumer-supplied validator registered via
 * {@link ValidatorOptions.customValidators}. Must never throw — a throwing
 * validator is defensively treated as a failed check.
 */
export type CustomValidator = (password: string, options?: ValidatorOptions) => CustomValidatorCheck

/**
 * A single failed check, surfaced on {@link ValidationResult.failures} so
 * consumers can localize per-check failures via the stable `code`/`params`
 * without re-running the individual validators.
 */
export interface ValidationFailure {
  /**
   * Which check failed: a built-in {@link CheckId}, or the name a custom
   * validator was registered under. (`string & {}` keeps the built-in
   * literals in editor completions.)
   */
  check: CheckId | (string & {})
  /**
   * Stable, locale-independent failure identifier: a built-in
   * {@link MessageCode}, or `custom.<name>` / the custom validator's own
   * `code` for custom checks.
   */
  code: MessageCode | (string & {})
  /** Interpolation values for the message template. */
  params: MessageParams
  /** Default (English) rendering, or the consumer's `formatMessage` output. */
  message: string
}

/**
 * Result of password validation
 */
export interface ValidationResult {
  /** Whether the password passes all checks */
  valid: boolean
  /** Numeric strength score (0-4) */
  score: StrengthScore
  /** Human-readable strength label */
  strength: StrengthLabel
  /** User-facing feedback */
  feedback: {
    /** Primary warning message if any */
    warning?: string
    /** Actionable suggestions for improvement */
    suggestions: readonly string[]
  }
  /**
   * Individual check results. Always contains the seven built-in
   * {@link CheckId} keys; custom validators appear under their registered
   * names.
   */
  checks: Record<CheckId, boolean> & Record<string, boolean>
  /**
   * Structured per-check failures in evaluation order (empty when every check
   * passes). Carries the stable `code`/`params` that `feedback.suggestions`
   * (pre-rendered strings) and `checks` (booleans) don't expose — use these to
   * localize per failing check from the zero-config `validatePassword` call.
   */
  failures: readonly ValidationFailure[]
}

/**
 * Options for password validation
 */
export interface ValidatorOptions {
  /** Minimum password length (default: 8) */
  minLength?: number
  /** Maximum password length (default: 128) */
  maxLength?: number
  /** Require at least one uppercase letter (default: false) */
  requireUppercase?: boolean
  /** Require at least one lowercase letter (default: false) */
  requireLowercase?: boolean
  /** Require at least one digit (default: false) */
  requireDigit?: boolean
  /** Require at least one symbol (default: false) */
  requireSymbol?: boolean
  /** Maximum allowed repeated characters (default: 3) */
  maxRepeatedChars?: number
  /** Check for sequential patterns (default: true) */
  checkSequential?: boolean
  /** Check for keyboard patterns (default: true) */
  checkKeyboardPatterns?: boolean
  /** Check against common password list (default: true) */
  checkCommonPasswords?: boolean
  /** Personal information to exclude (username, email, name) */
  personalInfo?: string[]
  /**
   * Partial map of stable `MessageCode`s to template strings. Templates may
   * contain `{placeholder}` tokens that are substituted with `params` values.
   * Missing codes fall back to the built-in English defaults.
   */
  messages?: Partial<Record<MessageCode, string>>
  /**
   * Custom formatter invoked for every failed check. Takes precedence over
   * `messages` when both are provided. Use for ICU, react-intl, i18next, etc.
   */
  formatMessage?: MessageFormatter
  /**
   * Consumer-supplied validators, keyed by the check name they appear under
   * in `ValidationResult.checks` / `failures`. They run after the seven
   * built-in checks, count toward `valid` and the strength score (the score
   * denominator grows to `7 + N`), and their failure `message`s join
   * `feedback.suggestions`. Names that collide with a built-in
   * {@link CheckId} are reserved and skipped. Validators must never throw;
   * one that does is treated as a failed check.
   */
  customValidators?: Readonly<Record<string, CustomValidator>>
}

/**
 * Internal validator function type
 */
export type Validator = (password: string, options?: ValidatorOptions) => ValidatorCheck
