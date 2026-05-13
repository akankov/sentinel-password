import { describe, expect, it } from 'vitest'
import { bitsToCrackEstimate, bitsToCrackTime, humanizeDuration } from '../src/crack-time'

describe('humanizeDuration', () => {
  it('returns "centuries" for very large or non-finite values', () => {
    expect(humanizeDuration(Number.MAX_VALUE)).toBe('centuries')
    expect(humanizeDuration(Infinity)).toBe('centuries')
    expect(humanizeDuration(NaN)).toBe('centuries')
  })

  it('returns "instant" for sub-second durations', () => {
    expect(humanizeDuration(0)).toBe('instant')
    expect(humanizeDuration(0.5)).toBe('instant')
  })

  it('returns "less than a minute" for durations under a minute', () => {
    expect(humanizeDuration(1)).toBe('less than a minute')
    expect(humanizeDuration(59)).toBe('less than a minute')
  })

  it('formats minutes', () => {
    expect(humanizeDuration(60)).toBe('1 minute')
    expect(humanizeDuration(60 * 5)).toBe('5 minutes')
  })

  it('formats hours', () => {
    expect(humanizeDuration(3600)).toBe('1 hour')
    expect(humanizeDuration(3600 * 7)).toBe('7 hours')
  })

  it('formats days', () => {
    expect(humanizeDuration(86_400)).toBe('1 day')
    expect(humanizeDuration(86_400 * 3)).toBe('3 days')
  })

  it('formats months', () => {
    const sixWeeks = 86_400 * 42
    expect(humanizeDuration(sixWeeks)).toMatch(/months?/)
  })

  it('formats years', () => {
    const twoYears = 86_400 * 365 * 2
    expect(humanizeDuration(twoYears)).toBe('2 years')
  })

  it('reports a singular "1 minute" for values that round down to 0', () => {
    // 60.01s / 60 ≈ 1.0002 — rounds to 1; safety floor also keeps it ≥ 1.
    expect(humanizeDuration(60.01)).toBe('1 minute')
    // 3600.01s / 3600 ≈ 1.0000028 — rounds to 1.
    expect(humanizeDuration(3600.01)).toBe('1 hour')
  })
})

describe('bitsToCrackEstimate', () => {
  it('returns 0-second instant for non-positive bits', () => {
    const est = bitsToCrackEstimate(0, 1e4)
    expect(est.seconds).toBe(0)
    expect(est.display).toBe('instant')
    expect(bitsToCrackEstimate(-5, 1e4).seconds).toBe(0)
  })

  it('returns proportional seconds for finite values', () => {
    const est = bitsToCrackEstimate(40, 1e4)
    expect(est.seconds).toBeCloseTo(Math.pow(2, 39) / 1e4, -2)
    expect(typeof est.display).toBe('string')
  })

  it('caps at MAX_VALUE for very high entropy', () => {
    const est = bitsToCrackEstimate(2000, 1e4) // 2^1999 → Infinity
    expect(est.seconds).toBe(Number.MAX_VALUE)
    expect(est.display).toBe('centuries')
  })
})

describe('bitsToCrackTime', () => {
  it('returns a complete CrackTimePresets block', () => {
    const presets = bitsToCrackTime(40)
    expect(presets.onlineThrottled).toBeDefined()
    expect(presets.onlineUnthrottled).toBeDefined()
    expect(presets.offlineSlowHash).toBeDefined()
    expect(presets.offlineFastHash).toBeDefined()
  })

  it('makes offline-fast-hash always faster than online-throttled', () => {
    const presets = bitsToCrackTime(50)
    expect(presets.offlineFastHash.seconds).toBeLessThanOrEqual(presets.onlineThrottled.seconds)
  })
})
