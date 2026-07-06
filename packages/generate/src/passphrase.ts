import { randomInt } from './random'
import { EFF_SHORT_WORDLIST } from './wordlist'
import type { GeneratedSecret, GeneratePassphraseOptions } from './types'

const DEFAULT_WORDS: number = 6
const MAX_WORDS: number = 128

/**
 * Generate a diceware-style passphrase from the embedded EFF Short Wordlist
 * (1,296 words ≈ 10.34 bits each; the default 6 words ≈ 62 bits) or a custom
 * wordlist.
 *
 * Words are drawn independently and uniformly with unbiased rejection
 * sampling over `crypto.getRandomValues`. Repeated words are allowed —
 * rejecting repeats would reduce entropy and bias the distribution.
 *
 * @example
 * ```typescript
 * import { generatePassphrase } from '@sentinel-password/generate'
 *
 * generatePassphrase()
 * // { value: 'acorn-jolt-nectar-swab-dice-flame', entropyBits: 62 }
 *
 * generatePassphrase({ words: 4, separator: ' ', capitalize: true })
 * // { value: 'Union Motto Rigor Ounce', entropyBits: 41.4 }
 * ```
 *
 * @throws {RangeError} when `words` is not an integer in [1, 128], or a
 * custom `wordlist` has fewer than 2 entries
 * @throws {Error} when `crypto.getRandomValues` is unavailable
 */
export function generatePassphrase(options: GeneratePassphraseOptions = {}): GeneratedSecret {
  const {
    words = DEFAULT_WORDS,
    separator = '-',
    capitalize = false,
    wordlist = EFF_SHORT_WORDLIST,
  }: GeneratePassphraseOptions = options

  if (!Number.isInteger(words) || words < 1 || words > MAX_WORDS) {
    throw new RangeError(
      `generatePassphrase: words must be an integer in [1, ${String(MAX_WORDS)}], got ${String(words)}`
    )
  }
  if (wordlist.length < 2) {
    throw new RangeError('generatePassphrase: wordlist must contain at least 2 entries')
  }

  const picked: string[] = []
  for (let i: number = 0; i < words; i++) {
    const word: string = wordlist[randomInt(wordlist.length)] as string
    picked.push(capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word)
  }

  const entropyBits: number = Math.round(words * Math.log2(wordlist.length) * 10) / 10
  return { value: picked.join(separator), entropyBits }
}
