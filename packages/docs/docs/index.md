---
layout: home

hero:
  name: Sentinel Password
  text: Flexible Password Validation
  tagline: Accessible, customizable password validation for JavaScript and React
  image:
    src: /logo.svg
    alt: Sentinel Password
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Try Playground
      link: https://akankov.github.io/sentinel-password/playground/
    - theme: alt
      text: View on GitHub
      link: https://github.com/akankov/sentinel-password

features:
  - icon: 🎯
    title: Flexible & Configurable
    details: Tune all seven built-in checks through a single flat options object — set length, character-type, and repetition thresholds, supply `personalInfo`, or short-circuit the sequential, keyboard-pattern, and common-password checks via their `check*` flags.
  
  - icon: ♿
    title: Designed for AAA
    details: Built with WCAG 2.1 AAA in mind — semantic HTML, ARIA live region, keyboard navigation, and a `useId()`-linked label. Full page conformance depends on your CSS (contrast) and surrounding markup.
  
  - icon: 🎨
    title: Headless Components
    details: Bring your own styles. Our React components are completely unstyled, giving you full control over the UI.
  
  - icon: 📦
    title: Tiny Bundle Size
    details: Core package is ~5.5 KB gzipped (under the 10 KB CI limit) with zero dependencies. Tree-shakeable validators load only what you need.
  
  - icon: 🌍
    title: Translatable
    details: Validator messages are short, stable English strings — map them to your locale with a lookup table at the application layer. Pluggable message templates are on the roadmap.
  
  - icon: ⚡
    title: Zero Dependencies
    details: The core package has no external dependencies, ensuring minimal bundle impact and maximum compatibility.
  
  - icon: 🔒
    title: Security Conscious
    details: Checks against common passwords, keyboard patterns, and personal information to help users create stronger passwords.
  
  - icon: 📱
    title: Framework Agnostic
    details: Use the core package with any JavaScript framework, or pull in our React hook and headless components for seamless integration.
  
  - icon: ✨
    title: TypeScript First
    details: Written in TypeScript with full type definitions for excellent IDE support and type safety.
---

## Quick Start

<div class="language-bash"><pre><code>npm install @sentinel-password/core</code></pre></div>

```typescript
import { validatePassword } from '@sentinel-password/core'

const result = validatePassword('MyP@ssw0rd!', {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true,
  checkCommonPasswords: true
})

if (result.valid) {
  console.log('Password is valid!')
} else {
  console.log('Suggestions:', result.feedback.suggestions)
}
```

## React Integration

```typescript
import { usePasswordValidator } from '@sentinel-password/react'

function SignupForm() {
  const { password, setPassword, result } = usePasswordValidator({
    minLength: 8,
    requireUppercase: true
  })

  return (
    <div>
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      {result && !result.valid && result.feedback.suggestions.map((suggestion, index) => (
        <p key={index}>{suggestion}</p>
      ))}
    </div>
  )
}
```

## Ready-to-Use Components

```typescript
import { PasswordInput } from '@sentinel-password/react-components'

function App() {
  return (
    <PasswordInput
      label="Create Password"
      onValidationChange={(result) => console.log(result)}
    />
  )
}
```

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #3c8772 30%, #41d1ff);
}
</style>
