import { BigNumber } from 'bignumber.js'
import { zero } from 'helpers/zero'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { bindNodeCallback, combineLatest, forkJoin, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { distinctUntilChanged, first, map, shareReplay, switchMap, tap } from 'rxjs/operators'

import { getNetworkContracts } from './contracts'
import type { Context } from './network.types'
import { NetworkIds } from './networks'
import { DSVALUE_APPROX_SIZE } from './prices.constants'
import type {
  GasPrice$,
  GasPriceParams,
  OraclePriceData,
  OraclePriceDataArgs,
  Tickers,
} from './prices.types'
import { getToken } from './tokensMetadata'

export function createGasPrice$(
  onEveryBlock$: Observable<number>,
  context$: Observable<Context>,
): GasPrice$ {
  const minersTip = new BigNumber(5000000000)

  const blockNativeRequest$ = ajax({
    url: `/api/gasPrice`,
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
    switchMap(([{ web3, chainId }, blockNumber]) => {
      return combineLatest(
        blockNativeRequest$,
        bindNodeCallback(web3.eth.getBlock)(blockNumber),
        of(chainId),
      )
    }),
    map(([blockNativeResp, block, chainId]): GasPriceParams => {
      const blockNative = blockNativeResp as GasPriceParams
      const gasFees = {
        maxFeePerGas: new BigNumber((block as any).baseFeePerGas).multipliedBy(2).plus(minersTip),
        maxPriorityFeePerGas: minersTip,
      } as GasPriceParams

      // Increase maxFeePerGas by 20% when on goerli
      if (chainId === NetworkIds.GOERLI) {
        gasFees.maxFeePerGas = new BigNumber((block as any).baseFeePerGas)
          .multipliedBy(1.15)
          .plus(minersTip)
      }

      if (blockNative.maxFeePerGas.gt(0) && chainId !== NetworkIds.GOERLI) {
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

function getPrice(tickers: Tickers, tickerServiceLabels: Array<string | undefined>) {
  const errorsArray = []
  for (const label of tickerServiceLabels) {
    if (label && tickers[label]) {
      return tickers[label]
    }
    errorsArray.push({ label, tickerServiceLabels })
  }

  throw new Error(`No price data for given token - ${JSON.stringify(errorsArray)}`)
}

export function getTokenPrice(token: string, tickers: Tickers) {
  const {
    coinpaprikaTicker,
    coinbaseTicker,
    coinGeckoTicker,
    coinpaprikaFallbackTicker,
    oracleTicker,
  } = getToken(token)

  return getPrice(tickers, [
    oracleTicker,
    coinbaseTicker,
    coinpaprikaTicker,
    coinGeckoTicker,
    coinpaprikaFallbackTicker,
  ])
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
            const tokenPrice = getTokenPrice(token, tickers)

            return of({
              [token]: new BigNumber(tokenPrice),
            })
          } catch (err) {
            console.error(`could not find price for ${token} - no ticker configured`)

            return of({})
          }
        }),
      ),
    ),
    map((prices) => prices.reduce((a, e) => ({ ...a, ...e }))),
    shareReplay(1),
  )
}

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
        getNetworkContracts(NetworkIds.MAINNET, chainId).mcdOsms[token].address,
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
