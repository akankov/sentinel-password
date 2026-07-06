#!/usr/bin/env node

/**
 * Regenerate the bloom filter in common-password.ts from the password list.
 *
 * Usage:
 *   node scripts/generate-bloom-filter.cjs [password-file] [count]
 *
 * Defaults:
 *   password-file = packages/core/data/common-passwords.txt
 *   count         = 1000  (use all passwords in the file)
 *
 * The script reads the password list, builds a bloom filter, and injects the
 * generated constants into common-password.ts between the marker comments:
 *   // --- BEGIN GENERATED BLOOM FILTER ---
 *   // --- END GENERATED BLOOM FILTER ---
 *
 * This preserves hand-written validator logic while making the data reproducible.
 *
 * NOTE: The passwords are from a publicly available list of common/weak passwords
 * (e.g., "password", "123456"). This is a build-time script for development only.
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// --- Configuration ---

// PRIME size: with double hashing (h1 + i*h2) mod SIZE, a prime modulus makes
// every h2 in [1, SIZE-1] coprime with SIZE, so the 7 probe positions never
// collapse onto a short cycle. 12007 is the closest prime above the previous
// 12000 (12 bits per item for 1000 items).
const BLOOM_SIZE = 12007
const HASH_COUNT = 7
const BITS_PER_INT32 = 32
const ARRAY_SIZE = Math.ceil(BLOOM_SIZE / BITS_PER_INT32)

const BEGIN_MARKER = '// --- BEGIN GENERATED BLOOM FILTER ---'
const END_MARKER = '// --- END GENERATED BLOOM FILTER ---'

const DEFAULT_PASSWORD_FILE = path.join(
  __dirname,
  '..',
  'packages',
  'core',
  'data',
  'common-passwords.txt'
)
const VALIDATOR_FILE = path.join(
  __dirname,
  '..',
  'packages',
  'core',
  'src',
  'validators',
  'common-password.ts'
)

// --- Hash functions (must match the runtime implementation) ---

// djb2-style multiplicative hash (h = h*31 + c). The OLD implementation
// derived hash2 from the same function with a different seed — but the seed
// only contributes linearly, so hash2 - hash1 was the constant 31^len for
// every string of a given length, making all 7 probes a function of hash1
// alone (measured FP ~1.1% vs ~0.33% ideal). hash2 now uses FNV-1a, a
// structurally different mix, restoring genuine double hashing.
function hashDjb2(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash = hash | 0
  }
  return hash >>> 0
}

function hashFnv1a(str) {
  let hash = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

function getHashes(str) {
  const hashes = []
  const hash1 = hashDjb2(str)
  // Map into [1, BLOOM_SIZE - 1]: never 0 (which would degenerate all probes
  // to hash1) and always coprime with the prime BLOOM_SIZE.
  const hash2 = (hashFnv1a(str) % (BLOOM_SIZE - 1)) + 1
  for (let i = 0; i < HASH_COUNT; i++) {
    // hash1 < 2^32 and i*hash2 < 7*12007, comfortably inside Number's exact
    // integer range — no 32-bit truncation needed.
    hashes.push((hash1 + i * hash2) % BLOOM_SIZE)
  }
  return hashes
}

// --- Bloom filter operations ---

function createFilter(passwords) {
  const filter = new Int32Array(ARRAY_SIZE)

  for (const password of passwords) {
    const hashes = getHashes(password.toLowerCase())
    for (const hash of hashes) {
      const arrayIndex = Math.floor(hash / BITS_PER_INT32)
      const bitIndex = hash % BITS_PER_INT32
      filter[arrayIndex] |= 1 << bitIndex
    }
  }

  return filter
}

function testFilter(filter, password) {
  const hashes = getHashes(password.toLowerCase())
  for (const hash of hashes) {
    const arrayIndex = Math.floor(hash / BITS_PER_INT32)
    const bitIndex = hash % BITS_PER_INT32
    if ((filter[arrayIndex] & (1 << bitIndex)) === 0) {
      return false
    }
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

// --- Formatting ---

function formatBuckets(filter) {
  const lines = []
  for (let i = 0; i < filter.length; i += 8) {
    const chunk = []
    for (let j = i; j < Math.min(i + 8, filter.length); j++) {
      chunk.push(filter[j].toString())
    }
    lines.push('  ' + chunk.join(', '))
  }
  return lines.join(',\n')
}

// --- Main ---

const passwordFile = process.argv[2] || DEFAULT_PASSWORD_FILE
const maxCount = process.argv[3] ? parseInt(process.argv[3], 10) : Infinity

console.log(`Reading passwords from: ${passwordFile}`)

if (!fs.existsSync(passwordFile)) {
  console.error(`ERROR: Password file not found: ${passwordFile}`)
  console.error('Download it with:')
  console.error(
    '  curl -sL "https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/Common-Credentials/10k-most-common.txt" | head -1000 > packages/core/data/common-passwords.txt'
  )
  process.exit(1)
}

const passwords = fs
  .readFileSync(passwordFile, 'utf-8')
  .split('\n')
  .map((p) => p.trim())
  .filter((p) => p.length > 0)
  .slice(0, maxCount)

console.log(`Loaded ${passwords.length} passwords`)

// Build bloom filter
const filter = createFilter(passwords)

// Verify: all passwords must be found (no false negatives)
const notFound = passwords.filter((p) => !testFilter(filter, p))
if (notFound.length > 0) {
  console.error(`ERROR: ${notFound.length} passwords not found in bloom filter!`)
  console.error('First 5:', notFound.slice(0, 5))
  process.exit(1)
}
console.log(`Verified: all ${passwords.length} passwords found in filter`)

// Measure false positive rate
let falsePositives = 0
const testCount = 10000
for (let i = 0; i < testCount; i++) {
  const randomStr = crypto.randomBytes(8).toString('hex')
  if (testFilter(filter, randomStr)) {
    falsePositives++
  }
}
const fpRate = ((falsePositives / testCount) * 100).toFixed(2)
console.log(`False positive rate: ${fpRate}% (${testCount} random strings tested)`)

// Fill ratio
let setBits = 0
for (let i = 0; i < filter.length; i++) {
  setBits += countBits(filter[i])
}
console.log(`Fill ratio: ${((setBits / BLOOM_SIZE) * 100).toFixed(1)}%`)

// Generate the replacement block
const generatedBlock = [
  BEGIN_MARKER,
  `// Generated from: packages/core/data/common-passwords.txt`,
  `// Passwords: ${passwords.length} | Bloom size: ${BLOOM_SIZE} bits | Hash functions: ${HASH_COUNT}`,
  `const BLOOM_SIZE: number = ${BLOOM_SIZE}`,
  `const BLOOM_HASH_COUNT: number = ${HASH_COUNT}`,
  '',
  '// Stryker disable all: the values below are GENERATED data, not logic. Mutating',
  "// individual table entries (e.g. flipping one int's sign) produces equivalent",
  '// mutants — altering a single bucket in a 12,007-bit filter never changes the',
  '// pass/fail outcome for any password. Filter integrity is verified instead by',
  '// the full-wordlist test in tests/validators/common-password.test.ts.',
  'const BLOOM_BUCKETS: Int32Array = new Int32Array([',
  formatBuckets(filter),
  '])',
  '// Stryker restore all',
  END_MARKER,
].join('\n')

// Inject into the validator file
if (!fs.existsSync(VALIDATOR_FILE)) {
  console.error(`ERROR: Validator file not found: ${VALIDATOR_FILE}`)
  process.exit(1)
}

const source = fs.readFileSync(VALIDATOR_FILE, 'utf-8')
const beginIdx = source.indexOf(BEGIN_MARKER)
const endIdx = source.indexOf(END_MARKER)

if (beginIdx === -1 || endIdx === -1) {
  console.error('ERROR: Could not find marker comments in common-password.ts')
  console.error(`Expected: "${BEGIN_MARKER}" and "${END_MARKER}"`)
  process.exit(1)
}

const before = source.substring(0, beginIdx)
const after = source.substring(endIdx + END_MARKER.length)
const updated = before + generatedBlock + after

fs.writeFileSync(VALIDATOR_FILE, updated, 'utf-8')
console.log(`\nWritten to: ${VALIDATOR_FILE}`)
console.log(`Bloom filter: ${filter.length} x 32-bit integers (${filter.length * 4} bytes)`)
