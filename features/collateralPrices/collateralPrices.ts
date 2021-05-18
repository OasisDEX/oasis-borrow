import { OraclePriceData } from 'blockchain/prices'
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
  oraclePriceData$: (token: string) => Observable<OraclePriceData>,
): Observable<CollateralPricesWithFilters> {
  return collateralTokens.pipe(
    switchMap((collateralTokens) =>
      combineLatest(
        ...collateralTokens.map((token) =>
          oraclePriceData$(token).pipe(
            switchMap((oraclePriceData) => of({ ...oraclePriceData, token })),
          ),
        ),
      ).pipe(switchMap((collateralPrices) => collateralPricesWithFilters$(collateralPrices))),
    ),
  )
}
