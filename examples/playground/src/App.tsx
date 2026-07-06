import { useMemo, useState } from 'react'
import { PasswordInput } from '@sentinel-password/react-components'
import { estimateEntropy } from '@sentinel-password/entropy'
import type { EntropyResult } from '@sentinel-password/entropy'
import type { MessageCode, ValidationResult, ValidatorOptions } from '@sentinel-password/core'
import './App.css'

type Locale = 'en' | 'es'

const SPANISH_MESSAGES: Readonly<Record<MessageCode, string>> = {
  'length.tooShort': 'La contraseña debe tener al menos {minLength} caracteres',
  'length.tooLong': 'La contraseña debe tener como máximo {maxLength} caracteres',
  'characterTypes.missing': 'La contraseña debe contener al menos un(a) {missing}',
  'repetition.tooMany':
    'La contraseña tiene demasiados caracteres repetidos (máx. {maxRepeatedChars})',
  'sequential.found': 'La contraseña contiene caracteres secuenciales (p. ej., abc, 123)',
  'keyboardPattern.found': 'La contraseña contiene patrones de teclado comunes',
  'commonPassword.found': 'La contraseña es demasiado común. Elige una más única.',
  'personalInfo.found': 'La contraseña contiene información personal',
}

const CRACK_TIME_PRESETS = [
  { key: 'onlineThrottled', label: 'Online, throttled', detail: '100 guesses/hour' },
  { key: 'onlineUnthrottled', label: 'Online, unthrottled', detail: '10 guesses/sec' },
  {
    key: 'offlineSlowHash',
    label: 'Offline, slow hash',
    detail: '10⁴ guesses/sec (bcrypt/argon2)',
  },
  {
    key: 'offlineFastHash',
    label: 'Offline, fast hash',
    detail: '10¹⁰ guesses/sec (GPU vs MD5/SHA-1)',
  },
] as const

