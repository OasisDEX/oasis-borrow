import { BigNumber } from 'bignumber.js'
import { sortBy } from 'lodash'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { IlkDataList } from '../blockchain/ilks'
import {
  ALLOWED_MULTIPLY_TOKENS,
  BTC_TOKENS,
  ETH_TOKENS,
  getToken,
  LP_TOKENS,
  ONLY_MULTIPLY_TOKENS,
} from '../blockchain/tokensMetadata'
import { PriceInfo } from '../features/shared/priceInfo'

export interface ProductCardData {
  token: string
  ilk: Ilk
  liquidationRatio: BigNumber
  stabilityFee: BigNumber
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
}

type Ilk =
  | 'WBTC-B'
  | 'ETH-B'
  | 'ETH-C'
  | 'WBTC-C'
  | 'GUSD-A'
  | 'ETH-A'
  | 'WBTC-A'
  | 'LINK-A'
  | 'UNI-A'
  | 'YFI-A'
  | 'MANA-A'
  | 'MATIC-A'
  | 'WSTETH-A'
  | 'RENBTC-A'
  | 'GUNIV3DAIUSDC1-A'
  | 'GUNIV3DAIUSDC2-A'
  | 'UNIV2DAIETH-A'
  | 'UNIV2WBTCETH-A'
  | 'UNIV2USDCETH-A'
  | 'UNIV2DAIUSDC-A'
  | 'UNIV2UNIETH-A'
  | 'UNIV2WBTCDAI-A'
  | 'CRVV1ETHSTETH-A'

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
  'UNI-A',
  'YFI-A',
  'MANA-A',
  'MATIC-A',
  'UNIV2DAIETH-A',
  'UNIV2WBTCETH-A',
  'UNIV2USDCETH-A',
  'UNIV2DAIUSDC-A',
  'UNIV2UNIETH-A',
  'UNIV2WBTCDAI-A',
  'CRVV1ETHSTETH-A',
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
  'GUNIV3DAIUSDC2-A',
  'LINK-A',
  'UNI-A',
  'YFI-A',
  'MANA-A',
  'MATIC-A',
]

export const supportedIlksList = [
  ...new Set([...supportedBorrowIlks, supportedMultiplyIlks]),
] as Ilk[]

type ProductPageType = {
  cardsFilters: Array<ProductLandingPagesFilter>
  featuredCards: Array<Ilk>
  inactiveIlks: Array<Ilk>
  ordering: { [Key in ProductLandingPagesFiltersKeys]?: Array<Ilk> }
  tags: Partial<Record<Ilk, string>>
}

export const productCardsConfig: {
  borrow: ProductPageType
  multiply: ProductPageType
  earn: ProductPageType
  landing: {
    featuredCards: Record<'borrow' | 'multiply' | 'earn', Array<Ilk>>
  }
  descriptionCustomKeys: Record<Ilk, string>
} = {
  borrow: {
    cardsFilters: [
      { name: 'Featured', icon: 'star_circle' },
      { name: 'ETH', icon: 'eth_circle' },
      { name: 'BTC', icon: 'btc_circle' },
      { name: 'UNI LP', icon: 'uni_lp_circle' },
      { name: 'LINK', icon: 'link_circle' },
      { name: 'UNI', icon: 'uni_circle' },
      { name: 'YFI', icon: 'yfi_circle' },
      { name: 'MANA', icon: 'mana_circle' },
      { name: 'MATIC', icon: 'matic_circle' },
      { name: 'GUSD', icon: 'gusd_circle' },
      { name: 'Curve LP', icon: 'curve_circle' },
    ],
    featuredCards: ['ETH-C', 'WBTC-C', 'CRVV1ETHSTETH-A'],
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
      { name: 'Featured', icon: 'star_circle' },
      { name: 'ETH', icon: 'eth_circle' },
      { name: 'BTC', icon: 'btc_circle' },
      { name: 'UNI LP', icon: 'uni_lp_circle' },
      { name: 'LINK', icon: 'link_circle' },
      { name: 'UNI', icon: 'uni_circle' },
      { name: 'YFI', icon: 'yfi_circle' },
      { name: 'MANA', icon: 'mana_circle' },
      { name: 'MATIC', icon: 'matic_circle' },
    ],
    featuredCards: ['ETH-B', 'WBTC-B', 'GUNIV3DAIUSDC2-A'],
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
      borrow: ['ETH-C', 'WBTC-C', 'CRVV1ETHSTETH-A'],
      multiply: ['ETH-B', 'WBTC-B', 'GUNIV3DAIUSDC2-A'],
      earn: ['GUNIV3DAIUSDC2-A'],
    },
  },
  descriptionCustomKeys: {
    'ETH-A': 'medium-exposure-medium-cost',
    'ETH-B': 'biggest-multiply',
    'ETH-C': 'lowest-stabilityFee-and-cheapest',
    'WSTETH-A': 'staking-rewards',
    'WBTC-A': 'medium-exposure-medium-cost',
    'WBTC-B': 'biggest-multiply',
    'WBTC-C': 'lowest-stabilityFee-and-cheapest',
    'RENBTC-A': 'great-borrowing-and-multiplying',
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
}

