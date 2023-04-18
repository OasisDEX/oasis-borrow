import { BigNumber } from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { OraclePriceData, OraclePriceDataArgs } from 'blockchain/prices'
import { supportedIlks } from 'blockchain/tokens/mainnet'
import {
  BTC_TOKENS,
  ETH_TOKENS,
  getToken,
  LP_TOKENS,
  ONLY_MULTIPLY_TOKENS,
  TokenMetadataType,
} from 'blockchain/tokensMetadata'
import { IlkWithBalance } from 'features/ilks/ilksWithBalances'
import { Feature, getFeatureToggle } from 'helpers/useFeatureToggle'
import _, { keyBy, sortBy } from 'lodash'
import { combineLatest, Observable, of } from 'rxjs'
import { map, startWith, switchMap } from 'rxjs/operators'

import { EXTERNAL_LINKS } from './applicationLinks'
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
  protocol: TokenMetadataType['protocol']
  chain: TokenMetadataType['chain']
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

export type Ilk = (typeof supportedIlks)[number]

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

type ProductPageType = {
  cardsFilters: Array<ProductLandingPagesFilter>
  featuredIlkCards: Array<Ilk>
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

const ilkToEntryTokenMap = {
  'ETH-A': 'ETH',
  'ETH-B': 'ETH',
  'ETH-C': 'ETH',
  'RETH-A': 'RETH',
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

export function getAaveEnabledStrategies(
  strategies: { strategy: string; featureToggle?: Feature }[],
) {
  return strategies
    .filter(({ featureToggle }) => (featureToggle ? getFeatureToggle(featureToggle) : true))
    .map((item) => item.strategy)
}

export const productCardsConfig: {
  borrow: ProductPageType
  multiply: ProductPageType
  earn: ProductPageType
  landing: {
    featuredIlkCards: Record<ProductTypes, Array<Ilk>>
    featuredAaveCards: Record<ProductTypes, Array<string>>
  }
  descriptionCustomKeys: Record<Ilk, string>
  descriptionLinks: Record<Ilk, { link: string }>
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
    featuredIlkCards: ['ETH-C', 'WBTC-C', 'CRVV1ETHSTETH-A', 'WSTETH-B'],
    inactiveIlks: [],
    ordering: {
      ETH: ['ETH-C', 'ETH-A', 'WSTETH-A', 'ETH-B', 'WSTETH-B', 'RETH-A'],
      BTC: ['WBTC-C', 'RENBTC-A', 'WBTC-A', 'WBTC-B'],
    },
    tags: {
      'ETH-C': 'lowest-fees-for-borrowing',
      'WBTC-C': 'lowest-fees-for-borrowing',
      'WSTETH-A': 'staking-rewards',
      'WSTETH-B': 'staking-rewards',
      'CRVV1ETHSTETH-A': 'staking-rewards',
      'RETH-A': 'staking-rewards',
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
    featuredIlkCards: ['ETH-B', 'WBTC-B', 'WSTETH-A'],
    inactiveIlks: [],
    ordering: {
      ETH: ['ETH-B', 'ETH-A', 'WSTETH-A', 'ETH-C', 'WSTETH-B', 'RETH-A'],
      BTC: ['WBTC-B', 'WBTC-A', 'RENBTC-A', 'WBTC-C'],
    },
    tags: {
      'WBTC-A': 'automation-enabled',
      'WBTC-B': 'automation-enabled',
      'WBTC-C': 'automation-enabled',
      'ETH-A': 'automation-enabled',
      'ETH-B': 'automation-enabled',
      'ETH-C': 'automation-enabled',
      'YFI-A': 'automation-enabled',
      'LINK-A': 'automation-enabled',
      'WSTETH-A': 'staking-rewards',
      'RETH-A': 'staking-rewards',
    },
  },
  earn: {
    cardsFilters: [],
    featuredIlkCards: [],
    inactiveIlks: [],
    ordering: {},
    tags: {},
  },
  landing: {
    featuredIlkCards: {
      borrow: [
        'ETH-C',
        'WBTC-C',
        // 'CRVV1ETHSTETH-A',
        'WSTETH-B',
      ],
      multiply: ['ETH-B', 'WBTC-B', 'WSTETH-A'],
      // TODO prepare proper handling for DSR
      earn: ['DSR'],
    },
    featuredAaveCards: {
      borrow: getAaveEnabledStrategies([
        { strategy: 'borrow-against-ETH', featureToggle: 'AaveBorrow' },
      ]),
      multiply: getAaveEnabledStrategies([
        { strategy: 'ethusdc' },
        { strategy: 'stETHusdc' },
        { strategy: 'wBTCusdc' },
      ]),
      earn: getAaveEnabledStrategies([
        { strategy: 'wstETHeth', featureToggle: 'AaveV3EarnWSTETH' },
        { strategy: 'stETHeth' },
      ]),
    },
  },
  descriptionCustomKeys: {
    'ETH-A': 'medium-exposure-medium-cost',
    'ETH-B': 'biggest-multiply',
    'ETH-C': 'lowest-stabilityFee-and-cheapest',
    'WSTETH-A': 'staking-rewards',
    'WSTETH-B': 'lowest-annual-fee-cheapest-vault',
    'RETH-A': 'borrow-and-multiply',
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
      link: EXTERNAL_LINKS.KB.TOKENS.ETH,
    },
    'ETH-B': {
      link: EXTERNAL_LINKS.KB.TOKENS.ETH,
    },
    'ETH-C': {
      link: EXTERNAL_LINKS.KB.TOKENS.ETH,
    },
    'WSTETH-A': {
      link: EXTERNAL_LINKS.KB.TOKENS.WSTETH,
    },
    'WSTETH-B': {
      link: EXTERNAL_LINKS.KB.TOKENS.WSTETH,
    },
    'WBTC-A': {
      link: EXTERNAL_LINKS.KB.TOKENS.WBTC,
    },
    'WBTC-B': {
      link: EXTERNAL_LINKS.KB.TOKENS.WBTC,
    },
    'WBTC-C': {
      link: EXTERNAL_LINKS.KB.TOKENS.WBTC,
    },
    'RENBTC-A': {
      link: EXTERNAL_LINKS.KB.TOKENS.RENBTC,
    },
    'LINK-A': {
      link: EXTERNAL_LINKS.KB.TOKENS.LINK,
    },
    'MANA-A': {
      link: EXTERNAL_LINKS.KB.TOKENS.MANA,
    },
    'MATIC-A': {
      link: EXTERNAL_LINKS.KB.TOKENS.MATIC,
    },
    'GUSD-A': {
      link: EXTERNAL_LINKS.KB.TOKENS.GUSD,
    },
    'YFI-A': {
      link: EXTERNAL_LINKS.KB.TOKENS.YFI,
    },
    'GUNIV3DAIUSDC1-A': {
      link: EXTERNAL_LINKS.KB.EARN_DAI_GUNI_MULTIPLY,
    },
    'GUNIV3DAIUSDC2-A': {
      link: EXTERNAL_LINKS.KB.EARN_DAI_GUNI_MULTIPLY,
    },
    'UNIV2USDCETH-A': {
      link: EXTERNAL_LINKS.KB.TOKENS.UNIV2,
    },
    'UNIV2DAIUSDC-A': {
      link: EXTERNAL_LINKS.KB.TOKENS.UNIV2,
    },
    'CRVV1ETHSTETH-A': {
      link: EXTERNAL_LINKS.KB.TOKENS.CRVV1ETHSTETH,
    },
    stETHeth: {
      link: EXTERNAL_LINKS.KB.WHAT_YOU_SHOULD_KNOW_ABOUT_STETH,
    },
    stETHusdc: {
      link: EXTERNAL_LINKS.KB.WHAT_YOU_SHOULD_KNOW_ABOUT_STETH,
    },
    'RETH-A': {
      link: EXTERNAL_LINKS.KB.TOKENS.ETH,
    },
    wstETHeth: {
      link: EXTERNAL_LINKS.KB.STETH_AAVE_V3_EMODE,
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
    productCardsConfig.landing.featuredIlkCards[product].includes(ilk.ilk),
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
      productCardsConfig.multiply.featuredIlkCards.includes(ilk.ilk),
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
      productCardsConfig.borrow.featuredIlkCards.includes(ilk),
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
    .map((d) => d.token as unknown as ProductLandingPagesFiltersKeys)
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
                  protocol: tokenMeta.protocol,
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
          protocol: tokenMeta.protocol,
          chain: tokenMeta.chain,
        }
      })
    }),
  )
}
