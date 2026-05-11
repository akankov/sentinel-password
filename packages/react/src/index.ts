/**
 * @sentinel-password/react
 * React hook for password validation. Wraps @sentinel-password/core with
 * state management and debouncing.
 */

export { usePasswordValidator } from './hooks/usePasswordValidator'
export type { UsePasswordValidatorOptions, UsePasswordValidatorReturn } from './types'

// Re-export i18n types from core for ergonomic imports
export type { MessageCode, MessageParams, MessageFormatter } from '@sentinel-password/core'
