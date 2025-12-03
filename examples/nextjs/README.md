# Next.js Example

This example demonstrates how to integrate **Sentinel Password** into a Next.js 15+ application using the App Router.

## Features

- Signup form with name, email, and password
- Real-time password validation with visual feedback
- Show/hide password toggle
- WCAG 2.1 AAA accessible
- Modern, responsive design with Tailwind CSS

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Usage

The example uses the `@sentinel-password/react-components` package:

```tsx
'use client'

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
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
