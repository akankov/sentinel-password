#!/usr/bin/env node

/**
 * Regenerate the entropy package's dictionary bloom filter from seed files.
 *
 * Reads:
 *   packages/entropy/data/dictionary.txt          (English words)
 *   packages/entropy/data/passwords-extended.txt  (common passwords)
 *
 * Writes:
 *   packages/entropy/src/data/dict-bloom.ts       (Int32Array bloom filter)
 *
 * Usage: pnpm --filter @sentinel-password/entropy generate:dict
 *
 * Sources:
 *   - first20hours/google-10000-english (top 10K English words)
 *   - danielmiessler/SecLists/Passwords/Common-Credentials/10k-most-common.txt
 *
 * NOTE: hashes here MUST match `packages/entropy/src/dictionary.ts` at runtime.
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// --- Configuration ---
// Sized for ~12,000 entries at ~0.05% false-positive rate, 10 hash functions.
// FP ≈ (1 - e^(-kn/m))^k. With m=200,000 / k=10 / n=12,169 → ~0.04% predicted.
// Bloom raw size: 6,250 × Int32 = 25,000 bytes (incompressible). Combined with
// the encoded source + algorithm code, total bundle stays under the 30 KB
// gzipped CI gate.
const BLOOM_SIZE = 200_000
const HASH_COUNT = 10
/** Filter seeds shorter than this — the estimator never queries substrings below MIN_DICTIONARY_LEN. */
const MIN_SEED_LEN = 4
const BITS_PER_INT32 = 32
const ARRAY_SIZE = Math.ceil(BLOOM_SIZE / BITS_PER_INT32)

const DICT_FILE = path.join(__dirname, '..', 'packages', 'entropy', 'data', 'dictionary.txt')
const PASSWORDS_FILE = path.join(
  __dirname,
  '..',
  'packages',
  'entropy',
  'data',
  'passwords-extended.txt'
)
const OUTPUT_FILE = path.join(
  __dirname,
  '..',
  'packages',
  'entropy',
  'src',
  'data',
  'dict-bloom.ts'
)

// --- Hash functions (MUST match packages/entropy/src/dictionary.ts) ---
// Two genuinely independent hashes (djb2 + FNV-1a). Naive "same hash with two
// different seeds" produces correlated values that break the bloom's k-hash
// independence assumption and inflate the real FP rate ~10× over the predicted.
function djb2Hash(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function fnv1aHash(str) {
  let hash = 2166136261 | 0
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash | 0)
}

function getHashes(str) {
  const h1 = djb2Hash(str)
  const h2 = fnv1aHash(str)
  const hashes = []
  for (let i = 0; i < HASH_COUNT; i++) {
    hashes.push(((h1 + i * h2) >>> 0) % BLOOM_SIZE)
  }
  return hashes
}

// --- Bloom operations ---
function createFilter(entries) {
  const filter = new Int32Array(ARRAY_SIZE)
  for (const entry of entries) {
    for (const h of getHashes(entry)) {
      const arrayIdx = Math.floor(h / BITS_PER_INT32)
      const bitIdx = h % BITS_PER_INT32
      filter[arrayIdx] |= 1 << bitIdx
    }
  }
  return filter
}

function testFilter(filter, entry) {
  for (const h of getHashes(entry)) {
    const arrayIdx = Math.floor(h / BITS_PER_INT32)
    const bitIdx = h % BITS_PER_INT32
    if ((filter[arrayIdx] & (1 << bitIdx)) === 0) return false
  }
  return true
}

function countBits(n) {
  let count = 0
  let v = n
  while (v) {
    count += v & 1
    v >>>= 1
  }
  return count
}

// --- Load + dedup seeds ---
function loadSeeds(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.error(`ERROR: Seed file not found: ${filePath}`)
    process.exit(1)
  }
  const raw = fs.readFileSync(filePath, 'utf-8')
  const seeds = raw
    .split('\n')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length >= MIN_SEED_LEN)
  console.log(`Loaded ${seeds.length} entries (≥ ${MIN_SEED_LEN} chars) from ${label}`)
  return seeds
}

