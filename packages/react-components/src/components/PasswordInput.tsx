import React, { useId, useRef, useState, useCallback, useEffect } from 'react'
import { validatePassword } from '@sentinel-password/core'
import type { ValidationResult } from '@sentinel-password/core'
import type { PasswordInputProps, ValidationMessage } from '../types'

/**
 * Semantic equality for `ValidationResult` — compares the user-visible fields
 * (verdict, score, rendered suggestions). Used to bail out of state updates
 * when re-validating with a fresh `validatorOptions` reference produces an
 * identical result, which is the common case when consumers pass an inline
 * options object that's re-created on every render. Without this, a parent
 * that calls `setState` from `onValidationChange` while passing an inline
 * `validatorOptions` would re-render → produce a new options identity →
 * trigger our re-validation effect → emit a new (but equivalent) result →
 * fire `onValidationChange` again → loop.
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
 * Headless, accessible password input component
 *
 * Features:
 * - WCAG 2.1 AAA compliant
 * - Keyboard navigation support
 * - Show/hide password toggle
 * - Real-time validation feedback
 * - Controlled and uncontrolled modes
 * - Minimal styling (headless design)
 *
 * @example
 * ```tsx
 * <PasswordInput
 *   label="Password"
 *   description="Must be at least 8 characters"
 *   onValidationChange={(result) => console.log(result)}
 * />
 * ```
 */
