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
  validators: {
    length: { 
      min: 8, 
      max: 128 
    },
    characterTypes: {
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true
    },
    commonPassword: { 
      enabled: true 
    }
  }
})

if (result.isValid) {
  console.log('✓ Password is valid!')
  console.log('Strength:', result.strength) // 'weak' | 'medium' | 'strong'
} else {
  console.log('✗ Validation failed')
  result.errors.forEach(error => {
    console.log(`[${error.severity}] ${error.message}`)
  })
}
```

### React Hook

For React applications, use the `usePasswordValidator` hook:

```typescript
import { usePasswordValidator } from '@sentinel-password/react'

function SignupForm() {
  const {
    value,
    isValid,
    errors,
    strength,
    handleChange,
    reset
  } = usePasswordValidator({
    validators: {
      length: { min: 8 },
      characterTypes: {
        requireUppercase: true,
        requireNumbers: true
      }
    },
    debounceMs: 300
  })

  return (
    <form>
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={value}
        onChange={handleChange}
        aria-invalid={!isValid}
      />
      
      {errors.length > 0 && (
        <ul role="alert">
          {errors.map((error, index) => (
            <li key={error.code}>{error.message}</li>
          ))}
        </ul>
      )}
      
      <p>Strength: {strength}</p>
      
      <button type="submit" disabled={!isValid}>
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

  return (
    <form>
      <PasswordInput
        label="Create Password"
        description="Password must be at least 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        validators={{
          length: { min: 8, max: 128 },
          characterTypes: {
            requireUppercase: true,
            requireNumbers: true,
            requireSymbols: true
          },
          commonPassword: { enabled: true }
        }}
        showToggleButton={true}
        debounceMs={300}
      />
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
  validators: {
    length: { 
      min: 12, 
      max: 128 
    },
    characterTypes: {
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    commonPassword: { 
      enabled: true 
    },
    keyboardPattern: { 
      enabled: true,
      maxConsecutive: 3
    },
    sequential: { 
      enabled: true,
      maxConsecutive: 3
    },
    repetition: { 
      enabled: true,
      maxConsecutive: 2
    }
  }
}
```

## Next Steps

- Learn about [all available validators](/guide/validators)
- Explore [advanced configuration options](/guide/configuration)
- See [live examples](/examples/)
- Check out the [API reference](/api/core)
- Read our [accessibility guide](/guide/accessibility)
