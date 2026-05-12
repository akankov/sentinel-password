import { describe, expect, it } from 'vitest'
import { isInDictionary } from '../src/dictionary'

describe('isInDictionary', () => {
  it('returns false for empty input', () => {
    expect(isInDictionary('')).toBe(false)
  })

  it('matches common dictionary words from the built-in seed', () => {
    expect(isInDictionary('password')).toBe(true)
    expect(isInDictionary('hello')).toBe(true)
    expect(isInDictionary('admin')).toBe(true)
  })

  it('matches case-insensitively', () => {
    expect(isInDictionary('PASSWORD')).toBe(true)
    expect(isInDictionary('Hello')).toBe(true)
  })

  it('matches custom dictionary entries even if not in the bloom filter', () => {
    expect(isInDictionary('mycompanyname', ['mycompanyname'])).toBe(true)
  })

  it('matches custom dictionary case-insensitively', () => {
    expect(isInDictionary('MYCOMPANY', ['MyCompany'])).toBe(true)
  })

  it('exercises all branches of the custom-dict scan (undefined slot, mismatch, match)', () => {
    // Sparse array: index 0 hole (undefined), index 1 mismatch, index 2 match.
    const dict: string[] = []
    dict[1] = 'other'
    dict[2] = 'real'
    expect(isInDictionary('real', dict)).toBe(true)
  })

  it('produces few false positives against random hex strings', () => {
    let hits = 0
    const trials = 1000
    for (let i = 0; i < trials; i++) {
      // 16 random hex chars — very unlikely to be a real word
      const random = Math.random().toString(16).slice(2, 18)
      if (isInDictionary(random)) hits++
    }
    // Target FP rate is ~1%; allow up to 4% in this sanity check.
    expect(hits / trials).toBeLessThan(0.04)
  })

  it('treats an empty customDictionary as no custom entries', () => {
    expect(isInDictionary('zzz-not-real-zz', [])).toBe(false)
  })

  it('returns false for unambiguous non-words', () => {
    expect(isInDictionary('xyzqwabcdfghijk')).toBe(false)
  })
})
