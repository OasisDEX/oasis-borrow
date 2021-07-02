import BigNumber from 'bignumber.js'
import { every5Seconds$ } from 'blockchain/network'
import { ExchangeAction, Quote } from 'features/exchange/exchange'
import { EMPTY, Observable, of } from 'rxjs'
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
export function applyQuote(
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
  ) => Observable<Quote>,
  state: OpenMultiplyVaultState,
): Observable<ExchangeQuoteChanges> {
  if (state.buyingCollateral.gt(0)) {
    return exchangeQuote$(state.token, state.slippage, state.buyingCollateral, 'BUY').pipe(
      map(quoteToChange),
    )
  }
  return EMPTY
  return state.quote === undefined ? EMPTY : of({ kind: 'quoteReset' })
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
        s1.token === s2.token &&
        s1.slippage.eq(s2.slippage) &&
        !!s1.depositAmount?.eq(s2.depositAmount || ''),
    ),
    debounceTime(500),
    switchMap((state) => every5Seconds$.pipe(switchMap(() => applyQuote(exchangeQuote$, state)))),
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
  return exchangeQuote$(token, SLIPPAGE, new BigNumber(0.01), 'BUY').pipe(
    map(quoteToChange),
    take(1),
  )
}
