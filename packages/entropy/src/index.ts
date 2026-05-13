/**
 * @sentinel-password/entropy
 *
 * Shannon entropy estimator with dictionary, l33t, and pattern detection.
 * Zero runtime dependencies. ≤ 30 KB gzipped (CI enforced).
 *
 * @example
 * ```typescript
 * import { estimateEntropy } from '@sentinel-password/entropy'
 *
 * const result = estimateEntropy('Tr0ub4dor&3')
 * // result.bits        → ~28
 * // result.score       → 1
 * // result.crackTime   → { onlineThrottled, onlineUnthrottled, offlineSlowHash, offlineFastHash }
 * // result.patterns    → ['l33t', 'capitalization', ...]
 * ```
 */

export { estimateEntropy } from './estimate'

export type {
  CrackEstimate,
  CrackTimePresets,
  EntropyOptions,
  EntropyPattern,
  EntropyResult,
  ScoreThresholds,
  StrengthScore,
} from './types'
