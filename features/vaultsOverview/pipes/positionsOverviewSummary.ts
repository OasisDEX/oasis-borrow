import BigNumber from 'bignumber.js'
import { uniq } from 'lodash'
import { combineLatest, Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'

import { Ticker } from '../../../blockchain/prices'
import * as tokenList from '../../../components/uniswapWidget/tokenList.json'
import { zero } from '../../../helpers/zero'
import { AssetAction } from './assetActions'

export type PositionView = {
  token: string
  title: string
  fundsAvailableUsd?: BigNumber
  url?: string
  proportion?: BigNumber
  actions?: Array<AssetAction>
}

function isPosition(thing: Position | WalletAssets): thing is Position {
  return (thing as Position).fundsAvailable !== undefined
}

function getPositionOrAssetValue(thing: Position | WalletAssets): BigNumber {
  return isPosition(thing) ? thing.fundsAvailable : thing.balanceUsd
}

export type Position = {
  token: string
  title: string
  fundsAvailable: BigNumber
  url: string
}

type WalletAssets = {
  balanceUsd: BigNumber
  token: string
  assetActions: Array<AssetAction>
}

type Top5AssetsAndPositionsViewModal = {
  assetsAndPositions: Array<PositionView>
  percentageOther: BigNumber
  totalValueUsd: BigNumber
}

const tokensWeCareAbout: Array<string> = uniq(tokenList.tokens.map((t) => t.symbol.toUpperCase()))
tokensWeCareAbout.push('ETH')

export function createPositionsOverviewSummary$(
  walletBalance$: (token: string, address: string) => Observable<BigNumber>,
  createTokenPriceInUSD$: (tokens: Array<string>) => Observable<Ticker>,
  createPositions$: (address: string) => Observable<Position[]>,
  createAssetActions$: (token: string) => Observable<Array<AssetAction>>,
  address: string,
): Observable<Top5AssetsAndPositionsViewModal> {
  const tokenBalances$: Observable<Array<WalletAssets>> = combineLatest(
    tokensWeCareAbout.map((t) =>
      combineLatest(
        walletBalance$(t, address),
        of(t),
        createTokenPriceInUSD$([t]),
        createAssetActions$(t),
      ).pipe(
        map(([balance, token, priceData, assetActions]) => {
          return {
            balanceUsd: balance.multipliedBy(priceData[token] || zero),
            token,
            assetActions,
          }
        }),
      ),
    ),
  )

  const positions$ = createPositions$(address)

  // merge and sort
  const flattenedTokensAndPositions$ = combineLatest(tokenBalances$, positions$).pipe(
    map(([tokensAndBalances, makerPositions]) =>
      [...tokensAndBalances, ...makerPositions]
        .sort((tokenA, tokenB) => {
          const tokenAUsdAmount = getPositionOrAssetValue(tokenA)
          const tokenBUsdAmount = getPositionOrAssetValue(tokenB)
          if (!tokenAUsdAmount) {
            return 1 // push a to bottom
          }
          if (!tokenBUsdAmount) {
            return -1 // push b to bottom
          }
          return tokenBUsdAmount.minus(tokenAUsdAmount).toNumber()
        })
        .filter((token) => getPositionOrAssetValue(token).gt(zero)),
    ),
  )

  // consolidate to view model
  const assetsAndPositions$: Observable<Array<PositionView>> = flattenedTokensAndPositions$.pipe(
    map((flattenedTokenBalances) =>
      flattenedTokenBalances.map((assetOrPosition) => {
        if (isPosition(assetOrPosition)) {
          return {
            token: assetOrPosition.token,
            title: assetOrPosition.title,
            fundsAvailableUsd: assetOrPosition.fundsAvailable,
            url: assetOrPosition.url,
          }
        } else {
          return {
            token: assetOrPosition.token,
            title: assetOrPosition.token,
            fundsAvailableUsd: assetOrPosition.balanceUsd,
            actions: assetOrPosition.assetActions,
          }
        }
      }),
    ),
  )

  // calc total assets value
  const totalAssetsUsd$: Observable<BigNumber> = assetsAndPositions$.pipe(
    map((tokensAndBalances) =>
      tokensAndBalances.reduce(
        (acc, { fundsAvailableUsd }) => acc.plus(fundsAvailableUsd || zero),
        zero,
      ),
    ),
  )

  // add percentages
  const rowViewModels$: Observable<Array<PositionView>> = combineLatest(
    assetsAndPositions$,
    totalAssetsUsd$,
  ).pipe(
    map(([assetsAndPositions, totalAssetsUsd]) =>
      assetsAndPositions.map((assetOrPosition) => {
        return {
          ...assetOrPosition,
          proportion: assetOrPosition.fundsAvailableUsd?.div(totalAssetsUsd).times(100),
        }
      }),
    ),
  )

  // create percentage of other things
  const percentageOther$: Observable<BigNumber> = combineLatest(
    rowViewModels$,
    totalAssetsUsd$,
  ).pipe(
    map(([assetsAndPositions, totalAssetsUsd]) => {
      const top5Sum = assetsAndPositions
        .slice(0, 5)
        .reduce((acc, { fundsAvailableUsd }) => acc.plus(fundsAvailableUsd || zero), zero)
      return totalAssetsUsd.minus(top5Sum).div(totalAssetsUsd).times(100)
    }),
  )

  return combineLatest(rowViewModels$, percentageOther$, totalAssetsUsd$).pipe(
    map(([assetsAndPositions, percentageOther, totalValueUsd]) => ({
      assetsAndPositions,
      percentageOther,
      totalValueUsd,
    })),
  )
}
