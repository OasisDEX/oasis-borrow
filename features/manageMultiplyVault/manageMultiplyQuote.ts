import BigNumber from 'bignumber.js'
import { every5Seconds$ } from 'blockchain/network'
import { ExchangeAction, Quote } from 'features/exchange/exchange'
import { EMPTY, Observable } from 'rxjs'
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  ignoreElements,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators'
import { ManageMultiplyVaultState, ManageVaultChange } from './manageMultiplyVault'

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

export function applyExchange(change: ManageVaultChange, state: ManageMultiplyVaultState) {
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

function compareBigNumber(a: BigNumber | undefined, b: BigNumber | undefined) {
  return !!a && !!b && a.eq(b)
}

export function createExchangeChange$(
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
  ) => Observable<Quote>,
  state$: Observable<ManageMultiplyVaultState>,
) {
  return state$.pipe(
    filter((state) => !state.inputAmountsEmpty),
    distinctUntilChanged(
      (s1, s2) =>
        !(
          compareBigNumber(s1.requiredCollRatio, s2.requiredCollRatio) &&
          compareBigNumber(s1.depositCollateralAmount, s2.depositCollateralAmount) &&
          compareBigNumber(s1.withdrawCollateralAmount, s2.withdrawCollateralAmount) &&
          compareBigNumber(s1.withdrawDaiAmount, s2.withdrawDaiAmount) &&
          compareBigNumber(s1.depositDaiAmount, s2.depositDaiAmount)
        ),
    ),
    tap((s) => console.log('NEW PARAMS')),
    debounceTime(500),
    switchMap((state) =>
      every5Seconds$.pipe(
        tap((s) => console.log(`GETTING PRICE ${state.requiredCollRatio}`)),
        switchMap(() => {
          if (state.quote?.status === 'SUCCESS' && state.exchangeAction && state.collateralDelta) {
            return exchangeQuote$(
              state.vault.token,
              state.slippage,
              state.collateralDelta.abs(),
              state.exchangeAction,
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
