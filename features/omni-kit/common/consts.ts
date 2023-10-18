import type { OmniFlow, OmniProduct, OmniSidebarStep } from 'features/omni-kit/types/common.types'

export const omniProducts: OmniProduct[] = ['borrow', 'earn', 'multiply']
export const omniFormExternalSteps: OmniSidebarStep[] = ['dpm']
export const omniFormStepsWithTransaction: OmniSidebarStep[] = ['transaction']

export const omniSteps: {
  [ProductKey in OmniProduct]: {
    [FlowKey in OmniFlow]: OmniSidebarStep[]
  }
} = {
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
