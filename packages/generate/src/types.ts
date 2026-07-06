/**
 * Type definitions for @sentinel-password/generate
 */

/**
 * Options for {@link generatePassword}. Every character-class flag defaults
 * to `true`; at least one class must remain enabled.
 */
export interface GeneratePasswordOptions {
  /**
   * Password length in characters. Must be an integer of at least the number
   * of enabled character classes (each enabled class is guaranteed to appear).
   * @default 20
   */
  readonly length?: number
  /** Include lowercase letters `a-z`. @default true */
  readonly lowercase?: boolean
  /** Include uppercase letters `A-Z`. @default true */
  readonly uppercase?: boolean
  /** Include digits `0-9`. @default true */
  readonly digits?: boolean
  /** Include symbols `!@#$%^&*()-_=+[]{};:,.<>?`. @default true */
  readonly symbols?: boolean
  /**
   * Drop characters that are easy to misread when transcribing:
   * `O`, `0`, `I`, `l`, `1`, `|`. Costs ~0.1 bits of entropy per character.
   * @default false
   */
  readonly excludeAmbiguous?: boolean
}

/** Options for {@link generatePassphrase}. */
export interface GeneratePassphraseOptions {
  /**
   * Number of words. With the default 1,296-word EFF short list each word
   * contributes ~10.34 bits, so 6 words ≈ 62 bits of entropy.
   * @default 6
   */
  readonly words?: number
  /** String between words. @default '-' */
  readonly separator?: string
  /** Capitalize the first letter of each word. @default false */
  readonly capitalize?: boolean
  /**
   * Custom wordlist (≥ 2 unique entries). Defaults to the embedded
   * EFF Short Wordlist 1 (1,296 words).
   */
  readonly wordlist?: readonly string[]
}

/** A generated secret plus its entropy accounting. */
export interface GeneratedSecret {
  /** The generated password or passphrase. */
  readonly value: string
  /**
   * Entropy in bits of the generation process (`length·log2(poolSize)` for
   * passwords — a lower bound given the one-per-class guarantee — and
   * `words·log2(wordlistSize)` for passphrases; separators/capitalization
   * add nothing since they're deterministic).
   */
  readonly entropyBits: number
}
