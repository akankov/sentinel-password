import type { Validator } from '../types'

/**
 * Top 100 most common passwords
 * Sourced from commonly breached password databases
 * Kept minimal to maintain small bundle size
 */
const COMMON_PASSWORDS: Set<string> = new Set<string>([
  // Top 20 most common
  'password',
  '123456',
  '123456789',
  '12345678',
  '12345',
  '1234567',
  'password1',
  '123123',
  '1234567890',
  'qwerty',
  'abc123',
  'Password',
  'qwerty123',
  '1q2w3e4r',
  'admin',
  'letmein',
  'welcome',
  'monkey',
  'dragon',
  '1234',
  // Common variations
  'password123',
  'qwerty1',
  'password!',
  'P@ssw0rd',
  'passw0rd',
  '123qwe',
  'qwertyuiop',
  '1qaz2wsx',
  'iloveyou',
  'welcome1',
  'hello',
  'login',
  'princess',
  'solo',
  'sunshine',
  'master',
  'shadow',
  'ashley',
  'football',
  'jesus',
  'ninja',
  'mustang',
  'access',
  'trustno1',
  'superman',
  'batman',
  'michael',
  'jordan',
  'harley',
  'ranger',
  '111111',
  '000000',
  'zxcvbnm',
  'asdfgh',
  'killer',
  'charlie',
  'donald',
  'assword',
  'fuckyou',
  'starwars',
  'hockey',
  'internet',
  'computer',
  'thomas',
  'maggie',
  'bailey',
  'jessica',
  'chelsea',
  'forever',
  'cookie',
  'summer',
  'buster',
  'hunter',
  'tigger',
  'secret',
  'silver',
  'diamond',
  'yankees',
  'cowboys',
  'purple',
  'orange',
  'banana',
  'driver',
  'pepper',
  'hunter2',
  'freedom',
  'whatever',
  'matrix',
  'guitar',
  'jackson',
  'daniel',
  'jennifer',
  'cheese',
  'coffee',
  'chicken',
  'winter',
  'summer1',
  'spring',
])

/**
 * Validates that password is not in the common password list
 *
 * Uses a Set for O(1) lookup performance
 * Case-insensitive comparison
 *
 * @param password - Password to validate
 * @param options - Validation options containing checkCommonPasswords flag
 * @returns Validator check result
 */
export const validateCommonPassword: Validator = (password, options = {}) => {
  const { checkCommonPasswords = true }: Partial<{ checkCommonPasswords: boolean }> = options

  if (!checkCommonPasswords || password.length === 0) {
    return { passed: true }
  }

  // Case-insensitive check
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return {
      passed: false,
      message: 'Password is too common and easily guessable',
    }
  }

  return {
    passed: true,
  }
}
