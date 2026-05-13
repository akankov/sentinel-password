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
 * Returns the length (in characters) of the longest *token-level* repetition
 * starting at `start`, or 0 if shorter than {@link MIN_REPETITION_LEN}.
 *
 * Detects both single-character runs (`aaaa`) and multi-character cycles
 * (`abab`, `abcabc`, `xyxyxy`). Iterates token lengths from 1 upward and
 * keeps the longest total match — for `aaaa` the single-char interpretation
 * wins; for `abab` the two-char interpretation wins.
 *
 * @example
 *   repetitionRunLength('aaab', 0)   === 3   // 'a' × 3
 *   repetitionRunLength('abab', 0)   === 4   // 'ab' × 2
 *   repetitionRunLength('abcabc', 0) === 6   // 'abc' × 2
 *   repetitionRunLength('aab', 0)    === 0   // 'a' × 2 → below threshold
 */
export function repetitionRunLength(password: string, start: number): number {
  if (start >= password.length) return 0
  const remaining: number = password.length - start
  let bestRun: number = 0

  // Try token lengths 1 .. floor(remaining / 2). Longer tokens can't possibly
  // produce two copies fitting in the remaining range.
  for (let tokenLen: number = 1; tokenLen * 2 <= remaining; tokenLen++) {
    const token: string = password.substring(start, start + tokenLen)
    let copies: number = 1
    let pos: number = start + tokenLen
    while (pos + tokenLen <= password.length && password.substring(pos, pos + tokenLen) === token) {
      copies++
      pos += tokenLen
    }
    const total: number = copies * tokenLen
    if (copies >= 2 && total >= MIN_REPETITION_LEN && total > bestRun) {
      bestRun = total
    }
  }

  return bestRun
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
