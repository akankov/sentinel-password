import type { Preview } from '@storybook/react'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // Accessibility configuration
      config: {
        rules: [
          {
            // Ensure WCAG 2.1 AAA compliance
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
}

export default preview
