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
   * **No-op in the current release.** The hook initializes `password` to
   * `''` and the mount effect only validates when `password.length > 0`,
   * but there is no `initialPassword` option to seed a non-empty value.
   * If you need validation before user input, call `validatePassword`
   * from `@sentinel-password/core` directly.
   * @default false
   */
  validateOnMount?: boolean

  /**
   * Only takes effect when `debounceMs === 0`. With the default
   * `debounceMs > 0`, debounced validation runs on every change
   * regardless of this flag.
   *
   * Behavior matrix:
   * - `debounceMs > 0` (default): debounced validation on every change;
   *   this flag is ignored.
   * - `debounceMs === 0` + `validateOnChange: true`: synchronous validation
   *   on every change.
   * - `debounceMs === 0` + `validateOnChange: false`: manual mode — no
   *   automatic validation; call `validate()` yourself.
   *
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
