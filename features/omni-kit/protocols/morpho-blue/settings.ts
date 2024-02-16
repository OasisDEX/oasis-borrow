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
    [NetworkIds.MAINNET]: [
      'ETH',
      'WSTETH',
      'WEETH',
      'OSETH',
      'RETH',
      'SDAI',
      'SDAI',
      'USDC',
      'USDT',
      'WBTC',
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

export const morphoMarkets: NetworkIdsWithValues<{ [key: string]: string }> = {
  [NetworkIds.MAINNET]: {
    'WSTETH-ETH': '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
    'WEETH-ETH': '0x698fe98247a40c5771537b5786b2f3f9d78eb487b4ce4d75533cd0e94d88a115',
    'WSTETH-USDC': '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc',
    'ETH-USDC': '0xf9acc677910cc17f650416a22e2a14d5da7ccb9626db18f1bf94efe64f92b372',
    'WBTC-USDC': '0x3a85e619751152991742810df6ec69ce473daef99e28a64ab2340d7b7ccfee49',
    'SDAI-USDC': '0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1',
    'SDAI-USDT': '0xf213843ac8ce2c8408182fc80c9e8f9911b420cce24adec8ea105ae44de087ad',
    'OSETH-ETH': '0xd5211d0e3f4a30d5c98653d988585792bb7812221f04801be73a44ceecb11e89',
    'WBTC-USDT': '0xa921ef34e2fc7a27ccc50ae7e4b154e16c9799d3387076c421423ef52ac4df99',
    'WSTETH-USDT': '0xe7e9694b754c4d4f7e21faf7223f6fa71abaeb10296a4c43a54a7977149687d2',
    'ETH-USDT': '0xdbffac82c2dc7e8aa781bd05746530b0068d80929f23ac1628580e27810bc0c5',
    'RETH-ETH': '0x3c83f77bde9541f8d3d82533b19bbc1f97eb2f1098bb991728acbfbede09cc5d',
  },
}
