import { describe, it, expect } from 'vitest'
import { validateRepetition } from '../../src'

describe('validateRepetition', () => {
  it('should pass for passwords without excessive repetition', () => {
    const result = validateRepetition('password123', { maxRepeatedChars: 3 })
    expect(result.passed).toBe(true)
  })

  it('should fail for passwords with excessive repeated characters', () => {
    const result = validateRepetition('passssword', { maxRepeatedChars: 3 })
    expect(result.passed).toBe(false)
    expect(result.message).toContain('repeated')
  })

  it('should detect repeated digits', () => {
    const result = validateRepetition('password1111', { maxRepeatedChars: 3 })
    expect(result.passed).toBe(false)
  })

  it('should detect repeated symbols', () => {
    const result = validateRepetition('pass!!!!word', { maxRepeatedChars: 3 })
    expect(result.passed).toBe(false)
  })

  it('should use default max of 3 if not specified', () => {
    const result = validateRepetition('passssword')
    expect(result.passed).toBe(false)
  })

  it('should allow repetition up to the limit', () => {
    const result = validateRepetition('passsword', { maxRepeatedChars: 3 })
    expect(result.passed).toBe(true)
  })

  it('should fail when exceeding the limit by one', () => {
    const result = validateRepetition('passssword', { maxRepeatedChars: 3 })
    expect(result.passed).toBe(false)
  })

  it('should handle multiple different repetitions', () => {
    const result = validateRepetition('paaaasssswoooord', { maxRepeatedChars: 3 })
    expect(result.passed).toBe(false)
  })

  it('should pass when all repetitions are within limit', () => {
    const result = validateRepetition('paassword', { maxRepeatedChars: 3 })
    expect(result.passed).toBe(true)
  })

  it('should handle empty password', () => {
    const result = validateRepetition('', { maxRepeatedChars: 3 })
    expect(result.passed).toBe(true)
  })

  it('should handle single character password', () => {
    const result = validateRepetition('a', { maxRepeatedChars: 3 })
    expect(result.passed).toBe(true)
  })

  it('should detect case-sensitive repetitions', () => {
    const result = validateRepetition('pAssword', { maxRepeatedChars: 3 })
    expect(result.passed).toBe(true)
  })

  it('should handle very long repetitions', () => {
    const result = validateRepetition('a'.repeat(100), { maxRepeatedChars: 3 })
    expect(result.passed).toBe(false)
  })

  it('detects repeated astral characters (emoji) by code point', () => {
    // Four identical emoji are 8 UTF-16 code units; a code-unit scan would miss
    // the run. Code-point iteration counts them as 4 repeats and flags it.
    expect(validateRepetition('\u{1F600}'.repeat(4)).passed).toBe(false)
    expect(validateRepetition('\u{1F600}'.repeat(3)).passed).toBe(true)
  })
})
