import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { zipObject } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { Dictionary } from 'ts-essentials'

import { ContextConnected } from '@oasisdex/transactions/lib/src/callHelpersContextParametrized'
import { Context } from './network'
import { tokenBalance } from './calls/erc20'
import { CallObservable } from './calls/observe'

export function createCollaterals$(context$: Observable<Context>): Observable<string[]> {
  return context$.pipe(map((context) => context.collaterals))
}

export function createBalances$(
  collaterals$: Observable<string[]>,
  balance$: CallObservable<typeof tokenBalance>,
  account: string,
): Observable<Dictionary<BigNumber>> {
  return collaterals$.pipe(
    switchMap((tokens) =>
      combineLatest(tokens.map((token) => balance$({ token, account }))).pipe(
        map((balances) => zipObject(tokens, balances)),
      ),
    ),
  )
}

export function createETHBalance$(context$: Observable<ContextConnected>, address: string) {
  return context$.pipe(
    switchMap((context) => context.web3.eth.getBalance(address)),
    map((ethBalance) => amountFromWei(new BigNumber(ethBalance))),
  )
}
