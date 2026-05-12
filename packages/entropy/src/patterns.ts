/**
 * Pattern detectors for entropy reduction.
 *
 * Each function returns a *match length* — the number of characters starting at
 * `start` that form the pattern. A return of 0 means "no pattern here long
 * enough to count." The dispatching policy lives in {@link ./estimate}.
 */

const KEYBOARD_ROWS: readonly string[] = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890']

/** Minimum length below which we don't bother reporting a sequence. */
const MIN_SEQUENCE_LEN: number = 4
/** Minimum length below which we don't bother reporting a repetition. */
const MIN_REPETITION_LEN: number = 3

/**
 * Returns the length of the longest sequence starting at `start`, or 0 if the
 * run is shorter than {@link MIN_SEQUENCE_LEN}.
 *
 * Recognised sequence kinds:
 *   - Alphabetic ascending (`abcd`, `ABCD`) or descending (`dcba`, `DCBA`) by code-point.
 *   - Keyboard rows (`qwerty`, `asdf`, `1234`) on a US QWERTY layout, case-insensitive.
 */
export function sequenceRunLength(password: string, start: number): number {
  if (start >= password.length) return 0

  let best: number = 1

  const ascRun: number = codepointRun(password, start, 1)
  if (ascRun > best) best = ascRun

  const descRun: number = codepointRun(password, start, -1)
  if (descRun > best) best = descRun

  for (const row of KEYBOARD_ROWS) {
    const run: number = keyboardRowRun(password, start, row)
    if (run > best) best = run
  }

  return best >= MIN_SEQUENCE_LEN ? best : 0
}

function codepointRun(password: string, start: number, delta: 1 | -1): number {
  let run: number = 1
  for (let i: number = start + 1; i < password.length; i++) {
    if (password.charCodeAt(i) !== password.charCodeAt(i - 1) + delta) break
    run++
  }
  return run
}

function keyboardRowRun(password: string, start: number, row: string): number {
  const startCh: string = password.charAt(start).toLowerCase()
  const idx: number = row.indexOf(startCh)
  if (idx === -1) return 1
  let run: number = 1
  for (let i: number = 1; start + i < password.length && idx + i < row.length; i++) {
    if (password.charAt(start + i).toLowerCase() !== row.charAt(idx + i)) break
    run++
  }
  return run
}

/**
 * Returns the length of the longest run of the same character starting at
 * `start`, or 0 if shorter than {@link MIN_REPETITION_LEN}.
 *
 * @example
 *   repetitionRunLength('aaab', 0) === 3
 *   repetitionRunLength('aab', 0)  === 0  // below threshold
 */
export function repetitionRunLength(password: string, start: number): number {
  if (start >= password.length) return 0
  const ch: string = password.charAt(start)
  let run: number = 1
  for (let i: number = start + 1; i < password.length; i++) {
    if (password.charAt(i) !== ch) break
    run++
  }
  return run >= MIN_REPETITION_LEN ? run : 0
}

/**
 * Returns true iff `word` looks like an initial-capitalized dictionary word:
 * a single uppercase letter at position 0, followed by at least one lowercase
 * letter, with no other uppercase letters anywhere.
 *
 * @example
 *   hasInitialCapitalization('Password') === true
 *   hasInitialCapitalization('PASSWORD') === false
 *   hasInitialCapitalization('passwOrd') === false
 *   hasInitialCapitalization('A')        === false  // too short
 */
export function hasInitialCapitalization(word: string): boolean {
  if (word.length < 2) return false
  const first: number = word.charCodeAt(0)
  if (first < 65 || first > 90) return false
  let sawLower: boolean = false
  for (let i: number = 1; i < word.length; i++) {
    const c: number = word.charCodeAt(i)
    if (c >= 65 && c <= 90) return false
    if (c >= 97 && c <= 122) sawLower = true
  }
  return sawLower
}
