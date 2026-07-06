import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { validateCommonPassword } from '../../src'

// The source-of-truth wordlist the Bloom filter is generated from.
const COMMON_PASSWORDS: string[] = readFileSync(
  new URL('../../data/common-passwords.txt', import.meta.url),
  'utf-8'
)
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.length > 0)

describe('validateCommonPassword', () => {
  it('should pass for uncommon passwords', () => {
    const result = validateCommonPassword('MyUniqueP4ssw0rd!')
    expect(result.passed).toBe(true)
  })

  it('should fail for very common passwords', () => {
    const result = validateCommonPassword('password')
    expect(result.passed).toBe(false)
    expect(result.message).toContain('common')
  })

  it('should fail for common numeric passwords', () => {
    const result = validateCommonPassword('123456')
    expect(result.passed).toBe(false)
  })

  it('should fail for qwerty', () => {
    const result = validateCommonPassword('qwerty')
    expect(result.passed).toBe(false)
  })

  it('should be case-insensitive', () => {
    const result = validateCommonPassword('PASSWORD')
    expect(result.passed).toBe(false)
  })

  it('should pass when checkCommonPasswords is false', () => {
    const result = validateCommonPassword('password', { checkCommonPasswords: false })
    expect(result.passed).toBe(true)
  })

  it('should handle empty password', () => {
    const result = validateCommonPassword('')
    expect(result.passed).toBe(true)
  })

  it('should fail for common variations', () => {
    // All of these are literal members of the embedded top-1,000 list.
    // ('qwerty123' used to sit in this list but is NOT in the top 1,000 —
    // it was only rejected as a false positive of the pre-repair degenerate
    // double hashing. It is still rejected by the keyboard-pattern and
    // sequential validators in full validatePassword runs.)
    const commonPasswords = ['12345678', 'iloveyou', 'letmein', 'welcome', 'dragon', 'monkey']

    commonPasswords.forEach((pwd) => {
      const result = validateCommonPassword(pwd)
      expect(result.passed).toBe(false)
    })
  })

  it('should fail for l33t-speak variations of listed passwords', () => {
    // Primary substitutions (@→a, 0→o, 3→e, 4→a, $→s, !→i …)
    const leetVariants = ['P@ssw0rd', 'p4ssword', 'm0nkey', 'dr@gon', 'we1c0me', 'i10veyou']
    leetVariants.forEach((pwd) => {
      expect(validateCommonPassword(pwd).passed).toBe(false)
    })
    // Secondary reading: 1/| as l (letmein-style)
    expect(validateCommonPassword('l3tm3in').passed).toBe(false)
    // MIXED readings of the same character ('13tm31n' needs the first 1→l
    // but the second 1→i) are outside the two-candidate cap — documented
    // limitation that keeps the false-positive ceiling bounded.
    expect(validateCommonPassword('13tm31n').passed).toBe(true)
  })

  it('should pass for l33t strings that do not normalize to a listed password', () => {
    expect(validateCommonPassword('Z9!kQ@7xW$2m').passed).toBe(true)
    expect(validateCommonPassword('gr@ndp1an0-X').passed).toBe(true)
  })

  it('should pass for strong uncommon passwords', () => {
    const strongPasswords = ['MyStr0ng!Pass', 'C0mpl3x$ecur1ty', 'Un1qu3P@ssw0rd', 'S3cur3Rand0m!']

    strongPasswords.forEach((pwd) => {
      const result = validateCommonPassword(pwd)
      expect(result.passed).toBe(true)
    })
  })

  describe('Bloom filter integrity (full wordlist)', () => {
    it('loads a non-empty wordlist', () => {
      expect(COMMON_PASSWORDS.length).toBeGreaterThan(0)
    })

    it('flags EVERY password in the source wordlist (no false negatives)', () => {
      // A Bloom filter must never produce a false negative: every member of the
      // generating set has to be reported as common. This exercises all bucket
      // bits the wordlist relies on, so any corruption of the generated table or
      // the hashing math surfaces as a missed entry.
      const missed = COMMON_PASSWORDS.filter((pwd) => validateCommonPassword(pwd).passed)
      expect(missed).toEqual([])
    })

    it('is case-insensitive across the full wordlist', () => {
      const missed = COMMON_PASSWORDS.filter(
        (pwd) => validateCommonPassword(pwd.toUpperCase()).passed
      )
      expect(missed).toEqual([])
    })

    it('keeps the false-positive rate under 1% on random strings', () => {
      // Deterministic LCG so the test never flakes: the filter is fixed data,
      // so for a fixed input set the FP count is a constant. Guards against a
      // regression to the degenerate double hashing this filter shipped with
      // until v1.4 (hash2 − hash1 was constant per length → measured ~1.1% FP
      // vs ~0.33% for genuine double hashing).
      let seed = 0x2f6e2b1
      const nextChar = (): string => {
        seed = (Math.imul(seed, 1103515245) + 12345) >>> 0
        // Letters only: avoids l33t-substitutable chars so exactly one probe
        // runs per string, measuring the per-probe rate.
        return String.fromCharCode(97 + (seed % 26))
      }
      const trials = 20_000
      let falsePositives = 0
      for (let i = 0; i < trials; i++) {
        let candidate = ''
        for (let j = 0; j < 10; j++) candidate += nextChar()
        if (!validateCommonPassword(candidate).passed) falsePositives++
      }
      expect(falsePositives / trials).toBeLessThan(0.01)
    })
  })
})
