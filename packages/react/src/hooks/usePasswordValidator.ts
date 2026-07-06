/**
 * React hook for password validation with debouncing
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { validatePassword } from '@sentinel-password/core'
import type { ValidationResult, ValidatorOptions } from '@sentinel-password/core'
import type {
  AsyncCheck,
  AsyncCheckResult,
  AsyncCheckState,
  UsePasswordValidatorOptions,
  UsePasswordValidatorReturn,
} from '../types'

/** Frozen empty map shared by every hook instance with no async results. */
const EMPTY_ASYNC_RESULTS: Readonly<Record<string, AsyncCheckState>> = Object.freeze({})

/** Shallow equality over two plain records (Object.is per key). */
function shallowEqualRecords(
  a: Readonly<Record<string, unknown>>,
  b: Readonly<Record<string, unknown>>
): boolean {
  if (a === b) return true
  const aKeys: string[] = Object.keys(a)
  const bKeys: string[] = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  for (const key of aKeys) {
    if (!Object.is(a[key], b[key])) {
      return false
    }
  }
  return true
}

/**
 * Shallow equality over the validator options destructured out of the hook's
 * options object. The rest-spread creates a fresh object every render, so a
 * value-level comparison is needed to keep a stable reference (and therefore
 * stable `validate`/`setPassword` callbacks) when the consumer passes an
 * inline options literal with unchanged values.
 */
function shallowEqualOptions(a: ValidatorOptions, b: ValidatorOptions): boolean {
  if (a === b) return true
  const aKeys: string[] = Object.keys(a)
  const bKeys: string[] = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  for (const key of aKeys) {
    if (!Object.is(a[key as keyof ValidatorOptions], b[key as keyof ValidatorOptions])) {
      return false
    }
  }
  return true
}

/**
 * Semantic equality for `ValidationResult` (same fields `PasswordInput`
 * compares). Lets the policy-change effect bail out of the state update when
 * re-validation produced an equivalent result, so consumers passing inline
 * `messages`/`formatMessage` (new identity every render) don't loop:
 * options identity churn → re-validate → same result reference → React
 * skips the re-render.
 */
function isSameValidationResult(a: ValidationResult, b: ValidationResult): boolean {
  if (a.valid !== b.valid) return false
  if (a.score !== b.score) return false
  if (a.feedback.warning !== b.feedback.warning) return false
  // No length check needed: equal `score` + equal `valid` pin the passed-check
  // count, so both results carry the same number of failure suggestions.
  const aSuggestions: readonly string[] = a.feedback.suggestions
  const bSuggestions: readonly string[] = b.feedback.suggestions
  for (let i: number = 0; i < aSuggestions.length; i++) {
    if (aSuggestions[i] !== bSuggestions[i]) return false
  }
  return true
}

/**
 * React hook for validating passwords with automatic debouncing
 *
 * Wraps @sentinel-password/core validation with React state management and debouncing.
 * Provides real-time validation feedback as users type.
 *
 * @param options - Validation options and hook configuration
 * @returns Object containing password state, validation result, and control functions
 *
 * @example
 * **Basic usage**
 * ```tsx
 * import { usePasswordValidator } from '@sentinel-password/react'
 *
 * function SignupForm() {
 *   const { password, setPassword, result } = usePasswordValidator()
 *
 *   return (
 *     <div>
 *       <input
 *         type="password"
 *         value={password}
 *         onChange={(e) => setPassword(e.target.value)}
 *       />
 *       {result && (
 *         <div>
 *           <p>Strength: {result.strength}</p>
 *           {result.feedback.warning && <p>{result.feedback.warning}</p>}
 *         </div>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * **Custom debounce delay**
 * ```tsx
 * const { password, setPassword, result } = usePasswordValidator({
 *   debounceMs: 500 // Wait 500ms after typing stops
 * })
 * ```
 *
 * @example
 * **Seed the hook and validate the seeded value on mount**
 * Use `initialPassword` together with `validateOnMount` to validate a
 * pre-filled value without waiting for keystrokes — e.g. restoring an
 * in-progress signup form's draft from component state after a step change.
 * (Never seed it with a user's stored password: a correctly-built app can't
 * possess one in plaintext.)
 *
 * ```tsx
 * import { usePasswordValidator } from '@sentinel-password/react'
 *
 * function SignupStep({ draftPassword }: { draftPassword: string }) {
 *   const { password, setPassword, result } = usePasswordValidator({
 *     initialPassword: draftPassword,
 *     validateOnMount: true,
 *     minLength: 8,
 *   })
 *   // `result` is populated on first render with the validation of
 *   // `draftPassword`; subsequent edits go through `setPassword`.
 * }
 * ```
 *
 * `validateOnMount` skips empty values, so it's a no-op when
 * `initialPassword` is empty or omitted. Call `reset()` after a successful
 * submit so the plaintext value doesn't linger in component state.
 *
 * @example
 * **With custom validation rules**
 * ```tsx
 * const { password, setPassword, result, isValidating } = usePasswordValidator({
 *   minLength: 12,
 *   requireUppercase: true,
 *   requireLowercase: true,
 *   requireDigit: true,
 *   requireSymbol: true,
 *   debounceMs: 300
 * })
 * ```
 *
 * @example
 * **Manual validation control**
 * ```tsx
 * const { password, setPassword, result, validate, reset } = usePasswordValidator({
 *   debounceMs: 0 // Disable automatic validation
 * })
 *
 * return (
 *   <form onSubmit={(e) => {
 *     e.preventDefault()
 *     validate() // Manually trigger validation
 *   }}>
 *     <input
 *       type="password"
 *       value={password}
 *       onChange={(e) => setPassword(e.target.value)}
 *     />
 *     <button type="submit">Submit</button>
 *     <button type="button" onClick={reset}>Reset</button>
 *   </form>
 * )
 * ```
 */
