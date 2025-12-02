# Configuration

Learn how to configure Sentinel Password for your specific requirements.

## Basic Configuration

The simplest configuration uses a single validator:

```typescript
import { validatePassword } from '@sentinel-password/core'

const config = {
  validators: {
    length: { min: 8 }
  }
}

const result = validatePassword('mypassword', config)
```

## Configuration Presets

### Minimal (Low Security)

Suitable for low-risk applications:

```typescript
const minimalConfig = {
  validators: {
    length: { min: 6 }
  }
}
```

### Balanced (Medium Security)

Good balance between security and usability:

```typescript
const balancedConfig = {
  validators: {
    length: { min: 8, max: 128 },
    characterTypes: {
      requireUppercase: true,
      requireNumbers: true
    }
  }
}
```

### Strict (High Security)

For enterprise or high-security applications:

```typescript
const strictConfig = {
  validators: {
    length: { min: 12, max: 128 },
    characterTypes: {
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
      minSymbols: 2
    },
    commonPassword: { enabled: true },
    keyboardPattern: { enabled: true },
    sequential: { enabled: true },
    repetition: { enabled: true }
  }
}
```

### Maximum (Very High Security)

All validators enabled with strict settings:

```typescript
const maximumConfig = {
  validators: {
    length: { min: 16, max: 128 },
    characterTypes: {
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
      minUppercase: 2,
      minLowercase: 2,
      minNumbers: 2,
      minSymbols: 2
    },
    commonPassword: { enabled: true },
    keyboardPattern: { 
      enabled: true,
      maxConsecutive: 3
    },
    sequential: { 
      enabled: true,
      maxConsecutive: 2
    },
    repetition: { 
      enabled: true,
      maxConsecutive: 2
    },
    personalInfo: { 
      enabled: true,
      fields: [] // Add user's personal info
    }
  }
}
```

## Environment-Based Configuration

Adjust configuration based on environment:

```typescript
const getConfig = (env: 'dev' | 'staging' | 'prod') => {
  if (env === 'dev') {
    return { validators: { length: { min: 4 } } }
  }
  
  if (env === 'staging') {
    return {
      validators: {
        length: { min: 8 },
        characterTypes: { requireUppercase: true }
      }
    }
  }
  
  // Production
  return {
    validators: {
      length: { min: 12 },
      characterTypes: {
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: true
      },
      commonPassword: { enabled: true }
    }
  }
}

const config = getConfig(process.env.NODE_ENV)
```

## Dynamic Configuration

Update configuration based on user context:

```typescript
const getUserConfig = (user: User) => {
  const baseConfig = {
    validators: {
      length: { min: 8 },
      characterTypes: {
        requireUppercase: true,
        requireNumbers: true
      }
    }
  }
  
  // Add personal info validation
  if (user.email || user.name) {
    baseConfig.validators.personalInfo = {
      enabled: true,
      fields: [
        user.email,
        user.firstName,
        user.lastName
      ].filter(Boolean)
    }
  }
  
  // Stricter for admin users
  if (user.role === 'admin') {
    baseConfig.validators.length = { min: 16 }
    baseConfig.validators.characterTypes.requireSymbols = true
    baseConfig.validators.commonPassword = { enabled: true }
  }
  
  return baseConfig
}
```

## Debounce Configuration

Control when validation runs:

```typescript
// React Hook
usePasswordValidator({
  validators: config,
  debounceMs: 300  // Wait 300ms after typing stops
})

// React Component
<PasswordInput
  validators={config}
  debounceMs={500}  // Wait 500ms
/>

// No debounce (instant validation)
<PasswordInput
  validators={config}
  debounceMs={0}
/>
```

## Validation Timing

Control when validation occurs:

```typescript
// Validate on mount
<PasswordInput
  validators={config}
  validateOnMount={true}
/>

// Validate only on blur (not on change)
<PasswordInput
  validators={config}
  validateOnChange={false}
  onBlur={(e) => {
    // Trigger validation manually
  }}
/>
```

## Error Customization

Customize error messages:

```typescript
const result = validatePassword(password, config)

const errorMessages = {
  PASSWORD_TOO_SHORT: 'Your password needs more characters',
  MISSING_UPPERCASE: 'Add at least one capital letter',
  MISSING_NUMBERS: 'Include some numbers',
  COMMON_PASSWORD: 'This password is too easy to guess'
}

const customErrors = result.errors.map(error => ({
  ...error,
  message: errorMessages[error.code] || error.message
}))
```

## Internationalization

Support multiple languages:

```typescript
const translations = {
  en: {
    PASSWORD_TOO_SHORT: 'Password must be at least {min} characters',
    MISSING_UPPERCASE: 'Password must contain uppercase letters'
  },
  es: {
    PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos {min} caracteres',
    MISSING_UPPERCASE: 'La contraseña debe contener letras mayúsculas'
  }
}

const getLocalizedErrors = (errors, locale = 'en') => {
  return errors.map(error => ({
    ...error,
    message: translations[locale][error.code] || error.message
  }))
}
```

## Best Practices

### 1. Don't Over-Restrict

Balance security with usability:

```typescript
// ❌ Too restrictive
{
  validators: {
    length: { min: 32, max: 32 },  // Exactly 32 chars
    characterTypes: {
      minUppercase: 5,
      minLowercase: 5,
      minNumbers: 5,
      minSymbols: 5
    }
  }
}

// ✅ Better balance
{
  validators: {
    length: { min: 12, max: 128 },
    characterTypes: {
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: true
    }
  }
}
```

### 2. Enable Common Password Check

Always check for common passwords:

```typescript
{
  validators: {
    commonPassword: { enabled: true }
  }
}
```

### 3. Consider Context

Adjust requirements based on what's being protected:

- **Blog comments**: Minimal requirements
- **E-commerce**: Balanced requirements
- **Banking/Healthcare**: Strict requirements
- **Admin panels**: Maximum requirements

### 4. Provide Clear Feedback

Show requirements upfront:

```typescript
<PasswordInput
  label="Create Password"
  description="Must be 12+ characters with uppercase, numbers, and symbols"
  validators={config}
/>
```

## See Also

- [Validators Guide](/guide/validators)
- [Core API](/api/core)
- [Getting Started](/guide/getting-started)
