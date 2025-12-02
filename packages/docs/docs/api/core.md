# Core Package API

The `@sentinel-password/core` package provides the foundational password validation functionality.

## Installation

```bash
npm install @sentinel-password/core
```

## Main Functions

### `validatePassword()`

Validates a password against configured validators.

**Signature:**
```typescript
function validatePassword(
  password: string,
  config: ValidatorConfig
): ValidationResult
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `password` | `string` | The password to validate |
| `config` | `ValidatorConfig` | Validation configuration |

**Returns:** `ValidationResult`

```typescript
interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  strength: PasswordStrength // 'weak' | 'medium' | 'strong'
}
```

**Example:**

```typescript
import { validatePassword } from '@sentinel-password/core'

const result = validatePassword('MyP@ssw0rd!', {
  validators: {
    length: { min: 8, max: 128 },
    characterTypes: {
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true
    }
  }
})

console.log(result)
// {
//   isValid: true,
//   errors: [],
//   warnings: [],
//   strength: 'strong'
// }
```

## Types

### `ValidatorConfig`

Main configuration object for validators:

```typescript
interface ValidatorConfig {
  validators: {
    length?: LengthValidatorConfig
    characterTypes?: CharacterTypesValidatorConfig
    commonPassword?: CommonPasswordValidatorConfig
    keyboardPattern?: KeyboardPatternValidatorConfig
    sequential?: SequentialValidatorConfig
    repetition?: RepetitionValidatorConfig
    personalInfo?: PersonalInfoValidatorConfig
  }
}
```

### `ValidationError`

Represents a validation error or warning:

```typescript
interface ValidationError {
  code: string
  message: string
  severity: 'error' | 'warning'
  validator: string
}
```

**Common Error Codes:**

| Code | Validator | Description |
|------|-----------|-------------|
| `PASSWORD_TOO_SHORT` | length | Password is below minimum length |
| `PASSWORD_TOO_LONG` | length | Password exceeds maximum length |
| `MISSING_UPPERCASE` | characterTypes | Missing uppercase letters |
| `MISSING_LOWERCASE` | characterTypes | Missing lowercase letters |
| `MISSING_NUMBERS` | characterTypes | Missing numbers |
| `MISSING_SYMBOLS` | characterTypes | Missing symbols |
| `COMMON_PASSWORD` | commonPassword | Password is too common |
| `KEYBOARD_PATTERN` | keyboardPattern | Contains keyboard pattern |
| `SEQUENTIAL_CHARS` | sequential | Contains sequential characters |
| `REPETITIVE_CHARS` | repetition | Contains too many repeated characters |
| `CONTAINS_PERSONAL_INFO` | personalInfo | Contains personal information |

### `PasswordStrength`

Password strength indicator:

```typescript
type PasswordStrength = 'weak' | 'medium' | 'strong'
```

Strength is calculated based on:
- Password length
- Character diversity (uppercase, lowercase, numbers, symbols)
- Absence of common patterns
- Overall validator pass rate

## Validator Configurations

### Length Validator

Controls password length requirements:

```typescript
interface LengthValidatorConfig {
  min?: number  // Minimum length (default: 8)
  max?: number  // Maximum length (default: 128)
}
```

**Example:**
```typescript
{
  validators: {
    length: { min: 12, max: 64 }
  }
}
```

### Character Types Validator

Requires specific character types:

```typescript
interface CharacterTypesValidatorConfig {
  requireUppercase?: boolean
  requireLowercase?: boolean
  requireNumbers?: boolean
  requireSymbols?: boolean
  minUppercase?: number
  minLowercase?: number
  minNumbers?: number
  minSymbols?: number
}
```

**Example:**
```typescript
{
  validators: {
    characterTypes: {
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
      minSymbols: 2
    }
  }
}
```

### Common Password Validator

Checks against common password list:

```typescript
interface CommonPasswordValidatorConfig {
  enabled: boolean
}
```

**Example:**
```typescript
{
  validators: {
    commonPassword: { enabled: true }
  }
}
```

### Keyboard Pattern Validator

Detects keyboard patterns like "qwerty":

```typescript
interface KeyboardPatternValidatorConfig {
  enabled: boolean
  maxConsecutive?: number  // Max consecutive keyboard chars (default: 5)
}
```

**Example:**
```typescript
{
  validators: {
    keyboardPattern: { 
      enabled: true,
      maxConsecutive: 3
    }
  }
}
```

### Sequential Validator

Detects sequential characters like "abc" or "123":

```typescript
interface SequentialValidatorConfig {
  enabled: boolean
  maxConsecutive?: number  // Max consecutive sequential chars (default: 3)
}
```

**Example:**
```typescript
{
  validators: {
    sequential: { 
      enabled: true,
      maxConsecutive: 3
    }
  }
}
```

### Repetition Validator

Detects repeated characters like "aaa":

```typescript
interface RepetitionValidatorConfig {
  enabled: boolean
  maxConsecutive?: number  // Max consecutive repeated chars (default: 2)
}
```

**Example:**
```typescript
{
  validators: {
    repetition: { 
      enabled: true,
      maxConsecutive: 2
    }
  }
}
```

### Personal Info Validator

Checks for personal information in password:

```typescript
interface PersonalInfoValidatorConfig {
  enabled: boolean
  fields?: string[]  // Personal info to check against
}
```

**Example:**
```typescript
{
  validators: {
    personalInfo: { 
      enabled: true,
      fields: ['john.doe@example.com', 'John', 'Doe']
    }
  }
}
```

## Advanced Usage

### Custom Error Messages

Customize error messages for your application:

```typescript
const result = validatePassword('weak', config)

const customErrors = result.errors.map(error => ({
  ...error,
  message: errorMessages[error.code] || error.message
}))
```

### Combining Multiple Validators

Mix and match validators for comprehensive validation:

```typescript
const strictConfig = {
  validators: {
    length: { min: 12, max: 128 },
    characterTypes: {
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true
    },
    commonPassword: { enabled: true },
    keyboardPattern: { enabled: true },
    sequential: { enabled: true },
    repetition: { enabled: true }
  }
}
```

### Strength-Based Logic

Use password strength for conditional logic:

```typescript
const result = validatePassword(password, config)

if (result.strength === 'weak' && result.isValid) {
  // Show warning but allow weak passwords
  console.warn('Password is valid but weak')
} else if (result.strength === 'strong') {
  // Reward strong passwords
  console.log('Excellent password!')
}
```

## See Also

- [React Hook API](/api/react)
- [React Components API](/api/react-components)
- [Validator Details](/guide/validators)
- [Configuration Guide](/guide/configuration)
