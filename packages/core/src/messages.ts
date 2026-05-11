import type { MessageCode, MessageParams, ValidatorOptions } from './types'

/**
 * Built-in English templates for every {@link MessageCode}.
 *
 * The default rendering of a failed `ValidatorCheck.message` comes from this
 * map. Strings are stable across patch and minor releases — consumers can
 * still use them as translation keys with the legacy lookup-table pattern.
 * Prefer the `messages` / `formatMessage` options on {@link ValidatorOptions}.
 *
 * Placeholders use `{name}` syntax and are substituted by {@link formatTemplate}.
 */
export const DEFAULT_TEMPLATES: Readonly<Record<MessageCode, string>> = {
  'length.tooShort': 'Password must be at least {minLength} characters',
  'length.tooLong': 'Password must be at most {maxLength} characters',
  'characterTypes.missing': 'Password must contain at least one {missing}',
  'repetition.tooMany': 'Password contains too many repeated characters (max {maxRepeatedChars})',
  'sequential.found': 'Password contains sequential characters (e.g., abc, 123)',
  'keyboardPattern.found': 'Password contains common keyboard patterns',
  'commonPassword.found': 'Password is too common. Please choose a more unique password.',
  'personalInfo.found': 'Password contains personal information',
} as const

const PLACEHOLDER_PATTERN: RegExp = /\{(\w+)\}/g

/**
 * Substitute `{name}` placeholders in `template` with values from `params`.
 *
 * Unknown placeholders are left intact (visible in the output) so missing
 * data surfaces as a noticeable bug rather than a silent omission. Values
 * are coerced to strings via the `String` constructor.
 *
 * @example
 * formatTemplate('Min {n} chars', { n: 8 }) // → "Min 8 chars"
 * formatTemplate('Need {a} and {b}', { a: 'X' }) // → "Need X and {b}"
 */
export function formatTemplate(template: string, params: MessageParams): string {
  return template.replace(PLACEHOLDER_PATTERN, (match, key: string): string => {
    const value: string | number | undefined = params[key]
    return value === undefined ? match : String(value)
  })
}

/**
 * Render a message via the fallback chain:
 *   1. `options.formatMessage(code, params, defaultMessage)` if provided
 *   2. `formatTemplate(options.messages[code], params)` if that override is provided
 *   3. `formatTemplate(DEFAULT_TEMPLATES[code], params)` (built-in English)
 *
 * Used by every validator's failure branch. Validators stay declarative —
 * they describe *what* failed (`code` + `params`) and delegate rendering.
 *
 * If `options.formatMessage` throws, this function swallows the error and
 * returns the default English rendering instead. Validators in this library
 * promise never to throw (see `Validator` in `./types`), and that promise
 * holds even when consumer-provided formatters misbehave.
 */
export function resolveMessage(
  code: MessageCode,
  params: MessageParams,
  options: ValidatorOptions
): string {
  const defaultMessage: string = formatTemplate(DEFAULT_TEMPLATES[code], params)

  if (options.formatMessage) {
    try {
      return options.formatMessage(code, params, defaultMessage)
    } catch {
      return defaultMessage
    }
  }

  const override: string | undefined = options.messages?.[code]
  if (override !== undefined) {
    return formatTemplate(override, params)
  }

  return defaultMessage
}
