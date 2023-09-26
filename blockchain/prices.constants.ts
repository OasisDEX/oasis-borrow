import type { Observable } from 'rxjs'
import { timer } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { map, shareReplay, switchMap } from 'rxjs/operators'

import type { Tickers } from './prices.types'

export const tokenPrices$: Observable<Tickers> = timer(0, 1000 * 60).pipe(
  switchMap(() =>
    ajax({
      url: `/api/tokensPrices`,
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    }),
  ),
  map(({ response }) => response),
  shareReplay(1),
)
export const DSVALUE_APPROX_SIZE = 6000
