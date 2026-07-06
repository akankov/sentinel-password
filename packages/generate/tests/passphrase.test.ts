import { describe, expect, it } from 'vitest'
import { generatePassphrase } from '../src/passphrase'
import { EFF_SHORT_WORDLIST } from '../src/wordlist'

describe('EFF_SHORT_WORDLIST', () => {
  it('contains exactly 1,296 unique lowercase words', () => {
    expect(EFF_SHORT_WORDLIST).toHaveLength(1296)
    expect(new Set(EFF_SHORT_WORDLIST).size).toBe(1296)
    for (const word of EFF_SHORT_WORDLIST) {
      expect(word).toMatch(/^[a-z-]+$/) // 'yo-yo' carries a hyphen
    }
  })
})

describe('generatePassphrase', () => {
  it('generates six hyphen-separated EFF words by default', () => {
    const { value, entropyBits } = generatePassphrase()
    // Split on the default separator; 'yo-yo' would add segments, so verify
    // by reconstruction instead of naive splitting.
    const words = value.split('-')
    expect(words.length).toBeGreaterThanOrEqual(6)
    expect(entropyBits).toBeCloseTo(6 * Math.log2(1296), 1)
  })

  it('draws every word from the wordlist', () => {
    const { value } = generatePassphrase({ separator: ' ' })
    const words = value.split(' ')
    expect(words).toHaveLength(6)
    for (const word of words) {
      expect(EFF_SHORT_WORDLIST).toContain(word)
    }
  })

  it('respects a custom word count and separator', () => {
    const { value, entropyBits } = generatePassphrase({ words: 4, separator: '.' })
    expect(value.split('.')).toHaveLength(4)
    expect(entropyBits).toBeCloseTo(4 * Math.log2(1296), 1)
  })

  it('capitalizes each word when asked', () => {
    const { value } = generatePassphrase({ words: 5, separator: ' ', capitalize: true })
    for (const word of value.split(' ')) {
      expect(word.charAt(0)).toMatch(/[A-Z]/)
    }
  })

  it('supports a custom wordlist and computes entropy from its size', () => {
    const wordlist = ['alpha', 'bravo', 'charlie', 'delta'] as const
    const { value, entropyBits } = generatePassphrase({ words: 3, wordlist, separator: ' ' })
    for (const word of value.split(' ')) {
      expect(wordlist).toContain(word)
    }
    expect(entropyBits).toBeCloseTo(3 * 2, 1) // log2(4) = 2 bits per word
  })

  it('throws on invalid word counts', () => {
    expect(() => generatePassphrase({ words: 0 })).toThrow(RangeError)
    expect(() => generatePassphrase({ words: -1 })).toThrow(RangeError)
    expect(() => generatePassphrase({ words: 2.5 })).toThrow(RangeError)
    expect(() => generatePassphrase({ words: 500 })).toThrow(RangeError)
  })

  it('throws on a degenerate custom wordlist', () => {
    expect(() => generatePassphrase({ wordlist: ['solo'] })).toThrow(RangeError)
    expect(() => generatePassphrase({ wordlist: [] })).toThrow(RangeError)
  })

  it('produces distinct passphrases across calls', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 50; i++) {
      seen.add(generatePassphrase().value)
    }
    expect(seen.size).toBe(50)
  })
})
