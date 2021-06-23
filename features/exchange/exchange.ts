import BigNumber from 'bignumber.js'
import { Context, ContextConnected } from 'blockchain/network'
import { interval, Observable } from 'rxjs'
import { filter, shareReplay, switchMap, tap } from 'rxjs/operators'

const API_ENDPOINT = `https://api.1inch.exchange/v3.0/1/swap`

export interface Quote {
  collateralPrice: BigNumber
}
function getQuote$(
  dai: string,
  collateralAddress: string,
  account: string,
  amount: BigNumber,
  slippage: BigNumber,
) {
  return interval(2000).pipe(
    switchMap(() =>
      fetch(
        `${API_ENDPOINT}?fromTokenAddress=${dai}&toTokenAddress=${collateralAddress}&amount=${amount.toString()}&fromAddress=${account}&slippage=${slippage.toString()}`,
      ),
    ),
    shareReplay(1),
  )
}

export function createExchangeQuote$(
  context$: Observable<Context>,
  token: string,
  slippage: BigNumber,
  amount: BigNumber,
) {
  return context$.pipe(
    filter((ctx): ctx is ContextConnected => ctx.status === 'connected'),

    switchMap((context) => {
      const DAI = context.tokens['DAI']
      const collateralAddress = context.tokens[token]
      return getQuote$(DAI.address, collateralAddress.address, context.account, amount, slippage)
    }),
    tap(console.log),
    shareReplay(1),
  )
}
