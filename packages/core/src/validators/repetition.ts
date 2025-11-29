import type { Validator, ValidatorOptions } from '../types'

/**
 * Validates that password doesn't contain excessive repeated characters
 *
 * Uses a single-pass algorithm to detect consecutive repeated characters
 *
 * @param password - Password to validate
 * @param options - Validation options containing maxRepeatedChars
 * @returns Validator check result
 */
export const validateRepetition: Validator = (password, options = {}) => {
  const { maxRepeatedChars = 3 } = options as Required<Pick<ValidatorOptions, 'maxRepeatedChars'>> &
    ValidatorOptions

  if (password.length === 0) {
    return { passed: true }
  }

  let currentChar = password[0]
  let count = 1

  for (let i = 1; i < password.length; i++) {
    if (password[i] === currentChar) {
      count++
      if (count > maxRepeatedChars) {
        return {
          passed: false,
          message: `Password contains too many repeated characters (max ${maxRepeatedChars})`,
        }
      }
    } else {
      currentChar = password[i]
      count = 1
    }
  }

  return {
    passed: true,
  }
}
