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
- Same kind of fix in the Individual Validators section: the README
  claimed `validateCharacterTypes(...).message` returns
  `'Add special characters (!@#$%^&*)'`; the real message is
  `'Password must contain at least one symbol'`.
- The `@remarks` Security section claimed "Constant-time operations prevent
  timing attacks". The validators use early-return `includes()` and loops
  and are not constant-time. The claim was also misleading conceptually —
  this is a strength validator that compares the password against public
  patterns, not a password-comparison primitive, so timing is not a
  relevant attack surface. Replaced with an honest note pointing readers
  at Argon2/bcrypt for actual password verification.
- npm `description` field said "90%+ test coverage, <5KB gzipped". Real
  coverage on core is 100% (statements/branches/functions/lines) and the
  gzipped bundle is ~5.5 KB under a 10 KB CI ceiling. Description updated
  to match measured reality.
- "Browser Support" section was ambiguous about who the Node 18+ minimum
  applies to. Renamed to "Runtime Support" and made the scope explicit:
  Node 18+ is the *runtime* minimum for the published package; building
  the monorepo requires Node 20+ per the repo-level `engines.node`.
  Added edge-runtime targets and a pointer to the Server-Side Usage guide.
- Common-password detection now documents the Bloom filter tradeoff:
  no false negatives, ~0.84% false-positive rate (uncommon passwords are
  very rarely flagged as "common"). The source has documented this in
  `common-password.ts` since the validator landed; the README/API docs
  just hadn't carried the detail.
- Sequential-pattern detection is now described accurately. The
  implementation in `sequential.ts` matches *any* three consecutive
  ascending/descending Unicode code points, not just alphabet or digit
  runs — including less-obvious cases like `!"#`, `,-.`, or `9:;`
  (digit → punctuation). README and types comment updated so consumers
  can interpret rejection messages without surprise.

No runtime behavior change.
