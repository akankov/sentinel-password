# @sentinel-password/core

[![npm version](https://img.shields.io/npm/v/@sentinel-password/core.svg)](https://www.npmjs.com/package/@sentinel-password/core)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@sentinel-password/core)](https://bundlephobia.com/package/@sentinel-password/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Modern TypeScript password validation library with zero dependencies, comprehensive validation rules, and rich feedback.

## Features

- **Zero Dependencies** - No external dependencies, tree-shakeable, ~5.5KB gzipped
- **TypeScript-First** - Full type safety with strict mode enabled
- **Rich Feedback** - Actionable suggestions for password improvement
- **Comprehensive Validation** - 7 built-in validators covering OWASP best practices
- **Flexible API** - Zero-config defaults with full customization options
- **Framework Agnostic** - Works in Node.js, browsers, and any JavaScript environment

## Installation

```bash
npm install @sentinel-password/core
```

```bash
pnpm add @sentinel-password/core
```

```bash
yarn add @sentinel-password/core
```

## Quick Start

```typescript
import { validatePassword } from '@sentinel-password/core'

const result = validatePassword('MySecure!Pass_w0rd')

if (result.valid) {
  console.log('Password is valid!')
  console.log(`Strength: ${result.strength}`) // 'very-strong'
  console.log(`Score: ${result.score}`) // 4
} else {
  console.log('Password is invalid')
  console.log(result.feedback.warning) // First suggestion
  result.feedback.suggestions.forEach(suggestion => {
    console.log(`- ${suggestion}`)
  })
}
```

## Validation Result

The `validatePassword` function returns a comprehensive validation result:

```typescript
interface ValidationResult {
  // Overall validation status
  valid: boolean
  
  // Strength scoring
  score: 0 | 1 | 2 | 3 | 4
  strength: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong'
  
  // User feedback
  feedback: {
    warning?: string              // Primary warning message
    suggestions: readonly string[] // All improvement suggestions
  }
  
  // Individual check results
  checks: {
    length: boolean             // Meets length requirements
    characterTypes: boolean     // Meets character type requirements
    repetition: boolean         // No excessive repeated characters
    sequential: boolean         // No sequential patterns (abc, 123)
    keyboardPattern: boolean    // No keyboard patterns (qwerty, asdf)
    commonPassword: boolean     // Not in top 1K common passwords
    personalInfo: boolean       // Doesn't contain personal information
  }
}
```

## Configuration Options

Customize validation rules to match your requirements:

```typescript
const result = validatePassword('MyPassword123!', {
  // Length constraints
  minLength: 12,              // default: 8
  maxLength: 128,             // default: 128
  
  // Character requirements
  requireUppercase: true,     // default: false
  requireLowercase: true,     // default: false
  requireDigit: true,         // default: false
  requireSymbol: true,        // default: false
  
  // Pattern detection
  maxRepeatedChars: 3,        // default: 3
  checkSequential: true,      // default: true
  checkKeyboardPatterns: true, // default: true
  checkCommonPasswords: true, // default: true
  
  // Personal information exclusion
  personalInfo: [
    'johndoe',
    'john.doe@example.com'
  ]
})
```

## Usage Examples

### Basic Validation

```typescript
import { validatePassword } from '@sentinel-password/core'

// Valid password
const result1 = validatePassword('Tr0ub4dor&3')
console.log(result1.valid) // true
console.log(result1.strength) // 'strong'

// Invalid password (too short)
const result2 = validatePassword('pass')
console.log(result2.valid) // false
console.log(result2.feedback.warning) // 'Password must be at least 8 characters'
```

### Custom Requirements

```typescript
import { validatePassword } from '@sentinel-password/core'

// Require strong passwords with all character types
const result = validatePassword('password', {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true
})

console.log(result.valid) // false
console.log(result.checks.length) // false
console.log(result.checks.characterTypes) // false
console.log(result.feedback.suggestions)
// [
//   'Password must be at least 12 characters',
//   'Add uppercase letters',
//   'Add numbers',
//   'Add special characters (!@#$%^&*)'
// ]
```

### Blocking Personal Information

```typescript
import { validatePassword } from '@sentinel-password/core'

const result = validatePassword('alice2024', {
  personalInfo: ['alice', 'alice@example.com']
})

console.log(result.valid) // false
console.log(result.checks.personalInfo) // false
console.log(result.feedback.warning)
// 'Password contains personal information'
```

### Detecting Common Patterns

```typescript
import { validatePassword } from '@sentinel-password/core'

// Sequential patterns
const result1 = validatePassword('password123')
console.log(result1.checks.sequential) // false

// Keyboard patterns
const result2 = validatePassword('qwerty2024')
console.log(result2.checks.keyboardPattern) // false

// Common passwords
const result3 = validatePassword('password')
console.log(result3.checks.commonPassword) // false

// Excessive repetition
const result4 = validatePassword('passssword')
console.log(result4.checks.repetition) // false
```

### Signup Form Example

```typescript
import { validatePassword } from '@sentinel-password/core'

function handleSignup(formData: {
  email: string
  username: string
  password: string
}) {
  const result = validatePassword(formData.password, {
    minLength: 10,
    requireUppercase: true,
    requireLowercase: true,
    requireDigit: true,
    personalInfo: [formData.email, formData.username]
  })
  
  if (!result.valid) {
    return {
      success: false,
      errors: result.feedback.suggestions
    }
  }
  
  return {
    success: true,
    passwordStrength: result.strength
  }
}
```

## Advanced Usage

### Individual Validators

For fine-grained control, import and use individual validators:

```typescript
import {
  validateLength,
  validateCharacterTypes,
  validateRepetition,
  validateSequential,
  validateKeyboardPattern,
  validateCommonPassword,
  validatePersonalInfo
} from '@sentinel-password/core'

const password = 'MyPassword123'

// Check individual constraints
const lengthCheck = validateLength(password, { minLength: 12 })
console.log(lengthCheck.passed) // false
console.log(lengthCheck.message) // 'Password must be at least 12 characters'

const charTypeCheck = validateCharacterTypes(password, {
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true
})
console.log(charTypeCheck.passed) // false
console.log(charTypeCheck.message) // 'Add special characters (!@#$%^&*)'
```

### Character Type Helpers

```typescript
import {
  hasUppercase,
  hasLowercase,
  hasDigit,
  hasSymbol
} from '@sentinel-password/core'

const password = 'MyPassword123!'

console.log(hasUppercase(password)) // true
console.log(hasLowercase(password)) // true
console.log(hasDigit(password))     // true
console.log(hasSymbol(password))    // true
```

## TypeScript

The library is written in TypeScript with full type definitions included:

```typescript
import type {
  ValidationResult,
  ValidatorOptions,
  ValidatorCheck,
  StrengthScore,
  StrengthLabel,
  CheckId
} from '@sentinel-password/core'

const options: ValidatorOptions = {
  minLength: 10,
  requireUppercase: true
}

const result: ValidationResult = validatePassword('test', options)
const score: StrengthScore = result.score // 0 | 1 | 2 | 3 | 4
const strength: StrengthLabel = result.strength // 'very-weak' | 'weak' | ...
```

## Validation Rules

### 1. Length Validation

- Default: 8-128 characters
- Configurable via `minLength` and `maxLength`

### 2. Character Types

- Optional requirements for uppercase, lowercase, digits, and symbols
- Configurable via `requireUppercase`, `requireLowercase`, `requireDigit`, `requireSymbol`

### 3. Repetition Detection

- Blocks excessive repeated characters (e.g., "aaaa")
- Default: max 3 repeated characters
- Configurable via `maxRepeatedChars`

### 4. Sequential Pattern Detection

- Blocks sequential patterns (e.g., "abc", "123", "xyz")
- Works forward and backward
- Configurable via `checkSequential`

### 5. Keyboard Pattern Detection

- Blocks common keyboard patterns (e.g., "qwerty", "asdf", "zxcvbn")
- Supports QWERTY, AZERTY, and QWERTZ layouts
- Configurable via `checkKeyboardPatterns`

### 6. Common Password Detection

- Blocks top 1,000 most common passwords
- Uses bloom filter for efficient memory usage
- Configurable via `checkCommonPasswords`

### 7. Personal Information Detection

- Blocks passwords containing personal info (username, email, etc.)
- Extracts username from email addresses
- Configurable via `personalInfo` array

## Bundle Size

- **ESM**: ~16KB uncompressed, ~5.5KB gzipped
- **CJS**: ~17KB uncompressed, ~6KB gzipped
- **Zero dependencies** - no additional packages needed
- **Tree-shakeable** - only import what you use

## Browser Support

Works in all modern browsers and Node.js environments:

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Node.js 18+

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for details.

## License

MIT - see [LICENSE](../../LICENSE) for details.

## Related Packages

- `@sentinel-password/react` - React hooks and components (coming soon)

## Acknowledgments

Inspired by [zxcvbn](https://github.com/dropbox/zxcvbn) and modern password validation best practices from [OWASP](https://owasp.org/www-project-proactive-controls/).
