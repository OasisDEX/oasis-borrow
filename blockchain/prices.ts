import { BigNumber } from 'bignumber.js'
import { Context, every10Seconds$ } from 'blockchain/network'
import { bindNodeCallback, combineLatest, forkJoin, Observable, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'

import { getToken } from '../blockchain/tokensMetadata'
import { CallObservable, observe } from './calls/observe'
import { spotIlk, spotPar } from './calls/spot'
import { createTokenCurrentPrice$, createTokenNextPrice$, pipHop, pipZzz } from './calls/osm'
import { vatIlk } from './calls/vat'

export interface Ticker {
  [label: string]: BigNumber
}

export type GasPrice$ = Observable<BigNumber>

export function createGasPrice$(
  onEveryBlock$: Observable<number>,
  context$: Observable<Context>,
): GasPrice$ {
  return combineLatest(onEveryBlock$, context$).pipe(
    switchMap(([, { web3 }]) => bindNodeCallback(web3.eth.getGasPrice)()),
    map((x) => new BigNumber(x)),
    distinctUntilChanged((x: BigNumber, y: BigNumber) => x.eq(y)),
    shareReplay(1),
  )
}

const tradingTokens = ['DAI', 'ETH']

export const tokenPricesInUSD$: Observable<Ticker> = every10Seconds$.pipe(
  switchMap(() =>
    forkJoin(
      tradingTokens.map((token) =>
        ajax({
          url: `https://api.pro.coinbase.com/products/${getToken(token).coinbaseTicker}/book`,
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }).pipe(
          map(({ response }) => {
            const bid = new BigNumber(response.bids[0][0])
            const ask = new BigNumber(response.asks[0][0])
            return {
              [token]: bid.plus(ask).div(2),
            }
          }),
          catchError((error) => {
            console.debug(`Error fetching price data: ${error}`)
            return of({})
          }),
        ),
      ),
    ),
  ),
  map((prices) => prices.reduce((a, e) => ({ ...a, ...e }))),
  shareReplay(1),
)

export interface OraclePriceData {
  currentPrice: BigNumber
  nextPrice: BigNumber
  currentPriceUpdate: Date
  nextPriceUpdate: Date
  priceUpdateInterval: number
}

export function createOraclePriceData$(
  currentPrice$: (token: string) => Observable<BigNumber>,
  nextPrice$: (token: string) => Observable<BigNumber>,
  pipZzz$: (token: string) => Observable<BigNumber>,
  pipHop$: (token: string) => Observable<BigNumber>,
  token: string,
): Observable<OraclePriceData> {
  return combineLatest(
    currentPrice$(token),
    nextPrice$(token),
    pipZzz$(token),
    pipHop$(token),
  ).pipe(
    switchMap(([currentPrice, nextPrice, tokenLastUpdate, updateInterval]) => {
      const currentPriceUpdate = new Date(tokenLastUpdate.toNumber())
      const nextPriceUpdate = new Date(tokenLastUpdate.plus(updateInterval).toNumber())
      const priceUpdateInterval = updateInterval.toNumber()
      return of({
        currentPrice,
        nextPrice,
        currentPriceUpdate,
        nextPriceUpdate,
        priceUpdateInterval,
      })
    }),
  )
}