const dictSeeds = loadSeeds(DICT_FILE, 'dictionary.txt')
const passwordSeeds = loadSeeds(PASSWORDS_FILE, 'passwords-extended.txt')
const allEntries = Array.from(new Set([...dictSeeds, ...passwordSeeds]))
console.log(`Total unique entries: ${allEntries.length}`)

// --- Build filter ---
const filter = createFilter(allEntries)

// Verify: every entry must be found (no false negatives).
const notFound = allEntries.filter((e) => !testFilter(filter, e))
if (notFound.length > 0) {
  console.error(`ERROR: ${notFound.length} entries not found in bloom filter (false negatives)`)
  console.error('First 5:', notFound.slice(0, 5))
  process.exit(1)
}
console.log(`Verified: all ${allEntries.length} entries present (no false negatives)`)

// Measure false-positive rate against random 12-char strings.
const testCount = 10_000
let falsePositives = 0
for (let i = 0; i < testCount; i++) {
  const randomStr = crypto.randomBytes(8).toString('hex')
  if (testFilter(filter, randomStr)) falsePositives++
}
const fpRate = ((falsePositives / testCount) * 100).toFixed(2)
console.log(`False-positive rate: ${fpRate}% (${testCount} random strings tested)`)

let setBits = 0
for (let i = 0; i < filter.length; i++) setBits += countBits(filter[i])
const fillRatio = ((setBits / BLOOM_SIZE) * 100).toFixed(1)
console.log(`Fill ratio: ${fillRatio}%`)

// --- Emit generated file ---
// We encode the Int32Array as base64 of its underlying ArrayBuffer. Decimal
// literals were ~85 KB raw source → 48 KB gzipped; base64 is ~42 KB raw →
// ~22 KB gzipped (since random integer data is near-incompressible, the
// gzipped size is bounded by the raw byte count of ~31 KB regardless of
// encoding — base64 reduces source overhead, not data entropy).
const filterBuffer = Buffer.from(filter.buffer, filter.byteOffset, filter.byteLength)
const base64Data = filterBuffer.toString('base64')

const header = `/**
 * Generated by scripts/generate-entropy-bloom.cjs. DO NOT EDIT BY HAND.
 *
 * Entries: ${allEntries.length} (${dictSeeds.length} dict + ${passwordSeeds.length} passwords, deduped)
 * Bloom size: ${BLOOM_SIZE} bits | Hash functions: ${HASH_COUNT}
 * False-positive rate: ${fpRate}% | Fill ratio: ${fillRatio}%
 *
 * Stored as base64 of the underlying Int32Array buffer for compact source
 * representation. Decoded once at module load.
 *
 * Regenerate: pnpm --filter @sentinel-password/entropy generate:dict
 */`

const body = `// \`atob\` is a global in Node 16+ and all modern browsers; declare it ambient
// so this generated file compiles without pulling in DOM or Node typings.
declare const atob: (encoded: string) => string

export const BLOOM_SIZE: number = ${BLOOM_SIZE}
export const BLOOM_HASH_COUNT: number = ${HASH_COUNT}

const BLOOM_DATA_B64: string =
  '${base64Data}'

function decodeBloom(b64: string): Int32Array {
  const bin: string = atob(b64)
  const bytes: Uint8Array = new Uint8Array(bin.length)
  for (let i: number = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i)
  }
  return new Int32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4)
}

export const BLOOM_BUCKETS: Int32Array = decodeBloom(BLOOM_DATA_B64)
`

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true })
fs.writeFileSync(OUTPUT_FILE, header + '\n\n' + body, 'utf-8')
console.log(`\nWritten to: ${OUTPUT_FILE}`)
console.log(`Bloom filter: ${ARRAY_SIZE} × Int32 = ${ARRAY_SIZE * 4} bytes raw`)
console.log(`Base64 source: ${base64Data.length} chars`)
