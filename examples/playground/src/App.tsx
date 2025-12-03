import { useState } from 'react'
import { PasswordInput } from '@sentinel-password/react-components'
import type { ValidationResult } from '@sentinel-password/core'
import './App.css'

interface ConfigOption {
  id: string
  label: string
  type: 'toggle' | 'number' | 'text' | 'array'
  value: boolean | number | string | string[]
  min?: number
  max?: number
  description?: string
}

function App() {
  const [password, setPassword] = useState('')
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [showConfig, setShowConfig] = useState(true)

  // Configuration options
  const [config, setConfig] = useState<Record<string, boolean | number | string | string[]>>({
    validateOnMount: false,
    validateOnChange: true,
    debounceMs: 300,
    showValidationMessages: true,
    showToggleButton: true,
  })

  const configOptions: ConfigOption[] = [
    {
      id: 'validateOnMount',
      label: 'Validate on Mount',
      type: 'toggle',
      value: config.validateOnMount as boolean,
      description: 'Run validation when component mounts',
    },
    {
      id: 'validateOnChange',
      label: 'Validate on Change',
      type: 'toggle',
      value: config.validateOnChange as boolean,
      description: 'Run validation on every keystroke',
    },
    {
      id: 'debounceMs',
      label: 'Debounce (ms)',
      type: 'number',
      value: config.debounceMs as number,
      min: 0,
      max: 2000,
      description: 'Delay before validation runs',
    },
    {
      id: 'showValidationMessages',
      label: 'Show Validation Messages',
      type: 'toggle',
      value: config.showValidationMessages as boolean,
      description: 'Display validation feedback',
    },
    {
      id: 'showToggleButton',
      label: 'Show Toggle Button',
      type: 'toggle',
      value: config.showToggleButton as boolean,
      description: 'Show password visibility toggle',
    },
  ]

  const handleConfigChange = (id: string, value: boolean | number | string | string[]) => {
    setConfig((prev) => ({ ...prev, [id]: value }))
  }

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
              label="Password"
              description="Try different passwords to see how validation works"
              value={password}
              onChange={setPassword}
              onValidationChange={setValidationResult}
              validateOnMount={config.validateOnMount as boolean}
              validateOnChange={config.validateOnChange as boolean}
              debounceMs={config.debounceMs as number}
              showValidationMessages={config.showValidationMessages as boolean}
              showToggleButton={config.showToggleButton as boolean}
              containerClassName="password-field"
              labelClassName="password-label"
              descriptionClassName="password-description"
              inputWrapperClassName="password-wrapper"
              className="password-input"
              toggleButtonClassName="toggle-button"
              validationClassName="validation-list"
            />

            {validationResult && (
              <div className="validation-result">
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
                      {getStrengthLabel(validationResult.strength)}
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
          </div>
        </div>

        {showConfig && (
          <div className="config-section">
            <h2>Configuration</h2>
            <div className="config-options">
              {configOptions.map((option) => (
                <div key={option.id} className="config-option">
                  <div className="option-header">
                    <label htmlFor={option.id}>{option.label}</label>
                    {option.type === 'toggle' && (
                      <input
                        id={option.id}
                        type="checkbox"
                        checked={option.value as boolean}
                        onChange={(e) => handleConfigChange(option.id, e.target.checked)}
                        className="toggle-input"
                      />
                    )}
                    {option.type === 'number' && (
                      <input
                        id={option.id}
                        type="number"
                        value={option.value as number}
                        min={option.min}
                        max={option.max}
                        onChange={(e) =>
                          handleConfigChange(option.id, parseInt(e.target.value, 10))
                        }
                        className="number-input"
                      />
                    )}
                  </div>
                  {option.description && <p className="option-description">{option.description}</p>}
                </div>
              ))}
            </div>

            <div className="code-preview">
              <h3>Code Example</h3>
              <pre>
                <code>{`<PasswordInput
  label="Password"
  description="..."
  value={password}
  onChange={setPassword}
  onValidationChange={handleValidation}
  validateOnMount={${config.validateOnMount}}
  validateOnChange={${config.validateOnChange}}
  debounceMs={${config.debounceMs}}
  showValidationMessages={${config.showValidationMessages}}
  showToggleButton={${config.showToggleButton}}
/>`}</code>
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
