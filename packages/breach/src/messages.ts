import type { BreachMessageCode, BreachMessageOptions, BreachMessageParams } from './types'

/**
 * Built-in English template for every {@link BreachMessageCode}.
 *
 * Strings are short, stable English so consumers can use them as translation
 * keys. Placeholders use `{name}` syntax. This map is owned by this package and
 * intentionally does NOT import core's `MessageCode` union — the two packages
 * stay decoupled and version independently.
 */
export const DEFAULT_BREACH_MESSAGES: Readonly<Record<BreachMessageCode, string>> = {
  // Intentionally count-free: a logic-less template cannot pluralize, and
  // "appeared in 1 known data breaches" would be ungrammatical. The exact
  // exposure count is available as `BreachOk.breachCount`; callers who want it
  // in the message can interpolate via a `messages` / `formatMessage` override.
  'breach.found': 'This password has appeared in known data breaches. Choose a different one.',
} as const

const PLACEHOLDER_PATTERN: RegExp = /\{(\w+)\}/g

/**
 * Substitute `{name}` placeholders in `template` with values from `params`.
 * Unknown placeholders are left intact so missing data surfaces as a visible
 * bug rather than a silent omission.
 */
function formatTemplate(template: string, params: BreachMessageParams): string {
  return template.replace(PLACEHOLDER_PATTERN, (match, key: string): string => {
    const value: string | number | undefined = params[key]
    return value === undefined ? match : String(value)
  })
}

/**
 * Render a breach message via the fallback chain:
 *   1. `options.formatMessage(code, params, defaultMessage)` if provided
 *   2. `formatTemplate(options.messages[code], params)` if that override exists
 *   3. `formatTemplate(DEFAULT_BREACH_MESSAGES[code], params)` (built-in English)
 *
 * If `options.formatMessage` throws, the default English rendering is returned.
 *
 * @example
 * ```typescript
 * import { resolveBreachMessage } from '@sentinel-password/breach'
 *
 * resolveBreachMessage('breach.found')
 * // → "This password has appeared in known data breaches. Choose a different one."
 * ```
 */
export function resolveBreachMessage(
  code: BreachMessageCode,
  params: BreachMessageParams,
  options: BreachMessageOptions = {}
): string {
  const defaultMessage: string = formatTemplate(DEFAULT_BREACH_MESSAGES[code], params)

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
