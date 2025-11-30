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
})
