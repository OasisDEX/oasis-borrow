import BigNumber from 'bignumber.js'
import { combineLatest, Observable, of } from 'rxjs'
import { filter, map, switchMap } from 'rxjs/operators'

import {
  AaveUserAccountData,
  AaveUserAccountDataParameters,
} from '../../../blockchain/calls/aave/aaveLendingPool'
import {
  AaveUserReserveData,
  AaveUserReserveDataParameters,
} from '../../../blockchain/calls/aave/aaveProtocolDataProvider'
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

export function createAavePositions$(
  userReserveData$: (parameters: AaveUserReserveDataParameters) => Observable<AaveUserReserveData>,
  userAaveAccountData$: (
    parameters: AaveUserAccountDataParameters,
  ) => Observable<AaveUserAccountData>,
  aaveAvailableLiquidityETH$: Observable<BigNumber>,
  tokenWithValue$: Observable<{ token: string; tokenPrice: BigNumber }[]>,
  ethPrice$: Observable<BigNumber>,
  getUserProxyAddress$: (userAddress: string) => Observable<string | undefined>,
  address: string,
): Observable<AavePosition[]> {
  return combineLatest(
    getUserProxyAddress$(address),
    tokenWithValue$,
    aaveAvailableLiquidityETH$,
    ethPrice$,
  ).pipe(
    switchMap(([proxyAddress, tokens, liquidity, ethPrice]) => {
      if (!proxyAddress) return of([])
      const tokens$ = tokens.map(({ token }) => {
        return combineLatest(
          userReserveData$({
            token,
            proxyAddress,
          }),
          userAaveAccountData$({ proxyAddress }),
        ).pipe(
          filter(([_, accountData]) => accountData.totalCollateralETH.gt(new BigNumber(0.00001))),
          map(([_, accountData]) => {
            const netValue = accountData.totalCollateralETH
              .minus(accountData.totalDebtETH)
              .times(ethPrice)
            return {
              token: token,
              contentsUsd: netValue,
              title: 'AAVE-stETH-ETH',
              url: `/earn/steth/${address}`,
              netValue: netValue,
              liquidity: liquidity,
              pln: 'N/A',
              ownerAddress: address,
            }
          }),
        )
      })
      return tokens$.length === 0 ? of([]) : combineLatest(tokens$)
    }),
  )
}

export function createPositions$(
  makerPositions$: (address: string) => Observable<Position[]>,
  aavePositions$: (address: string) => Observable<Position[]>,
  address: string,
): Observable<Position[]> {
  const _makerPositions$ = makerPositions$(address)
  const _aavePositions$ = aavePositions$(address)
  return combineLatest(_makerPositions$, _aavePositions$).pipe(
    map(([makerPositions, aavePositions]) => {
      return makerPositions.concat(aavePositions)
    }),
  )
}
