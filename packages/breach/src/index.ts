/**
 * @sentinel-password/breach
 *
 * Have I Been Pwned breach checking via k-anonymity. The password is SHA-1
 * hashed locally and only the first 5 hex characters of the digest are sent to
 * the Pwned Passwords range API — the password, full hash, and matched suffix
 * never leave the process and are never logged.
 *
 * Async and opt-in. Decoupled from `@sentinel-password/core` (no shared types
 * or runtime); compose the two explicitly. Recommended for server-side use.
 * Zero runtime dependencies. ≤ 10 KB gzipped (CI enforced).
 *
 * @example
 * ```typescript
 * import { validatePassword } from '@sentinel-password/core'
 * import { checkBreach } from '@sentinel-password/breach'
 *
 * const rule = validatePassword(password)
 * const pwned = await checkBreach(password)
 *
 * if (pwned.status === 'error') {
 *   // your call: block submission, or allow and log the degraded check
 * } else {
 *   const ok = rule.valid && !pwned.breached
 * }
 * ```
 */

export { checkBreach } from './check'
export { createBreachCache } from './cache'
export { DEFAULT_BREACH_MESSAGES, resolveBreachMessage } from './messages'

export type {
  BreachCache,
  BreachError,
  BreachErrorReason,
  BreachMessageCode,
  BreachMessageFormatter,
  BreachMessageOptions,
  BreachMessageParams,
  BreachOk,
  BreachOptions,
  BreachResult,
} from './types'
