---
'@sentinel-password/core': minor
'@sentinel-password/entropy': minor
'@sentinel-password/react-components': minor
'@sentinel-password/breach': patch
---

Core correctness and type-design improvements.

- **core:** `requireSymbol` now counts every printable non-alphanumeric ASCII
  character — including space, backtick (`` ` ``) and tilde (`~`) — matching
  `@sentinel-password/entropy`'s character-class counting. Previously these
  three were rejected, so e.g. `Abcdef1~` failed the symbol requirement.
- **core:** the repetition validator iterates by Unicode code point, so runs of
  identical astral characters (e.g. repeated emoji) are detected instead of
  slipping through a UTF-16 code-unit scan.
- **core:** `ValidatorCheck` is now a discriminated union on `passed` — the
  failure branch guarantees `message`/`code`/`params`, so consumers no longer
  need non-null assertions to read them.
- **core:** `ValidationResult` gains `failures: ValidationFailure[]`, exposing
  each failing check's stable `code`/`params` from the zero-config
  `validatePassword` call (previously only pre-rendered English strings were
  surfaced via `feedback.suggestions`).
- **entropy:** added `EntropyScore` as the canonical score type; `StrengthScore`
  is retained as a deprecated alias to avoid a name collision with core's
  `StrengthScore` when both packages are imported together.
- **react-components:** `PasswordInput`'s `value`/`defaultValue` props are
  narrowed to `string` (a password field is always text).
- **breach:** a misconfigured `threshold` (NaN, 0, or negative) now falls back
  to the default of `1` instead of silently reporting a pwned password as safe.
