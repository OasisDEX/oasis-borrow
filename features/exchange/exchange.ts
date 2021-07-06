import { amountFromWei, amountToWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { Context, ContextConnected } from 'blockchain/network'
import { Observable, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators'

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
  amount: BigNumber, // This is always the amount of tokens we want to exchange from
  slippage: BigNumber,
  action: ExchangeAction,
) {
  const fromTokenAddress = action === 'BUY_COLLATERAL' ? daiAddress : collateralAddress
  const toTokenAddress = action === 'BUY_COLLATERAL' ? collateralAddress : daiAddress

  return ajax(
    `${API_ENDPOINT}?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${amountToWei(
      new BigNumber(amount.toFixed(18)),
    ).toString()}&fromAddress=${account}&slippage=${slippage
      .times(100)
      .toString()}&disableEstimate=true`,
  ).pipe(
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
    catchError(() => of({ status: 'ERROR' as const })),
    shareReplay(1),
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
    filter((ctx): ctx is ContextConnected => ctx.status === 'connected'),
    switchMap((context) => {
      const daiAddress = context.tokens['DAI'].address
      const collateralAddress =
        token === 'ETH'
          ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
          : context.tokens[token].address
      return getQuote$(daiAddress, collateralAddress, context.account, amount, slippage, action)
    }),
    distinctUntilChanged((s1, s2) => {
      return JSON.stringify(s1) === JSON.stringify(s2)
    }),
  )
}
