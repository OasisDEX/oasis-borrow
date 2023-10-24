import type { OmniSteps } from 'features/omni-kit/types'

export const ajnaOmniSteps: OmniSteps = {
  borrow: {
    open: ['risk', 'setup', 'dpm', 'transaction'],
    manage: ['manage', 'dpm', 'transaction', 'transition'],
  },
  earn: {
    open: ['risk', 'setup', 'dpm', 'transaction'],
    manage: ['manage', 'dpm', 'transaction', 'transition'],
  },
  multiply: {
    open: ['risk', 'setup', 'dpm', 'transaction'],
    manage: ['manage', 'dpm', 'transaction'],
  },
}
