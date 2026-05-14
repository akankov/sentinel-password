import { bench, describe } from 'vitest'
import { estimateEntropy } from '../src/index'
import zxcvbn from 'zxcvbn'

/**
 * Comparative benchmarks: @sentinel-password/entropy vs zxcvbn
 *
 * Run with: pnpm --filter @sentinel-password/entropy bench
 *
 * Why only zxcvbn? Both libraries produce entropy bits + a 0-4 score +
 * crack-time estimates under multiple attacker models, so the comparison
 * is apples-to-apples. The other libraries in core's comparative bench
 * (check-password-strength, password-validator) produce strength labels
 * or rule-pass/fail booleans, not entropy — those comparisons live in
 * `packages/core/tests/comparative.bench.ts`.
 *
 * Fixture constants match core's `comparative.bench.ts` so cross-package
 * numbers can be read side-by-side (same input → core's rule validation
 * vs entropy's bit estimation).
 */

const WEAK_PASSWORD: string = 'password'
const MEDIUM_PASSWORD: string = 'MyPassword1'
const STRONG_PASSWORD: string = 'MyP@ssw0rd123!'
const VERY_LONG_PASSWORD: string = 'A1b@' + 'x'.repeat(200) + 'Z9$'

describe('Weak password — "password"', () => {
  bench('sentinel-entropy', () => {
    estimateEntropy(WEAK_PASSWORD)
  })

  bench('zxcvbn', () => {
    zxcvbn(WEAK_PASSWORD)
  })
})

describe('Medium password — "MyPassword1"', () => {
  bench('sentinel-entropy', () => {
    estimateEntropy(MEDIUM_PASSWORD)
  })

  bench('zxcvbn', () => {
    zxcvbn(MEDIUM_PASSWORD)
  })
})

describe('Strong password — "MyP@ssw0rd123!"', () => {
  bench('sentinel-entropy', () => {
    estimateEntropy(STRONG_PASSWORD)
  })

  bench('zxcvbn', () => {
    zxcvbn(STRONG_PASSWORD)
  })
})

describe('Long password (200+ chars)', () => {
  bench('sentinel-entropy', () => {
    estimateEntropy(VERY_LONG_PASSWORD)
  })

  bench('zxcvbn', () => {
    zxcvbn(VERY_LONG_PASSWORD)
  })
})

describe('Batch estimation — 100 passwords', () => {
  const passwords: string[] = Array.from({ length: 100 }, (_, i: number) => {
    const bases: readonly string[] = [
      'password',
      'MyP@ssw0rd!',
      'qwerty123',
      'Str0ng!Pass',
      'abcdef',
    ]
    const base: string = bases[i % bases.length] as string
    return base + String(i)
  })

  bench('sentinel-entropy', () => {
    for (const pwd of passwords) {
      estimateEntropy(pwd)
    }
  })

  bench('zxcvbn', () => {
    for (const pwd of passwords) {
      zxcvbn(pwd)
    }
  })
})
