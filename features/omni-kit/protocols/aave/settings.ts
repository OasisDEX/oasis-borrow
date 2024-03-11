import { NetworkIds } from 'blockchain/networks'
import { AutomationFeatures } from 'features/automation/common/types'
import { omniSidebarManageBorrowishSteps, omniSidebarSetupSteps } from 'features/omni-kit/constants'
import type { OmniProtocolSettings } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'

const availableAaveAutomations = [
  AutomationFeatures.STOP_LOSS,
  AutomationFeatures.TRAILING_STOP_LOSS,
  AutomationFeatures.AUTO_SELL,
  AutomationFeatures.AUTO_BUY,
  AutomationFeatures.PARTIAL_TAKE_PROFIT,
]

export const settingsV2: OmniProtocolSettings = {
  rawName: {
    [NetworkIds.MAINNET]: 'AAVE',
  },
  supportedNetworkIds: [NetworkIds.MAINNET],
  supportedMainnetNetworkIds: [NetworkIds.MAINNET],
  supportedProducts: [OmniProductType.Borrow, OmniProductType.Multiply],
  supportedMultiplyTokens: {
    [NetworkIds.MAINNET]: ['ETH', 'STETH', 'USDC', 'WBTC'],
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
  },
  yieldLoopPairsWithData: {
    [NetworkIds.MAINNET]: ['STETH-ETH'],
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
      'RETH',
      'WSTETH',
      'CBETH',
      'USDC',
      'DAI',
      'SDAI',
      'GHO',
      'MKR',
      'WBTC',
      'LDO',
      'USDT',
      'LINK',
      'LUSD',
      'RPL',
      'FRAX',
    ],
    [NetworkIds.ARBITRUMMAINNET]: ['ETH', 'RETH', 'WSTETH', 'USDC', 'DAI', 'WBTC'],
    [NetworkIds.BASEMAINNET]: ['ETH', 'CBETH', 'USDBC', 'USDC'],
    [NetworkIds.OPTIMISMMAINNET]: ['ETH', 'WSTETH', 'USDC', 'USDC.E', 'DAI', 'WBTC'],
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
  },
  yieldLoopPairsWithData: {
    [NetworkIds.MAINNET]: ['WSTETH-ETH'],
  },
  availableAutomations: {
    [NetworkIds.MAINNET]: availableAaveAutomations,
    [NetworkIds.ARBITRUMMAINNET]: availableAaveAutomations,
    [NetworkIds.BASEMAINNET]: availableAaveAutomations,
    [NetworkIds.OPTIMISMMAINNET]: availableAaveAutomations,
  },
}
