import { NetworkIds } from 'blockchain/networks'
import { AutomationFeatures } from 'features/automation/common/types'
import { omniSidebarManageBorrowishSteps, omniSidebarSetupSteps } from 'features/omni-kit/constants'
import type { NetworkIdsWithValues, OmniProtocolSettings } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'

export const morphoMarkets: NetworkIdsWithValues<{ [key: string]: string[] }> = {
  [NetworkIds.MAINNET]: {
    'WSTETH-ETH': [
      '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
      '0xb8fc70e82bc5bb53e773626fcc6a23f7eefa036918d7ef216ecfb1950a94a85e',
      '0xd0e50cdac92fe2172043f5e0c36532c6369d24947e40968f34a5e8819ca9ec5d',
    ],
    'WEETH-ETH': ['0x698fe98247a40c5771537b5786b2f3f9d78eb487b4ce4d75533cd0e94d88a115'],
    'WSTETH-USDC': ['0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc'],
    'ETH-USDC': [
      '0xf9acc677910cc17f650416a22e2a14d5da7ccb9626db18f1bf94efe64f92b372',
      '0x7dde86a1e94561d9690ec678db673c1a6396365f7d1d65e129c5fff0990ff758',
    ],
    'WBTC-USDC': ['0x3a85e619751152991742810df6ec69ce473daef99e28a64ab2340d7b7ccfee49'],
    //'SDAI-USDC': ['0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1'],
    //'SDAI-USDT': ['0xf213843ac8ce2c8408182fc80c9e8f9911b420cce24adec8ea105ae44de087ad'],
    'OSETH-ETH': ['0xd5211d0e3f4a30d5c98653d988585792bb7812221f04801be73a44ceecb11e89'],
    'WBTC-USDT': ['0xa921ef34e2fc7a27ccc50ae7e4b154e16c9799d3387076c421423ef52ac4df99'],
    'WSTETH-USDT': ['0xe7e9694b754c4d4f7e21faf7223f6fa71abaeb10296a4c43a54a7977149687d2'],
    'ETH-USDT': ['0xdbffac82c2dc7e8aa781bd05746530b0068d80929f23ac1628580e27810bc0c5'],
    //'RETH-ETH': ['0x3c83f77bde9541f8d3d82533b19bbc1f97eb2f1098bb991728acbfbede09cc5d'],
    'EZETH-ETH': ['0x49bb2d114be9041a787432952927f6f144f05ad3e83196a7d062f374ee11d0ee'],
    'WOETH-ETH': ['0xea023e57814fb9a814a5a9ee9f3e7ece5b771dd8cc703e50b911e9cde064a12d'],
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
    'MKR-USDC': ['0x97bb820669a19ba5fa6de964a466292edd67957849f9631eb8b830c382f58b7f'],
    'WSTETH-USDA': ['0x423cb007534ac88febb8ce39f544ab303e8b757f8415ed891fc76550f8f4c965'],
    'PTWEETH-USDA': ['0xcc7b191903e4750ad71898a1594d912adbb5bb1c6effcde9c38f0a798112edd1'],
    'RSETH-ETH': ['0xeeabdcb98e9f7ec216d259a2c026bbb701971efae0b44eec79a86053f9b128b6'],
    'SWBTC-WBTC': ['0x514efda728a646dcafe4fdc9afe4ea214709e110ac1b2b78185ae00c1782cc82'],
    'RSWETH-ETH': ['0xcacd4c39af872ddecd48b650557ff5bcc7d3338194c0f5b2038e0d4dec5dc022'],
  },
  [NetworkIds.BASEMAINNET]: {
    'ETH-USDC': ['0x8793cf302b8ffd655ab97bd1c695dbd967807e8367a65cb2f4edaf1380ba1bda'],
    'WSTETH-USDC': ['0xa066f3893b780833699043f824e5bb88b8df039886f524f62b9a1ac83cb7f1f0'],
    'WSTETH-ETH': [
      '0x6aa81f51dfc955df598e18006deae56ce907ac02b0b5358705f1a28fcea23cc0',
      '0x3a4048c64ba1b375330d376b1ce40e4047d03b47ab4d48af484edec9fec801ba',
    ],
    'WEETH-ETH': ['0x78d11c03944e0dc298398f0545dc8195ad201a18b0388cb8058b1bcb89440971'],
    'WEETH-USDC': ['0x6a331b22b56c9c0ee32a1a7d6f852d2c682ea8b27a1b0f99a9c484a37a951eb7'],
    'CBETH-USDC': ['0xdba352d93a64b17c71104cbddc6aef85cd432322a1446b5b65163cbbc615cd0c'],
    'CBETH-ETH': ['0x6600aae6c56d242fa6ba68bd527aff1a146e77813074413186828fd3f1cdca91'],
    'AERO-USDC': ['0xdaa04f6819210b11fe4e3b65300c725c32e55755e3598671559b9ae3bac453d7'],
    'EZETH-USDC': ['0xf24417ee06adc0b0836cf0dbec3ba56c1059f62f53a55990a38356d42fa75fa2'],
    'EZETH-ETH': ['0xdf13c46bf7bd41597f27e32ae9c306eb63859c134073cb81c796ff20b520c7cf'],
    'BSDETH-ETH': ['0xdf6aa0df4eb647966018f324db97aea09d2a7dde0d3c0a72115e8b20d58ea81f'],
  },
}

