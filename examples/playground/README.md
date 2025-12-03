# Sentinel Password Playground

An interactive playground to explore and test the Sentinel Password component with live configuration options.

## Features

- **Live Demo**: Test password validation in real-time
- **Interactive Configuration**: Toggle component options and see immediate results
- **Validation Insights**: Detailed breakdown of validation checks and strength scores
- **Code Examples**: Auto-generated code snippets based on your configuration
- **Visual Feedback**: Beautiful UI showing password strength and validation status

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) to view the playground.

## What You Can Test

- **Password strength scoring** (0-4 scale)
- **Validation checks**: Length, character types, repetition, sequential patterns, keyboard patterns, common passwords, and personal info
- **Configuration options**:
  - Validate on mount
  - Validate on change
  - Debounce delay
  - Show/hide validation messages
  - Show/hide password toggle button
- **Real-time feedback** with accessible ARIA live regions

## Building for Production

Build the playground:

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

## Embedding in Documentation

The playground can be embedded in the documentation site using an iframe or deployed as a standalone app.

## Learn More

- [Sentinel Password Documentation](https://akankov.github.io/sentinel-password/)
- [Component API Reference](https://akankov.github.io/sentinel-password/api/react-components.html)
- [Vite Documentation](https://vite.dev/)
