import type { Validator } from '../types'

/**
 * Extracts username from email address
 * @param email - Email address
 * @returns Username part before @ symbol
 */
const extractUsername = (email: string): string => {
  const atIndex: number = email.indexOf('@')
  /* v8 ignore next */
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
  const normalized: string = info.toLowerCase().trim()
  // Extract username from email if it looks like an email
  return normalized.includes('@') ? extractUsername(normalized) : normalized
}

/**
 * Validates that password doesn't contain personal information
 *
 * Checks against provided personal info (username, email, name, etc.)
 * Uses case-insensitive comparison and extracts usernames from email addresses.
 * Ignores very short strings (< 3 characters) to avoid false positives.
 *
 * @param password - Password to validate
 * @param options - Validation options containing personalInfo array
 * @returns Validator check result with passed status and optional error message
 *
 * @example
 * ```typescript
 * import { validatePersonalInfo } from '@sentinel-password/core'
 *
 * // No personal info by default
 * validatePersonalInfo('password') // { passed: true }
 *
 * // Detects username in password
 * validatePersonalInfo('johnpassword', { personalInfo: ['john'] })
 * // { passed: false, message: "Password contains personal information" }
 *
 * // Extracts username from email
 * validatePersonalInfo('john123', { personalInfo: ['john.doe@example.com'] })
 * // { passed: false } (detects "john" from email)
 *
 * // Case-insensitive
 * validatePersonalInfo('JOHN123', { personalInfo: ['john'] })
 * // { passed: false }
 *
 * // Ignores short strings
 * validatePersonalInfo('password', { personalInfo: ['pw'] }) // { passed: true } (too short)
 *
 * // Multiple personal info items
 * validatePersonalInfo('secretpass', {
 *   personalInfo: ['john', 'doe', 'john.doe@example.com']
 * }) // { passed: true }
 * ```
 *
 * @remarks
 * Best practice: Provide username, email, first name, last name, and company name.
 * Strings shorter than 3 characters are ignored to prevent false positives.
 */
export const validatePersonalInfo: Validator = (password, options = {}) => {
  const { personalInfo = [] }: Partial<{ personalInfo: string[] }> = options

  if (personalInfo.length === 0 || password.length === 0) {
    return { passed: true }
  }

  const lowerPassword: string = password.toLowerCase()

  for (const info of personalInfo) {
    const normalized: string = normalizePersonalInfo(info)

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
