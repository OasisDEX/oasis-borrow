import type BigNumber from 'bignumber.js'
import type { Observable } from 'rxjs';
import { combineLatest } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { getNetworkContracts } from './contracts'
import type { ContextConnected } from './network'
import { NetworkIds } from './networks/'
import type { OraclePriceData, OraclePriceDataArgs } from './prices'

export interface CollateralLocked {
  ilk: string
  token: string
  collateral: BigNumber
}

export interface TotalValueLocked {
  value: BigNumber
}

export function getCollateralLocked$(
  context$: Observable<ContextConnected>,
  ilkToToken$: (ilk: string) => Observable<string>,
  balance$: (token: string, address: string) => Observable<BigNumber>,
  ilk: string,
): Observable<CollateralLocked> {
  return combineLatest(context$, ilkToToken$(ilk)).pipe(
    switchMap(([context, token]) => {
      const address = getNetworkContracts(NetworkIds.MAINNET, context.chainId).joins[ilk]
      return balance$(token, address).pipe(map((balance) => ({ ilk, token, collateral: balance })))
    }),
  )
}

export function getTotalValueLocked$(
  getCollateralLocked$: (ilk: string) => Observable<CollateralLocked>,
  oraclePriceData$: (args: OraclePriceDataArgs) => Observable<OraclePriceData>,
  ilk: string,
): Observable<TotalValueLocked> {
  return getCollateralLocked$(ilk).pipe(
    switchMap((collateralLocked) => {
      const token = collateralLocked.token
      return oraclePriceData$({ token, requestedData: ['currentPrice'] }).pipe(
        map((oraclePriceData) => {
          const { currentPrice } = oraclePriceData
          const { collateral } = collateralLocked
          return { value: collateral.times(currentPrice) }
        }),
      )
    }),
  )
}
