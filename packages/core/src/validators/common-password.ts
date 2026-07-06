import type { MessageParams, Validator, ValidatorOptions } from '../types'
import { resolveMessage } from '../messages'

/**
 * Bloom filter for common passwords
 *
 * Source: SecLists https://github.com/danielmiessler/SecLists
 *   File: Passwords/Common-Credentials/10k-most-common.txt (top 1,000)
 *   Local: packages/core/data/common-passwords.txt
 *
 * Regenerate with: pnpm --filter @sentinel-password/core generate:bloom
 */

// --- BEGIN GENERATED BLOOM FILTER ---
// Generated from: packages/core/data/common-passwords.txt
// Passwords: 1000 | Bloom size: 12007 bits | Hash functions: 7
const BLOOM_SIZE: number = 12007
const BLOOM_HASH_COUNT: number = 7

// Stryker disable all: the values below are GENERATED data, not logic. Mutating
// individual table entries (e.g. flipping one int's sign) produces equivalent
// mutants — altering a single bucket in a 12,007-bit filter never changes the
// pass/fail outcome for any password. Filter integrity is verified instead by
// the full-wordlist test in tests/validators/common-password.test.ts.
const BLOOM_BUCKETS: Int32Array = new Int32Array([
  -2012638898, 71008688, -1305141724, 672517947, 1101627488, 1011421482, -1100709052, 279773339,
  1955859597, 1778435506, 744306050, 762067841, -1011772334, -447009850, -1662395031, -2065583282,
  -2003762598, 2064173272, 877817254, 1310808067, 1784940646, -1936229830, -1935653577, 1796365168,
  82886363, 635967125, -902609127, 1587900885, -1600996089, 1228388744, -1371181940, -1442702180,
  1392953737, -347259390, 1189407833, 1233492433, 831184950, 1595488723, -913509971, 1960198057,
  -1163656941, -1271451095, 128669153, 23498498, 1080488236, -2134665595, -2047722732, 622222558,
  47998312, -1532954746, -1534655956, 691000976, 1700564748, -836224393, -2069182887, -1001192061,
  71456745, -1477354113, 78815904, -834027358, -1668904696, 14375149, -2125593172, 1208373504,
  454372473, 1707649890, -1567039372, 248013797, 820165464, -378925167, 1212435526, 1978815874,
  1640716321, -800924786, -2048114354, 1452177668, -1240792423, -1968929730, 1419051521, 1513457675,
  -1072649151, 566629130, 1484201479, 206181684, 487855569, 1119236335, -1250474392, -1451653704,
  -164283810, 1358959800, -1037928971, 816235131, -1400486719, -1535917392, 1353471363, 378266665,
  -1119567466, 113578299, -1499308559, -1022713799, 1653360260, 472433040, 42844178, 447771636,
  -917809552, -895840891, 1744622972, -401910852, -2039834124, 1408660465, 1938362617, 54569873,
  -988239474, 208675191, 1321600344, -566009848, 776662592, 1638828556, 207121608, -1203086885,
  431604996, 712073527, -100567420, -1794499911, 1158825526, -1740504629, -1038468721, -1886609863,
  859380392, 671027874, 1011174208, 1486965739, 218348601, -136844868, -1222829813, 1905700467,
  213847232, -1730639507, 1254701449, 1275767816, 1811943979, 2047766685, 1288886377, 43118662,
  875539343, -407123691, 385989510, -62071109, -1465817456, 1454832, 1869677130, 542776189,
  -1910242822, -725941588, -1294458099, 1966821019, -1550398732, -118706803, -426632632, -883325351,
  -467434572, -1564436619, 1149685274, 1223747375, 35285908, -111093748, -2088695656, 1687365769,
  -651940273, 26272266, 1224889674, 394411841, -461220177, -734164393, 1113364141, -489416470,
  -2134771642, 716466752, 135936655, 2088555258, 480924214, 8594746, 820130654, 1290483187,
  -1100033007, 1223164223, 104957455, -1525657460, 1007026882, 926556835, -723336750, -1558564024,
  -1532163958, 2087990674, 83528634, 37884765, 2093842381, 546587438, -1308548308, -2060559536,
  533010945, -774311623, 375645319, 889407024, -183383008, 190933904, -1944218490, -1465466438,
  -233520621, 1364746486, -1274822080, 1561953122, 881074967, 926118073, 902103059, 1921559151,
  222827522, 6307569, 1103201782, 277776202, 543197491, 1672219695, 408571959, -2031562351,
  -648873725, -1817174779, 1633960411, 1146880362, 1317700546, -147384174, -1578979321, 2012223379,
  -1108349516, 1619323612, -1313220446, 271717444, -996325358, 1351413799, 1606301719, 1489283037,
  -2078117857, -2144319145, -800302078, 723142806, 11729168, -1060348315, -993928369, 1527854488,
  -927651216, -722262661, -250457486, -288431148, 1617730778, 183305294, -266100799, 1607927375,
  1383936597, 924078496, 2097338727, -307930913, 575176196, -833063828, 1484086370, -202596256,
  378892446, 679919239, 621889970, 278344341, 848003206, -1760393031, -468679144, 803772646,
  -451789562, 1178805508, -1740773136, 1362224712, -2059870934, 1347938377, 138660712, -523682830,
  1647678589, 2014476714, 1936134047, 1784439225, -502503415, -1908030810, -1901029249, 1813122593,
  1244137994, 671319780, -1861127103, 883697973, 1853230300, -2007407796, 1898784812, -636365030,
  -975960409, 1433498531, -650929448, 1012015178, -1288499062, -1497275478, 614544120, 16714840,
  1957284394, 1926529632, -2123413994, 1089478432, 1159293535, 1044140068, 50053937, -1543303376,
  1239692745, -706632301, 1062264966, 127270053, 6362742, 881549888, -421977966, 941966072,
  1681925138, 1753379477, 147339906, -1634761120, 55686885, -1485029181, -987168307, -910502478,
  550775236, -483630302, 1781669162, -1584753663, -1450197051, 1229869616, 1133583150, -603799820,
  -576598883, -10427188, 1425202360, 1329545236, 429922580, 814128597, 805584197, 760175208,
  1705188178, 1758560472, 2135871116, 1016276648, -1574621705, 1250050835, 1615038400, 1220032602,
  -1665712091, -1623899780, 1427505496, -2144749307, 2040958548, -1693952726, 545557538, 112771436,
  -527558557, 951319428, 1024483586, 712445058, -740783012, 916380058, 203169361, 607043599,
  1882012059, -1995906503, -198554971, 1602377217, 227022858, 1813521602, -536523479, 26,
])
// Stryker restore all
// --- END GENERATED BLOOM FILTER ---

