import { BigNumber } from 'bignumber.js'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { IlkDataList } from '../blockchain/ilks'
import {
  ALLOWED_MULTIPLY_TOKENS,
  getToken,
  ONLY_LP_TOKENS,
  ONLY_MULTIPLY_TOKENS,
} from '../blockchain/tokensMetadata'
import { PriceInfo } from '../features/shared/priceInfo'

export interface ProductCardData {
  token: string
  ilk: string
  liquidationRatio: BigNumber
  stabilityFee: BigNumber
  currentCollateralPrice: BigNumber
}

export function landingPageCards(
  productCardsData: ProductCardData[],
  product: 'multiply' | 'borrow' | 'earn' = 'multiply',
) {
  const landingCardsMap = {
    multiply: ['ETH-A', 'WBTC-A', 'LINK-A'],
    borrow: ['ETH-A', 'WBTC-A', 'LINK-A'],
    earn: ['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A'],
  }

  return productCardsData.filter((ilk) => landingCardsMap[product].includes(ilk.ilk))
}

export function multiplyPageCards({
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

  const tokenMeta = getToken(token)

  return multiplyTokens.filter(
    (ilk) => ilk.token === token || tokenMeta.derivativeTokens?.includes(ilk.token),
  )
}

export function borrowPageCards({
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
    const lpTokensSymbols = ONLY_LP_TOKENS.map((lpToken) => lpToken.symbol)

    return productCardsData.filter(
      (ilk) => lpTokensSymbols.includes(ilk.token) && !ONLY_MULTIPLY_TOKENS.includes(ilk.token),
    )
  }

  const tokenMeta = getToken(token)

  return productCardsData.filter(
    (ilk) => ilk.token === token || tokenMeta.derivativeTokens?.includes(ilk.token),
  )
}

export function createProductCardsData$(
  ilkDataList$: Observable<IlkDataList>,
  priceInfo$: (token: string) => Observable<PriceInfo>,
): Observable<ProductCardData[]> {
  return ilkDataList$.pipe(
    switchMap((ilkDataList) =>
      combineLatest(
        ...ilkDataList.map((ilk) =>
          priceInfo$(ilk.token).pipe(
            switchMap((priceInfo) =>
              of({
                token: ilk.token,
                ilk: ilk.ilk,
                liquidationRatio: ilk.liquidationRatio,
                stabilityFee: ilk.stabilityFee,
                currentCollateralPrice: priceInfo.currentCollateralPrice,
              }),
            ),
          ),
        ),
      ),
    ),
  )
}
