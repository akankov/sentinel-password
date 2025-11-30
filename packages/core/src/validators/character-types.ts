import type { Validator } from '../types'

/**
 * Check if password contains at least one uppercase letter (A-Z)
 *
 * @param password - Password to check
 * @returns True if password contains at least one uppercase letter
 *
 * @example
 * ```typescript
 * hasUppercase('password') // false
 * hasUppercase('Password') // true
 * hasUppercase('PASSWORD') // true
 * ```
 */
export const hasUppercase = (password: string): boolean => /[A-Z]/.test(password)

/**
 * Check if password contains at least one lowercase letter (a-z)
 *
 * @param password - Password to check
 * @returns True if password contains at least one lowercase letter
 *
 * @example
 * ```typescript
 * hasLowercase('PASSWORD') // false
 * hasLowercase('Password') // true
 * hasLowercase('password') // true
 * ```
 */
export const hasLowercase = (password: string): boolean => /[a-z]/.test(password)

/**
 * Check if password contains at least one digit (0-9)
 *
 * @param password - Password to check
 * @returns True if password contains at least one digit
 *
 * @example
 * ```typescript
 * hasDigit('password') // false
 * hasDigit('password1') // true
 * hasDigit('123') // true
 * ```
 */
export const hasDigit = (password: string): boolean => /\d/.test(password)

/**
 * Check if password contains at least one symbol/special character
 *
 * @param password - Password to check
 * @returns True if password contains at least one special character
 *
 * @example
 * ```typescript
 * hasSymbol('password') // false
 * hasSymbol('password!') // true
 * hasSymbol('p@ssw0rd') // true
 * ```
 *
 * @remarks
 * Accepted symbols: ! @ # $ % ^ & * ( ) _ + - = [ ] { } ; ' : " \ | , . < > / ?
 */
export const hasSymbol = (password: string): boolean =>
  /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

/**
 * Validates character type requirements (uppercase, lowercase, digits, symbols)
 *
 * @param password - Password to validate
 * @param options - Validation options containing character type requirements
 * @returns Validator check result with passed status and optional error message
 *
 * @example
 * ```typescript
 * import { validateCharacterTypes } from '@sentinel-password/core'
 *
 * // No requirements by default
 * validateCharacterTypes('password') // { passed: true }
 *
 * // Require uppercase
 * validateCharacterTypes('password', { requireUppercase: true })
 * // { passed: false, message: "Password must contain at least one uppercase letter" }
 *
 * validateCharacterTypes('Password', { requireUppercase: true }) // { passed: true }
 *
 * // Require multiple types
 * validateCharacterTypes('password', {
 *   requireUppercase: true,
 *   requireDigit: true,
 *   requireSymbol: true
 * })
 * // { passed: false, message: "Password must contain at least one uppercase letter, digit, symbol" }
 *
 * validateCharacterTypes('Password1!', {
 *   requireUppercase: true,
 *   requireDigit: true,
 *   requireSymbol: true
 * }) // { passed: true }
 * ```
 *
 * @remarks
 * By default, no character types are required. Enable specific requirements via options.
 */
export const validateCharacterTypes: Validator = (password, options = {}) => {
  const {
    requireUppercase = false,
    requireLowercase = false,
    requireDigit = false,
    requireSymbol = false,
  }: Partial<{
    requireUppercase: boolean
    requireLowercase: boolean
    requireDigit: boolean
    requireSymbol: boolean
  }> = options

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
