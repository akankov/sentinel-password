# Validators

Comprehensive guide to all available password validators.

## Overview

Sentinel Password provides 7 built-in validators that can be mixed and matched to create your ideal password policy.

## Available Validators

### Length Validator

Controls minimum and maximum password length.

**Configuration:**
```typescript
{
  validators: {
    length: {
      min: 8,      // Minimum length (default: 8)
      max: 128     // Maximum length (default: 128)
    }
  }
}
```

**Error Codes:**
- `PASSWORD_TOO_SHORT` - Password is below minimum length
- `PASSWORD_TOO_LONG` - Password exceeds maximum length

**Example:**
```typescript
validatePassword('short', { validators: { length: { min: 8 } } })
// { isValid: false, errors: [{ code: 'PASSWORD_TOO_SHORT', ... }] }
```

### Character Types Validator

Requires specific character types (uppercase, lowercase, numbers, symbols).

**Configuration:**
```typescript
{
  validators: {
    characterTypes: {
      requireUppercase: true,   // Require at least one uppercase letter
      requireLowercase: true,   // Require at least one lowercase letter
      requireNumbers: true,     // Require at least one number
      requireSymbols: true,     // Require at least one symbol
      minUppercase: 2,          // Minimum uppercase letters
      minLowercase: 2,          // Minimum lowercase letters
      minNumbers: 2,            // Minimum numbers
      minSymbols: 2             // Minimum symbols
    }
  }
}
```

**Error Codes:**
- `MISSING_UPPERCASE` - Missing required uppercase letters
- `MISSING_LOWERCASE` - Missing required lowercase letters
- `MISSING_NUMBERS` - Missing required numbers
- `MISSING_SYMBOLS` - Missing required symbols

### Common Password Validator

Checks password against a list of 10,000+ commonly used passwords.

**Configuration:**
```typescript
{
  validators: {
    commonPassword: {
      enabled: true
    }
  }
}
```

**Error Codes:**
- `COMMON_PASSWORD` - Password is too common

**Examples of common passwords:**
- `password`, `123456`, `qwerty`
- `welcome`, `admin`, `letmein`
- Dictionary words like `monkey`, `dragon`

### Keyboard Pattern Validator

Detects keyboard patterns like `qwerty`, `asdfgh`.

**Configuration:**
```typescript
{
  validators: {
    keyboardPattern: {
      enabled: true,
      maxConsecutive: 5  // Max consecutive keyboard chars (default: 5)
    }
  }
}
```

**Error Codes:**
- `KEYBOARD_PATTERN` - Contains keyboard pattern

**Detected patterns:**
- `qwerty`, `asdfgh`, `zxcvbn`
- `!@#$%`, `12345`

### Sequential Validator

Detects sequential characters like `abc`, `123`, `xyz`.

**Configuration:**
```typescript
{
  validators: {
    sequential: {
      enabled: true,
      maxConsecutive: 3  // Max consecutive sequential chars (default: 3)
    }
  }
}
```

**Error Codes:**
- `SEQUENTIAL_CHARS` - Contains sequential characters

**Examples:**
- Alphabetic: `abc`, `xyz`, `fed` (reverse)
- Numeric: `123`, `456`, `987` (reverse)

### Repetition Validator

Detects repeated characters like `aaa`, `111`.

**Configuration:**
```typescript
{
  validators: {
    repetition: {
      enabled: true,
      maxConsecutive: 2  // Max consecutive repeated chars (default: 2)
    }
  }
}
```

**Error Codes:**
- `REPETITIVE_CHARS` - Too many repeated characters

**Examples:**
- `aaaaaa` - same character repeated
- `111111` - same number repeated

### Personal Info Validator

Checks if password contains personal information.

**Configuration:**
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

**Error Codes:**
- `CONTAINS_PERSONAL_INFO` - Password contains personal information

**Use cases:**
- Email addresses
- Names (first, last)
- Usernames
- Company names

## Combining Validators

Mix and match validators for comprehensive validation:

```typescript
const config = {
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
    repetition: { enabled: true },
    personalInfo: { 
      enabled: true,
      fields: ['user@example.com']
    }
  }
}
```

## See Also

- [Configuration Guide](/guide/configuration)
- [Core API](/api/core)
- [Getting Started](/guide/getting-started)
