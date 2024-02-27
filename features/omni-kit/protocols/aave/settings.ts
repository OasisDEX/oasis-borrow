import { NetworkIds } from 'blockchain/networks'
import { omniSidebarManageBorrowishSteps, omniSidebarSetupSteps } from 'features/omni-kit/constants'
import type { OmniProtocolSettings } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'

export const settingsV2: OmniProtocolSettings = {
  rawName: {
    [NetworkIds.MAINNET]: 'AAVE',
  },
  supportedNetworkIds: [NetworkIds.MAINNET],
  supportedMainnetNetworkIds: [NetworkIds.MAINNET],
  supportedProducts: [OmniProductType.Borrow, OmniProductType.Multiply],
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
  entryTokens: {
    [NetworkIds.MAINNET]: { 'STETH-ETH': 'ETH' },
    [NetworkIds.ARBITRUMMAINNET]: { 'STETH-ETH': 'ETH' },
    [NetworkIds.OPTIMISMMAINNET]: { 'STETH-ETH': 'ETH' },
    [NetworkIds.BASEMAINNET]: { 'STETH-ETH': 'ETH' },
  },
}

export const settingsV3: OmniProtocolSettings = {
  rawName: {
    [NetworkIds.MAINNET]: 'AAVE_V3',
    [NetworkIds.ARBITRUMMAINNET]: 'AAVE_V3',
    [NetworkIds.OPTIMISMMAINNET]: 'AAVE_V3',
    [NetworkIds.BASEMAINNET]: 'AAVE_V3',
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
  supportedProducts: [OmniProductType.Borrow, OmniProductType.Multiply],
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
  entryTokens: {
    [NetworkIds.MAINNET]: { 'WSTETH-ETH': 'ETH' },
    [NetworkIds.ARBITRUMMAINNET]: { 'WSTETH-ETH': 'ETH' },
    [NetworkIds.OPTIMISMMAINNET]: { 'WSTETH-ETH': 'ETH' },
    [NetworkIds.BASEMAINNET]: { 'WSTETH-ETH': 'ETH' },
  },
}
