import { OraclePriceData } from 'blockchain/prices'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

export type CollateralPrice = OraclePriceData & { token: string }
export type CollateralPrices = CollateralPrice[]

export function createCollateralPrices$(
  collateralTokens: Observable<string[]>,
  oraclePriceData$: (token: string) => Observable<OraclePriceData>,
): Observable<CollateralPrices> {
  return collateralTokens.pipe(
    switchMap((collateralTokens) =>
      combineLatest(
        ...collateralTokens.map((token) =>
          oraclePriceData$(token).pipe(
            switchMap((oraclePriceData) => of({ ...oraclePriceData, token })),
          ),
        ),
      ),
    ),
  )
}
