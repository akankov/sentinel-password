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
    // All these passwords are in the top 10k list
    const commonPasswords = ['12345678', 'qwerty123', 'letmein', 'welcome', 'dragon']

    commonPasswords.forEach((pwd) => {
      const result = validateCommonPassword(pwd)
      expect(result.passed).toBe(false)
    })
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
  })
})
