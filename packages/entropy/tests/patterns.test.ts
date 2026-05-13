import { describe, expect, it } from 'vitest'
import { hasInitialCapitalization, repetitionRunLength, sequenceRunLength } from '../src/patterns'

describe('sequenceRunLength', () => {
  it('returns 0 when start is past end', () => {
    expect(sequenceRunLength('abc', 3)).toBe(0)
  })

  it('returns 0 for runs shorter than 4', () => {
    expect(sequenceRunLength('abc', 0)).toBe(0)
    expect(sequenceRunLength('xy', 0)).toBe(0)
  })

  it('detects ascending alphabetic sequences', () => {
    expect(sequenceRunLength('abcdef', 0)).toBe(6)
    expect(sequenceRunLength('xabcd', 1)).toBe(4)
  })

  it('detects descending alphabetic sequences', () => {
    expect(sequenceRunLength('dcba', 0)).toBe(4)
    expect(sequenceRunLength('ZYXW', 0)).toBe(4)
  })

  it('detects digit sequences', () => {
    expect(sequenceRunLength('12345', 0)).toBe(5)
  })

  it('detects keyboard rows (case-insensitive)', () => {
    expect(sequenceRunLength('qwerty', 0)).toBe(6)
    expect(sequenceRunLength('asdf', 0)).toBe(4)
    expect(sequenceRunLength('ZXCV', 0)).toBe(4)
  })

  it('returns 1 (below MIN threshold → 0) for unrelated chars', () => {
    expect(sequenceRunLength('xqp', 0)).toBe(0)
  })

  it('does not match a char that is in no keyboard row', () => {
    expect(sequenceRunLength('~~~~', 0)).toBe(0)
  })

  it('breaks the run at the first non-matching char', () => {
    expect(sequenceRunLength('qwerXY', 0)).toBe(4)
  })
})

describe('repetitionRunLength', () => {
  it('returns 0 when start is past end', () => {
    expect(repetitionRunLength('aaa', 3)).toBe(0)
  })

  it('returns 0 for runs of 2 (below MIN threshold)', () => {
    expect(repetitionRunLength('aab', 0)).toBe(0)
  })

  it('returns the run length when ≥ 3', () => {
    expect(repetitionRunLength('aaa', 0)).toBe(3)
    expect(repetitionRunLength('aaaab', 0)).toBe(4)
  })

  it('breaks at the first different char', () => {
    expect(repetitionRunLength('aaabbb', 0)).toBe(3)
  })

  it('detects multi-character token repetition (abab)', () => {
    expect(repetitionRunLength('abab', 0)).toBe(4)
    expect(repetitionRunLength('ababab', 0)).toBe(6)
  })

  it('detects 3-character token repetition (abcabc)', () => {
    expect(repetitionRunLength('abcabc', 0)).toBe(6)
    expect(repetitionRunLength('abcabcabc', 0)).toBe(9)
  })

  it('returns 0 for non-repeating tokens', () => {
    expect(repetitionRunLength('abcd', 0)).toBe(0)
    expect(repetitionRunLength('abcdef', 0)).toBe(0)
  })

  it('returns 0 for single-token below MIN length', () => {
    expect(repetitionRunLength('ab', 0)).toBe(0)
  })

  it('returns 0 for token of length 1 with one copy', () => {
    expect(repetitionRunLength('a', 0)).toBe(0)
  })

  it('cuts the repetition at a partial trailing token', () => {
    // 'abab' × 1 + 'ab' partial — only the complete tokens count
    expect(repetitionRunLength('ababab', 0)).toBe(6)
    expect(repetitionRunLength('ababcd', 0)).toBe(4)
  })
})

describe('hasInitialCapitalization', () => {
  it('returns false for words shorter than 2 chars', () => {
    expect(hasInitialCapitalization('A')).toBe(false)
    expect(hasInitialCapitalization('')).toBe(false)
  })

  it('returns false when the first char is not uppercase', () => {
    expect(hasInitialCapitalization('password')).toBe(false)
    expect(hasInitialCapitalization('1password')).toBe(false)
  })

  it('returns false when another uppercase char appears later', () => {
    expect(hasInitialCapitalization('PassWord')).toBe(false)
    expect(hasInitialCapitalization('PASSWORD')).toBe(false)
  })

  it('returns false when no lowercase chars follow the capital', () => {
    expect(hasInitialCapitalization('A1234')).toBe(false)
  })

  it('returns true for Title-case dictionary words', () => {
    expect(hasInitialCapitalization('Password')).toBe(true)
    expect(hasInitialCapitalization('Hello')).toBe(true)
  })
})
