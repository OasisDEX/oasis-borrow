import BigNumber from 'bignumber.js'
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

type ExchangeQuoteResetChange = {
  kind: 'quoteReset'
}
export type ExchangeQuoteChanges =
  | ExchangeQuoteSuccessChange
  | ExchangeQuoteFailureChange
  | ExchangeQuoteResetChange

export function applyExchange(change: OpenMultiplyVaultChange, state: OpenMultiplyVaultState) {
  if (change.kind === 'quote') {
    return {
      ...state,
      quote: change.quote,
    }
  }

  // TODO: implement QuoteProbe

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
    // TODO: improve dinstinct until changed
    distinctUntilChanged((s1, s2) => s1.afterOutstandingDebt.eq(s2.afterOutstandingDebt)),
    debounceTime(500),
    switchMap((state) => {
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
    map(quoteToChange),
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
    // TODO: map to quoteProbe
    map(quoteToChange),
    take(1),
  )
}
