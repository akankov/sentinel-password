---
'@sentinel-password/core': patch
---

Document the deliberate overlap between `validateSequential` and
`validateKeyboardPattern` in their JSDoc.

The numeric runs `123`, `456`, `789` (and their reverses `321`, `654`,
`987`) are matched by *both* validators — Sequential catches them as
`charCodeAt`-consecutive triples, Keyboard Pattern catches them as
numeric-keypad substrings (`KEYBOARD_PATTERNS` contains literal `'123'`,
`'456'`, `'789'`). The two validators are intentionally independent
defences, but the overlap can be surprising when a consumer sets
`checkSequential: false` expecting `password123` to pass and finds it
still rejected by `checkKeyboardPatterns` (default `true`). To accept
simple numeric runs, both flags must be disabled.

The Validators guide (`packages/docs/docs/guide/validators.md`) gets a
matching warning callout in each section so the cross-reference is
visible from both directions.

No runtime change.
