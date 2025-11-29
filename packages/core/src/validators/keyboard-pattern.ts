import type { ValidatorCheck, ValidatorOptions } from '../types.js'

/**
 * Common keyboard patterns to detect across multiple layouts
 * Supports: QWERTY, AZERTY, QWERTZ, Dvorak, Colemak, and Cyrillic
 */
const KEYBOARD_PATTERNS = [
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
  'asdfghjkl',
  'yxcvbnm',
  // Common patterns
  'qwertz',
  'asdfg',
  'yxcvb',
  // Short sequences
  'qwe',
  'asd',
  'yxc',

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
  'ываа',

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
 */
export function validateKeyboardPattern(
  password: string,
  options: ValidatorOptions = {}
): ValidatorCheck {
  const { checkKeyboardPatterns = true } = options

  if (!checkKeyboardPatterns) {
    return { passed: true }
  }

  const lowercase = password.toLowerCase()

  // Check for keyboard patterns (forward and reverse)
  for (const pattern of KEYBOARD_PATTERNS) {
    // Check forward pattern
    if (lowercase.includes(pattern)) {
      return {
        passed: false,
        message: 'Password contains common keyboard patterns',
      }
    }

    // Check reverse pattern
    const reversed = pattern.split('').reverse().join('')
    if (lowercase.includes(reversed)) {
      return {
        passed: false,
        message: 'Password contains common keyboard patterns',
      }
    }
  }

  return { passed: true }
}
