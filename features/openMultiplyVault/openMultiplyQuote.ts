import BigNumber from 'bignumber.js'
import { ExchangeAction, Quote } from 'features/exchange/exchange'
import { EMPTY, Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'

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
      map((quote) =>
        quote.status === 'SUCCESS' ? { kind: 'quote', quote } : { kind: 'quoteError' },
      ),
    )
  }
  return state.quote === undefined ? EMPTY : of({ kind: 'quoteReset' })
}
