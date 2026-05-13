import { describe, expect, it } from 'vitest'
import { isInBuiltInDictionary, isInCustomDictionary, isInDictionary } from '../src/dictionary'

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

  it('detects alphanumeric seeds present in the bloom (abc123, password1)', () => {
    // The seed file passwords-extended.txt contains 572 entries with digits.
    expect(isInBuiltInDictionary('abc123')).toBe(true)
    expect(isInBuiltInDictionary('password1')).toBe(true)
    expect(isInBuiltInDictionary('qwerty1')).toBe(true)
  })
})

describe('isInBuiltInDictionary', () => {
  it('returns false for empty input', () => {
    expect(isInBuiltInDictionary('')).toBe(false)
  })

  it('matches known seeds', () => {
    expect(isInBuiltInDictionary('password')).toBe(true)
    expect(isInBuiltInDictionary('hello')).toBe(true)
  })

  it('returns false for non-words', () => {
    expect(isInBuiltInDictionary('xyzqwabcdfghijk')).toBe(false)
  })
})

describe('isInCustomDictionary', () => {
  it('returns false for empty input', () => {
    expect(isInCustomDictionary('', ['anything'])).toBe(false)
  })

  it('matches an entry case-insensitively', () => {
    expect(isInCustomDictionary('MyCompany', ['mycompany'])).toBe(true)
    expect(isInCustomDictionary('mycompany', ['MyCompany'])).toBe(true)
  })

  it('matches an entry containing non-alphanumeric characters', () => {
    // Reviewer-reported gap — entries like `Acme-2026` used to be filtered out
    // before reaching the custom-dict check.
    expect(isInCustomDictionary('Acme-2026', ['Acme-2026'])).toBe(true)
    expect(isInCustomDictionary('foo.bar', ['foo.bar'])).toBe(true)
  })

  it('returns false when no entry matches', () => {
    expect(isInCustomDictionary('foo', ['bar', 'baz'])).toBe(false)
  })

  it('skips undefined entries (sparse array)', () => {
    const dict: string[] = []
    dict[1] = 'real'
    expect(isInCustomDictionary('real', dict)).toBe(true)
    expect(isInCustomDictionary('nope', dict)).toBe(false)
  })
})
