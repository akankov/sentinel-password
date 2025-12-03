# Vite + React Example

This example demonstrates how to integrate **Sentinel Password** into a Vite + React application.

## Features

- Simple login form with email and password
- Real-time password validation
- Show/hide password toggle
- WCAG 2.1 AAA accessible
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

<PasswordInput
  label="Password"
  description="Must be at least 8 characters long"
  value={password}
  onChange={setPassword}
  onValidationChange={(result) => {
    console.log('Valid:', result.valid)
  }}
/>
```

## Learn More

- [Sentinel Password Documentation](https://akankov.github.io/sentinel-password/)
- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
