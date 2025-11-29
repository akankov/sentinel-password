import type { Validator, ValidatorOptions } from '../types'

/**
 * Detects sequential character patterns (ascending or descending)
 * Checks for sequences of 3 or more consecutive characters
 *
 * @param str - String to check for sequences
 * @returns true if sequential pattern found, false otherwise
 */
const hasSequentialPattern = (str: string): boolean => {
  const minSequenceLength = 3

  for (let i = 0; i <= str.length - minSequenceLength; i++) {
    const charCode1 = str.charCodeAt(i)
    const charCode2 = str.charCodeAt(i + 1)
    const charCode3 = str.charCodeAt(i + 2)

    // Check ascending sequence (e.g., abc, 123)
    if (charCode2 === charCode1 + 1 && charCode3 === charCode2 + 1) {
      return true
    }

    // Check descending sequence (e.g., cba, 321)
    if (charCode2 === charCode1 - 1 && charCode3 === charCode2 - 1) {
      return true
    }
  }

  return false
}

/**
 * Validates that password doesn't contain sequential character patterns
 *
 * Detects sequences like: abc, ABC, 123, 321, xyz, etc.
 * Uses character code comparison for efficient detection
 *
 * @param password - Password to validate
 * @param options - Validation options containing checkSequential flag
 * @returns Validator check result
 */
export const validateSequential: Validator = (password, options = {}) => {
  const { checkSequential = true } = options as Required<
    Pick<ValidatorOptions, 'checkSequential'>
  > &
    ValidatorOptions

  if (!checkSequential) {
    return { passed: true }
  }

  if (hasSequentialPattern(password)) {
    return {
      passed: false,
      message: 'Password contains sequential characters (e.g., abc, 123)',
    }
  }

  return {
    passed: true,
  }
}
