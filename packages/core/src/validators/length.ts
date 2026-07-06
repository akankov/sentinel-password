import type { MessageParams, Validator } from '../types'
import { resolveMessage } from '../messages'

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
 *
 * Length is counted in Unicode code points (matching `validateRepetition` and
 * NIST 800-63B's user-perceived-character guidance), so an astral character
 * like an emoji counts as 1, not 2 UTF-16 code units — `'😀😁😂🤣'` is length 4.
 */
export const validateLength: Validator = (password, options = {}) => {
  const { minLength = 8, maxLength = 128 }: Partial<{ minLength: number; maxLength: number }> =
    options

  // Count Unicode code points (for...of iterates by code point, unlike
  // .length's UTF-16 code units). Iteration stops one past the larger bound:
  // beyond it the too-short verdict can no longer change and too-long is
  // already decided, which keeps the check O(maxLength) on adversarially
  // long inputs.
  const iterationCap: number = Math.max(minLength, maxLength)
  let length: number = 0
  for (const _char of password) {
    length++
    if (length > iterationCap) {
      break
    }
  }

  if (length < minLength) {
    const params: MessageParams = { minLength }
    return {
      passed: false,
      code: 'length.tooShort',
      params,
      message: resolveMessage('length.tooShort', params, options),
    }
  }

  if (length > maxLength) {
    const params: MessageParams = { maxLength }
    return {
      passed: false,
      code: 'length.tooLong',
      params,
      message: resolveMessage('length.tooLong', params, options),
    }
  }

  return {
    passed: true,
  }
}
