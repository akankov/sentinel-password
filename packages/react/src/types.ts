/**
 * Type definitions for @sentinel-password/react
 */

import type { ValidationResult, ValidatorOptions } from '@sentinel-password/core'

/**
 * Options for usePasswordValidator hook
 */
export interface UsePasswordValidatorOptions extends ValidatorOptions {
  /**
   * Debounce delay in milliseconds before validation runs
   * Set to 0 to disable debouncing
   * @default 300
   */
  debounceMs?: number

  /**
   * Whether to validate immediately on mount
   * @default false
   */
  validateOnMount?: boolean

  /**
   * Whether to validate on every change or only after debounce
   * @default false
   */
  validateOnChange?: boolean
}

/**
 * Return value from usePasswordValidator hook
 */
export interface UsePasswordValidatorReturn {
  /**
   * Current password value
   */
  password: string

  /**
   * Update the password and trigger validation
   */
  setPassword: (password: string) => void

  /**
   * Validation result (undefined if not yet validated)
   */
  result: ValidationResult | undefined

  /**
   * Whether validation is currently in progress
   */
  isValidating: boolean

  /**
   * Manually trigger validation
   */
  validate: () => void

  /**
   * Reset password and validation state
   */
  reset: () => void
}
