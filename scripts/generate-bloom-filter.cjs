#!/usr/bin/env node

/**
 * Generate a Bloom filter for the top 1000 common passwords
 *
 * This script reads a password list and generates a compact Bloom filter
 * for space-efficient storage in the validator.
 *
 * NOTE: The passwords processed by this script are from a publicly available
 * list of common passwords (e.g., "password", "123456"). These are NOT user
 * passwords but well-known weak passwords used for validation purposes.
 * This is a build-time script that only runs during development.
 */

const fs = require('fs')
const crypto = require('crypto')

// Bloom filter configuration
const BLOOM_SIZE = 12000 // Size for 1000 items (12 bits per item)
const HASH_COUNT = 7 // Number of hash functions
const BITS_PER_INT32 = 32
const ARRAY_SIZE = Math.ceil(BLOOM_SIZE / BITS_PER_INT32)

// Initialize bloom filter
const bloomFilter = new Int32Array(ARRAY_SIZE)

/**
 * Generate multiple hash values for a string
 */
function getHashes(str, count, size) {
  const hashes = []

  // Use two independent hash functions to generate additional hashes
  const hash1 = hashString(str, 0)
  const hash2 = hashString(str, 1)

  for (let i = 0; i < count; i++) {
    // Double hashing technique: hash_i = hash1 + i * hash2
    const hash = (hash1 + i * hash2) >>> 0
    hashes.push(hash % size)
  }

  return hashes
}

/**
 * Hash a string using a simple but effective hash function
 */
function hashString(str, seed = 0) {
  let hash = seed

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash | 0 // Convert to 32-bit integer
  }

  return Math.abs(hash)
}

/**
 * Add a string to the bloom filter
 */
function add(str) {
  const hashes = getHashes(str.toLowerCase(), HASH_COUNT, BLOOM_SIZE)

  for (const hash of hashes) {
    const arrayIndex = Math.floor(hash / BITS_PER_INT32)
    const bitIndex = hash % BITS_PER_INT32
    bloomFilter[arrayIndex] |= 1 << bitIndex
  }
}

/**
 * Test if a string might be in the bloom filter
 */
function test(str) {
  const hashes = getHashes(str.toLowerCase(), HASH_COUNT, BLOOM_SIZE)

  for (const hash of hashes) {
    const arrayIndex = Math.floor(hash / BITS_PER_INT32)
    const bitIndex = hash % BITS_PER_INT32

    if ((bloomFilter[arrayIndex] & (1 << bitIndex)) === 0) {
      return false
    }
  }

  return true
}

// Main execution
const passwordFile = process.argv[2] || '/tmp/top-1000-passwords.txt'
const outputFile = process.argv[3] || '/tmp/bloom-filter-output.ts'

console.log(`Reading passwords from: ${passwordFile}`)

// Read and process password list
const passwords = fs
  .readFileSync(passwordFile, 'utf-8')
  .split('\n')
  .map((p) => p.trim())
  .filter((p) => p.length > 0)

const passwordCount = passwords.length
console.log(`Loaded ${passwordCount} common passwords from public list`)

// Add all passwords to bloom filter
for (const password of passwords) {
  add(password)
}

console.log('Bloom filter generated')

// Test false positive rate
let falsePositives = 0
const testCount = 10000
for (let i = 0; i < testCount; i++) {
  const randomStr = crypto.randomBytes(8).toString('hex')
  if (test(randomStr) && !passwords.includes(randomStr)) {
    falsePositives++
  }
}

const fpRate = ((falsePositives / testCount) * 100).toFixed(2)
console.log(`False positive rate: ${fpRate}% (tested ${testCount} random strings)`)

// Calculate fill ratio
let setBits = 0
for (let i = 0; i < bloomFilter.length; i++) {
  setBits += countBits(bloomFilter[i])
}
const fillRatio = ((setBits / BLOOM_SIZE) * 100).toFixed(2)
console.log(`Bloom filter fill ratio: ${fillRatio}%`)

// Verify all passwords can be found
let notFound = []
for (const password of passwords) {
  if (!test(password)) {
    notFound.push(password)
  }
}

if (notFound.length > 0) {
  console.error(`ERROR: ${notFound.length} passwords not found in bloom filter!`)
  console.error('Count of missing entries:', notFound.length)
  process.exit(1)
}

console.log('✅ All passwords verified in bloom filter')

// Generate TypeScript output
const output = `import type { Validator, ValidatorOptions } from '../types'

/**
 * Bloom filter for top 1,000 common passwords
 * Sourced from SecLists: https://github.com/danielmiessler/SecLists
 * File: Passwords/Common-Credentials/10k-most-common.txt (top 1000)
 *
 * Uses a Bloom filter for space-efficient storage (~1.5KB vs ~8KB for array)
 * False positive rate: ~${fpRate}%
 */

// Bloom filter parameters
const BLOOM_SIZE: number = ${BLOOM_SIZE}
const BLOOM_HASH_COUNT: number = ${HASH_COUNT}

// Pre-computed bloom filter buckets (${bloomFilter.length} x 32-bit integers)
const BLOOM_BUCKETS: Int32Array = new Int32Array([
  ${formatArray(bloomFilter)}
])

/**
 * Hash function for bloom filter
 */
function hashString(str: string, seed: number): number {
  let hash = seed

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash | 0 // Convert to 32-bit integer
  }

  return Math.abs(hash)
}

/**
 * Get multiple hash positions for a password
 */
function getHashes(password: string): number[] {
  const hashes: number[] = []
  const hash1 = hashString(password, 0)
  const hash2 = hashString(password, 1)

  for (let i = 0; i < BLOOM_HASH_COUNT; i++) {
    const hash = (hash1 + i * hash2) >>> 0
    hashes.push(hash % BLOOM_SIZE)
  }

  return hashes
}

/**
 * Check if password might be in the common password list
 * Note: Bloom filters can have false positives (~${fpRate}%) but never false negatives
 */
function mightBeCommon(password: string): boolean {
  const hashes = getHashes(password.toLowerCase())

  for (const hash of hashes) {
    const arrayIndex = Math.floor(hash / 32)
    const bitIndex = hash % 32

    // Bounds check for TypeScript strict mode
    const bucket = BLOOM_BUCKETS[arrayIndex]
    if (bucket === undefined || (bucket & (1 << bitIndex)) === 0) {
      return false
    }
  }

  return true
}

/**
 * Validates that a password is not in the common password list
 */
export const validateCommonPassword: Validator = (
  password: string,
  options: ValidatorOptions = {}
) => {
  const { checkCommonPasswords = true }: { checkCommonPasswords?: boolean } = options

  if (!checkCommonPasswords || password.length === 0) {
    return { passed: true }
  }

  // Case-insensitive check using bloom filter
  if (mightBeCommon(password)) {
    return {
      passed: false,
      message: 'Password is too common. Please choose a more unique password.',
    }
  }

  return { passed: true }
}
`

fs.writeFileSync(outputFile, output, 'utf-8')
console.log(`\n✅ Bloom filter written to: ${outputFile}`)
console.log(`Size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`)

// Helper function to count set bits in a 32-bit integer
function countBits(n) {
  let count = 0
  while (n) {
    count += n & 1
    n >>>= 1
  }
  return count
}

// Helper function to format array for TypeScript
function formatArray(arr) {
  const chunks = []
  for (let i = 0; i < arr.length; i += 8) {
    const chunk = []
    for (let j = i; j < Math.min(i + 8, arr.length); j++) {
      chunk.push(arr[j].toString())
    }
    chunks.push('  ' + chunk.join(', '))
  }
  return chunks.join(',\n')
}
