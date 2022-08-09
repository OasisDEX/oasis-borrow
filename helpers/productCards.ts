import { BigNumber } from 'bignumber.js'
import { IlkWithBalance } from 'features/ilks/ilksWithBalances'
import _, { keyBy, sortBy } from 'lodash'
import { combineLatest, Observable, of } from 'rxjs'
import { map, startWith, switchMap } from 'rxjs/operators'

import { supportedIlks } from '../blockchain/config'
import { IlkData } from '../blockchain/ilks'
import { OraclePriceData, OraclePriceDataArgs } from '../blockchain/prices'
import {
  BTC_TOKENS,
  ETH_TOKENS,
  getToken,
  LP_TOKENS,
  ONLY_MULTIPLY_TOKENS,
} from '../blockchain/tokensMetadata'
import { zero } from './zero'

export interface ProductCardData {
  token: string
  ilk: Ilk
  liquidationRatio: BigNumber
  liquidityAvailable: BigNumber
  stabilityFee: BigNumber
  balance?: BigNumber
  balanceInUsd?: BigNumber
  debtFloor: BigNumber
  currentCollateralPrice: BigNumber
  bannerIcon: string
  bannerGif: string
  background: string
  name: string
  isFull: boolean
}

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
export type ProductTypes = 'borrow' | 'multiply' | 'earn'

export type Ilk = typeof supportedIlks[number]

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
  'CRVV1ETHSTETH-A',
  'WSTETH-B',
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
]

export const supportedEarnIlks = ['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A']

type ProductPageType = {
  cardsFilters: Array<ProductLandingPagesFilter>
  featuredCards: Array<Ilk>
  inactiveIlks: Array<Ilk>
  ordering: { [Key in ProductLandingPagesFiltersKeys]?: Array<Ilk> }
  tags: Partial<Record<Ilk, string>>
}

