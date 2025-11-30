import type { Validator } from '../types'

/**
 * Validates password length against minimum and maximum requirements
 *
 * @param password - Password to validate
 * @param options - Validation options containing minLength and maxLength
 * @returns Validator check result with passed status and optional error message
 *
 * @example
 * ```typescript
 * import { validateLength } from '@sentinel-password/core'
 *
 * // Default: min 8, max 128 characters
 * validateLength('short') // { passed: false, message: "Password must be at least 8 characters" }
 * validateLength('longenough') // { passed: true }
 *
 * // Custom length requirements
 * validateLength('password', { minLength: 12 }) // { passed: false, message: "..." }
 * validateLength('verylongpassword', { minLength: 12, maxLength: 20 }) // { passed: true }
 * ```
 *
 * @remarks
 * Default minimum length is 8 characters (OWASP recommendation).
 * Default maximum length is 128 characters (prevents DoS attacks).
 */
export const validateLength: Validator = (password, options = {}) => {
  const { minLength = 8, maxLength = 128 }: Partial<{ minLength: number; maxLength: number }> =
    options

  const length: number = password.length

  if (length < minLength) {
    return {
      passed: false,
      message: `Password must be at least ${minLength} characters`,
    }
  }

  if (length > maxLength) {
    return {
      passed: false,
      message: `Password must be at most ${maxLength} characters`,
    }
  }

  return {
    passed: true,
  }
}
