import { NetworkIds } from 'blockchain/networks'
import {
  omniSidebarManageBorrowishSteps,
  omniSidebarManageSteps,
  omniSidebarSetupSteps,
} from 'features/omni-kit/constants'
import {
  OmniProductType,
  type OmniProtocolSettings,
  OmniSidebarStep,
} from 'features/omni-kit/types'

export const settings: OmniProtocolSettings = {
  rawName: {
    [NetworkIds.MAINNET]: 'Ajna_rc13',
    [NetworkIds.GOERLI]: 'Ajna_rc13',
    [NetworkIds.BASEMAINNET]: 'Ajna_rc14',
  },
  supportedNetworkIds: [NetworkIds.BASEMAINNET, NetworkIds.GOERLI, NetworkIds.MAINNET],
  supportedMainnetNetworkIds: [NetworkIds.BASEMAINNET, NetworkIds.MAINNET],
  supportedProducts: [OmniProductType.Borrow, OmniProductType.Earn, OmniProductType.Multiply],
  supportedMultiplyTokens: {
    [NetworkIds.MAINNET]: [
      'CBETH',
      'DAI',
      'ETH',
      'RETH',
      'SDAI',
      'USDC',
      'WBTC',
      'WSTETH',
      'YFI',
      'MKR',
    ],
    [NetworkIds.GOERLI]: [],
    [NetworkIds.BASEMAINNET]: ['CBETH', 'ETH', 'USDC', 'USDBC', 'WSTETH'],
  },
  steps: {
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
  },
}
