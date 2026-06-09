import '@testing-library/jest-dom/vitest'
import { expect } from 'vitest'
import { toHaveNoViolations } from 'vitest-axe/matchers'
// vitest-axe's `extend-expect` entry only ships the type augmentation (its
// runtime is empty), so register the matcher explicitly against this project's
// non-global `expect`.
import 'vitest-axe/extend-expect'

expect.extend({ toHaveNoViolations })
