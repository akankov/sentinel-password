import { useState } from 'react'
import { PasswordInput } from '@sentinel-password/react-components'
import './App.css'

interface ValidationResult {
  valid: boolean
  score: number
  strength: string
}

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleValidationChange = (result: ValidationResult) => {
    setIsValid(result.valid)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || !email) return

    setSubmitted(true)

    // Simulate API call
    setTimeout(() => {
      alert(`Login successful for ${email}!`)
      setSubmitted(false)
      setEmail('')
      setPassword('')
    }, 1000)
  }

  return (
    <div className="app-container">
      <div className="login-card">
        <h1>Login to Your Account</h1>
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
            description="Must be at least 8 characters long"
            value={password}
            onChange={setPassword}
            onValidationChange={handleValidationChange}
            containerClassName="password-container"
            labelClassName="password-label"
            descriptionClassName="password-description"
            inputWrapperClassName="password-wrapper"
            className="password-input"
            toggleButtonClassName="toggle-button"
            validationClassName="validation-messages"
          />

          <button
            type="submit"
            disabled={!isValid || !email || submitted}
            className="submit-button"
          >
            {submitted ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="footer-link">
          Don't have an account? <a href="#">Sign up</a>
        </div>
      </div>

      <div className="info-section">
        <h2>About This Example</h2>
        <p>
          This is a simple login form built with <strong>Vite + React</strong> and{' '}
          <strong>Sentinel Password</strong>.
        </p>
        <ul>
          <li>Real-time password validation</li>
          <li>Show/hide password toggle</li>
          <li>Accessible, WCAG 2.1 AAA compliant</li>
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
