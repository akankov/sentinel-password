import { describe, it, expect } from 'vitest'
import { validateSequential } from '../../src'

describe('validateSequential', () => {
  it('should pass for passwords without sequential patterns', () => {
    const result = validateSequential('Password135!')
    expect(result.passed).toBe(true)
  })

  it('should detect sequential lowercase letters', () => {
    const result = validateSequential('passabc123')
    expect(result.passed).toBe(false)
    expect(result.message).toContain('sequential')
  })

  it('should detect sequential uppercase letters', () => {
    const result = validateSequential('passABC123')
    expect(result.passed).toBe(false)
  })

  it('should detect sequential digits ascending', () => {
    const result = validateSequential('pass123word')
    expect(result.passed).toBe(false)
  })

  it('should detect sequential digits descending', () => {
    const result = validateSequential('pass321word')
    expect(result.passed).toBe(false)
  })

  it('should detect reverse sequential letters', () => {
    const result = validateSequential('passcba123')
    expect(result.passed).toBe(false)
  })

  it('should detect longer sequences', () => {
    const result = validateSequential('abcdefg')
    expect(result.passed).toBe(false)
  })

  it('should detect sequences at the start', () => {
    const result = validateSequential('abcpassword')
    expect(result.passed).toBe(false)
  })

  it('should detect sequences at the end', () => {
    const result = validateSequential('passwordabc')
    expect(result.passed).toBe(false)
  })

  it('should detect sequences in the middle', () => {
    const result = validateSequential('pass123word')
    expect(result.passed).toBe(false)
  })

  it('should allow passwords with non-sequential characters', () => {
    const result = validateSequential('p4s5w6r7d')
    expect(result.passed).toBe(true)
  })

  it('should handle empty password', () => {
    const result = validateSequential('')
    expect(result.passed).toBe(true)
  })

  it('should handle short passwords without sequences', () => {
    const result = validateSequential('ab')
    expect(result.passed).toBe(true)
  })

  it('should be case-sensitive for letters', () => {
    const result = validateSequential('aBc')
    expect(result.passed).toBe(true)
  })

  it('should detect 0123 sequence', () => {
    const result = validateSequential('pass0123')
    expect(result.passed).toBe(false)
  })

  it('should detect 9876 sequence', () => {
    const result = validateSequential('pass9876')
    expect(result.passed).toBe(false)
  })

  it('should detect xyz sequence', () => {
    const result = validateSequential('passxyz')
    expect(result.passed).toBe(false)
  })

  it('should allow when checkSequential is false', () => {
    const result = validateSequential('abc123', { checkSequential: false })
    expect(result.passed).toBe(true)
  })

  it('should not flag consecutive ASCII symbol runs', () => {
    // '(', ')', '*' are code-point-consecutive but not a typing pattern
    const result = validateSequential('Tr()*mb0ne')
    expect(result.passed).toBe(true)
  })

  it('should not flag symbol-to-letter boundary runs', () => {
    // '?' (63), '@' (64), 'A' (65) cross from punctuation into letters
    const result = validateSequential('V?@Am9x')
    expect(result.passed).toBe(true)
  })

  it('should not flag bracket runs', () => {
    // '[' (91), '\' (92), ']' (93)
    const result = validateSequential('V@[\\]9m')
    expect(result.passed).toBe(true)
  })

  it('should not flag descending symbol runs', () => {
    // '*' (42), ')' (41), '(' (40) descending
    const result = validateSequential('x7*)(Kpz')
    expect(result.passed).toBe(true)
  })

  it('should not flag digit-into-symbol boundary runs', () => {
    // '9' (57), ':' (58), ';' (59) — starts alphanumeric, leaves the class
    const result = validateSequential('pass9:;x')
    expect(result.passed).toBe(true)
  })

  it('should still detect non-ASCII alphabet sequences', () => {
    // Cyrillic а (0x430), б (0x431), в (0x432) are code-point-consecutive
    const result = validateSequential('парольабв')
    expect(result.passed).toBe(false)
  })
})
