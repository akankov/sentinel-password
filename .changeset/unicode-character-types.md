---
'@sentinel-password/core': minor
---

Opt-in Unicode-aware character classification via
`unicodeCharacterTypes: true`: `requireUppercase`/`requireLowercase` match
any cased letter (`\p{Lu}`/`\p{Ll}` — Cyrillic, Greek, accented Latin, …),
`requireDigit` matches any decimal digit (`\p{Nd}`), and a symbol is any
character that is neither a letter nor a number. Previously `Пароль123!`
could never satisfy `requireUppercase` and `№`/`€`/em-dash never counted as
symbols. Off by default — existing validation outcomes are unchanged; no
message-string changes.
