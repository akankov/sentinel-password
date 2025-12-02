/**
 * React hook for password validation with debouncing
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { validatePassword } from '@sentinel-password/core'
import type { ValidationResult } from '@sentinel-password/core'
import type { UsePasswordValidatorOptions, UsePasswordValidatorReturn } from '../types'

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
 * **Validate on mount**
 * ```tsx
 * const { password, setPassword, result } = usePasswordValidator({
 *   validateOnMount: true,
 *   debounceMs: 0 // No debounce for immediate feedback
 * })
 * ```
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
    ...validatorOptions
  }: UsePasswordValidatorOptions = options

  const [password, setPasswordState]: [string, React.Dispatch<React.SetStateAction<string>>] =
    useState<string>('')
  const [result, setResult]: [
    ValidationResult | undefined,
    React.Dispatch<React.SetStateAction<ValidationResult | undefined>>,
  ] = useState<ValidationResult | undefined>(undefined)
  const [isValidating, setIsValidating]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    useState<boolean>(false)

  const debounceTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null> =
    useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMountedRef: React.MutableRefObject<boolean> = useRef<boolean>(false)

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
