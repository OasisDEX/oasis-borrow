import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { ContextConnected } from 'blockchain/network'
import { NetworkIds } from 'blockchain/networks'
import { OraclePriceData, OraclePriceDataArgs } from 'blockchain/prices'
import { combineLatest, Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

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
