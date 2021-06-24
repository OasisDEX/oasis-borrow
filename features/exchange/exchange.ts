import { amountFromWei, amountToWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { Context, ContextConnected, every5Seconds$ } from 'blockchain/network'
import { from, Observable, of } from 'rxjs'
import { catchError, filter, map, shareReplay, switchMap, tap } from 'rxjs/operators'

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

export type ExchangeAction = 'BUY' | 'SELL'
function getQuote$(
  daiAddress: string,
  collateralAddress: string,
  account: string,
  amount: BigNumber,
  slippage: BigNumber,
  action: ExchangeAction,
) {
  return every5Seconds$.pipe(
    map(() => ({
      fromTokenAddress: action === 'BUY' ? daiAddress : collateralAddress,
      toTokenAddress: action === 'BUY' ? collateralAddress : daiAddress,
    })),
    switchMap(({ fromTokenAddress, toTokenAddress }) =>
      from(
        fetch(
          `${API_ENDPOINT}?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${amountToWei(
            amount,
          ).toString()}&fromAddress=${account}&slippage=${slippage.toString()}&disableEstimate=true`,
        ),
      ).pipe(
        tap((response) => {
          if (!response.ok) throw new Error(response.statusText)
        }),
        switchMap((response): Promise<Response> => response.json()),
        map(({ fromToken, toToken, toTokenAmount, fromTokenAmount, tx }) => ({
          status: 'SUCCESS' as const,
          fromToken,
          toToken,
          collateralAmount: amountFromWei(
            action === 'BUY' ? new BigNumber(toTokenAmount) : new BigNumber(fromTokenAmount),
          ),
          daiAmount: amountFromWei(
            action === 'BUY' ? new BigNumber(fromTokenAmount) : new BigNumber(toTokenAmount),
          ),
          tokenPrice:
            action === 'BUY'
              ? new BigNumber(fromTokenAmount).div(new BigNumber(toTokenAmount))
              : new BigNumber(toTokenAmount).div(new BigNumber(fromTokenAddress)),
          tx,
        })),
        catchError(() => of({ status: 'ERROR' as const })),
      ),
    ),
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
    shareReplay(1),
  )
}
