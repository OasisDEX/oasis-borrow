import {
  omniSidebarManageBorrowishSteps,
  omniSidebarManageSteps,
  omniSidebarSetupSteps,
} from 'features/omni-kit/constants'
import { OmniSidebarStep, type OmniSidebarStepsSet } from 'features/omni-kit/types'

export const ajnaOmniSteps: OmniSidebarStepsSet = {
  borrow: {
    setup: [OmniSidebarStep.Risk, ...omniSidebarSetupSteps],
    manage: omniSidebarManageBorrowishSteps,
  },
  earn: {
    setup: [OmniSidebarStep.Risk, ...omniSidebarSetupSteps],
    manage: omniSidebarManageSteps,
  },
  multiply: {
    setup: [OmniSidebarStep.Risk, ...omniSidebarSetupSteps],
    manage: omniSidebarManageBorrowishSteps,
  },
}
