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

const BLOOM_SIZE = 12000 // 12 bits per item for 1000 items
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

function hashString(str, seed) {
  let hash = seed
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash | 0
  }
  return Math.abs(hash)
}

function getHashes(str) {
  const hashes = []
  const hash1 = hashString(str, 0)
  const hash2 = hashString(str, 1)
  for (let i = 0; i < HASH_COUNT; i++) {
    const hash = (hash1 + i * hash2) >>> 0
    hashes.push(hash % BLOOM_SIZE)
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
  'const BLOOM_BUCKETS: Int32Array = new Int32Array([',
  formatBuckets(filter),
  '])',
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
