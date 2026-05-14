import { bench, describe } from 'vitest'
import { estimateEntropy } from '../src/index'

/**
 * Performance benchmarks for @sentinel-password/entropy
 *
 * Run with: pnpm --filter @sentinel-password/entropy bench
 *
 * Covers three groupings:
 *   - Full estimation across representative password shapes
 *   - Option-driven code paths (customDictionary, personalInfo, scoreThresholds)
 *   - Bloom-dictionary lookup hot path (hit vs miss vs custom)
 */

describe('estimateEntropy — full estimation', () => {
  bench('dictionary hit ("password")', () => {
    estimateEntropy('password')
  })

  bench('l33t + capitalization ("Tr0ub4dor&3")', () => {
    estimateEntropy('Tr0ub4dor&3')
  })

  bench('passphrase ("correct horse battery staple")', () => {
    estimateEntropy('correct horse battery staple')
  })

  bench('pure-random 12-char ("aB3!xY9@kQ7#")', () => {
    estimateEntropy('aB3!xY9@kQ7#')
  })

  bench('repetition ("aaaaaaaa")', () => {
    estimateEntropy('aaaaaaaa')
  })

  bench('keyboard pattern ("qwertyuiop")', () => {
    estimateEntropy('qwertyuiop')
  })

  bench('long edge case (256 chars)', () => {
    estimateEntropy('a'.repeat(256))
  })
})

describe('estimateEntropy — with options', () => {
  bench('customDictionary match', () => {
    estimateEntropy('myCompany2026', { customDictionary: ['myCompany2026'] })
  })

  bench('personalInfo match (forces bits=0)', () => {
    estimateEntropy('alice@example.com', { personalInfo: ['alice'] })
  })

  bench('custom scoreThresholds', () => {
    estimateEntropy('P@ssword', { scoreThresholds: [20, 30, 50, 100] })
  })
})

describe('Bloom-dictionary lookup paths', () => {
  bench('built-in dictionary hit', () => {
    estimateEntropy('password')
  })

  bench('built-in dictionary miss (random alphanumeric)', () => {
    estimateEntropy('xyzqwabcdfghijk')
  })

  bench('customDictionary hit (custom-only word)', () => {
    estimateEntropy('mycompanyname', { customDictionary: ['mycompanyname'] })
  })
})
