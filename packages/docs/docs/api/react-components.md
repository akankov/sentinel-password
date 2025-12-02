# React Components API

The `@sentinel-password/react-components` package provides accessible, headless React components for password validation.

## Installation

```bash
npm install @sentinel-password/react-components
```

**Peer Dependencies:** 
- React 18+ or React 19+
- React DOM 18+ or React 19+

## Components

### `<PasswordInput />`

An accessible, headless password input component with built-in validation.

**Features:**
- ✅ WCAG 2.1 AAA compliant
- ✅ Full ARIA support
- ✅ Keyboard navigation
- ✅ Show/hide password toggle
- ✅ Real-time validation
- ✅ Completely unstyled (headless)
- ✅ Controlled and uncontrolled modes

## Props

```typescript
interface PasswordInputProps {
  // Validation
  validators?: ValidatorConfig['validators']
  validateOnMount?: boolean
  validateOnChange?: boolean
  debounceMs?: number
  
  // Labels & Descriptions
  label?: React.ReactNode
  description?: React.ReactNode
  
  // Toggle Button
  showToggleButton?: boolean
  toggleShowText?: string
  toggleHideText?: string
  
  // Validation Messages
  showValidationMessages?: boolean
  
  // Styling
  className?: string
  labelClassName?: string
  descriptionClassName?: string
  inputWrapperClassName?: string
  inputClassName?: string
  toggleButtonClassName?: string
  validationClassName?: string
  
  // State
  disabled?: boolean
  
  // Standard input props
  value?: string
  defaultValue?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  // ... all other HTMLInputElement props
}
```

### Prop Details

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `validators` | `ValidatorConfig['validators']` | `{}` | Validation configuration |
| `validateOnMount` | `boolean` | `false` | Validate on component mount |
| `validateOnChange` | `boolean` | `true` | Validate on input change |
| `debounceMs` | `number` | `300` | Debounce delay for validation |
| `label` | `ReactNode` | - | Label text or element |
| `description` | `ReactNode` | - | Helper text below label |
| `showToggleButton` | `boolean` | `true` | Show/hide password toggle |
| `toggleShowText` | `string` | `'Show password'` | Toggle button text (password hidden) |
| `toggleHideText` | `string` | `'Hide password'` | Toggle button text (password visible) |
| `showValidationMessages` | `boolean` | `true` | Display validation messages |
| `disabled` | `boolean` | `false` | Disable the input |
| `value` | `string` | - | Controlled value |
| `defaultValue` | `string` | - | Uncontrolled default value |
| `onChange` | `function` | - | Change event handler |

## Basic Usage

### Simple Example

```typescript
import { PasswordInput } from '@sentinel-password/react-components'

function SignupForm() {
  return (
    <form>
      <PasswordInput
        label="Create Password"
        validators={{
          length: { min: 8 },
          characterTypes: {
            requireUppercase: true,
            requireNumbers: true
          }
        }}
      />
    </form>
  )
}
```

### Controlled Component

```typescript
import { PasswordInput } from '@sentinel-password/react-components'
import { useState } from 'react'

function SignupForm() {
  const [password, setPassword] = useState('')

  return (
    <form>
      <PasswordInput
        label="Create Password"
        description="Must be at least 8 characters with uppercase and numbers"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        validators={{
          length: { min: 8, max: 128 },
          characterTypes: {
            requireUppercase: true,
            requireNumbers: true
          },
          commonPassword: { enabled: true }
        }}
      />
      
      <button type="submit" disabled={!password}>
        Create Account
      </button>
    </form>
  )
}
```

### Uncontrolled Component

```typescript
import { PasswordInput } from '@sentinel-password/react-components'
import { useRef } from 'react'

function SignupForm() {
  const passwordRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const password = passwordRef.current?.value
    console.log('Password:', password)
  }

  return (
    <form onSubmit={handleSubmit}>
      <PasswordInput
        ref={passwordRef}
        label="Create Password"
        defaultValue=""
        validators={{
          length: { min: 8 }
        }}
      />
      
      <button type="submit">Submit</button>
    </form>
  )
}
```

## Styling

### Custom CSS Classes

Apply your own styles using className props:

```typescript
<PasswordInput
  label="Password"
  className="password-field"
  labelClassName="password-label"
  inputClassName="password-input"
  validationClassName="password-errors"
  toggleButtonClassName="toggle-btn"
  validators={{ length: { min: 8 } }}
/>
```

