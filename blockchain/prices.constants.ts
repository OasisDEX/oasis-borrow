import type { Observable } from 'rxjs'
import { timer } from 'rxjs'
import { shareReplay, switchMap } from 'rxjs/operators'

import type { Tickers } from './prices.types'

export function tokenPrices(): Promise<Tickers> {
  return fetch('/api/tokensPrices', {
    headers: {
      Accept: 'application/json',
    },
  }).then((response) => response.json())
}

export const tokenPrices$: Observable<Tickers> = timer(0, 1000 * 60).pipe(
  switchMap(() => tokenPrices()),
  shareReplay(1),
)
export const DSVALUE_APPROX_SIZE = 6000
