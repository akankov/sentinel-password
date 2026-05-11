# React Hook API

The `@sentinel-password/react` package provides a React hook with built-in state management and debouncing on top of `@sentinel-password/core`.

## Installation

```bash
npm install @sentinel-password/react @sentinel-password/core
```

**Peer Dependencies:** React 18+ or React 19+

## Hooks

### `usePasswordValidator()`

Manages a password string, runs validation against `@sentinel-password/core`, and exposes the latest result.

**Signature:**
```typescript
function usePasswordValidator(
  options?: UsePasswordValidatorOptions
): UsePasswordValidatorReturn
```

**Parameters:**

```typescript
interface UsePasswordValidatorOptions extends ValidatorOptions {
  debounceMs?: number        // Default: 300. Set to 0 to disable.
  validateOnMount?: boolean  // Default: false. No-op today — see table below.
  validateOnChange?: boolean // Default: false
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `debounceMs` | `number` | `300` | Delay in ms after `setPassword` before validating. `0` disables debouncing (paired with `validateOnChange: true` for instant validation). |
| `validateOnMount` | `boolean` | `false` | **No-op in the current release.** The hook initializes `password` to `''` and the mount effect only validates when `password.length > 0`, but there is no `initialPassword` option to seed a non-empty value. If you need validation before user input, call `validatePassword(value, options)` directly from `@sentinel-password/core` (see [stale-state caveat](#stale-state-caveat-for-validate) for why the hook's `validate()` can't help here). |
| `validateOnChange` | `boolean` | `false` | Only takes effect when `debounceMs === 0`. See the behavior matrix below. |
| ...all `ValidatorOptions` | — | — | All flat options from [`@sentinel-password/core`](/api/core#validatoroptions) (`minLength`, `requireUppercase`, `personalInfo`, etc.). |

#### When validation runs

`debounceMs` and `validateOnChange` interact — the table below covers every combination:

| `debounceMs` | `validateOnChange` | Behavior on `setPassword` |
|--------------|--------------------|---------------------------|
| `> 0` (default `300`) | any value | Debounced validation runs on every change. `validateOnChange` is ignored. |
| `0` | `true` | Synchronous validation on every change. |
| `0` | `false` | **Manual mode** — no automatic validation. Call `validate()` yourself. |

**Returns:**

```typescript
interface UsePasswordValidatorReturn {
  password: string
  setPassword: (password: string) => void
  result: ValidationResult | undefined
  isValidating: boolean
  validate: () => void
  reset: () => void
}
```

| Property | Type | Description |
|----------|------|-------------|
| `password` | `string` | Current password value held by the hook |
| `setPassword` | `(password: string) => void` | Update the password and trigger (debounced) validation. **Note:** takes a `string`, not an event. |
| `result` | `ValidationResult \| undefined` | Latest validation result, or `undefined` until first validation |
| `isValidating` | `boolean` | `true` while a debounced validation is pending |
| `validate` | `() => void` | Manually trigger validation against the current password |
| `reset` | `() => void` | Clear the password and validation state |

`ValidationResult` is the same shape returned by [`validatePassword`](/api/core#validationresult): `{ valid, score, strength, feedback: { warning?, suggestions }, checks }`.

## Basic Usage

### Simple Form

```tsx
import { usePasswordValidator } from '@sentinel-password/react'