const genericFilters = {
  featured: { name: 'Featured', icon: 'star_circle', urlFragment: 'featured', tokens: [] },
  eth: {
    name: 'ETH',
    icon: 'eth_circle',
    urlFragment: 'eth',
    tokens: ['ETH', 'WETH', 'wstETH', 'stETH'],
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

const ilkToEntryTokenMap = {
  'ETH-A': 'ETH',
  'ETH-B': 'ETH',
  'ETH-C': 'ETH',
  'WSTETH-A': 'WSTETH',
  'WBTC-A': 'WBTC',
  'WBTC-B': 'WBTC',
  'WBTC-C': 'WBTC',
  'RENBTC-A': 'RENBTC',
  'LINK-A': 'LINK',
  'GUSD-A': 'GUSD',
  'YFI-A': 'YFI',
  'MANA-A': 'MANA',
  'MATIC-A': 'MATIC',
  'UNIV2USDCETH-A': 'UNIV2USDCETH',
  'UNIV2DAIUSDC-A': 'UNIV2DAIUSDC',
  'CRVV1ETHSTETH-A': 'CRVV1ETHSTETH',
  'WSTETH-B': 'WSTETH',
}

export type IlkTokenMap = { ilk: Ilk; token: string }

export const ilkToEntryToken: Array<IlkTokenMap> = Object.entries(ilkToEntryTokenMap).map(
  ([ilk, token]) => ({
    ilk,
    token,
  }),
)

const urlFragmentKeyedFilters = keyBy(genericFilters, 'urlFragment')

export function mapUrlFragmentToFilter(urlFragment: string) {
  return urlFragmentKeyedFilters[urlFragment]
}

const tokenKeyedFilters: {
  [k: string]: ProductLandingPagesFilter
} = _(genericFilters)
  .flatMap((filter) => filter.tokens.map((token) => ({ [token]: filter })))
  .reduce((acc, current) => ({ ...acc, ...current }), {})

export function mapTokenToFilter(token: string) {
  return tokenKeyedFilters[token]
}

export const productCardsConfig: {
  borrow: ProductPageType
  multiply: ProductPageType
  earn: ProductPageType
  landing: {
    featuredCards: Record<ProductTypes, Array<Ilk>>
  }
  descriptionCustomKeys: Record<Ilk, string>
  descriptionLinks: Record<Ilk, { link: string; name: string }>
} = {
  borrow: {
    cardsFilters: [
      genericFilters.featured,
      genericFilters.eth,
      genericFilters.btc,
      genericFilters.unilp,
      genericFilters.link,
      genericFilters.yfi,
      genericFilters.mana,
      genericFilters.matic,
      genericFilters.gusd,
      genericFilters.crvlp,
    ],
    featuredCards: ['ETH-C', 'WBTC-C', 'CRVV1ETHSTETH-A', 'WSTETH-B'],
    inactiveIlks: [],
    ordering: {
      ETH: ['ETH-C', 'ETH-A', 'WSTETH-A', 'ETH-B'],
      BTC: ['WBTC-C', 'RENBTC-A', 'WBTC-A', 'WBTC-B'],
    },
    tags: {
      'ETH-C': 'lowest-fees-for-borrowing',
      'WBTC-C': 'lowest-fees-for-borrowing',
      'WSTETH-A': 'staking-rewards',
      'CRVV1ETHSTETH-A': 'staking-rewards',
    },
  },
  multiply: {
    cardsFilters: [
      genericFilters.featured,
      genericFilters.eth,
      genericFilters.btc,
      genericFilters.link,
      genericFilters.yfi,
      genericFilters.mana,
      genericFilters.matic,
    ],
    featuredCards: ['ETH-B', 'WBTC-B', 'WSTETH-A'],
    inactiveIlks: [],
    ordering: {
      ETH: ['ETH-B', 'ETH-A', 'WSTETH-A', 'ETH-C'],
      BTC: ['WBTC-B', 'WBTC-A', 'RENBTC-A', 'WBTC-C'],
    },
    tags: {
      'WBTC-B': 'max-exposure',
      'ETH-B': 'max-exposure',
      'WSTETH-A': 'staking-rewards',
    },
  },
  earn: {
    cardsFilters: [],
    featuredCards: [],
    inactiveIlks: [],
    ordering: {},
    tags: {},
  },
  landing: {
    featuredCards: {
      borrow: [
        'ETH-C',
        'WBTC-C',
        // 'CRVV1ETHSTETH-A',
        'WSTETH-B',
      ],
      multiply: ['ETH-B', 'WBTC-B', 'WSTETH-A'],
      earn: ['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A'],
    },
  },
  descriptionCustomKeys: {
    'ETH-A': 'medium-exposure-medium-cost',
    'ETH-B': 'biggest-multiply',
    'ETH-C': 'lowest-stabilityFee-and-cheapest',
    'WSTETH-A': 'staking-rewards',
    'WSTETH-B': 'lowest-annual-fee-cheapest-vault',
    'WBTC-A': 'medium-exposure-medium-cost',
    'WBTC-B': 'biggest-multiply',
    'WBTC-C': 'lowest-stabilityFee-and-cheapest',
    'RENBTC-A': 'great-borrowing-and-multiplying',
    'GUNIV3DAIUSDC1-A': 'guni',
    'GUNIV3DAIUSDC2-A': 'guni',

    'GUSD-A': 'borrow',
    'LINK-A': 'borrow-and-multiply',
    'UNI-A': 'borrow-and-multiply',
    'YFI-A': 'borrow-and-multiply',
    'MANA-A': 'borrow-and-multiply',
    'MATIC-A': 'borrow-and-multiply',

    'UNIV2DAIETH-A': 'lp-tokens',
    'UNIV2WBTCETH-A': 'lp-tokens',
    'UNIV2USDCETH-A': 'lp-tokens',
    'UNIV2DAIUSDC-A': 'lp-tokens',
    'UNIV2UNIETH-A': 'lp-tokens',
    'UNIV2WBTCDAI-A': 'lp-tokens',
    'CRVV1ETHSTETH-A': 'borrow',
  } as Record<string, string>,
  descriptionLinks: {
    'ETH-A': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_126274073291652792840397',
      name: 'Maker (ETH-A)',
    },
    'ETH-B': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_126274073291652792840397',
      name: 'Maker (ETH-B)',
    },
    'ETH-C': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_126274073291652792840397',
      name: 'Maker (ETH-C)',
    },
    'WSTETH-A': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_274014616431652792856773',
      name: 'Maker (WSTETH-A)',
    },
    'WSTETH-B': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_274014616431652792856773',
      name: 'Maker (WSTETH-B)',
    },
    'WBTC-A': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_884958393561652792865000',
      name: 'Maker (WBTC-A)',
    },
    'WBTC-B': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_884958393561652792865000',
      name: 'Maker (WBTC-B)',
    },
    'WBTC-C': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_884958393561652792865000',
      name: 'Maker (WBTC-C)',
    },
    'RENBTC-A': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_414294869681652792871926',
      name: 'Maker (RENBTC-A)',
    },
    'LINK-A': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_42582440791652792878921',
      name: 'Maker (LINK-A)',
    },
    'MANA-A': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_536808626201652802419989',
      name: 'Maker (MANA-A)',
    },
    'MATIC-A': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_615723980991652792924214',
      name: 'Maker (MATIC-A)',
    },
    'GUSD-A': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_4952663551081652792930397',
      name: 'Maker (GUSD-A)',
    },
    'YFI-A': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_4996750151161652792936142',
      name: 'Maker (YFI-A)',
    },
    'GUNIV3DAIUSDC1-A': {
      link: 'https://kb.oasis.app/help/earn-with-dai-and-g-uni-multiply',
      name: 'Maker/Gelato/Uniswap',
    },
    'GUNIV3DAIUSDC2-A': {
      link: 'https://kb.oasis.app/help/earn-with-dai-and-g-uni-multiply',
      name: 'Maker/Gelato/Uniswap',
    },
    'UNIV2USDCETH-A': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_1653695461291652792950901',
      name: 'Maker/Uniswap',
    },
    'UNIV2DAIUSDC-A': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_1653695461291652792950901',
      name: 'Maker/Uniswap',
    },
    'CRVV1ETHSTETH-A': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_67885280351652802433065',
      name: 'Maker/Curve/Lido',
    },
  },
}

