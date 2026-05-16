import express from 'express'
import type { Request, Response } from 'express'
import { validatePassword } from '@sentinel-password/core'
import { checkBreach } from '@sentinel-password/breach'

interface SignupBody {
  email?: unknown
  name?: unknown
  password?: unknown
}

const app: express.Application = express()
app.use(express.json())

app.post('/signup', async (req: Request<unknown, unknown, SignupBody>, res: Response) => {
  const { email, name, password } = req.body

  if (typeof password !== 'string' || typeof email !== 'string' || typeof name !== 'string') {
    return res.status(400).json({ error: 'email, name, and password are required strings' })
  }

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
      stage: 'rules',
      strength: result.strength,
      score: result.score,
      warning: result.feedback.warning,
      suggestions: result.feedback.suggestions,
      checks: result.checks,
    })
  }

  // Rules passed — now check Have I Been Pwned. Running the breach check
  // server-side (not from the browser) is the recommended pattern: the
  // k-anonymity prefix stays off the client and out of your CSP/egress rules.
  const pwned = await checkBreach(password)

  if (pwned.status === 'error') {
    // Fail-CLOSED: a degraded breach check blocks signup. This is a deliberate
    // policy choice — swap to fail-open (treat as acceptable + log) if
    // availability matters more than the guarantee. Never ignore it silently.
    return res.status(503).json({
      ok: false,
      stage: 'breach',
      error: 'breach check unavailable',
      reason: pwned.reason,
    })
  }

  if (pwned.breached) {
    return res.status(400).json({
      ok: false,
      stage: 'breach',
      breachCount: pwned.breachCount,
      suggestion: 'This password has appeared in known data breaches. Choose a different one.',
    })
  }

  // Strength + breach checks passed. In a real app, hash the password with
  // argon2 (preferred) or bcrypt before persisting. This example focuses on
  // validation and intentionally omits hashing/storage.
  return res.status(201).json({
    ok: true,
    strength: result.strength,
    score: result.score,
  })
})

const port: number = Number(process.env['PORT']) || 3000
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`express-backend example listening on http://localhost:${port}`)
})
