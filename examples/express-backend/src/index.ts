import express from 'express'
import type { Request, Response } from 'express'
import { validatePassword } from '@sentinel-password/core'

interface SignupBody {
  email?: unknown
  name?: unknown
  password?: unknown
}

const app: express.Application = express()
app.use(express.json())

app.post('/signup', (req: Request<unknown, unknown, SignupBody>, res: Response) => {
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
      strength: result.strength,
      score: result.score,
      warning: result.feedback.warning,
      suggestions: result.feedback.suggestions,
      checks: result.checks,
    })
  }

  // Strength check passed. In a real app, hash the password with argon2 (preferred)
  // or bcrypt before persisting. This example focuses on validation and intentionally
  // omits hashing/storage.
  return res.status(201).json({
    ok: true,
    strength: result.strength,
    score: result.score,
  })
})

const port: number = Number(process.env['PORT'] ?? 3000)
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`express-backend example listening on http://localhost:${port}`)
})