function btcProductCards<T extends IlkTokenMap>(productCardsData: Array<T>): Array<T> {
  return productCardsData.filter((ilk) => {
    return BTC_TOKENS.includes(ilk.token)
  })
}

function ethProductCards<T extends IlkTokenMap>(productCardsData: T[]): T[] {
  return productCardsData.filter((ilk) => ETH_TOKENS.includes(ilk.token))
}

const notSupportedAnymoreLpTokens = [
  'UNIV2ETHUSDT',
  'UNIV2LINKETH',
  'UNIV2AAVEETH',
  'UNIV2DAIUSDT',
  'UNIV2DAIETH',
  'UNIV2WBTCETH',
  'UNIV2UNIETH',
  'UNIV2WBTCDAI',
]

export function uniLpProductCards<T extends IlkTokenMap>(ilkToTokenMappings: Array<T>): Array<T> {
  return ilkToTokenMappings.filter(
    ({ token }) =>
      LP_TOKENS.includes(token) &&
      !ONLY_MULTIPLY_TOKENS.includes(token) &&
      !notSupportedAnymoreLpTokens.includes(token),
  )
}

export function landingPageCardsData({
  productCardsData,
  product = 'multiply',
}: {
  productCardsData: ProductCardData[]
  product?: ProductTypes
}) {
  return productCardsData.filter((ilk) =>
    productCardsConfig.landing.featuredCards[product].includes(ilk.ilk),
  )
}

export function pageCardsDataByProduct({
  productCardsData,
  product = 'multiply',
}: {
  productCardsData: ProductCardData[]
  product?: ProductTypes
}) {
  return productCardsData.filter((ilk) =>
    productCardsConfig[product].cardsFilters.map((cardFilter) =>
      ilk.token.includes(cardFilter.name),
    ),
  )
}

function sortCards<T extends IlkTokenMap>(
  ilkToTokenMappings: Array<T>,
  sortingConfig: ProductPageType['ordering'],
  cardsFilter?: ProductLandingPagesFiltersKeys,
): Array<T> {
  if (cardsFilter) {
    ilkToTokenMappings = sortBy(ilkToTokenMappings, ({ ilk }) => {
      const orderForFilter = sortingConfig[cardsFilter]

      if (orderForFilter) {
        const order = orderForFilter.indexOf(ilk)
        if (order >= 0) {
          return order
        } else {
          return Infinity
        }
      }

      return 0
    })
  }
  return ilkToTokenMappings
}

export function earnPageCardsData<T extends IlkTokenMap>({
  ilkToTokenMapping,
}: {
  ilkToTokenMapping: Array<T>
}): Array<T> {
  return ilkToTokenMapping.filter((data) =>
    ['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A'].includes(data.ilk),
  )
}

export function multiplyPageCardsData<T extends IlkTokenMap>({
  ilkToTokenMapping,
  cardsFilter,
}: {
  ilkToTokenMapping: Array<T>
  cardsFilter?: ProductLandingPagesFiltersKeys
}): Array<T> {
  ilkToTokenMapping = sortCards(
    ilkToTokenMapping,
    productCardsConfig.multiply.ordering,
    cardsFilter,
  )

  if (cardsFilter === 'Featured') {
    return ilkToTokenMapping.filter((ilk) =>
      productCardsConfig.multiply.featuredCards.includes(ilk.ilk),
    )
  }

  if (cardsFilter === 'BTC') {
    return btcProductCards(ilkToTokenMapping)
  }

  if (cardsFilter === 'ETH') {
    return ethProductCards(ilkToTokenMapping)
  }

  return ilkToTokenMapping.filter((ilk) => ilk.token === cardsFilter)
}

