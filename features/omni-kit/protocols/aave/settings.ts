import { NetworkIds } from 'blockchain/networks'
import { AutomationFeatures } from 'features/automation/common/types'
import { omniSidebarManageBorrowishSteps, omniSidebarSetupSteps } from 'features/omni-kit/constants'
import type { OmniProtocolSettings } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'

const availableAaveV3Automations = [
  AutomationFeatures.AUTO_BUY,
  AutomationFeatures.AUTO_SELL,
  AutomationFeatures.PARTIAL_TAKE_PROFIT,
  AutomationFeatures.STOP_LOSS,
  AutomationFeatures.TRAILING_STOP_LOSS,
]

export const aaveV2RawProtocolName = 'AAVE'

export const settingsV2: OmniProtocolSettings = {
  rawName: {
    [NetworkIds.MAINNET]: aaveV2RawProtocolName,
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
  availableAutomations: {
    [NetworkIds.MAINNET]: [],
  },
}

export const aaveV3RawProtocolName = 'AAVE_V3'

export const settingsV3: OmniProtocolSettings = {
  rawName: {
    [NetworkIds.MAINNET]: aaveV3RawProtocolName,
    [NetworkIds.ARBITRUMMAINNET]: aaveV3RawProtocolName,
    [NetworkIds.OPTIMISMMAINNET]: aaveV3RawProtocolName,
    [NetworkIds.BASEMAINNET]: aaveV3RawProtocolName,
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
  availableAutomations: {
    [NetworkIds.MAINNET]: availableAaveV3Automations,
    [NetworkIds.ARBITRUMMAINNET]: availableAaveV3Automations,
    [NetworkIds.BASEMAINNET]: availableAaveV3Automations,
    [NetworkIds.OPTIMISMMAINNET]: availableAaveV3Automations,
  },
}
