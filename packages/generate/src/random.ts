/**
 * Cryptographically secure, unbiased random integers.
 *
 * Unlike the validators in `@sentinel-password/core` (which never throw),
 * generation functions throw on misuse or missing platform crypto: silently
 * degrading a password generator would be a security bug, so misconfiguration
 * fails loudly.
 */

const UINT32_RANGE: number = 0x1_0000_0000 // 2^32

/**
 * Uniform random integer in `[0, maxExclusive)` using rejection sampling over
 * `crypto.getRandomValues` — `u32 % max` alone would bias toward small values
 * whenever 2^32 is not a multiple of `max`, so draws from the biased tail are
 * rejected and redrawn.
 *
 * @throws {RangeError} when `maxExclusive` is not an integer in [1, 2^32]
 * @throws {Error} when `crypto.getRandomValues` is unavailable
 */
export function randomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive < 1 || maxExclusive > UINT32_RANGE) {
    throw new RangeError(
      `randomInt: maxExclusive must be an integer in [1, 2^32], got ${String(maxExclusive)}`
    )
  }
  if (maxExclusive === 1) {
    return 0
  }

  const cryptoObj: Crypto | undefined = globalThis.crypto
  if (typeof cryptoObj?.getRandomValues !== 'function') {
    throw new Error('randomInt: crypto.getRandomValues is unavailable in this environment')
  }

  // Largest multiple of maxExclusive that fits in 32 bits; draws at or above
  // it come from the incomplete "tail" bucket and would bias the modulo.
  const limit: number = UINT32_RANGE - (UINT32_RANGE % maxExclusive)
  const buffer: Uint32Array<ArrayBuffer> = new Uint32Array(1)

  // Rejection probability is (2^32 % max) / 2^32 < max/2^32 — for any charset
  // or wordlist size this is far below 1e-5, so the loop terminates after one
  // draw in practice.
  for (;;) {
    cryptoObj.getRandomValues(buffer)
    const value: number = buffer[0] as number
    if (value < limit) {
      return value % maxExclusive
    }
  }
}
