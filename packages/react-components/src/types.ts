import type { ValidationResult, ValidatorOptions } from '@sentinel-password/core'

/**
 * Props for the PasswordInput component
 */
export interface PasswordInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange'
> {
  /**
   * Accessible label for the password input
   * @required
   */
  label: string

  /**
   * Optional description text for additional context
   * Displayed below the label and associated with the input via aria-describedby
   */
  description?: string

  /**
   * Callback fired when validation state changes
   * @param result - The validation result from @sentinel-password/core
   */
  onValidationChange?: (result: ValidationResult) => void

  /**
   * Callback fired when input value changes
   * @param value - The current input value
   */
  onChange?: (value: string) => void

  /**
   * Whether to show/hide the password
   * @default false
   */
  showPassword?: boolean

  /**
   * Callback fired when show/hide toggle changes
   * @param show - Whether password should be shown
   */
  onShowPasswordChange?: (show: boolean) => void

  /**
   * Whether to validate on mount
   * @default false
   */
  validateOnMount?: boolean

  /**
   * Whether to validate on change
   * @default true
   */
  validateOnChange?: boolean

  /**
   * Debounce delay in milliseconds for validation
   * @default 300
   */
  debounceMs?: number

  /**
   * Custom CSS class for the container
   */
  containerClassName?: string

  /**
   * Custom CSS class for the label
   */
  labelClassName?: string

  /**
   * Custom CSS class for the description
   */
  descriptionClassName?: string

  /**
   * Custom CSS class for the input wrapper
   */
  inputWrapperClassName?: string

  /**
   * Custom CSS class for the toggle button
   */
  toggleButtonClassName?: string

  /**
   * Custom CSS class for validation messages
   */
  validationClassName?: string

  /**
   * Whether to show validation messages
   * @default true
   */
  showValidationMessages?: boolean

  /**
   * Whether to show the toggle visibility button
   * @default true
   */
  showToggleButton?: boolean

  /**
   * Options forwarded to `validatePassword` on every validation pass — policy
   * (`minLength`, `requireUppercase`, `personalInfo`, …) plus the i18n options
   * (`messages`, `formatMessage`) from `@sentinel-password/core@1.2.0`.
   *
   * Nested rather than spread because the component's own props extend
   * `React.InputHTMLAttributes<HTMLInputElement>`, which already defines
   * `minLength` / `maxLength` as HTML attributes — a flat spread would clash.
   *
   * Memoize this object in the consumer (e.g. `useMemo`) if it contains
   * closures like `formatMessage`; the component re-validates whenever the
   * reference changes.
   *
   * @default undefined (uses core defaults — minLength 8, all check flags on)
   */
  validatorOptions?: ValidatorOptions

  /**
   * Visible button text when the password is hidden (i.e. clicking will show it).
   * @default 'Show'
   */
  toggleShowText?: string

  /**
   * Visible button text when the password is visible (i.e. clicking will hide it).
   * @default 'Hide'
   */
  toggleHideText?: string

  /**
   * `aria-label` on the toggle button when the password is hidden.
   * @default 'Show password'
   */
  toggleShowLabel?: string

  /**
   * `aria-label` on the toggle button when the password is visible.
   * @default 'Hide password'
   */
  toggleHideLabel?: string
}

/**
 * Validation message severity levels
 */
export type ValidationMessageSeverity = 'error' | 'warning' | 'success'

/**
 * Individual validation message
 */
export interface ValidationMessage {
  id: string
  message: string
  severity: ValidationMessageSeverity
}
