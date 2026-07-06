---
'@sentinel-password/generate': minor
---

Initial release of `@sentinel-password/generate`: cryptographically secure
password and diceware-passphrase generation, zero runtime dependencies,
≤ 10 KB gzipped.

- `generatePassword(options)` — unbiased rejection sampling over
  `crypto.getRandomValues`, per-class toggles, `excludeAmbiguous`, and a
  guarantee that every enabled class appears (uniform over conforming
  passwords).
- `generatePassphrase(options)` — embedded EFF Short Wordlist 1 (1,296 words,
  CC BY 3.0 US, attributed) or a custom list; ~62 bits at the default 6 words.
- Both return `{ value, entropyBits }`; misconfiguration and missing platform
  crypto throw (a generator must fail loudly, never degrade).
