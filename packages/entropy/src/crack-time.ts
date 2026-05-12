import type { CrackEstimate, CrackTimePresets } from './types'

/**
 * Guess rates for the four standard attack models exposed in {@link CrackTimePresets}.
 * Values frozen at v0.1.0; changes are public API.
 */
const GUESS_RATES: {
  readonly onlineThrottled: number
  readonly onlineUnthrottled: number
  readonly offlineSlowHash: number
  readonly offlineFastHash: number
} = {
  /** 100 guesses per hour. */
  onlineThrottled: 100 / 3600,
  /** 10 guesses per second. */
  onlineUnthrottled: 10,
  /** 1e4 guesses per second — bcrypt cost 10. */
  offlineSlowHash: 1e4,
  /** 1e10 guesses per second — raw MD5/SHA1 on a single modern GPU. */
  offlineFastHash: 1e10,
}

const SECONDS_PER_MINUTE: number = 60
const SECONDS_PER_HOUR: number = 3600
const SECONDS_PER_DAY: number = 86_400
const SECONDS_PER_MONTH: number = 2_629_746 // average Gregorian month
const SECONDS_PER_YEAR: number = 31_556_952 // average Gregorian year
const SECONDS_PER_CENTURY: number = 100 * SECONDS_PER_YEAR

/** Formats `seconds` as a tiered human-readable string. */
export function humanizeDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds >= SECONDS_PER_CENTURY) return 'centuries'
  if (seconds < 1) return 'instant'
  if (seconds < SECONDS_PER_MINUTE) return 'less than a minute'
  if (seconds < SECONDS_PER_HOUR) return formatUnit(seconds / SECONDS_PER_MINUTE, 'minute')
  if (seconds < SECONDS_PER_DAY) return formatUnit(seconds / SECONDS_PER_HOUR, 'hour')
  if (seconds < SECONDS_PER_MONTH) return formatUnit(seconds / SECONDS_PER_DAY, 'day')
  if (seconds < SECONDS_PER_YEAR) return formatUnit(seconds / SECONDS_PER_MONTH, 'month')
  return formatUnit(seconds / SECONDS_PER_YEAR, 'year')
}

function formatUnit(value: number, unit: 'minute' | 'hour' | 'day' | 'month' | 'year'): string {
  const rounded: number = Math.round(value)
  return rounded === 1 ? `1 ${unit}` : `${rounded} ${unit}s`
}

/**
 * Convert entropy in bits to a {@link CrackEstimate} for a given guess rate.
 *
 * Uses the *expected* number of guesses (half the search space):
 *   `seconds = 2^(bits - 1) / guessesPerSecond`
 *
 * Caps at `Number.MAX_VALUE` to avoid producing `Infinity` for very large
 * entropies (which then renders as `'centuries'`).
 */
export function bitsToCrackEstimate(bits: number, guessesPerSecond: number): CrackEstimate {
  if (bits <= 0) return { seconds: 0, display: humanizeDuration(0) }
  const guesses: number = Math.pow(2, bits - 1)
  const seconds: number = guesses / guessesPerSecond
  const bounded: number = Number.isFinite(seconds) ? seconds : Number.MAX_VALUE
  return { seconds: bounded, display: humanizeDuration(bounded) }
}

/** Builds the full {@link CrackTimePresets} block for a given entropy. */
export function bitsToCrackTime(bits: number): CrackTimePresets {
  return {
    onlineThrottled: bitsToCrackEstimate(bits, GUESS_RATES.onlineThrottled),
    onlineUnthrottled: bitsToCrackEstimate(bits, GUESS_RATES.onlineUnthrottled),
    offlineSlowHash: bitsToCrackEstimate(bits, GUESS_RATES.offlineSlowHash),
    offlineFastHash: bitsToCrackEstimate(bits, GUESS_RATES.offlineFastHash),
  }
}
