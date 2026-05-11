import { useState } from 'react'
import { PasswordInput } from '@sentinel-password/react-components'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // We deliberately store only the boolean we need, not the whole
  // ValidationResult — keeping less password-derived state around.
  const [passwordValid, setPasswordValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Strength-based submit gating is appropriate here because this is a
  // signup form — we're evaluating a *new* password the user is about to
  // commit. Never apply this pattern to a login form: a strict policy
  // would reject existing users whose passwords pre-date the policy.
  const formReady = email.length > 0 && passwordValid && !isSubmitting

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formReady) return
    setIsSubmitting(true)

    // Simulate API call. In a real app, send the password to your backend
    // over HTTPS, hash it with Argon2/bcrypt server-side, and never log or
    // persist the plaintext.
    setTimeout(() => {
      setSubmitted(true)
      setIsSubmitting(false)
    }, 1000)
  }

  if (submitted) {
    return (
      <div className="app-container">
        <div className="login-card" role="status" aria-live="polite">
          <h1>Account created</h1>
          <p className="subtitle">Welcome aboard! Your account for {email} is ready.</p>
          <button
            type="button"
            className="submit-button"
            onClick={() => {
              setSubmitted(false)
              setEmail('')
              setPassword('')
              setPasswordValid(false)
            }}
          >
            Create another account
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <div className="login-card">
        <h1>Create your account</h1>
        <p className="subtitle">Secured by Sentinel Password</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="text-input"
            />
          </div>

          <PasswordInput
            label="Password"
            description="At least 8 characters; avoids common passwords and obvious patterns"
            value={password}
            onChange={setPassword}
            onValidationChange={(result) => setPasswordValid(result.valid)}
            containerClassName="password-container"
            labelClassName="password-label"
            descriptionClassName="password-description"
            inputWrapperClassName="password-wrapper"
            className="password-input"
            toggleButtonClassName="toggle-button"
            validationClassName="validation-messages"
          />

          <button type="submit" disabled={!formReady} className="submit-button">
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="footer-link">
          Sign-in flow is out of scope — strength gating like this only belongs on signup or
          change-password screens, never on login. See the{' '}
          <a
            href="https://akankov.github.io/sentinel-password/guide/server-side"
            target="_blank"
            rel="noopener noreferrer"
          >
            Server-Side Usage guide
          </a>{' '}
          for the full picture.
        </p>
      </div>

      <div className="info-section">
        <h2>About This Example</h2>
        <p>
          This is a signup form built with <strong>Vite + React</strong> and{' '}
          <strong>Sentinel Password</strong>.
        </p>
        <ul>
          <li>Real-time password validation</li>
          <li>Show/hide password toggle</li>
          <li>
            The <code>PasswordInput</code> component is WCAG 2.1 AAA compliant; the surrounding
            example app is a demo shell.
          </li>
          <li>Zero dependencies in core</li>
        </ul>
        <a
          href="https://akankov.github.io/sentinel-password/"
          target="_blank"
          rel="noopener noreferrer"
          className="docs-link"
        >
          View Documentation →
        </a>
      </div>
    </div>
  )
}

export default App
