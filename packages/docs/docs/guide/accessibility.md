# Accessibility

`PasswordInput` from `@sentinel-password/react-components` is **designed to meet WCAG 2.1 AAA criteria** — but conformance is a property of your full rendered page, not just a component. This guide covers what the component handles, what's left to you, and the known gaps.

## WCAG 2.1 AAA Alignment

The component provides the building blocks for AAA:

- ✅ Semantic HTML with `useId()`-linked `<label>`
- ✅ ARIA attributes managed for you: `aria-invalid` (set when invalid, omitted otherwise), `aria-describedby`, `aria-pressed` on the toggle
- ✅ Live region (`role="alert" aria-live="polite" aria-atomic="true"`) for validation announcements
- ✅ Keyboard support: `Tab`, `Escape` to clear, `Space`/`Enter` on the toggle
- ✅ Focus management for the component's own elements

The consumer is responsible for:

- ⚠️ **Color contrast** — the component is headless. AAA requires 7:1 for normal text, 4.5:1 for large text.
- ⚠️ **Surrounding markup** — heading structure, landmarks, form semantics.
- ⚠️ **Reduced motion / high contrast / `focus-visible`** — these depend on your stylesheet.
- ⚠️ **Localization of toggle text** — set `toggleShowText` / `toggleHideText` (visible label) and `toggleShowLabel` / `toggleHideLabel` (`aria-label`) on `PasswordInput`. Defaults are `'Show'` / `'Hide'` / `'Show password'` / `'Hide password'`.
- ⚠️ **Localization of validation messages** — pass `validatorOptions={{ messages, formatMessage }}` to `PasswordInput`; see the [i18n guide](/guide/i18n).

## Semantic HTML

The `<PasswordInput>` component renders this DOM tree. **Initial state** (no value entered yet, no validation has run):

```html
<div data-password-input-container>
  <label for=":r1:">Create Password</label>
  <div id=":r2:">Must be at least 8 characters</div>

  <div data-password-input-wrapper>
    <input
      id=":r1:"
      type="password"
      autocomplete="new-password"
      aria-describedby=":r2:"
    />
    <button
      type="button"
      aria-label="Show password"
      aria-pressed="false"
    >
      Show
    </button>
  </div>
  <!-- No validation region yet — see below -->
</div>
```

**After the user types an invalid password**, two things change: `aria-invalid="true"` appears on the input, and the validation region is inserted with the live messages and added to `aria-describedby`:

```html
<div data-password-input-container>
  <label for=":r1:">Create Password</label>
  <div id=":r2:">Must be at least 8 characters</div>

  <div data-password-input-wrapper>
    <input
      id=":r1:"
      type="password"
      autocomplete="new-password"
      aria-invalid="true"
      aria-describedby=":r2: :r3:"
    />
    <button type="button" aria-label="Hide password" aria-pressed="true">Hide</button>
  </div>

  <div
    id=":r3:"
    role="alert"
    aria-live="polite"
    aria-atomic="true"
    data-password-validation
  >
    <ul>
      <li data-severity="warning">Password must be at least 8 characters</li>
    </ul>
  </div>
</div>
```

Two patterns worth calling out:

- **`aria-invalid` is `true` or absent**, never `"false"`. The component uses `aria-invalid={invalid ? true : undefined}` so a freshly mounted (untouched) input is not pre-announced as valid by assistive tech.
- **The validation region is conditional**, not persistent. The whole `<div role="alert">` only mounts when there's a message to render (warning text or one or more suggestions). A valid password produces no region at all.
- **IDs (`:r1:`, `:r2:`, `:r3:`) come from `React.useId()`** so they're stable per-instance and SSR-safe — concrete values vary across renders/processes; don't query the DOM by hard-coded ID.

## ARIA Attributes

### `aria-invalid`

Indicates validation state. The general ARIA pattern is to set `aria-invalid={!isValid}` — `true` or `false` — but the bundled `PasswordInput` deliberately renders `aria-invalid` as `true` *or omits the attribute entirely* (using `true | undefined`), so a freshly mounted input isn't pre-announced as "valid" by screen readers:

```tsx
<input
  type="password"
  aria-invalid={isInvalid ? true : undefined}
/>
```

### `aria-describedby`

Links input to description and errors:

```typescript
<input
  type="password"
  aria-describedby="password-desc password-errors"
/>
<p id="password-desc">Password requirements</p>
<div id="password-errors">Validation messages</div>
```

### `aria-label`

Provides accessible labels for buttons:

```typescript
<button
  type="button"
  aria-label="Show password"
  aria-pressed={isPasswordVisible}
>
  {isPasswordVisible ? 'Hide' : 'Show'}
</button>
```

### `aria-live`

Announces validation changes to screen readers:

```tsx
<div role="alert" aria-live="polite">
  {result?.feedback.suggestions.map((msg, i) => (
    <p key={i}>{msg}</p>
  ))}
</div>
```

## Keyboard Navigation

Full keyboard support:

### Tab Navigation

Navigate between fields and buttons:

```typescript
// Tab order:
// 1. Label (skipped, not focusable)
// 2. Password input
// 3. Show/hide button
// 4. Validation messages (skipped, not focusable)
// 5. Next form field
```

### Escape Key

Clear password and reset validation:

```typescript
<input
  type="password"
  onKeyDown={(e) => {
    if (e.key === 'Escape') {
      // Clears input and resets validation
    }
  }}
/>
```

