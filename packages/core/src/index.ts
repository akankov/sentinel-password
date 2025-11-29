/**
 * @sentinel-password/core
 * Zero-dependency TypeScript password validation library
 */

/** Strength score from 0 (very weak) to 4 (very strong) */
export type StrengthScore = 0 | 1 | 2 | 3 | 4

/** Human-readable strength label */
export type StrengthLabel = 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong'

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
    warning?: string | undefined
    /** Actionable suggestions for improvement */
    suggestions: string[]
  }
  /** Individual check results */
  checks: Record<string, boolean>
}

/**
 * Options for password validation
 */
export interface ValidatorOptions {
  /** Minimum password length (default: 8) */
  minLength?: number
  /** Maximum password length (default: 128) */
  maxLength?: number
}

const STRENGTH_LABELS: readonly StrengthLabel[] = [
  'very-weak',
  'weak',
  'medium',
  'strong',
  'very-strong',
] as const

/**
 * Validate a password with sensible defaults
 *
 * @param password - The password to validate
 * @param options - Validation options
 * @returns Validation result with score, strength, and feedback
 *
 * @example
 * ```typescript
 * import { validatePassword } from '@sentinel-password/core'
 *
 * const result = validatePassword('MySecurePassword123!')
 * console.log(result.valid) // true
 * console.log(result.strength) // 'strong'
 * ```
 */
export function validatePassword(
  password: string,
  options: ValidatorOptions = {}
): ValidationResult {
  const { minLength = 8, maxLength = 128 } = options

  const checks: Record<string, boolean> = {
    minLength: password.length >= minLength,
    maxLength: password.length <= maxLength,
  }

  const passedChecks = Object.values(checks).filter(Boolean).length
  const totalChecks = Object.keys(checks).length
  const ratio = totalChecks > 0 ? passedChecks / totalChecks : 0
  const score = Math.min(4, Math.floor(ratio * 5)) as StrengthScore

  const suggestions: string[] = []
  if (!checks['minLength']) {
    suggestions.push(`Password must be at least ${minLength} characters`)
  }
  if (!checks['maxLength']) {
    suggestions.push(`Password must be at most ${maxLength} characters`)
  }

  return {
    valid: Object.values(checks).every(Boolean),
    score,
    strength: STRENGTH_LABELS[score] ?? 'very-weak',
    feedback: {
      warning: suggestions.length > 0 ? suggestions[0] : undefined,
      suggestions,
    },
    checks,
  }
}
