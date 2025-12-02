# @sentinel-password/react-components

Accessible, headless React components for password validation built on top of `@sentinel-password/core` and `@sentinel-password/react`.

## Features

- **Headless & Unstyled** - Bring your own styles
- **WCAG 2.1 AAA** - Full accessibility compliance
- **Keyboard Navigation** - Complete keyboard support
- **TypeScript** - Full type safety
- **Lightweight** - Minimal bundle size
- **Flexible** - Controlled and uncontrolled modes

## Installation

```bash
npm install @sentinel-password/react-components
# or
pnpm add @sentinel-password/react-components
# or
yarn add @sentinel-password/react-components
```

## Quick Start

```tsx
import { PasswordInput } from '@sentinel-password/react-components'

function MyForm() {
  return (
    <form>
      <PasswordInput
        label="Password"
        onValidationChange={(result) => {
          console.log('Valid:', result.isValid)
        }}
      />
    </form>
  )
}
```

## API Reference

### PasswordInput

A headless password input component with built-in validation.

```tsx
<PasswordInput
  label="Password"
  description="Enter a strong password"
  onValidationChange={(result) => console.log(result)}
/>
```

#### Props

- `label` - Accessible label for the input
- `description` - Optional description text
- `onValidationChange` - Callback fired when validation state changes
- Standard HTML input props supported

## Accessibility

This component follows WCAG 2.1 AAA guidelines:

- Semantic HTML elements
- ARIA labels and descriptions
- Live regions for validation feedback
- Keyboard navigation support
- Focus management

## License

MIT © Aleksei Kankov
