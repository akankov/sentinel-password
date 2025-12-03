# Getting Started

Sentinel Password is a flexible, accessible password validation library for JavaScript and React. This guide will help you get up and running quickly.

## Installation

Choose the package that fits your needs:

::: code-group
```bash [Core (Vanilla JS)]
npm install @sentinel-password/core
```

```bash [React Hook]
npm install @sentinel-password/react
```

```bash [React Components]
npm install @sentinel-password/react-components
```
:::

## Quick Start

### Vanilla JavaScript

The core package provides a simple function-based API for validating passwords:

```typescript
import { validatePassword } from '@sentinel-password/core'

const result = validatePassword('MyP@ssw0rd!', {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true,
  checkCommonPasswords: true
})

if (result.valid) {
  console.log('✓ Password is valid!')
  console.log('Strength:', result.strength) // 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong'
  console.log('Score:', result.score) // 0-4
} else {
  console.log('✗ Validation failed')
  console.log('Warning:', result.feedback.warning)
  result.feedback.suggestions.forEach(suggestion => {
    console.log(`- ${suggestion}`)
  })
}
```

### React Hook

For React applications, use the `usePasswordValidator` hook:

```typescript
import { usePasswordValidator } from '@sentinel-password/react'

function SignupForm() {
  const {
    password,
    setPassword,
    result,
    isValidating,
    validate,
    reset
  } = usePasswordValidator({
    minLength: 8,
    requireUppercase: true,
    requireDigit: true,
    debounceMs: 300
  })

  return (
    <form>
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-invalid={result && !result.valid}
      />
      
      {result && !result.valid && result.feedback.suggestions.length > 0 && (
        <ul role="alert">
          {result.feedback.suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      )}
      
      {result && (
        <p>Strength: {result.strength}</p>
      )}
      
      <button type="submit" disabled={!result?.valid}>
        Create Account
      </button>
    </form>
  )
}
```

### React Component

For the quickest setup, use our pre-built accessible component:

```typescript
import { PasswordInput } from '@sentinel-password/react-components'
import { useState } from 'react'

function SignupForm() {
  const [password, setPassword] = useState('')
  const [isValid, setIsValid] = useState(false)

  return (
    <form>
      <PasswordInput
        label="Create Password"
        description="Password must be at least 8 characters"
        value={password}
        onChange={setPassword}
        onValidationChange={(result) => setIsValid(result.valid)}
        showToggleButton={true}
        debounceMs={300}
      />
      
      <button type="submit" disabled={!isValid}>
        Create Account
      </button>
    </form>
  )
}
```

## Configuration Options

All validators are optional and can be mixed and matched:

### Available Validators

| Validator | Description |
|-----------|-------------|
| `length` | Minimum and maximum password length |
| `characterTypes` | Required character types (uppercase, lowercase, numbers, symbols) |
| `commonPassword` | Checks against common password lists |
| `keyboardPattern` | Detects keyboard patterns like "qwerty" |
| `sequential` | Detects sequential characters like "abc123" |
| `repetition` | Detects repeated characters like "aaa" |
| `personalInfo` | Checks for personal information (name, email, etc.) |

### Example: Strong Password Policy

```typescript
const config = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true,
  maxRepeatedChars: 2,
  checkSequential: true,
  checkKeyboardPatterns: true,
  checkCommonPasswords: true,
  personalInfo: ['john', 'doe', 'john@example.com']
}

const result = validatePassword('MySecureP@ssw0rd2024!', config)
```

## Next Steps

- Learn about [all available validators](/guide/validators)
- Explore [advanced configuration options](/guide/configuration)
- See [live examples](/examples/)
- Check out the [API reference](/api/core)
- Read our [accessibility guide](/guide/accessibility)
