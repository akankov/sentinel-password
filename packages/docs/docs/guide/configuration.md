# Configuration

`validatePassword` takes a single flat options object — every field is optional. This page shows policy presets and patterns for shaping the configuration to your context.

## Basic Configuration

```typescript
import { validatePassword } from '@sentinel-password/core'

const result = validatePassword('mypassword', { minLength: 8 })
```

See the [`ValidatorOptions` type](/api/core#validatoroptions) for the full list of fields.

## Configuration Presets

### Minimal (Low Security)

For low-risk applications:

```typescript
const minimal = { minLength: 6 }
```

### Balanced (Medium Security)

A reasonable default for consumer apps:

```typescript
const balanced = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireDigit: true,
}
```

### Strict (High Security)

For enterprise or sensitive workflows:

```typescript
const strict = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true,
  maxRepeatedChars: 2,
  // checkSequential, checkKeyboardPatterns, checkCommonPasswords default to true
}
```

### Maximum (Very High Security)

```typescript
const maximum = {
  minLength: 16,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true,
  maxRepeatedChars: 2,
  personalInfo: [], // populate with user fields when available
}
```

::: tip Defaults already sit between Minimal and Balanced
With no options at all, `validatePassword` enforces `minLength: 8`, `maxLength: 128`, `maxRepeatedChars: 3`, and runs the sequential, keyboard-pattern, and common-password checks. The `require*` flags are off by default.
:::

## Environment-Based Configuration

```typescript
import type { ValidatorOptions } from '@sentinel-password/core'

// Match the standard NODE_ENV values. Anything unrecognized — including
// undefined — falls through to the strictest (production) preset, which is
// the right fail-safe default for a security check.
const getConfig = (env: string | undefined): ValidatorOptions => {
  if (env === 'development') return { minLength: 4 }
  if (env === 'test') return { minLength: 4 }
  return {
    minLength: 12,
    requireUppercase: true,
    requireDigit: true,
    requireSymbol: true,
  }
}

const config = getConfig(process.env.NODE_ENV)
```

## Dynamic Configuration

Tighten the policy for privileged users and feed identity into `personalInfo`:

```typescript
interface User {
  email: string
  firstName: string
  lastName: string
  role: 'user' | 'admin'
}

const getUserConfig = (user: User): ValidatorOptions => {
  const base: ValidatorOptions = {
    minLength: 8,
    requireUppercase: true,
    requireDigit: true,
    personalInfo: [user.email, user.firstName, user.lastName].filter(Boolean),
  }

  if (user.role === 'admin') {
    return { ...base, minLength: 16, requireSymbol: true }
  }

  return base
}
```

## Sharing Configuration With the Client

Define the policy once and use it both in the React hook and on the server:

```typescript
// shared/password-policy.ts
import type { ValidatorOptions } from '@sentinel-password/core'

export const PASSWORD_POLICY: ValidatorOptions = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true,
}
```

```tsx
// client
import { usePasswordValidator } from '@sentinel-password/react'
import { PASSWORD_POLICY } from '../shared/password-policy'

const { password, setPassword, result } = usePasswordValidator(PASSWORD_POLICY)
```

```typescript
// server
import { validatePassword } from '@sentinel-password/core'
import { PASSWORD_POLICY } from '../shared/password-policy'

const result = validatePassword(req.body.password, {
  ...PASSWORD_POLICY,
  personalInfo: [req.body.email, req.body.name],
})
```

See the [Server-Side Usage guide](/guide/server-side) for full Express/Fastify/NestJS examples.

## Debouncing (React Hook)

`usePasswordValidator` debounces validation by default — control timing with `debounceMs`:

```tsx
import { usePasswordValidator } from '@sentinel-password/react'

// Default — 300ms after typing stops
usePasswordValidator({ minLength: 8 })

// Slower debounce
usePasswordValidator({ minLength: 8, debounceMs: 500 })

// Instant validation on every keystroke
usePasswordValidator({ minLength: 8, debounceMs: 0, validateOnChange: true })
```

## Localized Feedback

Validators return English messages today. To translate, map the suggestion strings to your locale at the application layer:

```typescript
const result = validatePassword(password, options)

const translations: Record<string, Record<string, string>> = {
  es: {
    'Password must be at least 8 characters': 'La contraseña debe tener al menos 8 caracteres',
    'Password is too common. Please choose a more unique password.':
      'La contraseña es demasiado común. Elija una contraseña más única.',
  },
}

const localized = result.feedback.suggestions.map(
  (msg) => translations['es']?.[msg] ?? msg
)
```

A future release will support pluggable message templates. See [Internationalization](/guide/i18n).

## Best Practices

### Don't Over-Restrict

Balance security with usability:

```typescript
// Too restrictive — blocks reasonable passwords
{
  minLength: 32,
  maxLength: 32,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true,
}

// Better balance
{
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireDigit: true,
  requireSymbol: true,
}
```

### Always Pass `personalInfo` When You Have It

The check is essentially free and catches `JohnSmith2024!` for `["John", "Smith"]`:

```typescript
validatePassword(password, {
  ...policy,
  personalInfo: [user.email, user.firstName, user.lastName].filter(Boolean),
})
```

### Match Requirements to Risk

| Surface | Suggested preset |
|---------|------------------|
| Blog comments, throwaway accounts | Minimal |
| E-commerce, consumer apps | Balanced |
| Banking, healthcare, B2B SaaS | Strict |
| Admin panels, root credentials | Maximum |

### Show Requirements Up Front

Don't make users guess the rules — surface them in the UI before they type, and make sure the UI copy matches the policy you actually enforce.

`PasswordInput` always validates against the defaults (`minLength: 8`, common-password / sequential / keyboard-pattern checks on, no required character types). For any stricter policy, use `usePasswordValidator` so the requirements you describe in the UI are the same ones being checked:

```tsx
import { usePasswordValidator } from '@sentinel-password/react'

const policy = {
  minLength: 12,
  requireUppercase: true,
  requireDigit: true,
  requireSymbol: true,
}

function PasswordField() {
  const { password, setPassword, result } = usePasswordValidator(policy)

  return (
    <div>
      <label htmlFor="pw">Create Password</label>
      <p id="pw-help">Must be 12+ characters with uppercase, digit, and symbol</p>
      <input
        id="pw"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-describedby="pw-help"
        aria-invalid={result && !result.valid ? true : undefined}
      />
      {result?.feedback.suggestions.map((msg, i) => (
        <p key={i}>{msg}</p>
      ))}
    </div>
  )
}
```

## See Also

- [Validators Guide](/guide/validators)
- [Core API](/api/core)
- [Getting Started](/guide/getting-started)
- [Server-Side Usage](/guide/server-side)
