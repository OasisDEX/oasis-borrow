import { NetworkIds } from 'blockchain/networks'
import { omniSidebarSetupSteps } from 'features/omni-kit/constants'
import type { OmniProtocolSettings } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'

export const omniKitAaveSettings: OmniProtocolSettings = {
  rawName: 'Aave V3',
  supportedNetworkIds: [NetworkIds.MAINNET],
  supportedMainnetNetworkIds: [NetworkIds.MAINNET],
  supportedProducts: [OmniProductType.Earn],
  steps: {
    borrow: {
      setup: [],
      manage: [],
    },
    earn: {
      setup: omniSidebarSetupSteps,
      manage: [],
    },
    multiply: {
      setup: [],
      manage: [],
    },
  },
}
