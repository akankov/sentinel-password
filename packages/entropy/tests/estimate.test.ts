import { describe, expect, it } from 'vitest'
import { estimateEntropy } from '../src/estimate'

describe('estimateEntropy — empty + personalInfo', () => {
  it('returns zero entropy for an empty password', () => {
    const result = estimateEntropy('')
    expect(result.bits).toBe(0)
    expect(result.score).toBe(0)
    expect(result.patterns).toEqual([])
    expect(result.crackTime.offlineFastHash.display).toBe('instant')
  })

  it('forces bits to 0 when personalInfo matches as a substring', () => {
    const result = estimateEntropy('JohnExample123', {
      personalInfo: ['john@example.com', 'John'],
    })
    expect(result.bits).toBe(0)
    expect(result.score).toBe(0)
    expect(result.patterns).toEqual(['personalInfo'])
  })

  it('does NOT zero out when personalInfo does not match', () => {
    const result = estimateEntropy('Tr0ub4dor&3', { personalInfo: ['alice'] })
    expect(result.bits).toBeGreaterThan(0)
    expect(result.patterns).not.toContain('personalInfo')
  })

  it('ignores empty strings inside the personalInfo array', () => {
    const result = estimateEntropy('xyz123ABC!@#', { personalInfo: [''] })
    expect(result.bits).toBeGreaterThan(0)
  })

  it('ignores an empty personalInfo array', () => {
    const result = estimateEntropy('xyz123ABC!@#', { personalInfo: [] })
    expect(result.bits).toBeGreaterThan(0)
  })

  it('handles a sparse personalInfo array (undefined entries are skipped)', () => {
    const sparse: string[] = []
    sparse.length = 2 // creates [undefined, undefined]
    sparse[1] = 'admin'
    const matches = estimateEntropy('adminPassword', { personalInfo: sparse })
    expect(matches.patterns).toContain('personalInfo')
  })
})

describe('estimateEntropy — fixture cases', () => {
  it('classifies "password" as low-entropy dictionary match', () => {
    const result = estimateEntropy('password')
    expect(result.score).toBe(0)
    expect(result.patterns).toContain('dictionary')
  })

  it('classifies "P@ssw0rd123" with l33t pattern (unleets to "password")', () => {
    const result = estimateEntropy('P@ssw0rd123')
    expect(result.patterns).toContain('l33t')
    expect(result.score).toBeLessThanOrEqual(2)
  })

  it('classifies a four-word passphrase as high-entropy', () => {
    const result = estimateEntropy('correct horse battery staple')
    expect(result.score).toBeGreaterThanOrEqual(3)
  })

  it('classifies pure-random 12-char input as high-entropy', () => {
    const result = estimateEntropy('aB3!xY9@kQ7#')
    expect(result.score).toBeGreaterThanOrEqual(3)
    expect(result.patterns).not.toContain('dictionary')
  })

  it('detects sequences', () => {
    const result = estimateEntropy('abcdefgh')
    expect(result.patterns.includes('sequence') || result.patterns.includes('dictionary')).toBe(
      true
    )
    expect(result.score).toBeLessThanOrEqual(1)
  })

  it('detects keyboard-row sequences', () => {
    const result = estimateEntropy('qwertyuiop')
    expect(result.patterns.includes('sequence') || result.patterns.includes('dictionary')).toBe(
      true
    )
  })

  it('detects long repetitions', () => {
    const result = estimateEntropy('aaaaaaaa')
    expect(result.patterns).toContain('repetition')
  })

  it('marks initial-capitalized dictionary words', () => {
    const result = estimateEntropy('Password')
    expect(result.patterns).toContain('dictionary')
    expect(result.patterns).toContain('capitalization')
  })
})

describe('estimateEntropy — options', () => {
  it('respects custom score thresholds', () => {
    const high = estimateEntropy('aB3!xY9@', { scoreThresholds: [10, 20, 30, 40] })
    expect(high.score).toBe(4)
    const low = estimateEntropy('aB3!xY9@', { scoreThresholds: [200, 300, 400, 500] })
    expect(low.score).toBe(0)
  })

  it('hits each score band via tuned thresholds', () => {
    const password = 'aB3!xY9@' // ~52 bits — bracket each band by choosing thresholds
    expect(estimateEntropy(password, { scoreThresholds: [100, 200, 300, 400] }).score).toBe(0)
    expect(estimateEntropy(password, { scoreThresholds: [10, 100, 200, 300] }).score).toBe(1)
    expect(estimateEntropy(password, { scoreThresholds: [10, 20, 100, 200] }).score).toBe(2)
    expect(estimateEntropy(password, { scoreThresholds: [10, 20, 30, 100] }).score).toBe(3)
    expect(estimateEntropy(password, { scoreThresholds: [1, 2, 3, 4] }).score).toBe(4)
  })

  it('matches custom dictionary entries', () => {
    const result = estimateEntropy('zzzcompanynamezzz', { customDictionary: ['zzzcompanynamezzz'] })
    expect(result.patterns).toContain('dictionary')
  })

  it('returns a non-zero bits result for normal mixed input', () => {
    const result = estimateEntropy('hellothere')
    expect(result.bits).toBeGreaterThan(0)
    expect(result.bits).toBeLessThan(100)
  })

  it('never exceeds the Shannon baseline', () => {
    // Caps bits at length × log2(alphabetSize). For 'aaaa' the repetition gives
    // ~9 bits, well under the 18.8 baseline, but for a long passphrase the cap
    // becomes relevant.
    const result = estimateEntropy('aaaa')
    expect(result.bits).toBeLessThanOrEqual(4 * Math.log2(26) + 1e-9)
  })
})

describe('estimateEntropy — pattern interaction', () => {
  it('picks the longest pattern when alternatives tie on length', () => {
    // 'aaaa' — repetition is the only match; trivially a longest-wins case.
    const result = estimateEntropy('aaaa')
    expect(result.patterns).toEqual(['repetition'])
  })

  it('walks past unrecognised chars one at a time', () => {
    // Mix of non-repeating, non-sequential symbols with no dictionary hits.
    const result = estimateEntropy('~!#%^')
    expect(result.bits).toBeGreaterThan(0)
    expect(result.patterns).toEqual([])
  })

  it('combines dictionary words separated by other characters', () => {
    const result = estimateEntropy('hello!!!world')
    expect(result.patterns).toContain('dictionary')
  })
})
