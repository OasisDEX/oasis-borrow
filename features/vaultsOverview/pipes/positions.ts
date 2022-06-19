import { combineLatest, Observable, of } from 'rxjs'
import { switchMap, map } from 'rxjs/operators'

import { VaultWithType } from '../../../blockchain/vaults'
import { Position } from './positionsOverviewSummary'
import { BigNumber } from 'bignumber.js'
import { ExchangeAction, ExchangeType, Quote } from '../../exchange/exchange'
import { UserSettingsState } from '../../userSettings/userSettings'

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

export function createPositions$(
  createMakerVaults$: (address: string) => Observable<VaultWithType[]>,
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
    exchangeType: ExchangeType,
  ) => Observable<Quote>,
  userSettings$: Observable<UserSettingsState>,
  address: string,
): Observable<Position[]> {
  return combineLatest(createMakerVaults$(address), userSettings$).pipe(
    switchMap(([vaults, userSettings]: [Array<VaultWithType>, UserSettingsState]) => {
      if (vaults.length > 0) {
        return combineLatest(
          vaults.map((vault) => {
            if (vault.type === 'borrow') {
              return of({
                token: vault.token,
                contentsUsd: vault.lockedCollateralUSD.minus(vault.debt),
                title: makerPositionName(vault),
                url: `/${vault.id}`,
              })
            }
            return exchangeQuote$(
              vault.token,
              userSettings.slippage,
              vault.lockedCollateral,
              'BUY_COLLATERAL',
              'defaultExchange',
            ).pipe(
              map((quote) => {
                const collateralValue =
                  quote.status === 'SUCCESS'
                    ? vault.lockedCollateral.times(quote.tokenPrice)
                    : vault.lockedCollateralUSD
                return {
                  token: vault.token,
                  contentsUsd: collateralValue.minus(vault.debt),
                  title: makerPositionName(vault),
                  url: `/${vault.id}`,
                }
              }),
            )
          }),
        )
      } else {
        return of([])
      }
    }),
  )
}
