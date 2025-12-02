import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordInput } from '../src'

describe('PasswordInput', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('should render with required label', () => {
      render(<PasswordInput label="Password" />)
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('should render with description when provided', () => {
      render(<PasswordInput label="Password" description="Must be 8+ characters" />)
      expect(screen.getByText('Must be 8+ characters')).toBeInTheDocument()
    })

    it('should render password input type by default', () => {
      render(<PasswordInput label="Password" />)
      const input = screen.getByLabelText('Password')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should render toggle button by default', () => {
      render(<PasswordInput label="Password" />)
      expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument()
    })

    it('should not render toggle button when showToggleButton is false', () => {
      render(<PasswordInput label="Password" showToggleButton={false} />)
      expect(screen.queryByRole('button', { name: /show password/i })).not.toBeInTheDocument()
    })
  })

  describe('Controlled Mode', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(<PasswordInput label="Password" value="test" onChange={handleChange} />)

      const input = screen.getByLabelText('Password')
      expect(input).toHaveValue('test')

      await user.type(input, '123')
      expect(handleChange).toHaveBeenCalledTimes(3)
    })

    it('should update value from props in controlled mode', () => {
      const { rerender } = render(
        <PasswordInput label="Password" value="test" onChange={vi.fn()} />
      )

      let input = screen.getByLabelText('Password')
      expect(input).toHaveValue('test')

      rerender(<PasswordInput label="Password" value="updated" onChange={vi.fn()} />)
      input = screen.getByLabelText('Password')
      expect(input).toHaveValue('updated')
    })
  })

  describe('Uncontrolled Mode', () => {
    it('should work as uncontrolled component with defaultValue', () => {
      render(<PasswordInput label="Password" defaultValue="initial" />)
      const input = screen.getByLabelText('Password')
      expect(input).toHaveValue('initial')
    })

    it('should update internal state in uncontrolled mode', async () => {
      const user = userEvent.setup()
      render(<PasswordInput label="Password" />)

      const input = screen.getByLabelText('Password')
      await user.type(input, 'password123')

      expect(input).toHaveValue('password123')
    })
  })

  describe('Show/Hide Password Toggle', () => {
    it('should toggle password visibility when clicked', async () => {
      const user = userEvent.setup()
      render(<PasswordInput label="Password" />)

      const input = screen.getByLabelText('Password')
      const toggleButton = screen.getByRole('button', { name: /show password/i })

      expect(input).toHaveAttribute('type', 'password')

      await user.click(toggleButton)
      expect(input).toHaveAttribute('type', 'text')
      expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument()

      await user.click(toggleButton)
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should work in controlled mode for show/hide', async () => {
      const user = userEvent.setup()
      const handleShowPasswordChange = vi.fn()

      const { rerender } = render(
        <PasswordInput
          label="Password"
          showPassword={false}
          onShowPasswordChange={handleShowPasswordChange}
        />
      )

      const input = screen.getByLabelText('Password')
      const toggleButton = screen.getByRole('button', { name: /show password/i })

      expect(input).toHaveAttribute('type', 'password')

      await user.click(toggleButton)
      expect(handleShowPasswordChange).toHaveBeenCalledWith(true)

      rerender(
        <PasswordInput
          label="Password"
          showPassword={true}
          onShowPasswordChange={handleShowPasswordChange}
        />
      )

      expect(input).toHaveAttribute('type', 'text')
    })
  })

  describe('Validation', () => {
    it.skip('should validate password and show feedback', async () => {
      vi.useFakeTimers()
      const user = userEvent.setup({ delay: null })
      const handleValidationChange = vi.fn()

      render(
        <PasswordInput
          label="Password"
          onValidationChange={handleValidationChange}
          debounceMs={300}
        />
      )

      const input = screen.getByLabelText('Password')
      await user.type(input, 'weak')

      await vi.runAllTimersAsync()

      await waitFor(() => {
        expect(handleValidationChange).toHaveBeenCalled()
        const lastCall =
          handleValidationChange.mock.calls[handleValidationChange.mock.calls.length - 1]
        expect(lastCall[0]).toHaveProperty('valid')
      })
    })

    it.skip('should debounce validation by default', async () => {
      vi.useFakeTimers()
      const user = userEvent.setup({ delay: null })
      const handleValidationChange = vi.fn()

      render(
        <PasswordInput
          label="Password"
          onValidationChange={handleValidationChange}
          debounceMs={300}
        />
      )

      const input = screen.getByLabelText('Password')
      await user.type(input, 'test')

      // Should not validate immediately
      expect(handleValidationChange).not.toHaveBeenCalled()

      // Fast-forward time
      await vi.runAllTimersAsync()

      await waitFor(() => {
        expect(handleValidationChange).toHaveBeenCalled()
      })
    })

    it('should validate immediately when debounceMs is 0', async () => {
      const user = userEvent.setup()
      const handleValidationChange = vi.fn()

      render(
        <PasswordInput
          label="Password"
          onValidationChange={handleValidationChange}
          debounceMs={0}
        />
      )

      const input = screen.getByLabelText('Password')
      await user.type(input, 't')

      await waitFor(() => {
        expect(handleValidationChange).toHaveBeenCalled()
      })
    })

    it.skip('should show validation messages when enabled', async () => {
      vi.useFakeTimers()
      const user = userEvent.setup({ delay: null })

      render(<PasswordInput label="Password" showValidationMessages={true} debounceMs={300} />)

      const input = screen.getByLabelText('Password')
      await user.type(input, 'weak')

      await vi.runAllTimersAsync()

      await waitFor(() => {
        const validationRegion = screen.queryByRole('alert')
        expect(validationRegion).toBeInTheDocument()
      })
    })

    it.skip('should not show validation messages when disabled', async () => {
      vi.useFakeTimers()
      const user = userEvent.setup({ delay: null })

      render(<PasswordInput label="Password" showValidationMessages={false} debounceMs={300} />)

      const input = screen.getByLabelText('Password')
      await user.type(input, 'weak')

      await vi.runAllTimersAsync()

      await waitFor(
        () => {
          expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        },
        { timeout: 1000 }
      )
    })
  })

  describe('Keyboard Navigation', () => {
    it('should clear input and reset validation on Escape', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(<PasswordInput label="Password" onChange={handleChange} />)

      const input = screen.getByLabelText('Password')
      await user.type(input, 'password123')

      expect(input).toHaveValue('password123')

      await user.keyboard('{Escape}')

      expect(handleChange).toHaveBeenCalledWith('')
    })

    it('should maintain focus after clearing with Escape', async () => {
      const user = userEvent.setup()
      render(<PasswordInput label="Password" />)

      const input = screen.getByLabelText('Password')
      await user.type(input, 'test')
      await user.keyboard('{Escape}')

      expect(input).toHaveFocus()
    })

    it('should support Tab navigation', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <PasswordInput label="Password 1" />
          <PasswordInput label="Password 2" />
        </div>
      )

      const input1 = screen.getByLabelText('Password 1')
      const input2 = screen.getByLabelText('Password 2')

      input1.focus()
      expect(input1).toHaveFocus()

      await user.keyboard('{Tab}')
      // After tab, focus moves to toggle button
      expect(screen.getAllByRole('button')[0]).toHaveFocus()

      await user.keyboard('{Tab}')
      expect(input2).toHaveFocus()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<PasswordInput label="Password" />)

      const input = screen.getByLabelText('Password')
      expect(input).toHaveAccessibleName('Password')
    })

    it('should associate description with input via aria-describedby', () => {
      render(<PasswordInput label="Password" description="Enter your password" />)

      const input = screen.getByLabelText('Password')
      const description = screen.getByText('Enter your password')

      expect(input).toHaveAttribute('aria-describedby', expect.stringContaining(description.id))
    })

    it.skip('should mark input as invalid when validation fails', async () => {
      vi.useFakeTimers()
      const user = userEvent.setup({ delay: null })

      render(<PasswordInput label="Password" debounceMs={300} />)

      const input = screen.getByLabelText('Password')
      await user.type(input, 'a')

      await vi.runAllTimersAsync()

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it.skip('should use ARIA live region for validation feedback', async () => {
      vi.useFakeTimers()
      const user = userEvent.setup({ delay: null })

      render(<PasswordInput label="Password" showValidationMessages={true} debounceMs={300} />)

      const input = screen.getByLabelText('Password')
      await user.type(input, 'weak')

      await vi.runAllTimersAsync()

      await waitFor(() => {
        const liveRegion = screen.queryByRole('alert')
        expect(liveRegion).toHaveAttribute('aria-live', 'polite')
        expect(liveRegion).toHaveAttribute('aria-atomic', 'true')
      })
    })

    it('should have accessible toggle button labels', () => {
      render(<PasswordInput label="Password" />)

      const toggleButton = screen.getByRole('button', { name: /show password/i })
      expect(toggleButton).toHaveAttribute('aria-label', 'Show password')
      expect(toggleButton).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      render(<PasswordInput label="Password" disabled />)

      const input = screen.getByLabelText('Password')
      expect(input).toBeDisabled()
    })

    it('should disable toggle button when disabled', () => {
      render(<PasswordInput label="Password" disabled />)

      const toggleButton = screen.getByRole('button')
      expect(toggleButton).toBeDisabled()
    })

    it('should not allow typing when disabled', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(<PasswordInput label="Password" disabled onChange={handleChange} />)

      const input = screen.getByLabelText('Password')
      await user.type(input, 'test')

      expect(handleChange).not.toHaveBeenCalled()
      expect(input).toHaveValue('')
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom className to container', () => {
      render(<PasswordInput label="Password" containerClassName="custom-container" />)

      const container = screen.getByLabelText('Password').closest('[data-password-input-container]')
      expect(container).toHaveClass('custom-container')
    })

    it('should apply custom className to label', () => {
      render(<PasswordInput label="Password" labelClassName="custom-label" />)

      const label = screen.getByText('Password')
      expect(label).toHaveClass('custom-label')
    })

    it('should apply custom className to toggle button', () => {
      render(<PasswordInput label="Password" toggleButtonClassName="custom-button" />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-button')
    })
  })

  describe('Props Passthrough', () => {
    it('should pass through standard input props', () => {
      render(
        <PasswordInput
          label="Password"
          placeholder="Enter password"
          maxLength={20}
          aria-label="Custom label"
        />
      )

      const input = screen.getByLabelText('Custom label')
      expect(input).toHaveAttribute('placeholder', 'Enter password')
      expect(input).toHaveAttribute('maxLength', '20')
    })

    it('should set autoComplete to new-password by default', () => {
      render(<PasswordInput label="Password" />)

      const input = screen.getByLabelText('Password')
      expect(input).toHaveAttribute('autocomplete', 'new-password')
    })
  })
})
