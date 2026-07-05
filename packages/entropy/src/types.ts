/**
 * Public types for `@sentinel-password/entropy`.
 *
 * These types do NOT share runtime or import paths with `@sentinel-password/core`.
 * Consumers compose the two packages explicitly.
 */

/** Bit cutoffs for `score` 1, 2, 3, 4. Defaults to NIST-aligned `[28, 36, 60, 128]`. */
export type ScoreThresholds = readonly [number, number, number, number]

export interface EntropyOptions {
  /**
   * Strings whose presence in the password (case-insensitive substring) forces
   * `bits` to 0 and emits the `personalInfo` pattern. Use for email, username,
   * given name, etc.
   */
  readonly personalInfo?: readonly string[]
  /**
   * Extra dictionary words to match alongside the built-in dictionary. Useful
   * for company/product names that users commonly reuse.
   */
  readonly customDictionary?: readonly string[]
  /** Bit cutoffs for score 1/2/3/4. Defaults to `[28, 36, 60, 128]`. */
  readonly scoreThresholds?: ScoreThresholds
}

/** Banded strength score: 0 (very weak) – 4 (very strong). */
export type EntropyScore = 0 | 1 | 2 | 3 | 4

/**
 * @deprecated Use {@link EntropyScore}. Retained as an alias to avoid a name
 * collision with `@sentinel-password/core`'s `StrengthScore` when both packages
 * are imported in the same module. Will be removed in a future major.
 */
export type StrengthScore = EntropyScore

export type EntropyPattern =
  'sequence' | 'repetition' | 'dictionary' | 'l33t' | 'capitalization' | 'personalInfo'

export interface CrackEstimate {
  /** Estimated seconds to brute-force at the corresponding guess rate. */
  readonly seconds: number
  /**
   * Human-readable rendering of `seconds`. Tiered: `'instant'`, `'less than a
   * minute'`, then `'N minutes/hours/days/months/years/centuries'`.
   */
  readonly display: string
}

export interface CrackTimePresets {
  /** 100 guesses/hour. Rate-limited login form. */
  readonly onlineThrottled: CrackEstimate
  /** 10 guesses/second. No rate limit. */
  readonly onlineUnthrottled: CrackEstimate
  /** 10⁴ guesses/second. Bcrypt cost 10, scrypt, argon2. */
  readonly offlineSlowHash: CrackEstimate
  /** 10¹⁰ guesses/second. Raw MD5/SHA1 on a single modern GPU. */
  readonly offlineFastHash: CrackEstimate
}

export interface EntropyResult {
  /** Effective entropy after pattern/dictionary/l33t reduction. */
  readonly bits: number
  /** Banded score derived from `bits` via `scoreThresholds`. */
  readonly score: EntropyScore
  /** Estimated crack times under four standard attack models. */
  readonly crackTime: CrackTimePresets
  /** Reducing patterns detected, in left-to-right encounter order, deduplicated. */
  readonly patterns: readonly EntropyPattern[]
}
