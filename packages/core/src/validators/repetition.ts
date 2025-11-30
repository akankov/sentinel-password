import type { Validator } from '../types'

/**
 * Validates that password doesn't contain excessive repeated characters
 *
 * Uses a single-pass algorithm to detect consecutive repeated characters.
 * Helps prevent weak passwords like "aaaa1111" or "passwordddd".
 *
 * @param password - Password to validate
 * @param options - Validation options containing maxRepeatedChars
 * @returns Validator check result with passed status and optional error message
 *
 * @example
 * ```typescript
 * import { validateRepetition } from '@sentinel-password/core'
 *
 * // Default: max 3 repeated characters
 * validateRepetition('password') // { passed: true }
 * validateRepetition('passsword') // { passed: true } (3 s's)
 * validateRepetition('passssword') // { passed: false } (4 s's)
 *
 * // Custom limit
 * validateRepetition('passssword', { maxRepeatedChars: 5 }) // { passed: true }
 * validateRepetition('aaa') // { passed: true }
 * validateRepetition('aaaa') // { passed: false, message: "Password contains too many repeated characters (max 3)" }
 * ```
 *
 * @remarks
 * Default maximum is 3 consecutive repeated characters.
 * Only checks for consecutive repetition, not overall character frequency.
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
