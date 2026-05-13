import { describe, expect, it } from 'vitest'
import { alphabetSize, baseEntropyBits, bitsPerCharacter } from '../src/shannon'

describe('alphabetSize', () => {
  it('returns 0 for empty input', () => {
    expect(alphabetSize('')).toBe(0)
  })

  it('counts lowercase only', () => {
    expect(alphabetSize('abc')).toBe(26)
  })

  it('counts uppercase only', () => {
    expect(alphabetSize('ABC')).toBe(26)
  })

  it('counts digits only', () => {
    expect(alphabetSize('1234')).toBe(10)
  })

  it('counts ASCII symbols only', () => {
    expect(alphabetSize('!@#$')).toBe(33)
  })

  it('counts unicode/other only', () => {
    expect(alphabetSize('ñöü')).toBe(100)
  })

  it('sums classes for mixed input', () => {
    expect(alphabetSize('aA1!')).toBe(26 + 26 + 10 + 33)
  })

  it('combines lowercase + unicode for accented words', () => {
    expect(alphabetSize('caña')).toBe(26 + 100)
  })

  it('handles control characters as other', () => {
    expect(alphabetSize('\x01\x02')).toBe(100)
  })
})

describe('baseEntropyBits', () => {
  it('returns 0 for empty input', () => {
    expect(baseEntropyBits('')).toBe(0)
  })

  it('computes length × log2(alphabetSize)', () => {
    expect(baseEntropyBits('abcd')).toBeCloseTo(4 * Math.log2(26), 5)
    expect(baseEntropyBits('aA1!')).toBeCloseTo(4 * Math.log2(95), 5)
  })
})

describe('bitsPerCharacter', () => {
  it('returns 0 for empty input (alphabet size 0)', () => {
    expect(bitsPerCharacter('')).toBe(0)
  })

  it('returns log2(alphabetSize) for non-empty input', () => {
    expect(bitsPerCharacter('abc')).toBeCloseTo(Math.log2(26), 5)
    expect(bitsPerCharacter('aA1!')).toBeCloseTo(Math.log2(95), 5)
  })
})
