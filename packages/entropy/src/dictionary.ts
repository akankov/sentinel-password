import { BLOOM_BUCKETS, BLOOM_HASH_COUNT, BLOOM_SIZE } from './data/dict-bloom'

const BITS_PER_INT32: number = 32

/**
 * Two independent hash functions (djb2 + FNV-1a). MUST match
 * `scripts/generate-entropy-bloom.cjs` byte-for-byte — the generated bloom
 * filter is keyed on these exact hashes.
 */
function djb2Hash(str: string): number {
  let hash: number = 5381
  for (let i: number = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function fnv1aHash(str: string): number {
  let hash: number = 2166136261 | 0
  for (let i: number = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash | 0)
}

function getHashes(word: string): readonly number[] {
  const h1: number = djb2Hash(word)
  const h2: number = fnv1aHash(word)
  const hashes: number[] = new Array(BLOOM_HASH_COUNT)
  for (let i: number = 0; i < BLOOM_HASH_COUNT; i++) {
    hashes[i] = ((h1 + i * h2) >>> 0) % BLOOM_SIZE
  }
  return hashes
}

/** Returns true iff every hashed bit is set in the bloom filter. */
function bloomContains(word: string): boolean {
  const hashes: readonly number[] = getHashes(word)
  for (const h of hashes) {
    const arrayIdx: number = Math.floor(h / BITS_PER_INT32)
    const bitIdx: number = h % BITS_PER_INT32
    const bucket: number | undefined = BLOOM_BUCKETS[arrayIdx]
    if (bucket === undefined || (bucket & (1 << bitIdx)) === 0) return false
  }
  return true
}

/**
 * Exact-match lookup in a caller-supplied custom dictionary. Case-insensitive.
 * No bloom filter, no false positives.
 */
export function isInCustomDictionary(word: string, customDictionary: readonly string[]): boolean {
  if (word.length === 0) return false
  const lower: string = word.toLowerCase()
  for (const entry of customDictionary) {
    if (entry !== undefined && entry.toLowerCase() === lower) return true
  }
  return false
}

/**
 * Bloom-filter lookup against the built-in dictionary. Case-insensitive.
 * Has a small (~0.3%) false-positive rate; callers in `estimate.ts` gate
 * probes behind candidate-shape filters to limit FP exposure.
 */
export function isInBuiltInDictionary(word: string): boolean {
  if (word.length === 0) return false
  return bloomContains(word.toLowerCase())
}

/**
 * Returns true iff `word` is in the built-in dictionary OR in `customDictionary`.
 * Lookup is case-insensitive. Empty input returns false.
 *
 * Bloom filter has a target false-positive rate of ~0.3%.
 */
export function isInDictionary(word: string, customDictionary?: readonly string[]): boolean {
  if (
    customDictionary !== undefined &&
    customDictionary.length > 0 &&
    isInCustomDictionary(word, customDictionary)
  ) {
    return true
  }
  return isInBuiltInDictionary(word)
}
