# @sentinel-password/generate

## 0.2.0

### Minor Changes

- [#249](https://github.com/akankov/sentinel-password/pull/249) [`50aa239`](https://github.com/akankov/sentinel-password/commit/50aa2393b92e4af02b45d4575deed4c8caf9a4cd) Thanks [@akankov](https://github.com/akankov)! - Require Node.js 22 or later.

  `engines.node` moves from `>=20` to `>=22` across every package. Node 20 reached
  end-of-life in April 2026 and no longer receives security updates, and the CI
  matrix now runs 22, 24 and 26.

  The compiled output is unchanged — it is still plain ES2022 with no
  Node-specific APIs, so it will keep working on older runtimes in practice. What
  changes is the declared support floor: on Node 20 or below, npm and pnpm now
  emit an engine warning, and installs fail outright under `engine-strict`.

  If you are still on Node 20, stay on the previous release until you can upgrade.

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