### Enter/Space on Toggle Button

Toggle password visibility:

```typescript
<button
  type="button"
  onClick={toggleVisibility}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleVisibility()
    }
  }}
>
  Show
</button>
```

## Screen Reader Support

### Meaningful Labels

Always provide clear labels:

```tsx
// ✅ Good
<PasswordInput
  label="Create Password"
  description="At least 8 characters; avoids common passwords and obvious patterns"
/>

// ❌ Bad (no label)
<input type="password" />
```

The description should match the policy actually enforced. `PasswordInput` validates against the built-in defaults; for stricter requirements, drive the input from `usePasswordValidator` and write your own description.

### Error Announcements

Errors are announced via `aria-live`:

```typescript
<div role="alert" aria-live="polite">
  <p>Password must be at least 8 characters long</p>
</div>
```

Screen reader announces:
> "Password must be at least 8 characters long"

### Toggle Button Feedback

State changes are announced:

```typescript
<button
  aria-label={isVisible ? "Hide password" : "Show password"}
  aria-pressed={isVisible}
>
  {isVisible ? 'Hide' : 'Show'}
</button>
```

Screen reader announces:
> "Show password, button, not pressed"

After clicking:
> "Hide password, button, pressed"

## Focus Management

### Visible Focus Indicators

Ensure focus is clearly visible:

```css
input:focus {
  outline: 2px solid #3c8772;
  outline-offset: 2px;
}

/* Or use box-shadow */
input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(60, 135, 114, 0.3);
}
```

### Focus Trapping

For modal dialogs with password inputs:

```typescript
import { useEffect, useRef } from 'react'

function PasswordModal({ isOpen, onClose }) {
  const modalRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!isOpen) return
    
    const modal = modalRef.current
    if (!modal) return
    
    // Focus first input
    const firstInput = modal.querySelector('input')
    firstInput?.focus()
    
    // Trap focus within modal
    const handleTabKey = (e: KeyboardEvent) => {
      const focusableElements = modal.querySelectorAll(
        'button, input, textarea, select, a[href]'
      )
      const first = focusableElements[0] as HTMLElement
      const last = focusableElements[focusableElements.length - 1] as HTMLElement
      
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    
    modal.addEventListener('keydown', handleTabKey)
    return () => modal.removeEventListener('keydown', handleTabKey)
  }, [isOpen])
  
  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      <h2>Change Password</h2>
      <PasswordInput label="New Password" />
      <button onClick={onClose}>Cancel</button>
      <button>Save</button>
    </div>
  )
}
```

## Color Contrast

Ensure sufficient contrast for all users:

```css
/* WCAG AAA requires 7:1 for normal text, 4.5:1 for large text */

/* ✅ Good contrast */
.error {
  color: #c41e3a; /* Red on white: 7.02:1 */
}

.success {
  color: #28a745; /* Green on white: 4.53:1 */
}

/* ❌ Poor contrast */
.error {
  color: #ff8888; /* Light red on white: 2.1:1 - fails WCAG */
}
```

Use tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify.

## High Contrast Mode

Support Windows High Contrast Mode:

```css
@media (prefers-contrast: high) {
  input {
    border: 2px solid currentColor;
  }
  
  input:focus {
    outline: 3px solid currentColor;
  }
}
```

## Reduced Motion

Respect user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Error Messaging Best Practices

### Be Specific

```typescript
// ❌ Vague
"Invalid password"

// ✅ Specific
"Password must be at least 8 characters long"
```

### Provide Solutions

```typescript
// ❌ Problem only
"Password is too weak"

// ✅ Problem + solution
"Password is too weak. Add uppercase letters, numbers, or symbols to strengthen it"
```

### Use Friendly Language

```typescript
// ❌ Technical jargon
"Password validation failed: MISSING_UPPERCASE_CHARS"

// ✅ User-friendly
"Password must contain at least one uppercase letter"
```

## Testing Accessibility

### Automated Testing

Use tools like:
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

```tsx
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'

test('PasswordInput is accessible', async () => {
  const { container } = render(<PasswordInput label="Password" />)

  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Manual Testing

Test with:
- ✅ Keyboard only (no mouse)
- ✅ Screen reader (NVDA, JAWS, VoiceOver)
- ✅ Browser zoom (200%, 400%)
- ✅ High contrast mode
- ✅ Color blindness simulators

### Screen Reader Testing

#### macOS VoiceOver

1. Enable: `Cmd + F5`
2. Navigate: `Ctrl + Option + Arrow Keys`
3. Interact: `Ctrl + Option + Space`

#### Windows NVDA

1. Start NVDA
2. Navigate: Arrow Keys
3. Forms mode: Automatic on input focus

## Complete Accessible Example

```typescript
import { PasswordInput } from '@sentinel-password/react-components'

function AccessibleSignupForm() {
  return (
    <form>
      <h1>Create Account</h1>
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          aria-required="true"
        />
      </div>
      
      <PasswordInput
        label="Password"
        description="At least 8 characters; avoids common passwords and obvious patterns"
        containerClassName="password-field"
        className="password-input"
      />
      
      <button type="submit">
        Create Account
      </button>
      
      <style jsx>{`
        .password-input:focus {
          outline: 2px solid #3c8772;
          outline-offset: 2px;
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </form>
  )
}
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project](https://www.a11yproject.com/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## See Also

- [React Components API](/api/react-components)
- [Getting Started](/guide/getting-started)
- [Examples](/examples/)
