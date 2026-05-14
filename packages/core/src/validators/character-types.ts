import type { MessageParams, Validator } from '../types'
import { resolveMessage } from '../messages'

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
 * Char codes for the symbol set above, packed into a Set for O(1) lookup during
 * the single-pass scan in {@link validateCharacterTypes}. Built once at module
 * load. Must stay in sync with the regex character class in {@link hasSymbol}.
 *
 * Backtick (0x60) is intentionally NOT in this set — it isn't in `hasSymbol`'s
 * regex either.
 */
const SYMBOL_CODES: ReadonlySet<number> = new Set<number>([
  33, // !
  34, // "
  35, // #
  36, // $
  37, // %
  38, // &
  39, // '
  40, // (
  41, // )
  42, // *
  43, // +
  44, // ,
  45, // -
  46, // .
  47, // /
  58, // :
  59, // ;
  60, // <
  61, // =
  62, // >
  63, // ?
  64, // @
  91, // [
  92, // \
  93, // ]
  94, // ^
  95, // _
  123, // {
  124, // |
  125, // }
])

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
 *
 * Implementation note: scans the password ONCE with `charCodeAt`, classifying
 * each char into uppercase / lowercase / digit / symbol, with early exit as
 * soon as every required class is satisfied. Faster than the previous
 * implementation that ran up to 4 separate `RegExp.test()` scans. The
 * individual `hasUppercase` / `hasLowercase` / `hasDigit` / `hasSymbol`
 * helpers above stay regex-based — they're independently exported and the
 * regex form is clearer for one-off calls.
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

  // No requirements → no scan, no allocations.
  if (!requireUppercase && !requireLowercase && !requireDigit && !requireSymbol) {
    return { passed: true }
  }

  let foundUpper: boolean = !requireUppercase
  let foundLower: boolean = !requireLowercase
  let foundDigit: boolean = !requireDigit
  let foundSymbol: boolean = !requireSymbol

  for (let i: number = 0; i < password.length; i++) {
    if (foundUpper && foundLower && foundDigit && foundSymbol) break
    const c: number = password.charCodeAt(i)
    if (!foundUpper && c >= 65 && c <= 90) {
      foundUpper = true
    } else if (!foundLower && c >= 97 && c <= 122) {
      foundLower = true
    } else if (!foundDigit && c >= 48 && c <= 57) {
      foundDigit = true
    } else if (!foundSymbol && SYMBOL_CODES.has(c)) {
      foundSymbol = true
    }
  }

  if (foundUpper && foundLower && foundDigit && foundSymbol) {
    return { passed: true }
  }

  // Failure path: lazy-build the missing-types lists. Order MUST match the
  // pre-existing implementation: uppercase, lowercase, digit, symbol.
  const missing: string[] = []
  const missingTypes: string[] = []
  if (requireUppercase && !foundUpper) {
    missing.push('uppercase letter')
    missingTypes.push('uppercase')
  }
  if (requireLowercase && !foundLower) {
    missing.push('lowercase letter')
    missingTypes.push('lowercase')
  }
  if (requireDigit && !foundDigit) {
    missing.push('digit')
    missingTypes.push('digit')
  }
  if (requireSymbol && !foundSymbol) {
    missing.push('symbol')
    missingTypes.push('symbol')
  }

  const params: MessageParams = {
    missing: missing.join(', '),
    missingTypes: missingTypes.join(','),
  }
  return {
    passed: false,
    code: 'characterTypes.missing',
    params,
    message: resolveMessage('characterTypes.missing', params, options),
  }
}
