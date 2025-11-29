import type { Validator, ValidatorOptions } from '../types'

/**
 * Check if password contains at least one uppercase letter
 */
export const hasUppercase = (password: string): boolean => /[A-Z]/.test(password)

/**
 * Check if password contains at least one lowercase letter
 */
export const hasLowercase = (password: string): boolean => /[a-z]/.test(password)

/**
 * Check if password contains at least one digit
 */
export const hasDigit = (password: string): boolean => /\d/.test(password)

/**
 * Check if password contains at least one symbol/special character
 */
export const hasSymbol = (password: string): boolean =>
  /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

/**
 * Validates character type requirements (uppercase, lowercase, digits, symbols)
 *
 * @param password - Password to validate
 * @param options - Validation options containing character type requirements
 * @returns Validator check result
 */
export const validateCharacterTypes: Validator = (password, options = {}) => {
  const {
    requireUppercase = false,
    requireLowercase = false,
    requireDigit = false,
    requireSymbol = false,
  } = options as Required<
    Pick<
      ValidatorOptions,
      'requireUppercase' | 'requireLowercase' | 'requireDigit' | 'requireSymbol'
    >
  > &
    ValidatorOptions

  const missing: string[] = []

  if (requireUppercase && !hasUppercase(password)) {
    missing.push('uppercase letter')
  }

  if (requireLowercase && !hasLowercase(password)) {
    missing.push('lowercase letter')
  }

  if (requireDigit && !hasDigit(password)) {
    missing.push('digit')
  }

  if (requireSymbol && !hasSymbol(password)) {
    missing.push('symbol')
  }

  if (missing.length > 0) {
    return {
      passed: false,
      message: `Password must contain at least one ${missing.join(', ')}`,
    }
  }

  return {
    passed: true,
  }
}
