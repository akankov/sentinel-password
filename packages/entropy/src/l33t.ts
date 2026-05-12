/**
 * L33t-speak substitution table and candidate enumeration.
 *
 * Frozen for v0.1.0 — additions are public API and require a minor bump.
 */

const SUBSTITUTIONS: Readonly<Record<string, readonly string[]>> = {
  '@': ['a'],
  '4': ['a'],
  '8': ['b'],
  '(': ['c'],
  '{': ['c'],
  '[': ['c'],
  '<': ['c'],
  '3': ['e'],
  '6': ['g'],
  '9': ['g'],
  '1': ['i', 'l'],
  '!': ['i'],
  '|': ['i', 'l'],
  '0': ['o'],
  '5': ['s'],
  $: ['s'],
  '7': ['t'],
  '+': ['t'],
}

/** Hard cap on candidate enumeration to prevent combinatorial blow-up on inputs like `'@@@@@@@@'`. */
export const MAX_CANDIDATES: number = 32

/** Returns true iff `ch` has at least one l33t substitution mapping. */
export function isLeetChar(ch: string): boolean {
  return SUBSTITUTIONS[ch] !== undefined
}

/** Counts the substitutable characters in `input`. */
export function leetCount(input: string): number {
  let count: number = 0
  for (let i: number = 0; i < input.length; i++) {
    const ch: string = input.charAt(i)
    if (SUBSTITUTIONS[ch] !== undefined) count++
  }
  return count
}

/**
 * Enumerates `input` with each l33t character replaced by its possible
 * substitutions (plus the original character kept as one alternative).
 *
 * Order: substitutions before the original, so dictionary-friendly forms are
 * surfaced earliest. Capped at {@link MAX_CANDIDATES} variants.
 *
 * @example
 *   unleetCandidates('p@ss') // → ['pass', 'p@ss']
 *   unleetCandidates('1')    // → ['i', 'l', '1']
 */
export function unleetCandidates(input: string): readonly string[] {
  let candidates: string[] = ['']

  for (let i: number = 0; i < input.length; i++) {
    const ch: string = input.charAt(i)
    const subs: readonly string[] | undefined = SUBSTITUTIONS[ch]
    const next: string[] = []

    if (subs !== undefined) {
      outer: for (const c of candidates) {
        for (const s of subs) {
          next.push(c + s)
          if (next.length >= MAX_CANDIDATES) break outer
        }
      }
      if (next.length < MAX_CANDIDATES) {
        for (const c of candidates) {
          next.push(c + ch)
          if (next.length >= MAX_CANDIDATES) break
        }
      }
    } else {
      for (const c of candidates) {
        next.push(c + ch)
        if (next.length >= MAX_CANDIDATES) break
      }
    }

    candidates = next
  }

  return candidates
}
