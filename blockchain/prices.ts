import { BigNumber } from 'bignumber.js'
import { Context } from 'blockchain/network'
import { zero } from 'helpers/zero'
import { isEqual } from 'lodash'
import { bindNodeCallback, combineLatest, forkJoin, Observable, of, timer } from 'rxjs'
import { ajax, AjaxResponse } from 'rxjs/ajax'
import {
  catchError,
  distinctUntilChanged,
  first,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators'

import { getToken } from './tokensMetadata'

export interface Ticker {
  [label: string]: BigNumber
}

export type GasPriceParams = {
  maxFeePerGas: BigNumber
  maxPriorityFeePerGas: BigNumber
}

export type GasPrice$ = Observable<GasPriceParams>

export function createGasPrice$(
  onEveryBlock$: Observable<number>,
  context$: Observable<Context>,
): GasPrice$ {
  const minersTip = new BigNumber(5000000000)

  const blockNativeRequest$ = ajax({
    url: `${window.location.origin}/api/gasPrice`,
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  }).pipe(
    tap((response) => {
      if (response.status !== 200) throw new Error(response.responseText)
      return response
    }),
    map(({ response }) => {
      const maxFeePerGas = new BigNumber(response.maxFeePerGas)
      const maxPriorityFeePerGas = new BigNumber(response.maxPriorityFeePerGas)
      return {
        maxFeePerGas,
        maxPriorityFeePerGas,
      } as GasPriceParams
    }),
  )

  return combineLatest(onEveryBlock$, context$, blockNativeRequest$).pipe(
    switchMap(([, { web3 }]) =>
      combineLatest(context$, bindNodeCallback(web3.eth.getBlockNumber)()),
    ),
    switchMap(([{ web3 }, blockNumber]) => {
      return combineLatest(blockNativeRequest$, bindNodeCallback(web3.eth.getBlock)(blockNumber))
    }),
    map(
      ([blockNativeResp, block]): GasPriceParams => {
        const blockNative = blockNativeResp as GasPriceParams
        const gasFees = {
          maxFeePerGas: new BigNumber((block as any).baseFeePerGas).multipliedBy(2).plus(minersTip),
          maxPriorityFeePerGas: minersTip,
        } as GasPriceParams
        if (blockNative.maxFeePerGas.gt(0)) {
          gasFees.maxFeePerGas = new BigNumber(1000000000).multipliedBy(blockNative.maxFeePerGas)
          gasFees.maxPriorityFeePerGas = new BigNumber(1000000000).multipliedBy(
            blockNative.maxPriorityFeePerGas,
          )
        }
        return gasFees
      },
    ),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}

type CoinbaseOrderBook = {
  bids: [string][]
  asks: [string][]
}

export function coinbaseOrderBook$(ticker: string): Observable<AjaxResponse['response']> {
  return ajax({
    url: `https://api.pro.coinbase.com/products/${ticker}/book`,
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  }).pipe(
    map(({ response }) => response),
    shareReplay(1),
  )
}

export const coinPaprikaTicker$: Observable<Ticker> = timer(0, 1000 * 60).pipe(
  switchMap(() =>
    ajax({
      url: `${window.location.origin}/api/tokensPrices`,
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    }),
  ),
  map(({ response }) => response),
  shareReplay(1),
)

export function coinGeckoTicker$(ticker: string): Observable<BigNumber> {
  return ajax({
    url: `https://api.coingecko.com/api/v3/simple/price?ids=${ticker}&vs_currencies=usd`,
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  }).pipe(
    map(({ response }) => new BigNumber(response[ticker].usd)),
    shareReplay(1),
  )
}

export function createTokenPriceInUSD$(
  every10Seconds$: Observable<any>,
  coinbaseOrderBook$: (ticker: string) => Observable<CoinbaseOrderBook>,
  coinpaprikaTicker$: Observable<Ticker>,
  coinGeckoTicker$: (ticker: string) => Observable<BigNumber>,
  tokens: Array<string>,
): Observable<Ticker> {
  return combineLatest(every10Seconds$, coinpaprikaTicker$).pipe(
    switchMap(([, ticker]) =>
      forkJoin(
        tokens.map((token) => {
          const { coinbaseTicker, coinpaprikaTicker, coinGeckoTicker } = getToken(token)
          if (coinbaseTicker) {
            return coinbaseOrderBook$(coinbaseTicker).pipe(
              map((response) => {
                const bid = new BigNumber(response.bids[0][0])
                const ask = new BigNumber(response.asks[0][0])
                return {
                  [token]: bid.plus(ask).div(2),
                }
              }),
              catchError((error) => {
                console.log(error)
                return of({})
              }),
            )
          } else if (coinpaprikaTicker) {
            return of({
              [token]: ticker[coinpaprikaTicker],
            })
          } else if (coinGeckoTicker) {
            return coinGeckoTicker$(coinGeckoTicker).pipe(
              map((price) => ({
                [token]: price,
              })),
              catchError((error) => {
                console.log(error)
                return of({})
              }),
            )
          } else {
            console.log(`could not find price for ${token} - no ticker configured`)
            return of({})
          }
        }),
      ),
    ),
    map((prices) => prices.reduce((a, e) => ({ ...a, ...e }))),
    shareReplay(1),
  )
}

export interface OraclePriceData {
  currentPrice: BigNumber
  nextPrice: BigNumber
  currentPriceUpdate?: Date
  nextPriceUpdate?: Date
  priceUpdateInterval?: number
  isStaticPrice: boolean
  percentageChange: BigNumber
}

const DSVALUE_APPROX_SIZE = 6000

// All oracle prices are returned as string values which have a precision of
// 18 decimal places. We need to truncate these to the correct precision
function transformOraclePrice({
  token,
  oraclePrice,
}: {
  token: string
  oraclePrice: [string, boolean]
}): BigNumber {
  const precision = getToken(token).precision
  const rawPrice = new BigNumber(oraclePrice[0])
    .shiftedBy(-18)
    .toFixed(precision, BigNumber.ROUND_DOWN)
  return new BigNumber(rawPrice)
}

export function calculatePricePercentageChange(current: BigNumber, next: BigNumber): BigNumber {
  const rawPriceChange = current.div(next)
  if (rawPriceChange.isZero()) return zero
  return current.minus(next).div(current).times(-1)
}

export type OraclePriceDataArgs = {
  token: string
  requestedData: Array<keyof OraclePriceData>
}

export function createOraclePriceData$(
  context$: Observable<Context>,
  pipPeek$: (token: string) => Observable<[string, boolean]>,
  pipPeep$: (token: string) => Observable<[string, boolean]>,
  pipZzz$: (token: string) => Observable<BigNumber>,
  pipHop$: (token: string) => Observable<BigNumber>,
  { token, requestedData }: OraclePriceDataArgs,
): Observable<Partial<OraclePriceData>> {
  return context$.pipe(
    switchMap(({ web3, mcdOsms }) => {
      return bindNodeCallback(web3.eth.getCode)(mcdOsms[token].address).pipe(
        first(),
        switchMap((contractData) => {
          type Pipes = {
            pipPeek$: typeof pipPeek$ | (() => Observable<undefined>)
            pipPeep$: typeof pipPeep$ | (() => Observable<undefined>)
            pipZzz$: typeof pipZzz$ | (() => Observable<undefined>)
            pipHop$: typeof pipHop$ | (() => Observable<undefined>)
          }
          const pipes: Pipes = {
            pipPeek$: () => of(undefined),
            pipPeep$: () => of(undefined),
            pipZzz$: () => of(undefined),
            pipHop$: () => of(undefined),
          }

          if (requestedData.includes('currentPrice')) {
            pipes.pipPeek$ = pipPeek$
          }

          if (requestedData.includes('nextPrice')) {
            pipes.pipPeek$ = pipPeek$
            pipes.pipPeep$ = pipPeep$
          }

          if (requestedData.includes('currentPriceUpdate')) {
            pipes.pipZzz$ = pipZzz$
          }

          if (requestedData.includes('nextPriceUpdate')) {
            pipes.pipZzz$ = pipZzz$
            pipes.pipHop$ = pipHop$
          }

          if (requestedData.includes('priceUpdateInterval')) {
            pipes.pipHop$ = pipHop$
          }

          if (requestedData.includes('percentageChange')) {
            pipes.pipPeek$ = pipPeek$
            pipes.pipPeep$ = pipPeep$
          }

          const combined$ =
            contractData.length > DSVALUE_APPROX_SIZE
              ? combineLatest(
                  pipes.pipPeek$(token),
                  pipes.pipPeep$(token),
                  pipes.pipZzz$(token),
                  pipes.pipHop$(token),
                  of(false),
                )
              : combineLatest(
                  pipPeek$(token),
                  of(undefined),
                  of(undefined),
                  of(undefined),
                  of(true),
                )

          return combined$.pipe(
            switchMap(([peek, peep, zzz, hop, isStaticPrice]) => {
              const currentPriceUpdate = zzz ? new Date(zzz.toNumber()) : undefined
              const nextPriceUpdate = zzz && hop ? new Date(zzz.plus(hop).toNumber()) : undefined
              const priceUpdateInterval = hop ? hop.toNumber() : undefined
              const currentPrice = peek
                ? transformOraclePrice({ token, oraclePrice: peek })
                : undefined

              const nextPrice = peep
                ? transformOraclePrice({ token, oraclePrice: peep })
                : currentPrice

              const percentageChange =
                currentPrice && nextPrice
                  ? calculatePricePercentageChange(currentPrice, nextPrice)
                  : undefined

              return of({
                currentPrice,
                nextPrice,
                currentPriceUpdate,
                nextPriceUpdate,
                priceUpdateInterval,
                isStaticPrice,
                percentageChange,
              })
            }),
          )
        }),
      )
    }),
    shareReplay(1),
  )
}
