# Examples

Interactive examples and code snippets for common use cases.

## Quick Links

- [Basic Validation](#basic-validation)
- [React Form Integration](#react-form)
- [Custom Styling](#custom-styling)
- [Real-time Feedback](#real-time-feedback)
- [Multi-step Forms](#multi-step-forms)

## Basic Validation

Simple password validation with the core package:

```typescript
import { validatePassword } from '@sentinel-password/core'

const password = 'MySecureP@ss123'

const result = validatePassword(password, {
  validators: {
    length: { min: 8, max: 128 },
    characterTypes: {
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true
    }
  }
})

console.log(result)
// {
//   isValid: true,
//   errors: [],
//   warnings: [],
//   strength: 'strong'
// }
```

## React Form

Complete signup form with password validation:

```typescript
import { useState } from 'react'
import { usePasswordValidator } from '@sentinel-password/react'

function SignupForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  
  const {
    value: password,
    isValid,
    errors,
    strength,
    handleChange
  } = usePasswordValidator({
    validators: {
      length: { min: 8 },
      characterTypes: {
        requireUppercase: true,
        requireNumbers: true
      },
      commonPassword: { enabled: true }
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValid) {
      alert('Please fix password errors')
      return
    }
    
    // Submit to API
    await fetch('/api/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    
    setSubmitted(true)
  }

  if (submitted) {
    return <p>Account created successfully!</p>
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={handleChange}
          aria-invalid={!isValid}
        />
        
        {errors.map(error => (
          <p key={error.code} style={{ color: 'red' }}>
            {error.message}
          </p>
        ))}
        
        <p>Strength: <strong>{strength}</strong></p>
      </div>

      <button type="submit" disabled={!isValid || !email}>
        Sign Up
      </button>
    </form>
  )
}
```

## Custom Styling

Style the PasswordInput component with Tailwind CSS:

```typescript
import { PasswordInput } from '@sentinel-password/react-components'

function StyledForm() {
  return (
    <div className="max-w-md mx-auto p-6">
      <PasswordInput
        label="Create Password"
        description="Must be at least 8 characters"
        className="mb-6"
        labelClassName="block text-sm font-semibold text-gray-900 mb-2"
        descriptionClassName="text-sm text-gray-600 mb-3"
        inputWrapperClassName="relative"
        inputClassName="w-full px-4 py-3 pr-24 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
        toggleButtonClassName="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        validationClassName="mt-3 space-y-2"
        validators={{
          length: { min: 8 },
          characterTypes: {
            requireUppercase: true,
            requireNumbers: true
          }
        }}
      />
    </div>
  )
}
```

## Real-time Feedback

Visual strength indicator:

```typescript
import { usePasswordValidator } from '@sentinel-password/react'

function PasswordWithStrength() {
  const {
    value,
    isValid,
    errors,
    strength,
    handleChange
  } = usePasswordValidator({
    validators: {
      length: { min: 8 },
      characterTypes: {
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: true
      }
    }
  })

  const getStrengthColor = () => {
    if (strength === 'weak') return 'bg-red-500'
    if (strength === 'medium') return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthWidth = () => {
    if (strength === 'weak') return 'w-1/3'
    if (strength === 'medium') return 'w-2/3'
    return 'w-full'
  }

  return (
    <div>
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={value}
        onChange={handleChange}
      />
      
      {/* Strength bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
        <div 
          className={`h-full rounded-full transition-all ${getStrengthColor()} ${getStrengthWidth()}`}
        />
      </div>
      
      <p className="mt-1 text-sm text-gray-600">
        Strength: <span className="font-semibold">{strength}</span>
      </p>
      
      {/* Validation errors */}
      {errors.length > 0 && (
        <ul className="mt-2 space-y-1">
          {errors.map(error => (
            <li key={error.code} className="text-sm text-red-600">
              ✗ {error.message}
            </li>
          ))}
        </ul>
      )}
      
      {/* Success state */}
      {isValid && value && (
        <p className="mt-2 text-sm text-green-600">
          ✓ Password meets all requirements
        </p>
      )}
    </div>
  )
}
```

## Multi-step Forms

Password validation in a multi-step wizard:

```typescript
import { useState } from 'react'
import { usePasswordValidator } from '@sentinel-password/react'

type Step = 'email' | 'password' | 'profile' | 'complete'

function MultiStepSignup() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  
  const {
    value: password,
    isValid: passwordValid,
    errors,
    handleChange
  } = usePasswordValidator({
    validators: {
      length: { min: 8 },
      characterTypes: {
        requireUppercase: true,
        requireNumbers: true
      },
      personalInfo: {
        enabled: true,
        fields: [email, name].filter(Boolean)
      }
    }
  })

  const nextStep = () => {
    if (step === 'email' && email) setStep('password')
    else if (step === 'password' && passwordValid) setStep('profile')
    else if (step === 'profile' && name) setStep('complete')
  }

  const prevStep = () => {
    if (step === 'password') setStep('email')
    else if (step === 'profile') setStep('password')
  }

  return (
    <div>
      <h2>Create Account - Step {
        step === 'email' ? '1' :
        step === 'password' ? '2' :
        step === 'profile' ? '3' : '4'
      } of 3</h2>
      
      {step === 'email' && (
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={nextStep} disabled={!email}>
            Next
          </button>
        </div>
      )}
      
      {step === 'password' && (
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={handleChange}
          />
          {errors.map(error => (
            <p key={error.code}>{error.message}</p>
          ))}
          <button onClick={prevStep}>Back</button>
          <button onClick={nextStep} disabled={!passwordValid}>
            Next
          </button>
        </div>
      )}
      
      {step === 'profile' && (
        <div>
          <label>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={prevStep}>Back</button>
          <button onClick={nextStep} disabled={!name}>
            Complete
          </button>
        </div>
      )}
      
      {step === 'complete' && (
        <div>
          <h3>Account Created!</h3>
          <p>Email: {email}</p>
          <p>Name: {name}</p>
        </div>
      )}
    </div>
  )
}
```

## More Examples

Browse our [Storybook](https://github.com/akankov/sentinel-password) for interactive examples.

## See Also

- [Getting Started](/guide/getting-started)
- [API Reference](/api/core)
- [Validators Guide](/guide/validators)