/**
 * djb2-style multiplicative hash (h = h*31 + c), first of the double-hashing
 * pair. Must stay in sync with scripts/generate-bloom-filter.cjs.
 */
function hashDjb2(str: string): number {
  let hash: number = 0
  for (let i: number = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash = hash | 0 // Convert to 32-bit integer
  }
  return hash >>> 0
}

/**
 * FNV-1a hash, second of the double-hashing pair. Structurally different
 * from the multiplicative hash — the previous scheme derived hash2 from the
 * same function with a different seed, but the seed contributes linearly, so
 * hash2 − hash1 was the constant 31^len for every string of a given length
 * and all 7 probes collapsed into a function of hash1 alone (~1.1% FP vs
 * ~0.33% for genuine double hashing).
 */
function hashFnv1a(str: string): number {
  let hash: number = 0x811c9dc5
  for (let i: number = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/**
 * Get multiple hash positions for a password. `BLOOM_SIZE` is prime, so any
 * step in [1, BLOOM_SIZE-1] is coprime with it and the 7 probes never
 * collapse onto a short cycle.
 */
function getHashes(password: string): number[] {
  const hashes: number[] = []
  const hash1: number = hashDjb2(password)
  const hash2: number = (hashFnv1a(password) % (BLOOM_SIZE - 1)) + 1

  for (let i: number = 0; i < BLOOM_HASH_COUNT; i++) {
    // hash1 < 2^32 and i*hash2 < 7*BLOOM_SIZE — exact in double precision.
    hashes.push((hash1 + i * hash2) % BLOOM_SIZE)
  }

  return hashes
}

/**
 * Primary l33t-speak substitutions (lowercase input). Each substitutable
 * character maps to its most common letter reading; `1`/`|` additionally read
 * as `l` (see `L_VARIANT`). Mirrors the table frozen in
 * `@sentinel-password/entropy`'s l33t module, reduced to one candidate per
 * character so the extra Bloom probes stay bounded (each probe adds its own
 * ~0.33% false-positive chance).
 */
const L33T_PRIMARY: Readonly<Record<string, string>> = {
  '@': 'a',
  '4': 'a',
  '8': 'b',
  '(': 'c',
  '{': 'c',
  '[': 'c',
  '<': 'c',
  '3': 'e',
  '6': 'g',
  '9': 'g',
  '1': 'i',
  '!': 'i',
  '|': 'i',
  '0': 'o',
  '5': 's',
  $: 's',
  '7': 't',
  '+': 't',
}

/**
 * Secondary table: identical to {@link L33T_PRIMARY} except the ambiguous
 * `1`/`|` read as `l` (letmein-style) instead of `i`.
 */
const L33T_SECONDARY: Readonly<Record<string, string>> = {
  ...L33T_PRIMARY,
  '1': 'l',
  '|': 'l',
}

/**
 * Replace every substitutable character via the given table; returns the
 * input unchanged (same reference) when nothing was substituted.
 */
function unleet(lower: string, table: Readonly<Record<string, string>>): string {
  let out: string = ''
  let changed: boolean = false
  for (let i: number = 0; i < lower.length; i++) {
    const ch: string = lower.charAt(i)
    const sub: string | undefined = table[ch]
    if (sub === undefined) {
      out += ch
    } else {
      out += sub
      changed = true
    }
  }
  return changed ? out : lower
}

/**
 * Probe one candidate string against the Bloom filter.
 * Note: Bloom filters can have false positives (~0.33% per probe with the
 * repaired double hashing) but never false negatives.
 */
function bloomHas(candidate: string): boolean {
  const hashes: number[] = getHashes(candidate)

  for (const hash of hashes) {
    const arrayIndex: number = Math.floor(hash / 32)
    const bitIndex: number = hash % 32

    // Bounds check for TypeScript strict mode
    const bucket: number | undefined = BLOOM_BUCKETS[arrayIndex]
    if (bucket === undefined || (bucket & (1 << bitIndex)) === 0) {
      return false
    }
  }

  return true
}

/**
 * Check if password might be in the common password list, including its
 * l33t-normalized readings: `P@ssw0rd`, `l3tm3in`, or `m0nkey` are the same
 * password as their plain forms to an attacker running rule-based mutations.
 * At most three probes run — the lowercased raw string, its primary
 * l33t-normalized form, and (when `1`/`|` are present) the `l`-reading —
 * keeping the compounded false-positive ceiling around ~1%.
 */
function mightBeCommon(password: string): boolean {
  const lower: string = password.toLowerCase()
  if (bloomHas(lower)) {
    return true
  }

  const primary: string = unleet(lower, L33T_PRIMARY)
  if (primary === lower) {
    return false // no substitutable characters — nothing more to probe
  }
  if (bloomHas(primary)) {
    return true
  }

  const secondary: string = unleet(lower, L33T_SECONDARY)
  return secondary !== primary && bloomHas(secondary)
}

/**
 * Validates that a password is not in the common password list
 *
 * Uses a Bloom filter to efficiently check against the top 1,000 most common passwords.
 * Case-insensitive matching prevents simple case variations of common passwords.
 *
 * @param password - Password to validate
 * @param options - Validation options containing checkCommonPasswords flag
 * @returns Validator check result with passed status and optional error message
 *
 * @example
 * ```typescript
 * import { validateCommonPassword } from '@sentinel-password/core'
 *
 * // Detects common passwords
 * validateCommonPassword('password')
 * // { passed: false, message: "Password is too common. Please choose a more unique password." }
 *
 * validateCommonPassword('123456')
 * // { passed: false }
 *
 * // Case-insensitive
 * validateCommonPassword('PASSWORD')
 * // { passed: false }
 *
 * // Unique passwords pass
 * validateCommonPassword('MyUn1qu3P@ssw0rd!')
 * // { passed: true }
 *
 * // Disable check
 * validateCommonPassword('password', { checkCommonPasswords: false })
 * // { passed: true }
 * ```
 *
 * @remarks
 * Checks against top 1,000 most common passwords from SecLists — including
 * l33t-speak readings (`P@ssw0rd`, `l3tm3in`, `m0nkey` fail like their plain
 * forms; up to two normalized candidates are probed alongside the raw string).
 * Uses Bloom filter for space efficiency (~1.5KB vs ~8KB for raw array).
 * False positive rate: ~0.33% per probe (≲1% worst case for heavily
 * substituted inputs); may rarely flag uncommon passwords, never misses a
 * listed one. Enabled by default for security.
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
    const params: MessageParams = {}
    return {
      passed: false,
      code: 'commonPassword.found',
      params,
      message: resolveMessage('commonPassword.found', params, options),
    }
  }

  return { passed: true }
}
