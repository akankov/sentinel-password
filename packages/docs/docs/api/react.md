# React Hook API

The `@sentinel-password/react` package provides React hooks for password validation with built-in state management and debouncing.

## Installation

```bash
npm install @sentinel-password/react
```

**Peer Dependencies:** React 18+ or React 19+

## Hooks

### `usePasswordValidator()`

A React hook that provides password validation with state management.

**Signature:**
```typescript
function usePasswordValidator(
  options?: UsePasswordValidatorOptions
): UsePasswordValidatorReturn
```

**Parameters:**

```typescript
interface UsePasswordValidatorOptions {
  validators?: ValidatorConfig['validators']
  initialValue?: string
  debounceMs?: number
  validateOnMount?: boolean
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `validators` | `ValidatorConfig['validators']` | `{}` | Validation rules |
| `initialValue` | `string` | `''` | Initial password value |
| `debounceMs` | `number` | `300` | Debounce delay in milliseconds |
| `validateOnMount` | `boolean` | `false` | Validate initial value on mount |

**Returns:**

```typescript
interface UsePasswordValidatorReturn {
  value: string
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  strength: PasswordStrength
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setValue: (value: string) => void
  reset: () => void
}
```

| Property | Type | Description |
|----------|------|-------------|
| `value` | `string` | Current password value |
| `isValid` | `boolean` | Whether password passes all validators |
| `errors` | `ValidationError[]` | Array of validation errors |
| `warnings` | `ValidationError[]` | Array of validation warnings |
| `strength` | `PasswordStrength` | Password strength indicator |
| `handleChange` | `function` | Event handler for input changes |
| `setValue` | `function` | Programmatically set password value |
| `reset` | `function` | Reset to initial value |

## Basic Usage

### Simple Form

```typescript
import { usePasswordValidator } from '@sentinel-password/react'

function PasswordForm() {
  const {
    value,
    isValid,
    errors,
    handleChange
  } = usePasswordValidator({
    validators: {
      length: { min: 8 },
      characterTypes: {
        requireUppercase: true,
        requireNumbers: true
      }
    }
  })

  return (
    <div>
      <input
        type="password"
        value={value}
        onChange={handleChange}
        aria-invalid={!isValid}
      />
      
      {errors.map(error => (
        <p key={error.code} style={{ color: 'red' }}>
          {error.message}
        </p>
      ))}
    </div>
  )
}
```

### Controlled Component

```typescript
import { usePasswordValidator } from '@sentinel-password/react'
import { useState } from 'react'

function SignupForm() {
  const [submitted, setSubmitted] = useState(false)
  
  const {
    value,
    isValid,
    errors,
    strength,
    handleChange,
    reset
  } = usePasswordValidator({
    validators: {
      length: { min: 12 },
      characterTypes: {
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true
      },
      commonPassword: { enabled: true }
    },
    debounceMs: 500
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValid) {
      return
    }
    
    // Submit form
    console.log('Password:', value)
    setSubmitted(true)
    reset()
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="password">Create Password</label>
      <input
        id="password"
        type="password"
        value={value}
        onChange={handleChange}
        aria-invalid={!isValid}
        aria-describedby="password-errors"
      />
      
      <div id="password-errors" role="alert" aria-live="polite">
        {errors.map(error => (
          <p key={error.code}>{error.message}</p>
        ))}
      </div>
      
      <div>
        Strength: <strong>{strength}</strong>
      </div>
      
      <button type="submit" disabled={!isValid}>
        Create Account
      </button>
      
      {submitted && <p>Account created!</p>}
    </form>
  )
}
```

## Advanced Usage

### Custom Debounce

Control when validation occurs:

```typescript
// Instant validation (no debounce)
usePasswordValidator({
  validators: config,
  debounceMs: 0
})

