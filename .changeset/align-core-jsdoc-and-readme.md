---
'@sentinel-password/core': patch
---

Align the JSDoc on `validatePassword` and the package README with the
validator's real output.

- The "weak password" JSDoc example claimed `validatePassword('password')`
  returns `score: 1, strength: 'weak'`. Actual output is `score: 4,
  strength: 'very-strong'` — `'password'` fails only the common-password
  check, so 6 of 7 checks pass and the ratio-based scoring lands on 4. The
  example now shows the real numbers, and a new "Scoring" section in
  `@remarks` documents that `valid` and `strength` answer different
  questions: `valid` is for acceptance decisions, `strength` is a
  passed-check ratio meant for UX cues (progress bars etc.).
- The Custom Requirements section in the package README listed
  `feedback.suggestions` strings that the validators don't emit
  (`'Add uppercase letters'`, `'Add numbers'`, etc.). Replaced with the
  actual three-suggestion output — the character-types validator returns
  one combined message naming every missing type, and the common-password
  check also fires for `'password'`.

No runtime behavior change.
