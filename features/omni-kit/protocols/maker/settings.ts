import { NetworkIds } from 'blockchain/networks'
import { AutomationFeatures } from 'features/automation/common/types'
import { omniSidebarManageBorrowishSteps, omniSidebarSetupSteps } from 'features/omni-kit/constants'
import type { NetworkIdsWithValues, OmniProtocolSettings } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'

export const makerMarkets: NetworkIdsWithValues<{ [key: string]: string[] }> = {
  [NetworkIds.MAINNET]: {
    'ETH-DAI': [
      '0x4554482d41000000000000000000000000000000000000000000000000000000', // ETH-A
      '0x4554482d42000000000000000000000000000000000000000000000000000000', // ETH-B
      '0x4554482d43000000000000000000000000000000000000000000000000000000', // ETH-C
    ],
    'RETH-DAI': [
      '0x524554482d410000000000000000000000000000000000000000000000000000', // RETH-A
    ],
    'WSTETH-DAI': [
      '0x5753544554482d41000000000000000000000000000000000000000000000000', // WSTETH-A
      '0x5753544554482d42000000000000000000000000000000000000000000000000', // WSTETH-B
    ],
    'WBTC-DAI': [
      '0x574254432d410000000000000000000000000000000000000000000000000000', // WBTC-A
      '0x574254432d420000000000000000000000000000000000000000000000000000', // WBTC-B
      '0x574254432d430000000000000000000000000000000000000000000000000000', // WBTC-C
    ],
  },
}

export const settings: OmniProtocolSettings = {
  rawName: {
    [NetworkIds.MAINNET]: 'Maker',
  },
  supportedNetworkIds: [NetworkIds.MAINNET],
  supportedMainnetNetworkIds: [NetworkIds.MAINNET],
  supportedProducts: [OmniProductType.Borrow, OmniProductType.Multiply],
  supportedMultiplyTokens: {
    [NetworkIds.MAINNET]: [
      'ETH',
      'WBTC',
      'WSTETH',
      'RENBTC',
      'YFI',
      'UNI',
      'LINK',
      'MANA',
      'RETH',
      'DAI',
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
    [NetworkIds.MAINNET]: [
      AutomationFeatures.AUTO_BUY,
      AutomationFeatures.AUTO_SELL,
      AutomationFeatures.CONSTANT_MULTIPLE,
      AutomationFeatures.AUTO_TAKE_PROFIT,
      AutomationFeatures.STOP_LOSS,
    ],
  },
  markets: makerMarkets,
}
