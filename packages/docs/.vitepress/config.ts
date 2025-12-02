import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Sentinel Password',
  description: 'Flexible, accessible password validation for JavaScript and React',

  base: '/sentinel-password/',

  ignoreDeadLinks: true,

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/core' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'Packages',
        items: [
          { text: '@sentinel-password/core', link: '/api/core' },
          { text: '@sentinel-password/react', link: '/api/react' },
          { text: '@sentinel-password/react-components', link: '/api/react-components' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Why Sentinel Password?', link: '/guide/why-sentinel-password' },
            { text: 'Installation', link: '/guide/installation' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Validators', link: '/guide/validators' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Error Handling', link: '/guide/error-handling' },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Custom Validators', link: '/guide/custom-validators' },
            { text: 'Internationalization', link: '/guide/i18n' },
            { text: 'Accessibility', link: '/guide/accessibility' },
          ],
        },
      ],

      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Core Package', link: '/api/core' },
            { text: 'React Hook', link: '/api/react' },
            { text: 'React Components', link: '/api/react-components' },
          ],
        },
        {
          text: 'Validators',
          items: [
            { text: 'Length Validator', link: '/api/validators/length' },
            { text: 'Character Types', link: '/api/validators/character-types' },
            { text: 'Common Passwords', link: '/api/validators/common-password' },
            { text: 'Keyboard Patterns', link: '/api/validators/keyboard-pattern' },
            { text: 'Sequential Characters', link: '/api/validators/sequential' },
            { text: 'Repetition', link: '/api/validators/repetition' },
            { text: 'Personal Info', link: '/api/validators/personal-info' },
          ],
        },
      ],

      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Basic Validation', link: '/examples/basic-validation' },
            { text: 'React Form', link: '/examples/react-form' },
            { text: 'Custom Styling', link: '/examples/custom-styling' },
            { text: 'Real-time Feedback', link: '/examples/real-time-feedback' },
            { text: 'Multi-step Forms', link: '/examples/multi-step-forms' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/akankov/sentinel-password' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@sentinel-password/core' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Alex Kankov',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/akankov/sentinel-password/edit/main/packages/docs/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/sentinel-password/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#3c8772' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'Sentinel Password | Flexible Password Validation' }],
    ['meta', { property: 'og:site_name', content: 'Sentinel Password' }],
    ['meta', { property: 'og:url', content: 'https://akankov.github.io/sentinel-password/' }],
  ],
})