function PasswordForm() {
  const { password, setPassword, result } = usePasswordValidator({
    minLength: 8,
    requireUppercase: true,
    requireDigit: true,
  })

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-invalid={result && !result.valid ? true : undefined}
      />

      {result && !result.valid && (
        <ul role="alert">
          {result.feedback.suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### Signup Form With Strength Indicator

```tsx
import { useState } from 'react'
import { usePasswordValidator } from '@sentinel-password/react'

function SignupForm() {
  const [submitted, setSubmitted] = useState(false)

  const { password, setPassword, result, reset } = usePasswordValidator({
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireDigit: true,
    requireSymbol: true,
    debounceMs: 500,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!result?.valid) return
    setSubmitted(true)
    reset()
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="password">Create Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-invalid={result && !result.valid ? true : undefined}
        aria-describedby="password-feedback"
      />

      <div id="password-feedback" role="alert" aria-live="polite">
        {result?.feedback.warning && <p>{result.feedback.warning}</p>}
      </div>

      {result && <p>Strength: <strong>{result.strength}</strong></p>}

      <button type="submit" disabled={!result?.valid}>
        Create Account
      </button>

      {submitted && <p>Account created!</p>}
    </form>
  )
}
```

## Advanced Usage

### Custom Debounce

```tsx
// Default 300ms debounce
usePasswordValidator({ minLength: 8 })

// Slow debounce for expensive backend checks
usePasswordValidator({ minLength: 8, debounceMs: 1000 })

// No debounce — validate on every keystroke
usePasswordValidator({
  minLength: 8,
  debounceMs: 0,
  validateOnChange: true,
})
```

### Manual Validation

If you set `debounceMs: 0` without `validateOnChange`, automatic validation is disabled — call `validate()` yourself, e.g. on submit.

```tsx
const { password, setPassword, result, validate } = usePasswordValidator({
  minLength: 8,
  debounceMs: 0,
})

return (
  <form
    onSubmit={(e) => {
      e.preventDefault()
      validate()
    }}
  >
    <input value={password} onChange={(e) => setPassword(e.target.value)} />
    <button type="submit">Validate</button>
  </form>
)
```

#### Stale-state caveat for `validate()`

`validate()` reads `password` through its `useCallback` closure. After `setPassword(value)` runs synchronously, React batches the state update — the **next** render rebuilds `validate` with the new password.

✅ **Works** — any event handler that fires after React has committed a re-render:

```tsx
// Submit, blur, button click, etc. — by the time these fire, password
// is whatever the user most recently set.
<button onClick={validate}>Validate now</button>
```

❌ **Doesn't work** — back-to-back calls in the same synchronous tick:

```tsx
setPassword('new-value')
validate() // ← validates the OLD password; the closure here was built
           //   in the previous render with the previous password.
```

If you need to validate a *specific* value right now (without waiting for the hook to re-render), call `validatePassword` from core directly:

```tsx
import { validatePassword } from '@sentinel-password/core'

const result = validatePassword('new-value', { minLength: 8 })
// result is fresh — no closure, no state, no waiting for a re-render.
```

### Programmatic Updates

```tsx
function PasswordGenerator() {
  const { password, setPassword, result } = usePasswordValidator({
    minLength: 12,
    requireUppercase: true,
    requireDigit: true,
    requireSymbol: true,
  })

  const generate = () => {
    setPassword(crypto.randomUUID().slice(0, 12) + 'A1!')
  }

  return (
    <div>
      <button onClick={generate}>Generate</button>
      <p>Generated: {password}</p>
      <p>Strength: {result?.strength}</p>
    </div>
  )
}
```

### Reset

`reset()` clears both the password and the cached result.

```tsx
const { password, setPassword, result, reset } = usePasswordValidator()

// later...
reset() // password becomes '', result becomes undefined
```

## TypeScript

Full type inference is automatic. You can also import the option and return types directly:

```typescript
import { usePasswordValidator } from '@sentinel-password/react'
import type {
  UsePasswordValidatorOptions,
  UsePasswordValidatorReturn,
} from '@sentinel-password/react'

const options: UsePasswordValidatorOptions = {
  minLength: 8,
  requireUppercase: true,
  debounceMs: 300,
}
```

## Performance Tips

### Pick a Debounce That Matches Your Validators

- **`0`ms** (with `validateOnChange: true`): fine for the default policy — validation takes microseconds.
- **`300`ms** (default): a reasonable balance for typing latency.
- **`500–1000`ms**: useful only if you chain expensive *external* checks (e.g. server-side breach lookup) on top of validation.

### Callback Identity Is Not Stable (Known Limitation)

`setPassword`, `validate`, and `reset` from `usePasswordValidator` are **not reference-stable across renders today**. Internally the hook destructures its options with `{ ...validatorOptions } = options` on every render, producing a fresh object identity that then lands in the `useCallback` dependency arrays for `setPassword` and `validate`. So even if you wrap your options in `useMemo`, the derived `validatorOptions` still changes identity and the callbacks get re-created.

Practical implications:

- **Don't bother memoizing the options object** with `useMemo` expecting it to stabilize the returned callbacks. It won't — user-side memoization buys nothing here.
- **Don't rely on `setPassword`/`validate` identity** as `useEffect` or `useMemo` dependencies if you're trying to "only run once." They'll change on every render.

If you do need a stable handler to pass to a deep child:

```tsx
import { useCallback, useRef } from 'react'
import { usePasswordValidator } from '@sentinel-password/react'

function MyForm() {
  const { password, setPassword, result } = usePasswordValidator({ minLength: 12 })

  // Capture the latest setPassword in a ref, then wrap with a stable
  // useCallback that reads through the ref.
  const setPasswordRef = useRef(setPassword)
  setPasswordRef.current = setPassword
  const stableSetPassword = useCallback((value: string) => setPasswordRef.current(value), [])

  // Pass `stableSetPassword` to memoized children; it never changes identity.
  // ...
}
```

This is a hook-internal limitation, not a contract — a future release may make the returned callbacks reference-stable. For now, write your code as if `setPassword`/`validate` change every render.

## See Also

- [Core API Reference](/api/core)
- [React Components API](/api/react-components)
- [Live Examples](/examples/)
