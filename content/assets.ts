import { Unbox } from 'helpers/types'
import keyBy from 'lodash/keyBy'

export const ASSETS_PAGES = [
  {
    slug: 'eth',
    header: 'Ethereum',
    symbol: 'ETH',
    icon: 'ether_circle_color',
    descriptionKey: 'assets.eth.description',
    link: 'assets.eth.link',
    multiplyIlks: ['ETH-B', 'ETH-A', 'WSTETH-A', 'ETH-C'],
    borrowIlks: ['ETH-C', 'ETH-A', 'WSTETH-A', 'ETH-B'],
  },
  {
    slug: 'btc',
    header: 'Bitcoin',
    symbol: 'BTC',
    icon: 'btc_circle_color',
    descriptionKey: 'assets.btc.description',
    link: 'assets.btc.link',
    multiplyIlks: ['WBTC-B', 'WBTC-A', 'RENBTC-A', 'WBTC-C'],
    borrowIlks: ['WBTC-C', 'RENBTC-A', 'WBTC-A', 'WBTC-B'],
  },
  {
    slug: 'lp-token',
    header: 'LP tokens',
    symbol: 'UNIV2',
    icon: 'uni_circle_color',
    descriptionKey: 'assets.lp-token.description',
    link: 'assets.lp-token.link',
    multiplyIlks: ['GUNIV3DAIUSDC2-A'],
    borrowIlks: [
      'UNIV2DAIUSDC-A',
      'UNIV2USDCETH-A',
      'UNIV2WBTCETH-A',
      'UNIV2WBTCDAI-A',
      'UNIV2DAIETH-A',
      'UNIV2UNIETH-A',
    ],
  },
  {
    slug: 'yfi',
    header: 'Yearn Finance',
    symbol: 'YFI',
    icon: 'yfi_circle_color',
    descriptionKey: 'assets.yfi.description',
    link: 'assets.yfi.link',
    ilks: ['YFI-A'],
  },
  {
    slug: 'uni',
    header: 'Uniswap',
    symbol: 'UNI',
    icon: 'uni_circle_color',
    descriptionKey: 'assets.uni.description',
    link: 'assets.uni.link',
    ilks: ['UNI-A'],
  },
  {
    slug: 'link',
    header: 'Chainlink',
    symbol: 'LINK',
    icon: 'chainlink_circle_color',
    descriptionKey: 'assets.link.description',
    link: 'assets.link.link',
    ilks: ['LINK-A'],
  },
  {
    slug: 'matic',
    header: 'Matic',
    symbol: 'MATIC',
    icon: 'matic_circle_color',
    descriptionKey: 'assets.matic.description',
    link: 'assets.matic.link',
    ilks: ['MATIC-A'],
  },
  {
    slug: 'mana',
    header: 'Decentraland',
    symbol: 'MANA',
    icon: 'mana_circle_color',
    descriptionKey: 'assets.mana.description',
    link: 'assets.mana.link',
    ilks: ['MANA-A'],
  },
]

export const assetsPageContentBySlug = keyBy(ASSETS_PAGES, 'slug')

export type AssetPageContent = Unbox<typeof ASSETS_PAGES>
