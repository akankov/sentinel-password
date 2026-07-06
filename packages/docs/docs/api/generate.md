# @sentinel-password/generate API

Cryptographically secure password and diceware-passphrase generation. Zero
runtime dependencies, ≤ 10 KB gzipped (CI-enforced). Requires
`crypto.getRandomValues` (Node ≥ 20, all modern browsers, edge runtimes).

```bash
pnpm add @sentinel-password/generate
```

## `generatePassword(options?)`

```typescript
import { generatePassword } from '@sentinel-password/generate'

generatePassword()
// { value: 'y?K@vRq2!wF+xT9;bZu3', entropyBits: 131.1 }

generatePassword({ length: 16, symbols: false, excludeAmbiguous: true })
// { value: 'mVX3kTdEUwe7RbnH', entropyBits: 94.7 }
```

| Option | Default | Description |
|--------|---------|-------------|
| `length` | `20` | Password length (integer; at least the number of enabled classes, at most 1024) |
| `lowercase` | `true` | Include `a-z` |
| `uppercase` | `true` | Include `A-Z` |
| `digits` | `true` | Include `0-9` |
| `symbols` | `true` | Include `!@#$%^&*()-_=+[]{};:,.<>?` |
| `excludeAmbiguous` | `false` | Drop `O 0 I l 1 \|` for easier transcription |

Every enabled class is guaranteed to appear at least once. Characters are
drawn with unbiased rejection sampling over `crypto.getRandomValues` (no
modulo bias) and the whole password is redrawn until it conforms — uniform
over the set of conforming passwords, unlike "place one of each class then
shuffle" schemes.

## `generatePassphrase(options?)`

```typescript
import { generatePassphrase } from '@sentinel-password/generate'

generatePassphrase()
// { value: 'acorn-jolt-nectar-swab-dice-flame', entropyBits: 62 }

generatePassphrase({ words: 4, separator: ' ', capitalize: true })
// { value: 'Union Motto Rigor Ounce', entropyBits: 41.4 }
```

| Option | Default | Description |
|--------|---------|-------------|
| `words` | `6` | Number of words (~10.34 bits each on the default list) |
| `separator` | `'-'` | String between words |
| `capitalize` | `false` | Capitalize each word's first letter |
| `wordlist` | EFF short list | Custom list (≥ 2 unique entries) |

The embedded list is the [EFF Short Wordlist 1](https://www.eff.org/deeplinks/2016/07/new-wordlists-random-passphrases)
(1,296 words, CC BY 3.0 US — attribution in the package README).

## Return shape & errors

Both functions return `{ value, entropyBits }`:

```typescript
interface GeneratedSecret {
  readonly value: string
  readonly entropyBits: number // computed from the generation parameters
}
```

Unlike the validators (which never throw), generation **throws** on
misconfiguration — no character classes enabled, invalid `length`/`words`, a
degenerate custom wordlist, or missing platform crypto. A password generator
that silently degrades is a security bug; failing loudly is the contract.

## Pairing with validation

```typescript
import { validatePassword } from '@sentinel-password/core'
import { generatePassword } from '@sentinel-password/generate'

const suggestion = generatePassword({ length: 20 })
validatePassword(suggestion.value).valid // true
```

## Exports

`generatePassword`, `generatePassphrase`, `randomInt` (the unbiased sampler),
`EFF_SHORT_WORDLIST`, and the types `GeneratePasswordOptions`,
`GeneratePassphraseOptions`, `GeneratedSecret`.
