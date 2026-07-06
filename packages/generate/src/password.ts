import { randomInt } from './random'
import type { GeneratedSecret, GeneratePasswordOptions } from './types'

const LOWERCASE: string = 'abcdefghijklmnopqrstuvwxyz'
const UPPERCASE: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS: string = '0123456789'
// No quotes, backslash, backtick, or space — those routinely break naive
// form handling, shell copy/paste, and connection strings.
const SYMBOLS: string = '!@#$%^&*()-_=+[]{};:,.<>?'

/** Characters easy to misread when transcribing a password by eye. */
const AMBIGUOUS: ReadonlySet<string> = new Set(['O', '0', 'I', 'l', '1', '|'])

const DEFAULT_LENGTH: number = 20

/**
 * Safety valve for the conforming-password rejection loop. For every sane
 * configuration the acceptance probability per attempt is far above 10%, so
 * hitting this cap indicates a logic bug rather than bad luck (p < 10^-100).
 */
const MAX_ATTEMPTS: number = 1000

function stripAmbiguous(charset: string): string {
  let out: string = ''
  for (const ch of charset) {
    if (!AMBIGUOUS.has(ch)) {
      out += ch
    }
  }
  return out
}

/**
 * Generate a cryptographically secure random password.
 *
 * Characters are drawn uniformly (unbiased rejection sampling over
 * `crypto.getRandomValues`) from the union of the enabled character classes,
 * and the whole password is redrawn until every enabled class appears at
 * least once — a uniform distribution over the set of conforming passwords,
 * unlike "place one of each class then shuffle" schemes, which are subtly
 * non-uniform.
 *
 * @example
 * ```typescript
 * import { generatePassword } from '@sentinel-password/generate'
 *
 * generatePassword()
 * // { value: 'y?K@vRq2!wF+xT9;bZu3', entropyBits: 131.1 }
 *
 * generatePassword({ length: 16, symbols: false, excludeAmbiguous: true })
 * // { value: 'mVX3kTdEUwe7RbnH', entropyBits: 94.7 }
 * ```
 *
 * @throws {RangeError} when no character class is enabled, or `length` is not
 * an integer at least the number of enabled classes (each is guaranteed to
 * appear) or exceeds 1024
 * @throws {Error} when `crypto.getRandomValues` is unavailable
 */
export function generatePassword(options: GeneratePasswordOptions = {}): GeneratedSecret {
  const {
    length = DEFAULT_LENGTH,
    lowercase = true,
    uppercase = true,
    digits = true,
    symbols = true,
    excludeAmbiguous = false,
  }: GeneratePasswordOptions = options

  const classes: string[] = []
  if (lowercase) classes.push(LOWERCASE)
  if (uppercase) classes.push(UPPERCASE)
  if (digits) classes.push(DIGITS)
  if (symbols) classes.push(SYMBOLS)

  if (classes.length === 0) {
    throw new RangeError('generatePassword: at least one character class must be enabled')
  }

  const effectiveClasses: string[] = excludeAmbiguous ? classes.map(stripAmbiguous) : classes
  const pool: string = effectiveClasses.join('')

  if (!Number.isInteger(length) || length < effectiveClasses.length || length > 1024) {
    throw new RangeError(
      `generatePassword: length must be an integer in [${String(effectiveClasses.length)}, 1024], got ${String(length)}`
    )
  }

  for (let attempt: number = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let value: string = ''
    for (let i: number = 0; i < length; i++) {
      value += pool.charAt(randomInt(pool.length))
    }

    const conforming: boolean = effectiveClasses.every((cls: string): boolean => {
      for (const ch of value) {
        if (cls.includes(ch)) {
          return true
        }
      }
      return false
    })
    if (conforming) {
      return { value, entropyBits: roundBits(length * Math.log2(pool.length)) }
    }
  }

  // Statistically unreachable (see MAX_ATTEMPTS) — but a bounded loop beats a
  // hang if a future refactor breaks the acceptance math.
  throw new Error('generatePassword: failed to produce a conforming password')
}

/** One-decimal rounding for the reported entropy figure. */
function roundBits(bits: number): number {
  return Math.round(bits * 10) / 10
}
