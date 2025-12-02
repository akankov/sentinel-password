import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { PasswordInput } from '../components/PasswordInput'
import type { ValidationResult } from '@sentinel-password/core'

/**
 * Password Input Component
 *
 * A headless, accessible password input component with built-in validation.
 * Supports WCAG 2.1 AAA compliance, keyboard navigation, and real-time feedback.
 */
const meta = {
  title: 'Components/PasswordInput',
  component: PasswordInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label for the password input',
    },
    description: {
      control: 'text',
      description: 'Optional description text',
    },
    showToggleButton: {
      control: 'boolean',
      description: 'Show/hide password toggle button',
    },
    showValidationMessages: {
      control: 'boolean',
      description: 'Display validation feedback',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the input',
    },
  },
} satisfies Meta<typeof PasswordInput>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Basic password input with default settings
 */
export const Basic: Story = {
  args: {
    label: 'Password',
    description: 'Enter a strong password',
  },
}

/**
 * Controlled password input with state management
 */
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState('')
    const [validationResult, setValidationResult] = useState<ValidationResult | undefined>()

    return (
      <div style={{ minWidth: '320px' }}>
        <PasswordInput
          {...args}
          value={value}
          onChange={setValue}
          onValidationChange={setValidationResult}
        />
        <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
          <p>Current value: {value}</p>
          {validationResult && (
            <>
              <p>Valid: {validationResult.valid ? '✅' : '❌'}</p>
              <p>Strength: {validationResult.strength}</p>
              <p>Score: {validationResult.score}/4</p>
            </>
          )}
        </div>
      </div>
    )
  },
  args: {
    label: 'Password',
    description: 'Watch the validation update in real-time',
  },
}

/**
 * Password input with custom styling
 */
export const CustomStyling: Story = {
  render: (args) => (
    <div style={{ minWidth: '320px' }}>
      <style>{`
        .custom-container {
          font-family: system-ui, sans-serif;
        }
        .custom-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #1a1a1a;
        }
        .custom-description {
          margin-bottom: 8px;
          font-size: 14px;
          color: #666;
        }
        .custom-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .custom-input-wrapper input {
          flex: 1;
          padding: 10px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 16px;
          transition: border-color 0.2s;
        }
        .custom-input-wrapper input:focus {
          outline: none;
          border-color: #4CAF50;
        }
        .custom-input-wrapper input[aria-invalid="true"] {
          border-color: #f44336;
        }
        .custom-toggle {
          padding: 8px 12px;
          background: #f5f5f5;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        .custom-toggle:hover:not(:disabled) {
          background: #e0e0e0;
        }
        .custom-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .custom-validation {
          margin-top: 8px;
          padding: 8px 12px;
          background: #fff3e0;
          border-left: 4px solid #ff9800;
          border-radius: 4px;
        }
        .custom-validation ul {
          margin: 0;
          padding-left: 20px;
        }
        .custom-validation li {
          font-size: 14px;
          color: #666;
          margin: 4px 0;
        }
        .custom-validation li[data-severity="error"] {
          color: #f44336;
        }
        .custom-validation li[data-severity="success"] {
          color: #4CAF50;
        }
      `}</style>
      <PasswordInput
        {...args}
        containerClassName="custom-container"
        labelClassName="custom-label"
        descriptionClassName="custom-description"
        inputWrapperClassName="custom-input-wrapper"
        toggleButtonClassName="custom-toggle"
        validationClassName="custom-validation"
      />
    </div>
  ),
  args: {
    label: 'Create Password',
    description: 'Must be at least 8 characters with mixed case and numbers',
  },
}

/**
 * Disabled password input
 */
export const Disabled: Story = {
  args: {
    label: 'Password',
    description: 'This field is disabled',
    disabled: true,
  },
}

/**
 * Without toggle button
 */
export const WithoutToggleButton: Story = {
  args: {
    label: 'Password',
    description: 'No show/hide button',
    showToggleButton: false,
  },
}

/**
 * Without validation messages
 */
export const WithoutValidationMessages: Story = {
  args: {
    label: 'Password',
    description: 'Validation runs but messages are hidden',
    showValidationMessages: false,
  },
}

/**
 * Instant validation (no debounce)
 */
export const InstantValidation: Story = {
  args: {
    label: 'Password',
    description: 'Validation happens immediately with no debounce delay',
    debounceMs: 0,
  },
}

/**
 * With placeholder and auto-focus
 */
export const WithPlaceholder: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password...',
    autoFocus: true,
  },
}
