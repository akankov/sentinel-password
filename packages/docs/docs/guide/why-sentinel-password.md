# Why Sentinel Password?

## The Problem

Password validation is a critical part of user authentication, but implementing it properly is surprisingly complex:

- **Inconsistent Standards**: Every app has different password requirements
- **Poor User Experience**: Cryptic error messages frustrate users
- **Accessibility Issues**: Many password validators fail WCAG compliance
- **Bundle Size**: Heavy libraries slow down your app
- **Rigid Implementations**: Hard to customize for your specific needs

## Our Solution

Sentinel Password provides a flexible, accessible, and lightweight solution for password validation:

### 🎯 Flexible & Configurable

Unlike rigid password validators, Sentinel Password lets you define exactly what makes a valid password for your application:

```typescript
// Enterprise app with strict requirements
const strictConfig = {
  minLength: 16,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true,
  // checkCommonPasswords and checkKeyboardPatterns default to true
}

// Consumer app with balanced requirements
const balancedConfig = {
  minLength: 8,
  requireDigit: true,
}
```

### ♿ Accessibility First

`PasswordInput` is designed to meet WCAG 2.1 AAA. The component provides:

- ✅ Semantic HTML with a `useId()`-linked `<label>`
- ✅ ARIA attributes managed for you (`aria-invalid`, `aria-describedby`, `aria-pressed` on the toggle)
- ✅ Live region (`role="alert" aria-live="polite"`) for validation announcements
- ✅ Keyboard support (Tab, Escape to clear, Space/Enter on toggle)
- ✅ Focus management for the component's own elements

Page-level conformance is the consumer's responsibility — contrast (AAA wants 7:1), surrounding markup, reduced-motion/forced-colors/focus-visible CSS, and localization of the bundled English toggle text. See the [Accessibility guide](/guide/accessibility) for the full split and the known gaps.

### 📦 Tiny Bundle Size

Core package is **~5.5 KB gzipped** with **zero dependencies** (CI fails if it exceeds 10 KB):

| Package | Size (gzipped) | Dependencies |
|---------|----------------|--------------|
| `@sentinel-password/core` | ~5.5 KB | Zero |
| `@sentinel-password/react` | ~0.7 KB | `@sentinel-password/core` (runtime, installed transitively); React 18/19 (peer) |
| `@sentinel-password/react-components` | ~1.7 KB | `@sentinel-password/core` (runtime, installed transitively); React 18/19 and React DOM 18/19 (peers) |
| `@sentinel-password/entropy` (optional) | ~28 KB | Zero |

Compare this to popular alternatives that can be 50KB+ with dozens of dependencies. The optional `entropy` package is intentionally separate so consumers only pay for it when they want crack-time estimation — zxcvbn ships ~400 KB unconditionally.

### 🎨 Headless Architecture

React components are completely unstyled, giving you full design control:

```tsx
<PasswordInput
  label="Password"
  containerClassName="my-input-wrapper"
  className="my-custom-input"
  labelClassName="my-custom-label"
  validationClassName="my-custom-error"
/>
```

Style it with CSS, Tailwind, CSS-in-JS, or any styling solution you prefer.

### 🌍 Pluggable i18n

Pass `messages` (template map keyed by stable `MessageCode`) or `formatMessage` (callback) to localize validator output — no manual lookup-table needed:

```typescript
import { validatePassword, type MessageCode } from '@sentinel-password/core'

// Pattern 1 — template overrides
const result = validatePassword('weak', {
  messages: {
    'length.tooShort': 'La contraseña debe tener al menos {minLength} caracteres',
  } satisfies Partial<Record<MessageCode, string>>,
})

// Pattern 2 — plug into react-intl / i18next / FormatJS
validatePassword('weak', {
  formatMessage: (code, params, defaultMessage) =>
    intl.formatMessage({ id: `sentinelPassword.${code}`, defaultMessage }, params),
})
```

The legacy lookup-table workaround still works (default English strings are stable), but new code should prefer the explicit options above. See the [i18n guide](/guide/i18n) for full coverage.

### 🔒 Security Focused

Helps users create stronger passwords by checking for:

- ✅ Common passwords (top 1,000 most common passwords, O(1) Bloom-filter lookup)
- ✅ Keyboard patterns (`qwerty`, `asdfgh`)
- ✅ Sequential characters (`abc123`, `987654`)
- ✅ Repetitive patterns (`aaaaaa`, `111111`)
- ✅ Personal information (name, email)

### ⚡ Framework Agnostic

Use the core package with any framework:

```typescript
// Vue
import { ref, computed } from 'vue'
import { validatePassword } from '@sentinel-password/core'

const password = ref('')
const validation = computed(() => 
  validatePassword(password.value, config)
)

// Angular
import { validatePassword } from '@sentinel-password/core'

validatePassword(this.passwordControl.value, config)

// Svelte
import { validatePassword } from '@sentinel-password/core'

$: validation = validatePassword(password, config)
```

### ✨ TypeScript First

Written in TypeScript with comprehensive type definitions:

```typescript
import type {
  ValidationResult,
  ValidatorOptions,
  StrengthScore,
  StrengthLabel,
} from '@sentinel-password/core'

// Full IntelliSense and type checking
const options: ValidatorOptions = {
  minLength: 8, // TypeScript knows all available options
  requireUppercase: true,
}
```

## Comparison

| Feature | Sentinel Password | Traditional Regex | Other Libraries |
|---------|-------------------|-------------------|-----------------|
| Bundle Size | ~5.5 KB | N/A | 20-100KB+ |
| Dependencies | 0 | 0 | 5-50+ |
| Accessibility | Designed for AAA | ❌ | Varies |
| Customizable | ✅ Full control | ⚠️ Limited | ⚠️ Partial |
| React Support | ✅ Native hooks | ❌ | ⚠️ Varies |
| TypeScript | ✅ Full types | N/A | ⚠️ Varies |
| Common Password Check | ✅ | ❌ | ⚠️ Sometimes |
| Pattern Detection | ✅ | ❌ | ⚠️ Sometimes |

## Real-World Benefits

### Better User Experience

Clear, actionable error messages help users succeed:

```typescript
// ❌ Bad: "Password invalid"
// ✅ Good: "Password must be at least 8 characters long"
```

### Reduced Support Burden

Users understand password requirements upfront, reducing support tickets.

### Improved Security

Pattern detection and common password checks help users create stronger passwords.

### Faster Development

Pre-built components and hooks save development time:

```tsx
// Instead of building from scratch...
import { PasswordInput } from '@sentinel-password/react-components'

// Just use it!
<PasswordInput label="Password" />
```

## Get Started

Ready to try Sentinel Password?

- [Installation Guide](/guide/installation)
- [Getting Started](/guide/getting-started)
- [API Reference](/api/core)
- [Live Examples](/examples/)
