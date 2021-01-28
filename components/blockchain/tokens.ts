import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { zipObject } from 'lodash'
import { combineLatest, defer, EMPTY, from, Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { Dictionary } from 'ts-essentials'

import { Context, ContextConnected } from './network'
import { MIN_ALLOWANCE, tokenAllowance, tokenBalance } from './calls/erc20'
import { CallObservable } from './calls/observe'

export function createCollaterals$(context$: Observable<Context>): Observable<string[]> {
  return context$.pipe(map((context) => context.collaterals))
}

export function createTokens$(context$: Observable<Context>): Observable<string[]> {
  return context$.pipe(map((context) => [...Object.keys(context.tokens), 'ETH']))
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

export function createAllowance$(
  tokenAllowance$: CallObservable<typeof tokenAllowance>,
  proxyAddress$: (address: string) => Observable<string>,
  token: string,
  address: string,
): Observable<boolean> {
  return proxyAddress$(address).pipe(
    switchMap((proxyAddress) =>
      tokenAllowance$({ token, owner: address, spender: proxyAddress }).pipe(
        map((x: string) => new BigNumber(x).gte(MIN_ALLOWANCE)),
      ),
    ),
  )
}

export function createAllowances$(
  tokens$: Observable<string[]>,
  allowance$: (token: string, address: string) => Observable<boolean>,
  address: string,
): Observable<Dictionary<boolean>> {
  return tokens$.pipe(
    switchMap((tokens) =>
      combineLatest(tokens.map((token) => allowance$(token, address))).pipe(
        map((allowances) => zipObject(tokens, allowances)),
      ),
    ),
  )
}
