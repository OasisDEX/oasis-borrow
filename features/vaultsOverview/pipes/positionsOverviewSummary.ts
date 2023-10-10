import type BigNumber from 'bignumber.js'
import type { Tickers } from 'blockchain/prices.types'
import { tokenList } from 'components/swapWidget/tokenList'
import { zero } from 'helpers/zero'
import { isEqual, uniq } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, of } from 'rxjs'
import { debounceTime, distinctUntilChanged, map, shareReplay } from 'rxjs/operators'

import type { AssetAction } from './assetActions'

export type PositionView = {
  token: string
  title: string
  contentsUsd?: BigNumber
  url?: string
  proportion?: BigNumber
  missingPriceData: boolean
  actions?: Array<AssetAction>
}

function isPosition(thing: Position | WalletAssets): thing is Position {
  return (thing as Position).contentsUsd !== undefined
}

function getPositionOrAssetValue(thing: Position | WalletAssets): BigNumber {
  return isPosition(thing) ? thing.contentsUsd : thing.balanceUsd
}

export type Position = {
  token: string
  title: string
  contentsUsd: BigNumber
  url: string
}

type WalletAssets = {
  balanceUsd: BigNumber
  missingPriceData: boolean
  token: string
  assetActions: Array<AssetAction>
}

export type TopAssetsAndPositionsViewModal = {
  assetsAndPositions: Array<PositionView>
  percentageOther: BigNumber
  totalValueUsd: BigNumber
}

const tokensWeCareAbout: Array<string> = uniq(tokenList.tokens.map((t) => t.symbol.toUpperCase()))
tokensWeCareAbout.push('ETH')

export function createPositionsOverviewSummary$(
  walletBalance$: (token: string, address: string) => Observable<BigNumber>,
  createTokenPriceInUSD$: (tokens: Array<string>) => Observable<Tickers>,
  createPositions$: (address: string) => Observable<Position[]>,
  createAssetActions$: (token: string) => Observable<Array<AssetAction>>,
  address: string,
): Observable<TopAssetsAndPositionsViewModal> {
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
            missingPriceData: !priceData[token],
            balanceUsd: balance.multipliedBy(priceData[token] || zero),
            token,
            assetActions,
          }
        }),
      ),
    ),
  ).pipe(
    map((tokenBalancesAndActions) => {
      return [...tokenBalancesAndActions.filter(({ assetActions }) => assetActions.length > 0)]
    }),
    shareReplay(1),
  )

  const positions$ = createPositions$(address)

  // merge and sort
  const flattenedTokensAndPositions$ = combineLatest(tokenBalances$, positions$).pipe(
    map(([tokensAndBalances, positions]) =>
      [...tokensAndBalances, ...positions]
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
        .filter((token) => {
          const valueUsd = getPositionOrAssetValue(token)
          return (
            valueUsd.decimalPlaces(2).gt(zero) ||
            ((token as WalletAssets)?.missingPriceData && valueUsd.decimalPlaces(2).gt(zero))
          ) // only care about meaningful dollar values
        }),
    ),
  )

  // consolidate to view model
  const assetsAndPositions$: Observable<Array<PositionView>> = flattenedTokensAndPositions$.pipe(
    map((flattenedTokenBalances) =>
      flattenedTokenBalances.map((assetOrPosition) => {
        if (isPosition(assetOrPosition)) {
          return {
            missingPriceData: false,
            token: assetOrPosition.token,
            title: assetOrPosition.title,
            contentsUsd: assetOrPosition.contentsUsd,
            url: assetOrPosition.url,
          }
        } else {
          return {
            missingPriceData: assetOrPosition.missingPriceData,
            token: assetOrPosition.token,
            title: assetOrPosition.token,
            contentsUsd: assetOrPosition.balanceUsd,
            actions: assetOrPosition.assetActions,
          }
        }
      }),
    ),
  )

  // calc total assets value
  const positionsWithTotalBalance$: Observable<[PositionView[], BigNumber]> =
    assetsAndPositions$.pipe(
      map((assetsAndPositions) => {
        const totalAssetsUsd = assetsAndPositions.reduce(
          (acc, { contentsUsd }) => acc.plus(contentsUsd || zero),
          zero,
        )

        const viewModels: PositionView[] = assetsAndPositions.map((assetOrPosition) => {
          return {
            ...assetOrPosition,
            proportion: assetOrPosition.contentsUsd?.div(totalAssetsUsd).times(100),
          }
        })

        return [viewModels, totalAssetsUsd] as [PositionView[], BigNumber]
      }),
    )

  // create percentage of other things
  const withPercentageOther$: Observable<[PositionView[], BigNumber, BigNumber]> =
    positionsWithTotalBalance$.pipe(
      map(([assetsAndPositions, totalAssetsUsd]) => {
        const top5Sum = assetsAndPositions
          .slice(0, 5)
          .reduce((acc, { contentsUsd }) => acc.plus(contentsUsd || zero), zero)
        const percentageOther = totalAssetsUsd.minus(top5Sum).div(totalAssetsUsd).times(100)
        return [assetsAndPositions, percentageOther, totalAssetsUsd] as [
          PositionView[],
          BigNumber,
          BigNumber,
        ]
      }),
    )

  return withPercentageOther$.pipe(
    map(([assetsAndPositions, percentageOther, totalValueUsd]) => ({
      assetsAndPositions,
      percentageOther,
      totalValueUsd,
    })),
    debounceTime(500),
    distinctUntilChanged(isEqual),
  )
}
