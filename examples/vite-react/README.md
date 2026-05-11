# Vite + React Example

This example demonstrates how to integrate **Sentinel Password** into a Vite + React application.

## Features

- Simple login form with email and password
- Real-time password validation
- Show/hide password toggle
- The `PasswordInput` component (from `@sentinel-password/react-components`) is WCAG 2.1 AAA compliant. The surrounding example app is a demo shell — success feedback uses an in-page status region (not `alert()`) and placeholder navigation links have been replaced with documentation links to keep the demo honest.
- Beautiful, responsive design

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## Usage

The example uses the `@sentinel-password/react-components` package:

```tsx
import { PasswordInput } from '@sentinel-password/react-components'
import { useState } from 'react'

const [password, setPassword] = useState('')
const [passwordValid, setPasswordValid] = useState(false)

<PasswordInput
  label="Password"
  description="At least 8 characters; avoids common passwords and obvious patterns"
  value={password}
  onChange={setPassword}
  onValidationChange={(result) => setPasswordValid(result.valid)}
/>

<button type="submit" disabled={!passwordValid}>Login</button>
```

> **Don't log validation results in production.** This example deliberately stores
> only `result.valid` rather than the full `result`. The full result includes
> password-derived inferences (`checks`, `feedback.suggestions`) — leaking the
> failure shape from logs can help an attacker.

## Learn More

- [Sentinel Password Documentation](https://akankov.github.io/sentinel-password/)
- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
