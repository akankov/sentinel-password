/**
 * Shannon-baseline entropy: `length × log2(alphabetSize)`.
 *
 * Alphabet size is the sum of character-class sizes for the classes observed
 * in the password. The estimate is intentionally optimistic — pattern detection
 * in `estimate.ts` walks the password and *reduces* this baseline.
 */

const LOWERCASE_SIZE: number = 26
const UPPERCASE_SIZE: number = 26
const DIGIT_SIZE: number = 10
/** Printable ASCII non-alphanumeric: 33 chars (space + symbols + punctuation in the 0x20-0x7E range minus letters/digits). */
const ASCII_SYMBOL_SIZE: number = 33
/**
 * Heuristic alphabet size attributed to "anything else" — non-ASCII letters,
 * emoji, etc. Real Unicode is huge, but most users don't sample uniformly, so
 * 100 is a conservative working number used by zxcvbn-class estimators.
 */
const OTHER_SIZE: number = 100

/**
 * Returns the sum of character-class sizes for the classes present in `password`.
 * Empty input returns 0.
 *
 * @example
 *   alphabetSize('') === 0
 *   alphabetSize('aaaa') === 26     // lowercase only
 *   alphabetSize('aA1!') === 95     // lowercase + uppercase + digit + symbol
 *   alphabetSize('ñoño') === 126    // lowercase + other
 */
export function alphabetSize(password: string): number {
  let hasLower: boolean = false
  let hasUpper: boolean = false
  let hasDigit: boolean = false
  let hasSymbol: boolean = false
  let hasOther: boolean = false

  for (let i: number = 0; i < password.length; i++) {
    const code: number = password.charCodeAt(i)
    if (code >= 97 && code <= 122) {
      hasLower = true
    } else if (code >= 65 && code <= 90) {
      hasUpper = true
    } else if (code >= 48 && code <= 57) {
      hasDigit = true
    } else if (code >= 32 && code <= 126) {
      hasSymbol = true
    } else {
      hasOther = true
    }
  }

  let size: number = 0
  if (hasLower) size += LOWERCASE_SIZE
  if (hasUpper) size += UPPERCASE_SIZE
  if (hasDigit) size += DIGIT_SIZE
  if (hasSymbol) size += ASCII_SYMBOL_SIZE
  if (hasOther) size += OTHER_SIZE
  return size
}

/**
 * Returns Shannon baseline entropy in bits: `password.length × log2(alphabetSize)`.
 * Empty input returns 0; non-empty input always falls into at least one
 * character class (see {@link alphabetSize}).
 */
export function baseEntropyBits(password: string): number {
  if (password.length === 0) return 0
  return password.length * Math.log2(alphabetSize(password))
}

/**
 * Per-character entropy of `password`'s alphabet, in bits. Used by reduction
 * logic to translate "this N-char substring contributes X bits" decisions.
 */
export function bitsPerCharacter(password: string): number {
  const size: number = alphabetSize(password)
  if (size <= 1) return 0
  return Math.log2(size)
}
