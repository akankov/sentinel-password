/**
 * Core type definitions for password validation
 */

/** Strength score from 0 (very weak) to 4 (very strong) */
export type StrengthScore = 0 | 1 | 2 | 3 | 4

/** Human-readable strength label */
export type StrengthLabel = 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong'

/**
 * Individual validator check result
 */
export interface ValidatorCheck {
  /** Whether this check passed */
  passed: boolean
  /** Optional message explaining the result */
  message?: string
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
}

/**
 * Internal validator function type
 */
export type Validator = (password: string, options?: ValidatorOptions) => ValidatorCheck