export const settings: OmniProtocolSettings = {
  rawName: {
    [NetworkIds.MAINNET]: 'MorphoBlue',
    [NetworkIds.BASEMAINNET]: 'MorphoBlue',
  },
  supportedNetworkIds: [NetworkIds.MAINNET, NetworkIds.BASEMAINNET],
  supportedMainnetNetworkIds: [NetworkIds.MAINNET, NetworkIds.BASEMAINNET],
  supportedProducts: [OmniProductType.Borrow, OmniProductType.Multiply, OmniProductType.Earn],
  supportedMultiplyTokens: {
    [NetworkIds.MAINNET]: [
      'DAI',
      'ETH',
      'EZETH',
      'OSETH',
      'RETH',
      'SDAI',
      'SUSDE',
      'USDC',
      'USDE',
      'USDT',
      'WBTC',
      'WEETH',
      'WSTETH',
      'WOETH',
      'MKR',
      'CBETH',
      'RSETH',
      'SWBTC',
      'RSWETH',
    ],
    [NetworkIds.BASEMAINNET]: ['DAI', 'ETH', 'USDC', 'WBTC', 'WEETH', 'WSTETH', 'CBETH', 'BSDETH'],
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
      AutomationFeatures.PARTIAL_TAKE_PROFIT,
      AutomationFeatures.STOP_LOSS,
      AutomationFeatures.TRAILING_STOP_LOSS,
    ],
    [NetworkIds.BASEMAINNET]: [],
  },
  markets: morphoMarkets,
}

export const morphoMarketsWithAutomation = [
  morphoMarkets?.[NetworkIds.MAINNET]?.['WSTETH-ETH'][0],
  morphoMarkets?.[NetworkIds.MAINNET]?.['WEETH-ETH'][0],
  morphoMarkets?.[NetworkIds.MAINNET]?.['WSTETH-USDC'][0],
  morphoMarkets?.[NetworkIds.MAINNET]?.['ETH-USDC'][0],
  morphoMarkets?.[NetworkIds.MAINNET]?.['ETH-USDC'][1],
  morphoMarkets?.[NetworkIds.MAINNET]?.['WBTC-USDC'][0],
  morphoMarkets?.[NetworkIds.MAINNET]?.['OSETH-ETH'][0],
  morphoMarkets?.[NetworkIds.MAINNET]?.['WBTC-USDT'][0],
  morphoMarkets?.[NetworkIds.MAINNET]?.['SWBTC-WBTC'][0],
  morphoMarkets?.[NetworkIds.MAINNET]?.['RSWETH-ETH'][0],
  morphoMarkets?.[NetworkIds.MAINNET]?.['WSTETH-USDT'][0],
  morphoMarkets?.[NetworkIds.MAINNET]?.['ETH-USDT'][0],
  morphoMarkets?.[NetworkIds.MAINNET]?.['EZETH-ETH'][0],
  morphoMarkets?.[NetworkIds.MAINNET]?.['WOETH-ETH'][0],
  morphoMarkets?.[NetworkIds.MAINNET]?.['MKR-DAI'][0],
  morphoMarkets?.[NetworkIds.MAINNET]?.['MKR-USDC'][0],
]
