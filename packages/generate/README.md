# @sentinel-password/generate

Cryptographically secure password and diceware-passphrase generation. Zero
runtime dependencies, ≤ 10 KB gzipped (CI enforced). The generation
counterpart to [`@sentinel-password/core`](https://www.npmjs.com/package/@sentinel-password/core)'s
validation: validate what users type, suggest something strong when they ask.

## Install

```bash
pnpm add @sentinel-password/generate
```

Requires `crypto.getRandomValues` (Node ≥ 22, all modern browsers, edge
runtimes).

## Usage

```typescript
import { generatePassword, generatePassphrase } from '@sentinel-password/generate'

generatePassword()
// { value: 'y?K@vRq2!wF+xT9;bZu3', entropyBits: 131.1 }

generatePassword({ length: 16, symbols: false, excludeAmbiguous: true })
// { value: 'mVX3kTdEUwe7RbnH', entropyBits: 94.7 }

generatePassphrase()
// { value: 'acorn-jolt-nectar-swab-dice-flame', entropyBits: 62 }

generatePassphrase({ words: 4, separator: ' ', capitalize: true })
// { value: 'Union Motto Rigor Ounce', entropyBits: 41.4 }
```

### `generatePassword(options?)`

| Option | Default | Description |
|--------|---------|-------------|
| `length` | `20` | Password length (integer; at least the number of enabled classes, at most 1024) |
| `lowercase` | `true` | Include `a-z` |
| `uppercase` | `true` | Include `A-Z` |
| `digits` | `true` | Include `0-9` |
| `symbols` | `true` | Include `!@#$%^&*()-_=+[]{};:,.<>?` |
| `excludeAmbiguous` | `false` | Drop `O 0 I l 1 \|` (easier to transcribe, ~0.1 bits/char cheaper) |

Every enabled class is guaranteed to appear at least once. Sampling is
uniform over the set of conforming passwords: characters are drawn with
unbiased rejection sampling (`crypto.getRandomValues`, no modulo bias) and
the whole password is redrawn until it conforms — not the subtly non-uniform
"place one of each class, then shuffle" scheme.

### `generatePassphrase(options?)`

| Option | Default | Description |
|--------|---------|-------------|
| `words` | `6` | Number of words (~10.34 bits each on the default list → ~62 bits) |
| `separator` | `'-'` | String between words |
| `capitalize` | `false` | Capitalize each word's first letter |
| `wordlist` | EFF short list | Custom list (≥ 2 entries) |

Both functions return `{ value, entropyBits }` — the entropy figure is
computed from the generation parameters, so you can display it or gate on it
directly. Misconfiguration (no classes, bad lengths, missing platform
crypto) **throws** — a password generator must fail loudly, never degrade.

### Pairing with validation

```typescript
import { validatePassword } from '@sentinel-password/core'
import { generatePassword } from '@sentinel-password/generate'

const suggestion = generatePassword({ length: 20 })
validatePassword(suggestion.value).valid // true
```

## Security notes

- Randomness comes exclusively from `crypto.getRandomValues`; `Math.random`
  is never used.
- Rejection sampling removes modulo bias entirely; distribution uniformity is
  covered by chi-squared tests in the suite.
- Generated values are returned to the caller and never logged or stored.

## Attribution

The embedded passphrase wordlist is the
[EFF Short Wordlist 1](https://www.eff.org/deeplinks/2016/07/new-wordlists-random-passphrases)
by the Electronic Frontier Foundation, licensed under
[CC BY 3.0 US](https://creativecommons.org/licenses/by/3.0/us/). The list is
embedded verbatim (1,296 words).

## License

MIT (package code). Wordlist: CC BY 3.0 US, see Attribution above.
