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
  supportedProducts: [OmniProductType.Borrow, OmniProductType.Multiply, OmniProductType.Earn],
  supportedMultiplyTokens: {
    [NetworkIds.MAINNET]: [
      'ETH',
      'WSTETH',
      'WEETH',
      'OSETH',
      'RETH',
      'SDAI',
      'DAI',
      'USDC',
      'USDT',
      'WBTC',
      'EZETH',
      'SUSDE',
      'USDE',
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
    [NetworkIds.MAINNET]: [],
  },
}

export const morphoMarkets: NetworkIdsWithValues<{ [key: string]: string[] }> = {
  [NetworkIds.MAINNET]: {
    'WSTETH-ETH': ['0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41'],
    'WEETH-ETH': ['0x698fe98247a40c5771537b5786b2f3f9d78eb487b4ce4d75533cd0e94d88a115'],
    'WSTETH-USDC': ['0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc'],
    'ETH-USDC': [
      '0xf9acc677910cc17f650416a22e2a14d5da7ccb9626db18f1bf94efe64f92b372',
      '0x7dde86a1e94561d9690ec678db673c1a6396365f7d1d65e129c5fff0990ff758',
    ],
    'WBTC-USDC': ['0x3a85e619751152991742810df6ec69ce473daef99e28a64ab2340d7b7ccfee49'],
    'SDAI-USDC': ['0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1'],
    'SDAI-USDT': ['0xf213843ac8ce2c8408182fc80c9e8f9911b420cce24adec8ea105ae44de087ad'],
    'OSETH-ETH': ['0xd5211d0e3f4a30d5c98653d988585792bb7812221f04801be73a44ceecb11e89'],
    'WBTC-USDT': ['0xa921ef34e2fc7a27ccc50ae7e4b154e16c9799d3387076c421423ef52ac4df99'],
    'WSTETH-USDT': ['0xe7e9694b754c4d4f7e21faf7223f6fa71abaeb10296a4c43a54a7977149687d2'],
    'ETH-USDT': ['0xdbffac82c2dc7e8aa781bd05746530b0068d80929f23ac1628580e27810bc0c5'],
    'RETH-ETH': ['0x3c83f77bde9541f8d3d82533b19bbc1f97eb2f1098bb991728acbfbede09cc5d'],
    'EZETH-ETH': ['0x49bb2d114be9041a787432952927f6f144f05ad3e83196a7d062f374ee11d0ee'],
    'APXETH-ETH': ['0x8bbd1763671eb82a75d5f7ca33a0023ffabdd9d1a3d4316f34753685ae988e80'],
    'SUSDE-DAI': [
      '0x1247f1c237eceae0602eab1470a5061a6dd8f734ba88c7cdc5d6109fb0026b28',
      '0x39d11026eae1c6ec02aa4c0910778664089cdd97c3fd23f68f7cd05e2e95af48',
      '0xe475337d11be1db07f7c5a156e511f05d1844308e66e17d2ba5da0839d3b34d9',
      '0x42dcfb38bb98767afb6e38ccf90d59d0d3f0aa216beb3a234f12850323d17536',
    ],
    'USDE-DAI': [
      '0x8e6aeb10c401de3279ac79b4b2ea15fc94b7d9cfc098d6c2a1ff7b2b26d9d02c',
      '0xdb760246f6859780f6c1b272d47a8f64710777121118e56e0cdb4b8b744a3094',
      '0xc581c5f70bd1afa283eed57d1418c6432cbff1d862f94eaf58fdd4e46afbb67f',
      '0xfd8493f09eb6203615221378d89f53fcd92ff4f7d62cca87eece9a2fff59e86f',
    ],
    'SUSDE-USDT': ['0xdc5333039bcf15f1237133f74d5806675d83d9cf19cfd4cfdd9be674842651bf'],
    'MKR-DAI': ['0x578996c3c3ac4f100c4284b5c239673b04840e07945d04b681763c7b3401997c'],
  },
}
