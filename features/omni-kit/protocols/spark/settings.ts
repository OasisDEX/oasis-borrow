import { NetworkIds } from 'blockchain/networks'
import { omniSidebarManageBorrowishSteps, omniSidebarSetupSteps } from 'features/omni-kit/constants'
import type { OmniProtocolSettings } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'

export const settings: OmniProtocolSettings = {
  rawName: {
    [NetworkIds.MAINNET]: 'Spark',
  },
  supportedNetworkIds: [
    NetworkIds.MAINNET,
    NetworkIds.ARBITRUMMAINNET,
    NetworkIds.OPTIMISMMAINNET,
    NetworkIds.BASEMAINNET,
  ],
  supportedMainnetNetworkIds: [
    NetworkIds.MAINNET,
    NetworkIds.ARBITRUMMAINNET,
    NetworkIds.OPTIMISMMAINNET,
    NetworkIds.BASEMAINNET,
  ],
  supportedProducts: [OmniProductType.Borrow, OmniProductType.Multiply, OmniProductType.Earn],
  supportedMultiplyTokens: {
    [NetworkIds.MAINNET]: [
      'ETH',
      'WSTETH',
      'WEETH',
      'OSETH',
      'SDAI',
      'DAI',
      'USDC',
      'USDT',
      'WBTC',
      'GHO',
      'MKR',
      'WBTC',
      'LDO',
      'LINK',
      'USDT',
      'RETH',
      'LUSD',
      'RPL',
    ],
  },
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
