import type { Validator, ValidatorOptions } from '../types'

/**
 * Extracts username from email address
 * @param email - Email address
 * @returns Username part before @ symbol
 */
const extractUsername = (email: string): string => {
  const atIndex = email.indexOf('@')
  return atIndex > 0 ? email.substring(0, atIndex) : email
}

/**
 * Normalizes personal info strings for comparison
 * Converts to lowercase and extracts username from emails
 *
 * @param info - Personal information string
 * @returns Normalized string for comparison
 */
const normalizePersonalInfo = (info: string): string => {
  const normalized = info.toLowerCase().trim()
  // Extract username from email if it looks like an email
  return normalized.includes('@') ? extractUsername(normalized) : normalized
}

/**
 * Validates that password doesn't contain personal information
 *
 * Checks against provided personal info (username, email, name, etc.)
 * Case-insensitive comparison
 * Ignores very short strings (< 3 characters) to avoid false positives
 *
 * @param password - Password to validate
 * @param options - Validation options containing personalInfo array
 * @returns Validator check result
 */
export const validatePersonalInfo: Validator = (password, options = {}) => {
  const { personalInfo = [] } = options as Required<Pick<ValidatorOptions, 'personalInfo'>> &
    ValidatorOptions

  if (personalInfo.length === 0 || password.length === 0) {
    return { passed: true }
  }

  const lowerPassword = password.toLowerCase()

  for (const info of personalInfo) {
    const normalized = normalizePersonalInfo(info)

    // Skip very short strings to avoid false positives
    if (normalized.length < 3) {
      continue
    }

    // Check if password contains this personal information
    if (lowerPassword.includes(normalized)) {
      return {
        passed: false,
        message: 'Password contains personal information',
      }
    }
  }

  return {
    passed: true,
  }
}
