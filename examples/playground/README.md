# Sentinel Password Playground

An interactive playground to explore and test the Sentinel Password component with live configuration options.

## Features

- **Live Demo**: Test password validation in real-time
- **Interactive Configuration**: Toggle component options and see immediate results
- **Validation Insights**: Detailed breakdown of validation checks and strength scores
- **Code Examples**: Auto-generated code snippets based on your configuration
- **Visual Feedback**: Beautiful UI showing password strength and validation status

## Getting Started

Run these commands from the **repo root** (not from inside this directory). The workspace is set up so `pnpm --filter playground <script>` runs only the playground.

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm --filter playground dev
```

Open [http://localhost:5173](http://localhost:5173) to view the playground.

> A bare `pnpm dev` from the repo root runs `turbo run dev` across **every** workspace (docs site, all examples, both Storybooks) — almost never what you want.

## What You Can Test

The playground wraps `PasswordInput` from `@sentinel-password/react-components`. The component currently runs `validatePassword(password)` with **no options**, so the policy itself can't be reconfigured from the UI — what you can tune is the *component's behavior* and observe how the built-in default policy reacts to your input.

- **Live strength feedback** — strength label plus the numeric 0–4 score (`{score}/4` next to the label) update as you type
- **Per-check pass/fail grid** — all seven built-in checks (length, character types, repetition, sequential patterns, keyboard patterns, common passwords, personal info) run with the default policy and are shown in the result panel. The `personalInfo` check has nothing to compare against (no `personalInfo` array is supplied), so it always passes.
- **Component behavior toggles**:
  - Validate on mount
  - Validate on change
  - Debounce delay
  - Show/hide built-in validation messages
  - Show/hide password toggle button
- **Live region** — the playground's result panel is a `role="status" aria-live="polite"` region, so screen-reader users are notified when validation results change

To experiment with custom policies (`minLength`, `require*`, `personalInfo`, etc.), drive a plain `<input>` from `usePasswordValidator` directly — see the [`usePasswordValidator` API reference](https://akankov.github.io/sentinel-password/api/react.html) and [Configuration guide](https://akankov.github.io/sentinel-password/guide/configuration.html).

## Building for Production

Build the playground (from the repo root):

```bash
pnpm --filter playground build
```

Preview the production build:

```bash
pnpm --filter playground preview
```

## Embedding in Documentation

The playground can be embedded in the documentation site using an iframe or deployed as a standalone app.

## Learn More

- [Sentinel Password Documentation](https://akankov.github.io/sentinel-password/)
- [Component API Reference](https://akankov.github.io/sentinel-password/api/react-components.html)
- [Vite Documentation](https://vite.dev/)