function btcProductCards(productCardsData: ProductCardData[]) {
  return productCardsData.filter((ilk) => BTC_TOKENS.includes(ilk.token))
}

function ethProductCards(productCardsData: ProductCardData[]) {
  return productCardsData.filter((ilk) => ETH_TOKENS.includes(ilk.token))
}

const notSupportedAnymoreLpTokens = ['UNIV2ETHUSDT', 'UNIV2LINKETH', 'UNIV2AAVEETH', 'UNIV2DAIUSDT']

export function uniLpProductCards(productCardsData: ProductCardData[]) {
  return productCardsData.filter(
    (ilk) =>
      LP_TOKENS.includes(ilk.token) &&
      !ONLY_MULTIPLY_TOKENS.includes(ilk.token) &&
      !notSupportedAnymoreLpTokens.includes(ilk.token),
  )
}

export function landingPageCardsData({
  productCardsData,
  product = 'multiply',
}: {
  productCardsData: ProductCardData[]
  product?: 'multiply' | 'borrow' | 'earn'
}) {
  return productCardsData.filter((ilk) =>
    productCardsConfig.landing.featuredCards[product].includes(ilk.ilk),
  )
}

function sortCards(
  productCardsData: ProductCardData[],
  sortingConfig: ProductPageType['ordering'],
  cardsFilter?: ProductLandingPagesFiltersKeys,
) {
  if (cardsFilter) {
    productCardsData = sortBy(productCardsData, (productCard) => {
      const orderForFilter = sortingConfig[cardsFilter]

      if (orderForFilter) {
        const order = orderForFilter.indexOf(productCard.ilk)
        if (order >= 0) {
          return order
        } else {
          return Infinity
        }
      }

      return 0
    })
  }
  return productCardsData
}

export function earnPageCardsData({ productCardsData }: { productCardsData: ProductCardData[] }) {
  return productCardsData.filter((data) => data.ilk === 'GUNIV3DAIUSDC2-A')
}

export function multiplyPageCardsData({
  productCardsData,
  cardsFilter,
}: {
  productCardsData: ProductCardData[]
  cardsFilter?: ProductLandingPagesFiltersKeys
}) {
  productCardsData = sortCards(productCardsData, productCardsConfig.multiply.ordering, cardsFilter)

  const multiplyTokens = productCardsData.filter((ilk) =>
    ALLOWED_MULTIPLY_TOKENS.includes(ilk.token),
  )

  if (cardsFilter === 'Featured') {
    return productCardsData.filter((ilk) =>
      productCardsConfig.multiply.featuredCards.includes(ilk.ilk),
    )
  }

  // TODO TEMPORARY UNTIL WE WILL HAVE EARN PAGE
  if (cardsFilter === 'UNI LP') {
    return productCardsData.filter((data) => data.ilk === 'GUNIV3DAIUSDC2-A')
  }

  if (cardsFilter === 'BTC') {
    return btcProductCards(productCardsData)
  }

  if (cardsFilter === 'ETH') {
    return ethProductCards(productCardsData)
  }

  return multiplyTokens.filter((ilk) => ilk.token === cardsFilter)
}

export function borrowPageCardsData({
  productCardsData,
  cardsFilter,
}: {
  productCardsData: ProductCardData[]
  cardsFilter?: ProductLandingPagesFiltersKeys
}): ProductCardData[] {
  productCardsData = sortCards(productCardsData, productCardsConfig.borrow.ordering, cardsFilter)

  if (cardsFilter === 'Featured') {
    return productCardsData.filter((ilk) =>
      productCardsConfig.borrow.featuredCards.includes(ilk.ilk),
    )
  }

  if (cardsFilter === 'UNI LP') {
    return uniLpProductCards(productCardsData)
  }

  if (cardsFilter === 'BTC') {
    return btcProductCards(productCardsData)
  }

  if (cardsFilter === 'ETH') {
    return ethProductCards(productCardsData)
  }

  if (cardsFilter === 'Curve LP') {
    return productCardsData.filter((card) => card.ilk === 'CRVV1ETHSTETH-A')
  }

  return productCardsData.filter((ilk) => ilk.token === cardsFilter)
}

export function createProductCardsData$(
  ilkDataList$: Observable<IlkDataList>,
  priceInfo$: (token: string) => Observable<PriceInfo>,
): Observable<ProductCardData[]> {
  return ilkDataList$.pipe(
    switchMap((ilkDataList) =>
      combineLatest(
        ...ilkDataList.map((ilk) => {
          const tokenMeta = getToken(ilk.token)
          return priceInfo$(ilk.token).pipe(
            switchMap((priceInfo) => {
              return of({
                token: ilk.token,
                ilk: ilk.ilk as Ilk,
                liquidationRatio: ilk.liquidationRatio,
                stabilityFee: ilk.stabilityFee,
                currentCollateralPrice: priceInfo.currentCollateralPrice,
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
  )
}
