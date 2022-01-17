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
  background: string
  name: string
}

function btcProductCards(productCardsData: ProductCardData[]) {
  return productCardsData.filter((ilk) => BTC_TOKENS.includes(ilk.token))
}

function ethProductCards(productCardsData: ProductCardData[]) {
  return productCardsData.filter((ilk) => ETH_TOKENS.includes(ilk.token))
}

function uniLpProductCards(productCardsData: ProductCardData[]) {
  return productCardsData.filter(
    (ilk) => LP_TOKENS.includes(ilk.token) && !ONLY_MULTIPLY_TOKENS.includes(ilk.token),
  )
}

export function landingPageCardsData({
  productCardsData,
  product = 'multiply',
}: {
  productCardsData: ProductCardData[]
  product?: 'multiply' | 'borrow' | 'earn'
}) {
  const landingCardsMap = {
    multiply: ['ETH-A', 'WBTC-A', 'LINK-A'],
    borrow: ['ETH-A', 'WBTC-A', 'LINK-A'],
    earn: ['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A'],
  }

  return productCardsData.filter((ilk) => landingCardsMap[product].includes(ilk.ilk))
}

export function multiplyPageCardsData({
  productCardsData,
  token,
}: {
  productCardsData: ProductCardData[]
  token?: string
}) {
  const featuredCards = ['ETH-A', 'WBTC-A', 'LINK-A']
  const multiplyTokens = productCardsData.filter((ilk) =>
    ALLOWED_MULTIPLY_TOKENS.includes(ilk.token),
  )

  if (!token) {
    return productCardsData.filter((ilk) => featuredCards.includes(ilk.ilk))
  }

  if (token === 'BTC') {
    return btcProductCards(productCardsData)
  }

  if (token === 'ETH') {
    return ethProductCards(productCardsData)
  }

  return multiplyTokens.filter((ilk) => ilk.token === token)
}

export function borrowPageCardsData({
  productCardsData,
  token,
}: {
  productCardsData: ProductCardData[]
  token?: string
}) {
  const featuredCards = ['ETH-A', 'WBTC-A', 'ETH-C']

  if (!token) {
    return productCardsData.filter((ilk) => featuredCards.includes(ilk.ilk))
  }

  if (token === 'UNI-LP') {
    return uniLpProductCards(productCardsData)
  }

  if (token === 'BTC') {
    return btcProductCards(productCardsData)
  }

  if (token === 'ETH') {
    return ethProductCards(productCardsData)
  }

  return productCardsData.filter((ilk) => ilk.token === token)
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
