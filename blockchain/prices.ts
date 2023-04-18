import { BigNumber } from 'bignumber.js'
import { Context } from 'blockchain/network'
import { NetworkIds } from 'blockchain/networkIds'
import { getNetworkId } from 'features/web3Context'
import { zero } from 'helpers/zero'
import { isEqual } from 'lodash'
import { bindNodeCallback, combineLatest, forkJoin, Observable, of, timer } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { distinctUntilChanged, first, map, shareReplay, switchMap, tap } from 'rxjs/operators'

import { getNetworkContracts } from './contracts'
import { getToken } from './tokensMetadata'

export interface Tickers {
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
    map(([blockNativeResp, block]): GasPriceParams => {
      const blockNative = blockNativeResp as GasPriceParams
      const gasFees = {
        maxFeePerGas: new BigNumber((block as any).baseFeePerGas).multipliedBy(2).plus(minersTip),
        maxPriorityFeePerGas: minersTip,
      } as GasPriceParams

      const network = getNetworkId()

      // Increase maxFeePerGas by 20% when on goerli
      if (network === NetworkIds.GOERLI) {
        gasFees.maxFeePerGas = new BigNumber((block as any).baseFeePerGas)
          .multipliedBy(1.15)
          .plus(minersTip)
      }

      if (blockNative.maxFeePerGas.gt(0) && network !== NetworkIds.GOERLI) {
        gasFees.maxFeePerGas = new BigNumber(1000000000).multipliedBy(blockNative.maxFeePerGas)
        gasFees.maxPriorityFeePerGas = new BigNumber(1000000000).multipliedBy(
          blockNative.maxPriorityFeePerGas,
        )
      }
      return gasFees
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}

export const tokenPrices$: Observable<Tickers> = timer(0, 1000 * 60).pipe(
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

function getPrice(tickers: Tickers, tickerServiceLabels: Array<string | undefined>) {
  for (const label of tickerServiceLabels) {
    if (label && tickers[label]) {
      return tickers[label]
    }
  }

  throw new Error(`No price data for given token`)
}

export function createTokenPriceInUSD$(
  every10Seconds$: Observable<any>,
  tokenTicker$: Observable<Tickers>,
  tokens: Array<string>,
): Observable<Tickers> {
  return combineLatest(every10Seconds$, tokenTicker$).pipe(
    switchMap(([_, tickers]) =>
      forkJoin(
        tokens.map((token) => {
          try {
            const {
              coinpaprikaTicker,
              coinbaseTicker,
              coinGeckoTicker,
              coinpaprikaFallbackTicker,
            } = getToken(token)

            const tokenPrice = getPrice(tickers, [
              coinbaseTicker,
              coinpaprikaTicker,
              coinGeckoTicker,
              coinpaprikaFallbackTicker,
            ])

            return of({
              [token]: new BigNumber(tokenPrice),
            })
          } catch (err) {
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
    switchMap(({ web3, chainId }) => {
      return bindNodeCallback(web3.eth.getCode)(
        getNetworkContracts(chainId).mcdOsms[token].address,
      ).pipe(
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
