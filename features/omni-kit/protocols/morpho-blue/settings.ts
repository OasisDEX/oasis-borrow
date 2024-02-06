import { NetworkIds } from 'blockchain/networks'
import { omniSidebarManageBorrowishSteps, omniSidebarSetupSteps } from 'features/omni-kit/constants'
import type { NetworkIdsWithValues, OmniProtocolSettings } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'

export const settings: OmniProtocolSettings = {
  rawName: {
    [NetworkIds.MAINNET]: 'MorphoBlue',
  },
  supportedNetworkIds: [NetworkIds.MAINNET],
  supportedMainnetNetworkIds: [NetworkIds.MAINNET],
  supportedProducts: [OmniProductType.Borrow, OmniProductType.Multiply],
  supportedMultiplyTokens: {
    [NetworkIds.MAINNET]: ['WSTETH', 'ETH', 'WBTC', 'SDAI', 'SDAI', 'USDC'],
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

export const morphoMarkets: NetworkIdsWithValues<{ [key: string]: string }> = {
  [NetworkIds.MAINNET]: {
    'WSTETH-ETH': '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
    'WSTETH-USDC': '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc',
    'ETH-USDC': '0xf9acc677910cc17f650416a22e2a14d5da7ccb9626db18f1bf94efe64f92b372',
    'WBTC-USDC': '0x3a85e619751152991742810df6ec69ce473daef99e28a64ab2340d7b7ccfee49',
    'SDAI-USDC': '0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1',
  },
}
