import type {
  EntropyOptions,
  EntropyPattern,
  EntropyResult,
  ScoreThresholds,
  StrengthScore,
} from './types'
import { baseEntropyBits, bitsPerCharacter } from './shannon'
import { hasInitialCapitalization, repetitionRunLength, sequenceRunLength } from './patterns'
import { isInDictionary } from './dictionary'
import { leetCount, unleetCandidates } from './l33t'
import { bitsToCrackTime } from './crack-time'

/** Default bit cutoffs for score 1/2/3/4. Aligned with NIST 800-63B guidance. */
const DEFAULT_SCORE_THRESHOLDS: ScoreThresholds = [28, 36, 60, 128]
/** Minimum length below which dictionary matches are too noisy to reduce entropy. */
const MIN_DICTIONARY_LEN: number = 4
/**
 * Cap on dictionary match length. Real English words rarely exceed 18 chars
 * (`telecommunications`). Also bounds the number of bloom probes per position,
 * which limits exposure to false-positive accumulation across long inputs.
 */
const MAX_DICTIONARY_LEN: number = 18
/** Approximate dictionary size used to score matches; `log2(15000) ≈ 13.87` bits. */
const DICTIONARY_SIZE: number = 15000
/** Entropy added per l33t substitution applied to a dictionary match. */
const L33T_BIT_PER_SUB: number = 1
/** Entropy added when a dictionary match has initial-capital styling. */
const CAPITALIZATION_BITS: number = 1
/** Entropy added on top of `log2(length)` for a sequence — accounts for start char + direction. */
const SEQUENCE_BASE_BITS: number = 2

interface Candidate {
  readonly length: number
  readonly bits: number
  readonly pattern: EntropyPattern
  /** Extra patterns to record alongside `pattern` (e.g. `capitalization` with `dictionary`). */
  readonly extra?: readonly EntropyPattern[]
}

/**
 * Estimate the effective entropy of `password` and the time it would survive
 * under standard brute-force attack models.
 *
 * The estimator computes a Shannon baseline (`length × log2(alphabetSize)`)
 * then walks the password greedily left-to-right, attributing any matched
 * pattern (sequence, repetition, dictionary, l33t-dictionary, initial
 * capitalization) its *intrinsic* bit cost instead of the per-char baseline.
 *
 * `personalInfo` matches force `bits` to 0 unconditionally — those passwords
 * are guessable with one try given the targeted user.
 *
 * @example
 *   estimateEntropy('password')
 *   // → { bits: ~14, score: 0, patterns: ['dictionary'], crackTime: { ... } }
 *
 *   estimateEntropy('Tr0ub4dor&3')
 *   // → { bits: ~28, score: 1, patterns: ['l33t', 'capitalization'], ... }
 *
 *   estimateEntropy('correct horse battery staple')
 *   // → { bits: ~80, score: 3, patterns: ['dictionary'], ... }
 */
export function estimateEntropy(password: string, options: EntropyOptions = {}): EntropyResult {
  const thresholds: ScoreThresholds = options.scoreThresholds ?? DEFAULT_SCORE_THRESHOLDS

  if (password.length === 0) {
    return zeroEntropy([])
  }

  const personalHit: boolean = matchesPersonalInfo(password, options.personalInfo)
  if (personalHit) {
    return zeroEntropy(['personalInfo'])
  }

  const perCharBits: number = bitsPerCharacter(password)
  const patternSet: Set<EntropyPattern> = new Set<EntropyPattern>()
  let bits: number = 0
  let i: number = 0

  while (i < password.length) {
    const winner: Candidate | null = bestCandidateAt(
      password,
      i,
      perCharBits,
      options.customDictionary
    )
    if (winner === null) {
      bits += perCharBits
      i += 1
      continue
    }
    bits += Math.min(winner.bits, winner.length * perCharBits)
    patternSet.add(winner.pattern)
    if (winner.extra !== undefined) {
      for (const p of winner.extra) patternSet.add(p)
    }
    i += winner.length
  }

  const baseline: number = baseEntropyBits(password)
  const finalBits: number = bits > baseline ? baseline : bits
  const score: StrengthScore = bitsToScore(finalBits, thresholds)

  return {
    bits: finalBits,
    score,
    crackTime: bitsToCrackTime(finalBits),
    patterns: Array.from(patternSet),
  }
}

function zeroEntropy(patterns: readonly EntropyPattern[]): EntropyResult {
  return { bits: 0, score: 0, crackTime: bitsToCrackTime(0), patterns }
}

