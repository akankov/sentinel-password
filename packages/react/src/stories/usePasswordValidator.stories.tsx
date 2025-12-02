import type { Meta, StoryObj } from '@storybook/react'
import { usePasswordValidator } from '../hooks/usePasswordValidator'

/**
 * Example component demonstrating usePasswordValidator hook
 */
function PasswordValidatorDemo({
  debounceMs = 300,
  minLength = 8,
}: {
  debounceMs?: number
  minLength?: number
}): JSX.Element {
  const { password, setPassword, result, isValidating, reset } = usePasswordValidator({
    debounceMs,
    minLength,
  })

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Password Validator Demo</h2>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="password" style={{ display: 'block', marginBottom: '8px' }}>
          Enter Password:
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e): void => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>

      {isValidating && (
        <div
          style={{
            padding: '10px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            marginBottom: '10px',
          }}
        >
          Validating...
        </div>
      )}

      {result && !isValidating && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>Valid:</strong> {result.valid ? '✓ Yes' : '✗ No'}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Strength:</strong>{' '}
            <span
              style={{
                color:
                  result.strength === 'very-strong'
                    ? 'green'
                    : result.strength === 'strong'
                      ? 'lightgreen'
                      : result.strength === 'medium'
                        ? 'orange'
                        : 'red',
              }}
            >
              {result.strength}
            </span>{' '}
            (Score: {result.score}/4)
          </div>

          {result.feedback.warning && (
            <div
              style={{
                padding: '10px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '4px',
                marginBottom: '10px',
              }}
            >
              <strong>Warning:</strong> {result.feedback.warning}
            </div>
          )}

          <div>
            <strong>Checks:</strong>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              {Object.entries(result.checks).map(([check, passed]) => (
                <li key={check}>
                  {passed ? '✓' : '✗'} {check}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <button
        onClick={(): void => reset()}
        style={{
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Reset
      </button>
    </div>
  )
}

const meta: Meta<typeof PasswordValidatorDemo> = {
  title: 'Hooks/usePasswordValidator',
  component: PasswordValidatorDemo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  args: {
    debounceMs: 300,
    minLength: 8,
  },
}

export const NoDebounce: Story = {
  args: {
    debounceMs: 0,
    minLength: 8,
  },
}

export const StrictRequirements: Story = {
  args: {
    debounceMs: 300,
    minLength: 12,
  },
}
