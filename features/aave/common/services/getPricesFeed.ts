import { Tickers } from 'blockchain/prices'
import { BaseAaveEvent } from 'features/aave/common/BaseAaveContext'
import { isEqual } from 'lodash'
import { Observable } from 'rxjs'
import { distinctUntilChanged } from 'rxjs/internal/operators'
import { map } from 'rxjs/operators'

export function getPricesFeed$(
  prices$: (tokens: string[]) => Observable<Tickers>,
): (collateralToken: string, debtToken: string) => Observable<BaseAaveEvent> {
  return (collateralToken: string, debtToken: string) => {
    return prices$([collateralToken, debtToken]).pipe(
      map((tickers) => {
        return { collateralPrice: tickers[collateralToken], debtPrice: tickers[debtToken] }
      }),
      distinctUntilChanged(isEqual),
      map(({ collateralPrice, debtPrice }) => ({
        type: 'PRICES_RECEIVED',
        collateralPrice: collateralPrice,
        debtPrice: debtPrice,
      })),
    )
  }
}
