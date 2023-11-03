import {
  omniSidebarManageBorrowishSteps,
  omniSidebarManageSteps,
  omniSidebarSetupSteps,
} from 'features/omni-kit/constants'
import { OmniProductType, type OmniSidebarStepsSet } from 'features/omni-kit/types'

export const morphoSeoTags = {
  productKey: `seo.morphoProductPage.title`,
  descriptionKey: 'seo.morpho.description',
}

export const morphoOmniSteps: OmniSidebarStepsSet = {
  borrow: {
    setup: omniSidebarSetupSteps,
    manage: omniSidebarManageBorrowishSteps,
  },
  earn: {
    setup: omniSidebarSetupSteps,
    manage: omniSidebarManageSteps,
  },
  multiply: {
    setup: omniSidebarSetupSteps,
    manage: omniSidebarManageBorrowishSteps,
  },
}

export const morphoSupportedPairs = ['ETH-USDC', 'ETH-DAI', 'WSTETH-USDC']

export const morphoProducts = [OmniProductType.Borrow, OmniProductType.Multiply]
