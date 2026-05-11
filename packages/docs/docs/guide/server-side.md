# Server-Side Usage

`@sentinel-password/core` is fully isomorphic. The same package you use in the browser runs unchanged in Node.js, Bun, Deno, Cloudflare Workers, Vercel Edge, and any other JavaScript runtime — no separate "backend" package is needed.

This guide shows how to wire it into the most common server stacks and highlights the security boundary you still own.

## Why Core Works on the Server

| Concern | Status |
|---------|--------|
| Browser-only APIs (`window`, `document`, DOM, `localStorage`) | None used |
| Node-only APIs (`fs`, `node:crypto`) | None used |
| Module formats | Ships ESM (`dist/index.js`) **and** CommonJS (`dist/index.cjs`) |
| Production dependencies | Zero |
| Side effects | `sideEffects: false` — fully tree-shakeable |
| Validators | Pure string operations (regex, `indexOf`, `toLowerCase`) |
| Common-password lookup | Precomputed `Int32Array` Bloom filter — no runtime crypto |

Because nothing in core touches the host environment, importing it on the server is a no-op for compatibility — there is no shim, polyfill, or build flag to set.

## Install

You only need the core package server-side. The React packages exist for client-side rendering and bring React as a peer dependency, so skip them on the server.

::: code-group
```bash [pnpm]
pnpm add @sentinel-password/core
```

```bash [npm]
npm install @sentinel-password/core
```

```bash [yarn]
yarn add @sentinel-password/core
```
:::

## Express

Validate the password at the boundary of your signup or password-change route. Pass the user's `email`, `name`, and any other identifying fields as `personalInfo` so the validator rejects passwords that contain them.

```typescript
import express from 'express'
import { validatePassword } from '@sentinel-password/core'

const app = express()
app.use(express.json())

app.post('/signup', (req, res) => {
  const { email, name, password } = req.body

  const result = validatePassword(password, {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireDigit: true,
    requireSymbol: true,
    personalInfo: [email, name],
  })

  if (!result.valid) {
    return res.status(400).json({
      ok: false,
      strength: result.strength,
      warning: result.feedback.warning,
      suggestions: result.feedback.suggestions,
    })
  }

  // Hash with argon2/bcrypt and persist — see "Security Boundary" below.
  return res.status(201).json({ ok: true, strength: result.strength })
})
```

A runnable version of this example lives at [`examples/express-backend`](https://github.com/akankov/sentinel-password/tree/main/examples/express-backend) in the repository.

## Fastify

```typescript
import Fastify from 'fastify'
import { validatePassword } from '@sentinel-password/core'

const app = Fastify()

app.post<{ Body: { email: string; name: string; password: string } }>(
  '/signup',
  async (req, reply) => {
    const { email, name, password } = req.body

    const result = validatePassword(password, {
      minLength: 12,
      requireUppercase: true,
      requireDigit: true,
      requireSymbol: true,
      personalInfo: [email, name],
    })

    if (!result.valid) {
      return reply.code(400).send({
        ok: false,
        strength: result.strength,
        suggestions: result.feedback.suggestions,
      })
    }

    return reply.code(201).send({ ok: true, strength: result.strength })
  }
)
```

## NestJS

Wrap validation in an injectable service so any controller can use it. This keeps the password-policy configuration in one place.

```typescript
import { Injectable, BadRequestException } from '@nestjs/common'
import { validatePassword, type ValidatorOptions } from '@sentinel-password/core'

@Injectable()
export class PasswordPolicy {
  private readonly options: ValidatorOptions = {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireDigit: true,
    requireSymbol: true,
  }

  assertValid(password: string, personalInfo: string[] = []): void {
    const result = validatePassword(password, { ...this.options, personalInfo })
    if (!result.valid) {
      throw new BadRequestException({
        message: result.feedback.warning ?? 'Password is too weak',
        suggestions: result.feedback.suggestions,
      })
    }
  }
}
```

```typescript
@Controller('signup')
export class SignupController {
  constructor(private readonly policy: PasswordPolicy) {}

  @Post()
  signup(@Body() body: { email: string; name: string; password: string }) {
    this.policy.assertValid(body.password, [body.email, body.name])
    // ...hash and persist
  }
}
```

## Edge Runtimes

The same import works in Cloudflare Workers, Vercel Edge Functions, Deno, and Bun — no special build configuration. Because core uses no Node built-ins, edge runtimes that omit `node:*` modules import it without errors.

::: code-group
```typescript [Cloudflare Workers]
import { validatePassword } from '@sentinel-password/core'

export default {
  async fetch(request: Request): Promise<Response> {
    const { email, name, password } = await request.json()
    const result = validatePassword(password, {
      minLength: 12,
      personalInfo: [email, name],
    })
    return Response.json(result, { status: result.valid ? 201 : 400 })
  },
}
```

```typescript [Bun]
import { validatePassword } from '@sentinel-password/core'

Bun.serve({
  port: 3000,
  async fetch(req) {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
    const { email, name, password } = await req.json()
    const result = validatePassword(password, { minLength: 12, personalInfo: [email, name] })
    return Response.json(result, { status: result.valid ? 201 : 400 })
  },
})
```

```typescript [Deno]
import { validatePassword } from 'npm:@sentinel-password/core'

Deno.serve(async (req) => {
  const { email, name, password } = await req.json()
  const result = validatePassword(password, { minLength: 12, personalInfo: [email, name] })
  return Response.json(result, { status: result.valid ? 201 : 400 })
})
```
:::

## Security Boundary

::: warning Strength validation is not storage
`validatePassword()` answers "is this password strong enough?" — it does **not** prepare the password for storage. A complete signup flow always:

1. **Hashes** the accepted password with [Argon2id](https://github.com/ranisalt/node-argon2) (preferred) or bcrypt before persisting it. Never store plaintext or reversible encryption.
2. **Transports** over HTTPS so the password is not exposed in flight.
3. **Rate-limits** signup, login, and password-change endpoints to slow online guessing.
4. **Never logs the password**, even at debug level. The library itself never logs passwords; your application code shouldn't either.
:::

A reasonable layered approach:

```typescript
import argon2 from 'argon2'
import { validatePassword } from '@sentinel-password/core'

async function createAccount(email: string, name: string, password: string) {
  const result = validatePassword(password, {
    minLength: 12,
    requireUppercase: true,
    requireDigit: true,
    requireSymbol: true,
    personalInfo: [email, name],
  })
  if (!result.valid) {
    throw new Error(result.feedback.warning ?? 'Password too weak')
  }

  const hash = await argon2.hash(password, { type: argon2.argon2id })
  await db.users.insert({ email, name, passwordHash: hash })
}
```

## Symmetry With the Client

You can run the **same** validation on the client (for live feedback) and on the server (for authoritative checks) by sharing one configuration object:

```typescript
// shared/password-policy.ts
import type { ValidatorOptions } from '@sentinel-password/core'

export const PASSWORD_POLICY: ValidatorOptions = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true,
}
```

The client uses it via `usePasswordValidator(PASSWORD_POLICY)` for instant feedback; the server uses it via `validatePassword(password, { ...PASSWORD_POLICY, personalInfo: [...] })` as the source of truth. The server check is what matters for security — client validation is a UX affordance.

## See Also

- [Getting Started](/guide/getting-started)
- [Configuration](/guide/configuration)
- [Validators](/guide/validators)
- [Core API Reference](/api/core)
