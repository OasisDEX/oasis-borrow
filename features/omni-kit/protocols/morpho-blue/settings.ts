import { NetworkIds } from 'blockchain/networks'
import { omniSidebarManageBorrowishSteps, omniSidebarSetupSteps } from 'features/omni-kit/constants'
import type { NetworkIdsWithValues, OmniProtocolSettings } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'

export const settings: OmniProtocolSettings = {
  rawName: 'MorphoBlue',
  supportedNetworkIds: [NetworkIds.GOERLI],
  supportedMainnetNetworkIds: [],
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

export const morphoMarkets: NetworkIdsWithValues<{ [key: string]: string }> = {
  [NetworkIds.GOERLI]: {
    'WSTETH-ETH': '0x44f9ccdefcee6c2b8dc7bce454ea3a9dfc48ed3be1ef79ce4bc9696932b56ddd',
  },
}
