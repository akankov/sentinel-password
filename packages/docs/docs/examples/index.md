# Examples

Interactive examples and code snippets for common use cases.

## Live Examples

### Interactive Playground

Try out the interactive playground to test password validation in real time:

👉 **[Open Playground](https://akankov.github.io/sentinel-password/playground/)**

The playground features:
- Live password validation
- Configurable validation options
- Visual strength meter
- Detailed validation results

### Working Examples

Complete, runnable examples in different stacks:

- **[Next.js 16+ Example](https://github.com/akankov/sentinel-password/tree/main/examples/nextjs)** — Signup form with App Router and Tailwind CSS
- **[Vite + React Example](https://github.com/akankov/sentinel-password/tree/main/examples/vite-react)** — Login form with custom styling
- **[Express Backend Example](https://github.com/akankov/sentinel-password/tree/main/examples/express-backend)** — Server-side `/signup` validation with Express 5. See the [Server-Side Usage guide](/guide/server-side) for Fastify, NestJS, and edge-runtime variants.
- **[Playground](https://akankov.github.io/sentinel-password/playground/)** — Interactive component configurator

## Quick Links

- [Basic Validation](#basic-validation)
- [React Form Integration](#react-form)
- [Custom Styling](#custom-styling)
- [Real-time Feedback](#real-time-feedback)
- [Multi-step Forms](#multi-step-forms)

## Basic Validation

```typescript
import { validatePassword } from '@sentinel-password/core'

const result = validatePassword('Quartz-Glider!9pump', {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true,
})

console.log(result)
// {
//   valid: true,
//   score: 4,
//   strength: 'very-strong',
//   feedback: { suggestions: [] },
//   checks: { length: true, characterTypes: true, ... },
// }
```

::: tip Common pitfall
Suffixes like `123`, `abc`, or `qwerty` trigger the sequential and keyboard-pattern checks even when the rest of the password looks strong. `MySecureP@ss123` looks plausible but fails — it satisfies every character-type requirement *and* returns `valid: false` with `strength: 'strong'`. The strength label and the `valid` flag aren't redundant: `valid` requires every check to pass; `strength` reflects the ratio.
:::

## React Form

A signup form using `usePasswordValidator`:

```tsx
import { useState } from 'react'
import { usePasswordValidator } from '@sentinel-password/react'

function SignupForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { password, setPassword, result } = usePasswordValidator({
    minLength: 8,
    requireUppercase: true,
    requireDigit: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!result?.valid) {
      alert('Please fix password issues')
      return
    }

    await fetch('/api/signup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    setSubmitted(true)
  }

  if (submitted) return <p>Account created successfully!</p>

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={result && !result.valid ? true : undefined}
        />

        {result?.feedback.suggestions.map((suggestion, i) => (
          <p key={i} style={{ color: 'red' }}>
            {suggestion}
          </p>
        ))}

        {result && (
          <p>
            Strength: <strong>{result.strength}</strong>
          </p>
        )}
      </div>

      <button type="submit" disabled={!result?.valid || !email}>
        Sign Up
      </button>
    </form>
  )
}
```

## Custom Styling

`PasswordInput` is fully headless. Each subtree gets its own class name prop:

```tsx
import { PasswordInput } from '@sentinel-password/react-components'

function StyledForm() {
  return (
    <div className="max-w-md mx-auto p-6">
      <PasswordInput
        label="Create Password"
        description="At least 8 characters"
        containerClassName="mb-6"
        labelClassName="block text-sm font-semibold text-gray-900 mb-2"
        descriptionClassName="text-sm text-gray-600 mb-3"
        inputWrapperClassName="relative"
        className="w-full px-4 py-3 pr-24 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
        toggleButtonClassName="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
        validationClassName="mt-3 space-y-2"
      />
    </div>
  )
}
```

::: tip `PasswordInput` uses default validation
The component currently runs the built-in defaults (min length 8, all `check*` flags on) and does not accept a `validators`/`validatorOptions` prop yet. If you need a custom policy, use [`usePasswordValidator`](/api/react) and render your own input.
:::

## Real-time Feedback

A strength bar driven by the hook's `result.score` (0–4):

```tsx
import { usePasswordValidator } from '@sentinel-password/react'

function PasswordWithStrength() {
  const { password, setPassword, result } = usePasswordValidator({
    minLength: 8,
    requireUppercase: true,
    requireDigit: true,
    requireSymbol: true,
  })

  const score = result?.score ?? 0
  const widthPct = ((score + 1) / 5) * 100

  const color =
    score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-yellow-500' : 'bg-green-500'

  return (
    <div>
      <label htmlFor="pw">Password</label>
      <input
        id="pw"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${widthPct}%` }}
        />
      </div>

      <p className="mt-1 text-sm text-gray-600">
        Strength: <span className="font-semibold">{result?.strength ?? '—'}</span>
      </p>

      {result && !result.valid && (
        <ul className="mt-2 space-y-1">
          {result.feedback.suggestions.map((msg, i) => (
            <li key={i} className="text-sm text-red-600">
              ✗ {msg}
            </li>
          ))}
        </ul>
      )}

      {result?.valid && password && (
        <p className="mt-2 text-sm text-green-600">✓ Password meets all requirements</p>
      )}
    </div>
  )
}
```

## Multi-step Forms

Wire the user's email and name into `personalInfo` so the password can't include them:

```tsx
import { useState } from 'react'
import { usePasswordValidator } from '@sentinel-password/react'

type Step = 'email' | 'password' | 'profile' | 'complete'

function MultiStepSignup() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const { password, setPassword, result } = usePasswordValidator({
    minLength: 8,
    requireUppercase: true,
    requireDigit: true,
    personalInfo: [email, name].filter(Boolean),
  })

  const next = () => {
    if (step === 'email' && email) setStep('password')
    else if (step === 'password' && result?.valid) setStep('profile')
    else if (step === 'profile' && name) setStep('complete')
  }

  const back = () => {
    if (step === 'password') setStep('email')
    else if (step === 'profile') setStep('password')
  }

  const stepNumber: Record<Exclude<Step, 'complete'>, number> = {
    email: 1,
    password: 2,
    profile: 3,
  }

  return (
    <div>
      {step !== 'complete' && (
        <h2>Create Account — Step {stepNumber[step]} of 3</h2>
      )}

      {step === 'email' && (
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button onClick={next} disabled={!email}>
            Next
          </button>
        </div>
      )}

      {step === 'password' && (
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {result?.feedback.suggestions.map((msg, i) => <p key={i}>{msg}</p>)}
          <button onClick={back}>Back</button>
          <button onClick={next} disabled={!result?.valid}>
            Next
          </button>
        </div>
      )}

      {step === 'profile' && (
        <div>
          <label>Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          <button onClick={back}>Back</button>
          <button onClick={next} disabled={!name}>
            Complete
          </button>
        </div>
      )}

      {step === 'complete' && (
        <div>
          <h3>Account Created!</h3>
          <p>Email: {email}</p>
          <p>Name: {name}</p>
        </div>
      )}
    </div>
  )
}
```

## More Examples

Browse the [examples/](https://github.com/akankov/sentinel-password/tree/main/examples) directory for runnable apps. Storybook stories for the React hook and `PasswordInput` component are runnable locally — clone the repo, run `pnpm install`, then `pnpm storybook` (hook) or `pnpm storybook:components` (component).

## See Also

- [Getting Started](/guide/getting-started)
- [API Reference](/api/core)
- [Validators Guide](/guide/validators)
- [Server-Side Usage](/guide/server-side)
