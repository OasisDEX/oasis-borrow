import { NetworkIds } from 'blockchain/networks'
import { AutomationFeatures } from 'features/automation/common/types'
import { omniSidebarManageBorrowishSteps, omniSidebarSetupSteps } from 'features/omni-kit/constants'
import type { OmniProtocolSettings } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'

const availableSparkAutomations = [
  AutomationFeatures.STOP_LOSS,
  AutomationFeatures.TRAILING_STOP_LOSS,
  AutomationFeatures.AUTO_SELL,
  AutomationFeatures.AUTO_BUY,
  AutomationFeatures.PARTIAL_TAKE_PROFIT,
]

export const sparkRawProtocolName = 'Spark'

export const settings: OmniProtocolSettings = {
  rawName: {
    [NetworkIds.MAINNET]: sparkRawProtocolName,
  },
  supportedNetworkIds: [NetworkIds.MAINNET],
  supportedMainnetNetworkIds: [NetworkIds.MAINNET],
  supportedProducts: [OmniProductType.Borrow, OmniProductType.Multiply],
  supportedMultiplyTokens: {
    [NetworkIds.MAINNET]: [
      'ETH',
      'WSTETH',
      'RETH',
      'DAI',
      'SDAI',
      'USDC',
      'USDT',
      'WBTC',
      'CBBTC',
      'WEETH',
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
  availableAutomations: {
    [NetworkIds.MAINNET]: availableSparkAutomations,
    [NetworkIds.ARBITRUMMAINNET]: availableSparkAutomations,
    [NetworkIds.BASEMAINNET]: availableSparkAutomations,
    [NetworkIds.OPTIMISMMAINNET]: availableSparkAutomations,
  },
}
