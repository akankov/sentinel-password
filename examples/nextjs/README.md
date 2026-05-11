# Next.js Example

This example demonstrates how to integrate **Sentinel Password** into a Next.js 16+ application using the App Router.

## Features

- Signup form with name, email, and password
- Real-time password validation with visual feedback
- Show/hide password toggle
- The `PasswordInput` component (from `@sentinel-password/react-components`) is WCAG 2.1 AAA compliant. The surrounding example app is a demo shell — placeholder navigation has been replaced with documentation links to keep the demo honest.
- Modern, responsive design with Tailwind CSS

## Getting Started

Run these commands from the **repo root** (not from inside this directory). The workspace is set up so `pnpm --filter nextjs <script>` runs only this example.

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm --filter nextjs dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

> A bare `pnpm dev` from the repo root is `turbo run dev`, which fans out to every workspace with a `dev` script — the docs site plus all four example apps. (Storybooks are separate root scripts — `pnpm storybook` / `pnpm storybook:components` — not `dev` tasks, so they aren't included.) Almost never what you want.

## Usage

The example uses the `@sentinel-password/react-components` package. The validation result is held in state and used to gate the submit button — passwords that fail any built-in check are not submittable.

```tsx
'use client'

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

<button type="submit" disabled={!passwordValid}>Create Account</button>
```

> **Don't log validation results in production.** This example deliberately stores
> only `result.valid` rather than the full `result`. The full result includes
> password-derived inferences (`checks`, `feedback.suggestions`) — even though the
> password literal is never logged, leaking the failure shape can help an attacker
> who later obtains the logs.

## Learn More

- [Sentinel Password Documentation](https://akankov.github.io/sentinel-password/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
