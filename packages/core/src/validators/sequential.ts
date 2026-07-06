import type { MessageParams, Validator } from '../types'
import { resolveMessage } from '../messages'

/**
 * Whether a char code can participate in a "sequential" run: ASCII digits,
 * ASCII letters, or any non-ASCII code (covering alphabets like Cyrillic,
 * whose letters are also code-point-consecutive). Excluding ASCII
 * symbols/punctuation stops runs like '()*', '?@A', or '[\]' — common in
 * password-manager output — from being flagged as "abc/123"-style sequences.
 */
const isSequenceCandidate = (code: number): boolean =>
  (code >= 48 && code <= 57) || // 0-9
  (code >= 65 && code <= 90) || // A-Z
  (code >= 97 && code <= 122) || // a-z
  code > 127 // non-ASCII (e.g. Cyrillic, Greek)

/**
 * Detects sequential character patterns (ascending or descending)
 * Checks for sequences of 3 or more consecutive characters
 *
 * Only runs whose endpoints are both letters or digits count: the ASCII
 * alphanumeric ranges are non-contiguous (gaps of 7+ code points between
 * digits, uppercase, and lowercase), so a consecutive triple with both
 * endpoints in-class necessarily stays within a single class.
 *
 * @param str - String to check for sequences
 * @returns true if sequential pattern found, false otherwise
 */
const hasSequentialPattern = (str: string): boolean => {
  const minSequenceLength: number = 3

  for (let i: number = 0; i <= str.length - minSequenceLength; i++) {
    const charCode1: number = str.charCodeAt(i)
    const charCode2: number = str.charCodeAt(i + 1)
    const charCode3: number = str.charCodeAt(i + 2)

    // Check ascending sequence (e.g., abc, 123)
    if (
      charCode2 === charCode1 + 1 &&
      charCode3 === charCode2 + 1 &&
      isSequenceCandidate(charCode1) &&
      isSequenceCandidate(charCode3)
    ) {
      return true
    }

    // Check descending sequence (e.g., cba, 321)
    if (
      charCode2 === charCode1 - 1 &&
      charCode3 === charCode2 - 1 &&
      isSequenceCandidate(charCode1) &&
      isSequenceCandidate(charCode3)
    ) {
      return true
    }
  }

  return false
}

/**
 * Validates that password doesn't contain sequential character patterns
 *
 * Detects sequences like: abc, ABC, 123, 321, xyz, etc.
 * Uses character code comparison for efficient detection.
 * Helps prevent predictable passwords with keyboard sequences.
 *
 * @param password - Password to validate
 * @param options - Validation options containing checkSequential flag
 * @returns Validator check result with passed status and optional error message
 *
 * @example
 * ```typescript
 * import { validateSequential } from '@sentinel-password/core'
 *
 * // Detects ascending sequences
 * validateSequential('password') // { passed: true }
 * validateSequential('abc123') // { passed: false } (contains "abc" and "123")
 * validateSequential('xyz') // { passed: false } (contains "xyz")
 *
 * // Detects descending sequences
 * validateSequential('cba321') // { passed: false } (contains "cba" and "321")
 *
 * // Disable check
 * validateSequential('abc123', { checkSequential: false }) // { passed: true }
 * ```
 *
 * @remarks
 * Enabled by default. Checks for 3 or more consecutive characters in sequence.
 * Case-sensitive: detects both "abc" and "ABC" as separate patterns.
 *
 * Only letter and digit runs count. ASCII symbol/punctuation runs that happen
 * to be code-point-consecutive (e.g. `()*`, `?@A`, `[\]`) are NOT flagged —
 * they are typical of randomly generated passwords, not predictable typing
 * patterns. Non-ASCII alphabets (e.g. Cyrillic `абв`) are still detected.
 *
 * **Overlap with `validateKeyboardPattern`:** The numeric runs `123`, `456`,
 * `789` (and their reverses) are also matched by the keyboard-pattern
 * validator's numeric-keypad list. To allow simple numeric runs in a
 * password you must set BOTH `checkSequential: false` AND
 * `checkKeyboardPatterns: false` — disabling either alone will not let
 * `password123` through. The two checks are deliberately independent
 * defences (code-point runs vs. keyboard-locality runs).
 */
export const validateSequential: Validator = (password, options = {}) => {
  const { checkSequential = true }: Partial<{ checkSequential: boolean }> = options

  if (!checkSequential) {
    return { passed: true }
  }

  if (hasSequentialPattern(password)) {
    const params: MessageParams = {}
    return {
      passed: false,
      code: 'sequential.found',
      params,
      message: resolveMessage('sequential.found', params, options),
    }
  }

  return {
    passed: true,
  }
}