export function borrowPageCardsData<T extends IlkTokenMap>({
  ilkToTokenMapping,
  cardsFilter,
}: {
  ilkToTokenMapping: Array<T>
  cardsFilter?: ProductLandingPagesFiltersKeys
}): Array<T> {
  ilkToTokenMapping = sortCards(ilkToTokenMapping, productCardsConfig.borrow.ordering, cardsFilter)

  if (cardsFilter === 'Featured') {
    return ilkToTokenMapping.filter(({ ilk }) =>
      productCardsConfig.borrow.featuredCards.includes(ilk),
    )
  }

  if (cardsFilter === 'UNI LP') {
    return uniLpProductCards(ilkToTokenMapping)
  }

  if (cardsFilter === 'BTC') {
    return btcProductCards(ilkToTokenMapping)
  }

  if (cardsFilter === 'ETH') {
    return ethProductCards(ilkToTokenMapping)
  }

  if (cardsFilter === 'Curve LP') {
    return ilkToTokenMapping.filter(({ ilk }) => ilk === 'CRVV1ETHSTETH-A')
  }

  return ilkToTokenMapping.filter(({ token }) => token === cardsFilter)
}

export function cardFiltersFromBalances(
  productCardsData: ProductCardData[],
): Array<ProductLandingPagesFiltersKeys> {
  return productCardsData
    .filter((cardData) => cardData.balance && cardData.balance.isGreaterThan(0))
    .map((d) => (d.token as unknown) as ProductLandingPagesFiltersKeys)
}

export function createProductCardsWithBalance$(
  ilksWithBalance$: Observable<IlkWithBalance[]>,
  oraclePrice$: (args: OraclePriceDataArgs) => Observable<OraclePriceData>,
): Observable<ProductCardData[]> {
  return ilksWithBalance$.pipe(
    switchMap((ilkDataList) =>
      combineLatest(
        ...ilkDataList
          .filter((ilk) => ilk.debtCeiling.gt(zero))
          .map((ilk) => {
            const tokenMeta = getToken(ilk.token)
            return oraclePrice$({ token: ilk.token, requestedData: ['currentPrice'] }).pipe(
              switchMap((priceInfo) => {
                return of({
                  token: ilk.token,
                  balance: ilk.balance,
                  balanceInUsd: ilk.balancePriceInUsd,
                  ilk: ilk.ilk as Ilk,
                  liquidationRatio: ilk.liquidationRatio,
                  liquidityAvailable: ilk.ilkDebtAvailable,
                  stabilityFee: ilk.stabilityFee,
                  debtFloor: ilk.debtFloor,
                  currentCollateralPrice: priceInfo.currentPrice,
                  bannerIcon: tokenMeta.bannerIcon,
                  bannerGif: tokenMeta.bannerGif,
                  background: tokenMeta.background,
                  name: tokenMeta.name,
                  isFull: ilk.ilkDebtAvailable.lt(ilk.debtFloor),
                })
              }),
            )
          }),
      ),
    ),
    startWith<ProductCardData[]>([]),
  )
}

export function createProductCardsData$(
  supportedIlks$: Observable<string[]>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  oraclePrice$: (args: OraclePriceDataArgs) => Observable<OraclePriceData>,
  visibleIlks: Array<Ilk>,
): Observable<ProductCardData[]> {
  if (visibleIlks.length === 0) {
    return of([])
  }

  const hydratedIlkData$ = supportedIlks$.pipe(
    switchMap((ilksSupportedOnNetwork) => {
      const displayedIlks = visibleIlks.filter((ilk) => ilksSupportedOnNetwork.includes(ilk))
      if (displayedIlks.length === 0) {
        return of([])
      }
      return combineLatest(displayedIlks.map((ilk) => ilkData$(ilk)))
    }),
  )

  const hydratedOraclePriceData$ = hydratedIlkData$.pipe(
    switchMap((ilkDatas) => {
      if (ilkDatas.length === 0) {
        return of([])
      }
      return combineLatest(
        ilkDatas.map((ilkData) =>
          oraclePrice$({ token: ilkData.token, requestedData: ['currentPrice'] }),
        ),
      )
    }),
  )

  return combineLatest(hydratedIlkData$, hydratedOraclePriceData$).pipe(
    map(([ilkDatas, oraclePriceDatas]) => {
      return ilkDatas.map((ilkData, index) => {
        const oraclePriceData = oraclePriceDatas[index]
        const tokenMeta = getToken(ilkData.token)
        return {
          token: ilkData.token,
          ilk: ilkData.ilk as Ilk,
          liquidationRatio: ilkData.liquidationRatio,
          liquidityAvailable: ilkData.ilkDebtAvailable,
          stabilityFee: ilkData.stabilityFee,
          debtFloor: ilkData.debtFloor,
          currentCollateralPrice: oraclePriceData.currentPrice,
          bannerIcon: tokenMeta.bannerIcon,
          bannerGif: tokenMeta.bannerGif,
          background: tokenMeta.background,
          name: tokenMeta.name,
          isFull: ilkData.ilkDebtAvailable.lt(ilkData.debtFloor),
        }
      })
    }),
  )
}
