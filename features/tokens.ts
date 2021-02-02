import { amountFromWei } from '@oasisdex/utils'
import { Web3ContextConnected, Web3ContextConnectedReadonly } from '@oasisdex/web3-context'
import BigNumber from 'bignumber.js'
import { zipObject } from 'lodash'
import { combineLatest, Observable, of } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'
import { Dictionary } from 'ts-essentials'

import { tokenBalance } from '../blockchain/calls/erc20'
import { CallObservable } from '../blockchain/calls/observe'
import { Context, ContextConnected } from '../blockchain/network'

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
  web3Context$: Observable<Web3ContextConnected | Web3ContextConnectedReadonly>,
  // context$: Observable<ContextConnected>,
  ethBalance$: (address: string) => Observable<BigNumber>,
  tokenBalance$: CallObservable<typeof tokenBalance>,
  tokens$: Observable<string[]>,
): Observable<Dictionary<BigNumber> | undefined> {
  return combineLatest(web3Context$, tokens$).pipe(
    switchMap(([web3Context, tokens]) => {
      // console.log('connected', context.account, context.status)
      if (web3Context.status === 'connectedReadonly') {
        return of(undefined)
      }
      const { account } = web3Context
      return combineLatest(
        tokens.map((token) =>
          token === 'ETH' ? ethBalance$(account) : tokenBalance$({ token, account }),
        ),
      ).pipe(
        map((balances) => {
          return zipObject(tokens, balances)
        }),
      )
    }),
    shareReplay(1),
  )
}
