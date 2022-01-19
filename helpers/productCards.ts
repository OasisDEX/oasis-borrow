import { BigNumber } from 'bignumber.js'
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
  ilk: string
  liquidationRatio: BigNumber
  stabilityFee: BigNumber
  currentCollateralPrice: BigNumber
  bannerIcon: string
  bannerGif: string
  background: string
  name: string
}

export const productCardsConfig = {
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
    ],
    featuredCards: ['ETH-A', 'WBTC-A', 'LINK-A'],
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
    featuredCards: ['ETH-A', 'WBTC-A', 'LINK-A'],
  },
  landing: {
    featuredCards: {
      multiply: ['ETH-A', 'WBTC-A', 'LINK-A'],
      borrow: ['ETH-A', 'WBTC-A', 'LINK-A'],
      earn: ['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A'],
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

function uniLpProductCards(productCardsData: ProductCardData[]) {
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

export function multiplyPageCardsData({
  productCardsData,
  cardsFilter,
}: {
  productCardsData: ProductCardData[]
  cardsFilter?: string
}) {
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
    return productCardsData.filter(
      (data) => data.ilk === 'GUNIV3DAIUSDC1-A' || data.ilk === 'GUNIV3DAIUSDC2-A',
    )
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
  cardsFilter?: string
}) {
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
            switchMap((priceInfo) =>
              of({
                token: ilk.token,
                ilk: ilk.ilk,
                liquidationRatio: ilk.liquidationRatio,
                stabilityFee: ilk.stabilityFee,
                currentCollateralPrice: priceInfo.currentCollateralPrice,
                bannerIcon: tokenMeta.bannerIconAssetFeature,
                bannerGif: tokenMeta.bannerGif,
                background: tokenMeta.backgroundAssetFeature,
                name: tokenMeta.name,
              }),
            ),
          )
        }),
      ),
    ),
  )
}