export function PasswordInput({
  label,
  description,
  value: controlledValue,
  defaultValue,
  onChange,
  onValidationChange,
  showPassword: controlledShowPassword,
  onShowPasswordChange,
  validateOnMount = false,
  validateOnChange = true,
  debounceMs = 300,
  containerClassName = '',
  labelClassName = '',
  descriptionClassName = '',
  inputWrapperClassName = '',
  toggleButtonClassName = '',
  validationClassName = '',
  showValidationMessages = true,
  showToggleButton = true,
  disabled = false,
  validatorOptions,
  toggleShowText = 'Show',
  toggleHideText = 'Hide',
  toggleShowLabel = 'Show password',
  toggleHideLabel = 'Hide password',
  ...inputProps
}: PasswordInputProps) {
  // Generate unique IDs for accessibility
  const inputId: string = useId()
  const descriptionId: string = useId()
  const validationId: string = useId()

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue]: [string, React.Dispatch<React.SetStateAction<string>>] =
    useState<string>(String(defaultValue ?? ''))
  const [internalShowPassword, setInternalShowPassword]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
  ] = useState<boolean>(false)
  const [validationResult, setValidationResult]: [
    ValidationResult | undefined,
    React.Dispatch<React.SetStateAction<ValidationResult | undefined>>,
  ] = useState<ValidationResult | undefined>(undefined)

  // Ref for debounce timer
  const debounceTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null> =
    useRef<ReturnType<typeof setTimeout> | null>(null)

  // Ref for input element
  const inputRef: React.RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null)

  // Determine if component is controlled
  const isControlled: boolean = controlledValue !== undefined
  const value: string = (isControlled ? controlledValue : internalValue) as string
  const showPassword: boolean =
    controlledShowPassword !== undefined ? controlledShowPassword : internalShowPassword

  // Validate password with debouncing
  const performValidation: (password: string) => void = useCallback(
    (password: string) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }

      // Validate immediately if no debounce
      if (debounceMs === 0) {
        const result: ValidationResult = validatePassword(password, validatorOptions)
        setValidationResult((prev) =>
          prev && isSameValidationResult(prev, result) ? prev : result
        )
        return
      }

      // Set up debounced validation
      debounceTimerRef.current = setTimeout(() => {
        const result: ValidationResult = validatePassword(password, validatorOptions)
        setValidationResult((prev) =>
          prev && isSameValidationResult(prev, result) ? prev : result
        )
        debounceTimerRef.current = null
      }, debounceMs)
    },
    [debounceMs, validatorOptions]
  )

  // Handle input change
  const handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue: string = event.target.value

      if (!isControlled) {
        setInternalValue(newValue)
      }

      onChange?.(newValue)

      if (validateOnChange) {
        performValidation(newValue)
      }
    },
    [isControlled, onChange, validateOnChange, performValidation]
  )

  // Handle show/hide toggle
  const handleToggleVisibility: () => void = useCallback(() => {
    const newShowPassword: boolean = !showPassword

    if (controlledShowPassword === undefined) {
      setInternalShowPassword(newShowPassword)
    }

    onShowPasswordChange?.(newShowPassword)
  }, [showPassword, controlledShowPassword, onShowPasswordChange])

  // Handle keyboard shortcuts
  const handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Escape key clears the input
      if (event.key === 'Escape') {
        event.preventDefault()
        if (!isControlled) {
          setInternalValue('')
        }
        onChange?.('')

        // Cancel any pending debounce so a stale validation doesn't land
        // after the clear and overwrite the result we're about to set.
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
          debounceTimerRef.current = null
        }

        if (validateOnChange) {
          // Synchronously validate the cleared (empty) state so the
          // result-propagation effect fires `onValidationChange` with a
          // real `validatePassword('')` result (`valid: false`). The
          // previous behavior set the result to `undefined`, which the
          // propagation effect skips — leaving consumers' submit gates
          // open after Escape and forcing them to "optimistically
          // invalidate" from `onChange` as a workaround.
          const escapeResult: ValidationResult = validatePassword('', validatorOptions)
          setValidationResult((prev) =>
            prev && isSameValidationResult(prev, escapeResult) ? prev : escapeResult
          )
        } else {
          // Manual-validation mode: clear without firing
          // `onValidationChange` (consumer drives validation themselves).
          setValidationResult(undefined)
        }

        inputRef.current?.focus()
      }

      // Pass through to user's onKeyDown handler
      inputProps.onKeyDown?.(event)
    },
    [isControlled, onChange, validateOnChange, inputProps, validatorOptions]
  )

  // Validate on mount if requested
  useEffect(() => {
    if (validateOnMount && value) {
      performValidation(String(value))
    }
    // Cleanup debounce timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Re-validate the *current* value when validatorOptions changes (locale
  // switch, policy change, new formatMessage closure). Without this effect,
  // changing `messages` or `formatMessage` would leave the stale rendered
  // result on screen until the user edited the field. Skipped on the
  // initial render — the mount effect above handles that path.
  //
  // The condition runs only if validation has already produced a result —
  // either for a non-empty value, or for `''` (typed-then-cleared or Escape).
  // We don't surface a fresh validation against an untouched empty input.
  //
  // Identity-based triggering means consumers passing an inline
  // `validatorOptions` object re-run validation on every parent render.
  // `setValidationResult` is wrapped in `isSameValidationResult` to bail out
  // when nothing changed, so identity churn doesn't create render loops.
  // For best performance, consumers should still memoize this prop.
  const didRunPolicyEffectRef: React.MutableRefObject<boolean> = useRef<boolean>(false)
  useEffect(() => {
    if (!didRunPolicyEffectRef.current) {
      didRunPolicyEffectRef.current = true
      return
    }
    if (validationResult !== undefined) {
      performValidation(String(value))
    }
    // `value`, `validationResult`, and `performValidation` are intentionally
    // excluded from deps — change handlers (`handleInputChange`, Escape)
    // already drive value-triggered validation. This effect only catches
    // policy/locale switches that don't go through input events.
  }, [validatorOptions])

  // Notify parent of validation changes
  useEffect(() => {
    if (validationResult) {
      onValidationChange?.(validationResult)
    }
  }, [validationResult, onValidationChange])

  // Extract validation messages
  const validationMessages: ValidationMessage[] = React.useMemo(() => {
    if (!validationResult || !showValidationMessages) return []

    // `feedback.warning` is always === `feedback.suggestions[0]` (it's the
    // first failure message, surfaced for prominent display by the
    // aggregator). Iterate suggestions once and render the first with
    // `severity: 'warning'` (the prominent slot) and the rest with
    // `severity: 'error'`. Previously we pushed `warning` as a separate
    // entry then also iterated suggestions, which duplicated the first
    // message in the rendered list.
    return validationResult.feedback.suggestions.map((suggestion, index) => ({
      id: index === 0 ? 'warning' : `suggestion-${index}`,
      message: suggestion,
      severity: index === 0 ? 'warning' : 'error',
    }))
  }, [validationResult, showValidationMessages])

  // Determine ARIA attributes
  const ariaDescribedBy: string = [
    description ? descriptionId : undefined,
    validationMessages.length > 0 ? validationId : undefined,
  ]
    .filter(Boolean)
    .join(' ')

  const ariaInvalid: true | undefined =
    validationResult && !validationResult.valid ? true : undefined

  return (
    <div className={containerClassName} data-password-input-container>
      {/* Label */}
      <label htmlFor={inputId} className={labelClassName}>
        {label}
      </label>

      {/* Description */}
      {description && (
        <div id={descriptionId} className={descriptionClassName}>
          {description}
        </div>
      )}

      {/* Input wrapper */}
      <div className={inputWrapperClassName} data-password-input-wrapper>
        {/* Password input */}
        <input
          {...inputProps}
          ref={inputRef}
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          aria-describedby={ariaDescribedBy || undefined}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          autoComplete="new-password"
        />

        {/* Show/hide toggle button */}
        {showToggleButton && (
          <button
            type="button"
            onClick={handleToggleVisibility}
            className={toggleButtonClassName}
            aria-label={showPassword ? toggleHideLabel : toggleShowLabel}
            aria-pressed={showPassword}
            disabled={disabled}
            tabIndex={0}
          >
            {showPassword ? toggleHideText : toggleShowText}
          </button>
        )}
      </div>

      {/* Validation messages (ARIA live region) */}
      {validationMessages.length > 0 && (
        <div
          id={validationId}
          className={validationClassName}
          role="alert"
          aria-live="polite"
          aria-atomic="true"
          data-password-validation
        >
          <ul>
            {validationMessages.map((msg) => (
              <li key={msg.id} data-severity={msg.severity}>
                {msg.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

PasswordInput.displayName = 'PasswordInput'