function App() {
  const [password, setPassword] = useState('')
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [showConfig, setShowConfig] = useState(true)

  // Component behavior knobs
  const [validateOnMount, setValidateOnMount] = useState(false)
  const [validateOnChange, setValidateOnChange] = useState(true)
  const [debounceMs, setDebounceMs] = useState(300)
  const [showValidationMessages, setShowValidationMessages] = useState(true)
  const [showToggleButton, setShowToggleButton] = useState(true)

  // Validation policy knobs (forwarded via validatorOptions)
  const [minLength, setMinLength] = useState(8)
  const [requireUppercase, setRequireUppercase] = useState(false)
  const [requireLowercase, setRequireLowercase] = useState(false)
  const [requireDigit, setRequireDigit] = useState(false)
  const [requireSymbol, setRequireSymbol] = useState(false)
  const [locale, setLocale] = useState<Locale>('en')

  const validatorOptions: ValidatorOptions = useMemo(
    () => ({
      minLength,
      requireUppercase,
      requireLowercase,
      requireDigit,
      requireSymbol,
      ...(locale === 'es' && { messages: SPANISH_MESSAGES }),
    }),
    [minLength, requireUppercase, requireLowercase, requireDigit, requireSymbol, locale]
  )

  const entropy: EntropyResult | null = useMemo(
    () => (password === '' ? null : estimateEntropy(password)),
    [password]
  )

  const getStrengthColor = (score: number) => {
    const colors = ['#e53e3e', '#ed8936', '#ecc94b', '#48bb78', '#38a169']
    return colors[score] || colors[0]
  }

  const getStrengthLabel = (strength: string) => {
    return strength
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }

  const parseBoundedInt = (raw: string, fallback: number) => {
    const parsed = parseInt(raw, 10)
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
  }

  const codeExample = `<PasswordInput
  label="Password"
  value={password}
  onChange={setPassword}
  onValidationChange={handleValidation}
  validateOnMount={${validateOnMount}}
  validateOnChange={${validateOnChange}}
  debounceMs={${debounceMs}}
  showValidationMessages={${showValidationMessages}}
  showToggleButton={${showToggleButton}}
  validatorOptions={{
    minLength: ${minLength},
    requireUppercase: ${requireUppercase},
    requireLowercase: ${requireLowercase},
    requireDigit: ${requireDigit},
    requireSymbol: ${requireSymbol},${locale === 'es' ? '\n    messages: spanishTemplates,' : ''}
  }}
/>`

  return (
    <div className="playground">
      <header className="playground-header">
        <h1>Sentinel Password Playground</h1>
        <p>Interactive demo of the Sentinel Password component</p>
      </header>

      <div className="playground-content">
        <div className="demo-section">
          <div className="demo-header">
            <h2>Try It Out</h2>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="config-toggle"
              aria-label={showConfig ? 'Hide configuration' : 'Show configuration'}
            >
              {showConfig ? 'Hide Config' : 'Show Config'}
            </button>
          </div>

          <div className="demo-container">
            <PasswordInput
              label={locale === 'es' ? 'Contraseña' : 'Password'}
              description={
                locale === 'es'
                  ? 'Prueba diferentes contraseñas para ver la validación'
                  : 'Try different passwords to see how validation works'
              }
              value={password}
              onChange={setPassword}
              onValidationChange={setValidationResult}
              validateOnMount={validateOnMount}
              validateOnChange={validateOnChange}
              debounceMs={debounceMs}
              showValidationMessages={showValidationMessages}
              showToggleButton={showToggleButton}
              validatorOptions={validatorOptions}
              containerClassName="password-field"
              labelClassName="password-label"
              descriptionClassName="password-description"
              inputWrapperClassName="password-wrapper"
              className="password-input"
              toggleButtonClassName="toggle-button"
              validationClassName="validation-list"
            />

            {validationResult && (
              <div
                className="validation-result"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="result-header">
                  <h3>Validation Result</h3>
                  <span className={`status-badge ${validationResult.valid ? 'valid' : 'invalid'}`}>
                    {validationResult.valid ? '✓ Valid' : '✗ Invalid'}
                  </span>
                </div>

                <div className="strength-meter">
                  <div className="strength-info">
                    <span className="strength-label">Strength:</span>
                    <span
                      className="strength-value"
                      style={{ color: getStrengthColor(validationResult.score) }}
                    >
                      {getStrengthLabel(validationResult.strength)} ({validationResult.score}/4)
                    </span>
                  </div>
                  <div className="strength-bar">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`strength-segment ${i <= validationResult.score ? 'active' : ''}`}
                        style={{
                          backgroundColor:
                            i <= validationResult.score
                              ? getStrengthColor(validationResult.score)
                              : '#e2e8f0',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="checks-grid">
                  {Object.entries(validationResult.checks).map(([key, passed]) => (
                    <div key={key} className={`check-item ${passed ? 'passed' : 'failed'}`}>
                      <span className="check-icon">{passed ? '✓' : '✗'}</span>
                      <span className="check-name">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {entropy && (
              <div className="entropy-result">
                <div className="result-header">
                  <h3>Entropy &amp; Crack Time</h3>
                  <span className="entropy-bits">
                    {entropy.bits.toFixed(1)} bits · score {entropy.score}/4
                  </span>
                </div>

                <table className="crack-time-table">
                  <thead>
                    <tr>
                      <th scope="col">Attack model</th>
                      <th scope="col">Guess rate</th>
                      <th scope="col">Time to crack</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CRACK_TIME_PRESETS.map(({ key, label, detail }) => (
                      <tr key={key}>
                        <td>{label}</td>
                        <td className="crack-time-detail">{detail}</td>
                        <td className="crack-time-value">{entropy.crackTime[key].display}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {entropy.patterns.length > 0 && (
                  <p className="entropy-patterns">
                    Weakening patterns detected:{' '}
                    {entropy.patterns.map((p) => (
                      <span key={p} className="pattern-tag">
                        {p}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {showConfig && (
          <div className="config-section">
            <h2>Validation Policy</h2>
            <div className="config-options">
              <div className="config-option">
                <div className="option-header">
                  <label htmlFor="minLength">Min Length</label>
                  <input
                    id="minLength"
                    type="number"
                    value={minLength}
                    min={0}
                    max={128}
                    onChange={(e) => setMinLength(parseBoundedInt(e.target.value, 8))}
                    className="number-input"
                  />
                </div>
                <p className="option-description">Minimum password length (validatorOptions)</p>
              </div>
              {(
                [
                  ['requireUppercase', 'Require Uppercase', requireUppercase, setRequireUppercase],
                  ['requireLowercase', 'Require Lowercase', requireLowercase, setRequireLowercase],
                  ['requireDigit', 'Require Digit', requireDigit, setRequireDigit],
                  ['requireSymbol', 'Require Symbol', requireSymbol, setRequireSymbol],
                ] as const
              ).map(([id, label, value, setter]) => (
                <div key={id} className="config-option">
                  <div className="option-header">
                    <label htmlFor={id}>{label}</label>
                    <input
                      id={id}
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setter(e.target.checked)}
                      className="toggle-input"
                    />
                  </div>
                </div>
              ))}
              <div className="config-option">
                <div className="option-header">
                  <label htmlFor="locale">Message Language</label>
                  <select
                    id="locale"
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as Locale)}
                    className="locale-select"
                  >
                    <option value="en">English (built-in)</option>
                    <option value="es">Español (messages map)</option>
                  </select>
                </div>
                <p className="option-description">
                  Demonstrates the i18n <code>messages</code> template map
                </p>
              </div>
            </div>

            <h2>Component Behavior</h2>
            <div className="config-options">
              {(
                [
                  [
                    'validateOnMount',
                    'Validate on Mount',
                    validateOnMount,
                    setValidateOnMount,
                    'Run validation when component mounts',
                  ],
                  [
                    'validateOnChange',
                    'Validate on Change',
                    validateOnChange,
                    setValidateOnChange,
                    'Run validation on every keystroke',
                  ],
                  [
                    'showValidationMessages',
                    'Show Validation Messages',
                    showValidationMessages,
                    setShowValidationMessages,
                    'Display validation feedback',
                  ],
                  [
                    'showToggleButton',
                    'Show Toggle Button',
                    showToggleButton,
                    setShowToggleButton,
                    'Show password visibility toggle',
                  ],
                ] as const
              ).map(([id, label, value, setter, description]) => (
                <div key={id} className="config-option">
                  <div className="option-header">
                    <label htmlFor={id}>{label}</label>
                    <input
                      id={id}
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setter(e.target.checked)}
                      className="toggle-input"
                    />
                  </div>
                  <p className="option-description">{description}</p>
                </div>
              ))}
              <div className="config-option">
                <div className="option-header">
                  <label htmlFor="debounceMs">Debounce (ms)</label>
                  <input
                    id="debounceMs"
                    type="number"
                    value={debounceMs}
                    min={0}
                    max={2000}
                    onChange={(e) => setDebounceMs(parseBoundedInt(e.target.value, 0))}
                    className="number-input"
                  />
                </div>
                <p className="option-description">Delay before validation runs</p>
              </div>
            </div>

            <div className="code-preview">
              <h3>Code Example</h3>
              <pre>
                <code>{codeExample}</code>
              </pre>
            </div>
          </div>
        )}
      </div>

      <footer className="playground-footer">
        <p>
          Built with{' '}
          <a
            href="https://akankov.github.io/sentinel-password/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sentinel Password
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
