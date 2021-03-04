import { BigNumber } from 'bignumber.js'
import { Context, every10Seconds$ } from 'blockchain/network'
import { bindNodeCallback, combineLatest, EMPTY, forkJoin, iif, Observable, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import {
  catchError,
  distinctUntilChanged,
  first,
  map,
  shareReplay,
  switchMap,
} from 'rxjs/operators'

import { getToken } from '../blockchain/tokensMetadata'
import { amountFromWei } from '@oasisdex/utils'

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
  nextPrice?: BigNumber
  currentPriceUpdate?: Date
  nextPriceUpdate?: Date
  priceUpdateInterval?: number
  isStaticPrice: boolean
}

const DSVALUE_APPROX_SIZE = 6000

export function createOraclePriceData$(
  context$: Observable<Context>,
  pipPeek$: (token: string) => Observable<[string, boolean]>,
  pipPeep$: (token: string) => Observable<[string, boolean]>,
  pipZzz$: (token: string) => Observable<BigNumber>,
  pipHop$: (token: string) => Observable<BigNumber>,
  token: string,
): Observable<OraclePriceData> {
  return context$.pipe(
    switchMap(({ web3, mcdOsms }) =>
      bindNodeCallback(web3.eth.getCode)(mcdOsms[token].address).pipe(
        first(),
        switchMap((contractData) =>
          iif(
            () => contractData.length > DSVALUE_APPROX_SIZE,
            combineLatest(
              pipPeek$(token),
              pipPeep$(token),
              pipZzz$(token),
              pipHop$(token),
              of(false),
            ),
            combineLatest(pipPeek$(token), of(undefined), of(undefined), of(undefined), of(true)),
          ).pipe(
            switchMap(([peek, peep, zzz, hop, isStaticPrice]) => {
              const currentPriceUpdate = zzz ? new Date(zzz.toNumber()) : undefined
              const nextPriceUpdate = zzz && hop ? new Date(zzz.plus(hop).toNumber()) : undefined
              const priceUpdateInterval = hop ? hop.toNumber() : undefined

              const currentPrice = amountFromWei(new BigNumber(peek[0]), getToken(token).precision)
              const nextPrice = peep
                ? amountFromWei(new BigNumber(peep[0]), getToken(token).precision)
                : undefined

              return of({
                currentPrice,
                nextPrice,
                currentPriceUpdate,
                nextPriceUpdate,
                priceUpdateInterval,
                isStaticPrice,
              })
            }),
          ),
        ),
      ),
    ),
    shareReplay(1),
  )
}