function matchesPersonalInfo(password: string, infos?: readonly string[]): boolean {
  if (infos === undefined || infos.length === 0) return false
  const lower: string = password.toLowerCase()
  for (const info of infos) {
    if (info === undefined || info.length === 0) continue
    if (lower.includes(info.toLowerCase())) return true
  }
  return false
}

function bestCandidateAt(
  password: string,
  start: number,
  perCharBits: number,
  customDictionary?: readonly string[]
): Candidate | null {
  const candidates: Candidate[] = []

  const rep: number = repetitionRunLength(password, start)
  if (rep > 0) {
    candidates.push({
      length: rep,
      bits: perCharBits + Math.log2(rep),
      pattern: 'repetition',
    })
  }

  const seq: number = sequenceRunLength(password, start)
  if (seq > 0) {
    candidates.push({
      length: seq,
      bits: perCharBits + Math.log2(seq) + SEQUENCE_BASE_BITS,
      pattern: 'sequence',
    })
  }

  const dict: number = findDictionaryMatch(password, start, customDictionary)
  if (dict > 0) {
    const matched: string = password.substring(start, start + dict)
    const cap: boolean = hasInitialCapitalization(matched)
    candidates.push({
      length: dict,
      bits: Math.log2(DICTIONARY_SIZE) + (cap ? CAPITALIZATION_BITS : 0),
      pattern: 'dictionary',
      ...(cap ? { extra: ['capitalization'] as const } : {}),
    })
  }

  const l33t: { readonly length: number; readonly subs: number } | null = findL33tDictionaryMatch(
    password,
    start,
    customDictionary
  )
  if (l33t !== null) {
    candidates.push({
      length: l33t.length,
      bits: Math.log2(DICTIONARY_SIZE) + l33t.subs * L33T_BIT_PER_SUB,
      pattern: 'l33t',
    })
  }

  return pickBest(candidates)
}

function pickBest(candidates: readonly Candidate[]): Candidate | null {
  let best: Candidate | null = null
  for (const c of candidates) {
    if (best === null) {
      best = c
      continue
    }
    if (c.length > best.length || (c.length === best.length && c.bits < best.bits)) {
      best = c
    }
  }
  return best
}

/**
 * Real dictionary words contain only ASCII letters. Anything else in a
 * candidate is a giveaway it's a bloom false positive, not a real word match.
 * This filter eliminates the bulk of the FP attack surface produced by
 * substring scanning over the bloom filter.
 */
function isPureAlpha(s: string): boolean {
  for (let i: number = 0; i < s.length; i++) {
    const c: number = s.charCodeAt(i)
    if (!((c >= 65 && c <= 90) || (c >= 97 && c <= 122))) return false
  }
  return true
}

function findDictionaryMatch(
  password: string,
  start: number,
  customDictionary?: readonly string[]
): number {
  const remaining: number = password.length - start
  const maxLen: number = remaining < MAX_DICTIONARY_LEN ? remaining : MAX_DICTIONARY_LEN
  for (let len: number = maxLen; len >= MIN_DICTIONARY_LEN; len--) {
    const sub: string = password.substring(start, start + len)
    if (!isPureAlpha(sub)) continue
    if (isInDictionary(sub, customDictionary)) return len
  }
  return 0
}

function findL33tDictionaryMatch(
  password: string,
  start: number,
  customDictionary?: readonly string[]
): { readonly length: number; readonly subs: number } | null {
  const remaining: number = password.length - start
  const maxLen: number = remaining < MAX_DICTIONARY_LEN ? remaining : MAX_DICTIONARY_LEN
  for (let len: number = maxLen; len >= MIN_DICTIONARY_LEN; len--) {
    const sub: string = password.substring(start, start + len)
    const subs: number = leetCount(sub)
    if (subs === 0) continue
    const candidates: readonly string[] = unleetCandidates(sub)
    for (const cand of candidates) {
      if (cand === sub) continue
      if (!isPureAlpha(cand)) continue
      if (isInDictionary(cand, customDictionary)) return { length: len, subs }
    }
  }
  return null
}

function bitsToScore(bits: number, thresholds: ScoreThresholds): StrengthScore {
  if (bits < thresholds[0]) return 0
  if (bits < thresholds[1]) return 1
  if (bits < thresholds[2]) return 2
  if (bits < thresholds[3]) return 3
  return 4
}
