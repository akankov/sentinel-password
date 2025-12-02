import React, { useId, useRef, useState, useCallback, useEffect } from 'react'
import { validatePassword } from '@sentinel-password/core'
import type { ValidationResult } from '@sentinel-password/core'
import type { PasswordInputProps, ValidationMessage } from '../types'

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
  ...inputProps
}: PasswordInputProps) {
  // Generate unique IDs for accessibility
  const inputId = useId()
  const descriptionId = useId()
  const validationId = useId()

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const [internalShowPassword, setInternalShowPassword] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | undefined>(undefined)

  // Ref for debounce timer
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Ref for input element
  const inputRef = useRef<HTMLInputElement>(null)

  // Determine if component is controlled
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue
  const showPassword =
    controlledShowPassword !== undefined ? controlledShowPassword : internalShowPassword

  // Validate password with debouncing
  const performValidation = useCallback(
    (password: string) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }

      // Validate immediately if no debounce
      if (debounceMs === 0) {
        const result = validatePassword(password)
        setValidationResult(result)
        return
      }

      // Set up debounced validation
      debounceTimerRef.current = setTimeout(() => {
        const result = validatePassword(password)
        setValidationResult(result)
        debounceTimerRef.current = null
      }, debounceMs)
    },
    [debounceMs]
  )

  // Handle input change
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value

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
  const handleToggleVisibility = useCallback(() => {
    const newShowPassword = !showPassword

    if (controlledShowPassword === undefined) {
      setInternalShowPassword(newShowPassword)
    }

    onShowPasswordChange?.(newShowPassword)
  }, [showPassword, controlledShowPassword, onShowPasswordChange])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Escape key clears the input
      if (event.key === 'Escape') {
        event.preventDefault()
        if (!isControlled) {
          setInternalValue('')
        }
        onChange?.('')
        setValidationResult(undefined)
        inputRef.current?.focus()
      }

      // Pass through to user's onKeyDown handler
      inputProps.onKeyDown?.(event)
    },
    [isControlled, onChange, inputProps]
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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Notify parent of validation changes
  useEffect(() => {
    if (validationResult) {
      onValidationChange?.(validationResult)
    }
  }, [validationResult, onValidationChange])

  // Extract validation messages
  const validationMessages: ValidationMessage[] = React.useMemo(() => {
    if (!validationResult || !showValidationMessages) return []

    const messages: ValidationMessage[] = []

    // Add warning if present
    if (validationResult.feedback.warning) {
      messages.push({
        id: 'warning',
        message: validationResult.feedback.warning,
        severity: 'warning',
      })
    }

    // Add suggestions as info messages
    validationResult.feedback.suggestions.forEach((suggestion, index) => {
      messages.push({
        id: `suggestion-${index}`,
        message: suggestion,
        severity: validationResult.valid ? 'success' : 'error',
      })
    })

    return messages
  }, [validationResult, showValidationMessages])

  // Determine ARIA attributes
  const ariaDescribedBy = [
    description ? descriptionId : undefined,
    validationMessages.length > 0 ? validationId : undefined,
  ]
    .filter(Boolean)
    .join(' ')

  const ariaInvalid = validationResult && !validationResult.valid ? true : undefined

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
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            disabled={disabled}
            tabIndex={0}
          >
            {showPassword ? 'Hide' : 'Show'}
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
