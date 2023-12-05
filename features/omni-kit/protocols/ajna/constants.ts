import BigNumber from 'bignumber.js'
import {
  omniSidebarManageBorrowishSteps,
  omniSidebarManageSteps,
  omniSidebarSetupSteps,
} from 'features/omni-kit/constants'
import { OmniSidebarStep, type OmniSidebarStepsSet } from 'features/omni-kit/types'

export const AJNA_RAW_PROTOCOL_NAME = 'Ajna_rc10'

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

// safe defaults which should ensure reasonable slider range for newly created pools
export const ajnaDefaultPoolRangeMarketPriceOffset = 0.99 // 99%

export const LTVWarningThreshold = new BigNumber(0.05)
export const LUPPercentageOffset = new BigNumber(0.05)

export const AJNA_LUP_OFFSET = 0.06 // 6%
export const AJNA_HTP_OFFSET = 0.02 // 2%

export const ajnaLastIndexBucketPrice = new BigNumber(99836282890)
