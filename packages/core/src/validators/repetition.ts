import type { Validator } from '../types'

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
  const { maxRepeatedChars = 3 }: Partial<{ maxRepeatedChars: number }> = options

  if (password.length === 0) {
    return { passed: true }
  }

  let currentChar: string = password.charAt(0)
  let count: number = 1

  for (let i: number = 1; i < password.length; i++) {
    const char: string = password.charAt(i)
    if (char === currentChar) {
      count++
      if (count > maxRepeatedChars) {
        return {
          passed: false,
          message: `Password contains too many repeated characters (max ${maxRepeatedChars})`,
        }
      }
    } else {
      currentChar = char
      count = 1
    }
  }

  return {
    passed: true,
  }
}
