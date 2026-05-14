import type { MessageParams, ValidatorCheck, ValidatorOptions } from '../types'
import { resolveMessage } from '../messages'

/**
 * Common keyboard patterns to detect across multiple layouts
 * Supports: QWERTY, AZERTY, QWERTZ, Dvorak, Colemak, and Cyrillic
 */
const KEYBOARD_PATTERNS: readonly string[] = [
  // === QWERTY (English, US, UK) ===
  // Full rows
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
  // Common typing patterns (adjacent keys)
  'qwert',
  'werty',
  'asdfg',
  'sdfgh',
  'zxcvb',
  'xcvbn',
  // Short sequences (3+ chars)
  'qwe',
  'asd',
  'zxc',
  'rty',
  'fgh',
  'cvb',
  'poi',
  'lkj',
  'mnb',
  // Columns (top to bottom)
  '1qaz',
  '2wsx',
  '3edc',
  '4rfv',
  '5tgb',
  '6yhn',
  '7ujm',
  '8ik',
  '9ol',
  '0p',
  // Diagonals
  'qaz',
  'wsx',
  'edc',
  'zaq',
  'xsw',
  'cde',

  // === AZERTY (French, Belgian) ===
  // Full rows
  'azertyuiop',
  'qsdfghjklm',
  'wxcvbn',
  // Common patterns
  'azert',
  'zerty',
  'qsdfg',
  'sdfgh',
  'wxcvb',
  // Short sequences
  'aze',
  'qsd',
  'wxc',

  // === QWERTZ (German, Central European) ===
  // Full rows
  'qwertzuiop',
  'yxcvbnm',
  // Common patterns
  'qwertz',
  'yxcvb',
  // Short sequences
  'yxc',
  // Note: Patterns 'qwe', 'asd', 'asdfg', and 'asdfghjkl' are shared with QWERTY and listed above for efficiency.

  // === Dvorak ===
  // Full rows
  'pyfgcrl',
  'aoeuidhtns',
  'qjkxbmwvz',
  // Common patterns
  'aoeu',
  'htns',
  'qjkx',

  // === Colemak ===
  // Full rows
  'qwfpgjluy',
  'arstdhneio',
  'zxcvbkm',
  // Common patterns
  'arst',
  'dhne',
  'zxcv',

  // === Cyrillic (ЙЦУКЕН - Russian) ===
  // Full rows (Cyrillic characters)
  'йцукенгшщзхъ',
  'фывапролджэ',
  'ячсмитьбю',
  // Common patterns
  'йцукен',
  'фывап',
  'ячсми',
  'цукен',

  // === Numeric patterns (universal) ===
  // Number row
  '1234567890',
  '0987654321',
  // Numeric keypad (rows)
  '789',
  '456',
  '123',
  // Numeric keypad (columns)
  '741',
  '852',
  '963',
  '7410',
  '8520',
  '9630',
] as const

/**
 * Escape regex metacharacters in a string so it matches literally.
 * Defensive: none of the current patterns contain metacharacters, but this
 * keeps future additions safe (e.g., if a layout's pattern contains `+` or `$`).
 */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Single regex matching ANY keyboard pattern in either forward or reverse
 * direction, case-insensitively. Built once at module load.
 *
 * Performance note: this replaced an earlier implementation that ran a
 * `for` loop over `KEYBOARD_PATTERNS`, calling `pattern.split('').reverse().join('')`
 * to build the reverse string AND `lowercase.includes(pattern)` on every iteration
 * (~480 allocations per call). A single regex test against an NFA-compiled
 * alternation is ~12× faster on typical passwords on V8/Node 22.
 *
 * If a future V8 regex bug surfaces (e.g., a Unicode case-folding regression
 * affecting Cyrillic with the `/i` flag), there's a side-by-side comparison
 * against a precomputed-array loop variant in
 * `packages/core/tests/performance.bench.ts` → `Keyboard pattern: implementation comparison`.
 * The loop variant is ~2.5× faster than the original split/reverse/join code
 * and ~5× slower than the regex, so it's a usable rollback target.
 */
const KEYBOARD_REGEX: RegExp = new RegExp(
  KEYBOARD_PATTERNS.flatMap((p: string): readonly string[] => {
    const reversed: string = p.split('').reverse().join('')
    return [escapeRegex(p), escapeRegex(reversed)]
  }).join('|'),
  'i'
)

/**
 * Validates that password does not contain common keyboard patterns
 *
 * Detects patterns across multiple keyboard layouts:
 * - QWERTY (English, US, UK): qwerty, asdfgh, 1qaz2wsx
 * - AZERTY (French, Belgian): azerty, qsdfg
 * - QWERTZ (German, Central European): qwertz, yxcvb
 * - Dvorak (Alternative English): aoeu, htns
 * - Colemak (Alternative English): arst, dhne
 * - Cyrillic (Russian ЙЦУКЕН): йцукен, фывап
 * - Universal numeric: 123, 789, numeric keypad patterns
 * - Both forward and reverse patterns
 *
 * @param password - The password to validate
 * @param options - Validation options
 * @returns Validation result
 *
 * @example
 * ```typescript
 * validateKeyboardPattern('qwerty123') // { passed: false, message: '...' }
 * validateKeyboardPattern('azerty456') // { passed: false, message: '...' } (AZERTY)
 * validateKeyboardPattern('йцукен') // { passed: false, message: '...' } (Cyrillic)
 * validateKeyboardPattern('MyP@ssw0rd') // { passed: true }
 * validateKeyboardPattern('asdfgh', { checkKeyboardPatterns: false }) // { passed: true }
 * ```
 *
 * @remarks
 * **Overlap with `validateSequential`:** The numeric-keypad rows `123`,
 * `456`, `789` (and their reverses) are also caught by the sequential
 * validator's `charCodeAt`-consecutive check. To allow simple numeric
 * runs in a password you must set BOTH `checkKeyboardPatterns: false`
 * AND `checkSequential: false` — disabling either alone will not let
 * `password123` through. The two checks are deliberately independent
 * defences (keyboard-locality runs vs. code-point runs).
 */
export function validateKeyboardPattern(
  password: string,
  options: ValidatorOptions = {}
): ValidatorCheck {
  const { checkKeyboardPatterns = true }: Partial<{ checkKeyboardPatterns: boolean }> = options

  if (!checkKeyboardPatterns) {
    return { passed: true }
  }

  if (KEYBOARD_REGEX.test(password)) {
    const emptyParams: MessageParams = {}
    return {
      passed: false,
      code: 'keyboardPattern.found',
      params: emptyParams,
      message: resolveMessage('keyboardPattern.found', emptyParams, options),
    }
  }

  return { passed: true }
}
