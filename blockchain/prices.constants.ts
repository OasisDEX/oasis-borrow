import BigNumber from 'bignumber.js'
import type { Observable } from 'rxjs'
import { timer } from 'rxjs'
import { shareReplay, switchMap, tap } from 'rxjs/operators'

import type { Tickers } from './prices.types'

export async function tokenPrices(): Promise<Tickers> {
  const rawTickers: Record<string, string> = await fetch('/api/tokensPrices', {
    headers: {
      Accept: 'application/json',
    },
  }).then((response) => response.json())

  return Object.entries(rawTickers).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: new BigNumber(value),
    }),
    {},
  )
}

interface ReadOnlyTokenPriceStore {
  readonly prices: Tickers
}

class TokenPriceStore implements ReadOnlyTokenPriceStore {
  private _prices: Tickers = {}

  public get prices(): Tickers {
    return this._prices
  }

  public async update(tickers: Tickers) {
    this._prices = tickers
  }
}

const store = new TokenPriceStore()
export const tokenPriceStore: ReadOnlyTokenPriceStore = store

export const tokenPrices$: Observable<Tickers> = timer(0, 1000 * 60).pipe(
  switchMap(() => tokenPrices()),
  tap((prices) => store.update(prices)),
  shareReplay(1),
)
export const DSVALUE_APPROX_SIZE = 6000
