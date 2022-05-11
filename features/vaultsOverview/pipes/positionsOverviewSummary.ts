import { combineLatest, merge, Observable, of, Subject } from 'rxjs'
import BigNumber from 'bignumber.js'
import * as tokenList from '../../../components/uniswapWidget/tokenList.json'
import { map } from 'rxjs/operators'
import { uniq } from 'lodash'
import { Ticker } from '../../../blockchain/prices'
import { zero } from '../../../helpers/zero'

export type Asset = {
  token: string
  proportion?: BigNumber
  valueUSD?: BigNumber
}

type Position = {
  token: string
  title: string
  proportion: BigNumber
  valueUSD: BigNumber
  url: string
}

type Top5AssetsAndPositionsViewModal = {
  assetsAndPositions: Array<Asset | Position>
  percentageOther: BigNumber
  totalValueUsd: BigNumber
}

const tokensWeCareAbout: Array<string> = uniq(tokenList.tokens.map((t) => t.symbol.toUpperCase()))
tokensWeCareAbout.push('ETH')

export function createPositionsOverviewSummary$(
  walletBalance$: (token: string, address: string) => Observable<BigNumber>,
  createTokenPriceInUSD$: (tokens: Array<string>) => Observable<Ticker>,
  // vaults$: (address: string) => Observable<VaultWithType[]>,
  address: string,
): Observable<Top5AssetsAndPositionsViewModal> {
  const tokenBalances: Array<Observable<{
    balanceUsd: BigNumber
    token: string
  }>> = tokensWeCareAbout.map((t) =>
    combineLatest(walletBalance$(t, address), of(t), createTokenPriceInUSD$([t])).pipe(
      map(([balance, token, priceData]) => {
        return {
          balanceUsd: balance.multipliedBy(priceData[token] || zero),
          token,
        }
      }),
    ),
  )

  const totalAssetsUsd$: Observable<BigNumber> = combineLatest(tokenBalances).pipe(
    map((tokensAndBalances) =>
      tokensAndBalances.reduce((acc, { balanceUsd }) => acc.plus(balanceUsd), zero),
    ),
  )

  // gather positions

  // merge and sort
  const flattedTokenBalances$ = combineLatest(tokenBalances).pipe(
    map((tokensAndBalances) =>
      tokensAndBalances
        .sort((tokenA, tokenB) => {
          const tokenAUsdAmount = tokenA.balanceUsd
          const tokenBUsdAmount = tokenB.balanceUsd
          if (!tokenAUsdAmount) {
            return 1 // push a to bottom
          }
          if (!tokenBUsdAmount) {
            return -1 // push b to bottom
          }
          return tokenBUsdAmount.minus(tokenAUsdAmount).toNumber()
        })
        .filter(({ balanceUsd }) => balanceUsd.gt(zero)),
    ),
  )

  const assetsAndPositions$: Observable<Array<Asset | Position>> = combineLatest(
    flattedTokenBalances$,
    totalAssetsUsd$,
  ).pipe(
    map(([flattenedTokenBalances, totalAssetsUsd]) =>
      flattenedTokenBalances.map(({ token, balanceUsd }) => {
        return {
          token,
          valueUSD: balanceUsd,
          proportion: balanceUsd && balanceUsd.div(totalAssetsUsd).times(100),
        }
      }),
    ),
  )

  const percentageOther$: Observable<BigNumber> = combineLatest(
    assetsAndPositions$,
    totalAssetsUsd$,
  ).pipe(
    map(([assetsAndPositions, totalAssetsUsd]) => {
      const top5Sum = assetsAndPositions
        .slice(0, 5)
        .reduce((acc, { valueUSD }) => acc.plus(valueUSD || zero), zero)
      return totalAssetsUsd.minus(top5Sum).div(totalAssetsUsd).times(100)
    }),
  )

  return combineLatest(assetsAndPositions$, percentageOther$, totalAssetsUsd$).pipe(
    map(([assetsAndPositions, percentageOther, totalValueUsd]) => ({
      assetsAndPositions,
      percentageOther,
      totalValueUsd,
    })),
  )
}
