import BigNumber from 'bignumber.js'
import { every5Seconds$ } from 'blockchain/network'
import { ExchangeAction, Quote } from 'features/exchange/exchange'
import { OAZO_FEE, SLIPPAGE } from 'helpers/multiply/calculations'
import { one } from 'helpers/zero'
import { EMPTY, Observable } from 'rxjs'
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  retry,
  switchMap,
  take,
} from 'rxjs/operators'

import { compareBigNumber } from '../../helpers/compareBigNumber'
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

export function applyExchange(change: ManageMultiplyVaultChange, state: ManageMultiplyVaultState) {
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
  ) => Observable<Quote>,
  state$: Observable<ManageMultiplyVaultState>,
) {
  return state$.pipe(
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
        compareBigNumber(s1.paybackAmount, s2.paybackAmount),
    ),
    debounceTime(500),
    switchMap(
      // () =>
      //   every5Seconds$.pipe(
      //     switchMap(() => {
      //       console.log('every 5 secs')

      //       return state$.pipe(
      //         switchMap((state) => {
      //           if (
      //             state.quote?.status === 'SUCCESS' &&
      //             state.exchangeAction &&
      //             state.collateralDelta &&
      //             state.requiredCollRatio
      //           ) {
      //             return exchangeQuote$(
      //               state.vault.token,
      //               state.slippage,
      //               state.exchangeAction === 'BUY_COLLATERAL'
      //                 ? (state.debtDelta as BigNumber).abs().times(one.minus(OAZO_FEE))
      //                 : state.collateralDelta.abs(),
      //               state.exchangeAction,
      //             )
      //           }
      //           if (state.otherAction === 'closeVault') {
      //             if (state.closeVaultTo === 'collateral') {
      //               return EMPTY
      //             }
      //             if (state.closeVaultTo === 'dai') {
      //               console.log('GET PRICE FOR CLOSE VAULT')
      //               return exchangeQuote$(
      //                 state.vault.token,
      //                 state.slippage,
      //                 state.vault.lockedCollateral,
      //                 'SELL_COLLATERAL',
      //               )
      //             }
      //           }
      //           return EMPTY
      //         }),
      //       )
      //     }),
      //     retry(3),
      //   ),
      // TO DO for every 5 secs we use old value of afterOutstandingDebt, after fetch we update market price
      // which is factor for calculatinf afterOutstandingDebt
      (state) =>
        every5Seconds$.pipe(
          switchMap(() => {
            if (
              state.quote?.status === 'SUCCESS' &&
              state.exchangeAction &&
              state.collateralDelta &&
              state.requiredCollRatio
            ) {
              return exchangeQuote$(
                state.vault.token,
                state.slippage,
                state.exchangeAction === 'BUY_COLLATERAL'
                  ? (state.debtDelta as BigNumber).abs().times(one.minus(OAZO_FEE))
                  : state.collateralDelta.abs(),
                state.exchangeAction,
              )
            }
            if (state.otherAction === 'closeVault') {
              if (state.closeVaultTo === 'collateral') {
                return EMPTY
              }
              if (state.closeVaultTo === 'dai') {
                console.log('GET PRICE FOR CLOSE VAULT')
                return exchangeQuote$(
                  state.vault.token,
                  state.slippage,
                  state.vault.lockedCollateral,
                  'SELL_COLLATERAL',
                )
              }
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
  ) => Observable<Quote>,
  token: string,
) {
  return exchangeQuote$(token, SLIPPAGE, new BigNumber(1), 'BUY_COLLATERAL').pipe(
    map(quoteToChange),
    take(1),
  )
}
