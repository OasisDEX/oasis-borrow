import BigNumber from 'bignumber.js'
import { combineLatest, Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

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
    map((tokens) => {
      return combineLatest(
        tokens.map((token) => {
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
        }),
      )
    }),
    switchMap((tokenWithPrice) => {
      return tokenWithPrice
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
  tokenWithValue$: Observable<{ token: string; tokenPrice: BigNumber }[]>,
  getUserProxyAddress$: (userAddress: string) => Observable<string | undefined>,
  address: string,
): Observable<Position[]> {
  return combineLatest(getUserProxyAddress$(address), tokenWithValue$).pipe(
    switchMap(([proxyAddress, tokens]) => {
      if (!proxyAddress) return []
      return combineLatest(
        tokens.map(({ token, tokenPrice }) => {
          return userReserveData$({
            token,
            proxyAddress,
          }).pipe(
            map((userReserve) => {
              return {
                token: token,
                contentsUsd: new BigNumber(userReserve.currentATokenBalance).times(tokenPrice),
                title: `${token} Aave `,
                url: `/earn/steth/${address}`,
              }
            }),
          )
        }),
      )
    }),
  )
}

export function createPositions$(
  makerPositions$: (address: string) => Observable<Position[]>,
  aavePositions$: (address: string) => Observable<Position[]>,
  address: string,
): Observable<Position[]> {
  const _makerPositions$ = makerPositions$(address)
  // const _aavePositions$ = aavePositions$(address)
  return combineLatest(_makerPositions$).pipe(
    map(([makerPositions]) => {
      return makerPositions // .concat(aavePositions)
    }),
  )
}
