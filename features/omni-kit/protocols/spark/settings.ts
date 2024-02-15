import { NetworkIds } from 'blockchain/networks'
import { omniSidebarManageBorrowishSteps, omniSidebarSetupSteps } from 'features/omni-kit/constants'
import type { OmniProtocolSettings } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'

export const omniKitSparkSettings: OmniProtocolSettings = {
  rawName: 'Spark',
  supportedNetworkIds: [NetworkIds.MAINNET],
  supportedMainnetNetworkIds: [NetworkIds.MAINNET],
  supportedProducts: [OmniProductType.Borrow, OmniProductType.Multiply],
  steps: {
    borrow: {
      setup: omniSidebarSetupSteps,
      manage: omniSidebarManageBorrowishSteps,
    },
    earn: {
      setup: [],
      manage: [],
    },
    multiply: {
      setup: omniSidebarSetupSteps,
      manage: omniSidebarManageBorrowishSteps,
    },
  },
}
