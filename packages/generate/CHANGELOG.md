# @sentinel-password/generate

## 0.1.0

### Minor Changes

- [#239](https://github.com/akankov/sentinel-password/pull/239) [`4aeb16e`](https://github.com/akankov/sentinel-password/commit/4aeb16eca82e982b34a182a4486b6d18566ef39e) Thanks [@akankov](https://github.com/akankov)! - Initial release of `@sentinel-password/generate`: cryptographically secure
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
