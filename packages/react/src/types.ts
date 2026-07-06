/**
 * Type definitions for @sentinel-password/react
 */

import type { ValidationResult, ValidatorOptions } from '@sentinel-password/core'

/**
 * Result returned by an async check. Anything other than a literal
 * `passed: true` counts as failed.
 */
export interface AsyncCheckResult {
  passed: boolean
  /** Rendered failure message, surfaced on {@link AsyncCheckState.message}. */
  message?: string
}

/**
 * A consumer-supplied asynchronous check (breach lookup, server-side policy
 * call, …). Receives the password and an `AbortSignal` that fires when the
 * password changes again or the hook unmounts — pass it to `fetch` /
 * `checkBreach` so abandoned requests are cancelled.
 */
export type AsyncCheck = (password: string, signal: AbortSignal) => Promise<AsyncCheckResult>

/**
 * Lifecycle of one async check run:
 * - `pending` — in flight for the current password
 * - `passed` / `failed` — resolved verdict
 * - `error` — the check rejected (network failure, thrown error). NOT the
 *   same as `failed`: decide fail-open vs fail-closed yourself.
 */
export interface AsyncCheckState {
  status: 'pending' | 'passed' | 'failed' | 'error'
  /** Failure message, when the check provided one. */
  message?: string
}

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
   * that restore an in-progress draft (e.g. a multi-step signup keeping the
   * value in parent state between steps). Never seed it with a user's stored
   * password — a correctly-built app can't possess one in plaintext. The
   * mount effect uses this value when `validateOnMount` is true, and the
   * input remains fully controlled afterwards via `setPassword`.
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

  /**
   * Named asynchronous checks that run alongside the synchronous validators
   * whenever validation fires (debounced with the same `debounceMs`). Results
   * surface on `asyncResults`; they do NOT affect the synchronous `result` —
   * combine them yourself for acceptance decisions:
   *
   * ```tsx
   * import { checkBreach } from '@sentinel-password/breach'
   *
   * const { result, asyncResults } = usePasswordValidator({
   *   asyncChecks: {
   *     breach: async (password, signal) => {
   *       const r = await checkBreach(password, { signal })
   *       if (r.status === 'error') throw new Error(r.reason) // -> status 'error'
   *       return r.breached
   *         ? { passed: false, message: 'This password appears in known data breaches' }
   *         : { passed: true }
   *     },
   *   },
   * })
   * const acceptable = result?.valid && asyncResults['breach']?.status === 'passed'
   * ```
   *
   * In-flight checks are aborted (via the provided `AbortSignal`) when the
   * password changes again, on `reset()`, and on unmount; late results from
   * a superseded run never overwrite newer state.
   */
  asyncChecks?: Readonly<Record<string, AsyncCheck>>
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

  /**
   * Per-check state of the registered `asyncChecks` for the most recent
   * validation run. Empty object when no async checks are registered or
   * nothing has run yet.
   */
  asyncResults: Readonly<Record<string, AsyncCheckState>>

  /**
   * True while any async check from the most recent run is still pending.
   */
  isValidatingAsync: boolean
}
