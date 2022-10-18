import { BigNumber } from 'bignumber.js'
import { isEqual } from 'lodash'
import { Observable } from 'rxjs'
import { distinctUntilChanged } from 'rxjs/internal/operators'
import { map } from 'rxjs/operators'

import { Tickers } from '../../../../../blockchain/prices'
import { BaseAaveEvent } from '../BaseAaveContext'

export function getPricesFeed$(
  prices$: (tokens: string[]) => Observable<Tickers>,
): (collateralToken: string) => Observable<BaseAaveEvent> {
  return (collateralToken: string) => {
    return prices$([collateralToken]).pipe(
      map((tickers) => {
        return tickers[collateralToken]
      }),
      distinctUntilChanged<BigNumber>(isEqual),
      map((ticker) => ({
        type: 'PRICES_RECEIVED',
        collateralPrice: ticker,
      })),
    )
  }
}
