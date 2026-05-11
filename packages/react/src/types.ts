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
   * Seed value for the hook's internal `password` state. Useful for forms
   * that pre-fill the password field (e.g. password-reset flows that echo
   * a value back, or "edit profile" screens). The mount effect uses this
   * value when `validateOnMount` is true, and the input remains fully
   * controlled afterwards via `setPassword`.
   *
   * If omitted, `password` starts as `''` and `validateOnMount` has no
   * effect (the mount validator skips empty values).
   *
   * @default ''
   */
  initialPassword?: string

  /**
   * Validate the seed value (see `initialPassword`) once on mount.
   * Has no effect when `initialPassword` is empty or omitted, because
   * the hook skips validating empty strings on mount.
   *
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
