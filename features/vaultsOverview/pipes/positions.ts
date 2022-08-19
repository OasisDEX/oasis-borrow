import BigNumber from 'bignumber.js'
import { combineLatest, Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { VaultWithType, VaultWithValue } from '../../../blockchain/vaults'
import { ExchangeAction, ExchangeType, Quote } from "../../exchange/exchange";
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

export function createAavePositions$(
  userReserveData$: ({
    token,
    proxyAddress,
  }: {
    token: string
    proxyAddress: string
  }) => Observable<{ currentATokenBalance: BigNumber }>,
  collateralTokens$: Observable<string[]>,
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
    exchangeType: ExchangeType,
  ) => Observable<Quote>,
  getUserProxyAddress$: (userAddress: string) => Observable<string | undefined>,
  address: string,
): Observable<Position[]> {
  return combineLatest(collateralTokens$, getUserProxyAddress$(address)).pipe(
    map(([tokens, proxyAddress]) => {
      if (!proxyAddress) return []
      return combineLatest(
        tokens.map((token) => {
          return userReserveData$({
            token,
            proxyAddress,
          }).pipe(
            map((userReserve) => {
              return exchangeQuote$(
                token,
                new BigNumber(0.005),
                new BigNumber(userReserve.currentATokenBalance),
                'BUY_COLLATERAL', // should be SELL_COLLATERAL but the manage multiply pipe uses BUY, and we want the values the same.
                'defaultExchange'
              ).pipe(
                switchMap((quote) => {
                  return of({
                    token: token,
                    contentsUsd: quote.status === 'SUCCESS' ? new BigNumber(userReserve.currentATokenBalance).times(quote.tokenPrice) : new BigNumber(0),
                    title: `${token} Aave `,
                    url: `/earn/steth/${address}`,
                  })
                })
              )
            }),
          switchMap((input) => {
            return input
          }),
          )
        })
      )
    }),
    switchMap((input) => {
      return input
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
  return combineLatest([_makerPositions$, _aavePositions$]).pipe(
    map(([makerPositions, aavePositions]) => {
      return makerPositions.concat(aavePositions)
    }),
  )
}
