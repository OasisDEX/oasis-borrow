import BigNumber from 'bignumber.js'
import { every5Seconds$ } from 'blockchain/network'
import { ExchangeAction, Quote } from 'features/exchange/exchange'
import { EMPTY, Observable } from 'rxjs'
import { debounceTime, distinctUntilChanged, filter, map, switchMap, take } from 'rxjs/operators'

import { OpenMultiplyVaultChange, OpenMultiplyVaultState } from './openMultiplyVault'

type ExchangeQuoteSuccessChange = {
  kind: 'quote'
  quote: Quote
}

type ExchangeQuoteFailureChange = {
  kind: 'quoteError'
}

type ExchangeSwapSuccessChange = {
  kind: 'swap'
  swap: Quote
}

type ExchangeSwapFailureChange = {
  kind: 'swapError'
}

type ExchangeQuoteResetChange = {
  kind: 'quoteReset'
}
export type ExchangeQuoteChanges =
  | ExchangeQuoteSuccessChange
  | ExchangeQuoteFailureChange
  | ExchangeQuoteResetChange
  | ExchangeSwapSuccessChange
  | ExchangeSwapFailureChange

export function applyExchange(change: OpenMultiplyVaultChange, state: OpenMultiplyVaultState) {
  if (change.kind === 'quote') {
    return {
      ...state,
      quote: change.quote,
    }
  }

  if (change.kind === 'swap') {
    return {
      ...state,
      swap: change.swap,
    }
  }

  if (change.kind === 'quoteReset') {
    const { quote: _quote, ...rest } = state
    return rest
  }

  return state
}

export const SLIPPAGE = new BigNumber(0.05)

export function quoteToChange(quote: Quote) {
  return quote.status === 'SUCCESS'
    ? { kind: 'quote' as const, quote }
    : { kind: 'quoteError' as const }
}

export function swapToChange(swap: Quote) {
  return swap.status === 'SUCCESS'
    ? { kind: 'swap' as const, swap }
    : { kind: 'swapError' as const }
}

export function createExchangeChange$(
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
  ) => Observable<Quote>,
  state$: Observable<OpenMultiplyVaultState>,
) {
  return state$.pipe(
    filter((state) => state.depositAmount !== undefined),
    distinctUntilChanged(
      (s1, s2) =>
        !!s1.depositAmount &&
        !!s2.depositAmount &&
        s1.depositAmount.eq(s2.depositAmount) &&
        !!s1.slider &&
        !!s2.slider &&
        s1.slider.eq(s2.slider),
    ),
    debounceTime(500),
    switchMap((state) =>
      every5Seconds$.pipe(
        switchMap(() => {
          if (state.buyingCollateral.gt(0) && state.quote?.status === 'SUCCESS') {
            return exchangeQuote$(
              state.token,
              state.slippage,
              state.afterOutstandingDebt,
              'BUY_COLLATERAL',
            )
          }
          return EMPTY
        }),
      ),
    ),
    map(swapToChange),
  )
}

export function createInitialQuoteChange(
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
  ) => Observable<Quote>,
  token: string,
) {
  return exchangeQuote$(token, SLIPPAGE, new BigNumber(1), 'BUY_COLLATERAL').pipe(
    map(quoteToChange),
    take(1),
  )
}