// Slow debounce for expensive operations
usePasswordValidator({
  validators: config,
  debounceMs: 1000
})
```

### Programmatic Control

Set password value programmatically:

```typescript
function PasswordGenerator() {
  const { value, setValue, isValid, strength } = usePasswordValidator({
    validators: {
      length: { min: 12 },
      characterTypes: {
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: true
      }
    }
  })

  const generatePassword = () => {
    const generated = Math.random().toString(36).slice(-12) + 'A1!'
    setValue(generated)
  }

  return (
    <div>
      <button onClick={generatePassword}>Generate Password</button>
      <p>Generated: {value}</p>
      <p>Valid: {isValid ? 'Yes' : 'No'}</p>
      <p>Strength: {strength}</p>
    </div>
  )
}
```

### Validate on Mount

Validate an initial password value:

```typescript
function EditProfile({ user }) {
  const {
    value,
    isValid,
    errors,
    handleChange
  } = usePasswordValidator({
    initialValue: user.currentPassword,
    validateOnMount: true,
    validators: {
      length: { min: 8 }
    }
  })

  return (
    <div>
      <input
        type="password"
        value={value}
        onChange={handleChange}
      />
      <p>Current password {isValid ? 'meets' : 'does not meet'} requirements</p>
    </div>
  )
}
```

### Warning vs Error Handling

Display warnings differently from errors:

```typescript
function PasswordInput() {
  const { value, errors, warnings, handleChange } = usePasswordValidator({
    validators: {
      length: { min: 8 },
      commonPassword: { enabled: true }
    }
  })

  return (
    <div>
      <input type="password" value={value} onChange={handleChange} />
      
      {/* Critical errors */}
      {errors.length > 0 && (
        <div style={{ color: 'red' }}>
          {errors.map(error => (
            <p key={error.code}>{error.message}</p>
          ))}
        </div>
      )}
      
      {/* Warnings (less severe) */}
      {warnings.length > 0 && (
        <div style={{ color: 'orange' }}>
          {warnings.map(warning => (
            <p key={warning.code}>{warning.message}</p>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Real-time Strength Indicator

Show visual password strength:

```typescript
function PasswordStrengthIndicator() {
  const { value, strength, handleChange } = usePasswordValidator({
    validators: {
      length: { min: 8 },
      characterTypes: {
        requireUppercase: true,
        requireNumbers: true
      }
    }
  })

  const getStrengthColor = () => {
    switch (strength) {
      case 'weak': return 'red'
      case 'medium': return 'orange'
      case 'strong': return 'green'
      default: return 'gray'
    }
  }

  return (
    <div>
      <input type="password" value={value} onChange={handleChange} />
      
      <div style={{ 
        width: '100%', 
        height: '4px', 
        backgroundColor: '#eee' 
      }}>
        <div style={{
          width: strength === 'weak' ? '33%' : 
                 strength === 'medium' ? '66%' : '100%',
          height: '100%',
          backgroundColor: getStrengthColor(),
          transition: 'all 0.3s'
        }} />
      </div>
      
      <p>Strength: {strength}</p>
    </div>
  )
}
```

## TypeScript

Full TypeScript support with type inference:

```typescript
import { usePasswordValidator } from '@sentinel-password/react'
import type { 
  UsePasswordValidatorOptions,
  UsePasswordValidatorReturn 
} from '@sentinel-password/react'

const options: UsePasswordValidatorOptions = {
  validators: {
    length: { min: 8 }
  },
  debounceMs: 300
}

const result: UsePasswordValidatorReturn = usePasswordValidator(options)
```

## Performance Tips

### Debouncing

Use appropriate debounce values:
- **0ms**: Instant validation (good for simple validators)
- **300ms**: Default (good balance)
- **500-1000ms**: Heavy validators (personal info, common passwords)

### Memoization

Memoize validator configs:

```typescript
import { useMemo } from 'react'

function MyForm() {
  const validatorConfig = useMemo(() => ({
    validators: {
      length: { min: 8 },
      characterTypes: { requireUppercase: true }
    }
  }), []) // Empty deps = created once

  const { value, isValid, handleChange } = usePasswordValidator(validatorConfig)
  
  // ...
}
```

## See Also

- [Core API Reference](/api/core)
- [React Components API](/api/react-components)
- [Live Examples](/examples/)
