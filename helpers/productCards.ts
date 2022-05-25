import { BigNumber } from 'bignumber.js'
import { IlkWithBalance } from 'features/ilks/ilksWithBalances'
import { sortBy } from 'lodash'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { supportedIlks } from '../blockchain/config'
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
}
export type ProductTypes = 'borrow' | 'multiply' | 'earn'

type Ilk = typeof supportedIlks[number]

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
  'GUNIV3DAIUSDC1-A',
  'GUNIV3DAIUSDC2-A',
  'LINK-A',
  'UNI-A',
  'YFI-A',
  'MANA-A',
  'MATIC-A',
  'WSTETH-B',
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
    featuredCards: Record<ProductTypes, Array<Ilk>>
  }
  descriptionCustomKeys: Record<Ilk, string>
  descriptionLinks: Record<Ilk, { link: string; name: string }>
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
      borrow: [
        'ETH-C',
        'WBTC-C',
        // 'CRVV1ETHSTETH-A',
        'WSTETH-B',
      ],
      multiply: ['ETH-B', 'WBTC-B', 'GUNIV3DAIUSDC2-A'],
      earn: ['GUNIV3DAIUSDC2-A'],
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
    'UNI-A': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_5813529831231652792943692',
      name: 'Maker (UNI-A)',
    },
    'GUNIV3DAIUSDC2-A': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_1653695461291652792950901',
      name: 'Maker/Gelato/Uniswap',
    },
    'UNIV2DAIETH-A': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_1653695461291652792950901',
      name: 'Maker/Uniswap',
    },
    'UNIV2WBTCETH-A': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_1653695461291652792950901',
      name: 'Maker/Uniswap',
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
    'UNIV2UNIETH-A': {
      link:
        'https://kb.oasis.app/help/collaterals-supported-in-oasis-app#h_1653695461291652792950901',
      name: 'Maker/Uniswap',
    },
    'UNIV2WBTCDAI-A': {
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

export function cardFiltersFromBalances(
  productCardsData: ProductCardData[],
): Array<ProductLandingPagesFiltersKeys> {
  return productCardsData
    .filter((cardData) => cardData.balance && cardData.balance.isGreaterThan(0))
    .map((d) => (d.token as unknown) as ProductLandingPagesFiltersKeys)
}

export function createProductCardsWithBalance$(
  ilksWithBalance$: Observable<IlkWithBalance[]>,
  priceInfo$: (token: string) => Observable<PriceInfo>,
): Observable<ProductCardData[]> {
  return ilksWithBalance$.pipe(
    switchMap((ilkDataList) =>
      combineLatest(
        ...ilkDataList
          .filter((ilk) => ilk.debtCeiling.gt(zero))
          .map((ilk) => {
            const tokenMeta = getToken(ilk.token)
            return priceInfo$(ilk.token).pipe(
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
                liquidityAvailable: ilk.ilkDebtAvailable,
                stabilityFee: ilk.stabilityFee,
                debtFloor: ilk.debtFloor,
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
