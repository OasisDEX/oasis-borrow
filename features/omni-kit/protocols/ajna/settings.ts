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
    [NetworkIds.OPTIMISMMAINNET]: 'Ajna_rc14',
    [NetworkIds.ARBITRUMMAINNET]: 'Ajna_rc14',
  },
  supportedNetworkIds: [
    NetworkIds.BASEMAINNET,
    NetworkIds.GOERLI,
    NetworkIds.MAINNET,
    NetworkIds.OPTIMISMMAINNET,
    NetworkIds.ARBITRUMMAINNET,
  ],
  supportedMainnetNetworkIds: [
    NetworkIds.BASEMAINNET,
    NetworkIds.MAINNET,
    NetworkIds.OPTIMISMMAINNET,
    NetworkIds.ARBITRUMMAINNET,
  ],
  supportedProducts: [OmniProductType.Borrow, OmniProductType.Earn, OmniProductType.Multiply],
  supportedMultiplyTokens: {
    [NetworkIds.MAINNET]: [
      'ARB',
      'CBETH',
      'DAI',
      'ENA',
      'ETH',
      'MEVETH',
      'MKR',
      'OP',
      'RETH',
      'SAFE',
      'SDAI',
      'SUSDE',
      'USDC',
      'WBTC',
      'WSTETH',
      'XETH',
      'YFI',
      'WOETH',
      'MBASIS',
    ],
    [NetworkIds.GOERLI]: [],
    [NetworkIds.BASEMAINNET]: [
      'AERO',
      'CBETH',
      'DEGEN',
      'ETH',
      'PRIME',
      'SNX',
      'USDBC',
      'USDC',
      'WSTETH',
    ],
    [NetworkIds.ARBITRUMMAINNET]: [
      'ARB',
      'CBETH',
      'DAI',
      'ETH',
      'MEVETH',
      'MKR',
      'OP',
      'RETH',
      'SDAI',
      'SUSDE',
      'USDC',
      'WBTC',
      'WSTETH',
      'XETH',
      'YFI',
      'WOETH',
    ],
    [NetworkIds.OPTIMISMMAINNET]: [
      'ARB',
      'CBETH',
      'DAI',
      'ETH',
      'MEVETH',
      'MKR',
      'OP',
      'RETH',
      'SDAI',
      'SUSDE',
      'USDC',
      'WBTC',
      'WSTETH',
      'XETH',
      'YFI',
    ],
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
  availableAutomations: {
    [NetworkIds.MAINNET]: [],
    [NetworkIds.ARBITRUMMAINNET]: [],
    [NetworkIds.BASEMAINNET]: [],
    [NetworkIds.OPTIMISMMAINNET]: [],
  },
}
