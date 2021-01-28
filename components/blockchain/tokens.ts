import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { zipObject } from 'lodash'
import { combineLatest, defer, EMPTY, from, Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { Dictionary } from 'ts-essentials'

import { Context, ContextConnected } from './network'
import { MIN_ALLOWANCE, tokenAllowance, tokenBalance } from './calls/erc20'
import { CallObservable } from './calls/observe'
import { proxyAddress } from './calls/proxy'

export function createTokens$(context$: Observable<Context>): Observable<string[]> {
  return context$.pipe(map((context) => ['ETH', ...Object.keys(context.tokens)]))
}

export function createCollaterals$(context$: Observable<Context>): Observable<string[]> {
  return context$.pipe(map((context) => context.collaterals))
}

export function createETHBalance$(context$: Observable<ContextConnected>, address: string) {
  return context$.pipe(
    switchMap((context) => context.web3.eth.getBalance(address)),
    map((ethBalance) => amountFromWei(new BigNumber(ethBalance))),
  )
}

export function createBalances$(
  context$: Observable<ContextConnected>,
  tokenBalance$: CallObservable<typeof tokenBalance>,
  tokens$: Observable<string[]>,
  account: string,
): Observable<Dictionary<BigNumber>> {
  return combineLatest(context$, tokens$).pipe(
    switchMap(([context, tokens]) => {
      const ethBalance$ = createETHBalance$(context$, account)
      const tokenBalances$ = tokens.map((token) => tokenBalance$({ token, account }))
      return combineLatest(ethBalance$, ...tokenBalances$).pipe(
        map(([ethBalance, ...balances]) => zipObject(tokens, [ethBalance, ...balances])),
      )
    }),
  )
}

export function createAllowances$(
  context$: Observable<ContextConnected>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  tokenAllowance$: CallObservable<typeof tokenAllowance>,
  tokens$: Observable<string[]>,
): Observable<Dictionary<boolean>> {
  return context$.pipe(
    switchMap((context) =>
      combineLatest(tokens$, proxyAddress$(context.account)).pipe(
        switchMap(([tokens, proxyAddress]) => {
          if (!proxyAddress) return EMPTY
          const tokenAllowances$ = tokens.map((token) => {
            if (token === 'ETH') return of(true)
            return tokenAllowance$({ token, owner: context.account, spender: proxyAddress })
          })
          return combineLatest(...tokenAllowances$).pipe(
            map((allowances) => zipObject(tokens, allowances)),
          )
        }),
      ),
    ),
  )
}
