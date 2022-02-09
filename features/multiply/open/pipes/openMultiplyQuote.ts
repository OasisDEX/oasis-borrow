import BigNumber from 'bignumber.js'
import { every5Seconds$ } from 'blockchain/network'
import { ExchangeAction, ExchangeType, Quote } from 'features/exchange/exchange'
import { compareBigNumber } from 'helpers/compareBigNumber'
import { EMPTY, Observable } from 'rxjs'
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  switchMap,
  take,
  withLatestFrom,
} from 'rxjs/operators'

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

export function applyExchange(state: OpenMultiplyVaultState, change: OpenMultiplyVaultChange) {
  if (change.kind === 'quoteError' || change.kind === 'swapError') {
    return {
      ...state,
      exchangeError: true,
    }
  }

  if (change.kind === 'quote') {
    return {
      ...state,
      quote: change.quote,
      exchangeError: false,
    }
  }

  if (change.kind === 'swap') {
    return {
      ...state,
      swap: change.swap,
      exchangeError: false,
    }
  }

  if (change.kind === 'quoteReset') {
    const { quote: _quote, ...rest } = state
    return rest
  }

  return state
}

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
    exchangeType: ExchangeType,
  ) => Observable<Quote>,
  state$: Observable<OpenMultiplyVaultState>,
) {
  const stateChanges$ = state$.pipe(
    map((state) => state),
    shareReplay(1),
  )

  return stateChanges$.pipe(
    filter((state) => state.depositAmount !== undefined),
    distinctUntilChanged(
      (s1, s2) =>
        compareBigNumber(s1.depositAmount, s2.depositAmount) &&
        compareBigNumber(s1.requiredCollRatio, s2.requiredCollRatio) &&
        compareBigNumber(s1.slippage, s2.slippage),
    ),
    debounceTime(500),
    switchMap(() =>
      every5Seconds$.pipe(
        withLatestFrom(stateChanges$),
        switchMap(([_seconds, state]) => {
          if (state.buyingCollateral.gt(0) && state.quote?.status === 'SUCCESS') {
            return exchangeQuote$(
              state.token,
              state.slippage,
              state.oneInchAmount,
              'BUY_COLLATERAL',
              'defaultExchange',
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
    exchangeType: ExchangeType,
  ) => Observable<Quote>,
  token: string,
  slippage: BigNumber,
) {
  return exchangeQuote$(
    token,
    slippage,
    new BigNumber(1),
    'BUY_COLLATERAL',
    'defaultExchange',
  ).pipe(map(quoteToChange), take(1))
}
