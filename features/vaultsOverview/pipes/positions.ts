import BigNumber from 'bignumber.js'
import { combineLatest, EMPTY, Observable, of } from 'rxjs'
import { filter, map, startWith, switchMap } from 'rxjs/operators'

import {
  AaveUserAccountData,
  AaveUserAccountDataParameters,
  MINIMAL_COLLATERAL,
} from '../../../blockchain/calls/aave/aaveLendingPool'
import { VaultWithType, VaultWithValue } from '../../../blockchain/vaults'
import { ExchangeAction, ExchangeType, Quote } from '../../exchange/exchange'
import { Position } from './positionsOverviewSummary'

function makerPositionName(vault: VaultWithType): string {
  if (isMakerEarnPosition(vault)) {
    return `${vault.ilk} Oasis Earn`
  } else if (vault.type === 'borrow') {
    return `${vault.ilk} Oasis Borrow`
  } else {
    return `${vault.ilk} Oasis Multiply`
  }
}

export function isMakerEarnPosition(vault: VaultWithType): boolean {
  return (
    vault.type === 'multiply' &&
    (vault.token === 'GUNIV3DAIUSDC1' || vault.token === 'GUNIV3DAIUSDC2')
  )
}

export function createMakerPositions$(
  vaultsWithValue$: (address: string) => Observable<VaultWithValue<VaultWithType>[]>,
  address: string,
): Observable<Position[]> {
  return vaultsWithValue$(address).pipe(
    map((vaults) => {
      return vaults.map((vault) => {
        return {
          token: vault.token,
          contentsUsd: vault.value,
          title: makerPositionName(vault),
          url: `/${vault.id}`,
        }
      })
    }),
  )
}

export function decorateAaveTokensPrice$(
  collateralTokens$: Observable<string[]>,
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
    exchangeType: ExchangeType,
  ) => Observable<Quote>,
): Observable<{ token: string; tokenPrice: BigNumber }[]> {
  return collateralTokens$.pipe(
    switchMap((tokens) => {
      const tokens$ = tokens.map((token) => {
        const defaultQuoteAmount = new BigNumber(100)
        return exchangeQuote$(
          token,
          new BigNumber(0.005),
          defaultQuoteAmount,
          'BUY_COLLATERAL', // should be SELL_COLLATERAL but the manage multiply pipe uses BUY, and we want the values the same.
          'defaultExchange',
        ).pipe(
          map((quote) => {
            return {
              token,
              tokenPrice: quote.status === 'SUCCESS' ? quote.tokenPrice : new BigNumber(0),
            }
          }),
        )
      })
      return tokens$.length === 0 ? of([]) : combineLatest(tokens$)
    }),
  )
}

export type AavePosition = Position & {
  netValue: BigNumber
  liquidity: BigNumber
  pln: string
  ownerAddress: string
}

export function createAavePosition$(
  userAaveAccountData$: (
    parameters: AaveUserAccountDataParameters,
  ) => Observable<AaveUserAccountData>,
  aaveAvailableLiquidityETH$: Observable<BigNumber>,
  ethPrice$: Observable<BigNumber>,
  getUserProxyAddress$: (userAddress: string) => Observable<string | undefined>,
  address: string,
): Observable<AavePosition | undefined> {
  return combineLatest(getUserProxyAddress$(address), aaveAvailableLiquidityETH$, ethPrice$).pipe(
    switchMap(([proxyAddress, liquidity, ethPrice]) => {
      if (!proxyAddress) return EMPTY
      return userAaveAccountData$({ proxyAddress }).pipe(
        filter((accountData) => accountData.totalCollateralETH.gt(MINIMAL_COLLATERAL)),
        map((accountData) => {
          const netValue = accountData.totalCollateralETH
            .minus(accountData.totalDebtETH)
            .times(ethPrice)
          return {
            token: 'STETH',
            contentsUsd: netValue,
            title: 'AAVE-stETH-ETH',
            url: `/earn/steth/${address}`,
            netValue: netValue,
            liquidity: liquidity,
            pln: 'N/A',
            ownerAddress: address,
          }
        }),
        startWith(undefined),
      )
    }),
  )
}

export function createPositions$(
  makerPositions$: (address: string) => Observable<Position[]>,
  aavePositions$: (address: string) => Observable<Position | undefined>,
  address: string,
): Observable<Position[]> {
  const _makerPositions$ = makerPositions$(address)
  const _aavePositions$ = aavePositions$(address)
  return combineLatest(_makerPositions$, _aavePositions$).pipe(
    map(([makerPositions, aavePosition]) => {
      return makerPositions.concat(aavePosition ? [aavePosition] : [])
    }),
  )
}