### CSS Example

```css
.password-field {
  margin-bottom: 1rem;
}

.password-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.password-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.password-input:focus {
  outline: none;
  border-color: #3c8772;
  box-shadow: 0 0 0 3px rgba(60, 135, 114, 0.1);
}

.password-input[aria-invalid="true"] {
  border-color: #e53e3e;
}

.password-errors {
  margin-top: 0.5rem;
  color: #e53e3e;
  font-size: 0.875rem;
}

.toggle-btn {
  padding: 0.5rem;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.toggle-btn:hover {
  background-color: #f7f7f7;
}
```

### Tailwind CSS

```typescript
<PasswordInput
  label="Password"
  className="mb-4"
  labelClassName="block text-sm font-medium text-gray-700 mb-2"
  inputWrapperClassName="relative"
  inputClassName="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  toggleButtonClassName="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
  validationClassName="mt-2 text-sm text-red-600"
  validators={{ length: { min: 8 } }}
/>
```

### CSS-in-JS (Emotion, Styled Components)

```typescript
import styled from '@emotion/styled'

const StyledPasswordInput = styled(PasswordInput)`
  .password-input {
    width: 100%;
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    
    &:focus {
      border-color: #3c8772;
      box-shadow: 0 0 0 3px rgba(60, 135, 114, 0.1);
    }
    
    &[aria-invalid="true"] {
      border-color: #f44336;
    }
  }
`

function Form() {
  return (
    <StyledPasswordInput
      label="Password"
      validators={{ length: { min: 8 } }}
    />
  )
}
```

## Advanced Usage

### Custom Toggle Button Text

```typescript
<PasswordInput
  label="Password"
  toggleShowText="👁️ Reveal"
  toggleHideText="🙈 Conceal"
  validators={{ length: { min: 8 } }}
/>
```

### Without Toggle Button

```typescript
<PasswordInput
  label="Password"
  showToggleButton={false}
  validators={{ length: { min: 8 } }}
/>
```

### Without Validation Messages

```typescript
<PasswordInput
  label="Password"
  showValidationMessages={false}
  validators={{ length: { min: 8 } }}
/>
```

### Instant Validation

```typescript
<PasswordInput
  label="Password"
  debounceMs={0}
  validateOnMount={true}
  validators={{ length: { min: 8 } }}
/>
```

### Form Integration

```typescript
import { PasswordInput } from '@sentinel-password/react-components'
import { useState } from 'react'

function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      password: e.target.value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form data:', formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            email: e.target.value
          }))}
        />
      </div>
      
      <PasswordInput
        label="Password"
        value={formData.password}
        onChange={handlePasswordChange}
        validators={{
          length: { min: 12 },
          characterTypes: {
            requireUppercase: true,
            requireNumbers: true,
            requireSymbols: true
          },
          commonPassword: { enabled: true }
        }}
      />
      
      <button type="submit">Sign Up</button>
    </form>
  )
}
```

## Accessibility

The component is WCAG 2.1 AAA compliant with:

### Semantic HTML
- Proper `<label>` association with `htmlFor`
- `<input>` with appropriate `type` attribute
- Accessible `<button>` for toggle

### ARIA Attributes
- `aria-invalid` when validation fails
- `aria-describedby` linking input to description
- `aria-label` on toggle button
- `aria-pressed` state on toggle button
- `aria-live="polite"` for validation messages

### Keyboard Support
- `Tab` to navigate between elements
- `Escape` to clear input (when focused)
- `Space` or `Enter` to toggle password visibility

### Screen Reader Support
- Validation errors announced via live region
- Toggle button state announced
- Clear labels and descriptions

## TypeScript

Full TypeScript support:

```typescript
import { PasswordInput } from '@sentinel-password/react-components'
import type { PasswordInputProps } from '@sentinel-password/react-components'

const props: PasswordInputProps = {
  label: 'Password',
  validators: {
    length: { min: 8 }
  }
}

function MyComponent() {
  return <PasswordInput {...props} />
}
```

## See Also

- [Core API Reference](/api/core)
- [React Hook API](/api/react)
- [Accessibility Guide](/guide/accessibility)
- [Styling Examples](/examples/#custom-styling)
