/**
 * React hook for password validation with debouncing
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { validatePassword } from '@sentinel-password/core'
import type { ValidationResult, ValidatorOptions } from '@sentinel-password/core'
import type { UsePasswordValidatorOptions, UsePasswordValidatorReturn } from '../types'

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
  if (a === b) return true
  if (a.valid !== b.valid) return false
  if (a.score !== b.score) return false
  if (a.feedback.warning !== b.feedback.warning) return false
  const aSuggestions: readonly string[] = a.feedback.suggestions
  const bSuggestions: readonly string[] = b.feedback.suggestions
  if (aSuggestions.length !== bSuggestions.length) return false
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
 * pre-filled value (e.g. an edit-profile flow that echoes a value back
 * to the user) without waiting for keystrokes:
 *
 * ```tsx
 * import { usePasswordValidator } from '@sentinel-password/react'
 *
 * function EditProfile({ existingPassword }: { existingPassword: string }) {
 *   const { password, setPassword, result } = usePasswordValidator({
 *     initialPassword: existingPassword,
 *     validateOnMount: true,
 *     minLength: 8,
 *   })
 *   // `result` is populated on first render with the validation of
 *   // `existingPassword`; subsequent edits go through `setPassword`.
 * }
 * ```
 *
 * `validateOnMount` skips empty values, so it's a no-op when
 * `initialPassword` is empty or omitted.
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
    ...restValidatorOptions
  }: UsePasswordValidatorOptions = options

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

  const debounceTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null> =
    useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMountedRef: React.MutableRefObject<boolean> = useRef<boolean>(false)

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
  }, [password, validatorOptions])

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
        }, debounceMs)
      }
    },
    [debounceMs, validateOnChange, validatorOptions]
  )

  /**
   * Reset password and validation state
   */
  const reset: () => void = useCallback((): void => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    setPasswordState('')
    setResult(undefined)
    setIsValidating(false)
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
    }
  }, [])

  return {
    password,
    setPassword,
    result,
    isValidating,
    validate,
    reset,
  }
}
