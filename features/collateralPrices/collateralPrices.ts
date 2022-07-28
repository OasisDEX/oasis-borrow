import { OraclePriceData, OraclePriceDataArgs } from 'blockchain/prices'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import {
  CollateralPricesWithFilters,
  collateralPricesWithFilters$,
} from './collateralPricesWithFilters'

export type CollateralPrice = OraclePriceData & { token: string }
export type CollateralPrices = CollateralPrice[]

export function createCollateralPrices$(
  collateralTokens: Observable<string[]>,
  oraclePriceData$: (args: OraclePriceDataArgs) => Observable<OraclePriceData>,
): Observable<CollateralPricesWithFilters> {
  return collateralTokens.pipe(
    switchMap((collateralTokens) =>
      combineLatest(
        ...collateralTokens.map((token) =>
          oraclePriceData$({
            token,
            requestedData: [
              'currentPrice',
              'nextPrice',
              'currentPriceUpdate',
              'nextPriceUpdate',
              'priceUpdateInterval',
              'isStaticPrice',
              'percentageChange',
            ],
          }).pipe(switchMap((oraclePriceData) => of({ ...oraclePriceData, token }))),
        ),
      ).pipe(switchMap((collateralPrices) => collateralPricesWithFilters$(collateralPrices))),
    ),
  )
}
