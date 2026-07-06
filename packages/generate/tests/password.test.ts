import { describe, expect, it } from 'vitest'
import { generatePassword } from '../src/password'

const LOWER = /[a-z]/
const UPPER = /[A-Z]/
const DIGIT = /[0-9]/
const SYMBOL = /[!@#$%^&*()\-_=+[\]{};:,.<>?]/

describe('generatePassword', () => {
  it('generates the default 20-character password with all classes', () => {
    const { value, entropyBits } = generatePassword()
    expect(value).toHaveLength(20)
    expect(LOWER.test(value)).toBe(true)
    expect(UPPER.test(value)).toBe(true)
    expect(DIGIT.test(value)).toBe(true)
    expect(SYMBOL.test(value)).toBe(true)
    // 20 * log2(87) ≈ 128.9
    expect(entropyBits).toBeCloseTo(20 * Math.log2(87), 0)
  })

  it('respects a custom length', () => {
    expect(generatePassword({ length: 8 }).value).toHaveLength(8)
    expect(generatePassword({ length: 64 }).value).toHaveLength(64)
  })

  it('guarantees every enabled class appears, across many runs', () => {
    for (let i = 0; i < 300; i++) {
      const { value } = generatePassword({ length: 4 })
      expect(LOWER.test(value)).toBe(true)
      expect(UPPER.test(value)).toBe(true)
      expect(DIGIT.test(value)).toBe(true)
      expect(SYMBOL.test(value)).toBe(true)
    }
  })

  it('draws only from enabled classes', () => {
    const { value } = generatePassword({
      length: 200,
      uppercase: false,
      digits: false,
      symbols: false,
    })
    expect(value).toMatch(/^[a-z]+$/)
  })

  it('excludes ambiguous characters when asked', () => {
    for (let i = 0; i < 50; i++) {
      const { value } = generatePassword({ length: 64, excludeAmbiguous: true })
      expect(value).not.toMatch(/[O0Il1|]/)
    }
  })

  it('reduces reported entropy when the pool shrinks', () => {
    const full = generatePassword({ length: 20 }).entropyBits
    const lettersOnly = generatePassword({
      length: 20,
      digits: false,
      symbols: false,
    }).entropyBits
    expect(lettersOnly).toBeLessThan(full)
    expect(lettersOnly).toBeCloseTo(20 * Math.log2(52), 0)
  })

  it('is roughly uniform over a single-class pool (chi-squared)', () => {
    const counts = new Map<string, number>()
    // 1000 passwords x 26 chars = 26,000 draws over the 26-letter pool.
    for (let i = 0; i < 1000; i++) {
      const { value } = generatePassword({
        length: 26,
        uppercase: false,
        digits: false,
        symbols: false,
      })
      for (const ch of value) {
        counts.set(ch, (counts.get(ch) ?? 0) + 1)
      }
    }
    const trials = 26_000
    const expected = trials / 26
    let chiSquared = 0
    for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
      chiSquared += ((counts.get(letter) ?? 0) - expected) ** 2 / expected
    }
    // df = 25; P(chi2 > 70) ≈ 4e-6 — non-flaky yet catches real bias.
    expect(chiSquared).toBeLessThan(70)
  })

  it('throws when every class is disabled', () => {
    expect(() =>
      generatePassword({ lowercase: false, uppercase: false, digits: false, symbols: false })
    ).toThrow(RangeError)
  })

  it('throws when length cannot fit one of each enabled class', () => {
    expect(() => generatePassword({ length: 3 })).toThrow(RangeError)
  })

  it('throws on non-integer or oversized length', () => {
    expect(() => generatePassword({ length: 12.5 })).toThrow(RangeError)
    expect(() => generatePassword({ length: Number.NaN })).toThrow(RangeError)
    expect(() => generatePassword({ length: 4096 })).toThrow(RangeError)
  })

  it('produces distinct values across calls', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 100; i++) {
      seen.add(generatePassword().value)
    }
    // 100 collisions-free draws from a 2^129 space — a duplicate means the
    // randomness source is broken.
    expect(seen.size).toBe(100)
  })
})
