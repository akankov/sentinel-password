import { afterEach, describe, expect, it, vi } from 'vitest'
import { randomInt } from '../src/random'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('randomInt', () => {
  it('returns 0 for maxExclusive 1 without touching crypto', () => {
    vi.stubGlobal('crypto', undefined)
    expect(randomInt(1)).toBe(0)
  })

  it('stays within [0, max) across many draws', () => {
    for (let i = 0; i < 10_000; i++) {
      const value = randomInt(7)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(7)
      expect(Number.isInteger(value)).toBe(true)
    }
  })

  it('is roughly uniform (chi-squared over 26 buckets)', () => {
    const buckets = new Array(26).fill(0) as number[]
    const trials = 26_000
    for (let i = 0; i < trials; i++) {
      const idx = randomInt(26)
      buckets[idx] = (buckets[idx] ?? 0) + 1
    }
    const expected = trials / 26
    const chiSquared = buckets.reduce((sum, count) => sum + (count - expected) ** 2 / expected, 0)
    // df = 25; P(chi2 > 70) ≈ 4e-6 for a fair source — comfortably non-flaky
    // while still failing hard for a broken or biased generator.
    expect(chiSquared).toBeLessThan(70)
  })

  it('rejects biased tail draws (no modulo bias)', () => {
    // For max=3: limit = 2^32 - (2^32 % 3) = 4294967295, so 0xFFFFFFFF is the
    // single tail value that must be rejected and redrawn. Feed it first,
    // then 5 (5 % 3 = 2) — randomInt must consume both draws and return 2.
    const values = [0xffffffff, 5]
    let call = 0
    vi.stubGlobal('crypto', {
      getRandomValues: (arr: Uint32Array) => {
        arr[0] = values[call] ?? 0
        call++
        return arr
      },
    })
    expect(randomInt(3)).toBe(2)
    expect(call).toBe(2)
  })

  it('throws RangeError on non-integer, zero, negative, or oversized max', () => {
    expect(() => randomInt(0)).toThrow(RangeError)
    expect(() => randomInt(-5)).toThrow(RangeError)
    expect(() => randomInt(2.5)).toThrow(RangeError)
    expect(() => randomInt(Number.NaN)).toThrow(RangeError)
    expect(() => randomInt(2 ** 33)).toThrow(RangeError)
  })

  it('throws when crypto.getRandomValues is unavailable', () => {
    vi.stubGlobal('crypto', undefined)
    expect(() => randomInt(10)).toThrow(/getRandomValues is unavailable/)
  })
})
