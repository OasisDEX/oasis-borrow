import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { zipObject } from 'lodash'
import { combineLatest, defer, EMPTY, from, Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { Dictionary } from 'ts-essentials'

import { Context, ContextConnected } from './network'
import { MIN_ALLOWANCE, tokenBalance } from './calls/erc20'
import { CallObservable } from './calls/observe'
import { Erc20 } from 'types/web3-v1-contracts/erc20'

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

export function allowance$(
  { tokens, contract }: Context,
  token: string,
  owner: string,
  spender: string,
): Observable<boolean> {
  return defer(() =>
    from(contract<Erc20>(tokens[token]).methods.allowance(owner, spender).call()).pipe(
      map((x: string) => new BigNumber(x).gte(MIN_ALLOWANCE)),
    ),
  )
}

export function createTokenAllowances$(
  context$: Observable<ContextConnected>,
  proxyAddress$: (address: string) => Observable<string>,
): Observable<Dictionary<boolean>> {
  return context$.pipe(
    switchMap((context) =>
      proxyAddress$(context.account).pipe(
        switchMap((proxyAddress) =>
          combineLatest(
            Object.keys(context.tokens).map((token) =>
              allowance$(context, token, context.account, proxyAddress),
            ),
          ).pipe(map((allowances) => zipObject(Object.keys(context.tokens), allowances))),
        ),
      ),
    ),
  )
}
