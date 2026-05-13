import { describe, expect, it } from 'vitest'
import { MAX_CANDIDATES, isLeetChar, leetCount, unleetCandidates } from '../src/l33t'

describe('isLeetChar', () => {
  it('returns true for known l33t chars', () => {
    expect(isLeetChar('@')).toBe(true)
    expect(isLeetChar('0')).toBe(true)
    expect(isLeetChar('$')).toBe(true)
  })

  it('returns false for non-leet chars', () => {
    expect(isLeetChar('a')).toBe(false)
    expect(isLeetChar('Z')).toBe(false)
    expect(isLeetChar('~')).toBe(false)
  })
})

describe('leetCount', () => {
  it('returns 0 for input without any leet chars', () => {
    expect(leetCount('password')).toBe(0)
  })

  it('counts all leet chars in the input', () => {
    expect(leetCount('p@ssw0rd')).toBe(2)
    expect(leetCount('$3cr37')).toBe(4)
  })

  it('returns 0 for empty input', () => {
    expect(leetCount('')).toBe(0)
  })
})

describe('unleetCandidates', () => {
  it('returns the original input when no leet chars present', () => {
    const candidates = unleetCandidates('hello')
    expect(candidates).toEqual(['hello'])
  })

  it('produces both substituted and original forms', () => {
    const candidates = unleetCandidates('p@ss')
    expect(candidates).toContain('pass')
    expect(candidates).toContain('p@ss')
  })

  it('explodes for multi-substitution chars', () => {
    // '1' maps to ['i', 'l']
    const candidates = unleetCandidates('1')
    expect(candidates).toContain('i')
    expect(candidates).toContain('l')
    expect(candidates).toContain('1')
  })

  it('produces an empty-string candidate for empty input', () => {
    expect(unleetCandidates('')).toEqual([''])
  })

  it('caps candidate enumeration at MAX_CANDIDATES', () => {
    // '@@@@@@@@' has 2^8 = 256 substitution combinations.
    const result = unleetCandidates('@@@@@@@@')
    expect(result.length).toBeLessThanOrEqual(MAX_CANDIDATES)
    expect(MAX_CANDIDATES).toBe(32)
  })

  it('caps even when each char has multiple substitutions', () => {
    // '1' has 2 subs; '11111111' would expand to 3^8 without cap
    const result = unleetCandidates('11111111')
    expect(result.length).toBeLessThanOrEqual(MAX_CANDIDATES)
  })

  it('caps mid-expansion when the cap is reached during sub iteration', () => {
    // Long enough that the cap kicks in during the inner sub loop too
    const result = unleetCandidates('111111111111')
    expect(result.length).toBeLessThanOrEqual(MAX_CANDIDATES)
  })

  it('caps mid-expansion for non-leet chars after cap is approached', () => {
    // Prefix gets near the cap with l33t chars, then plain chars append to all candidates
    const result = unleetCandidates('111111111111abcdef')
    expect(result.length).toBeLessThanOrEqual(MAX_CANDIDATES)
    for (const c of result) expect(c.endsWith('abcdef')).toBe(true)
  })

  it('caps non-leet expansion after a saturated prefix', () => {
    // Force the no-sub branch to hit the cap-break after cap is reached
    const result = unleetCandidates('1111abcd')
    expect(result.length).toBeLessThanOrEqual(MAX_CANDIDATES)
  })
})
