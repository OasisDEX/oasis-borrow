import { BigNumber } from 'bignumber.js'
import { Context, every10Seconds$ } from 'blockchain/network'
import { zero } from 'helpers/zero'
import { bindNodeCallback, combineLatest, forkJoin, iif, Observable, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { isEqual } from 'lodash'
import {
  catchError,
  distinctUntilChanged,
  first,
  map,
  shareReplay,
  switchMap,
} from 'rxjs/operators'

import { getToken } from '../blockchain/tokensMetadata'

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
  return combineLatest(onEveryBlock$, context$).pipe(
    switchMap(([, { web3 }]) =>
      combineLatest(context$, bindNodeCallback(web3.eth.getBlockNumber)()),
    ),
    switchMap(([{ web3 }, blockNumber]) => {
      console.log('BlockNumber in createGasPrice', blockNumber)
      return bindNodeCallback(web3.eth.getBlock)(blockNumber)
    }),
    map((block: any) => {
      console.log('Block in createGasPrice', block)
      const retVal = {
        maxFeePerGas: new BigNumber(block.baseFeePerGas).multipliedBy(2).plus(minersTip),
        maxPriorityFeePerGas: minersTip,
      } as GasPriceParams
      console.log(
        `GasPriceParams = { MaxFeePerGas:${retVal.maxFeePerGas}, MaxPrirityFeePerGas:${retVal.maxPriorityFeePerGas} }`,
      )
      return retVal
    }),
    distinctUntilChanged(
      (x: GasPriceParams, y: GasPriceParams) =>
      isEqual(x,y)
    ),
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

function calculatePricePercentageChange(current: BigNumber, next: BigNumber): BigNumber {
  const rawPriceChange = current.div(next)
  if (rawPriceChange.isZero()) return zero
  return current.minus(next).div(current).times(-1)
}

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
              const currentPrice = transformOraclePrice({ token, oraclePrice: peek })
              const nextPrice = peep
                ? transformOraclePrice({ token, oraclePrice: peep })
                : currentPrice

              const percentageChange = calculatePricePercentageChange(currentPrice, nextPrice)

              return of({
                currentPrice,
                nextPrice: nextPrice,
                currentPriceUpdate,
                nextPriceUpdate,
                priceUpdateInterval,
                isStaticPrice,
                percentageChange,
              })
            }),
          ),
        ),
      ),
    ),
    shareReplay(1),
  )
}
