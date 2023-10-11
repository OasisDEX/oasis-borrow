import _ from 'lodash'

export type ProductLandingPagesFiltersKeys =
  | 'Featured'
  | 'ETH'
  | 'BTC'
  | 'UNI LP'
  | 'LINK'
  | 'UNI'
  | 'YFI'
  | 'MANA'
  | 'MATIC'
  | 'GUSD'
  | 'Curve LP'

type ProductLandingPagesFiltersIcons =
  | 'star_circle'
  | 'eth_circle'
  | 'btc_circle'
  | 'uni_lp_circle'
  | 'link_circle'
  | 'uni_circle'
  | 'yfi_circle'
  | 'mana_circle'
  | 'matic_circle'
  | 'gusd_circle'
  | 'curve_circle'

export type ProductLandingPagesFilter = {
  name: ProductLandingPagesFiltersKeys
  icon: ProductLandingPagesFiltersIcons
  urlFragment: string
  tokens: Readonly<Array<string>>
}

export const supportedBorrowIlks = [
  'ETH-A',
  'ETH-B',
  'ETH-C',
  'WSTETH-A',
  'WBTC-A',
  'WBTC-B',
  'WBTC-C',
  'RENBTC-A',
  'LINK-A',
  'GUSD-A',
  'YFI-A',
  'MANA-A',
  'MATIC-A',
  'UNIV2USDCETH-A',
  'UNIV2DAIUSDC-A',
  'WSTETH-B',
  'RETH-A',
  'GNO-A',
]

export const supportedMultiplyIlks = [
  'ETH-A',
  'ETH-B',
  'ETH-C',
  'WSTETH-A',
  'WBTC-A',
  'WBTC-B',
  'WBTC-C',
  'RENBTC-A',
  'LINK-A',
  'YFI-A',
  'MANA-A',
  'MATIC-A',
  'WSTETH-B',
  'RETH-A',
]

export const supportedEarnIlks = ['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A']

const genericFilters = {
  featured: { name: 'Featured', icon: 'star_circle', urlFragment: 'featured', tokens: [] },
  eth: {
    name: 'ETH',
    icon: 'eth_circle',
    urlFragment: 'eth',
    tokens: ['ETH', 'WETH', 'wstETH', 'stETH', 'RETH'],
  },
  btc: { name: 'BTC', icon: 'btc_circle', urlFragment: 'btc', tokens: ['WBTC', 'renBTC'] },
  unilp: {
    name: 'UNI LP',
    icon: 'uni_lp_circle',
    urlFragment: 'unilp',
    tokens: ['GUNIV3DAIUSDC1', 'GUNIV3DAIUSDC2'],
  },
  link: { name: 'LINK', icon: 'link_circle', urlFragment: 'link', tokens: ['LINK'] },
  yfi: { name: 'YFI', icon: 'yfi_circle', urlFragment: 'yfi', tokens: ['YFI'] },
  mana: { name: 'MANA', icon: 'mana_circle', urlFragment: 'mana', tokens: ['MANA'] },
  matic: { name: 'MATIC', icon: 'matic_circle', urlFragment: 'matic', tokens: ['MATIC'] },
  gusd: { name: 'GUSD', icon: 'gusd_circle', urlFragment: 'gusd', tokens: ['GUSD'] },
  crvlp: { name: 'Curve LP', icon: 'curve_circle', urlFragment: 'crvlp', tokens: [] },
} as const

const tokenKeyedFilters: {
  [k: string]: ProductLandingPagesFilter
} = _(genericFilters)
  .flatMap((filter) => filter.tokens.map((token) => ({ [token]: filter })))
  .reduce((acc, current) => ({ ...acc, ...current }), {})

export function mapTokenToFilter(token: string) {
  return tokenKeyedFilters[token]
}