export function usePasswordValidator(
  options: UsePasswordValidatorOptions = {}
): UsePasswordValidatorReturn {
  const {
    debounceMs = 300,
    validateOnMount = false,
    validateOnChange = false,
    initialPassword = '',
    asyncChecks,
    ...restValidatorOptions
  }: UsePasswordValidatorOptions = options

  // Stabilize asyncChecks the same way as validatorOptions below: reuse the
  // previous map while every entry is identity-equal, so inline literals
  // with stable function references don't churn `runAsyncChecks`.
  const asyncChecksRef: React.MutableRefObject<Readonly<Record<string, AsyncCheck>> | undefined> =
    useRef<Readonly<Record<string, AsyncCheck>> | undefined>(asyncChecks)
  if (
    asyncChecksRef.current !== asyncChecks &&
    (asyncChecksRef.current === undefined ||
      asyncChecks === undefined ||
      !shallowEqualRecords(asyncChecksRef.current, asyncChecks))
  ) {
    asyncChecksRef.current = asyncChecks
  }
  const stableAsyncChecks: Readonly<Record<string, AsyncCheck>> | undefined = asyncChecksRef.current

  // Stabilize the rest-spread: reuse the previous object while all top-level
  // values are Object.is-equal, so an inline options literal with unchanged
  // values doesn't destroy callback identity or trigger the policy effect
  // below. (Nested inline values like `messages` still churn identity; the
  // policy effect guards that case with a result-equality bail-out.)
  const validatorOptionsRef: React.MutableRefObject<ValidatorOptions> =
    useRef<ValidatorOptions>(restValidatorOptions)
  if (!shallowEqualOptions(validatorOptionsRef.current, restValidatorOptions)) {
    validatorOptionsRef.current = restValidatorOptions
  }
  const validatorOptions: ValidatorOptions = validatorOptionsRef.current

  const [password, setPasswordState]: [string, React.Dispatch<React.SetStateAction<string>>] =
    useState<string>(initialPassword)
  const [result, setResult]: [
    ValidationResult | undefined,
    React.Dispatch<React.SetStateAction<ValidationResult | undefined>>,
  ] = useState<ValidationResult | undefined>(undefined)
  const [isValidating, setIsValidating]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    useState<boolean>(false)
  const [asyncResults, setAsyncResults]: [
    Readonly<Record<string, AsyncCheckState>>,
    React.Dispatch<React.SetStateAction<Readonly<Record<string, AsyncCheckState>>>>,
  ] = useState<Readonly<Record<string, AsyncCheckState>>>(EMPTY_ASYNC_RESULTS)
  const [isValidatingAsync, setIsValidatingAsync]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
  ] = useState<boolean>(false)

  const debounceTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null> =
    useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMountedRef: React.MutableRefObject<boolean> = useRef<boolean>(false)

  // Controller for the in-flight async check run. Aborted (superseding the
  // run) whenever validation fires again, on reset, and on unmount. The
  // stale-result guard is the `signal.aborted` check in each continuation —
  // a late resolution from a superseded run never overwrites newer state.
  const asyncControllerRef: React.MutableRefObject<AbortController | null> =
    useRef<AbortController | null>(null)

  /**
   * Launch every registered async check against `candidate`, aborting any
   * previous run. Each check settles independently into `asyncResults`;
   * `isValidatingAsync` clears when the whole run has settled (or is
   * superseded).
   */
  const runAsyncChecks: (candidate: string) => void = useCallback(
    (candidate: string): void => {
      if (stableAsyncChecks === undefined) {
        return
      }
      const entries: [string, AsyncCheck][] = Object.entries(stableAsyncChecks)
      if (entries.length === 0) {
        return
      }

      asyncControllerRef.current?.abort()
      const controller: AbortController = new AbortController()
      asyncControllerRef.current = controller

      const pending: Record<string, AsyncCheckState> = {}
      for (const [name] of entries) {
        pending[name] = { status: 'pending' }
      }
      setAsyncResults(pending)
      setIsValidatingAsync(true)

      let remaining: number = entries.length
      const settleOne = (name: string, state: AsyncCheckState): void => {
        if (controller.signal.aborted) {
          return // superseded — a newer run owns the state now
        }
        setAsyncResults((prev) => ({ ...prev, [name]: state }))
        remaining--
        if (remaining === 0) {
          setIsValidatingAsync(false)
        }
      }

      for (const [name, check] of entries) {
        // Promise.resolve().then(...) also converts a synchronously-throwing
        // check into a rejection handled by the catch branch below.
        Promise.resolve()
          .then((): Promise<AsyncCheckResult> => check(candidate, controller.signal))
          .then((checkResult: AsyncCheckResult): void => {
            if (checkResult?.passed === true) {
              settleOne(name, { status: 'passed' })
            } else {
              settleOne(name, {
                status: 'failed',
                ...(typeof checkResult?.message === 'string' && {
                  message: checkResult.message,
                }),
              })
            }
          })
          .catch((): void => {
            // Rejection is an ERROR, not a failure — no message is surfaced
            // (rejection reasons could contain sensitive request detail).
            settleOne(name, { status: 'error' })
          })
      }
    },
    [stableAsyncChecks]
  )

  // Latest-password ref so the policy-change effect can read the current
  // value without depending on `password` (which would make it fire on
  // every keystroke).
  const passwordRef: React.MutableRefObject<string> = useRef<string>(password)
  passwordRef.current = password

  /**
   * Perform validation on current password
   */
  const validate: () => void = useCallback((): void => {
    setIsValidating(true)
    const validationResult: ValidationResult = validatePassword(password, validatorOptions)
    setResult(validationResult)
    setIsValidating(false)
    runAsyncChecks(password)
  }, [password, validatorOptions, runAsyncChecks])

  /**
   * Update password and trigger validation with debouncing
   */
  const setPassword: (password: string) => void = useCallback(
    (newPassword: string): void => {
      setPasswordState(newPassword)

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }

      // Validate immediately if validateOnChange is enabled and no debounce
      if (validateOnChange && debounceMs === 0) {
        setIsValidating(true)
        const validationResult: ValidationResult = validatePassword(newPassword, validatorOptions)
        setResult(validationResult)
        setIsValidating(false)
        runAsyncChecks(newPassword)
        return
      }

      // Set up debounced validation
      if (debounceMs > 0) {
        setIsValidating(true)
        debounceTimerRef.current = setTimeout(() => {
          const validationResult: ValidationResult = validatePassword(newPassword, validatorOptions)
          setResult(validationResult)
          setIsValidating(false)
          debounceTimerRef.current = null
          runAsyncChecks(newPassword)
        }, debounceMs)
      }
    },
    [debounceMs, validateOnChange, validatorOptions, runAsyncChecks]
  )

  /**
   * Reset password and validation state
   */
  const reset: () => void = useCallback((): void => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    asyncControllerRef.current?.abort()
    asyncControllerRef.current = null
    setPasswordState('')
    setResult(undefined)
    setIsValidating(false)
    setAsyncResults(EMPTY_ASYNC_RESULTS)
    setIsValidatingAsync(false)
  }, [])

  /**
   * Validate on mount if requested
   */
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true
      if (validateOnMount && password.length > 0) {
        validate()
      }
    }
  }, [validateOnMount, password.length, validate])

  /**
   * Re-validate the current password when validator options change (locale
   * switch, new `messages`/`formatMessage`, policy change). Mirrors the
   * equivalent effect in `PasswordInput`: without it, a rendered `result`
   * stays in the old locale/policy until the next keystroke. Skipped on the
   * initial render (the mount effect handles that path) and while no result
   * has been produced yet — an untouched empty input shouldn't suddenly
   * surface errors because the policy changed.
   */
  const didRunPolicyEffectRef: React.MutableRefObject<boolean> = useRef<boolean>(false)
  useEffect(() => {
    if (!didRunPolicyEffectRef.current) {
      didRunPolicyEffectRef.current = true
      return
    }
    setResult((prev: ValidationResult | undefined): ValidationResult | undefined => {
      if (prev === undefined) {
        return prev
      }
      const fresh: ValidationResult = validatePassword(passwordRef.current, validatorOptions)
      return isSameValidationResult(prev, fresh) ? prev : fresh
    })
    // `password` is intentionally not a dep — keystroke-driven validation
    // already flows through `setPassword`/`validate`. This effect only
    // catches option changes, reading the latest password via ref.
  }, [validatorOptions])

  /**
   * Cleanup debounce timer on unmount
   */
  useEffect(() => {
    return (): void => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      asyncControllerRef.current?.abort()
    }
  }, [])

  return {
    password,
    setPassword,
    result,
    isValidating,
    validate,
    reset,
    asyncResults,
    isValidatingAsync,
  }
}
