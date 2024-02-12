import { BigNumber } from 'bignumber.js'
import { zero } from 'helpers/zero'
import type { Observable } from 'rxjs'
import { bindNodeCallback, combineLatest, forkJoin, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { first, map, shareReplay, switchMap, tap } from 'rxjs/operators'

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

export async function getGasPrice(networkId?: NetworkIds): Promise<GasPriceParams> {
  const response = await fetch(
    networkId ? `/api/gasPrice?networkId=${networkId}` : `/api/gasPrice`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    },
  )
  if (response.status !== 200) throw new Error(await response.text())
  const { maxFeePerGas, maxPriorityFeePerGas } = await response.json()
  return {
    maxFeePerGas: new BigNumber(maxFeePerGas).shiftedBy(9),
    maxPriorityFeePerGas: new BigNumber(maxPriorityFeePerGas).shiftedBy(9),
  }
}

export function createGasPriceOnNetwork$(
  onEveryBlock$: Observable<number>,
  networkId: NetworkIds,
): GasPrice$ {
  return ajax({
    url: `/api/gasPrice?networkId=${networkId}`,
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
      return {
        maxFeePerGas: new BigNumber(response.maxFeePerGas).shiftedBy(9),
        maxPriorityFeePerGas: new BigNumber(response.maxPriorityFeePerGas).shiftedBy(9),
      }
    }),
  )
}

function getPrice(
  tickers: Tickers,
  tickerServiceLabels: Array<string | undefined>,
  errorLocation?: string,
) {
  const errorsArray = []
  for (const label of tickerServiceLabels) {
    if (label && tickers[label]) {
      return tickers[label]
    }
    errorsArray.push({ label, tickerServiceLabels })
  }

  throw new Error(
    `No price data for given token - ${JSON.stringify(errorsArray)} in ${errorLocation}`,
  )
}

export function getTokenPriceSources(token: string) {
  const {
    coinpaprikaTicker,
    coinbaseTicker,
    coinGeckoTicker,
    coinpaprikaFallbackTicker,
    oracleTicker,
  } = getToken(token)

  return [
    coinpaprikaTicker,
    coinbaseTicker,
    coinGeckoTicker,
    coinpaprikaFallbackTicker,
    oracleTicker,
  ]
}

export function getTokenPrice(token: string, tickers: Tickers, errorLocation?: string) {
  const priceSources = getTokenPriceSources(token)
  return getPrice(tickers, priceSources, errorLocation)
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
            const tokenPrice = getTokenPrice(token, tickers, 'createTokenPriceInUSD$')

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
