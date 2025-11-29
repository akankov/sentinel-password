import type { Validator } from '../types'

/**
 * Validates password length against minimum and maximum requirements
 *
 * @param password - Password to validate
 * @param options - Validation options containing minLength and maxLength
 * @returns Validator check result
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
