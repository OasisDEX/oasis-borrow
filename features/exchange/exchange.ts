import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { Observable, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, distinctUntilChanged, map, retry, switchMap, tap } from 'rxjs/operators'

import { amountFromWei, amountToWei } from '@oasisdex/utils/lib/src/utils'

const API_ENDPOINT = `https://api.1inch.exchange/v3.0/1/swap`

interface Response {
  fromToken: TokenDescriptor
  toToken: TokenDescriptor
  toTokenAmount: string
  fromTokenAmount: string
  tx: Tx
}

interface TokenDescriptor {
  symbol: string
  name: string
  decimals: number
  eip2612?: boolean
  address: string
  logoURI: string
}

interface Tx {
  from: string
  to: string
  data: string
  value: string
  gasPrice: string
  gas: number
}

export type ExchangeAction = 'BUY_COLLATERAL' | 'SELL_COLLATERAL'

function getQuote$(
  daiAddress: string,
  collateralAddress: string,
  account: string,
  amount: BigNumber, // This is always the receiveAtLeast amount of tokens we want to exchange from
  slippage: BigNumber,
  action: ExchangeAction,
) {
  const fromTokenAddress = action === 'BUY_COLLATERAL' ? daiAddress : collateralAddress
  const toTokenAddress = action === 'BUY_COLLATERAL' ? collateralAddress : daiAddress

  //TODO: set proper precision depending on token
  const searchParams = new URLSearchParams({
    fromTokenAddress,
    toTokenAddress,
    amount: amountToWei(amount).toFixed(0),
    fromAddress: account,
    slippage: slippage.times(100).toString(),
    disableEstimate: 'true',
    allowPartial: 'false',
  })

  return ajax(`${API_ENDPOINT}?${searchParams.toString()}`).pipe(
    tap((response) => {
      if (response.status !== 200) throw new Error(response.responseText)
    }),
    map((response): Response => response.response),
    map(({ fromToken, toToken, toTokenAmount, fromTokenAmount, tx }) => ({
      status: 'SUCCESS' as const,
      fromToken,
      toToken,
      collateralAmount: amountFromWei(
        action === 'BUY_COLLATERAL' ? new BigNumber(toTokenAmount) : new BigNumber(fromTokenAmount),
      ),
      daiAmount: amountFromWei(
        action === 'BUY_COLLATERAL' ? new BigNumber(fromTokenAmount) : new BigNumber(toTokenAmount),
      ),
      tokenPrice:
        action === 'BUY_COLLATERAL'
          ? new BigNumber(fromTokenAmount).div(new BigNumber(toTokenAmount))
          : new BigNumber(toTokenAmount).div(new BigNumber(fromTokenAddress)),
      tx,
    })),
    retry(3),
    catchError(() => of({ status: 'ERROR' as const })),
  )
}

export type Quote = ReturnType<typeof getQuote$> extends Observable<infer R> ? R : never

export function createExchangeQuote$(
  context$: Observable<Context>,
  token: string,
  slippage: BigNumber,
  amount: BigNumber,
  action: ExchangeAction,
) {
  return context$.pipe(
    switchMap((context) => {
      const { tokens, exchange } = context
      const daiAddress = tokens['DAI'].address
      const collateralAddress = tokens[token].address

      return getQuote$(daiAddress, collateralAddress, exchange.address, amount, slippage, action)
    }),
    distinctUntilChanged((s1, s2) => {
      return JSON.stringify(s1) === JSON.stringify(s2)
    }),
  )
}
