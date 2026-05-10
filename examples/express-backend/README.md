# Express Backend Example

Minimal Express 5 server demonstrating server-side password validation with `@sentinel-password/core`.

The core package is fully isomorphic — zero dependencies, no browser or Node-only APIs — so it runs unchanged on the server. See the [Server-Side Usage guide](https://akankov.github.io/sentinel-password/guide/server-side) for runtime notes and Fastify / NestJS / edge variants.

## Run

From the repository root:

```bash
pnpm install
pnpm --filter express-backend dev
```

The server starts on `http://localhost:3000` (override with `PORT`).

## Try it

A weak password gets rejected with structured feedback:

```bash
curl -X POST http://localhost:3000/signup \
  -H 'content-type: application/json' \
  -d '{"email":"alex@example.com","name":"Alex","password":"alex123"}'
```

```json
{
  "ok": false,
  "strength": "very-weak",
  "score": 1,
  "warning": "Password must be at least 12 characters",
  "suggestions": ["..."],
  "checks": { "length": false, "characterTypes": false, ... }
}
```

A strong password passes:

```bash
curl -X POST http://localhost:3000/signup \
  -H 'content-type: application/json' \
  -d '{"email":"alex@example.com","name":"Alex","password":"Tr0ub4dor&3-isLong!"}'
```

```json
{ "ok": true, "strength": "very-strong", "score": 4 }
```

## What this example does NOT do

This is a **strength validator**, not a password manager. A production endpoint must additionally:

1. Hash the password with [Argon2id](https://github.com/ranisalt/node-argon2) (preferred) or bcrypt before storing it.
2. Use HTTPS in transit.
3. Rate-limit the signup endpoint.
4. Never log the password — even on errors.

Hashing is intentionally out of scope so the example stays focused on validation.
