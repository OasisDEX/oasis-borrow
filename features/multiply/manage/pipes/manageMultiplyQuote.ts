import BigNumber from 'bignumber.js'
import { every5Seconds$ } from 'blockchain/network'
import { ExchangeAction, ExchangeType, Quote } from 'features/exchange/exchange'
import { EMPTY, Observable } from 'rxjs'
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  retry,
  shareReplay,
  switchMap,
  take,
  withLatestFrom,
} from 'rxjs/operators'

import { compareBigNumber } from '../../../../helpers/compareBigNumber'
import { ManageMultiplyVaultChange, ManageMultiplyVaultState } from './manageMultiplyVault'

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

export function applyExchange<VS extends ManageMultiplyVaultState>(
  change: ManageMultiplyVaultChange,
  state: VS,
) {
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
  state$: Observable<ManageMultiplyVaultState>,
) {
  const stateChanges$ = state$.pipe(
    map((state) => state),
    shareReplay(1),
  )

  return stateChanges$.pipe(
    filter(
      (state) =>
        !state.inputAmountsEmpty &&
        state.quote?.status === 'SUCCESS' &&
        state.collateralDelta !== undefined,
    ),
    distinctUntilChanged(
      (s1, s2) =>
        s1.otherAction === s2.otherAction &&
        s1.closeVaultTo === s2.closeVaultTo &&
        compareBigNumber(s1.requiredCollRatio, s2.requiredCollRatio) &&
        compareBigNumber(s1.depositAmount, s2.depositAmount) &&
        compareBigNumber(s1.withdrawAmount, s2.withdrawAmount) &&
        compareBigNumber(s1.generateAmount, s2.generateAmount) &&
        compareBigNumber(s1.paybackAmount, s2.paybackAmount) &&
        compareBigNumber(s1.slippage, s2.slippage),
    ),
    debounceTime(500),
    switchMap(() =>
      every5Seconds$.pipe(
        withLatestFrom(stateChanges$),
        switchMap(([_seconds, state]) => {
          const {
            quote,
            exchangeAction,
            collateralDelta,
            requiredCollRatio,
            slippage,
            otherAction,
            closeVaultTo,
            vault: { token, debt },
            closeToDaiParams,
            closeToCollateralParams,
            oneInchAmount,
          } = state

          if (
            quote?.status === 'SUCCESS' &&
            exchangeAction &&
            collateralDelta &&
            requiredCollRatio
          ) {
            return exchangeQuote$(token, slippage, oneInchAmount, exchangeAction, 'defaultExchange')
          }

          if (otherAction === 'closeVault' && !debt.isZero()) {
            const { fromTokenAmount } =
              closeVaultTo === 'dai' ? closeToDaiParams : closeToCollateralParams

            return exchangeQuote$(
              token,
              slippage,
              fromTokenAmount,
              'SELL_COLLATERAL',
              'defaultExchange',
            )
          }
          return EMPTY
        }),
        retry(3),
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
