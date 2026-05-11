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
 * Individual validator check result
 */
export interface ValidatorCheck {
  /** Whether this check passed */
  passed: boolean
  /** Default rendering of the message (English unless overridden via options) */
  message?: string
  /** Stable, locale-independent identifier for the failure (`undefined` when `passed: true`) */
  code?: MessageCode
  /** Interpolation values for the message template (`undefined` when `passed: true`) */
  params?: MessageParams
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
  /** Individual check results */
  checks: Record<CheckId, boolean>
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
}

/**
 * Internal validator function type
 */
export type Validator = (password: string, options?: ValidatorOptions) => ValidatorCheck
